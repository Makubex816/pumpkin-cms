import fs from 'node:fs/promises';
import { readJson } from './utils/json-writer.mjs';
import { resolveFixturePath, resolvePackagePath } from './utils/safe-paths.mjs';

const validScopeTypes = new Set(['tenant', 'platform']);

export async function loadBackupAnswers(answersPath) {
  const resolvedPath = resolvePackagePath(answersPath);
  const answers = await readJson(resolvedPath);
  return { answers, answersPath: resolvedPath };
}

export async function resolveBackupRequest({ answersPath, scopeOverride }) {
  const { answers, answersPath: resolvedAnswersPath } = await loadBackupAnswers(answersPath);
  const scope = normalizeScope(answers.scope, scopeOverride);
  const fixtureRefs = normalizeFixtureRefs(answers.fixtureRefs ?? {});

  return {
    backupName: answers.backupName ?? `${scope.scopeType}-standard-backup`,
    requestedBy: answers.requestedBy ?? 'local-prototype',
    retentionClass: answers.retentionClass ?? 'pre_write',
    scope,
    fixtureRefs,
    answersPath: resolvedAnswersPath
  };
}

export function normalizeScope(scope, scopeOverride) {
  if (!scope || typeof scope !== 'object') {
    throw new Error('answers.scope is required');
  }
  const scopeType = scopeOverride ?? scope.scopeType;
  if (!validScopeTypes.has(scopeType)) {
    throw new Error(`unsupported scope: ${scopeType}`);
  }
  if (scope.scopeType && scope.scopeType !== scopeType) {
    throw new Error(`scope override ${scopeType} does not match answers scope ${scope.scopeType}`);
  }
  if (scopeType === 'tenant' && !scope.tenantKey) {
    throw new Error('tenant scope requires scope.tenantKey');
  }
  return {
    scopeType,
    tenantKey: scope.tenantKey ?? null,
    siteKey: scope.siteKey ?? null
  };
}

function normalizeFixtureRefs(refs) {
  const defaults = {
    cmsContent: 'fixtures/fake-cms-content.json',
    mediaInventory: 'fixtures/fake-media-inventory.json',
    staticEvidence: 'fixtures/fake-static-evidence.json',
    configInventory: 'fixtures/fake-config-inventory.redacted.json'
  };
  return Object.fromEntries(
    Object.entries({ ...defaults, ...refs }).map(([key, value]) => [key, resolveFixturePath(value)])
  );
}

export async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
