export const AIRSTRIP_OPERATOR_PATHS = {
  backupBundle: 'C:\\Users\\User\\Desktop\\PumpkinCMS\\secure-operator-handoff\\tenant-backups\\v2-8-61a-airstrip-full-backup-proof',
  restoreDryRun: 'C:\\Users\\User\\Desktop\\PumpkinCMS\\secure-operator-handoff\\tenant-backups\\v2-8-61b-airstrip-restore-dryrun-proof',
  intakeProof: 'C:\\Users\\User\\Desktop\\PumpkinCMS\\tenant-onboarding-intake\\TRUENewestTenant\\v2-8-61c-intake-analysis-proof',
  compiledPackageProof: 'C:\\Users\\User\\Desktop\\PumpkinCMS\\tenant-onboarding-intake\\TRUENewestTenant\\v2-8-61d-compiled-package-proof\\compiled-package',
  rawAirstripZip: 'C:\\Users\\User\\Desktop\\PumpkinCMS\\tenant-onboarding-intake\\TRUENewestTenant\\newest upload package\\pumpkinairstrip.zip',
} as const

export const BACKUP_EXPORT_SUMMARY = {
  phase: 'V2.8.61A',
  status: 'completed',
  pages: 5,
  mediaAssets: 13,
  mediaBlobs: 13,
  themes: 1,
  formDefinitions: 1,
  formEntries: 0,
  domainBindings: 1,
  sanitizedUsers: 1,
  files: 62,
  checksumEntries: 61,
  checksumFailures: 0,
  runtimeGetChecks: '17/17',
  manifestSha256: '2D342D417C557E1642F470CDFD3808C2CA7A752A7D82B7BA341291BFB80144C1',
} as const

export const RESTORE_DRY_RUN_SUMMARY = {
  phase: 'V2.8.61B',
  status: 'passed with documented gaps',
  checksumEntriesValidated: 61,
  pages: 5,
  mediaAssets: 13,
  themes: 1,
  formDefinitions: 1,
  domainBindings: 1,
  mediaFilesValidated: 13,
  restoreOrderSteps: 15,
  outputChecksumEntries: 4,
  runtimeGetChecks: '17/17',
  documentedGap: 'Airstrip isolated preview host is not recorded in V2.8.61A resource metadata.',
} as const

export const PACKAGE_ANALYZER_SUMMARY = {
  phase: 'V2.8.61C',
  status: 'passed',
  framework: 'Next.js App Router',
  confidence: 'high',
  renderingMode: 'hybrid_next_server_required',
  files: 355,
  directories: 57,
  routes: 25,
  dynamicRoutes: 1,
  mediaCandidates: 13,
  formCandidates: 54,
  protectedConfigFindings: 2,
  protectedConfigContentsRead: false,
} as const

export const PACKAGE_COMPILER_SUMMARY = {
  phase: 'V2.8.61D',
  status: 'completed',
  packageMode: 'full-template',
  validator: 'passed',
  validatorErrors: 0,
  validatorWarnings: 0,
  routeClassifications: 27,
  expectedRoutes: 26,
  responsiveRoutes: 12,
  pageCandidates: 8,
  mediaAssets: 13,
  formDefinition: 'airstrip-reservation',
  formFields: 9,
} as const

export const BACKUP_BUNDLE_CHECKLIST = [
  'Database export records',
  'Media records',
  'Media blobs',
  'Website source files',
  'Normalized package',
  'Responsive overlays',
  'DomainBinding metadata',
  'Resource metadata',
  'Checksums',
  'Restore runbook seed',
] as const

export const BACKUP_LIMITATIONS = [
  'Local operator exporter exists; production job worker is future scope.',
  'Durable artifact storage is future scope.',
  'Live restore adapter is not implemented.',
  'Secret reset workflow requires a separate secure handoff.',
  'DomainBinding restore semantics require owner approval before live restore.',
] as const

export const PACKAGE_WORKFLOW_STEPS = [
  { label: 'Upload', state: 'operator-provided source ZIP', automatedNow: false },
  { label: 'Scan', state: 'local analyzer quarantine scan', automatedNow: true },
  { label: 'Analyze', state: 'framework, route, media, form, and theme detection', automatedNow: true },
  { label: 'Compile', state: 'normalized V1 package candidate generation', automatedNow: true },
  { label: 'Validate', state: 'existing V1 validator replay', automatedNow: true },
  { label: 'Responsive Check', state: 'required browser proof before cutover', automatedNow: false },
  { label: 'Ready/Needs Action', state: 'owner packet and gap report review', automatedNow: true },
] as const

export const PACKAGE_OUTPUT_CHECKLIST = [
  'tenant-package.json',
  'tenant-profile.json',
  'domains.json',
  'brand.json',
  'theme.json',
  'page candidates',
  'media manifest',
  'FormDefinition candidate',
  'validation routes',
  'responsive routes',
  'source map',
  'framework detection',
  'rendering mode',
  'gap report',
  'owner action packet',
] as const

export const AIRSTRIP_HARD_GATES = [
  'Custom-domain cutover remains blocked until Backup and Onboarding pre-cutover gates close.',
  'No Bluehost DNS or custom-domain work is active.',
  'No contact, form, or customer-facing POST proof is active.',
  'Pre-domain-cutover hardcopy refresh remains required in a separate secure phase.',
  'Mobile responsive proof is mandatory before isolated preview, production deploy, domain cutover, or POST proof.',
  'Hybrid server runtime proof is required for the Airstrip Next.js source package.',
] as const

export const OPERATOR_COMMAND_REFERENCES = [
  {
    label: 'Backup export tool',
    command: 'node deployment/architecture/pumpkin-platform/backup-manager-export/v2-8-61a/airstrip-backup-export.mjs',
  },
  {
    label: 'Restore dry-run tool',
    command: 'node deployment/architecture/pumpkin-platform/backup-manager-restore/v2-8-61b/tenant-backup-restore-dryrun.mjs',
  },
  {
    label: 'Package analyzer',
    command: 'node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/intake-analyze-package.mjs --zip <zipPath> --out <proofDir> --tenant-id <tenantId>',
  },
  {
    label: 'Package compiler',
    command: 'node deployment/architecture/pumpkin-platform/tenant-onboarding-package/v1/tools/compile-normalized-package.mjs --analysis <analysisDir> --out <outputDir> --tenant-id <tenantId> --tenant-name <tenantName> --domain <domain> --www-domain <wwwDomain>',
  },
] as const
