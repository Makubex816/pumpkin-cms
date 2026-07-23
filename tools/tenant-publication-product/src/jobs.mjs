import {
  createPublicKey,
  randomBytes,
  verify as verifySignature,
} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
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
  sha256,
  stableStringify,
} from './canonical.mjs';
import {
  assertNoForbiddenData,
  assertSafeIdentifier,
  assertSafeRelativeReference,
  assertSha256,
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

const HOLD_AUTHORITY_SCHEMA_VERSION =
  'pumpkin.publication-hold-authority.v1';
const HOLD_VERIFIER_SCHEMA_VERSION =
  'pumpkin.publication-hold-authority-verifier.v1';
const HOLD_VERIFIER_KIND =
  'PUMPKIN_PRIVILEGED_PUBLICATION_HOLD_AUTHORITY_VERIFIER';
const HOLD_VERIFIER_STATE = new WeakMap();
let ACTIVE_HOLD_VERIFIER_STATE = null;
const HOLD_AUTHORITY_BOOT_PUBLIC_KEY_SHA256 =
  process.env.PUMPKIN_HOLD_AUTHORITY_PUBLIC_KEY_SHA256 ?? null;
const HOLD_AUTHORITY_BOOT_VERIFIER_SHA256 =
  process.env.PUMPKIN_HOLD_AUTHORITY_VERIFIER_SHA256 ?? null;
const PUBLICATION_JOB_STORE_BOOT_ROOT =
  process.env.PUMPKIN_PUBLICATION_JOB_STORE_ROOT ?? null;
const PUBLICATION_JOB_STORE_INSTANCES = new WeakSet();
let ACTIVE_PUBLICATION_JOB_STORE_ROOT = null;
let ACTIVE_PUBLICATION_JOB_STORE = null;
const JOB_HEAD_SCHEMA_VERSION =
  'pumpkin.publication-job-head.v1';
const JOB_AUTHORITY_CONSUMPTION_SCHEMA_VERSION =
  'pumpkin.publication-job-authority-consumption.v1';
const SENSITIVE_JOB_STEPS = new Set([
  'identity-provisioning',
  'content-import',
  'product-release-assignment',
  'artifact-build',
  'resource-plan',
  'publication-register',
  'deployment',
  'form-proof',
  'domain-hold',
  'acceptance',
  'indexing-hold',
  'backup',
  'atlas-register',
]);

export function createPublicationHoldAuthorityVerifier(config) {
  assertCanonicalJsonValue(
    config,
    'hold authority verifier configuration',
  );
  assertExactObjectKeys(
    config,
    [
      'schemaVersion',
      'status',
      'algorithm',
      'keyId',
      'publicKeyPem',
      'publicKeySha256',
      'revocationSnapshotId',
      'revokedAuthorityIds',
    ],
    'hold authority verifier configuration',
    'hold_verifier_configuration_invalid',
  );
  if (
    config.schemaVersion !== HOLD_VERIFIER_SCHEMA_VERSION ||
    config.status !== 'ACTIVE' ||
    config.algorithm !== 'Ed25519'
  ) {
    throw new ContractError(
      'hold_verifier_configuration_invalid',
      'Hold authority verifier must be an active Ed25519 verifier.',
    );
  }
  const verifierConfigurationSha256 = canonicalDigest(config);
  if (
    typeof HOLD_AUTHORITY_BOOT_VERIFIER_SHA256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(
      HOLD_AUTHORITY_BOOT_VERIFIER_SHA256,
    )
  ) {
    throw new ContractError(
      'hold_verifier_boot_snapshot_unconfigured',
      'Hold verification is held until the complete verifier and revocation snapshot is pinned before process startup.',
    );
  }
  if (
    verifierConfigurationSha256 !==
    HOLD_AUTHORITY_BOOT_VERIFIER_SHA256
  ) {
    throw new ContractError(
      'hold_verifier_boot_snapshot_mismatch',
      'Hold verifier and revocation snapshot do not match the process-start trust anchor.',
    );
  }
  const keyId = assertSafeIdentifier(config.keyId, 'hold verifier keyId');
  const revocationSnapshotId = assertSafeIdentifier(
    config.revocationSnapshotId,
    'hold verifier revocationSnapshotId',
  );
  if (
    typeof config.publicKeyPem !== 'string' ||
    !config.publicKeyPem.includes('BEGIN PUBLIC KEY')
  ) {
    throw new ContractError(
      'hold_verifier_public_key_invalid',
      'Hold authority verifier requires a public SPKI key.',
    );
  }
  let publicKey;
  try {
    publicKey = createPublicKey(config.publicKeyPem);
  } catch {
    throw new ContractError(
      'hold_verifier_public_key_invalid',
      'Hold authority verifier public key could not be parsed.',
    );
  }
  if (publicKey.asymmetricKeyType !== 'ed25519') {
    throw new ContractError(
      'hold_verifier_public_key_invalid',
      'Hold authority verifier public key must be Ed25519.',
    );
  }
  const publicKeySha256 = sha256(
    publicKey.export({ type: 'spki', format: 'der' }),
  );
  if (
    assertSha256(
      config.publicKeySha256,
      'hold verifier publicKeySha256',
    ) !== publicKeySha256
  ) {
    throw new ContractError(
      'hold_verifier_public_key_hash_invalid',
      'Hold authority verifier public-key hash does not match.',
    );
  }
  if (
    typeof HOLD_AUTHORITY_BOOT_PUBLIC_KEY_SHA256 !== 'string' ||
    !/^[a-f0-9]{64}$/.test(HOLD_AUTHORITY_BOOT_PUBLIC_KEY_SHA256)
  ) {
    throw new ContractError(
      'hold_verifier_boot_trust_anchor_unconfigured',
      'Hold verification is held until a lowercase SHA-256 trust anchor is pinned before process startup.',
    );
  }
  if (publicKeySha256 !== HOLD_AUTHORITY_BOOT_PUBLIC_KEY_SHA256) {
    throw new ContractError(
      'hold_verifier_boot_trust_anchor_mismatch',
      'Hold authority verifier key does not match the process-start trust anchor.',
    );
  }
  if (!Array.isArray(config.revokedAuthorityIds)) {
    throw new ContractError(
      'hold_verifier_revocation_invalid',
      'Hold authority verifier revokedAuthorityIds must be an array.',
    );
  }
  const revokedAuthorityIds = config.revokedAuthorityIds
    .map((authorityId, index) =>
      assertSafeIdentifier(
        authorityId,
        `hold verifier revokedAuthorityIds[${index}]`,
      ),
    )
    .sort((left, right) => left.localeCompare(right, 'en'));
  if (new Set(revokedAuthorityIds).size !== revokedAuthorityIds.length) {
    throw new ContractError(
      'hold_verifier_revocation_invalid',
      'Hold authority verifier revocation entries must be unique.',
    );
  }
  const descriptor = immutable({
    schemaVersion: HOLD_VERIFIER_SCHEMA_VERSION,
    kind: HOLD_VERIFIER_KIND,
    status: 'ACTIVE',
    algorithm: 'Ed25519',
    keyId,
    publicKeySha256,
    bootTrustAnchorMatched: true,
    verifierConfigurationSha256,
    revocationSnapshotId,
    revokedAuthorityCount: revokedAuthorityIds.length,
  });
  const verifier = Object.freeze({
    describe: () => descriptor,
  });
  HOLD_VERIFIER_STATE.set(
    verifier,
    Object.freeze({
      keyId,
      publicKey,
      publicKeySha256,
      revocationSnapshotId,
      revokedAuthorityIds: new Set(revokedAuthorityIds),
      configurationSha256: verifierConfigurationSha256,
    }),
  );
  const verifierState = HOLD_VERIFIER_STATE.get(verifier);
  if (
    ACTIVE_HOLD_VERIFIER_STATE !== null &&
    ACTIVE_HOLD_VERIFIER_STATE.configurationSha256 !==
      verifierState.configurationSha256
  ) {
    HOLD_VERIFIER_STATE.delete(verifier);
    throw new ContractError(
      'hold_verifier_process_configuration_conflict',
      'A different hold verifier configuration is already locked for this process.',
    );
  }
  ACTIVE_HOLD_VERIFIER_STATE = verifierState;
  return verifier;
}

export class FileBackedPublicationJobStore {
  #root;
  #jobsRoot;
  #locksRoot;
  #authorityIdsRoot;
  #authorityHashesRoot;

  constructor({ storeRoot, repositoryRoot }) {
    this.#root = initializePublicationJobStoreRoot(
      storeRoot,
      repositoryRoot,
    );
    if (
      typeof PUBLICATION_JOB_STORE_BOOT_ROOT !== 'string' ||
      !path.isAbsolute(PUBLICATION_JOB_STORE_BOOT_ROOT)
    ) {
      throw new ContractError(
        'job_store_boot_root_unconfigured',
        'Publication-job execution is held until the durable store root is pinned before process startup.',
      );
    }
    if (
      !sameFilesystemPath(
        path.resolve(PUBLICATION_JOB_STORE_BOOT_ROOT),
        this.#root,
      )
    ) {
      throw new ContractError(
        'job_store_boot_root_mismatch',
        'Publication-job store root does not match the process-start authority boundary.',
      );
    }
    if (
      ACTIVE_PUBLICATION_JOB_STORE_ROOT !== null &&
      !sameFilesystemPath(
        ACTIVE_PUBLICATION_JOB_STORE_ROOT,
        this.#root,
      )
    ) {
      throw new ContractError(
        'job_store_process_configuration_conflict',
        'A different durable publication-job store is already locked for this process.',
      );
    }
    ACTIVE_PUBLICATION_JOB_STORE_ROOT = this.#root;
    this.#jobsRoot = ensurePrivateJobStoreDirectory(
      this.#root,
      'jobs',
    );
    this.#locksRoot = ensurePrivateJobStoreDirectory(
      this.#root,
      'locks',
    );
    this.#authorityIdsRoot = ensurePrivateJobStoreDirectory(
      this.#root,
      'authority-ids',
    );
    this.#authorityHashesRoot = ensurePrivateJobStoreDirectory(
      this.#root,
      'authority-hashes',
    );
    PUBLICATION_JOB_STORE_INSTANCES.add(this);
    if (ACTIVE_PUBLICATION_JOB_STORE === null) {
      ACTIVE_PUBLICATION_JOB_STORE = this;
    }
  }

  describe() {
    return immutable({
      schemaVersion: 'pumpkin.publication-job-store.v1',
      kind: 'FILE_BACKED_IMMUTABLE_JOB_HEAD_AND_AUTHORITY_LEDGER',
      status: 'ACTIVE',
      currentHeadCas: true,
      immutableRevisionChain: true,
      authorityIdConsumptionLedger: true,
      authorityHashConsumptionLedger: true,
      interruptionReconciliation: true,
      unpairedEvidenceHeld: true,
      storePathIncluded: false,
    });
  }

  read(jobId) {
    const normalizedJobId = assertSafeIdentifier(
      jobId,
      'publication job store jobId',
    );
    const current = this.#readCurrentHead(normalizedJobId);
    if (current === null) {
      throw new ContractError(
        'job_store_uninitialized',
        'The durable publication-job current head is not initialized.',
      );
    }
    return immutable({
      job: current.job,
      revision: current.revision,
      jobIntegritySha256:
        current.jobIntegritySha256,
      predecessorJobIntegritySha256:
        current.predecessorJobIntegritySha256,
    });
  }

  open(jobId) {
    return this.read(jobId);
  }

  initialize(job) {
    const body = openJob(job);
    const sealed = sealJob(body);
    return this.#withJobLock(body.jobId, () => {
      const current = this.#readCurrentHead(body.jobId);
      if (current !== null) {
        if (
          current.jobIntegritySha256 !==
          sealed.integritySha256
        ) {
          throw new ContractError(
            'job_store_head_conflict',
            'The durable job store is already initialized with a different current head.',
          );
        }
        return clone(current.job);
      }
      this.#writeHead({
        job: sealed,
        revision: 0,
        predecessorJobIntegritySha256: null,
      });
      return clone(sealed);
    });
  }

  assertCurrent(job) {
    const body = openJob(job);
    const sealed = sealJob(body);
    const current = this.#readCurrentHead(body.jobId);
    if (current === null) {
      throw new ContractError(
        'job_store_uninitialized',
        'The durable publication-job current head is not initialized.',
      );
    }
    if (
      current.jobIntegritySha256 !== sealed.integritySha256
    ) {
      throw new ContractError(
        'job_store_stale_snapshot',
        'The supplied publication job is not the durable current head.',
      );
    }
    return clone(current.job);
  }

  commit(previousJob, nextJob, { authorityConsumption = null } = {}) {
    const previousBody = openJob(previousJob);
    const nextBody = openJob(nextJob);
    const previous = sealJob(previousBody);
    const next = sealJob(nextBody);
    if (previous.jobId !== next.jobId) {
      throw new ContractError(
        'job_store_identity_mismatch',
        'A durable publication-job transition cannot change job identity.',
      );
    }
    return this.#withJobLock(previous.jobId, () => {
      const current = this.#readCurrentHead(previous.jobId);
      if (current === null) {
        throw new ContractError(
          'job_store_uninitialized',
          'The durable publication-job current head is not initialized.',
        );
      }
      if (
        current.jobIntegritySha256 !==
        previous.integritySha256
      ) {
        throw new ContractError(
          'job_store_stale_snapshot',
          'The supplied publication job is not the durable current head.',
        );
      }
      if (next.integritySha256 === previous.integritySha256) {
        if (authorityConsumption !== null) {
          throw new ContractError(
            'job_store_authority_transition_invalid',
            'Authority consumption requires a new immutable job head.',
          );
        }
        return clone(current.job);
      }
      if (authorityConsumption !== null) {
        this.#consumeAuthority(
          authorityConsumption,
          previous,
          next,
        );
      }
      this.#writeHead({
        job: next,
        revision: current.revision + 1,
        predecessorJobIntegritySha256:
          previous.integritySha256,
      });
      return clone(next);
    });
  }

  reconcileInterruptedTransition(
    previousJob,
    nextJob,
    { authorityConsumption = null } = {},
  ) {
    const previous = sealJob(openJob(previousJob));
    const next = sealJob(openJob(nextJob));
    if (
      previous.jobId !== next.jobId ||
      previous.integritySha256 === next.integritySha256
    ) {
      throw new ContractError(
        'job_store_reconciliation_witness_invalid',
        'Interrupted-transition reconciliation requires distinct predecessor and successor heads for one job.',
      );
    }
    const lockPath = path.join(
      this.#locksRoot,
      `${previous.jobId}.lock`,
    );
    const staleLock = inspectVerifiedStaleJobStoreLock(
      lockPath,
      'publication-job transition lock',
    );
    const reconciliationLockPath = `${lockPath}.reconcile`;
    removeVerifiedStaleReconciliationLockIfPresent(
      reconciliationLockPath,
    );
    const reconciliationDescriptor =
      createDurableJobStoreProcessLock(
        reconciliationLockPath,
      );
    let reconciled = false;
    try {
      assertJobStoreFileEvidenceUnchanged(
        lockPath,
        staleLock,
        'publication-job transition lock',
      );
      const inventory =
        this.#readReconciliationHeadInventory(
          previous,
          next,
        );
      const currentIsPredecessor =
        inventory.current.jobIntegritySha256 ===
        previous.integritySha256;
      const currentIsSuccessor =
        inventory.current.jobIntegritySha256 ===
        next.integritySha256;
      if (!currentIsPredecessor && !currentIsSuccessor) {
        throw new ContractError(
          'job_store_reconciliation_required',
          'The durable current head does not match either verified reconciliation witness.',
        );
      }
      if (
        currentIsSuccessor &&
        inventory.current.predecessorJobIntegritySha256 !==
          previous.integritySha256
      ) {
        throw new ContractError(
          'job_store_reconciliation_required',
          'The durable successor is not linked to the supplied predecessor witness.',
        );
      }

      const targetRevision = currentIsSuccessor
        ? inventory.current.revision
        : inventory.current.revision + 1;
      const expectedHead = publicationJobHeadRecord({
        job: next,
        revision: targetRevision,
        predecessorJobIntegritySha256:
          previous.integritySha256,
      });
      const headPath = path.join(
        inventory.jobDirectory,
        publicationJobHeadFileName(expectedHead),
      );
      const headEvidence =
        inspectImmutableJobStoreRecordRecovery(
          headPath,
          expectedHead,
        );

      if (
        authorityConsumption === null &&
        transitionAddsHeldAuthority(previous, next)
      ) {
        throw new ContractError(
          'job_store_reconciliation_required',
          'A held-resume successor requires its exact paired authority-consumption witness.',
        );
      }
      let authorityEvidence = null;
      if (authorityConsumption !== null) {
        const prepared = this.#prepareAuthorityConsumption(
          authorityConsumption,
          previous,
          next,
        );
        const idEvidence =
          inspectImmutableJobStoreRecordRecovery(
            prepared.idPath,
            prepared.record,
          );
        const hashEvidence =
          inspectImmutableJobStoreRecordRecovery(
            prepared.hashPath,
            prepared.record,
          );
        if (
          idEvidence.state === 'ABSENT' &&
          hashEvidence.state === 'ABSENT' &&
          headEvidence.state === 'ABSENT' &&
          currentIsPredecessor
        ) {
          assertJobStoreFileEvidenceUnchanged(
            lockPath,
            staleLock,
            'publication-job transition lock',
          );
          fs.unlinkSync(lockPath);
          syncJobStoreDirectory(this.#locksRoot);
          reconciled = true;
          return clone(previous);
        }
        if (
          idEvidence.state === 'ABSENT' ||
          hashEvidence.state === 'ABSENT'
        ) {
          throw new ContractError(
            'job_store_reconciliation_required',
            idEvidence.state === hashEvidence.state
              ? 'No paired durable authority-consumption claim proves the interrupted transition.'
              : 'An unpaired authority-consumption claim is held for manual reconciliation.',
          );
        }
        authorityEvidence = {
          id: idEvidence,
          hash: hashEvidence,
        };
      } else if (
        currentIsPredecessor &&
        headEvidence.state === 'ABSENT'
      ) {
        assertJobStoreFileEvidenceUnchanged(
          lockPath,
          staleLock,
          'publication-job transition lock',
        );
        fs.unlinkSync(lockPath);
        syncJobStoreDirectory(this.#locksRoot);
        reconciled = true;
        return clone(previous);
      }

      if (authorityEvidence !== null) {
        publishRecoveredImmutableJobStoreRecord(
          authorityEvidence.id,
        );
        publishRecoveredImmutableJobStoreRecord(
          authorityEvidence.hash,
        );
      }
      if (headEvidence.state !== 'ABSENT') {
        publishRecoveredImmutableJobStoreRecord(headEvidence);
      } else if (currentIsPredecessor) {
        this.#writeHead({
          job: next,
          revision: targetRevision,
          predecessorJobIntegritySha256:
            previous.integritySha256,
        });
      }

      const committed = this.#readCurrentHead(
        previous.jobId,
      );
      if (
        committed === null ||
        committed.jobIntegritySha256 !==
          next.integritySha256 ||
        committed.revision !== targetRevision ||
        committed.predecessorJobIntegritySha256 !==
          previous.integritySha256
      ) {
        throw new ContractError(
          'job_store_reconciliation_required',
          'Interrupted-transition reconciliation did not produce the exact verified successor head.',
        );
      }
      assertJobStoreFileEvidenceUnchanged(
        lockPath,
        staleLock,
        'publication-job transition lock',
      );
      fs.unlinkSync(lockPath);
      syncJobStoreDirectory(this.#locksRoot);
      reconciled = true;
      return clone(committed.job);
    } finally {
      fs.closeSync(reconciliationDescriptor);
      try {
        fs.unlinkSync(reconciliationLockPath);
        syncJobStoreDirectory(this.#locksRoot);
      } catch (error) {
        if (error?.code !== 'ENOENT' || reconciled) {
          throw error;
        }
      }
    }
  }

  #readReconciliationHeadInventory(previous, next) {
    const jobDirectory = path.join(
      this.#jobsRoot,
      previous.jobId,
    );
    assertRegularJobStoreDirectory(
      jobDirectory,
      'publication job revision directory',
    );
    const entries = fs.readdirSync(jobDirectory, {
      withFileTypes: true,
    });
    const namedCommittedEntries = entries.filter(
      (entry) =>
        /^\d{8}-[a-f0-9]{64}\.json$/.test(entry.name),
    );
    if (
      namedCommittedEntries.some((entry) => !entry.isFile())
    ) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'A named publication-job head is not a regular file.',
      );
    }
    const committedEntries = namedCommittedEntries;
    if (
      committedEntries.length === 0 ||
      committedEntries.length > 10_000
    ) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'The committed publication-job revision inventory cannot be reconciled.',
      );
    }
    const records = committedEntries
      .map((entry) =>
        readPublicationJobHeadRecord(
          path.join(jobDirectory, entry.name),
          entry.name,
          previous.jobId,
        ),
      )
      .sort((left, right) => left.revision - right.revision);
    for (let index = 0; index < records.length; index += 1) {
      const record = records[index];
      if (
        record.revision !== index ||
        (index === 0
          ? record.predecessorJobIntegritySha256 !== null
          : record.predecessorJobIntegritySha256 !==
            records[index - 1].jobIntegritySha256)
      ) {
        throw new ContractError(
          'job_store_reconciliation_required',
          'The committed publication-job revision chain is discontinuous.',
        );
      }
    }
    const current = records.at(-1);
    const targetRevision =
      current.jobIntegritySha256 === next.integritySha256
        ? current.revision
        : current.revision + 1;
    const expectedHead = publicationJobHeadRecord({
      job: next,
      revision: targetRevision,
      predecessorJobIntegritySha256:
        previous.integritySha256,
    });
    const expectedTemporaryTarget =
      publicationJobHeadFileName(expectedHead);
    const nonCommittedEntries = entries.filter(
      (entry) =>
        !/^\d{8}-[a-f0-9]{64}\.json$/.test(entry.name),
    );
    if (
      nonCommittedEntries.length > 1 ||
      nonCommittedEntries.some((entry) => {
        if (!entry.isFile()) return true;
        const parsed = parseImmutableJobStoreTemporaryName(
          entry.name,
        );
        return (
          parsed === null ||
          parsed.targetFileName !== expectedTemporaryTarget
        );
      })
    ) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'Unknown or ambiguous publication-job temporary evidence remains held.',
      );
    }
    return { jobDirectory, current };
  }

  #withJobLock(jobId, run) {
    const normalizedJobId = assertSafeIdentifier(
      jobId,
      'publication job store jobId',
    );
    const lockPath = path.join(
      this.#locksRoot,
      `${normalizedJobId}.lock`,
    );
    let descriptor;
    try {
      descriptor = fs.openSync(
        lockPath,
        fs.constants.O_CREAT |
          fs.constants.O_EXCL |
          fs.constants.O_WRONLY,
        0o600,
      );
      fs.writeFileSync(
        descriptor,
        `${process.pid}\n`,
        'utf8',
      );
      fs.fsyncSync(descriptor);
      syncJobStoreDirectory(this.#locksRoot);
    } catch (error) {
      if (error?.code === 'EEXIST') {
        throw new ContractError(
          'job_store_reconciliation_required',
          'A durable publication-job lock already exists; reconcile the interrupted transition before continuing.',
        );
      }
      throw error;
    }
    let completed = false;
    let transitionError = null;
    try {
      const result = run();
      completed = true;
      return result;
    } catch (error) {
      transitionError = error;
      throw error;
    } finally {
      if (descriptor !== undefined) {
        fs.closeSync(descriptor);
      }
      if (
        completed ||
        jobStoreLockCanBeReleasedAfterError(
          transitionError,
        )
      ) {
        fs.unlinkSync(lockPath);
        syncJobStoreDirectory(this.#locksRoot);
      }
    }
  }

  #readCurrentHead(jobId) {
    const jobDirectory = path.join(this.#jobsRoot, jobId);
    if (!fs.existsSync(jobDirectory)) return null;
    assertRegularJobStoreDirectory(
      jobDirectory,
      'publication job revision directory',
    );
    const entries = fs.readdirSync(jobDirectory, {
      withFileTypes: true,
    });
    if (entries.length === 0) {
      throw new ContractError(
        'job_store_corrupt',
        'The publication-job revision directory has no immutable head records.',
      );
    }
    if (
      entries.length > 10_000 ||
      entries.some(
        (entry) =>
          !entry.isFile() ||
          !/^\d{8}-[a-f0-9]{64}\.json$/.test(entry.name),
      )
    ) {
      throw new ContractError(
        'job_store_corrupt',
        'The publication-job revision inventory is invalid.',
      );
    }
    const records = entries
      .map((entry) =>
        readPublicationJobHeadRecord(
          path.join(jobDirectory, entry.name),
          entry.name,
          jobId,
        ),
      )
      .sort((left, right) => left.revision - right.revision);
    for (let index = 0; index < records.length; index += 1) {
      const record = records[index];
      if (
        record.revision !== index ||
        (index === 0
          ? record.predecessorJobIntegritySha256 !== null
          : record.predecessorJobIntegritySha256 !==
            records[index - 1].jobIntegritySha256)
      ) {
        throw new ContractError(
          'job_store_corrupt',
          'The immutable publication-job revision chain is discontinuous.',
        );
      }
    }
    return records.at(-1);
  }

  #writeHead({
    job,
    revision,
    predecessorJobIntegritySha256,
  }) {
    const jobDirectory = path.join(
      this.#jobsRoot,
      job.jobId,
    );
    if (!fs.existsSync(jobDirectory)) {
      fs.mkdirSync(jobDirectory, { mode: 0o700 });
      syncJobStoreDirectory(this.#jobsRoot);
    }
    assertRegularJobStoreDirectory(
      jobDirectory,
      'publication job revision directory',
    );
    const record = publicationJobHeadRecord({
      job,
      revision,
      predecessorJobIntegritySha256,
    });
    writeImmutableJobStoreRecord(
      path.join(
        jobDirectory,
        publicationJobHeadFileName(record),
      ),
      record,
    );
  }

  #consumeAuthority(
    rawConsumption,
    previousJob,
    nextJob,
  ) {
    const { idPath, hashPath, record } =
      this.#prepareAuthorityConsumption(
        rawConsumption,
        previousJob,
        nextJob,
      );
    if (fs.existsSync(idPath) || fs.existsSync(hashPath)) {
      throw new ContractError(
        'hold_authority_replay_forbidden',
        'The hold-release authority ID or immutable authority hash is already durably consumed.',
      );
    }
    try {
      writeImmutableJobStoreRecord(idPath, record);
    } catch (error) {
      if (error?.code === 'job_store_immutable_conflict') {
        throw new ContractError(
          'hold_authority_replay_forbidden',
          'The hold-release authority ID is already durably consumed.',
        );
      }
      throw error;
    }
    try {
      writeImmutableJobStoreRecord(hashPath, record);
    } catch (error) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'The authority consumption ledger was interrupted after its ID claim; reconcile before continuing.',
        { reasonCode: error?.code ?? 'unknown' },
      );
    }
  }

  #prepareAuthorityConsumption(
    rawConsumption,
    previousJob,
    nextJob,
  ) {
    assertExactObjectKeys(
      rawConsumption,
      [
        'authorityId',
        'authoritySha256',
        'stepKey',
        'resumeId',
        'requestDigest',
        'verifierKeyId',
        'revocationSnapshotId',
      ],
      'job authority consumption',
      'job_store_authority_consumption_invalid',
    );
    const authorityId = assertSafeIdentifier(
      rawConsumption.authorityId,
      'job authority consumption authorityId',
    );
    const authoritySha256 = assertSha256(
      rawConsumption.authoritySha256,
      'job authority consumption authoritySha256',
    );
    const stepKey = assertSafeIdentifier(
      rawConsumption.stepKey,
      'job authority consumption stepKey',
    );
    const resumeId = assertSafeIdentifier(
      rawConsumption.resumeId,
      'job authority consumption resumeId',
    );
    const requestDigest = assertSha256(
      rawConsumption.requestDigest,
      'job authority consumption requestDigest',
    );
    const verifierKeyId = assertSafeIdentifier(
      rawConsumption.verifierKeyId,
      'job authority consumption verifierKeyId',
    );
    const revocationSnapshotId = assertSafeIdentifier(
      rawConsumption.revocationSnapshotId,
      'job authority consumption revocationSnapshotId',
    );
    const previousStep = requireStep(previousJob, stepKey);
    const nextStep = requireStep(nextJob, stepKey);
    const resume = nextStep.resumes.at(-1);
    if (
      previousStep.resumes.length + 1 !==
        nextStep.resumes.length ||
      canonicalDigest(previousStep.resumes) !==
        canonicalDigest(
          nextStep.resumes.slice(0, -1),
        ) ||
      !resume ||
      resume.holdAuthorityId !== authorityId ||
      resume.holdAuthoritySha256 !== authoritySha256 ||
      resume.resumeId !== resumeId ||
      resume.requestDigest !== requestDigest ||
      resume.holdVerifierKeyId !== verifierKeyId ||
      resume.holdRevocationSnapshotId !==
        revocationSnapshotId
    ) {
      throw new ContractError(
        'job_store_authority_consumption_invalid',
        'Authority consumption is not bound to the sole new held-resume record.',
      );
    }
    const authorityIdKey = sha256(
      Buffer.from(authorityId, 'utf8'),
    );
    const idPath = path.join(
      this.#authorityIdsRoot,
      `${authorityIdKey}.json`,
    );
    const hashPath = path.join(
      this.#authorityHashesRoot,
      `${authoritySha256}.json`,
    );
    const body = {
      schemaVersion:
        JOB_AUTHORITY_CONSUMPTION_SCHEMA_VERSION,
      authorityId,
      authoritySha256,
      jobId: previousJob.jobId,
      planHash: previousJob.planHash,
      stepKey,
      resumeId,
      requestDigest,
      verifierKeyId,
      revocationSnapshotId,
      predecessorJobIntegritySha256:
        previousJob.integritySha256,
      successorJobIntegritySha256:
        nextJob.integritySha256,
    };
    const record = {
      ...body,
      recordSha256: canonicalDigest(body),
    };
    return { idPath, hashPath, record };
  }
}

export function createPublicationJob(plan, actor) {
  const normalizedActor = authorizeActor(actor, plan?.tenantId);
  assertCanonicalJsonValue(plan, 'publication job plan');
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
    const plannedAction = normalizedPlan.stepActions[definition.key];
    const isNoOp = plannedAction === 'noop';
    const isHeld = plannedAction === 'hold';
    return {
      stepId: deterministicId('publication-step', { jobId, key: definition.key }),
      key: definition.key,
      provider: definition.provider,
      dependsOn: [...definition.dependsOn],
      plannedAction,
      approvalGate:
        normalizedPlan.approvalGates[definition.key] ??
        normalizedPlan.holdRequirements[definition.key]?.approvalRef ??
        null,
      holdRequirement: normalizedPlan.holdRequirements[definition.key] ?? null,
      rollbackAction: definition.rollbackAction,
      state:
        definition.dependsOn.length === 0
          ? isNoOp
            ? StepState.SKIPPED
            : isHeld
              ? StepState.BLOCKED
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
  const rootHeld = steps.some(
    (candidate) => candidate.state === StepState.BLOCKED,
  );
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
    state: allSkipped
      ? JobState.COMPLETED
      : rootHeld
        ? JobState.BLOCKED
        : JobState.PLANNED,
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

export function startPublicationJob(job, actor, options = {}) {
  const jobStore = requirePublicationJobStore(
    options.jobStore,
  );
  const currentJob = ensurePublicationJobStoreCurrent(
    jobStore,
    job,
  );
  const body = openJob(currentJob);
  const normalizedActor = authorizeActor(actor, body.tenantId);
  if (body.state === JobState.COMPLETED) return sealJob(body);
  if (body.state !== JobState.PLANNED) {
    throw new ContractError('job_start_state_invalid', `Job cannot start from ${body.state}.`);
  }
  body.state = JobState.RUNNING;
  appendEvent(body, 'job_started', null, normalizedActor, {});
  return jobStore.commit(currentJob, sealJob(body));
}

export function markStepRunning(
  job,
  stepKey,
  actor,
  idempotencyKey,
  options = {},
) {
  const jobStore = requirePublicationJobStore(
    options.jobStore,
  );
  const currentJob = ensurePublicationJobStoreCurrent(
    jobStore,
    job,
  );
  const body = openJob(currentJob);
  const normalizedActor = authorizeActor(actor, body.tenantId);
  const stepRecord = requireStep(body, stepKey);
  const key = assertSafeIdentifier(idempotencyKey, 'step idempotencyKey');
  const heldTransition = stepRecord.plannedAction === 'hold';
  if (heldTransition) {
    const releasedOperation = releasedOperationFor(stepRecord);
    if (options.operation !== releasedOperation) {
      throw new ContractError(
        'hold_release_operation_mismatch',
        `${stepKey} must start the exact signed released operation.`,
      );
    }
  }
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
  const nextJob = sealJob(body);
  return jobStore.commit(currentJob, nextJob);
}

export function applyStepOutcome(job, stepKey, outcome, options = {}) {
  const jobStore = requirePublicationJobStore(
    options.jobStore,
  );
  const currentJob = ensurePublicationJobStoreCurrent(
    jobStore,
    job,
  );
  const body = openJob(currentJob);
  const normalizedActor = authorizeActor(options.actor, body.tenantId);
  const stepRecord = requireStep(body, stepKey);
  const normalizedOutcome = String(outcome).toLowerCase();
  const targetState = OUTCOME_TO_STATE[normalizedOutcome];
  if (!targetState) throw new ContractError('step_outcome_invalid', `Unsupported step outcome: ${outcome}`);
  const idempotencyKey = assertSafeIdentifier(options.idempotencyKey, 'step outcome idempotencyKey');
  const output = options.output === undefined ? null : clone(options.output);
  assertCanonicalJsonValue(output, 'step output');
  assertNoForbiddenData(output, 'step output');
  const heldTransition = stepRecord.plannedAction === 'hold';
  const effectiveHeldOutcome =
    heldTransition &&
    ['success', 'partial', 'noop'].includes(
      normalizedOutcome,
    );
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

  if (effectiveHeldOutcome) {
    const releasedOperation = releasedOperationFor(stepRecord);
    if (options.operation !== releasedOperation) {
      throw new ContractError(
        'hold_release_operation_mismatch',
        `${stepKey} outcome must bind the exact signed released operation.`,
      );
    }
  }
  if (![JobState.RUNNING, JobState.PARTIAL].includes(body.state)) {
    throw new ContractError('job_not_running', `Step outcome cannot be applied while job is ${body.state}.`);
  }
  if (![StepState.READY, StepState.RUNNING].includes(stepRecord.state)) {
    throw new ContractError('step_outcome_state_invalid', `${stepKey} cannot accept an outcome from ${stepRecord.state}.`);
  }
  if (
    effectiveHeldOutcome &&
    stepRecord.state !== StepState.RUNNING
  ) {
    throw new ContractError(
      'hold_release_step_not_started',
      `${stepKey} cannot accept a released outcome before its durably claimed start transition.`,
    );
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
    output,
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
  const nextJob = sealJob(body);
  return jobStore.commit(currentJob, nextJob);
}

export function resumePublicationJob(job, options = {}) {
  const jobStore = requirePublicationJobStore(
    options.jobStore,
  );
  const currentJob = ensurePublicationJobStoreCurrent(
    jobStore,
    job,
  );
  const body = openJob(currentJob);
  const normalizedActor = authorizeActor(options.actor, body.tenantId);
  const stepRecord = requireStep(body, options.stepKey);
  const heldTransition = stepRecord.plannedAction === 'hold';
  const idempotencyKey = assertSafeIdentifier(options.idempotencyKey, 'resume idempotencyKey');
  const reasonCode = assertSafeIdentifier(options.reasonCode, 'resume reasonCode');
  const suppliedAuthority =
    options.approvalAuthority === undefined
      ? null
      : normalizeSuppliedAuthorityForReplay(options.approvalAuthority);
  const replayRequestDigest = canonicalDigest({
    jobId: body.jobId,
    stepKey: stepRecord.key,
    idempotencyKey,
    reasonCode,
    actorId: normalizedActor.actorId,
    actorRole: normalizedActor.role,
    actorTenantId: normalizedActor.tenantId,
    holdAuthorityId: suppliedAuthority?.authorityId ?? null,
    holdAuthoritySha256: suppliedAuthority?.authoritySha256 ?? null,
    releasedAction: suppliedAuthority?.releasedAction ?? null,
  });
  const existing = stepRecord.resumes.find((resume) => resume.idempotencyKey === idempotencyKey);
  if (existing) {
    if (existing.requestDigest !== replayRequestDigest) {
      throw new ContractError(
        'resume_idempotency_conflict',
        'Resume idempotency key was reused with a different request.',
      );
    }
    return sealJob(body);
  }
  if (![JobState.BLOCKED, JobState.PARTIAL, JobState.FAILED].includes(body.state)) {
    throw new ContractError('job_resume_state_invalid', `Job cannot resume from ${body.state}.`);
  }
  if (![StepState.BLOCKED, StepState.PARTIAL, StepState.FAILED].includes(stepRecord.state)) {
    throw new ContractError('step_resume_state_invalid', `${stepRecord.key} cannot resume from ${stepRecord.state}.`);
  }
  const holdAuthority =
    stepRecord.plannedAction === 'hold'
      ? validateHoldAuthority(
          body,
          stepRecord,
          options.approvalAuthority,
          normalizedActor,
          options.holdAuthorityVerifier,
        )
      : null;
  if (
    holdAuthority &&
    body.steps.some(
      (candidate) =>
        candidate.resumes.some(
          (resume) =>
            resume.holdAuthorityId === holdAuthority.authorityId ||
            resume.holdAuthoritySha256 ===
              holdAuthority.authoritySha256,
        ),
    )
  ) {
    throw new ContractError(
      'hold_authority_replay_forbidden',
      'A hold-release authority cannot authorize a second resume request.',
    );
  }
  if (stepRecord.plannedAction !== 'hold' && options.approvalAuthority !== undefined) {
    throw new ContractError(
      'hold_authority_unexpected',
      'Hold-release authority is accepted only for a held step.',
    );
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
    actorId: normalizedActor.actorId,
    actorRole: normalizedActor.role,
    actorTenantId: normalizedActor.tenantId,
    holdAuthority: holdAuthority?.authority ?? null,
    holdAuthorityId: holdAuthority?.authorityId ?? null,
    holdAuthoritySha256: holdAuthority?.authoritySha256 ?? null,
    holdVerifierKeyId: holdAuthority?.verifierKeyId ?? null,
    holdRevocationSnapshotId:
      holdAuthority?.revocationSnapshotId ?? null,
    releasedAction: holdAuthority?.releasedAction ?? null,
    requestDigest: replayRequestDigest,
  };
  stepRecord.resumes.push(resume);
  stepRecord.state = StepState.READY;
  stepRecord.output = null;
  body.state = JobState.RUNNING;
  appendEvent(body, 'step_resumed', stepRecord.key, normalizedActor, resume);
  const nextJob = sealJob(body);
  return heldTransition
    ? jobStore.commit(currentJob, nextJob, {
        authorityConsumption: {
          authorityId: resume.holdAuthorityId,
          authoritySha256: resume.holdAuthoritySha256,
          stepKey: stepRecord.key,
          resumeId: resume.resumeId,
          requestDigest: resume.requestDigest,
          verifierKeyId: resume.holdVerifierKeyId,
          revocationSnapshotId:
            resume.holdRevocationSnapshotId,
        },
      })
    : jobStore.commit(currentJob, nextJob);
}

export function beginPublicationRollback(job, options = {}) {
  const jobStore = requirePublicationJobStore(
    options.jobStore,
  );
  const currentJob = ensurePublicationJobStoreCurrent(
    jobStore,
    job,
  );
  const body = openJob(currentJob);
  const normalizedActor = authorizeActor(options.actor, body.tenantId);
  const reasonCode = assertSafeIdentifier(options.reasonCode, 'rollback reasonCode');
  const idempotencyKey = assertSafeIdentifier(options.idempotencyKey, 'rollback idempotencyKey');
  const requestDigest = canonicalDigest({
    jobId: body.jobId,
    reasonCode,
    idempotencyKey,
    actorId: normalizedActor.actorId,
    actorRole: normalizedActor.role,
    actorTenantId: normalizedActor.tenantId,
  });
  if (body.rollback) {
    if (
      body.rollback.idempotencyKey !== idempotencyKey ||
      body.rollback.requestDigest !== requestDigest
    ) {
      throw new ContractError('rollback_idempotency_conflict', 'Rollback already began with a different request.');
    }
    return sealJob(body);
  }
  if (![JobState.COMPLETED, JobState.PARTIAL, JobState.FAILED, JobState.BLOCKED].includes(body.state)) {
    throw new ContractError('rollback_state_invalid', `Rollback cannot begin from ${body.state}.`);
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
    actorId: normalizedActor.actorId,
    actorRole: normalizedActor.role,
    actorTenantId: normalizedActor.tenantId,
    requestDigest,
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
  return jobStore.commit(currentJob, sealJob(body));
}

export function applyRollbackOutcome(job, stepKey, outcome, options = {}) {
  const jobStore = requirePublicationJobStore(
    options.jobStore,
  );
  const currentJob = ensurePublicationJobStoreCurrent(
    jobStore,
    job,
  );
  const body = openJob(currentJob);
  const normalizedActor = authorizeActor(options.actor, body.tenantId);
  const stepRecord = requireStep(body, stepKey);
  const normalizedOutcome = String(outcome).toLowerCase();
  if (!['rolled_back', 'skipped', 'failed'].includes(normalizedOutcome)) {
    throw new ContractError('rollback_outcome_invalid', `Unsupported rollback outcome: ${outcome}`);
  }
  const idempotencyKey = assertSafeIdentifier(options.idempotencyKey, 'rollback step idempotencyKey');
  const output = options.output === undefined ? null : clone(options.output);
  assertCanonicalJsonValue(output, 'rollback output');
  assertNoForbiddenData(output, 'rollback output');
  const requestDigest = canonicalDigest({
    jobId: body.jobId,
    stepKey,
    normalizedOutcome,
    output,
    idempotencyKey,
    actorId: normalizedActor.actorId,
    actorRole: normalizedActor.role,
    actorTenantId: normalizedActor.tenantId,
  });
  const replay = stepRecord.rollbackAttempts.find((attempt) => attempt.idempotencyKey === idempotencyKey);
  if (replay) {
    if (replay.requestDigest !== requestDigest) {
      throw new ContractError('rollback_step_idempotency_conflict', 'Rollback key was reused with different output.');
    }
    return sealJob(body);
  }
  const attemptNumber = stepRecord.rollbackAttempts.length + 1;
  if (attemptNumber > 3) {
    throw new ContractError(
      'rollback_retry_limit_exceeded',
      `${stepKey} exhausted the bounded rollback retry limit.`,
    );
  }
  const retryDisposition =
    normalizedOutcome === 'failed'
      ? attemptNumber < 3
        ? 'RETRY_READY'
        : 'TERMINAL'
      : 'COMPLETED';
  const outcomeDigest = canonicalDigest({
    normalizedOutcome,
    output,
    retryDisposition,
  });
  if (body.state !== JobState.ROLLING_BACK || !body.rollback) {
    throw new ContractError('rollback_not_running', 'Rollback outcome requires a ROLLING_BACK job.');
  }
  if (stepRecord.rollbackState !== StepState.READY) {
    throw new ContractError('rollback_step_not_ready', `${stepKey} rollback is not READY.`);
  }
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
    retryDisposition,
    output,
    actorId: normalizedActor.actorId,
    actorRole: normalizedActor.role,
    actorTenantId: normalizedActor.tenantId,
    requestDigest,
  });
  stepRecord.rollbackState =
    normalizedOutcome === 'rolled_back'
      ? StepState.ROLLED_BACK
      : normalizedOutcome === 'skipped'
        ? StepState.SKIPPED
        : retryDisposition === 'RETRY_READY'
          ? StepState.READY
          : StepState.ROLLBACK_FAILED;
  appendEvent(
    body,
    `rollback_step_${normalizedOutcome}`,
    stepKey,
    normalizedActor,
    { outcomeDigest, retryDisposition },
  );
  if (normalizedOutcome === 'failed') {
    body.state =
      retryDisposition === 'RETRY_READY'
        ? JobState.ROLLING_BACK
        : JobState.ROLLBACK_FAILED;
    return jobStore.commit(currentJob, sealJob(body));
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
  return jobStore.commit(currentJob, sealJob(body));
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
    .map((candidate) => {
      const operation =
        candidate.plannedAction === 'hold'
          ? releasedOperationFor(candidate)
          : candidate.plannedAction;
      return immutable({
        stepId: candidate.stepId,
        key: candidate.key,
        operation,
      });
    });
}

function releasedOperationFor(stepRecord) {
  const resume = stepRecord.resumes.at(-1);
  if (
    !resume ||
    resume.releasedAction !==
      stepRecord.holdRequirement?.onReleaseAction
  ) {
    throw new ContractError(
      'hold_release_operation_unbound',
      `${stepRecord.key} has no signed released operation.`,
    );
  }
  assertStoredHoldAuthorityCurrentlyActive(
    stepRecord,
    resume,
  );
  return resume.releasedAction;
}

export function verifyPublicationJob(job) {
  openJob(job);
  return true;
}

function normalizePlan(plan = {}) {
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    throw new ContractError('job_plan_invalid', 'Publication job plan must be an object.');
  }
  assertAllowedObjectKeys(
    plan,
    [
      'tenantId',
      'publicationId',
      'releaseId',
      'artifactId',
      'hostingClass',
      'dryRun',
      'stepActions',
      'approvalGates',
      'holdRequirements',
      'evidenceRefs',
    ],
    'publication job plan',
    'job_plan_shape_invalid',
  );
  const approvalGates = normalizeStepMap(plan.approvalGates ?? {}, 'approvalGates', null, { allowNull: true });
  const tenantId = assertSafeIdentifier(
    plan.tenantId,
    'plan.tenantId',
    { backend: true },
  ).toLowerCase();
  const publicationId = assertSafeIdentifier(
    plan.publicationId,
    'plan.publicationId',
    { backend: true },
  );
  const releaseId = assertSafeIdentifier(plan.releaseId, 'plan.releaseId');
  const artifactId = assertSafeIdentifier(plan.artifactId, 'plan.artifactId');
  if (
    Object.hasOwn(plan, 'dryRun') &&
    typeof plan.dryRun !== 'boolean'
  ) {
    throw new ContractError(
      'job_plan_dry_run_invalid',
      'plan.dryRun must be boolean when supplied.',
    );
  }
  const dryRun = plan.dryRun !== false;
  const suppliedStepActions = normalizeStepMap(
    plan.stepActions ?? {},
    'stepActions',
    new Set(['execute', 'verify', 'noop', 'hold']),
  );
  const stepActions = Object.fromEntries(
    PublicationJobStepDefinitions.map((definition) => [
      definition.key,
      suppliedStepActions[definition.key] ??
        (SENSITIVE_JOB_STEPS.has(definition.key)
          ? 'hold'
          : dryRun
            ? 'verify'
            : 'execute'),
    ]),
  );
  for (const [stepKey, action] of Object.entries(stepActions)) {
    if (dryRun && action === 'execute') {
      throw new ContractError(
        'job_dry_run_execute_forbidden',
        `Dry-run plan cannot emit executable step ${stepKey}.`,
      );
    }
    if (SENSITIVE_JOB_STEPS.has(stepKey) && action === 'execute') {
      throw new ContractError(
        'job_sensitive_execute_requires_hold',
        `Sensitive step ${stepKey} must be held and released by signed authority.`,
      );
    }
  }
  const holdRequirements = normalizeHoldRequirements(
    plan.holdRequirements ?? {},
    {
      tenantId,
      publicationId,
      releaseId,
      stepActions,
      dryRun,
    },
  );
  for (const [stepKey, approvalGate] of Object.entries(approvalGates)) {
    if (approvalGate !== null) {
      approvalGates[stepKey] = assertSafeIdentifier(
        approvalGate,
        `approvalGates.${stepKey}`,
      );
    }
  }
  if (
    plan.evidenceRefs !== undefined &&
    !Array.isArray(plan.evidenceRefs)
  ) {
    throw new ContractError(
      'job_plan_evidence_invalid',
      'plan.evidenceRefs must be an array.',
    );
  }
  const evidenceRefs = (plan.evidenceRefs ?? [])
    .map((value, index) =>
      assertSafeRelativeReference(value, `plan.evidenceRefs[${index}]`),
    )
    .sort();
  if (new Set(evidenceRefs).size !== evidenceRefs.length) {
    throw new ContractError(
      'job_plan_evidence_invalid',
      'plan.evidenceRefs entries must be unique.',
    );
  }
  return {
    tenantId,
    publicationId,
    releaseId,
    artifactId,
    hostingClass: assertSafeIdentifier(plan.hostingClass, 'plan.hostingClass'),
    dryRun,
    stepActions,
    approvalGates,
    holdRequirements,
    evidenceRefs,
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
        candidate.state =
          candidate.plannedAction === 'noop'
            ? StepState.SKIPPED
            : candidate.plannedAction === 'hold'
              ? StepState.BLOCKED
              : StepState.READY;
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
  const eventIdentity = {
    jobId: body.jobId,
    sequence,
    action,
    stepKey,
    actorId: actor.actorId,
    actorRole: actor.role,
    actorTenantId: actor.tenantId,
    detail,
  };
  body.events.push({
    eventId: deterministicId('job-event', eventIdentity),
    sequence,
    action,
    stepKey,
    actorId: actor.actorId,
    actorRole: actor.role,
    actorTenantId: actor.tenantId,
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
  assertCanonicalJsonValue(job, 'publication job');
  assertExactObjectKeys(
    job,
    [
      'schemaVersion',
      'jobId',
      'jobType',
      'tenantId',
      'publicationId',
      'releaseId',
      'artifactId',
      'planHash',
      'plan',
      'state',
      'steps',
      'events',
      'rollback',
      'valuesIncluded',
      'integritySha256',
    ],
    'publication job',
    'job_shape_invalid',
  );
  if (job.schemaVersion !== ContractVersion.job) {
    throw new ContractError('job_schema_invalid', `Job schema must be ${ContractVersion.job}.`);
  }
  const body = clone(job);
  const integrity = assertSha256(
    body.integritySha256,
    'job.integritySha256',
  );
  delete body.integritySha256;
  if (canonicalDigest(body) !== integrity) {
    throw new ContractError('job_integrity_invalid', 'Job integrity hash does not match its state.');
  }
  assertNoForbiddenData(body, 'publication job');
  validateJobBody(body);
  return body;
}

function validateJobBody(body) {
  if (
    body.jobType !== 'TENANT_PUBLICATION' ||
    body.valuesIncluded !== false
  ) {
    throw new ContractError(
      'job_metadata_invalid',
      'Publication job type or value-inclusion marker is invalid.',
    );
  }
  const tenantId = assertSafeIdentifier(
    body.tenantId,
    'job.tenantId',
    { backend: true },
  ).toLowerCase();
  const publicationId = assertSafeIdentifier(
    body.publicationId,
    'job.publicationId',
    { backend: true },
  );
  const releaseId = assertSafeIdentifier(body.releaseId, 'job.releaseId');
  const artifactId = assertSafeIdentifier(body.artifactId, 'job.artifactId');
  const normalizedPlan = normalizePlan(body.plan);
  if (
    canonicalDigest(normalizedPlan) !== canonicalDigest(body.plan) ||
    normalizedPlan.tenantId !== tenantId ||
    normalizedPlan.publicationId !== publicationId ||
    normalizedPlan.releaseId !== releaseId ||
    normalizedPlan.artifactId !== artifactId
  ) {
    throw new ContractError(
      'job_plan_binding_invalid',
      'Stored job plan is not canonical or does not match job identity.',
    );
  }
  const planHash = assertSha256(body.planHash, 'job.planHash');
  if (planHash !== canonicalDigest(normalizedPlan)) {
    throw new ContractError(
      'job_plan_hash_invalid',
      'Stored job plan hash does not match the canonical plan.',
    );
  }
  const expectedJobId = deterministicId('publication-job', {
    tenantId,
    publicationId,
    releaseId,
    planHash,
  });
  if (body.jobId !== expectedJobId) {
    throw new ContractError(
      'job_id_invalid',
      'Stored publication job ID cannot be rederived.',
    );
  }
  assertEnumValue(JobState, body.state, 'job.state');
  if (
    !Array.isArray(body.steps) ||
    body.steps.length !== PublicationJobStepDefinitions.length
  ) {
    throw new ContractError(
      'job_step_graph_invalid',
      'Publication job must contain the exact canonical step graph.',
    );
  }
  const byKey = new Map();
  for (let index = 0; index < body.steps.length; index += 1) {
    const definition = PublicationJobStepDefinitions[index];
    const stepRecord = body.steps[index];
    validateStoredStep(
      body,
      normalizedPlan,
      definition,
      stepRecord,
      byKey,
    );
    if (byKey.has(stepRecord.key)) {
      throw new ContractError(
        'job_step_graph_invalid',
        `Duplicate publication job step: ${stepRecord.key}.`,
      );
    }
    byKey.set(stepRecord.key, stepRecord);
  }
  const holdAuthorityIds = new Set();
  const holdAuthorityHashes = new Set();
  for (const stepRecord of body.steps) {
    for (const resume of stepRecord.resumes) {
      if (resume.holdAuthorityId === null) continue;
      if (
        holdAuthorityIds.has(resume.holdAuthorityId) ||
        holdAuthorityHashes.has(resume.holdAuthoritySha256)
      ) {
        throw new ContractError(
          'job_resume_authority_replay',
          'Job reuses a hold-release authority across resume records.',
        );
      }
      holdAuthorityIds.add(resume.holdAuthorityId);
      holdAuthorityHashes.add(resume.holdAuthoritySha256);
    }
  }
  const eventIndex = validateStoredEvents(body, byKey);
  validateStepLifecycleCoherence(body, byKey, eventIndex);
  validateRollbackCoherence(body, byKey, eventIndex);
  validateStoredJobState(body, eventIndex);
}

function validateStoredStep(
  body,
  plan,
  definition,
  stepRecord,
  priorSteps,
) {
  assertAllowedObjectKeys(
    stepRecord,
    [
      'stepId',
      'key',
      'provider',
      'dependsOn',
      'plannedAction',
      'approvalGate',
      'holdRequirement',
      'rollbackAction',
      'state',
      'attempts',
      'resumes',
      'output',
      'rollbackState',
      'rollbackAttempts',
      'runningIdempotencyKey',
    ],
    `job.steps.${definition.key}`,
    'job_step_shape_invalid',
  );
  for (const required of [
    'stepId',
    'key',
    'provider',
    'dependsOn',
    'plannedAction',
    'approvalGate',
    'holdRequirement',
    'rollbackAction',
    'state',
    'attempts',
    'resumes',
    'output',
    'rollbackState',
    'rollbackAttempts',
  ]) {
    if (!Object.hasOwn(stepRecord, required)) {
      throw new ContractError(
        'job_step_shape_invalid',
        `job.steps.${definition.key}.${required} is required.`,
      );
    }
  }
  const expectedApproval =
    plan.approvalGates[definition.key] ??
    plan.holdRequirements[definition.key]?.approvalRef ??
    null;
  if (
    stepRecord.key !== definition.key ||
    stepRecord.provider !== definition.provider ||
    canonicalDigest(stepRecord.dependsOn) !==
      canonicalDigest([...definition.dependsOn]) ||
    stepRecord.plannedAction !== plan.stepActions[definition.key] ||
    stepRecord.approvalGate !== expectedApproval ||
    canonicalDigest(stepRecord.holdRequirement) !==
      canonicalDigest(plan.holdRequirements[definition.key] ?? null) ||
    stepRecord.rollbackAction !== definition.rollbackAction ||
    stepRecord.stepId !==
      deterministicId('publication-step', {
        jobId: body.jobId,
        key: definition.key,
      })
  ) {
    throw new ContractError(
      'job_step_graph_invalid',
      `Stored step ${definition.key} does not match the canonical graph and plan.`,
    );
  }
  for (const dependency of definition.dependsOn) {
    if (!priorSteps.has(dependency)) {
      throw new ContractError(
        'job_step_graph_invalid',
        `${definition.key} dependency order is invalid.`,
      );
    }
  }
  assertEnumValue(
    StepState,
    stepRecord.state,
    `job.steps.${definition.key}.state`,
  );
  if (
    stepRecord.rollbackState !== null &&
    !Object.values(StepState).includes(stepRecord.rollbackState)
  ) {
    throw new ContractError(
      'job_rollback_state_invalid',
      `${definition.key} rollback state is invalid.`,
    );
  }
  if (
    !Array.isArray(stepRecord.attempts) ||
    !Array.isArray(stepRecord.resumes) ||
    !Array.isArray(stepRecord.rollbackAttempts)
  ) {
    throw new ContractError(
      'job_attempt_shape_invalid',
      `${definition.key} attempt ledgers must be arrays.`,
    );
  }
  validateStoredAttempts(body, stepRecord);
  validateStoredResumes(body, stepRecord);
  validateStoredRollbackAttempts(body, stepRecord);
  if (Object.hasOwn(stepRecord, 'runningIdempotencyKey')) {
    assertSafeIdentifier(
      stepRecord.runningIdempotencyKey,
      `${definition.key}.runningIdempotencyKey`,
    );
    if (stepRecord.state !== StepState.RUNNING) {
      throw new ContractError(
        'job_step_state_incoherent',
        `${definition.key} has a running key outside RUNNING state.`,
      );
    }
  } else if (stepRecord.state === StepState.RUNNING) {
    throw new ContractError(
      'job_step_state_incoherent',
      `${definition.key} RUNNING state requires its idempotency key.`,
    );
  }
}

function validateStoredAttempts(body, stepRecord) {
  const idempotencyKeys = new Set();
  for (let index = 0; index < stepRecord.attempts.length; index += 1) {
    const attempt = stepRecord.attempts[index];
    assertExactObjectKeys(
      attempt,
      [
        'attemptId',
        'attemptNumber',
        'idempotencyKey',
        'outcome',
        'outcomeDigest',
        'approvalRef',
        'output',
      ],
      `${stepRecord.key}.attempts[${index}]`,
      'job_attempt_shape_invalid',
    );
    const attemptNumber = index + 1;
    const idempotencyKey = assertSafeIdentifier(
      attempt.idempotencyKey,
      `${stepRecord.key}.attempts[${index}].idempotencyKey`,
    );
    if (idempotencyKeys.has(idempotencyKey)) {
      throw new ContractError(
        'job_attempt_duplicate',
        `${stepRecord.key} contains duplicate attempt idempotency keys.`,
      );
    }
    idempotencyKeys.add(idempotencyKey);
    if (!Object.hasOwn(OUTCOME_TO_STATE, attempt.outcome)) {
      throw new ContractError(
        'job_attempt_outcome_invalid',
        `${stepRecord.key} contains an invalid attempt outcome.`,
      );
    }
    if (attempt.approvalRef !== null) {
      assertSafeIdentifier(
        attempt.approvalRef,
        `${stepRecord.key}.attempts[${index}].approvalRef`,
      );
    }
    const outcomeDigest = assertSha256(
      attempt.outcomeDigest,
      `${stepRecord.key}.attempts[${index}].outcomeDigest`,
    );
    const expectedOutcomeDigest = canonicalDigest({
      normalizedOutcome: attempt.outcome,
      output: attempt.output,
      approvalRef: attempt.approvalRef,
    });
    const expectedAttemptId = deterministicId('step-attempt', {
      jobId: body.jobId,
      stepKey: stepRecord.key,
      attemptNumber,
      idempotencyKey,
      outcomeDigest,
    });
    if (
      attempt.attemptNumber !== attemptNumber ||
      outcomeDigest !== expectedOutcomeDigest ||
      attempt.attemptId !== expectedAttemptId ||
      (stepRecord.approvalGate &&
        ['success', 'partial'].includes(attempt.outcome) &&
        attempt.approvalRef !== stepRecord.approvalGate)
    ) {
      throw new ContractError(
        'job_attempt_integrity_invalid',
        `${stepRecord.key} attempt ${attemptNumber} cannot be rederived.`,
      );
    }
  }
}

function validateStoredResumes(body, stepRecord) {
  const idempotencyKeys = new Set();
  const holdAuthorityIds = new Set();
  const holdAuthorityHashes = new Set();
  for (let index = 0; index < stepRecord.resumes.length; index += 1) {
    const resume = stepRecord.resumes[index];
    assertExactObjectKeys(
      resume,
      [
        'resumeId',
        'idempotencyKey',
        'reasonCode',
        'actorId',
        'actorRole',
        'actorTenantId',
        'holdAuthority',
        'holdAuthorityId',
        'holdAuthoritySha256',
        'holdVerifierKeyId',
        'holdRevocationSnapshotId',
        'releasedAction',
        'requestDigest',
      ],
      `${stepRecord.key}.resumes[${index}]`,
      'job_resume_shape_invalid',
    );
    const idempotencyKey = assertSafeIdentifier(
      resume.idempotencyKey,
      `${stepRecord.key}.resumes[${index}].idempotencyKey`,
    );
    const reasonCode = assertSafeIdentifier(
      resume.reasonCode,
      `${stepRecord.key}.resumes[${index}].reasonCode`,
    );
    validateStoredActor(
      resume.actorRole,
      resume.actorId,
      resume.actorTenantId,
      body.tenantId,
      `${stepRecord.key}.resumes[${index}]`,
    );
    if (idempotencyKeys.has(idempotencyKey)) {
      throw new ContractError(
        'job_resume_duplicate',
        `${stepRecord.key} contains duplicate resume idempotency keys.`,
      );
    }
    idempotencyKeys.add(idempotencyKey);
    const holdValues = [
      resume.holdAuthority,
      resume.holdAuthorityId,
      resume.holdAuthoritySha256,
      resume.holdVerifierKeyId,
      resume.holdRevocationSnapshotId,
      resume.releasedAction,
    ];
    const hasHoldAuthority = holdValues.every((value) => value !== null);
    if (
      holdValues.some((value) => value !== null) !== hasHoldAuthority ||
      hasHoldAuthority !== (stepRecord.plannedAction === 'hold')
    ) {
      throw new ContractError(
        'job_resume_authority_invalid',
        `${stepRecord.key} resume authority binding is incomplete or unexpected.`,
      );
    }
    if (hasHoldAuthority) {
      validateStoredHoldAuthorityReceipt(
        body,
        stepRecord,
        resume,
        index,
      );
      assertSafeIdentifier(
        resume.holdAuthorityId,
        `${stepRecord.key}.resumes[${index}].holdAuthorityId`,
      );
      assertSha256(
        resume.holdAuthoritySha256,
        `${stepRecord.key}.resumes[${index}].holdAuthoritySha256`,
      );
      assertSafeIdentifier(
        resume.holdVerifierKeyId,
        `${stepRecord.key}.resumes[${index}].holdVerifierKeyId`,
      );
      assertSafeIdentifier(
        resume.holdRevocationSnapshotId,
        `${stepRecord.key}.resumes[${index}].holdRevocationSnapshotId`,
      );
      if (
        holdAuthorityIds.has(resume.holdAuthorityId) ||
        holdAuthorityHashes.has(resume.holdAuthoritySha256)
      ) {
        throw new ContractError(
          'job_resume_authority_replay',
          `${stepRecord.key} reuses a hold-release authority.`,
        );
      }
      holdAuthorityIds.add(resume.holdAuthorityId);
      holdAuthorityHashes.add(resume.holdAuthoritySha256);
    }
    const requestDigest = canonicalDigest({
      jobId: body.jobId,
      stepKey: stepRecord.key,
      idempotencyKey,
      reasonCode,
      actorId: resume.actorId,
      actorRole: resume.actorRole,
      actorTenantId: resume.actorTenantId,
      holdAuthorityId: resume.holdAuthorityId,
      holdAuthoritySha256: resume.holdAuthoritySha256,
      releasedAction: resume.releasedAction,
    });
    if (
      resume.requestDigest !== requestDigest ||
      resume.resumeId !==
        deterministicId('step-resume', {
          jobId: body.jobId,
          stepKey: stepRecord.key,
          idempotencyKey,
          reasonCode,
        })
    ) {
      throw new ContractError(
        'job_resume_integrity_invalid',
        `${stepRecord.key} resume ${index + 1} cannot be rederived.`,
      );
    }
  }
}

function validateStoredHoldAuthorityReceipt(
  body,
  stepRecord,
  resume,
  resumeIndex,
) {
  const authority = resume.holdAuthority;
  assertExactObjectKeys(
    authority,
    [
      'schemaVersion',
      'authorityId',
      'keyId',
      'approvalRef',
      'scope',
      'action',
      'releasedAction',
      'approvedBy',
      'approvedRole',
      'issuedAt',
      'expiresAt',
      'revocation',
      'signatureBase64',
    ],
    `${stepRecord.key}.resumes[${resumeIndex}].holdAuthority`,
    'job_resume_authority_invalid',
  );
  const requirement = stepRecord.holdRequirement;
  if (
    !requirement ||
    authority.schemaVersion !== HOLD_AUTHORITY_SCHEMA_VERSION ||
    authority.authorityId !== resume.holdAuthorityId ||
    authority.keyId !== resume.holdVerifierKeyId ||
    canonicalDigest(authority) !== resume.holdAuthoritySha256 ||
    authority.approvalRef !== requirement.approvalRef ||
    authority.action !== requirement.action ||
    authority.releasedAction !== requirement.onReleaseAction ||
    authority.approvedRole !== Role.SuperAdmin ||
    authority.approvedBy !== resume.actorId ||
    resume.actorRole !== Role.SuperAdmin ||
    resume.actorTenantId !== null
  ) {
    throw new ContractError(
      'job_resume_authority_invalid',
      `${stepRecord.key} resume authority receipt is not bound to its actor and requirement.`,
    );
  }
  assertExactObjectKeys(
    authority.scope,
    [
      'tenantId',
      'publicationId',
      'releaseId',
      'artifactId',
      'jobId',
      'planHash',
      'stepKey',
    ],
    `${stepRecord.key}.resumes[${resumeIndex}].holdAuthority.scope`,
    'job_resume_authority_invalid',
  );
  if (
    authority.scope.tenantId !== body.tenantId ||
    authority.scope.publicationId !== body.publicationId ||
    authority.scope.releaseId !== body.releaseId ||
    authority.scope.artifactId !== body.artifactId ||
    authority.scope.jobId !== body.jobId ||
    authority.scope.planHash !== body.planHash ||
    authority.scope.stepKey !== stepRecord.key ||
    stableRequirementScope(authority.scope) !==
      stableRequirementScope(requirement.scope)
  ) {
    throw new ContractError(
      'job_resume_authority_invalid',
      `${stepRecord.key} resume authority receipt has the wrong scope.`,
    );
  }
  assertExactObjectKeys(
    authority.revocation,
    ['status', 'snapshotId'],
    `${stepRecord.key}.resumes[${resumeIndex}].holdAuthority.revocation`,
    'job_resume_authority_invalid',
  );
  if (
    authority.revocation.status !== 'ACTIVE' ||
    authority.revocation.snapshotId !==
      resume.holdRevocationSnapshotId
  ) {
    throw new ContractError(
      'job_resume_authority_invalid',
      `${stepRecord.key} resume authority receipt has invalid revocation metadata.`,
    );
  }
  const issuedAt = Date.parse(authority.issuedAt);
  const expiresAt = Date.parse(authority.expiresAt);
  if (
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(expiresAt) ||
    new Date(issuedAt).toISOString() !== authority.issuedAt ||
    new Date(expiresAt).toISOString() !== authority.expiresAt ||
    expiresAt <= issuedAt ||
    expiresAt - issuedAt > requirement.maxValiditySeconds * 1000
  ) {
    throw new ContractError(
      'job_resume_authority_invalid',
      `${stepRecord.key} resume authority receipt has invalid bounded timestamps.`,
    );
  }
  const signature = decodeCanonicalEd25519Signature(
    authority.signatureBase64,
  );
  const verifierState = ACTIVE_HOLD_VERIFIER_STATE;
  const { signatureBase64, ...signedBody } = authority;
  if (
    !verifierState ||
    verifierState.keyId !== authority.keyId ||
    !verifySignature(
      null,
      Buffer.from(stableStringify(signedBody), 'utf8'),
      verifierState.publicKey,
      signature,
    )
  ) {
    throw new ContractError(
      'job_resume_authority_signature_invalid',
      `${stepRecord.key} stored hold authority signature is not valid under the process-locked trusted key.`,
    );
  }
}

function assertStoredHoldAuthorityCurrentlyActive(
  stepRecord,
  resume,
) {
  const authority = resume.holdAuthority;
  const verifierState = ACTIVE_HOLD_VERIFIER_STATE;
  const now = Date.now();
  if (
    !verifierState ||
    verifierState.keyId !== resume.holdVerifierKeyId ||
    verifierState.revocationSnapshotId !==
      resume.holdRevocationSnapshotId ||
    verifierState.revokedAuthorityIds.has(resume.holdAuthorityId) ||
    Date.parse(authority.issuedAt) > now ||
    Date.parse(authority.expiresAt) <= now
  ) {
    throw new ContractError(
      'hold_release_authority_inactive',
      `${stepRecord.key} released operation is held because its authority expired, was revoked, or is not process-trusted.`,
    );
  }
}

function validateStoredRollbackAttempts(body, stepRecord) {
  const idempotencyKeys = new Set();
  for (
    let index = 0;
    index < stepRecord.rollbackAttempts.length;
    index += 1
  ) {
    const attempt = stepRecord.rollbackAttempts[index];
    assertExactObjectKeys(
      attempt,
      [
        'attemptId',
        'attemptNumber',
        'idempotencyKey',
        'outcome',
        'outcomeDigest',
        'retryDisposition',
        'output',
        'actorId',
        'actorRole',
        'actorTenantId',
        'requestDigest',
      ],
      `${stepRecord.key}.rollbackAttempts[${index}]`,
      'job_rollback_attempt_shape_invalid',
    );
    const attemptNumber = index + 1;
    const idempotencyKey = assertSafeIdentifier(
      attempt.idempotencyKey,
      `${stepRecord.key}.rollbackAttempts[${index}].idempotencyKey`,
    );
    if (
      idempotencyKeys.has(idempotencyKey) ||
      !['rolled_back', 'skipped', 'failed'].includes(attempt.outcome)
    ) {
      throw new ContractError(
        'job_rollback_attempt_invalid',
        `${stepRecord.key} contains an invalid rollback attempt.`,
      );
    }
    const expectedRetryDisposition =
      attempt.outcome === 'failed'
        ? attemptNumber < 3
          ? 'RETRY_READY'
          : 'TERMINAL'
        : 'COMPLETED';
    if (attempt.retryDisposition !== expectedRetryDisposition) {
      throw new ContractError(
        'job_rollback_attempt_invalid',
        `${stepRecord.key} rollback retry disposition is invalid.`,
      );
    }
    if (
      index < stepRecord.rollbackAttempts.length - 1 &&
      (attempt.outcome !== 'failed' ||
        attempt.retryDisposition !== 'RETRY_READY')
    ) {
      throw new ContractError(
        'job_rollback_attempt_invalid',
        `${stepRecord.key} contains an attempt after a terminal rollback outcome.`,
      );
    }
    idempotencyKeys.add(idempotencyKey);
    validateStoredActor(
      attempt.actorRole,
      attempt.actorId,
      attempt.actorTenantId,
      body.tenantId,
      `${stepRecord.key}.rollbackAttempts[${index}]`,
    );
    const outcomeDigest = canonicalDigest({
      normalizedOutcome: attempt.outcome,
      output: attempt.output,
      retryDisposition: attempt.retryDisposition,
    });
    const requestDigest = canonicalDigest({
      jobId: body.jobId,
      stepKey: stepRecord.key,
      normalizedOutcome: attempt.outcome,
      output: attempt.output,
      idempotencyKey,
      actorId: attempt.actorId,
      actorRole: attempt.actorRole,
      actorTenantId: attempt.actorTenantId,
    });
    if (
      attempt.attemptNumber !== attemptNumber ||
      attempt.outcomeDigest !== outcomeDigest ||
      attempt.requestDigest !== requestDigest ||
      attempt.attemptId !==
        deterministicId('rollback-attempt', {
          jobId: body.jobId,
          stepKey: stepRecord.key,
          attemptNumber,
          idempotencyKey,
          outcomeDigest,
        })
    ) {
      throw new ContractError(
        'job_rollback_attempt_integrity_invalid',
        `${stepRecord.key} rollback attempt ${attemptNumber} cannot be rederived.`,
      );
    }
  }
}

function validateStoredEvents(body, byKey) {
  if (!Array.isArray(body.events) || body.events.length === 0) {
    throw new ContractError(
      'job_event_ledger_invalid',
      'Publication job requires a non-empty event ledger.',
    );
  }
  const byAction = new Map();
  const byStep = new Map(
    [...byKey.keys()].map((key) => [key, []]),
  );
  const eventIds = new Set();
  const allowedActions = new Set([
    'job_created',
    'job_started',
    'step_noop_planned',
    'step_noop_reconciled',
    'step_started',
    'step_success',
    'step_noop',
    'step_blocked',
    'step_partial',
    'step_failed',
    'step_resumed',
    'rollback_started',
    'rollback_completed_noop',
    'rollback_step_rolled_back',
    'rollback_step_skipped',
    'rollback_step_failed',
    'rollback_completed',
  ]);
  for (let index = 0; index < body.events.length; index += 1) {
    const event = body.events[index];
    assertExactObjectKeys(
      event,
      [
        'eventId',
        'sequence',
        'action',
        'stepKey',
        'actorId',
        'actorRole',
        'actorTenantId',
        'detail',
      ],
      `job.events[${index}]`,
      'job_event_shape_invalid',
    );
    const sequence = index + 1;
    if (
      event.sequence !== sequence ||
      !allowedActions.has(event.action)
    ) {
      throw new ContractError(
        'job_event_sequence_invalid',
        `Job event ${sequence} sequence or action is invalid.`,
      );
    }
    validateStoredActor(
      event.actorRole,
      event.actorId,
      event.actorTenantId,
      body.tenantId,
      `job.events[${index}]`,
    );
    const isStepEvent =
      event.action.startsWith('step_') ||
      event.action.startsWith('rollback_step_');
    if (
      (isStepEvent &&
        (typeof event.stepKey !== 'string' ||
          !byKey.has(event.stepKey))) ||
      (!isStepEvent && event.stepKey !== null)
    ) {
      throw new ContractError(
        'job_event_step_invalid',
        `Job event ${sequence} has an invalid step binding.`,
      );
    }
    validateStoredEventDetail(body, event, byKey);
    const expectedEventId = deterministicId('job-event', {
      jobId: body.jobId,
      sequence,
      action: event.action,
      stepKey: event.stepKey,
      actorId: event.actorId,
      actorRole: event.actorRole,
      actorTenantId: event.actorTenantId,
      detail: event.detail,
    });
    if (
      event.eventId !== expectedEventId ||
      eventIds.has(event.eventId)
    ) {
      throw new ContractError(
        'job_event_id_invalid',
        `Job event ${sequence} ID cannot be uniquely rederived.`,
      );
    }
    eventIds.add(event.eventId);
    if (!byAction.has(event.action)) byAction.set(event.action, []);
    byAction.get(event.action).push(event);
    if (isStepEvent) byStep.get(event.stepKey).push(event);
  }
  const created = byAction.get('job_created') ?? [];
  if (
    created.length !== 1 ||
    created[0].sequence !== 1 ||
    (byAction.get('job_started') ?? []).length > 1 ||
    (byAction.get('rollback_started') ?? []).length > 1 ||
    (byAction.get('rollback_completed') ?? []).length > 1 ||
    (byAction.get('rollback_completed_noop') ?? []).length > 1
  ) {
    throw new ContractError(
      'job_event_ledger_invalid',
      'Job lifecycle events are duplicated, missing, or reordered.',
    );
  }
  const rollbackStarted = (byAction.get('rollback_started') ?? [])[0];
  if (rollbackStarted) {
    const illegalLater = body.events
      .slice(rollbackStarted.sequence)
      .some(
        (event) =>
          event.action.startsWith('step_') &&
          !event.action.startsWith('rollback_step_'),
      );
    if (illegalLater) {
      throw new ContractError(
        'job_event_chronology_invalid',
        'Forward step events cannot occur after rollback begins.',
      );
    }
  }
  return {
    byAction,
    byStep,
    jobStarted: (byAction.get('job_started') ?? [])[0] ?? null,
    rollbackStarted: rollbackStarted ?? null,
  };
}

function validateStoredEventDetail(body, event, byKey) {
  const exact = (keys) =>
    assertExactObjectKeys(
      event.detail,
      keys,
      `job event ${event.sequence} detail`,
      'job_event_detail_invalid',
    );
  switch (event.action) {
    case 'job_created': {
      exact(['planHash', 'noOp']);
      if (
        event.detail.planHash !== body.planHash ||
        event.detail.noOp !==
          body.steps.every(
            (stepRecord) => stepRecord.plannedAction === 'noop',
          )
      ) {
        throw new ContractError(
          'job_event_detail_invalid',
          'job_created detail does not match the job plan.',
        );
      }
      break;
    }
    case 'job_started':
    case 'rollback_completed_noop':
      exact([]);
      break;
    case 'step_noop_planned':
    case 'step_noop_reconciled':
      exact(['plannedAction']);
      if (
        event.detail.plannedAction !== 'noop' ||
        byKey.get(event.stepKey).plannedAction !== 'noop'
      ) {
        throw new ContractError(
          'job_event_detail_invalid',
          'No-op event does not bind a no-op step.',
        );
      }
      break;
    case 'step_started':
      exact(['idempotencyKey']);
      assertSafeIdentifier(
        event.detail.idempotencyKey,
        `job event ${event.sequence} idempotencyKey`,
      );
      break;
    case 'step_success':
    case 'step_noop':
    case 'step_blocked':
    case 'step_partial':
    case 'step_failed':
      exact(['attemptId', 'outcomeDigest']);
      assertSafeIdentifier(
        event.detail.attemptId,
        `job event ${event.sequence} attemptId`,
      );
      assertSha256(
        event.detail.outcomeDigest,
        `job event ${event.sequence} outcomeDigest`,
      );
      break;
    case 'step_resumed':
      exact([
        'resumeId',
        'idempotencyKey',
        'reasonCode',
        'actorId',
        'actorRole',
        'actorTenantId',
        'holdAuthority',
        'holdAuthorityId',
        'holdAuthoritySha256',
        'holdVerifierKeyId',
        'holdRevocationSnapshotId',
        'releasedAction',
        'requestDigest',
      ]);
      if (
        event.detail.actorId !== event.actorId ||
        event.detail.actorRole !== event.actorRole ||
        event.detail.actorTenantId !== event.actorTenantId
      ) {
        throw new ContractError(
          'job_event_detail_invalid',
          'step_resumed detail actor does not match the event actor.',
        );
      }
      break;
    case 'rollback_started':
      exact(['rollbackId', 'order']);
      if (!Array.isArray(event.detail.order)) {
        throw new ContractError(
          'job_event_detail_invalid',
          'rollback_started order must be an array.',
        );
      }
      break;
    case 'rollback_step_rolled_back':
    case 'rollback_step_skipped':
    case 'rollback_step_failed':
      exact(['outcomeDigest', 'retryDisposition']);
      assertSha256(
        event.detail.outcomeDigest,
        `job event ${event.sequence} outcomeDigest`,
      );
      if (
        !['COMPLETED', 'RETRY_READY', 'TERMINAL'].includes(
          event.detail.retryDisposition,
        )
      ) {
        throw new ContractError(
          'job_event_detail_invalid',
          'Rollback event retry disposition is invalid.',
        );
      }
      break;
    case 'rollback_completed':
      exact(['rollbackId']);
      break;
    default:
      throw new ContractError(
        'job_event_detail_invalid',
        `Unsupported job event detail: ${event.action}.`,
      );
  }
}

function validateStepLifecycleCoherence(body, byKey, eventIndex) {
  for (const definition of PublicationJobStepDefinitions) {
    const stepRecord = byKey.get(definition.key);
    const events = eventIndex.byStep.get(definition.key);
    const forwardEvents = events.filter(
      (event) => !event.action.startsWith('rollback_step_'),
    );
    const dependencyCompletionSequence = Math.max(
      0,
      ...definition.dependsOn.map((dependencyKey) => {
        const dependency = byKey.get(dependencyKey);
        const dependencyEvents = eventIndex.byStep.get(dependencyKey);
        if (dependency.state === StepState.SKIPPED) {
          return Math.max(
            0,
            ...dependencyEvents
              .filter((event) => event.action.includes('noop'))
              .map((event) => event.sequence),
          );
        }
        return Math.max(
          0,
          ...dependencyEvents
            .filter((event) => event.action === 'step_success')
            .map((event) => event.sequence),
        );
      }),
    );
    if (
      forwardEvents.some(
        (event) =>
          !event.action.startsWith('step_noop_') &&
          event.sequence <= dependencyCompletionSequence,
      )
    ) {
      throw new ContractError(
        'job_step_chronology_invalid',
        `${definition.key} ran before its dependencies completed.`,
      );
    }
    const dependenciesSatisfied = definition.dependsOn.every((key) =>
      [StepState.SUCCEEDED, StepState.SKIPPED].includes(
        byKey.get(key).state,
      ),
    );
    let derivedState = dependenciesSatisfied
      ? stepRecord.plannedAction === 'noop'
        ? StepState.SKIPPED
        : stepRecord.plannedAction === 'hold'
          ? StepState.BLOCKED
          : StepState.READY
      : StepState.PENDING;
    let derivedOutput = null;
    let runningIdempotencyKey;
    const remainingAttempts = [...stepRecord.attempts];
    const remainingResumes = [...stepRecord.resumes];
    for (const event of forwardEvents) {
      if (
        event.action === 'step_noop_planned' ||
        event.action === 'step_noop_reconciled'
      ) {
        continue;
      }
      if (event.action === 'step_started') {
        if (derivedState !== StepState.READY) {
          throw new ContractError(
            'job_step_chronology_invalid',
            `${definition.key} started outside READY state.`,
          );
        }
        derivedState = StepState.RUNNING;
        runningIdempotencyKey = event.detail.idempotencyKey;
        continue;
      }
      if (event.action === 'step_resumed') {
        const nextResume = remainingResumes[0];
        if (
          !nextResume ||
          canonicalDigest(nextResume) !== canonicalDigest(event.detail) ||
          ![
            StepState.BLOCKED,
            StepState.PARTIAL,
            StepState.FAILED,
          ].includes(derivedState)
        ) {
          throw new ContractError(
            'job_resume_chronology_invalid',
            `${definition.key} contains an orphaned or invalid resume event.`,
          );
        }
        remainingResumes.shift();
        derivedState = StepState.READY;
        derivedOutput = null;
        runningIdempotencyKey = undefined;
        continue;
      }
      if (event.action.startsWith('step_')) {
        const nextAttempt = remainingAttempts[0];
        if (
          !nextAttempt ||
          nextAttempt.attemptId !== event.detail.attemptId ||
          nextAttempt.outcomeDigest !== event.detail.outcomeDigest ||
          event.action !== `step_${nextAttempt.outcome}` ||
          ![StepState.READY, StepState.RUNNING].includes(derivedState)
        ) {
          throw new ContractError(
            'job_attempt_chronology_invalid',
            `${definition.key} contains an orphaned or invalid outcome event.`,
          );
        }
        const attempt = remainingAttempts.shift();
        if (
          derivedState === StepState.RUNNING &&
          runningIdempotencyKey !== attempt.idempotencyKey
        ) {
          throw new ContractError(
            'job_attempt_chronology_invalid',
            `${definition.key} outcome does not match its running idempotency key.`,
          );
        }
        derivedState = OUTCOME_TO_STATE[attempt.outcome];
        derivedOutput = attempt.output;
        runningIdempotencyKey = undefined;
      }
    }
    if (
      remainingAttempts.length > 0 ||
      remainingResumes.length > 0 ||
      derivedState !== stepRecord.state ||
      canonicalDigest(derivedOutput) !== canonicalDigest(stepRecord.output) ||
      (runningIdempotencyKey ?? null) !==
        (stepRecord.runningIdempotencyKey ?? null)
    ) {
      throw new ContractError(
        'job_step_state_incoherent',
        `${definition.key} state cannot be replayed from its ledgers and events.`,
      );
    }
    const noopEvents = forwardEvents.filter(
      (event) =>
        event.action === 'step_noop_planned' ||
        event.action === 'step_noop_reconciled',
    );
    if (
      (stepRecord.plannedAction === 'noop' &&
        stepRecord.state === StepState.SKIPPED &&
        noopEvents.length !== 1) ||
      (stepRecord.plannedAction !== 'noop' && noopEvents.length !== 0)
    ) {
      throw new ContractError(
        'job_noop_event_invalid',
        `${definition.key} no-op audit event is missing or duplicated.`,
      );
    }
    if (noopEvents.length === 1) {
      const expectedNoopAction = definition.dependsOn.every(
        (dependencyKey) => {
          const dependency = byKey.get(dependencyKey);
          const dependencyNoopEvents = eventIndex.byStep
            .get(dependencyKey)
            .filter(
              (event) =>
                event.action === 'step_noop_planned' ||
                event.action === 'step_noop_reconciled',
            );
          return (
            dependency.plannedAction === 'noop' &&
            dependencyNoopEvents.length === 1 &&
            dependencyNoopEvents[0].action === 'step_noop_planned'
          );
        },
      )
        ? 'step_noop_planned'
        : 'step_noop_reconciled';
      if (noopEvents[0].action !== expectedNoopAction) {
        throw new ContractError(
          'job_noop_event_invalid',
          `${definition.key} no-op audit event has the wrong lifecycle phase.`,
        );
      }
    }
  }
}

function validateRollbackCoherence(body, byKey, eventIndex) {
  const rollbackEvents = [
    ...(eventIndex.byAction.get('rollback_started') ?? []),
    ...(eventIndex.byAction.get('rollback_completed') ?? []),
    ...(eventIndex.byAction.get('rollback_completed_noop') ?? []),
    ...[...eventIndex.byStep.values()].flat().filter((event) =>
      event.action.startsWith('rollback_step_'),
    ),
  ];
  if (body.rollback === null) {
    if (
      rollbackEvents.length > 0 ||
      body.steps.some(
        (stepRecord) =>
          stepRecord.rollbackState !== null ||
          stepRecord.rollbackAttempts.length > 0,
      )
    ) {
      throw new ContractError(
        'job_rollback_incoherent',
        'Rollback state exists without a rollback request.',
      );
    }
    return;
  }
  assertExactObjectKeys(
    body.rollback,
    [
      'rollbackId',
      'reasonCode',
      'idempotencyKey',
      'actorId',
      'actorRole',
      'actorTenantId',
      'requestDigest',
      'order',
    ],
    'job.rollback',
    'job_rollback_shape_invalid',
  );
  const reasonCode = assertSafeIdentifier(
    body.rollback.reasonCode,
    'job.rollback.reasonCode',
  );
  const idempotencyKey = assertSafeIdentifier(
    body.rollback.idempotencyKey,
    'job.rollback.idempotencyKey',
  );
  validateStoredActor(
    body.rollback.actorRole,
    body.rollback.actorId,
    body.rollback.actorTenantId,
    body.tenantId,
    'job.rollback',
  );
  const requestDigest = canonicalDigest({
    jobId: body.jobId,
    reasonCode,
    idempotencyKey,
    actorId: body.rollback.actorId,
    actorRole: body.rollback.actorRole,
    actorTenantId: body.rollback.actorTenantId,
  });
  const expectedRollbackId = deterministicId('publication-rollback', {
    jobId: body.jobId,
    reasonCode,
    idempotencyKey,
  });
  const expectedOrder = body.steps
    .filter(
      (stepRecord) =>
        stepRecord.state === StepState.SUCCEEDED &&
        stepRecord.rollbackAction,
    )
    .map((stepRecord) => stepRecord.key)
    .reverse();
  if (
    body.rollback.requestDigest !== requestDigest ||
    body.rollback.rollbackId !== expectedRollbackId ||
    canonicalDigest(body.rollback.order) !== canonicalDigest(expectedOrder)
  ) {
    throw new ContractError(
      'job_rollback_integrity_invalid',
      'Rollback request or order cannot be rederived.',
    );
  }
  const startedEvents = eventIndex.byAction.get('rollback_started') ?? [];
  if (
    startedEvents.length !== 1 ||
    startedEvents[0].detail.rollbackId !== body.rollback.rollbackId ||
    startedEvents[0].actorId !== body.rollback.actorId ||
    startedEvents[0].actorRole !== body.rollback.actorRole ||
    startedEvents[0].actorTenantId !== body.rollback.actorTenantId ||
    canonicalDigest(startedEvents[0].detail.order) !==
      canonicalDigest(body.rollback.order)
  ) {
    throw new ContractError(
      'job_rollback_event_invalid',
      'Rollback start event does not match its request.',
    );
  }
  let unresolvedFound = false;
  let failureFound = false;
  let lastEventSequence = startedEvents[0].sequence;
  for (const key of body.rollback.order) {
    const stepRecord = byKey.get(key);
    if (!stepRecord || stepRecord.rollbackAttempts.length > 3) {
      throw new ContractError(
        'job_rollback_order_invalid',
        `Rollback order contains an invalid or over-retried step: ${key}.`,
      );
    }
    const rollbackStepEvents = eventIndex.byStep
      .get(key)
      .filter((event) => event.action.startsWith('rollback_step_'));
    const attempts = stepRecord.rollbackAttempts;
    if (attempts.length === 0) {
      if (failureFound || unresolvedFound) {
        if (stepRecord.rollbackState !== StepState.PENDING) {
          throw new ContractError(
            'job_rollback_state_invalid',
            `${key} must remain pending behind an unresolved rollback step.`,
          );
        }
      } else if (stepRecord.rollbackState !== StepState.READY) {
        throw new ContractError(
          'job_rollback_state_invalid',
          `${key} must be the single ready rollback step.`,
        );
      }
      if (rollbackStepEvents.length !== 0) {
        throw new ContractError(
          'job_rollback_event_invalid',
          `${key} has an outcome event without an attempt.`,
        );
      }
      unresolvedFound = true;
      continue;
    }
    if (
      unresolvedFound ||
      failureFound ||
      rollbackStepEvents.length !== attempts.length
    ) {
      throw new ContractError(
        'job_rollback_chronology_invalid',
        `${key} rollback attempts are out of order or lack events.`,
      );
    }
    for (let index = 0; index < attempts.length; index += 1) {
      const attempt = attempts[index];
      const outcomeEvent = rollbackStepEvents[index];
      const expectedAction = `rollback_step_${attempt.outcome}`;
      if (
        outcomeEvent.action !== expectedAction ||
        outcomeEvent.detail.outcomeDigest !== attempt.outcomeDigest ||
        outcomeEvent.detail.retryDisposition !==
          attempt.retryDisposition ||
        outcomeEvent.actorId !== attempt.actorId ||
        outcomeEvent.actorRole !== attempt.actorRole ||
        outcomeEvent.actorTenantId !== attempt.actorTenantId ||
        outcomeEvent.sequence <= lastEventSequence
      ) {
        throw new ContractError(
          'job_rollback_chronology_invalid',
          `${key} rollback attempt ${index + 1} cannot be replayed.`,
        );
      }
      lastEventSequence = outcomeEvent.sequence;
    }
    const finalAttempt = attempts.at(-1);
    const expectedState =
      finalAttempt.outcome === 'rolled_back'
        ? StepState.ROLLED_BACK
        : finalAttempt.outcome === 'skipped'
          ? StepState.SKIPPED
          : finalAttempt.retryDisposition === 'RETRY_READY'
            ? StepState.READY
            : StepState.ROLLBACK_FAILED;
    if (stepRecord.rollbackState !== expectedState) {
      throw new ContractError(
        'job_rollback_chronology_invalid',
        `${key} rollback state cannot be replayed.`,
      );
    }
    if (finalAttempt.outcome === 'failed') {
      if (finalAttempt.retryDisposition === 'RETRY_READY') {
        unresolvedFound = true;
      } else {
        failureFound = true;
      }
    }
  }
  const orderSet = new Set(body.rollback.order);
  for (const stepRecord of body.steps) {
    if (
      !orderSet.has(stepRecord.key) &&
      (stepRecord.rollbackState !== null ||
        stepRecord.rollbackAttempts.length > 0)
    ) {
      throw new ContractError(
        'job_rollback_order_invalid',
        `${stepRecord.key} contains rollback state outside the rollback order.`,
      );
    }
  }
  const completedEvents =
    eventIndex.byAction.get('rollback_completed') ?? [];
  const noopEvents =
    eventIndex.byAction.get('rollback_completed_noop') ?? [];
  if (body.rollback.order.length === 0) {
    if (
      body.state !== JobState.ROLLED_BACK ||
      noopEvents.length !== 1 ||
      completedEvents.length !== 0 ||
      noopEvents[0].sequence <= startedEvents[0].sequence
    ) {
      throw new ContractError(
        'job_rollback_state_invalid',
        'Empty rollback must close as an audited no-op.',
      );
    }
  } else if (failureFound) {
    if (
      body.state !== JobState.ROLLBACK_FAILED ||
      completedEvents.length !== 0 ||
      noopEvents.length !== 0
    ) {
      throw new ContractError(
        'job_rollback_state_invalid',
        'Failed rollback has an incoherent job state.',
      );
    }
  } else if (unresolvedFound) {
    if (
      body.state !== JobState.ROLLING_BACK ||
      completedEvents.length !== 0 ||
      noopEvents.length !== 0
    ) {
      throw new ContractError(
        'job_rollback_state_invalid',
        'Active rollback has an incoherent job state.',
      );
    }
  } else if (
    body.state !== JobState.ROLLED_BACK ||
    completedEvents.length !== 1 ||
    noopEvents.length !== 0 ||
    completedEvents[0].detail.rollbackId !== body.rollback.rollbackId ||
    completedEvents[0].sequence <= lastEventSequence
  ) {
    throw new ContractError(
      'job_rollback_state_invalid',
      'Completed rollback has an incoherent job state or event.',
    );
  }
}

function validateStoredJobState(body, eventIndex) {
  if (body.rollback !== null) return;
  let expectedState;
  if (
    body.steps.every((stepRecord) =>
      [StepState.SUCCEEDED, StepState.SKIPPED].includes(stepRecord.state),
    )
  ) {
    expectedState = JobState.COMPLETED;
  } else if (
    !eventIndex.jobStarted &&
    !body.events.some((event) =>
      [
        'step_started',
        'step_success',
        'step_noop',
        'step_blocked',
        'step_partial',
        'step_failed',
        'step_resumed',
      ].includes(event.action),
    )
  ) {
    expectedState = body.steps.some(
      (stepRecord) => stepRecord.state === StepState.BLOCKED,
    )
      ? JobState.BLOCKED
      : JobState.PLANNED;
  } else if (
    body.steps.some((stepRecord) => stepRecord.state === StepState.FAILED)
  ) {
    expectedState = JobState.FAILED;
  } else if (
    body.steps.some((stepRecord) => stepRecord.state === StepState.BLOCKED)
  ) {
    expectedState = JobState.BLOCKED;
  } else if (
    body.steps.some((stepRecord) => stepRecord.state === StepState.PARTIAL)
  ) {
    expectedState = JobState.PARTIAL;
  } else {
    expectedState = JobState.RUNNING;
  }
  if (body.state !== expectedState) {
    throw new ContractError(
      'job_state_incoherent',
      `Job state ${body.state} cannot be rederived as ${expectedState}.`,
    );
  }
  if (
    eventIndex.jobStarted &&
    eventIndex.jobStarted.sequence !== 2 &&
    !body.events
      .slice(1, eventIndex.jobStarted.sequence - 1)
      .every((event) => event.action === 'step_noop_planned')
  ) {
    throw new ContractError(
      'job_event_chronology_invalid',
      'job_started must follow only creation-time no-op audit events.',
    );
  }
}

function validateStoredActor(
  role,
  actorId,
  actorTenantId,
  tenantId,
  label,
) {
  assertEnumValue(Role, role, `${label}.actorRole`);
  assertSafeIdentifier(actorId, `${label}.actorId`);
  if (role === Role.SuperAdmin) {
    if (actorTenantId !== null) {
      throw new ContractError(
        'job_actor_scope_invalid',
        `${label} SuperAdmin actorTenantId must be null.`,
      );
    }
    return;
  }
  const normalizedTenantId = assertSafeIdentifier(
    actorTenantId,
    `${label}.actorTenantId`,
    { backend: true },
  ).toLowerCase();
  if (normalizedTenantId !== tenantId) {
    throw new ContractError(
      'job_actor_scope_invalid',
      `${label} actor tenant does not match the job tenant.`,
    );
  }
}

function requireStep(job, key) {
  const stepRecord = job.steps.find((candidate) => candidate.key === key);
  if (!stepRecord) throw new ContractError('job_step_missing', `Job step was not found: ${key}`);
  return stepRecord;
}

function authorizeActor(actor = {}, tenantId) {
  const role = assertEnumValue(Role, actor.role, 'actor.role');
  const actorId = assertSafeIdentifier(actor.actorId, 'actor.actorId');
  if (role === Role.SuperAdmin) {
    return immutable({ role, actorId, tenantId: null });
  }
  const actorTenantId = assertSafeIdentifier(actor.tenantId, 'actor.tenantId', { backend: true }).toLowerCase();
  if (!tenantId || actorTenantId !== String(tenantId).toLowerCase()) {
    throw new ContractError('cross_tenant_forbidden', 'TenantAdmin job access is restricted to its own tenant.');
  }
  return immutable({ role, actorId, tenantId: actorTenantId });
}

function step(key, dependsOn, provider, rollbackAction) {
  return Object.freeze({ key, dependsOn: Object.freeze(dependsOn), provider, rollbackAction });
}

function normalizeHoldRequirements(
  value,
  {
    tenantId,
    publicationId,
    releaseId,
    stepActions,
    dryRun,
  },
) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ContractError(
      'hold_requirements_invalid',
      'holdRequirements must be an object.',
    );
  }
  const normalized = {};
  const known = new Set(
    PublicationJobStepDefinitions.map((definition) => definition.key),
  );
  for (const [stepKey, requirement] of Object.entries(value).sort(
    ([left], [right]) => left.localeCompare(right, 'en'),
  )) {
    if (!known.has(stepKey) || stepActions[stepKey] !== 'hold') {
      throw new ContractError(
        'hold_requirement_step_invalid',
        `holdRequirements contains a non-held or unknown step: ${stepKey}.`,
      );
    }
    if (!requirement || typeof requirement !== 'object' || Array.isArray(requirement)) {
      throw new ContractError(
        'hold_requirement_invalid',
        `holdRequirements.${stepKey} must be structured.`,
      );
    }
    assertExactObjectKeys(
      requirement,
      [
        'approvalRef',
        'scope',
        'action',
        'onReleaseAction',
        'maxValiditySeconds',
      ],
      `holdRequirements.${stepKey}`,
    );
    const scope = requirement.scope;
    assertExactObjectKeys(
      scope,
      ['tenantId', 'publicationId', 'releaseId', 'stepKey'],
      `holdRequirements.${stepKey}.scope`,
    );
    if (
      !scope ||
      scope.tenantId !== tenantId ||
      scope.publicationId !== publicationId ||
      scope.releaseId !== releaseId ||
      scope.stepKey !== stepKey
    ) {
      throw new ContractError(
        'hold_requirement_scope_invalid',
        `holdRequirements.${stepKey} scope does not match the job.`,
      );
    }
    if (requirement.action !== 'release-hold') {
      throw new ContractError(
        'hold_requirement_action_invalid',
        `holdRequirements.${stepKey} action must be release-hold.`,
      );
    }
    if (
      !['execute', 'verify'].includes(requirement.onReleaseAction) ||
      (dryRun && requirement.onReleaseAction !== 'verify')
    ) {
      throw new ContractError(
        'hold_requirement_release_action_invalid',
        `holdRequirements.${stepKey} onReleaseAction must be verify for dry-run plans and otherwise execute or verify.`,
      );
    }
    const maxValiditySeconds = requirement.maxValiditySeconds;
    if (
      !Number.isInteger(maxValiditySeconds) ||
      maxValiditySeconds < 60 ||
      maxValiditySeconds > 86_400
    ) {
      throw new ContractError(
        'hold_requirement_validity_invalid',
        `holdRequirements.${stepKey} validity must be between 60 and 86400 seconds.`,
      );
    }
    normalized[stepKey] = {
      approvalRef: assertSafeIdentifier(
        requirement.approvalRef,
        `holdRequirements.${stepKey}.approvalRef`,
      ),
      scope: { tenantId, publicationId, releaseId, stepKey },
      action: 'release-hold',
      onReleaseAction: requirement.onReleaseAction,
      maxValiditySeconds,
    };
  }
  for (const [stepKey, action] of Object.entries(stepActions)) {
    if (action === 'hold' && !normalized[stepKey]) {
      throw new ContractError(
        'hold_requirement_missing',
        `Held step ${stepKey} requires structured approval scope.`,
      );
    }
  }
  return normalized;
}

function validateHoldAuthority(
  job,
  stepRecord,
  authority,
  actor,
  verifier,
) {
  const requirement = stepRecord.holdRequirement;
  if (!requirement || !authority || typeof authority !== 'object') {
    throw new ContractError(
      'hold_authority_required',
      `${stepRecord.key} requires structured hold-release authority.`,
    );
  }
  const verifierState = HOLD_VERIFIER_STATE.get(verifier);
  if (
    !verifierState ||
    verifierState !== ACTIVE_HOLD_VERIFIER_STATE
  ) {
    throw new ContractError(
      'hold_authority_verifier_required',
      `${stepRecord.key} requires a privileged immutable hold-authority verifier.`,
    );
  }
  assertNoForbiddenData(authority, 'hold-release authority');
  assertCanonicalJsonValue(authority, 'hold-release authority');
  assertExactObjectKeys(
    authority,
    [
      'schemaVersion',
      'authorityId',
      'keyId',
      'approvalRef',
      'scope',
      'action',
      'releasedAction',
      'approvedBy',
      'approvedRole',
      'issuedAt',
      'expiresAt',
      'revocation',
      'signatureBase64',
    ],
    'hold-release authority',
  );
  const { signatureBase64, ...body } = clone(authority);
  if (body.schemaVersion !== HOLD_AUTHORITY_SCHEMA_VERSION) {
    throw new ContractError(
      'hold_authority_schema_invalid',
      `Hold-release authority schema must be ${HOLD_AUTHORITY_SCHEMA_VERSION}.`,
    );
  }
  if (body.keyId !== verifierState.keyId) {
    throw new ContractError(
      'hold_authority_key_invalid',
      'Hold-release authority key is not trusted by the configured verifier.',
    );
  }
  const signature = decodeCanonicalEd25519Signature(signatureBase64);
  let signatureValid = false;
  try {
    signatureValid = verifySignature(
      null,
      Buffer.from(stableStringify(body), 'utf8'),
      verifierState.publicKey,
      signature,
    );
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) {
    throw new ContractError(
      'hold_authority_signature_invalid',
      'Hold-release authority signature is invalid.',
    );
  }
  const scope = body.scope;
  assertExactObjectKeys(
    scope,
    [
      'tenantId',
      'publicationId',
      'releaseId',
      'artifactId',
      'jobId',
      'planHash',
      'stepKey',
    ],
    'hold-release authority scope',
  );
  if (
    !scope ||
    scope.tenantId !== job.tenantId ||
    scope.publicationId !== job.publicationId ||
    scope.releaseId !== job.releaseId ||
    scope.artifactId !== job.artifactId ||
    scope.jobId !== job.jobId ||
    scope.planHash !== job.planHash ||
    scope.stepKey !== stepRecord.key ||
    stableRequirementScope(scope) !== stableRequirementScope(requirement.scope)
  ) {
    throw new ContractError(
      'hold_authority_scope_invalid',
      'Hold-release authority scope does not match the held step.',
    );
  }
  if (
    body.action !== requirement.action ||
    body.releasedAction !== requirement.onReleaseAction ||
    body.approvalRef !== requirement.approvalRef ||
    body.approvedRole !== Role.SuperAdmin ||
    actor.role !== Role.SuperAdmin ||
    body.approvedBy !== actor.actorId
  ) {
    throw new ContractError(
      'hold_authority_action_invalid',
      'Hold-release authority action, approval reference, or role is invalid.',
    );
  }
  assertExactObjectKeys(
    body.revocation,
    ['status', 'snapshotId'],
    'hold-release authority revocation',
  );
  if (
    body.revocation.status !== 'ACTIVE' ||
    body.revocation.snapshotId !== verifierState.revocationSnapshotId ||
    verifierState.revokedAuthorityIds.has(body.authorityId)
  ) {
    throw new ContractError(
      'hold_authority_revoked',
      'Hold-release authority is inactive, revoked, or bound to a stale revocation snapshot.',
    );
  }
  const issuedAt = Date.parse(body.issuedAt);
  const expiresAt = Date.parse(body.expiresAt);
  const now = Date.now();
  if (
    !Number.isFinite(issuedAt) ||
    !Number.isFinite(expiresAt) ||
    new Date(issuedAt).toISOString() !== body.issuedAt ||
    new Date(expiresAt).toISOString() !== body.expiresAt ||
    issuedAt > now ||
    expiresAt <= now ||
    expiresAt <= issuedAt ||
    expiresAt - issuedAt > requirement.maxValiditySeconds * 1000
  ) {
    throw new ContractError(
      'hold_authority_expiry_invalid',
      'Hold-release authority is not currently valid or exceeds its bounded lifetime.',
    );
  }
  assertSafeIdentifier(body.authorityId, 'hold authority.authorityId');
  assertSafeIdentifier(body.keyId, 'hold authority.keyId');
  assertSafeIdentifier(body.approvedBy, 'hold authority.approvedBy');
  assertSafeIdentifier(body.approvalRef, 'hold authority.approvalRef');
  assertSafeIdentifier(
    body.revocation.snapshotId,
    'hold authority.revocation.snapshotId',
  );
  return immutable({
    authority: clone(authority),
    authorityId: body.authorityId,
    authoritySha256: canonicalDigest(authority),
    verifierKeyId: verifierState.keyId,
    revocationSnapshotId: verifierState.revocationSnapshotId,
    releasedAction: body.releasedAction,
  });
}

function stableRequirementScope(scope) {
  return `${scope.tenantId}\n${scope.publicationId}\n${scope.releaseId}\n${scope.stepKey}`;
}

function normalizeSuppliedAuthorityForReplay(authority) {
  if (!authority || typeof authority !== 'object' || Array.isArray(authority)) {
    throw new ContractError(
      'hold_authority_required',
      'A structured hold-release authority is required for this replay.',
    );
  }
  const authorityId = assertSafeIdentifier(
    authority.authorityId,
    'hold authority.authorityId',
  );
  return {
    authorityId,
    authoritySha256: canonicalDigest(authority),
    releasedAction:
      authority.releasedAction === 'execute' ||
      authority.releasedAction === 'verify'
        ? authority.releasedAction
        : null,
  };
}

function decodeCanonicalEd25519Signature(value) {
  if (
    typeof value !== 'string' ||
    !/^[A-Za-z0-9+/]{86}==$/.test(value)
  ) {
    throw new ContractError(
      'hold_authority_signature_invalid',
      'Hold-release authority signature must be canonical Ed25519 base64.',
    );
  }
  const bytes = Buffer.from(value, 'base64');
  if (
    bytes.length !== 64 ||
    bytes.toString('base64') !== value
  ) {
    throw new ContractError(
      'hold_authority_signature_invalid',
      'Hold-release authority signature must be canonical Ed25519 base64.',
    );
  }
  return bytes;
}

function initializePublicationJobStoreRoot(
  storeRoot,
  repositoryRoot,
) {
  if (
    typeof storeRoot !== 'string' ||
    !path.isAbsolute(storeRoot) ||
    typeof repositoryRoot !== 'string' ||
    !path.isAbsolute(repositoryRoot)
  ) {
    throw new ContractError(
      'job_store_path_invalid',
      'Publication-job store and repository roots must be absolute paths.',
    );
  }
  const normalizedStoreRoot = path.resolve(storeRoot);
  const normalizedRepositoryRoot = path.resolve(repositoryRoot);
  let repositoryRealPath;
  try {
    repositoryRealPath = fs.realpathSync(
      normalizedRepositoryRoot,
    );
  } catch {
    throw new ContractError(
      'job_store_repository_invalid',
      'Publication-job store requires an existing repository root.',
    );
  }
  if (
    isSameOrDescendantPath(
      repositoryRealPath,
      normalizedStoreRoot,
    )
  ) {
    throw new ContractError(
      'job_store_inside_repository',
      'The durable publication-job store must be outside the repository.',
    );
  }
  fs.mkdirSync(normalizedStoreRoot, {
    recursive: true,
    mode: 0o700,
  });
  assertRegularJobStoreDirectory(
    normalizedStoreRoot,
    'publication job store root',
  );
  const storeRealPath = fs.realpathSync(normalizedStoreRoot);
  if (
    !sameFilesystemPath(
      normalizedStoreRoot,
      storeRealPath,
    ) ||
    isSameOrDescendantPath(
      repositoryRealPath,
      storeRealPath,
    )
  ) {
    throw new ContractError(
      'job_store_path_invalid',
      'Publication-job store paths cannot traverse links or resolve inside the repository.',
    );
  }
  return storeRealPath;
}

function requirePublicationJobStore(jobStore) {
  const selected =
    jobStore ?? ACTIVE_PUBLICATION_JOB_STORE;
  if (!PUBLICATION_JOB_STORE_INSTANCES.has(selected)) {
    throw new ContractError(
      'job_store_required',
      'Held publication-job transitions require the configured durable current-head and authority-consumption store.',
    );
  }
  return selected;
}

function ensurePublicationJobStoreCurrent(jobStore, job) {
  try {
    return jobStore.assertCurrent(job);
  } catch (error) {
    if (error?.code !== 'job_store_uninitialized') {
      throw error;
    }
    return jobStore.initialize(job);
  }
}

function ensurePrivateJobStoreDirectory(root, name) {
  const target = path.join(root, name);
  fs.mkdirSync(target, { recursive: true, mode: 0o700 });
  assertRegularJobStoreDirectory(
    target,
    `publication job store ${name}`,
  );
  const realTarget = fs.realpathSync(target);
  if (
    !sameFilesystemPath(target, realTarget) ||
    !isSameOrDescendantPath(root, realTarget) ||
    sameFilesystemPath(root, realTarget)
  ) {
    throw new ContractError(
      'job_store_path_invalid',
      `Publication-job store ${name} directory is not an exact private child.`,
    );
  }
  return realTarget;
}

function assertRegularJobStoreDirectory(target, label) {
  let stats;
  try {
    stats = fs.lstatSync(target);
  } catch {
    throw new ContractError(
      'job_store_path_invalid',
      `${label} is unavailable.`,
    );
  }
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    throw new ContractError(
      'job_store_path_invalid',
      `${label} must be a regular directory without links.`,
    );
  }
}

function publicationJobHeadRecord({
  job,
  revision,
  predecessorJobIntegritySha256,
}) {
  const body = {
    schemaVersion: JOB_HEAD_SCHEMA_VERSION,
    jobId: job.jobId,
    revision,
    predecessorJobIntegritySha256,
    jobIntegritySha256: job.integritySha256,
    job: clone(job),
  };
  return {
    ...body,
    recordSha256: canonicalDigest(body),
  };
}

function publicationJobHeadFileName(record) {
  return (
    `${String(record.revision).padStart(8, '0')}-` +
    `${record.jobIntegritySha256}.json`
  );
}

function transitionAddsHeldAuthority(previousJob, nextJob) {
  return nextJob.steps.some((nextStep, index) => {
    const previousStep = previousJob.steps[index];
    return nextStep.resumes
      .slice(previousStep.resumes.length)
      .some((resume) => resume.holdAuthorityId !== null);
  });
}

function inspectVerifiedStaleJobStoreLock(filePath, label) {
  const evidence = readStableJobStoreFileEvidence(
    filePath,
    label,
  );
  const text = evidence.bytes.toString('utf8');
  if (!/^[1-9]\d*\n$/.test(text)) {
    throw new ContractError(
      'job_store_reconciliation_required',
      `${label} has unknown or malformed ownership evidence.`,
    );
  }
  const pid = Number(text.trim());
  if (
    !Number.isSafeInteger(pid) ||
    pid <= 0 ||
    pid > 2_147_483_647
  ) {
    throw new ContractError(
      'job_store_reconciliation_required',
      `${label} contains an invalid process identifier.`,
    );
  }
  assertJobStoreProcessDefinitelyStopped(pid, label);
  return { ...evidence, pid };
}

function removeVerifiedStaleReconciliationLockIfPresent(
  lockPath,
) {
  if (!jobStorePathEntryExists(lockPath)) return;
  const evidence = inspectVerifiedStaleJobStoreLock(
    lockPath,
    'publication-job reconciliation lock',
  );
  assertJobStoreFileEvidenceUnchanged(
    lockPath,
    evidence,
    'publication-job reconciliation lock',
  );
  fs.unlinkSync(lockPath);
  syncJobStoreDirectory(path.dirname(lockPath));
}

function createDurableJobStoreProcessLock(lockPath) {
  let descriptor;
  let created = false;
  try {
    descriptor = fs.openSync(
      lockPath,
      fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        fs.constants.O_WRONLY,
      0o600,
    );
    created = true;
    fs.writeFileSync(
      descriptor,
      `${process.pid}\n`,
      'utf8',
    );
    fs.fsyncSync(descriptor);
    syncJobStoreDirectory(path.dirname(lockPath));
    return descriptor;
  } catch (error) {
    if (descriptor !== undefined) {
      fs.closeSync(descriptor);
    }
    if (created) {
      try {
        fs.unlinkSync(lockPath);
        syncJobStoreDirectory(path.dirname(lockPath));
      } catch (cleanupError) {
        if (cleanupError?.code !== 'ENOENT') {
          throw cleanupError;
        }
      }
    }
    if (error?.code === 'EEXIST') {
      throw new ContractError(
        'job_store_reconciliation_required',
        'Publication-job interruption reconciliation is already claimed.',
      );
    }
    throw error;
  }
}

function assertJobStoreProcessDefinitelyStopped(pid, label) {
  try {
    process.kill(pid, 0);
  } catch (error) {
    if (error?.code === 'ESRCH') return;
    throw new ContractError(
      'job_store_reconciliation_required',
      `${label} owner cannot be proven stopped.`,
      { reasonCode: error?.code ?? 'unknown' },
    );
  }
  throw new ContractError(
    'job_store_reconciliation_required',
    `${label} owner is still active.`,
  );
}

function readStableJobStoreFileEvidence(
  filePath,
  label,
  { requireSingleLink = true } = {},
) {
  let before;
  let bytes;
  let after;
  try {
    before = fs.lstatSync(filePath, { bigint: true });
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      (requireSingleLink && before.nlink !== 1n)
    ) {
      throw new ContractError(
        'job_store_reconciliation_required',
        `${label} is not an exclusive regular file.`,
      );
    }
    bytes = fs.readFileSync(filePath);
    after = fs.lstatSync(filePath, { bigint: true });
  } catch (error) {
    if (error instanceof ContractError) throw error;
    throw new ContractError(
      'job_store_reconciliation_required',
      `${label} is unavailable or unstable.`,
      { reasonCode: error?.code ?? 'unknown' },
    );
  }
  if (
    !after.isFile() ||
    after.isSymbolicLink() ||
    (requireSingleLink && after.nlink !== 1n) ||
    !jobStoreFileStatsEqual(before, after)
  ) {
    throw new ContractError(
      'job_store_reconciliation_required',
      `${label} changed while it was inspected.`,
    );
  }
  return {
    bytes,
    device: before.dev,
    inode: before.ino,
    mode: before.mode,
    links: before.nlink,
    size: before.size,
    modifiedNanoseconds: before.mtimeNs,
    changedNanoseconds: before.ctimeNs,
  };
}

function assertJobStoreFileEvidenceUnchanged(
  filePath,
  expected,
  label,
) {
  const observed = readStableJobStoreFileEvidence(
    filePath,
    label,
    { requireSingleLink: false },
  );
  if (
    observed.device !== expected.device ||
    observed.inode !== expected.inode ||
    observed.mode !== expected.mode ||
    observed.links !== expected.links ||
    observed.size !== expected.size ||
    observed.modifiedNanoseconds !==
      expected.modifiedNanoseconds ||
    observed.changedNanoseconds !==
      expected.changedNanoseconds ||
    !observed.bytes.equals(expected.bytes)
  ) {
    throw new ContractError(
      'job_store_reconciliation_required',
      `${label} no longer matches the verified stale evidence.`,
    );
  }
}

function jobStoreFileStatsEqual(left, right) {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs
  );
}

function parseImmutableJobStoreTemporaryName(fileName) {
  const match =
    /^\.(.+\.json)\.([1-9]\d*)\.([a-f0-9]{24})\.tmp$/.exec(
      fileName,
    );
  if (!match) return null;
  const pid = Number(match[2]);
  if (
    !Number.isSafeInteger(pid) ||
    pid <= 0 ||
    pid > 2_147_483_647
  ) {
    return null;
  }
  return {
    targetFileName: match[1],
    pid,
  };
}

function inspectImmutableJobStoreRecordRecovery(
  filePath,
  expectedRecord,
) {
  const directory = path.dirname(filePath);
  const targetFileName = path.basename(filePath);
  const expectedBytes = Buffer.from(
    `${stableStringify(expectedRecord)}\n`,
    'utf8',
  );
  let finalEvidence = null;
  if (jobStorePathEntryExists(filePath)) {
    finalEvidence = readStableJobStoreFileEvidence(
      filePath,
      'publication-job immutable record',
      { requireSingleLink: false },
    );
    if (!finalEvidence.bytes.equals(expectedBytes)) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'An immutable publication-job record conflicts with the verified transition witness.',
      );
    }
  }
  const candidateNames = fs
    .readdirSync(directory)
    .filter((name) =>
      name.startsWith(`.${targetFileName}.`),
    );
  if (candidateNames.length > 1) {
    throw new ContractError(
      'job_store_reconciliation_required',
      'Multiple orphan temporary records make interruption evidence ambiguous.',
    );
  }
  let temporaryEvidence = null;
  let temporaryPath = null;
  if (candidateNames.length === 1) {
    const temporaryName = candidateNames[0];
    const parsed =
      parseImmutableJobStoreTemporaryName(temporaryName);
    if (
      parsed === null ||
      parsed.targetFileName !== targetFileName
    ) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'An orphan temporary record has unknown ownership or destination evidence.',
      );
    }
    assertJobStoreProcessDefinitelyStopped(
      parsed.pid,
      'publication-job orphan temporary record',
    );
    temporaryPath = path.join(directory, temporaryName);
    temporaryEvidence = readStableJobStoreFileEvidence(
      temporaryPath,
      'publication-job orphan temporary record',
      { requireSingleLink: false },
    );
    if (!temporaryEvidence.bytes.equals(expectedBytes)) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'An orphan temporary record does not match the verified transition witness.',
      );
    }
  }
  if (
    finalEvidence !== null &&
    temporaryEvidence !== null
  ) {
    const sameInode =
      finalEvidence.device === temporaryEvidence.device &&
      finalEvidence.inode === temporaryEvidence.inode;
    if (
      !sameInode ||
      finalEvidence.links !== 2n ||
      temporaryEvidence.links !== 2n
    ) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'Immutable record link evidence is ambiguous.',
      );
    }
  } else {
    const onlyEvidence =
      finalEvidence ?? temporaryEvidence;
    if (onlyEvidence !== null && onlyEvidence.links !== 1n) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'An immutable record has unpaired hard-link evidence.',
      );
    }
  }
  return {
    state:
      finalEvidence !== null
        ? 'PRESENT'
        : temporaryEvidence !== null
          ? 'TEMPORARY'
          : 'ABSENT',
    filePath,
    finalEvidence,
    temporaryPath,
    temporaryEvidence,
    expectedBytes,
  };
}

function jobStorePathEntryExists(filePath) {
  try {
    fs.lstatSync(filePath);
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

function publishRecoveredImmutableJobStoreRecord(
  evidence,
) {
  if (evidence.state === 'ABSENT') {
    throw new ContractError(
      'job_store_reconciliation_required',
      'Missing immutable evidence cannot be published during reconciliation.',
    );
  }
  if (evidence.finalEvidence !== null) {
    assertJobStoreFileEvidenceUnchanged(
      evidence.filePath,
      evidence.finalEvidence,
      'publication-job immutable record',
    );
  }
  if (evidence.temporaryEvidence === null) return;
  assertJobStoreFileEvidenceUnchanged(
    evidence.temporaryPath,
    evidence.temporaryEvidence,
    'publication-job orphan temporary record',
  );
  if (evidence.finalEvidence === null) {
    try {
      fs.linkSync(
        evidence.temporaryPath,
        evidence.filePath,
      );
    } catch (error) {
      if (error?.code !== 'EEXIST') throw error;
    }
    const committed = readStableJobStoreFileEvidence(
      evidence.filePath,
      'recovered publication-job immutable record',
      { requireSingleLink: false },
    );
    if (!committed.bytes.equals(evidence.expectedBytes)) {
      throw new ContractError(
        'job_store_reconciliation_required',
        'Recovered immutable publication-job evidence failed exact readback.',
      );
    }
  }
  fs.unlinkSync(evidence.temporaryPath);
  syncJobStoreDirectory(path.dirname(evidence.filePath));
  const committed = readStableJobStoreFileEvidence(
    evidence.filePath,
    'recovered publication-job immutable record',
  );
  if (
    committed.links !== 1n ||
    !committed.bytes.equals(evidence.expectedBytes)
  ) {
    throw new ContractError(
      'job_store_reconciliation_required',
      'Recovered immutable publication-job evidence did not settle to one exact durable final link.',
    );
  }
}

function jobStoreLockCanBeReleasedAfterError(error) {
  return new Set([
    'job_store_head_conflict',
    'job_store_uninitialized',
    'job_store_stale_snapshot',
    'job_store_authority_transition_invalid',
    'job_store_authority_consumption_invalid',
    'hold_authority_replay_forbidden',
  ]).has(error?.code);
}

function readPublicationJobHeadRecord(
  filePath,
  fileName,
  expectedJobId,
) {
  const stats = fs.lstatSync(filePath);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    throw new ContractError(
      'job_store_corrupt',
      'A publication-job head record is not a regular file.',
    );
  }
  let record;
  try {
    record = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    throw new ContractError(
      'job_store_corrupt',
      'A publication-job head record is not valid JSON.',
    );
  }
  assertCanonicalJsonValue(
    record,
    'publication job head record',
  );
  assertExactObjectKeys(
    record,
    [
      'schemaVersion',
      'jobId',
      'revision',
      'predecessorJobIntegritySha256',
      'jobIntegritySha256',
      'job',
      'recordSha256',
    ],
    'publication job head record',
    'job_store_corrupt',
  );
  const {
    recordSha256,
    ...body
  } = record;
  const jobBody = openJob(record.job);
  const sealedJob = sealJob(jobBody);
  if (
    record.schemaVersion !== JOB_HEAD_SCHEMA_VERSION ||
    record.jobId !== expectedJobId ||
    !Number.isSafeInteger(record.revision) ||
    record.revision < 0 ||
    (record.revision === 0
      ? record.predecessorJobIntegritySha256 !== null
      : assertSha256(
          record.predecessorJobIntegritySha256,
          'publication job predecessor integrity',
        ) !== record.predecessorJobIntegritySha256) ||
    assertSha256(
      record.jobIntegritySha256,
      'publication job head integrity',
    ) !== sealedJob.integritySha256 ||
    assertSha256(
      recordSha256,
      'publication job head recordSha256',
    ) !== canonicalDigest(body) ||
    fileName !==
      `${String(record.revision).padStart(8, '0')}-` +
        `${record.jobIntegritySha256}.json`
  ) {
    throw new ContractError(
      'job_store_corrupt',
      'A publication-job head record cannot be rederived.',
    );
  }
  return immutable({
    ...record,
    job: sealedJob,
  });
}

function writeImmutableJobStoreRecord(filePath, record) {
  const directory = path.dirname(filePath);
  assertRegularJobStoreDirectory(
    directory,
    'publication job store record directory',
  );
  const temporaryPath = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.` +
      `${randomBytes(12).toString('hex')}.tmp`,
  );
  let descriptor;
  try {
    descriptor = fs.openSync(
      temporaryPath,
      fs.constants.O_CREAT |
        fs.constants.O_EXCL |
        fs.constants.O_WRONLY,
      0o600,
    );
    fs.writeFileSync(
      descriptor,
      `${stableStringify(record)}\n`,
      'utf8',
    );
    fs.fsyncSync(descriptor);
    fs.closeSync(descriptor);
    descriptor = undefined;
    fs.linkSync(temporaryPath, filePath);
    fs.unlinkSync(temporaryPath);
    syncJobStoreDirectory(directory);
  } catch (error) {
    if (descriptor !== undefined) {
      fs.closeSync(descriptor);
    }
    try {
      fs.unlinkSync(temporaryPath);
    } catch (cleanupError) {
      if (cleanupError?.code !== 'ENOENT') throw cleanupError;
    }
    if (error?.code === 'EEXIST') {
      throw new ContractError(
        'job_store_immutable_conflict',
        'An immutable publication-job store record already exists.',
      );
    }
    throw error;
  }
}

function syncJobStoreDirectory(directory) {
  let descriptor;
  try {
    descriptor = fs.openSync(directory, fs.constants.O_RDONLY);
    fs.fsyncSync(descriptor);
  } catch (error) {
    if (
      !['EINVAL', 'ENOTSUP', 'EPERM', 'EISDIR'].includes(
        error?.code,
      )
    ) {
      throw error;
    }
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

function isSameOrDescendantPath(root, target) {
  const relative = path.relative(root, target);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
}

function sameFilesystemPath(left, right) {
  const normalizedLeft = path.resolve(left);
  const normalizedRight = path.resolve(right);
  return process.platform === 'win32'
    ? normalizedLeft.toLowerCase() ===
        normalizedRight.toLowerCase()
    : normalizedLeft === normalizedRight;
}

function assertExactObjectKeys(
  value,
  expectedKeys,
  label,
  code = 'hold_authority_shape_invalid',
) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ContractError(
      code,
      `${label} must be an object.`,
    );
  }
  const expected = new Set(expectedKeys);
  const actual = Object.keys(value);
  if (
    actual.length !== expected.size ||
    actual.some((key) => !expected.has(key))
  ) {
    throw new ContractError(
      code,
      `${label} fields are invalid.`,
    );
  }
}

function assertAllowedObjectKeys(value, allowedKeys, label, code) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ContractError(code, `${label} must be an object.`);
  }
  const allowed = new Set(allowedKeys);
  const unknown = Object.keys(value).filter((key) => !allowed.has(key));
  if (unknown.length > 0) {
    throw new ContractError(
      code,
      `${label} contains unsupported fields: ${unknown.join(', ')}.`,
    );
  }
}

function assertCanonicalJsonValue(value, label, seen = new Set()) {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'boolean'
  ) {
    return;
  }
  if (typeof value === 'number') {
    if (Number.isFinite(value) && !Object.is(value, -0)) return;
    throw new ContractError(
      'job_json_value_invalid',
      `${label} contains a non-canonical JSON number.`,
    );
  }
  if (
    value === undefined ||
    typeof value === 'bigint' ||
    typeof value === 'function' ||
    typeof value === 'symbol'
  ) {
    throw new ContractError(
      'job_json_value_invalid',
      `${label} contains a non-JSON value.`,
    );
  }
  if (typeof value !== 'object') {
    throw new ContractError(
      'job_json_value_invalid',
      `${label} contains an unsupported value.`,
    );
  }
  if (seen.has(value)) {
    throw new ContractError(
      'job_json_value_invalid',
      `${label} contains a cyclic reference.`,
    );
  }
  if (
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) !== Object.prototype &&
    Object.getPrototypeOf(value) !== null
  ) {
    throw new ContractError(
      'job_json_value_invalid',
      `${label} must contain only plain JSON objects.`,
    );
  }
  seen.add(value);
  if (Array.isArray(value)) {
    for (let index = 0; index < value.length; index += 1) {
      if (!Object.hasOwn(value, index)) {
        throw new ContractError(
          'job_json_value_invalid',
          `${label} contains a sparse array.`,
        );
      }
      assertCanonicalJsonValue(value[index], `${label}[${index}]`, seen);
    }
  } else {
    if (
      Reflect.ownKeys(value).length !== Object.keys(value).length ||
      Object.values(Object.getOwnPropertyDescriptors(value)).some(
        (descriptor) =>
          descriptor.get ||
          descriptor.set ||
          descriptor.enumerable !== true,
      )
    ) {
      throw new ContractError(
        'job_json_value_invalid',
        `${label} must contain only enumerable JSON data fields.`,
      );
    }
    for (const [key, child] of Object.entries(value)) {
      assertCanonicalJsonValue(child, `${label}.${key}`, seen);
    }
  }
  seen.delete(value);
}
