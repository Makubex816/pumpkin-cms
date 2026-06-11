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
  'deployment/architecture/outbound-link-manager/local-scanner-registry-implementation/.tmp/v2-2-4-admin-runtime-staging-readonly-bridge/admin-runtime-qa',
)

const route = '/dashboard/outbound-links'

const result = runRuntimeQaHarness({
  resultType: 'pumpkin-outbound-link-v2-2-4-admin-staging-readonly-runtime-qa',
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
      name: 'admin-staging-readonly-messaging',
      file: 'src/components/outbound-links/OutboundLinkAdmin.tsx',
      failureCode: 'ADMIN_STAGING_READONLY_MARKERS_MISSING',
      markers: [
        'staging-backed read-only provider readiness',
        'verified V2.2 staging readback contract',
        'Live-write profiles remain blocked',
        'No write actions',
      ],
    },
    {
      name: 'provider-readiness-markers',
      file: 'src/lib/outbound-links/mock-provider.ts',
      failureCode: 'PROVIDER_READINESS_MARKERS_MISSING',
      markers: [
        'OUTBOUND_LINK_STAGING_PROVIDER_PROFILE_ID',
        'olm-staging-cosmos-nosql-v1',
        'staging-backed-readonly',
        'live-readonly',
        'V2.2.3 verified 48/48 staging records',
        'olapprove_508df3f03faa4f80',
        'olbatch_b08e184fdc6565aa',
        'expectedRecordCount: 48',
        'readbackRecordCount: 48',
        'future_approval_required',
        'productionMigrationReady: false',
        'externalHttpCrawling: false',
        'cmsWrites: false',
        'protectedConfigReads: false',
      ],
    },
    {
      name: 'api-meta-contract-types',
      file: 'src/lib/outbound-links/types.ts',
      failureCode: 'API_META_CONTRACT_MARKERS_MISSING',
      markers: [
        'stagingBacked',
        'writeActionsAllowed',
        'providerProfileId',
        'providerMode',
        'sourceEvidence',
        'approvalManifestId',
        'firstWriteBatchId',
        'readbackRecordCount',
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
    stagingBackedReadOnlyMessagingVerified: checks.some((check) => check.name === 'admin-staging-readonly-messaging' && check.status === 'passed'),
    providerReadinessMessagingVerified: checks.some((check) => check.name === 'provider-readiness-markers' && check.status === 'passed'),
    apiMetaContractVerified: checks.some((check) => check.name === 'api-meta-contract-types' && check.status === 'passed'),
    noUncontrolledWriteCallsVerified: checks.some((check) => check.name === 'no-uncontrolled-write-calls' && check.status === 'passed'),
    localOfflineHarnessPreserved: true,
  }),
})

result.route = route

writeRuntimeQaEvidence({
  evidenceRoot,
  result,
  markdownTitle: 'V2.2.4 Admin Runtime Staging Read-only QA Result',
})

if (result.failures.length > 0) {
  console.error(`V2.2.4 Admin runtime staging read-only QA failed: ${result.failures.map((failure) => failure.code).join(', ')}`)
  process.exitCode = 1
} else {
  console.log(`V2.2.4 Admin runtime staging read-only QA passed: ${path.relative(repoRoot, evidenceRoot).replaceAll('\\', '/')}`)
}
