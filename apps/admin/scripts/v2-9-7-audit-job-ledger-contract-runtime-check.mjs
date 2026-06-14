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
const localUrl = process.argv[2] ?? 'http://127.0.0.1:3000/dashboard/audit-jobs'
const envelopeFixturePath = 'deployment/architecture/audit-jobs-production-promotion/audit-job-ledger-implementation/fixtures/valid-v2-8-combined-readonly-api-envelope.fixture.json'
const requiredPanels = [
  'Release Summary',
  'Promotion Gates',
  'Job Runs',
  'Audit Events',
  'Evidence Bindings',
  'Trace Explorer',
  'Runtime QA',
  'Resource Registry / Provider Profile',
  'Outbound Link Manager',
  'Backup Center',
  'Indexing Deferred',
  'Blockers and Next Gates',
]

const result = runRuntimeQaHarness({
  resultType: 'pumpkin-audit-job-ledger-v2-9-7-admin-contract-runtime-remediation',
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
      name: 'route-wiring',
      file: 'src/app/dashboard/audit-jobs/page.tsx',
      failureCode: 'AUDIT_JOB_ROUTE_MARKER_MISSING',
      markers: [
        'AuditJobLedgerAdminView',
        'return <AuditJobLedgerAdminView />',
      ],
    },
    {
      name: 'admin-contract-adapter-markers',
      file: 'src/lib/audit-jobs/contract-adapter.ts',
      failureCode: 'AUDIT_JOB_CONTRACT_ADAPTER_MARKER_MISSING',
      markers: [
        'audit-job-ledger-readonly-api-envelope.v1',
        'audit-job-ledger-shared-viewer-model.v1',
        'createAuditJobLedgerAdminModelFromEnvelope',
        'validateAuditJobLedgerEnvelope',
        'admin-local-fixture-readonly',
        'readOnly',
        'providerMode',
        'noWriteBoundarySatisfied',
        'MUTATION_ACTION_NOT_DISABLED',
        'local_next_dev_server_listened_but_timed_out',
      ],
    },
    {
      name: 'readonly-api-envelope-provider-markers',
      file: 'src/lib/audit-jobs/mock-provider.ts',
      failureCode: 'AUDIT_JOB_API_ENVELOPE_PROVIDER_MARKER_MISSING',
      markers: [
        'valid-v2-8-combined-readonly-api-envelope.fixture.json',
        'valid-v2-8-combined-promotion-ledger.fixture.json',
        'createAuditJobLedgerAdminModelFromEnvelope',
        'AUDIT_JOB_LEDGER_PROVIDER_MODE',
        'admin-local-fixture-readonly',
        'AUDIT_JOB_LEDGER_REQUIRED_PANEL_TITLES',
        'Google/Search Console/indexing remains deferred by hard stop.',
        'Contact-form POST closed after V2.8.19 verification.',
        'writeBoundaryFlags',
        'noWriteBoundarySatisfied',
        'contactEndpointPost',
        'externalNetworkUsed',
        'writesPerformed',
      ],
    },
    {
      name: 'admin-v2-9-7-ui-markers',
      file: 'src/components/audit-jobs/AuditJobLedgerAdmin.tsx',
      failureCode: 'AUDIT_JOB_ADMIN_V2_9_7_UI_MARKER_MISSING',
      markers: [
        'data-v2-phase="V2.9.7"',
        'Shared contract adapter active',
        'Shared Contract',
        'Envelope Provider',
        'Runtime Warning',
        'Read-only detail panel',
        'Search trace, evidence, gates',
        'All records',
        'All states',
        'Ascending',
        'Descending',
      ],
    },
  ],
  customChecks: [
    {
      name: 'readonly-api-envelope-fixture-contract',
      run: ({ assert }) => {
        const envelope = JSON.parse(readRepoFile(envelopeFixturePath))
        assert(envelope.schemaVersion === 'audit-job-ledger-readonly-api-envelope.v1', 'AUDIT_JOB_API_ENVELOPE_SCHEMA_MISMATCH', 'Read-only API envelope schema mismatch.', envelopeFixturePath)
        assert(envelope.readOnly === true, 'AUDIT_JOB_API_ENVELOPE_NOT_READONLY', 'Read-only API envelope did not preserve readOnly true.', envelopeFixturePath)
        assert(envelope.data?.schemaVersion === 'audit-job-ledger-shared-viewer-model.v1', 'AUDIT_JOB_SHARED_VIEWER_SCHEMA_MISMATCH', 'Shared viewer model schema mismatch.', envelopeFixturePath)
        assert(envelope.data?.summary?.indexingState === 'deferred', 'AUDIT_JOB_INDEXING_DEFERRED_NOT_PRESERVED', 'Indexing deferred hard stop was not preserved.', envelopeFixturePath)
        assert(envelope.securityBoundary?.noWriteBoundarySatisfied === true, 'AUDIT_JOB_NO_WRITE_BOUNDARY_NOT_SATISFIED', 'No-write boundary was not satisfied.', envelopeFixturePath)
        assert((envelope.securityBoundary?.openFlags ?? []).length === 0, 'AUDIT_JOB_OPEN_WRITE_FLAGS_PRESENT', 'Open write flags were present.', envelopeFixturePath)
        assert(envelope.data?.panels?.length === requiredPanels.length, 'AUDIT_JOB_PANEL_COUNT_MISMATCH', 'Panel count did not match required V2.9.7 coverage.', envelopeFixturePath)
        assert(envelope.meta?.runtimeHttpWarning === 'local_next_dev_server_listened_but_timed_out', 'AUDIT_JOB_RUNTIME_WARNING_NOT_CARRIED', 'Runtime HTTP warning carryforward was missing.', envelopeFixturePath)

        const panelTitles = new Set(envelope.data.panels.map((panel) => panel.title))
        const missingPanels = requiredPanels.filter((panel) => !panelTitles.has(panel))
        assert(missingPanels.length === 0, 'AUDIT_JOB_REQUIRED_PANEL_MISSING', `Missing panels: ${missingPanels.join(', ')}`, envelopeFixturePath)

        return {
          envelopeFixturePath,
          providerMode: envelope.providerMode,
          readOnly: envelope.readOnly,
          panelCount: envelope.data.panels.length,
          runtimeHttpWarning: envelope.meta.runtimeHttpWarning,
        }
      },
    },
    {
      name: 'provider-admin-mode-and-contract-metadata',
      run: ({ assert }) => {
        const providerSource = readAdminFile('src/lib/audit-jobs/mock-provider.ts')
        const componentSource = readAdminFile('src/components/audit-jobs/AuditJobLedgerAdmin.tsx')
        assert(providerSource.includes('contract: contractModel.contract'), 'AUDIT_JOB_SNAPSHOT_CONTRACT_METADATA_MISSING', 'Provider snapshot does not expose contract metadata.')
        assert(providerSource.includes('providerMode: AUDIT_JOB_LEDGER_PROVIDER_MODE'), 'AUDIT_JOB_ADMIN_PROVIDER_MODE_MISSING', 'Provider snapshot does not preserve Admin provider mode.')
        assert(componentSource.includes('snapshot.contract.envelopeSchemaVersion'), 'AUDIT_JOB_CONTRACT_METADATA_UI_MISSING', 'Admin UI does not surface shared contract metadata.')
        return {
          adminProviderMode: 'admin-local-fixture-readonly',
          route,
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
    contractAdapterVerified: checks.some((check) => check.name === 'admin-contract-adapter-markers' && check.status === 'passed'),
    readonlyApiEnvelopeFixtureVerified: checks.some((check) => check.name === 'readonly-api-envelope-fixture-contract' && check.status === 'passed'),
    requiredPanelCoverageVerified: checks.some((check) => check.name === 'readonly-api-envelope-fixture-contract' && check.status === 'passed'),
    readOnlySafetyMessagingVerified: checks.some((check) => check.name === 'admin-v2-9-7-ui-markers' && check.status === 'passed'),
    fixtureBackedProviderVerified: checks.some((check) => check.name === 'readonly-api-envelope-provider-markers' && check.status === 'passed'),
    noUncontrolledWriteCallsVerified: checks.some((check) => check.name === 'no-uncontrolled-write-calls' && check.status === 'passed'),
    noProtectedConfigPatternsVerified: checks.some((check) => check.name === 'no-protected-config-patterns' && check.status === 'passed'),
  }),
})

const runtimeRoute = await readLocalRoute(localUrl)
result.checks.push({
  name: 'localhost-route-runtime-get',
  status: runtimeRoute.available ? (runtimeRoute.statusCode < 500 ? 'passed' : 'failed') : 'skipped',
  ...runtimeRoute,
})

if (runtimeRoute.available && runtimeRoute.statusCode >= 500) {
  result.failures.push({
    code: 'AUDIT_JOB_LOCALHOST_ROUTE_RUNTIME_FAILED',
    message: `Local route returned HTTP ${runtimeRoute.statusCode}.`,
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
          bodyMentionsSharedContract: body.includes('Shared Contract') || body.includes('Shared contract adapter active'),
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
