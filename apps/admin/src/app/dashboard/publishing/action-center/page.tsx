'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import {
  TENANT_PUBLISHING_PROFILES,
  buildTenantPublishingSummary,
  getTenantDomain,
  getTenantPublishCommands,
  type TenantPublishingSummary,
} from '@/lib/publishing-readiness'
import type { Page, PublishRun, PublishRunSource, PublishRunStatus } from 'pumpkin-ts-models'

const HISTORY_STORAGE_KEY = 'pumpkin:publish-action-center:dry-run-history:v1'
const HISTORY_LIMIT = 12

interface DryRunManifest {
  runId: string
  generatedAt: string
  releaseFolder: string
  contentSource: string
  deploymentAttempted: boolean
  cloudflareModified: boolean
  ok: boolean | null
  manifestPath: string
  summaryPath: string
  sites: DryRunSite[]
}

interface DryRunSite {
  siteKey: string
  displayName: string
  domain: string
  uploadRoot: string
  fileCount: number | null
  readyForManualUpload: boolean | null
  contentWarningCount: number
  redirectCount: number | null
  pageQualityWarningCount: number | null
  sourceValidationOk: boolean | null
  releaseValidationOk: boolean | null
  canonicalOk: boolean | null
  secretScanOk: boolean | null
}

interface DryRunHistoryEntry {
  id: string
  runId: string
  importedAt: string
  generatedAt: string
  contentSource: string
  sites: string[]
  readyCount: number
  warningCount: number
  releaseFolder: string
}

export default function PublishActionCenterPage() {
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [manifestText, setManifestText] = useState('')
  const [manifest, setManifest] = useState<DryRunManifest | null>(null)
  const [manifestError, setManifestError] = useState<string | null>(null)
  const [summaryText, setSummaryText] = useState('')
  const [history, setHistory] = useState<DryRunHistoryEntry[]>([])
  const [historyNotice, setHistoryNotice] = useState<string | null>(null)
  const [storeFeedback, setStoreFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [cmsHistory, setCmsHistory] = useState<PublishRun[]>([])
  const [cmsHistoryLoading, setCmsHistoryLoading] = useState(false)
  const [cmsHistoryError, setCmsHistoryError] = useState<string | null>(null)
  const [cmsHistoryFeedback, setCmsHistoryFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null)
  const [savingCmsHistory, setSavingCmsHistory] = useState(false)

  const loadPages = useCallback(async () => {
    if (!token || !currentTenant) {
      setPages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const tenantPages = await apiClient.getPages(token, currentTenant.tenantId)
      setPages(tenantPages)
    } catch (loadError) {
      console.error('[Publish Action Center] Failed to load pages:', loadError)
      setError(getErrorMessage(loadError, 'Failed to load tenant publishing data.'))
    } finally {
      setLoading(false)
    }
  }, [token, currentTenant])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  const loadCmsHistory = useCallback(async () => {
    if (!token || !currentTenant) {
      setCmsHistory([])
      setCmsHistoryLoading(false)
      return
    }

    try {
      setCmsHistoryLoading(true)
      setCmsHistoryError(null)
      const publishRuns = await apiClient.getPublishRuns(token, currentTenant.tenantId)
      setCmsHistory(publishRuns)
    } catch (historyError) {
      console.error('[Publish Action Center] Failed to load CMS publish history:', historyError)
      setCmsHistoryError(getErrorMessage(historyError, 'Failed to load CMS publish run history.'))
    } finally {
      setCmsHistoryLoading(false)
    }
  }, [token, currentTenant])

  useEffect(() => {
    loadCmsHistory()
  }, [loadCmsHistory])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const tenantId = currentTenant?.tenantId || ''
  const tenantProfile = tenantId ? TENANT_PUBLISHING_PROFILES[tenantId] : null
  const tenantDomain = tenantId ? getTenantDomain(tenantId, pages) : ''
  const expectedDomain = tenantDomain || tenantProfile?.domain || ''
  const tenantName = currentTenant?.name || tenantProfile?.displayName || tenantId
  const commands = tenantId ? getTenantPublishCommands(tenantId) : []
  const summary = useMemo(() => buildTenantPublishingSummary(pages), [pages])
  const matchingDryRunSite = useMemo(
    () => manifest?.sites.find((site) => site.siteKey === tenantId) || null,
    [manifest, tenantId],
  )
  const correlationWarnings = useMemo(
    () => buildCorrelationWarnings({
      manifest,
      matchingSite: matchingDryRunSite,
      tenantId,
      expectedDomain,
      pages,
      summary,
    }),
    [manifest, matchingDryRunSite, tenantId, expectedDomain, pages, summary],
  )

  const parseManifest = (text: string) => {
    try {
      const parsed: unknown = JSON.parse(text)
      const normalized = normalizeManifest(parsed)
      setManifest(normalized)
      setManifestError(null)
      setHistoryNotice(null)
      setStoreFeedback(null)
    } catch (parseError) {
      setManifest(null)
      setManifestError(getErrorMessage(parseError, 'Manifest JSON could not be parsed.'))
      setStoreFeedback(null)
    }
  }

  const handleManifestTextChange = (value: string) => {
    setManifestText(value)
    setManifest(null)
    setManifestError(null)
    setStoreFeedback(null)
  }

  const handleManifestFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setManifestText(text)
      parseManifest(text)
    } catch (fileError) {
      setManifestError(getErrorMessage(fileError, 'Manifest file could not be read.'))
    }
  }

  const handleSummaryFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setSummaryText(await file.text())
    } catch (fileError) {
      setManifestError(getErrorMessage(fileError, 'Summary file could not be read.'))
    }
  }

  const storeManifestHistory = () => {
    if (!manifest) {
      setStoreFeedback({ tone: 'error', message: 'Parse a valid dry-run manifest before storing history.' })
      return
    }

    if (!manifest.runId || manifest.runId === 'unknown-run') {
      setStoreFeedback({ tone: 'error', message: 'Manifest is missing a valid runId and was not stored.' })
      return
    }

    const entry = createHistoryEntry(manifest)
    const latestHistory = loadHistory()
    const replacedExisting = latestHistory.some((item) => item.runId === entry.runId)
    const nextHistory = [
      entry,
      ...latestHistory.filter((item) => item.runId !== entry.runId),
    ].slice(0, HISTORY_LIMIT)

    saveHistory(nextHistory)
    setHistory(nextHistory)

    const message = replacedExisting
      ? `Updated run ${manifest.runId} in local history.`
      : `Manifest stored in local history for run ${manifest.runId}.`
    setHistoryNotice(message)
    setStoreFeedback({ tone: 'success', message })
  }

  const saveManifestToCmsHistory = async () => {
    if (!token || !currentTenant) {
      setCmsHistoryFeedback({ tone: 'error', message: 'Log in and select a tenant before saving CMS history.' })
      return
    }

    if (!manifest) {
      setCmsHistoryFeedback({ tone: 'error', message: 'Parse a valid dry-run manifest before saving CMS history.' })
      return
    }

    try {
      setSavingCmsHistory(true)
      setCmsHistoryFeedback(null)
      setCmsHistoryError(null)
      const publishRun = buildPublishRunFromManifest(manifest, currentTenant.tenantId, expectedDomain, correlationWarnings)
      const savedRun = await apiClient.createPublishRun(token, currentTenant.tenantId, publishRun)
      setCmsHistory((currentHistory) => [
        savedRun,
        ...currentHistory.filter((item) => item.id !== savedRun.id && item.runId !== savedRun.runId),
      ])
      setCmsHistoryFeedback({ tone: 'success', message: `Saved run ${savedRun.runId} to CMS history.` })
    } catch (saveError) {
      setCmsHistoryFeedback({ tone: 'error', message: getErrorMessage(saveError, 'Failed to save CMS publish history.') })
    } finally {
      setSavingCmsHistory(false)
    }
  }

  const clearHistory = () => {
    saveHistory([])
    setHistory([])
    setHistoryNotice('Local browser dry-run history cleared.')
    setStoreFeedback(null)
  }

  if (isLoading) {
    return <StateCard title="Publish Action Center" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Publish Action Center" message="Please log in to review static publishing dry runs." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Publish Action Center" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Publish Action Center" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Publish Action Center" message="Select a tenant/site before reviewing static publish actions." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Static Publishing</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Publish Action Center</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Tenant-scoped dry-run guidance and manifest review for {tenantName}. This page does not deploy, run shell commands, or purge Cloudflare.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/publishing/repairs" className="btn btn-secondary">
              Repair Metadata
            </Link>
            <Link href="/dashboard/publishing" className="btn btn-secondary">
              Back To Publishing
            </Link>
          </div>
        </div>
      </header>

      {loading && <div className="card text-sm text-neutral-600">Loading tenant publishing data...</div>}
      {error && <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>}

      {!loading && (
        <>
          <Overview
            tenantId={tenantId}
            tenantName={tenantName}
            domain={expectedDomain}
            summary={summary}
          />
          <GuidedSteps tenantId={tenantId} commands={commands} />
          <ManifestViewer
            manifestText={manifestText}
            manifest={manifest}
            manifestError={manifestError}
            storeFeedback={storeFeedback}
            cmsFeedback={cmsHistoryFeedback}
            savingCmsHistory={savingCmsHistory}
            onManifestTextChange={handleManifestTextChange}
            onParseManifest={() => parseManifest(manifestText)}
            onManifestFile={handleManifestFile}
            onStoreHistory={storeManifestHistory}
            onSaveCmsHistory={saveManifestToCmsHistory}
          />
          <SummaryViewer
            summaryText={summaryText}
            onSummaryTextChange={setSummaryText}
            onSummaryFile={handleSummaryFile}
          />
          <CorrelationPanel
            tenantId={tenantId}
            expectedDomain={expectedDomain}
            summary={summary}
            manifest={manifest}
            matchingSite={matchingDryRunSite}
            warnings={correlationWarnings}
          />
          <CmsHistoryTable
            history={cmsHistory}
            loading={cmsHistoryLoading}
            error={cmsHistoryError}
            onRefresh={loadCmsHistory}
          />
          <HistoryTable history={history} notice={historyNotice} onClear={clearHistory} />
          <SafetyPanel />
        </>
      )}
    </div>
  )
}

function Overview({
  tenantId,
  tenantName,
  domain,
  summary,
}: {
  tenantId: string
  tenantName: string
  domain: string
  summary: TenantPublishingSummary
}) {
  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Tenant Publishing Summary</h2>
        <p className="text-sm text-neutral-600">Current CMS readiness and selected environment target.</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ReadOnlyDetail label="Tenant" value={tenantId} />
        <ReadOnlyDetail label="Site" value={tenantName} />
        <ReadOnlyDetail label="Canonical Domain" value={domain || 'not recorded yet'} />
        <ReadOnlyDetail label="Target" value="local dry-run only" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Readiness" value={summary.statusLabel} tone={summary.status === 'ready_for_snapshot' ? 'green' : 'amber'} />
        <MetricCard label="Pages Needing Rebuild" value={String(summary.pagesNeedingRebuild)} tone={summary.pagesNeedingRebuild ? 'blue' : 'neutral'} />
        <MetricCard label="Warnings/Errors" value={String(getTenantWarningCount(summary))} tone={getTenantWarningCount(summary) ? 'amber' : 'neutral'} />
        <MetricCard label="Published Pages" value={String(summary.publishedPages)} />
      </div>

      <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        This is an operator checklist and dry-run viewer. It never starts Azure deployment, Cloudflare purge, or local shell commands from the browser.
      </div>
    </section>
  )
}

function GuidedSteps({ tenantId, commands }: { tenantId: string; commands: string[] }) {
  const steps = [
    'Review Publishing Dashboard',
    'Apply safe repairs if needed',
    'Run CMS snapshot',
    'Validate CMS snapshot',
    'Export static site from CMS snapshot',
    'Run static publish dry-run',
    'Review manifest and summary',
    'Manually deploy/upload later using Azure runbook',
  ]

  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Guided Publish Steps</h2>
        <p className="text-sm text-neutral-600">Use these commands locally after page warnings, repairs, and approvals have been reviewed.</p>
      </div>

      <ol className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step} className="rounded-lg border border-neutral-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Step {index + 1}</div>
            <div className="mt-1 text-sm font-medium text-neutral-900">{step}</div>
          </li>
        ))}
      </ol>

      {commands.length > 0 ? (
        <>
          <pre className="mt-5 overflow-x-auto rounded-lg bg-neutral-950 p-4 text-sm leading-6 text-neutral-50">
            <code>{commands.join('\n')}</code>
          </pre>
          <p className="mt-3 text-sm text-neutral-600">
            `npm run publish:dry-run:cms` currently packages both Ice and Roller outputs from the CMS snapshot source. Review the matching site section for the selected tenant in the manifest.
          </p>
        </>
      ) : (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No dedicated CMS static scripts are recorded for tenant {tenantId}. Add tenant-specific snapshot, validation, export, and dry-run scripts before publishing.
        </div>
      )}
    </section>
  )
}

function ManifestViewer({
  manifestText,
  manifest,
  manifestError,
  storeFeedback,
  cmsFeedback,
  savingCmsHistory,
  onManifestTextChange,
  onParseManifest,
  onManifestFile,
  onStoreHistory,
  onSaveCmsHistory,
}: {
  manifestText: string
  manifest: DryRunManifest | null
  manifestError: string | null
  storeFeedback: { tone: 'success' | 'error'; message: string } | null
  cmsFeedback: { tone: 'success' | 'error'; message: string } | null
  savingCmsHistory: boolean
  onManifestTextChange: (value: string) => void
  onParseManifest: () => void
  onManifestFile: (event: ChangeEvent<HTMLInputElement>) => void
  onStoreHistory: () => void
  onSaveCmsHistory: () => void
}) {
  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Dry-Run Manifest Viewer</h2>
        <p className="text-sm text-neutral-600">
          Paste or upload `.static-release-dry-runs/&lt;runId&gt;/static-publish-dry-run-manifest.json`. The browser parses only the supplied JSON.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label className="text-sm font-semibold text-neutral-800" htmlFor="dry-run-manifest-json">Manifest JSON</label>
          <textarea
            id="dry-run-manifest-json"
            value={manifestText}
            onChange={(event) => onManifestTextChange(event.target.value)}
            rows={14}
            className="mt-2 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder={`{
  "runId": "...",
  "contentSource": "cms-snapshot",
  "sites": []
}`}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" onClick={onParseManifest} className="btn btn-primary">
              Parse Manifest
            </button>
            <label className="btn btn-secondary cursor-pointer">
              Upload Manifest
              <input type="file" accept=".json,application/json" onChange={onManifestFile} className="sr-only" />
            </label>
            <button type="button" onClick={onStoreHistory} disabled={!manifest} className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
              {storeFeedback?.tone === 'success' ? 'Stored' : 'Store In Local History'}
            </button>
            <button type="button" onClick={onSaveCmsHistory} disabled={!manifest || savingCmsHistory} className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
              {savingCmsHistory ? 'Saving...' : 'Save To CMS History'}
            </button>
          </div>
          {manifestError && <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{manifestError}</div>}
          {storeFeedback && (
            <div className={`mt-3 rounded-lg border px-4 py-3 text-sm ${
              storeFeedback.tone === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              {storeFeedback.message}
            </div>
          )}
          {cmsFeedback && (
            <div className={`mt-3 rounded-lg border px-4 py-3 text-sm ${
              cmsFeedback.tone === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}>
              {cmsFeedback.message}
            </div>
          )}
        </div>

        <ManifestDetails manifest={manifest} />
      </div>
    </section>
  )
}

function ManifestDetails({ manifest }: { manifest: DryRunManifest | null }) {
  if (!manifest) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
        Parsed manifest details will appear here. This viewer does not read `.static-release-dry-runs` automatically.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ReadOnlyDetail label="Run ID" value={manifest.runId} />
        <ReadOnlyDetail label="Generated" value={formatDateTime(manifest.generatedAt)} />
        <ReadOnlyDetail label="Release Folder" value={manifest.releaseFolder} />
        <ReadOnlyDetail label="Content Source" value={manifest.contentSource} />
        <ReadOnlyDetail label="Manifest Path" value={manifest.manifestPath} />
        <ReadOnlyDetail label="Summary Path" value={manifest.summaryPath} />
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <Th>Site</Th>
              <Th>Domain</Th>
              <Th>Files</Th>
              <Th>Ready</Th>
              <Th>Warnings</Th>
              <Th>Redirects</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {manifest.sites.map((site) => (
              <tr key={site.siteKey}>
                <Td>
                  <div className="font-medium text-neutral-900">{site.displayName || site.siteKey}</div>
                  <code className="text-xs text-neutral-500">{site.uploadRoot || 'upload root missing'}</code>
                </Td>
                <Td>{site.domain || 'not recorded'}</Td>
                <Td>{formatNullableNumber(site.fileCount)}</Td>
                <Td>{formatNullableBoolean(site.readyForManualUpload)}</Td>
                <Td>{getSiteWarningCount(site)}</Td>
                <Td>{formatNullableNumber(site.redirectCount)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SummaryViewer({
  summaryText,
  onSummaryTextChange,
  onSummaryFile,
}: {
  summaryText: string
  onSummaryTextChange: (value: string) => void
  onSummaryFile: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Dry-Run Summary Viewer</h2>
        <p className="text-sm text-neutral-600">
          Paste or upload `STATIC_PUBLISH_DRY_RUN_SUMMARY.md` if you want the human-readable summary beside the manifest. It is rendered as plain text.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <textarea
            value={summaryText}
            onChange={(event) => onSummaryTextChange(event.target.value)}
            rows={10}
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 font-mono text-xs text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="# Static Publish Dry Run Summary"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="btn btn-secondary cursor-pointer">
              Upload Summary
              <input type="file" accept=".md,text/markdown,text/plain" onChange={onSummaryFile} className="sr-only" />
            </label>
            <button type="button" onClick={() => onSummaryTextChange('')} className="btn btn-secondary">
              Clear Summary
            </button>
          </div>
        </div>
        <pre className="max-h-96 overflow-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs leading-5 text-neutral-800">
          {summaryText || 'No summary pasted. The summary usually lives beside the manifest in the dry-run folder.'}
        </pre>
      </div>
    </section>
  )
}

function CorrelationPanel({
  tenantId,
  expectedDomain,
  summary,
  manifest,
  matchingSite,
  warnings,
}: {
  tenantId: string
  expectedDomain: string
  summary: TenantPublishingSummary
  manifest: DryRunManifest | null
  matchingSite: DryRunSite | null
  warnings: string[]
}) {
  const currentWarningCount = getTenantWarningCount(summary)

  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Readiness Correlation</h2>
        <p className="text-sm text-neutral-600">
          Compares the current selected tenant against the pasted dry-run manifest. A mismatch means the dry-run package should not be treated as ready for this tenant.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Current CMS Warnings" value={String(currentWarningCount)} tone={currentWarningCount ? 'amber' : 'green'} />
        <MetricCard label="Pages Needing Rebuild" value={String(summary.pagesNeedingRebuild)} tone={summary.pagesNeedingRebuild ? 'blue' : 'neutral'} />
        <MetricCard label="Dry-Run Files" value={formatNullableNumber(matchingSite?.fileCount ?? null)} />
        <MetricCard label="Dry-Run Warnings" value={matchingSite ? String(getSiteWarningCount(matchingSite)) : 'not parsed'} tone={matchingSite && getSiteWarningCount(matchingSite) ? 'amber' : 'neutral'} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <ReadOnlyDetail label="Expected Tenant" value={tenantId} />
        <ReadOnlyDetail label="Manifest Tenant Match" value={matchingSite ? matchingSite.siteKey : manifest ? 'no matching site' : 'no manifest parsed'} />
        <ReadOnlyDetail label="Expected Domain" value={expectedDomain || 'not recorded yet'} />
      </div>

      {warnings.length > 0 ? (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h3 className="text-sm font-semibold text-amber-900">Review Before Upload</h3>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Parsed dry-run data matches the selected tenant/domain and has no action-center correlation warnings.
        </div>
      )}
    </section>
  )
}

function HistoryTable({
  history,
  notice,
  onClear,
}: {
  history: DryRunHistoryEntry[]
  notice: string | null
  onClear: () => void
}) {
  return (
    <section className="card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Imported Dry-Run History</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Local browser history only. This is not an authoritative CMS build/deploy history record.
          </p>
        </div>
        <button type="button" onClick={onClear} className="btn btn-secondary" disabled={history.length === 0}>
          Clear Local History
        </button>
      </div>

      {notice && <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

      {history.length === 0 ? (
        <p className="mt-5 text-sm text-neutral-600">No dry-run manifests have been stored in this browser yet.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <Th>Run ID</Th>
                <Th>Imported</Th>
                <Th>Content Source</Th>
                <Th>Sites</Th>
                <Th>Ready</Th>
                <Th>Warnings</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {history.map((item) => (
                <tr key={item.id}>
                  <Td>
                    <div className="font-medium text-neutral-900">{item.runId}</div>
                    <div className="text-xs text-neutral-500">{item.releaseFolder}</div>
                  </Td>
                  <Td>{formatDateTime(item.importedAt)}</Td>
                  <Td>{item.contentSource}</Td>
                  <Td>{item.sites.join(', ') || 'none'}</Td>
                  <Td>{item.readyCount}</Td>
                  <Td>{item.warningCount}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function CmsHistoryTable({
  history,
  loading,
  error,
  onRefresh,
}: {
  history: PublishRun[]
  loading: boolean
  error: string | null
  onRefresh: () => void
}) {
  return (
    <section className="card">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">CMS Publish Run History</h2>
          <p className="mt-1 text-sm text-neutral-600">
            Tenant-scoped publish/build records stored through Pumpkin API. These are dry-run metadata records only, not deployment actions.
          </p>
        </div>
        <button type="button" onClick={onRefresh} className="btn btn-secondary" disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh CMS History'}
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      )}

      {loading && <p className="mt-5 text-sm text-neutral-600">Loading CMS publish run history...</p>}

      {!loading && !error && history.length === 0 && (
        <p className="mt-5 text-sm text-neutral-600">No CMS publish run history has been saved for this tenant yet.</p>
      )}

      {!loading && history.length > 0 && (
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <Th>Run ID</Th>
                <Th>Imported</Th>
                <Th>Status</Th>
                <Th>Source</Th>
                <Th>Files</Th>
                <Th>Redirects</Th>
                <Th>Warnings</Th>
                <Th>Deployment</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 bg-white">
              {history.map((item) => (
                <tr key={item.id}>
                  <Td>
                    <div className="font-medium text-neutral-900">{item.runId}</div>
                    <div className="text-xs text-neutral-500">{item.releaseFolder || item.id}</div>
                  </Td>
                  <Td>{formatDateTime(item.importedAt)}</Td>
                  <Td>{formatRunStatus(item.status)}</Td>
                  <Td>{item.source}</Td>
                  <Td>{item.fileCount}</Td>
                  <Td>{item.redirectCount}</Td>
                  <Td>{getPublishRunWarningCount(item)}</Td>
                  <Td>{item.deploymentStatus || 'not_deployed'}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function SafetyPanel() {
  return (
    <section className="card border-blue-200 bg-blue-50">
      <h2 className="text-lg font-semibold text-blue-950">Safety Limits</h2>
      <ul className="mt-3 space-y-2 text-sm text-blue-900">
        <li>This page does not deploy to Azure Static Web Apps or Azure Storage.</li>
        <li>This page does not run shell commands or read local dry-run folders automatically.</li>
        <li>This page does not purge Cloudflare or modify DNS/cache rules.</li>
        <li>Use the Azure and Cloudflare runbooks for actual staging or production deployment.</li>
        <li>Dry-run release folders are generated local artifacts and should not be committed.</li>
      </ul>
    </section>
  )
}

function StateCard({ title, message, tone = 'neutral' }: { title: string; message: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`card ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : ''}`}>
      <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  )
}

function MetricCard({ label, value, tone = 'neutral' }: { label: string; value: string; tone?: 'neutral' | 'amber' | 'blue' | 'green' }) {
  const toneClass = tone === 'amber'
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : tone === 'blue'
      ? 'border-blue-200 bg-blue-50 text-blue-900'
      : tone === 'green'
        ? 'border-green-200 bg-green-50 text-green-900'
        : 'border-neutral-100 bg-white text-neutral-900'

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${toneClass}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </div>
  )
}

function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-neutral-900">{value || 'not recorded yet'}</div>
    </div>
  )
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">{children}</th>
}

function Td({ children }: { children: ReactNode }) {
  return <td className="max-w-sm px-4 py-3 text-neutral-700">{children}</td>
}

function normalizeManifest(raw: unknown): DryRunManifest {
  const record = requireRecord(raw, 'Manifest')
  const runId = stringValue(record.runId)
  if (!runId) {
    throw new Error('Manifest is missing required runId.')
  }

  const releaseFolder = stringValue(record.releaseFolder)
  const manifestPath = stringValue(record.manifest) ||
    stringValue(record.manifestPath) ||
    (releaseFolder ? `${releaseFolder}/static-publish-dry-run-manifest.json` : '')
  const summaryPath = stringValue(record.summary) ||
    stringValue(record.summaryPath) ||
    (releaseFolder ? `${releaseFolder}/STATIC_PUBLISH_DRY_RUN_SUMMARY.md` : '')
  const sitesValue = record.sites

  if (!Array.isArray(sitesValue)) {
    throw new Error('Manifest must include a sites array.')
  }

  return {
    runId,
    generatedAt: stringValue(record.generatedAt),
    releaseFolder,
    contentSource: stringValue(record.contentSource) || 'unknown',
    deploymentAttempted: booleanValue(record.deploymentAttempted) ?? false,
    cloudflareModified: booleanValue(record.cloudflareModified) ?? false,
    ok: booleanValue(record.ok),
    manifestPath,
    summaryPath,
    sites: sitesValue.map((site, index) => normalizeManifestSite(site, index)),
  }
}

function normalizeManifestSite(raw: unknown, index: number): DryRunSite {
  const record = requireRecord(raw, `Manifest site ${index + 1}`)
  const secretScan = optionalRecord(record.secretScan)
  const sourceValidation = optionalRecord(record.sourceValidation)
  const releaseValidation = optionalRecord(record.releaseValidation)
  const canonical = optionalRecord(record.canonical)
  const contentWarningCount = numberValue(record.contentWarningCount) ??
    getArrayLength(secretScan?.warnings)

  return {
    siteKey: stringValue(record.siteKey) || `site-${index + 1}`,
    displayName: stringValue(record.displayName),
    domain: stringValue(record.domain),
    uploadRoot: stringValue(record.uploadRoot),
    fileCount: numberValue(record.fileCount),
    readyForManualUpload: booleanValue(record.readyForManualUpload),
    contentWarningCount,
    redirectCount: numberValue(record.redirectCount),
    pageQualityWarningCount: numberValue(record.pageQualityWarningCount),
    sourceValidationOk: booleanValue(sourceValidation?.ok),
    releaseValidationOk: booleanValue(releaseValidation?.ok),
    canonicalOk: booleanValue(canonical?.ok),
    secretScanOk: booleanValue(secretScan?.ok),
  }
}

function buildCorrelationWarnings({
  manifest,
  matchingSite,
  tenantId,
  expectedDomain,
  pages,
  summary,
}: {
  manifest: DryRunManifest | null
  matchingSite: DryRunSite | null
  tenantId: string
  expectedDomain: string
  pages: Page[]
  summary: TenantPublishingSummary
}) {
  const warnings: string[] = []

  if (!manifest) {
    warnings.push('No dry-run manifest has been parsed yet.')
    return warnings
  }

  if (manifest.deploymentAttempted) {
    warnings.push('Manifest says deploymentAttempted was true. Expected local dry-run only.')
  }

  if (manifest.cloudflareModified) {
    warnings.push('Manifest says cloudflareModified was true. Expected no Cloudflare changes.')
  }

  if (manifest.contentSource !== 'cms-snapshot') {
    warnings.push(`Manifest contentSource is ${manifest.contentSource}; CMS publish review expects cms-snapshot.`)
  }

  if (!matchingSite) {
    warnings.push(`Manifest does not include selected tenant ${tenantId}.`)
    return warnings
  }

  if (expectedDomain && matchingSite.domain !== expectedDomain) {
    warnings.push(`Manifest domain ${matchingSite.domain || 'missing'} does not match expected ${expectedDomain}.`)
  }

  if (matchingSite.readyForManualUpload === false) {
    warnings.push('Manifest site is not marked readyForManualUpload.')
  }

  if (matchingSite.secretScanOk === false) {
    warnings.push('Manifest site secret scan failed.')
  }

  if (matchingSite.sourceValidationOk === false || matchingSite.releaseValidationOk === false) {
    warnings.push('Manifest site validator result failed.')
  }

  if (matchingSite.canonicalOk === false) {
    warnings.push('Manifest site canonical sitemap check failed.')
  }

  if (summary.pagesNeedingRebuild > 0) {
    warnings.push(`${summary.pagesNeedingRebuild} current CMS page(s) still show staticPublishing.needsRebuild.`)
  }

  const latestChangeAt = getLatestPageChangeAt(pages)
  if (latestChangeAt && manifest.generatedAt && new Date(manifest.generatedAt).getTime() < new Date(latestChangeAt).getTime()) {
    warnings.push(`Manifest was generated before the latest recorded page edit (${formatDateTime(latestChangeAt)}).`)
  }

  return warnings
}

function createHistoryEntry(manifest: DryRunManifest): DryRunHistoryEntry {
  const readyCount = manifest.sites.filter((site) => site.readyForManualUpload === true).length
  const warningCount = manifest.sites.reduce((sum, site) => sum + getSiteWarningCount(site), 0)

  return {
    id: `${manifest.runId}-${Date.now()}`,
    runId: manifest.runId,
    importedAt: new Date().toISOString(),
    generatedAt: manifest.generatedAt,
    contentSource: manifest.contentSource,
    sites: manifest.sites.map((site) => site.siteKey),
    readyCount,
    warningCount,
    releaseFolder: manifest.releaseFolder,
  }
}

function buildPublishRunFromManifest(
  manifest: DryRunManifest,
  tenantId: string,
  expectedDomain: string,
  correlationWarnings: string[],
): PublishRun {
  const matchingSite = manifest.sites.find((site) => site.siteKey === tenantId)
  if (!matchingSite) {
    throw new Error(`Manifest does not include selected tenant ${tenantId}.`)
  }

  if (expectedDomain && matchingSite.domain !== expectedDomain) {
    throw new Error(`Manifest domain ${matchingSite.domain || 'missing'} does not match expected ${expectedDomain}.`)
  }

  const source = normalizePublishRunSource(manifest.contentSource)
  const warningCount = getSiteWarningCount(matchingSite) + correlationWarnings.length
  const status = derivePublishRunStatus(matchingSite, warningCount)

  return {
    id: `${tenantId}-${sanitizeId(manifest.runId)}`,
    tenantId,
    siteKey: tenantId,
    domain: matchingSite.domain,
    runId: manifest.runId,
    source,
    runType: 'static_dry_run',
    status,
    releaseFolder: sanitizeRelativePath(manifest.releaseFolder),
    manifestPath: sanitizeRelativePath(manifest.manifestPath),
    summaryPath: sanitizeRelativePath(manifest.summaryPath),
    createdAt: manifest.generatedAt,
    importedAt: new Date().toISOString(),
    createdBy: 'Pumpkin CMS Admin',
    notes: 'Imported from Publish Action Center dry-run manifest viewer.',
    sites: manifest.sites.map((site) => ({
      siteKey: site.siteKey,
      displayName: site.displayName,
      domain: site.domain,
      uploadRoot: sanitizeRelativePath(site.uploadRoot),
      fileCount: site.fileCount || 0,
      redirectCount: site.redirectCount || 0,
      pageQualityWarningCount: site.pageQualityWarningCount || 0,
      contentWarningCount: site.contentWarningCount || 0,
      readyForManualUpload: site.readyForManualUpload === true,
      sourceValidationOk: site.sourceValidationOk,
      releaseValidationOk: site.releaseValidationOk,
      canonicalOk: site.canonicalOk,
      secretScanOk: site.secretScanOk,
      warnings: [],
      errors: [],
    })),
    pageCount: 0,
    fileCount: matchingSite.fileCount || 0,
    redirectCount: matchingSite.redirectCount || 0,
    pageQualityWarningCount: matchingSite.pageQualityWarningCount || 0,
    contentWarningCount: matchingSite.contentWarningCount || 0,
    readyForManualUpload: matchingSite.readyForManualUpload === true,
    errors: [],
    warnings: correlationWarnings.slice(0, 20),
    manifestSummary: {
      runId: manifest.runId,
      generatedAt: manifest.generatedAt,
      releaseFolder: sanitizeRelativePath(manifest.releaseFolder),
      contentSource: source,
      deploymentAttempted: manifest.deploymentAttempted,
      cloudflareModified: manifest.cloudflareModified,
      siteCount: manifest.sites.length,
      ok: manifest.ok,
    },
    deploymentTarget: 'none',
    deployedAt: '',
    deploymentStatus: 'not_deployed',
  }
}

function loadHistory() {
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map(normalizeHistoryEntry)
      .filter((entry): entry is DryRunHistoryEntry => Boolean(entry))
      .slice(0, HISTORY_LIMIT)
  } catch {
    return []
  }
}

function saveHistory(history: DryRunHistoryEntry[]) {
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history))
}

function normalizeHistoryEntry(raw: unknown): DryRunHistoryEntry | null {
  const record = optionalRecord(raw)
  if (!record) return null

  return {
    id: stringValue(record.id) || `${stringValue(record.runId)}-${stringValue(record.importedAt)}`,
    runId: stringValue(record.runId),
    importedAt: stringValue(record.importedAt),
    generatedAt: stringValue(record.generatedAt),
    contentSource: stringValue(record.contentSource),
    sites: Array.isArray(record.sites) ? record.sites.map(stringValue).filter(Boolean) : [],
    readyCount: numberValue(record.readyCount) ?? 0,
    warningCount: numberValue(record.warningCount) ?? 0,
    releaseFolder: stringValue(record.releaseFolder),
  }
}

function normalizePublishRunSource(value: string): PublishRunSource {
  if (value === 'cms-snapshot' || value === 'seed-sites' || value === 'manual') {
    return value
  }

  return 'unknown'
}

function derivePublishRunStatus(site: DryRunSite, warningCount: number): PublishRunStatus {
  if (
    site.secretScanOk === false ||
    site.sourceValidationOk === false ||
    site.releaseValidationOk === false ||
    site.canonicalOk === false
  ) {
    return 'failed'
  }

  if (site.readyForManualUpload === true && warningCount === 0) {
    return 'ready_for_manual_upload'
  }

  if (site.readyForManualUpload === true) {
    return 'completed_with_warnings'
  }

  return 'imported'
}

function getPublishRunWarningCount(run: PublishRun) {
  return run.contentWarningCount +
    run.pageQualityWarningCount +
    run.warnings.length +
    run.sites.reduce((count, site) => count + site.warnings.length + site.contentWarningCount + site.pageQualityWarningCount, 0)
}

function formatRunStatus(status: string) {
  return status.replace(/_/g, ' ')
}

function sanitizeId(value: string) {
  const sanitized = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return sanitized || `run-${Date.now()}`
}

function sanitizeRelativePath(value: string) {
  const clean = value.replace(/\\/g, '/').trim()
  const lower = clean.toLowerCase()
  if (!clean || clean.startsWith('/') || clean.startsWith('~') || clean.startsWith('//')) return ''
  if (clean.length > 1 && clean[1] === ':') return ''
  if (lower.includes('.env') || lower.includes('appsettings')) return ''
  return clean
}

function getLatestPageChangeAt(pages: Page[]) {
  const timestamps = pages.flatMap((page) => [
    page.revision?.lastChangeAt,
    page.revision?.lastRevisionAt,
    page.workflow?.lastEditedAt,
    page.MetaData?.updatedAt,
    page.staticPublishing?.lastSnapshotAt,
    page.staticPublishing?.lastStaticBuildAt,
  ])

  const latest = timestamps
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((first, second) => second.getTime() - first.getTime())[0]

  return latest ? latest.toISOString() : ''
}

function getTenantWarningCount(summary: TenantPublishingSummary) {
  return summary.pageReadiness.reduce((count, item) => count + item.warnings.length + item.errors.length, 0)
}

function getSiteWarningCount(site: DryRunSite) {
  return site.contentWarningCount +
    (site.pageQualityWarningCount || 0) +
    (site.secretScanOk === false ? 1 : 0) +
    (site.sourceValidationOk === false ? 1 : 0) +
    (site.releaseValidationOk === false ? 1 : 0) +
    (site.canonicalOk === false ? 1 : 0)
}

function requireRecord(value: unknown, label: string) {
  const record = optionalRecord(value)
  if (!record) {
    throw new Error(`${label} must be a JSON object.`)
  }
  return record
}

function optionalRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function numberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function booleanValue(value: unknown) {
  return typeof value === 'boolean' ? value : null
}

function getArrayLength(value: unknown) {
  return Array.isArray(value) ? value.length : 0
}

function formatNullableNumber(value: number | null) {
  return value === null ? 'not recorded' : String(value)
}

function formatNullableBoolean(value: boolean | null) {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return 'not recorded'
}

function formatDateTime(value: string) {
  if (!value) return 'not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
