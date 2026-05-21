export type ImportRunSource =
  | 'json_import'
  | 'csv_import'
  | 'xlsx_import'
  | 'staged_package'
  | 'manual'
  | 'unknown';

export type ImportRunMode =
  | 'dry-run'
  | 'upsert'
  | 'create-only'
  | 'update-only';

export type ImportRunStatus =
  | 'dry_run'
  | 'completed'
  | 'completed_with_warnings'
  | 'failed'
  | 'cancelled'
  | 'blocked_by_preflight';

export type ImportRunAffectedPageAction =
  | 'created'
  | 'updated'
  | 'skipped'
  | 'conflicted'
  | 'failed';

export interface ImportRun {
  id: string;
  tenantId: string;
  importRunId: string;
  source: ImportRunSource;
  sourceLabel: string;
  sourcePackageId: string;
  sourcePackageName: string;
  fileName: string;
  importMode: ImportRunMode;
  status: ImportRunStatus;
  createdAt: string;
  completedAt: string;
  createdBy: string;
  notes: string;
  tenantMatch: boolean;
  pageCount: number;
  createCount: number;
  updateCount: number;
  skipCount: number;
  conflictCount: number;
  errorCount: number;
  warningCount: number;
  revisionCount: number;
  pagesNeedingRebuildCount: number;
  affectedPages: ImportRunAffectedPage[];
  validationSummary: ImportRunValidationSummary;
  diffSummary: ImportRunDiffSummary;
  importResultSummary: ImportRunResultSummary;
  preflightAcknowledgements: ImportRunPreflightAcknowledgements;
  reportSummary: ImportRunReportSummary;
  protectedConfigChanged: 'false' | 'unknown';
  deploymentTriggered: boolean;
}

export interface ImportRunAffectedPage {
  pageId: string;
  pageSlug: string;
  title: string;
  action: ImportRunAffectedPageAction;
  revisionCreated: boolean;
  previousSlug: string;
  newSlug: string;
  needsRebuild: boolean;
  warnings: string[];
  errors: string[];
}

export interface ImportRunValidationSummary {
  generatedAt: string;
  pageCount: number;
  errorCount: number;
  warningCount: number;
  payloadErrorCount: number;
  payloadWarningCount: number;
}

export interface ImportRunDiffSummary {
  generatedAt: string;
  incomingCount: number;
  createCount: number;
  updateCount: number;
  skipCount: number;
  conflictCount: number;
  errorCount: number;
  warningCount: number;
  publishedUpdateCount: number;
  slugChangeCount: number;
  tenantMismatchCount: number;
  staticRebuildCount: number;
  riskCategories: string[];
}

export interface ImportRunResultSummary {
  timestamp: string;
  total: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  warningCount: number;
}

export interface ImportRunPreflightAcknowledgements {
  publishedUpdatesAcknowledged: boolean;
  slugChangesAcknowledged: boolean;
  warningsAcknowledged: boolean;
}

export interface ImportRunReportSummary {
  sourceType: string;
  importMode: ImportRunMode;
  dryRunOnly: boolean;
  writeAttempted: boolean;
  wroteCount: number;
  revisionCreatedCount: number;
}
