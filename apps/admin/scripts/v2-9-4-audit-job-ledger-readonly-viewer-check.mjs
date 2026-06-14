import path from 'node:path'
import {
  adminRoot,
  defaultProtectedConfigPatterns,
  defaultWritePatterns,
  readAdminFile,
  repoRoot,
  runRuntimeQaHarness,
} from './runtime-qa-harness.mjs'

const route = '/dashboard/audit-jobs'
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
  resultType: 'pumpkin-audit-job-ledger-v2-9-4-admin-readonly-viewer-qa',
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
      name: 'admin-readonly-safety-markers',
      file: 'src/components/audit-jobs/AuditJobLedgerAdmin.tsx',
      failureCode: 'AUDIT_JOB_ADMIN_READONLY_MARKERS_MISSING',
      markers: [
        'Read-only governance view',
        'No write actions',
        'Google/Search Console/indexing deferred hard stop',
        'Deployment closed',
        'Contact-form POST closed',
        'disabled',
        'Ledger Explorer',
        'DetailPanel',
      ],
    },
    {
      name: 'fixture-provider-markers',
      file: 'src/lib/audit-jobs/mock-provider.ts',
      failureCode: 'AUDIT_JOB_FIXTURE_PROVIDER_MARKERS_MISSING',
      markers: [
        'valid-v2-8-combined-promotion-ledger.fixture.json',
        'AUDIT_JOB_LEDGER_PROVIDER_MODE',
        'admin-local-fixture-readonly',
        'AUDIT_JOB_LEDGER_REQUIRED_PANEL_TITLES',
        'Google/Search Console/indexing remains deferred by hard stop.',
        'Contact-form POST closed after V2.8.19 verification.',
        'writeBoundaryFlags',
        'contactEndpointPost',
        'externalNetworkUsed',
        'writesPerformed',
      ],
    },
    {
      name: 'typed-view-model-markers',
      file: 'src/lib/audit-jobs/types.ts',
      failureCode: 'AUDIT_JOB_TYPED_MODEL_MARKERS_MISSING',
      markers: [
        'AuditJobLedgerViewerModel',
        'AuditJobLedgerAdminSnapshot',
        'AuditJobLedgerQueryState',
        'AuditJobLedgerAdminRecord',
        'AuditJobLedgerFutureAction',
        'securityBoundary',
      ],
    },
  ],
  customChecks: [
    {
      name: 'required-panel-titles',
      run: ({ assert }) => {
        const providerSource = readAdminFile('src/lib/audit-jobs/mock-provider.ts')
        const missing = requiredPanels.filter((panel) => !providerSource.includes(panel))
        assert(missing.length === 0, 'AUDIT_JOB_REQUIRED_PANEL_MISSING', `Missing panels: ${missing.join(', ')}`)
        return {
          requiredPanelCount: requiredPanels.length,
          requiredPanels,
        }
      },
    },
    {
      name: 'route-scope',
      run: () => ({
        route,
        adminRoot: path.relative(repoRoot, adminRoot).replaceAll('\\', '/'),
      }),
    },
  ],
  evidenceFactory: ({ checks, failures }) => ({
    routeRegistered: failures.length === 0,
    requiredPanelCoverageVerified: checks.some((check) => check.name === 'required-panel-titles' && check.status === 'passed'),
    readOnlySafetyMessagingVerified: checks.some((check) => check.name === 'admin-readonly-safety-markers' && check.status === 'passed'),
    fixtureBackedProviderVerified: checks.some((check) => check.name === 'fixture-provider-markers' && check.status === 'passed'),
    noUncontrolledWriteCallsVerified: checks.some((check) => check.name === 'no-uncontrolled-write-calls' && check.status === 'passed'),
    noProtectedConfigPatternsVerified: checks.some((check) => check.name === 'no-protected-config-patterns' && check.status === 'passed'),
  }),
})

if (result.failures.length > 0) {
  console.error(JSON.stringify(result, null, 2))
  process.exitCode = 1
} else {
  console.log(JSON.stringify(result, null, 2))
}
