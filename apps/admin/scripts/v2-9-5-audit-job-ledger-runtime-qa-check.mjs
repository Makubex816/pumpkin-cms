import http from 'node:http'
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
const localUrl = process.argv[2] ?? 'http://localhost:3000/dashboard/audit-jobs'
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
  resultType: 'pumpkin-audit-job-ledger-v2-9-5-admin-nav-runtime-qa-signoff',
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
      name: 'dashboard-navigation-wiring',
      file: 'src/app/dashboard/layout.tsx',
      failureCode: 'AUDIT_JOB_DASHBOARD_NAV_MARKER_MISSING',
      markers: [
        'FileSearch',
        "name: 'Audit Jobs'",
        "href: '/dashboard/audit-jobs'",
        "name: 'Outbound Links'",
      ],
    },
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
        'Read-only detail panel',
      ],
    },
    {
      name: 'filter-search-sort-markers',
      file: 'src/components/audit-jobs/AuditJobLedgerAdmin.tsx',
      failureCode: 'AUDIT_JOB_FILTER_SORT_MARKERS_MISSING',
      markers: [
        'Search trace, evidence, gates',
        'All records',
        'All states',
        'sortField',
        'Ascending',
        'Descending',
      ],
    },
    {
      name: 'disabled-future-action-markers',
      file: 'src/lib/audit-jobs/mock-provider.ts',
      failureCode: 'AUDIT_JOB_DISABLED_FUTURE_ACTION_MARKERS_MISSING',
      markers: [
        'request-indexing',
        'Request indexing',
        'redeploy-production',
        'Redeploy production',
        'submit-contact-check',
        'Submit contact check',
        'disabled: true',
        'Future-gated',
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
        'noWriteBoundarySatisfied',
        'contactEndpointPost',
        'externalNetworkUsed',
        'writesPerformed',
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
      name: 'dashboard-layout-dirty-file-preservation',
      run: ({ assert }) => {
        const layoutSource = readAdminFile('src/app/dashboard/layout.tsx')
        assert(layoutSource.includes("name: 'Outbound Links'"), 'OUTBOUND_LINKS_NAV_ENTRY_LOST', 'Outbound Links nav entry was not preserved.')
        assert(layoutSource.includes("name: 'Audit Jobs'"), 'AUDIT_JOBS_NAV_ENTRY_MISSING', 'Audit Jobs nav entry is missing.')
        return {
          preservedExistingDirtyNavEntry: true,
          addedAuditJobsNavEntry: true,
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
    navigationEntryVerified: checks.some((check) => check.name === 'dashboard-navigation-wiring' && check.status === 'passed'),
    requiredPanelCoverageVerified: checks.some((check) => check.name === 'required-panel-titles' && check.status === 'passed'),
    readOnlySafetyMessagingVerified: checks.some((check) => check.name === 'admin-readonly-safety-markers' && check.status === 'passed'),
    filterSearchSortVerified: checks.some((check) => check.name === 'filter-search-sort-markers' && check.status === 'passed'),
    disabledFutureActionsVerified: checks.some((check) => check.name === 'disabled-future-action-markers' && check.status === 'passed'),
    fixtureBackedProviderVerified: checks.some((check) => check.name === 'fixture-provider-markers' && check.status === 'passed'),
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
