import { readJson } from '../utils/json-writer.mjs';
import { resolveFixturePath, resolvePackagePath } from '../utils/safe-paths.mjs';

const defaultExpectedCountsPath = 'fixtures/restore-expected-counts.json';

export async function loadExpectedRestoreCounts(expectedCountsPath = defaultExpectedCountsPath) {
  const expectedPath = expectedCountsPath === defaultExpectedCountsPath
    ? resolveFixturePath(expectedCountsPath)
    : resolvePackagePath(expectedCountsPath);
  return readJson(expectedPath);
}

export function compareRestoreCounts({ manifest, actualCounts, expectedCounts }) {
  const key = manifest.scope?.scopeType === 'tenant' ? `tenant:${manifest.scope.tenantKey}` : 'platform';
  const expectedEntry = expectedCounts.expectedByScope?.[key];
  if (!expectedEntry) {
    return {
      status: 'failed',
      key,
      failures: [
        {
          code: 'EXPECTED_COUNTS_MISSING',
          path: 'fixtures/restore-expected-counts.json',
          message: `expected restore counts missing for ${key}`
        }
      ],
      comparisons: []
    };
  }

  const comparisons = Object.entries(expectedEntry.counts).map(([name, expected]) => {
    const actual = actualCounts[name];
    return {
      name,
      expected,
      actual,
      status: actual === expected ? 'passed' : 'failed'
    };
  });
  const failures = comparisons
    .filter((comparison) => comparison.status !== 'passed')
    .map((comparison) => ({
      code: 'RESTORE_COUNT_MISMATCH',
      path: comparison.name,
      message: `expected ${comparison.expected}, got ${comparison.actual}`
    }));

  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    key,
    expectedScope: expectedEntry.scope,
    failures,
    comparisons
  };
}
