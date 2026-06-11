import path from 'node:path'
import {
  adminRoot,
  defaultProtectedConfigPatterns,
  defaultWritePatterns,
  repoRoot,
  runRuntimeQaHarness,
  writeRuntimeQaEvidence,
} from './runtime-qa-harness.mjs'

const evidenceRoot = path.join(
  repoRoot,
  'deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/.tmp/phase-2h21-runtime-qa-provider-readiness/admin-runtime-qa',
)

const route = '/dashboard/outbound-links'

const result = runRuntimeQaHarness({
  resultType: 'pumpkin-outbound-link-phase-2h21-admin-runtime-qa',
  target: route,
  sourceRoots: [
    'src/app/dashboard/outbound-links',
    'src/components/outbound-links',
    'src/lib/outbound-links',
  ],
  writePatterns: [
    ...defaultWritePatterns,
    /\/api\/admin\/outbound-link[^'"`\s]*.*\b(POST|PUT|PATCH|DELETE)\b/i,
  ],
  protectedConfigPatterns: defaultProtectedConfigPatterns,
  markerGroups: [
    {
      name: 'route-wiring',
      file: 'src/app/dashboard/outbound-links/page.tsx',
      failureCode: 'ROUTE_MARKER_MISSING',
      markers: [
        'OutboundLinkDashboardView',
        'return <OutboundLinkDashboardView />',
      ],
    },
    {
      name: 'admin-ui-markers',
      file: 'src/components/outbound-links/OutboundLinkAdmin.tsx',
      failureCode: 'ADMIN_UI_MARKERS_MISSING',
      markers: [
        'Outbound Link Manager',
        'ActionCenter',
        'QuickFilterBar',
        'LinkDetailDrawer',
        'Future-Gated Actions',
        'ProviderReadinessStrip',
        'ReadinessPill',
        'LocalSandboxActionButton',
        'ReadOnlyActionButton',
        'Live-write profiles remain blocked',
        'Live Writes',
      ],
    },
    {
      name: 'provider-readiness-markers',
      file: 'src/lib/outbound-links/mock-provider.ts',
      failureCode: 'PROVIDER_READINESS_MARKERS_MISSING',
      markers: [
        'OUTBOUND_LINK_PROVIDER_MODE_MESSAGE',
        'getOutboundLinkProviderReadiness',
        'staging-execution-profile',
        'staging-simulated',
        'stagingExecutionStatus',
        'readbackStatus',
        'replayValidationStatus',
        'backupPreExecutionStatus',
        'resourceRegistryStatus',
        'future_approval_required',
        'productionMigrationReady: false',
      ],
    },
    {
      name: 'provider-readiness-types',
      file: 'src/lib/outbound-links/types.ts',
      failureCode: 'PROVIDER_READINESS_TYPE_MARKERS_MISSING',
      markers: [
        'OutboundLinkProviderReadiness',
        'liveReadonlyGate',
        'liveWriteGate',
        'productionMigrationReady: false',
      ],
    },
  ],
  customChecks: [
    {
      name: 'admin-root-detected',
      run: () => ({
        adminRoot: path.relative(repoRoot, adminRoot).replaceAll('\\', '/'),
      }),
    },
  ],
  evidenceFactory: ({ checks, failures }) => ({
    routeLoadedByStaticRuntimeHarness: failures.length === 0,
    providerReadinessMessagingVerified: checks.some((check) => check.name === 'provider-readiness-markers' && check.status === 'passed'),
    actionCenterVerified: checks.some((check) => check.name === 'admin-ui-markers' && check.status === 'passed'),
    quickFiltersVerified: checks.some((check) => check.name === 'admin-ui-markers' && check.status === 'passed'),
    detailDrawerVerified: checks.some((check) => check.name === 'admin-ui-markers' && check.status === 'passed'),
    noUncontrolledWriteCallsVerified: checks.some((check) => check.name === 'no-uncontrolled-write-calls' && check.status === 'passed'),
  }),
})

result.route = route

writeRuntimeQaEvidence({
  evidenceRoot,
  result,
  markdownTitle: 'Admin Runtime QA Result',
})

if (result.failures.length > 0) {
  console.error(`Phase 2H-21 Admin runtime QA failed: ${result.failures.map((failure) => failure.code).join(', ')}`)
  process.exitCode = 1
} else {
  console.log(`Phase 2H-21 Admin runtime QA passed: ${path.relative(repoRoot, evidenceRoot).replaceAll('\\', '/')}`)
}
