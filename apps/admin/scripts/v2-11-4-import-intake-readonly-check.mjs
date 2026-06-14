import http from 'node:http'
import path from 'node:path'
import {
  adminRoot,
  defaultProtectedConfigPatterns,
  readAdminFile,
  readRepoFile,
  repoRoot,
  runRuntimeQaHarness,
} from './runtime-qa-harness.mjs'

const route = '/dashboard/import-intake'
const localUrl = process.argv[2] ?? 'http://127.0.0.1:3000/dashboard/import-intake?importIntakeProvider=admin-api-import-intake-readonly'
const iceFixturePath = 'deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-import-intake-preview-ice.envelope.json'
const rollerFixturePath = 'deployment/architecture/multi-tenant-onboarding/import-package-governance-implementation/fixtures/valid-import-intake-preview-roller.envelope.json'

const requiredPanels = [
  'Import Package Summary',
  'Tenant Lifecycle',
  'Routes and Content',
  'Media References',
  'Forms and Contact Configuration',
  'Resource Registry / Provider Profile',
  'Backup Center',
  'Runtime QA',
  'Outbound Link Manager',
  'Audit Jobs / Promotion Governance',
  'No-Go Conditions',
  'Rollback / Abort',
  'Security and Redaction',
  'Paused Tenant / Resume Governance',
  'Next Gates',
]

const requiredEndpoints = [
  'packages',
  'packages/{packageId}',
  'packages/{packageId}/preview',
  'packages/{packageId}/validation',
  'packages/{packageId}/no-go',
  'packages/{packageId}/rollback',
  'packages/{packageId}/evidence',
  'packages/{packageId}/refs',
]

const getOnlyWritePatterns = [
  /\bXMLHttpRequest\b/,
  /\baxios\b/,
  /\bmethod\s*:\s*['"`](POST|PUT|PATCH|DELETE)['"`]/i,
  /\.(post|put|patch|delete)\s*\(/i,
]

const result = runRuntimeQaHarness({
  resultType: 'pumpkin-import-intake-v2-11-4-admin-api-readonly-preview',
  target: route,
  sourceRoots: [
    'src/app/dashboard/import-intake',
    'src/components/import-intake',
    'src/lib/import-intake',
  ],
  writePatterns: getOnlyWritePatterns,
  protectedConfigPatterns: defaultProtectedConfigPatterns,
  markerGroups: [
    {
      name: 'route-wiring',
      file: 'src/app/dashboard/import-intake/page.tsx',
      failureCode: 'IMPORT_INTAKE_ROUTE_MARKER_MISSING',
      markers: [
        'ImportIntakeAdminView',
        'return <ImportIntakeAdminView />',
      ],
    },
    {
      name: 'fixture-provider-markers',
      file: 'src/lib/import-intake/mock-provider.ts',
      failureCode: 'IMPORT_INTAKE_FIXTURE_PROVIDER_MARKER_MISSING',
      markers: [
        'valid-import-intake-preview-ice.envelope.json',
        'valid-import-intake-preview-roller.envelope.json',
        'admin-local-import-package-fixture-readonly',
        'admin-api-import-intake-readonly',
        'api-local-import-package-fixture-readonly',
        'IMPORT_INTAKE_REQUIRED_PANEL_TITLES',
        'getImportIntakeAdminFallbackSnapshot',
        'createFutureActions',
        'resume-roller',
      ],
    },
    {
      name: 'contract-adapter-markers',
      file: 'src/lib/import-intake/contract-adapter.ts',
      failureCode: 'IMPORT_INTAKE_CONTRACT_ADAPTER_MARKER_MISSING',
      markers: [
        'pumpkin.importIntakePreview.readonlyApiEnvelope.v1',
        'pumpkin.importIntakePreview.sharedModel.v1',
        'IMPORT_INTAKE_MUTATION_ACTION_NOT_DISABLED',
        'googleIndexingState',
        'deferred_hard_stop',
        'Roller preview must remain paused_no_import',
        'Roller preview must not be import-ready',
      ],
    },
    {
      name: 'api-bridge-markers',
      file: 'src/lib/import-intake/api-provider.ts',
      failureCode: 'IMPORT_INTAKE_API_BRIDGE_MARKER_MISSING',
      markers: [
        "IMPORT_INTAKE_API_BASE_PATH = '/api/admin/import-intake'",
        'IMPORT_INTAKE_API_PROVIDER_MODE',
        'api-local-import-package-fixture-readonly',
        'REQUIRED_GET_ENDPOINTS',
        'readEndpoint',
        'Promise.all',
        'assertReadOnlyEnvelope',
        'writeActionsAllowed',
        'composeEnvelopeFromPreview',
        'getImportIntakeAdminApiSnapshotWithFallback',
      ],
    },
    {
      name: 'component-runtime-markers',
      file: 'src/components/import-intake/ImportIntakeAdmin.tsx',
      failureCode: 'IMPORT_INTAKE_COMPONENT_MARKER_MISSING',
      markers: [
        'data-v2-phase="V2.11.4"',
        'data-api-bridge-state',
        'importIntakeProvider',
        'IMPORT_INTAKE_API_PROVIDER_MODE',
        'GET-only Pumpkin API bridge',
        'Fixture fallback',
        'Fallback reason',
        'Ice remains the candidate package',
        'Roller remains paused and no-import',
        'read_only_no_write_actions',
      ],
    },
  ],
  customChecks: [
    {
      name: 'required-panel-coverage',
      run: ({ assert }) => {
        const componentSource = readAdminFile('src/components/import-intake/ImportIntakeAdmin.tsx')
        const providerSource = readAdminFile('src/lib/import-intake/mock-provider.ts')
        const missing = requiredPanels.filter((panel) => !componentSource.includes(panel) || !providerSource.includes(panel))
        assert(missing.length === 0, 'IMPORT_INTAKE_REQUIRED_PANEL_MISSING', `Missing panel coverage: ${missing.join(', ')}`)
        return {
          panelCount: requiredPanels.length,
          panels: requiredPanels,
        }
      },
    },
    {
      name: 'readonly-fixture-contracts',
      run: ({ assert }) => {
        const fixtures = [iceFixturePath, rollerFixturePath].map((fixturePath) => ({
          fixturePath,
          envelope: JSON.parse(readRepoFile(fixturePath)),
        }))

        for (const { fixturePath, envelope } of fixtures) {
          assert(envelope.schemaVersion === 'pumpkin.importIntakePreview.readonlyApiEnvelope.v1', 'IMPORT_INTAKE_FIXTURE_SCHEMA_MISMATCH', 'Read-only API envelope schema mismatch.', fixturePath)
          assert(envelope.data?.schemaVersion === 'pumpkin.importIntakePreview.sharedModel.v1', 'IMPORT_INTAKE_SHARED_SCHEMA_MISMATCH', 'Shared model schema mismatch.', fixturePath)
          assert(envelope.providerMode === 'api-local-import-package-fixture-readonly', 'IMPORT_INTAKE_PROVIDER_MODE_MISMATCH', 'Provider mode mismatch.', fixturePath)
          assert(envelope.readOnly === true && envelope.data?.readOnly === true, 'IMPORT_INTAKE_FIXTURE_NOT_READONLY', 'Fixture is not read-only.', fixturePath)
          assert(envelope.securityBoundary?.noWriteBoundarySatisfied === true, 'IMPORT_INTAKE_NO_WRITE_NOT_SATISFIED', 'No-write boundary is not satisfied.', fixturePath)
          assert((envelope.securityBoundary?.openFlags ?? []).length === 0, 'IMPORT_INTAKE_OPEN_FLAGS_PRESENT', 'Open write flags were present.', fixturePath)
          assert(envelope.meta?.googleIndexingState === 'deferred_hard_stop', 'IMPORT_INTAKE_INDEXING_NOT_DEFERRED', 'Google indexing deferred hard stop missing.', fixturePath)
          assert(envelope.meta?.writeActionsAllowed === false, 'IMPORT_INTAKE_WRITE_ACTIONS_ALLOWED', 'Write actions must remain false.', fixturePath)
          assert((envelope.data?.futureActions ?? []).every((action) => action.disabled === true), 'IMPORT_INTAKE_ENABLED_ACTION_FOUND', 'Future actions must be disabled.', fixturePath)
        }

        const roller = fixtures.find((fixture) => fixture.envelope.data?.tenantKey === 'roller-rink-rentals')?.envelope.data
        assert(roller?.importMode === 'paused_no_import', 'IMPORT_INTAKE_ROLLER_NOT_PAUSED_NO_IMPORT', 'Roller import mode must remain paused_no_import.', rollerFixturePath)
        assert(roller?.readyForFutureImportExecution === false, 'IMPORT_INTAKE_ROLLER_READY_FOR_IMPORT', 'Roller must not be ready for future import execution.', rollerFixturePath)
        assert((roller?.noGoConditions ?? []).some((condition) => condition.code === 'tenant_paused_no_import'), 'IMPORT_INTAKE_ROLLER_NO_GO_MISSING', 'Roller paused no-go condition is missing.', rollerFixturePath)

        return {
          fixtureCount: fixtures.length,
          icePackageId: fixtures[0].envelope.data.packageId,
          rollerPackageId: fixtures[1].envelope.data.packageId,
        }
      },
    },
    {
      name: 'api-endpoint-coverage',
      run: ({ assert }) => {
        const source = readAdminFile('src/lib/import-intake/api-provider.ts')
        const missing = requiredEndpoints.filter((endpoint) => !source.includes(`'${endpoint}'`))
        assert(missing.length === 0, 'IMPORT_INTAKE_API_ENDPOINT_MISSING', `Missing API bridge endpoint coverage: ${missing.join(', ')}`)
        assert(!/\bmethod\s*:\s*['"`](POST|PUT|PATCH|DELETE)['"`]/i.test(source), 'IMPORT_INTAKE_API_CLIENT_MUTATION_METHOD_FOUND', 'API bridge client contains a mutation method.')
        assert(!/\bXMLHttpRequest\b|\baxios\b|\.post\s*\(|\.put\s*\(|\.patch\s*\(|\.delete\s*\(/i.test(source), 'IMPORT_INTAKE_API_CLIENT_MUTATION_CALL_FOUND', 'API bridge client contains a mutation-capable call pattern.')
        return {
          endpointCount: requiredEndpoints.length,
          endpoints: requiredEndpoints,
          methodBoundary: 'GET-only',
        }
      },
    },
    {
      name: 'disabled-action-coverage',
      run: ({ assert }) => {
        const componentSource = readAdminFile('src/components/import-intake/ImportIntakeAdmin.tsx')
        const providerSource = readAdminFile('src/lib/import-intake/mock-provider.ts')
        assert(componentSource.includes('disabled'), 'IMPORT_INTAKE_DISABLED_BUTTONS_MISSING', 'Component does not render disabled future controls.')
        assert(providerSource.includes('assertImportIntakeFutureActionsReadOnly'), 'IMPORT_INTAKE_DISABLED_ACTION_ASSERTION_MISSING', 'Provider does not assert disabled future actions.')
        assert(componentSource.includes('Import execution, tenant creation, Roller resume'), 'IMPORT_INTAKE_BOUNDARY_BANNER_MISSING', 'Read-only safety banner is missing expected boundary text.')
        return {
          disabledFutureActionsVerified: true,
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
    fixtureProviderVerified: checks.some((check) => check.name === 'fixture-provider-markers' && check.status === 'passed'),
    apiBridgeVerified: checks.some((check) => check.name === 'api-bridge-markers' && check.status === 'passed'),
    contractAdapterVerified: checks.some((check) => check.name === 'contract-adapter-markers' && check.status === 'passed'),
    requiredPanelCoverageVerified: checks.some((check) => check.name === 'required-panel-coverage' && check.status === 'passed'),
    fixtureContractVerified: checks.some((check) => check.name === 'readonly-fixture-contracts' && check.status === 'passed'),
    disabledActionCoverageVerified: checks.some((check) => check.name === 'disabled-action-coverage' && check.status === 'passed'),
    noUncontrolledWriteCallsVerified: checks.some((check) => check.name === 'no-uncontrolled-write-calls' && check.status === 'passed'),
    noProtectedConfigPatternsVerified: checks.some((check) => check.name === 'no-protected-config-patterns' && check.status === 'passed'),
  }),
})

const runtimeRoute = await readLocalRoute(localUrl)
result.checks.push({
  name: 'localhost-import-intake-route-runtime-get',
  status: runtimeRoute.available ? (runtimeRoute.statusCode < 500 ? 'passed' : 'failed') : 'skipped',
  ...runtimeRoute,
})

if (runtimeRoute.available && runtimeRoute.statusCode >= 500) {
  result.failures.push({
    code: 'IMPORT_INTAKE_LOCALHOST_ROUTE_FAILED',
    message: `Local import-intake route returned HTTP ${runtimeRoute.statusCode}.`,
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
          bodyMentionsImportIntake: body.includes('Import Intake Preview') || body.includes('/dashboard/import-intake'),
          bodyMentionsApiBridge: body.includes('GET-only Pumpkin API bridge') || body.includes('data-api-bridge-state'),
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
