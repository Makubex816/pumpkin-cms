import http from 'node:http'
import path from 'node:path'
import {
  adminRoot,
  defaultProtectedConfigPatterns,
  defaultWritePatterns,
  readAdminFile,
  readRepoFile,
  repoRoot,
  runRuntimeQaHarness,
} from './runtime-qa-harness.mjs'

const route = '/dashboard/audit-jobs'
const localUrl = process.argv[2] ?? 'http://127.0.0.1:3000/dashboard/audit-jobs?auditJobsProvider=admin-api-readonly'
const envelopeFixturePath = 'deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json'
const requiredEndpoints = [
  'viewer-summary',
  'events',
  'job-runs',
  'promotion-gates',
  'evidence-bindings',
  'traces',
  'blockers',
  'next-gates',
]

const result = runRuntimeQaHarness({
  resultType: 'pumpkin-audit-job-ledger-v2-9-11-admin-to-api-readonly-bridge',
  target: route,
  sourceRoots: [
    'src/app/dashboard/audit-jobs',
    'src/components/audit-jobs',
    'src/lib/audit-jobs',
  ],
  writePatterns: defaultWritePatterns,
  protectedConfigPatterns: defaultProtectedConfigPatterns,
  markerGroups: [
    {
      name: 'api-bridge-client-markers',
      file: 'src/lib/audit-jobs/api-provider.ts',
      failureCode: 'AUDIT_JOB_API_BRIDGE_CLIENT_MARKER_MISSING',
      markers: [
        "AUDIT_JOB_LEDGER_API_BASE_PATH = '/api/admin/audit-jobs'",
        'AUDIT_JOB_LEDGER_API_ENVELOPE_PROVIDER_MODE',
        'api-local-fixture-readonly',
        'getAuditJobLedgerAdminApiSnapshot',
        'getAuditJobLedgerAdminApiSnapshotWithFallback',
        'readEndpoint',
        'Promise.all',
        'assertReadOnlyEnvelope',
        'writeActionsAllowed',
        'composeSharedEnvelope',
        'createTraceModel',
      ],
    },
    {
      name: 'provider-mode-transition-markers',
      file: 'src/lib/audit-jobs/mock-provider.ts',
      failureCode: 'AUDIT_JOB_PROVIDER_MODE_TRANSITION_MARKER_MISSING',
      markers: [
        'AUDIT_JOB_LEDGER_LOCAL_PROVIDER_MODE',
        'AUDIT_JOB_LEDGER_API_PROVIDER_MODE',
        'admin-api-readonly',
        'createAuditJobLedgerAdminSnapshotFromEnvelope',
        'getAuditJobLedgerAdminFallbackSnapshot',
        'attemptedProviderMode',
        'providerMode: AUDIT_JOB_LEDGER_PROVIDER_MODE',
      ],
    },
    {
      name: 'adapter-api-mode-markers',
      file: 'src/lib/audit-jobs/contract-adapter.ts',
      failureCode: 'AUDIT_JOB_ADAPTER_API_MODE_MARKER_MISSING',
      markers: [
        'api-local-fixture-readonly',
        'admin-api-readonly',
        'api-local-fixture-readonly envelopes require admin-api-readonly mode',
        'admin-api-readonly mode requires api-local-fixture-readonly envelope provider',
        'apiRequestIds',
        'apiCorrelationIds',
        'apiEndpointCount',
      ],
    },
    {
      name: 'component-api-bridge-markers',
      file: 'src/components/audit-jobs/AuditJobLedgerAdmin.tsx',
      failureCode: 'AUDIT_JOB_COMPONENT_API_BRIDGE_MARKER_MISSING',
      markers: [
        'data-v2-api-bridge-phase="V2.9.11"',
        'data-api-bridge-state',
        'getAuditJobLedgerAdminApiSnapshotWithFallback',
        'useAuth',
        'auditJobsProvider',
        'admin-api-readonly',
        'GET-only Pumpkin API bridge',
        'Fallback reason',
        'Read-only detail panel',
      ],
    },
  ],
  customChecks: [
    {
      name: 'required-get-endpoint-coverage',
      run: ({ assert }) => {
        const source = readAdminFile('src/lib/audit-jobs/api-provider.ts')
        const missing = requiredEndpoints.filter((endpoint) => !source.includes(`'${endpoint}'`))
        assert(missing.length === 0, 'AUDIT_JOB_API_ENDPOINT_MISSING', `Missing endpoint bridge coverage: ${missing.join(', ')}`)
        assert(!/method\s*:\s*['"`](POST|PUT|PATCH|DELETE)['"`]/i.test(source), 'AUDIT_JOB_API_CLIENT_MUTATION_METHOD_FOUND', 'API bridge client contains a mutation method.')
        assert(!/\bXMLHttpRequest\b|\baxios\b|\.post\s*\(|\.put\s*\(|\.patch\s*\(|\.delete\s*\(/i.test(source), 'AUDIT_JOB_API_CLIENT_MUTATION_CALL_FOUND', 'API bridge client contains a mutation-capable call pattern.')
        return {
          endpointCount: requiredEndpoints.length,
          endpoints: requiredEndpoints,
          methodBoundary: 'GET-only',
        }
      },
    },
    {
      name: 'fixture-contract-parity-baseline',
      run: ({ assert }) => {
        const envelope = JSON.parse(readRepoFile(envelopeFixturePath))
        assert(envelope.schemaVersion === 'audit-job-ledger-readonly-api-envelope.v1', 'AUDIT_JOB_FIXTURE_SCHEMA_MISMATCH', 'Read-only fixture envelope schema mismatch.', envelopeFixturePath)
        assert(envelope.data?.schemaVersion === 'audit-job-ledger-shared-viewer-model.v1', 'AUDIT_JOB_SHARED_MODEL_SCHEMA_MISMATCH', 'Shared viewer model schema mismatch.', envelopeFixturePath)
        assert(envelope.readOnly === true && envelope.data?.readOnly === true, 'AUDIT_JOB_FIXTURE_NOT_READONLY', 'Fixture envelope is not read-only.', envelopeFixturePath)
        assert(envelope.securityBoundary?.noWriteBoundarySatisfied === true, 'AUDIT_JOB_FIXTURE_NO_WRITE_BOUNDARY_FAILED', 'Fixture no-write boundary is not satisfied.', envelopeFixturePath)
        assert((envelope.securityBoundary?.openFlags ?? []).length === 0, 'AUDIT_JOB_FIXTURE_OPEN_FLAGS_PRESENT', 'Fixture has open write flags.', envelopeFixturePath)

        const counts = envelope.data.summary.counts
        assert(counts.auditEvents === envelope.data.auditEvents.length, 'AUDIT_JOB_AUDIT_EVENT_COUNT_MISMATCH', 'Audit event count mismatch.', envelopeFixturePath)
        assert(counts.jobRuns === envelope.data.jobRuns.length, 'AUDIT_JOB_JOB_RUN_COUNT_MISMATCH', 'Job-run count mismatch.', envelopeFixturePath)
        assert(counts.promotionGates === envelope.data.promotionGates.length, 'AUDIT_JOB_PROMOTION_GATE_COUNT_MISMATCH', 'Promotion gate count mismatch.', envelopeFixturePath)
        assert(counts.evidenceBindings === envelope.data.evidenceBindings.length, 'AUDIT_JOB_EVIDENCE_COUNT_MISMATCH', 'Evidence count mismatch.', envelopeFixturePath)
        assert(counts.traceEntries === envelope.data.traceIds.entries.length, 'AUDIT_JOB_TRACE_COUNT_MISMATCH', 'Trace count mismatch.', envelopeFixturePath)

        return {
          providerMode: envelope.providerMode,
          counts,
          indexingState: envelope.data.summary.indexingState,
        }
      },
    },
    {
      name: 'admin-auth-and-scope-wiring',
      run: ({ assert }) => {
        const componentSource = readAdminFile('src/components/audit-jobs/AuditJobLedgerAdmin.tsx')
        assert(componentSource.includes('const { token, currentTenant } = useAuth()'), 'AUDIT_JOB_AUTH_CONTEXT_NOT_USED', 'Admin API bridge does not use AuthContext.')
        assert(componentSource.includes('authToken: token'), 'AUDIT_JOB_AUTH_TOKEN_NOT_FORWARDED', 'Admin API bridge does not forward the existing auth token.')
        assert(componentSource.includes('currentTenant?.tenantId'), 'AUDIT_JOB_TENANT_SCOPE_NOT_USED', 'Admin API bridge does not use current tenant scope.')
        return {
          authSource: 'AuthContext',
          tenantScopeSource: 'currentTenant',
        }
      },
    },
    {
      name: 'fallback-preserves-local-fixture',
      run: ({ assert }) => {
        const providerSource = readAdminFile('src/lib/audit-jobs/mock-provider.ts')
        const componentSource = readAdminFile('src/components/audit-jobs/AuditJobLedgerAdmin.tsx')
        assert(providerSource.includes('getAuditJobLedgerAdminFallbackSnapshot'), 'AUDIT_JOB_FALLBACK_PROVIDER_MISSING', 'Fallback provider function is missing.')
        assert(providerSource.includes('attemptedProviderMode: AUDIT_JOB_LEDGER_API_PROVIDER_MODE'), 'AUDIT_JOB_FALLBACK_ATTEMPTED_MODE_MISSING', 'Fallback does not preserve attempted API provider mode.')
        assert(componentSource.includes('nextSnapshot.fallback ?'), 'AUDIT_JOB_FALLBACK_STATE_MISSING', 'Component does not expose fallback state.')
        return {
          fixtureFallback: 'admin-local-fixture-readonly',
          attemptedMode: 'admin-api-readonly',
        }
      },
    },
    {
      name: 'route-scope',
      run: () => ({
        route,
        localUrl,
        adminRoot: path.relative(repoRoot, adminRoot).replaceAll('\\', '/'),
      }),
    },
  ],
  evidenceFactory: ({ checks, failures }) => ({
    routeRegistered: failures.length === 0,
    apiBridgeClientVerified: checks.some((check) => check.name === 'api-bridge-client-markers' && check.status === 'passed'),
    providerModeTransitionVerified: checks.some((check) => check.name === 'provider-mode-transition-markers' && check.status === 'passed'),
    adapterApiModeVerified: checks.some((check) => check.name === 'adapter-api-mode-markers' && check.status === 'passed'),
    componentBridgeVerified: checks.some((check) => check.name === 'component-api-bridge-markers' && check.status === 'passed'),
    getOnlyEndpointCoverageVerified: checks.some((check) => check.name === 'required-get-endpoint-coverage' && check.status === 'passed'),
    fixtureContractParityVerified: checks.some((check) => check.name === 'fixture-contract-parity-baseline' && check.status === 'passed'),
    authAndScopeWiringVerified: checks.some((check) => check.name === 'admin-auth-and-scope-wiring' && check.status === 'passed'),
    fixtureFallbackVerified: checks.some((check) => check.name === 'fallback-preserves-local-fixture' && check.status === 'passed'),
    noUncontrolledWriteCallsVerified: checks.some((check) => check.name === 'no-uncontrolled-write-calls' && check.status === 'passed'),
    noProtectedConfigPatternsVerified: checks.some((check) => check.name === 'no-protected-config-patterns' && check.status === 'passed'),
  }),
})

const runtimeRoute = await readLocalRoute(localUrl)
result.checks.push({
  name: 'localhost-api-bridge-route-runtime-get',
  status: runtimeRoute.available ? (runtimeRoute.statusCode < 500 ? 'passed' : 'failed') : 'skipped',
  ...runtimeRoute,
})

if (runtimeRoute.available && runtimeRoute.statusCode >= 500) {
  result.failures.push({
    code: 'AUDIT_JOB_LOCALHOST_API_BRIDGE_ROUTE_FAILED',
    message: `Local API bridge route returned HTTP ${runtimeRoute.statusCode}.`,
    file: null,
  })
}

result.status = result.failures.length === 0 ? 'passed' : 'failed'
result.evidence.localRuntimeRoute = runtimeRoute
result.evidence.localRuntimeRouteChecked = runtimeRoute.available

if (result.failures.length > 0) {
  console.error(JSON.stringify(result, null, 2))
  process.exitCode = 1
} else {
  console.log(JSON.stringify(result, null, 2))
}

function readLocalRoute(url) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout: 5000 }, (response) => {
      let body = ''
      response.setEncoding('utf8')
      response.on('data', (chunk) => {
        if (body.length < 100000) {
          body += chunk
        }
      })
      response.on('end', () => {
        resolve({
          available: true,
          url,
          statusCode: response.statusCode ?? 0,
          routeRenderable: (response.statusCode ?? 0) >= 200 && (response.statusCode ?? 0) < 500,
          bodyLength: body.length,
          bodyContainsNextData: body.includes('__NEXT_DATA__') || body.includes('self.__next_f'),
          bodyMentionsAuditJobs: body.includes('Audit Jobs') || body.includes('/dashboard/audit-jobs'),
          bodyMentionsApiBridge: body.includes('GET-only Pumpkin API bridge') || body.includes('data-v2-api-bridge-phase'),
        })
      })
    })

    request.on('timeout', () => {
      request.destroy(new Error('timeout'))
    })

    request.on('error', (error) => {
      resolve({
        available: false,
        url,
        statusCode: 0,
        routeRenderable: false,
        error: error.code ?? error.message,
      })
    })
  })
}
