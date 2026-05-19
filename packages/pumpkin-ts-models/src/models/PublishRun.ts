export type PublishRunSource = 'cms-snapshot' | 'seed-sites' | 'manual' | 'unknown';

export type PublishRunType =
  | 'static_dry_run'
  | 'cms_snapshot'
  | 'static_export'
  | 'deployment_record';

export type PublishRunStatus =
  | 'ready_for_manual_upload'
  | 'completed_with_warnings'
  | 'failed'
  | 'imported'
  | 'unknown';

export type PublishRunDeploymentTarget =
  | 'none'
  | 'azure-static-web-apps'
  | 'azure-storage-static-website'
  | 'cloudflare';

export type PublishRunDeploymentStatus =
  | 'not_deployed'
  | 'staged'
  | 'deployed'
  | 'failed'
  | 'rolled_back';

export interface PublishRun {
  id: string;
  tenantId: string;
  siteKey: string;
  domain: string;
  runId: string;
  source: PublishRunSource;
  runType: PublishRunType;
  status: PublishRunStatus;
  releaseFolder: string;
  manifestPath: string;
  summaryPath: string;
  createdAt: string;
  importedAt: string;
  createdBy: string;
  notes: string;
  sites: PublishRunSiteSummary[];
  pageCount: number;
  fileCount: number;
  redirectCount: number;
  pageQualityWarningCount: number;
  contentWarningCount: number;
  readyForManualUpload: boolean;
  errors: string[];
  warnings: string[];
  manifestSummary: PublishRunManifestSummary;
  deploymentTarget: PublishRunDeploymentTarget;
  deployedAt: string;
  deploymentStatus: PublishRunDeploymentStatus;
}

export interface PublishRunSiteSummary {
  siteKey: string;
  displayName: string;
  domain: string;
  uploadRoot: string;
  fileCount: number;
  redirectCount: number;
  pageQualityWarningCount: number;
  contentWarningCount: number;
  readyForManualUpload: boolean;
  sourceValidationOk: boolean | null;
  releaseValidationOk: boolean | null;
  canonicalOk: boolean | null;
  secretScanOk: boolean | null;
  warnings: string[];
  errors: string[];
}

export interface PublishRunManifestSummary {
  runId: string;
  generatedAt: string;
  releaseFolder: string;
  contentSource: PublishRunSource;
  deploymentAttempted: boolean;
  cloudflareModified: boolean;
  siteCount: number;
  ok: boolean | null;
}
