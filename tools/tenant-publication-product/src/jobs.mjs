import {
  ContractError,
  ContractVersion,
  JobState,
  Role,
  StepState,
  assertEnumValue,
} from './contracts.mjs';
import {
  canonicalDigest,
  clone,
  deterministicId,
  immutable,
} from './canonical.mjs';
import {
  assertNoForbiddenData,
  assertSafeIdentifier,
  assertSafeRelativeReference,
} from './security.mjs';

export const PublicationJobStepDefinitions = Object.freeze([
  step('tenant-intake', [], 'intake', null),
  step('identity-provisioning', ['tenant-intake'], 'identity', 'identity-revert'),
  step('content-import', ['identity-provisioning'], 'content', 'content-restore'),
  step('hosting-class-selection', ['content-import'], 'planner', null),
  step('product-release-assignment', ['hosting-class-selection'], 'release-registry', 'release-unassign'),
  step('artifact-build', ['product-release-assignment'], 'static-publisher', 'artifact-retire'),
  step('resource-plan', ['artifact-build'], 'azure-plan', null),
  step('publication-register', ['resource-plan'], 'publication-registry', 'publication-revoke'),
  step('deployment', ['publication-register'], 'azure-swa', 'deployment-restore'),
  step('preflight', ['deployment'], 'validation', null),
  step('form-proof', ['preflight'], 'public-forms', 'form-proof-revoke'),
  step('domain-hold', ['form-proof'], 'domain', null),
  step('acceptance', ['domain-hold'], 'acceptance', 'acceptance-revoke'),
  step('indexing-hold', ['acceptance'], 'indexing', null),
  step('backup', ['indexing-hold'], 'backup', 'backup-retain'),
  step('atlas-register', ['backup'], 'atlas', 'atlas-restore'),
]);

const OUTCOME_TO_STATE = Object.freeze({
  success: StepState.SUCCEEDED,
  noop: StepState.SKIPPED,
  blocked: StepState.BLOCKED,
  partial: StepState.PARTIAL,
  failed: StepState.FAILED,
});

export function createPublicationJob(plan, actor) {
  const normalizedActor = authorizeActor(actor, plan?.tenantId);
  assertNoForbiddenData(plan, 'publication job plan');
  const normalizedPlan = normalizePlan(plan);
  const planHash = canonicalDigest(normalizedPlan);
  const jobId = deterministicId('publication-job', {
    tenantId: normalizedPlan.tenantId,
    publicationId: normalizedPlan.publicationId,
    releaseId: normalizedPlan.releaseId,
    planHash,
  });
  const steps = PublicationJobStepDefinitions.map((definition) => {
    const plannedAction = normalizedPlan.stepActions[definition.key] ?? 'execute';
    const isNoOp = plannedAction === 'noop';
    return {
      stepId: deterministicId('publication-step', { jobId, key: definition.key }),
      key: definition.key,
      provider: definition.provider,
      dependsOn: [...definition.dependsOn],
      plannedAction,
      approvalGate: normalizedPlan.approvalGates[definition.key] ?? null,
      rollbackAction: definition.rollbackAction,
      state:
        definition.dependsOn.length === 0
          ? isNoOp
            ? StepState.SKIPPED
            : StepState.READY
          : StepState.PENDING,
      attempts: [],
      resumes: [],
      output: null,
      rollbackState: null,
      rollbackAttempts: [],
    };
  });
  activateReadySteps(steps);
  const allSkipped = steps.every((candidate) => candidate.state === StepState.SKIPPED);
  const body = {
    schemaVersion: ContractVersion.job,
    jobId,
    jobType: 'TENANT_PUBLICATION',
    tenantId: normalizedPlan.tenantId,
    publicationId: normalizedPlan.publicationId,
    releaseId: normalizedPlan.releaseId,
    artifactId: normalizedPlan.artifactId,
    planHash,
    plan: normalizedPlan,
    state: allSkipped ? JobState.COMPLETED : JobState.PLANNED,
    steps,
    events: [],
    rollback: null,
    valuesIncluded: false,
  };
  appendEvent(body, 'job_created', null, normalizedActor, {
    planHash,
    noOp: allSkipped,
  });
  for (const skipped of steps.filter((candidate) => candidate.state === StepState.SKIPPED)) {
    appendEvent(body, 'step_noop_planned', skipped.key, normalizedActor, {
      plannedAction: skipped.plannedAction,
    });
  }
  return sealJob(body);
}

export function startPublicationJob(job, actor) {
  const body = openJob(job);
  const normalizedActor = authorizeActor(actor, body.tenantId);
  if (body.state === JobState.COMPLETED) return sealJob(body);
  if (body.state !== JobState.PLANNED) {
    throw new ContractError('job_start_state_invalid', `Job cannot start from ${body.state}.`);
  }
  body.state = JobState.RUNNING;
  appendEvent(body, 'job_started', null, normalizedActor, {});
  return sealJob(body);
}

export function markStepRunning(job, stepKey, actor, idempotencyKey) {
  const body = openJob(job);
  const normalizedActor = authorizeActor(actor, body.tenantId);
  const stepRecord = requireStep(body, stepKey);
  const key = assertSafeIdentifier(idempotencyKey, 'step idempotencyKey');
  if (stepRecord.state === StepState.RUNNING && stepRecord.runningIdempotencyKey === key) {
    return sealJob(body);
  }
  if (body.state !== JobState.RUNNING && body.state !== JobState.PARTIAL) {
    throw new ContractError('job_not_running', `Step cannot start while job is ${body.state}.`);
  }
  if (stepRecord.state !== StepState.READY) {
    throw new ContractError('step_not_ready', `${stepKey} is ${stepRecord.state}, not READY.`);
  }
  assertDependenciesSatisfied(body, stepRecord);
  stepRecord.state = StepState.RUNNING;
  stepRecord.runningIdempotencyKey = key;
  appendEvent(body, 'step_started', stepKey, normalizedActor, { idempotencyKey: key });
  return sealJob(body);
}

export function applyStepOutcome(job, stepKey, outcome, options = {}) {
  const body = openJob(job);
  const normalizedActor = authorizeActor(options.actor, body.tenantId);
  const stepRecord = requireStep(body, stepKey);
  const normalizedOutcome = String(outcome).toLowerCase();
  const targetState = OUTCOME_TO_STATE[normalizedOutcome];
  if (!targetState) throw new ContractError('step_outcome_invalid', `Unsupported step outcome: ${outcome}`);
  const idempotencyKey = assertSafeIdentifier(options.idempotencyKey, 'step outcome idempotencyKey');
  const output = options.output === undefined ? null : clone(options.output);
  assertNoForbiddenData(output, 'step output');
  const approvalRef = options.approvalRef ?? null;
  if (
    stepRecord.approvalGate &&
    ['success', 'partial'].includes(normalizedOutcome) &&
    approvalRef !== stepRecord.approvalGate
  ) {
    throw new ContractError('step_approval_required', `${stepKey} requires approval gate ${stepRecord.approvalGate}.`);
  }
  if (approvalRef !== null) assertSafeIdentifier(approvalRef, 'step approvalRef');
  const outcomeDigest = canonicalDigest({ normalizedOutcome, output, approvalRef });

  const replay = stepRecord.attempts.find((attempt) => attempt.idempotencyKey === idempotencyKey);
  if (replay) {
    if (replay.outcomeDigest !== outcomeDigest) {
      throw new ContractError('step_idempotency_conflict', `${stepKey} idempotency key was reused with a different outcome.`);
    }
    return sealJob(body);
  }

  if (![JobState.RUNNING, JobState.PARTIAL].includes(body.state)) {
    throw new ContractError('job_not_running', `Step outcome cannot be applied while job is ${body.state}.`);
  }
  if (![StepState.READY, StepState.RUNNING].includes(stepRecord.state)) {
    throw new ContractError('step_outcome_state_invalid', `${stepKey} cannot accept an outcome from ${stepRecord.state}.`);
  }
  assertDependenciesSatisfied(body, stepRecord);
  if (
    stepRecord.state === StepState.RUNNING &&
    stepRecord.runningIdempotencyKey &&
    stepRecord.runningIdempotencyKey !== idempotencyKey
  ) {
    throw new ContractError('step_running_key_mismatch', `${stepKey} was started with a different idempotency key.`);
  }

  const attemptNumber = stepRecord.attempts.length + 1;
  const attempt = {
    attemptId: deterministicId('step-attempt', {
      jobId: body.jobId,
      stepKey,
      attemptNumber,
      idempotencyKey,
      outcomeDigest,
    }),
    attemptNumber,
    idempotencyKey,
    outcome: normalizedOutcome,
    outcomeDigest,
    approvalRef,
  };
  stepRecord.attempts.push(attempt);
  stepRecord.state = targetState;
  stepRecord.output = output;
  delete stepRecord.runningIdempotencyKey;
  appendEvent(body, `step_${normalizedOutcome}`, stepKey, normalizedActor, {
    attemptId: attempt.attemptId,
    outcomeDigest,
  });
  recomputeJobState(body, normalizedActor);
  return sealJob(body);
}

export function resumePublicationJob(job, options = {}) {
  const body = openJob(job);
  const normalizedActor = authorizeActor(options.actor, body.tenantId);
  if (![JobState.BLOCKED, JobState.PARTIAL, JobState.FAILED].includes(body.state)) {
    throw new ContractError('job_resume_state_invalid', `Job cannot resume from ${body.state}.`);
  }
  const stepRecord = requireStep(body, options.stepKey);
  if (![StepState.BLOCKED, StepState.PARTIAL, StepState.FAILED].includes(stepRecord.state)) {
    throw new ContractError('step_resume_state_invalid', `${stepRecord.key} cannot resume from ${stepRecord.state}.`);
  }
  const idempotencyKey = assertSafeIdentifier(options.idempotencyKey, 'resume idempotencyKey');
  const reasonCode = assertSafeIdentifier(options.reasonCode, 'resume reasonCode');
  const existing = stepRecord.resumes.find((resume) => resume.idempotencyKey === idempotencyKey);
  if (existing) {
    if (existing.reasonCode !== reasonCode) {
      throw new ContractError('resume_idempotency_conflict', 'Resume idempotency key was reused with a different reason.');
    }
    return sealJob(body);
  }
  const resume = {
    resumeId: deterministicId('step-resume', {
      jobId: body.jobId,
      stepKey: stepRecord.key,
      idempotencyKey,
      reasonCode,
    }),
    idempotencyKey,
    reasonCode,
  };
  stepRecord.resumes.push(resume);
  stepRecord.state = StepState.READY;
  stepRecord.output = null;
  body.state = JobState.RUNNING;
  appendEvent(body, 'step_resumed', stepRecord.key, normalizedActor, resume);
  return sealJob(body);
}

export function beginPublicationRollback(job, options = {}) {
  const body = openJob(job);
  const normalizedActor = authorizeActor(options.actor, body.tenantId);
  if (![JobState.COMPLETED, JobState.PARTIAL, JobState.FAILED, JobState.BLOCKED].includes(body.state)) {
    throw new ContractError('rollback_state_invalid', `Rollback cannot begin from ${body.state}.`);
  }
  const reasonCode = assertSafeIdentifier(options.reasonCode, 'rollback reasonCode');
  const idempotencyKey = assertSafeIdentifier(options.idempotencyKey, 'rollback idempotencyKey');
  if (body.rollback) {
    if (
      body.rollback.idempotencyKey !== idempotencyKey ||
      body.rollback.reasonCode !== reasonCode
    ) {
      throw new ContractError('rollback_idempotency_conflict', 'Rollback already began with a different request.');
    }
    return sealJob(body);
  }
  const candidates = body.steps
    .filter((candidate) => candidate.state === StepState.SUCCEEDED && candidate.rollbackAction)
    .reverse();
  body.rollback = {
    rollbackId: deterministicId('publication-rollback', {
      jobId: body.jobId,
      reasonCode,
      idempotencyKey,
    }),
    reasonCode,
    idempotencyKey,
    order: candidates.map((candidate) => candidate.key),
  };
  for (const candidate of candidates) candidate.rollbackState = StepState.PENDING;
  if (candidates.length > 0) candidates[0].rollbackState = StepState.READY;
  body.state = candidates.length === 0 ? JobState.ROLLED_BACK : JobState.ROLLING_BACK;
  appendEvent(body, 'rollback_started', null, normalizedActor, {
    rollbackId: body.rollback.rollbackId,
    order: body.rollback.order,
  });
  if (candidates.length === 0) appendEvent(body, 'rollback_completed_noop', null, normalizedActor, {});
  return sealJob(body);
}

export function applyRollbackOutcome(job, stepKey, outcome, options = {}) {
  const body = openJob(job);
  const normalizedActor = authorizeActor(options.actor, body.tenantId);
  if (body.state !== JobState.ROLLING_BACK || !body.rollback) {
    throw new ContractError('rollback_not_running', 'Rollback outcome requires a ROLLING_BACK job.');
  }
  const stepRecord = requireStep(body, stepKey);
  if (stepRecord.rollbackState !== StepState.READY) {
    throw new ContractError('rollback_step_not_ready', `${stepKey} rollback is not READY.`);
  }
  const normalizedOutcome = String(outcome).toLowerCase();
  if (!['rolled_back', 'skipped', 'failed'].includes(normalizedOutcome)) {
    throw new ContractError('rollback_outcome_invalid', `Unsupported rollback outcome: ${outcome}`);
  }
  const idempotencyKey = assertSafeIdentifier(options.idempotencyKey, 'rollback step idempotencyKey');
  const output = options.output === undefined ? null : clone(options.output);
  assertNoForbiddenData(output, 'rollback output');
  const outcomeDigest = canonicalDigest({ normalizedOutcome, output });
  const replay = stepRecord.rollbackAttempts.find((attempt) => attempt.idempotencyKey === idempotencyKey);
  if (replay) {
    if (replay.outcomeDigest !== outcomeDigest) {
      throw new ContractError('rollback_step_idempotency_conflict', 'Rollback key was reused with different output.');
    }
    return sealJob(body);
  }
  const attemptNumber = stepRecord.rollbackAttempts.length + 1;
  stepRecord.rollbackAttempts.push({
    attemptId: deterministicId('rollback-attempt', {
      jobId: body.jobId,
      stepKey,
      attemptNumber,
      idempotencyKey,
      outcomeDigest,
    }),
    attemptNumber,
    idempotencyKey,
    outcome: normalizedOutcome,
    outcomeDigest,
  });
  stepRecord.rollbackState =
    normalizedOutcome === 'rolled_back'
      ? StepState.ROLLED_BACK
      : normalizedOutcome === 'skipped'
        ? StepState.SKIPPED
        : StepState.ROLLBACK_FAILED;
  appendEvent(body, `rollback_step_${normalizedOutcome}`, stepKey, normalizedActor, { outcomeDigest });
  if (normalizedOutcome === 'failed') {
    body.state = JobState.ROLLBACK_FAILED;
    return sealJob(body);
  }
  const next = body.rollback.order
    .map((key) => requireStep(body, key))
    .find((candidate) => candidate.rollbackState === StepState.PENDING);
  if (next) {
    next.rollbackState = StepState.READY;
  } else {
    body.state = JobState.ROLLED_BACK;
    appendEvent(body, 'rollback_completed', null, normalizedActor, {
      rollbackId: body.rollback.rollbackId,
    });
  }
  return sealJob(body);
}

export function nextRunnableSteps(job) {
  const body = openJob(job);
  if (body.state === JobState.ROLLING_BACK && body.rollback) {
    return body.rollback.order
      .map((key) => requireStep(body, key))
      .filter((candidate) => candidate.rollbackState === StepState.READY)
      .map((candidate) => immutable({ stepId: candidate.stepId, key: candidate.key, operation: candidate.rollbackAction }));
  }
  return body.steps
    .filter((candidate) => candidate.state === StepState.READY)
    .map((candidate) => immutable({ stepId: candidate.stepId, key: candidate.key, operation: candidate.plannedAction }));
}

export function verifyPublicationJob(job) {
  openJob(job);
  return true;
}

function normalizePlan(plan = {}) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    throw new ContractError('job_plan_invalid', 'Publication job plan must be an object.');
  }
  const stepActions = normalizeStepMap(plan.stepActions ?? {}, 'stepActions', new Set(['execute', 'verify', 'noop', 'hold']));
  const approvalGates = normalizeStepMap(plan.approvalGates ?? {}, 'approvalGates', null, { allowNull: true });
  return {
    tenantId: assertSafeIdentifier(plan.tenantId, 'plan.tenantId', { backend: true }).toLowerCase(),
    publicationId: assertSafeIdentifier(plan.publicationId, 'plan.publicationId', { backend: true }),
    releaseId: assertSafeIdentifier(plan.releaseId, 'plan.releaseId'),
    artifactId: assertSafeIdentifier(plan.artifactId, 'plan.artifactId'),
    hostingClass: assertSafeIdentifier(plan.hostingClass, 'plan.hostingClass'),
    dryRun: plan.dryRun !== false,
    stepActions,
    approvalGates,
    evidenceRefs: (plan.evidenceRefs ?? [])
      .map((value, index) => assertSafeRelativeReference(value, `plan.evidenceRefs[${index}]`))
      .sort(),
  };
}

function normalizeStepMap(value, label, allowedValues, { allowNull = false } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ContractError('step_map_invalid', `${label} must be an object.`);
  }
  const known = new Set(PublicationJobStepDefinitions.map((definition) => definition.key));
  const normalized = {};
  for (const [key, child] of Object.entries(value).sort(([left], [right]) => left.localeCompare(right, 'en'))) {
    if (!known.has(key)) throw new ContractError('step_key_unknown', `${label} contains unknown step ${key}.`);
    if (child === null && allowNull) {
      normalized[key] = null;
      continue;
    }
    if (allowedValues && !allowedValues.has(child)) {
      throw new ContractError('step_action_invalid', `${label}.${key} is invalid.`);
    }
    normalized[key] = String(child);
  }
  return normalized;
}

function activateReadySteps(steps) {
  const newlySkipped = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const candidate of steps) {
      if (candidate.state !== StepState.PENDING) continue;
      const dependencies = candidate.dependsOn.map((key) => steps.find((stepRecord) => stepRecord.key === key));
      if (dependencies.every((dependency) => [StepState.SUCCEEDED, StepState.SKIPPED].includes(dependency.state))) {
        candidate.state = candidate.plannedAction === 'noop' ? StepState.SKIPPED : StepState.READY;
        if (candidate.state === StepState.SKIPPED) newlySkipped.push(candidate.key);
        changed = true;
      }
    }
  }
  return newlySkipped;
}

function assertDependenciesSatisfied(job, stepRecord) {
  for (const dependencyKey of stepRecord.dependsOn) {
    const dependency = requireStep(job, dependencyKey);
    if (![StepState.SUCCEEDED, StepState.SKIPPED].includes(dependency.state)) {
      throw new ContractError('step_dependency_incomplete', `${stepRecord.key} is blocked by ${dependencyKey}.`);
    }
  }
}

function recomputeJobState(body, actor) {
  const newlySkipped = activateReadySteps(body.steps);
  for (const key of newlySkipped) {
    appendEvent(body, 'step_noop_reconciled', key, actor, { plannedAction: 'noop' });
  }
  if (body.steps.some((candidate) => candidate.state === StepState.FAILED)) {
    body.state = JobState.FAILED;
    return;
  }
  if (body.steps.some((candidate) => candidate.state === StepState.BLOCKED)) {
    body.state = JobState.BLOCKED;
    return;
  }
  if (body.steps.some((candidate) => candidate.state === StepState.PARTIAL)) {
    body.state = JobState.PARTIAL;
    return;
  }
  if (body.steps.every((candidate) => [StepState.SUCCEEDED, StepState.SKIPPED].includes(candidate.state))) {
    body.state = JobState.COMPLETED;
    return;
  }
  body.state = JobState.RUNNING;
}

function appendEvent(body, action, stepKey, actor, detail) {
  const sequence = body.events.length + 1;
  body.events.push({
    eventId: deterministicId('job-event', {
      jobId: body.jobId,
      sequence,
      action,
      stepKey,
      detail,
    }),
    sequence,
    action,
    stepKey,
    actorId: actor.actorId,
    actorRole: actor.role,
    detail: clone(detail),
  });
}

function sealJob(body) {
  const clean = clone(body);
  delete clean.integritySha256;
  clean.integritySha256 = canonicalDigest(clean);
  return immutable(clean);
}

function openJob(job) {
  if (!job || job.schemaVersion !== ContractVersion.job) {
    throw new ContractError('job_schema_invalid', `Job schema must be ${ContractVersion.job}.`);
  }
  const body = clone(job);
  const integrity = body.integritySha256;
  delete body.integritySha256;
  if (canonicalDigest(body) !== integrity) {
    throw new ContractError('job_integrity_invalid', 'Job integrity hash does not match its state.');
  }
  assertEnumValue(JobState, body.state, 'job.state');
  for (const stepRecord of body.steps) assertEnumValue(StepState, stepRecord.state, `job.steps.${stepRecord.key}.state`);
  return body;
}

function requireStep(job, key) {
  const stepRecord = job.steps.find((candidate) => candidate.key === key);
  if (!stepRecord) throw new ContractError('job_step_missing', `Job step was not found: ${key}`);
  return stepRecord;
}

function authorizeActor(actor = {}, tenantId) {
  const role = assertEnumValue(Role, actor.role, 'actor.role');
  const actorId = assertSafeIdentifier(actor.actorId, 'actor.actorId');
  if (role === Role.SuperAdmin) return immutable({ role, actorId, tenantId: actor.tenantId ?? null });
  const actorTenantId = assertSafeIdentifier(actor.tenantId, 'actor.tenantId', { backend: true }).toLowerCase();
  if (!tenantId || actorTenantId !== String(tenantId).toLowerCase()) {
    throw new ContractError('cross_tenant_forbidden', 'TenantAdmin job access is restricted to its own tenant.');
  }
  return immutable({ role, actorId, tenantId: actorTenantId });
}

function step(key, dependsOn, provider, rollbackAction) {
  return Object.freeze({ key, dependsOn: Object.freeze(dependsOn), provider, rollbackAction });
}
