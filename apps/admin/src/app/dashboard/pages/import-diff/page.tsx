'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import {
  IMPORT_DIFF_HANDOFF_STORAGE_KEY,
  buildImportDiffReport,
  type ImportDiffMode,
  type ImportDiffPageResult,
  type ImportDiffReport,
  type ImportDiffRiskCategory,
} from '@/lib/import-diff'
import type { Page } from 'pumpkin-ts-models'

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

const IMPORT_HANDOFF_STORAGE_KEY = 'pumpkin:page-import-handoff:v1'
const MODE_OPTIONS: ImportDiffMode[] = ['dry-run', 'upsert', 'create-only', 'update-only']

const RISK_LABELS: Record<ImportDiffRiskCategory, string> = {
  seo: 'SEO risk',
  slug_redirect: 'Slug/redirect risk',
  publishing: 'Publishing risk',
  media: 'Media risk',
  fulfillment_ads: 'Fulfillment/Ads risk',
  form_lead_capture: 'Form/lead capture risk',
  destructive_overwrite: 'Destructive overwrite risk',
  tenant_mismatch: 'Tenant mismatch',
  static_rebuild: 'Static rebuild needed',
}

export default function ImportDiffPreviewPage() {
  const router = useRouter()
  const { token, user, currentTenant } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loadingPages, setLoadingPages] = useState(true)
  const [jsonText, setJsonText] = useState('')
  const [mode, setMode] = useState<ImportDiffMode>('dry-run')
  const [report, setReport] = useState<ImportDiffReport | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tenantId = currentTenant?.tenantId || ''
  const hasJson = jsonText.trim().length > 0

  const loadPages = useCallback(async () => {
    if (!token || !currentTenant) {
      setPages([])
      setLoadingPages(false)
      return
    }

    try {
      setLoadingPages(true)
      setError(null)
      const tenantPages = await apiClient.getPages(token, currentTenant.tenantId)
      setPages(tenantPages)
    } catch (loadError) {
      setError(getErrorMessage(loadError, 'Failed to load tenant pages for diff preview.'))
    } finally {
      setLoadingPages(false)
    }
  }, [token, currentTenant])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  useEffect(() => {
    if (!currentTenant) return

    try {
      const rawHandoff = window.localStorage.getItem(IMPORT_DIFF_HANDOFF_STORAGE_KEY)
      if (!rawHandoff) return

      const handoff = JSON.parse(rawHandoff)
      if (!isRecord(handoff)) {
        window.localStorage.removeItem(IMPORT_DIFF_HANDOFF_STORAGE_KEY)
        return
      }

      const handoffTenantId = stringValue(handoff.tenantId)
      const rawJson = stringValue(handoff.rawJson)
      const packageName = stringValue(handoff.packageName) || 'staged package'
      const handoffMode = stringValue(handoff.importMode) as ImportDiffMode

      if (handoffTenantId && handoffTenantId !== currentTenant.tenantId) {
        setNotice(`A diff handoff for ${handoffTenantId} is waiting, but the selected tenant is ${currentTenant.tenantId}. Switch tenants before previewing it.`)
        return
      }

      if (rawJson.trim()) {
        setJsonText(rawJson)
        setMode(MODE_OPTIONS.includes(handoffMode) ? handoffMode : 'dry-run')
        setReport(null)
        setError(null)
        setNotice(`Loaded "${packageName}" for no-write diff preview.`)
        window.localStorage.removeItem(IMPORT_DIFF_HANDOFF_STORAGE_KEY)
      }
    } catch {
      window.localStorage.removeItem(IMPORT_DIFF_HANDOFF_STORAGE_KEY)
      setError('Unable to load the diff preview handoff. Paste or upload JSON instead.')
    }
  }, [currentTenant])

  const riskTotals = useMemo(() => {
    if (!report) return []
    const counts = new Map<ImportDiffRiskCategory, number>()
    report.results.forEach((result) => {
      result.riskCategories.forEach((category) => {
        counts.set(category, (counts.get(category) || 0) + 1)
      })
    })
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [report])

  function runDiffPreview() {
    if (!currentTenant) return

    const nextReport = buildImportDiffReport({
      currentPages: pages,
      incomingJson: jsonText,
      tenantId: currentTenant.tenantId,
      mode,
    })

    setReport(nextReport)
    setError(null)
    setNotice(`Diff preview complete: ${nextReport.createCount} creates, ${nextReport.updateCount} updates, ${nextReport.skipCount} skips, ${nextReport.conflictCount} conflicts. No pages were written.`)
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setJsonText(text)
      setReport(null)
      setError(null)
      setNotice(`Loaded ${file.name}. Run diff preview before importing.`)
    } catch {
      setError(`Unable to read ${file.name}.`)
      setNotice(null)
    } finally {
      event.target.value = ''
    }
  }

  function downloadReport() {
    if (!report) return
    downloadJson(`${report.tenantId}-import-diff-${report.generatedAt.replace(/[:.]/g, '-')}.json`, report)
  }

  async function copySummary() {
    if (!report) return

    try {
      await navigator.clipboard.writeText(buildReportSummary(report))
      setNotice('Copied diff summary to the clipboard.')
      setError(null)
    } catch {
      setError('Unable to copy diff summary.')
      setNotice(null)
    }
  }

  function openImportExport() {
    if (!currentTenant || !jsonText.trim()) {
      router.push('/dashboard/pages/import-export')
      return
    }

    try {
      window.localStorage.setItem(IMPORT_HANDOFF_STORAGE_KEY, JSON.stringify({
        packageName: 'Import Diff Preview JSON',
        tenantId: currentTenant.tenantId,
        rawJson: jsonText,
        handedOffAt: new Date().toISOString(),
      }))
      router.push('/dashboard/pages/import-export')
    } catch {
      setError('Unable to prepare Import/Export handoff. Copy or download the JSON instead.')
      setNotice(null)
    }
  }

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to preview import diffs.</p>
      </div>
    )
  }

  if (!currentTenant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">No Tenant Selected</h1>
        <p className="text-neutral-600">Select a tenant/site before previewing import changes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/pages/import-export')}
            className="mb-3 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Back to import/export
          </button>
          <h1 className="text-3xl font-bold text-neutral-900">Import Diff Preview</h1>
          <p className="mt-1 max-w-3xl text-neutral-600">
            Compare incoming Page JSON against current CMS pages for {currentTenant.name || currentTenant.tenantId} before any import write mode.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Preview only. This page does not import, save, publish, deploy, purge, or create revisions.
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

      <Section title="Incoming JSON" description="Paste or upload a Page document, Page array, or wrapped export object with pages[].">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Import mode context</span>
            <select value={mode} onChange={(event) => setMode(event.target.value as ImportDiffMode)} className="input">
              {MODE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Upload JSON</span>
            <input type="file" accept="application/json,.json" onChange={handleFileUpload} className="input" />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={runDiffPreview}
              disabled={loadingPages || !hasJson}
              className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingPages ? 'Loading CMS pages...' : 'Run Diff Preview'}
            </button>
          </div>
        </div>

        <textarea
          value={jsonText}
          onChange={(event) => {
            setJsonText(event.target.value)
            setReport(null)
          }}
          rows={14}
          className="input font-mono text-xs"
          spellCheck={false}
          placeholder='Paste {"tenantId":"ice-rink-rentals","pages":[...]} or a single Page JSON document.'
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-neutral-600">
            Current CMS pages loaded for tenant: <span className="font-semibold text-neutral-900">{pages.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => router.push('/dashboard/pages/content-packages')} className="btn btn-secondary">
              Content Packages
            </button>
            <button type="button" onClick={() => router.push('/dashboard/pages/content-validator')} className="btn btn-secondary">
              Contract Validator
            </button>
          </div>
        </div>
      </Section>

      {report && (
        <>
          <Section title="Diff Summary" description="Creates, updates, skips, conflicts, warnings, and errors are preview-only.">
            <div className="grid gap-3 md:grid-cols-7">
              <Metric label="Incoming" value={report.incomingCount} />
              <Metric label="Creates" value={report.createCount} tone={report.createCount > 0 ? 'ok' : 'neutral'} />
              <Metric label="Updates" value={report.updateCount} tone={report.updateCount > 0 ? 'warn' : 'neutral'} />
              <Metric label="Skips" value={report.skipCount} />
              <Metric label="Conflicts" value={report.conflictCount} tone={report.conflictCount > 0 ? 'error' : 'ok'} />
              <Metric label="Errors" value={report.errorCount} tone={report.errorCount > 0 ? 'error' : 'ok'} />
              <Metric label="Warnings" value={report.warningCount} tone={report.warningCount > 0 ? 'warn' : 'ok'} />
            </div>

            {riskTotals.length > 0 && (
              <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Risk Groups</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {riskTotals.map(([risk, count]) => (
                    <span key={risk} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                      {RISK_LABELS[risk]}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={copySummary} className="btn btn-secondary">Copy Summary</button>
              <button type="button" onClick={downloadReport} className="btn btn-secondary">Download Diff Report</button>
              <button type="button" onClick={openImportExport} className="btn btn-primary">Open Import/Export With This JSON</button>
            </div>
          </Section>

          <Section title="Page Change Preview" description="Summaries show major field changes. Review raw JSON in the report if deeper inspection is needed.">
            {(report.payloadErrors.length > 0 || report.payloadWarnings.length > 0) && (
              <IssueList
                title="Payload Issues"
                errors={report.payloadErrors.map((issue) => issue.message)}
                warnings={report.payloadWarnings.map((issue) => issue.message)}
              />
            )}

            <div className="overflow-x-auto rounded-md border border-neutral-200">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Page</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Action</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Match</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Changes</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Risks</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {report.results.map((result) => (
                    <tr key={`${result.index}-${result.incomingSlug}-${result.action}`}>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-semibold text-neutral-900">{result.title}</div>
                        <div className="mt-1 font-mono text-xs text-neutral-500">
                          incoming: {result.incomingSlug || 'missing slug'}
                        </div>
                        {result.existingSlug && (
                          <div className="mt-1 font-mono text-xs text-neutral-500">
                            existing: {result.existingSlug}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm"><ActionBadge action={result.action} /></td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{result.matchedBy}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{result.changes.length}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {result.riskCategories.length === 0 ? (
                            <span className="text-neutral-500">none</span>
                          ) : result.riskCategories.map((risk) => (
                            <span key={risk} className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                              {RISK_LABELS[risk]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <PageDiffDetails result={result} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </>
      )}
    </div>
  )
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </section>
  )
}

function Metric({ label, value, tone = 'neutral' }: { label: string; value: string | number; tone?: 'neutral' | 'ok' | 'warn' | 'error' }) {
  const styles = {
    neutral: 'border-neutral-200 bg-neutral-50 text-neutral-900',
    ok: 'border-green-200 bg-green-50 text-green-900',
    warn: 'border-amber-200 bg-amber-50 text-amber-900',
    error: 'border-red-200 bg-red-50 text-red-900',
  }[tone]

  return (
    <div className={`rounded-lg border px-4 py-3 ${styles}`}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-70">{label}</div>
      <div className="mt-1 break-words text-xl font-bold">{value}</div>
    </div>
  )
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    create: 'bg-green-100 text-green-800',
    update: 'bg-blue-100 text-blue-800',
    skip: 'bg-neutral-100 text-neutral-700',
    conflict: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
  }

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[action] || styles.skip}`}>
      {action}
    </span>
  )
}

function PageDiffDetails({ result }: { result: ImportDiffPageResult }) {
  return (
    <details className="max-w-xl">
      <summary className="cursor-pointer text-sm font-medium text-primary-700 hover:text-primary-900">Review</summary>
      <div className="mt-3 space-y-3">
        <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
          <div>Published overwrite: {result.wouldOverwritePublishedPage ? 'yes' : 'no'}</div>
          <div>Slug change: {result.wouldChangeSlug ? 'yes' : 'no'}</div>
          <div>Rollback available on existing page: {result.rollbackAvailable ? 'yes' : 'no'}</div>
          <div>Static rebuild after import: {result.staticRebuildNeeded ? 'yes' : 'no'}</div>
        </div>

        <IssueList
          title="Messages"
          errors={result.errors.map((issue) => issue.message)}
          warnings={result.warnings.map((issue) => issue.message)}
        />

        {result.changes.length === 0 ? (
          <div className="text-sm text-neutral-500">No summarized field changes.</div>
        ) : (
          <div className="space-y-2">
            {result.changes.map((change) => (
              <div key={change.field} className="rounded-md border border-neutral-200 bg-white px-3 py-2">
                <div className="font-semibold text-neutral-900">{change.label}</div>
                <div className="mt-1 grid gap-2 text-xs text-neutral-700 md:grid-cols-2">
                  <div><span className="font-medium">Before:</span> {change.before}</div>
                  <div><span className="font-medium">After:</span> {change.after}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </details>
  )
}

function IssueList({ title, errors, warnings }: { title: string; errors: string[]; warnings: string[] }) {
  if (errors.length === 0 && warnings.length === 0) {
    return <div className="text-sm text-neutral-500">{title}: none</div>
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</div>
      <div className="mt-1 space-y-1">
        {errors.map((message) => <div key={`error-${message}`} className="text-sm text-red-700">{message}</div>)}
        {warnings.map((message) => <div key={`warning-${message}`} className="text-sm text-amber-700">{message}</div>)}
      </div>
    </div>
  )
}

function buildReportSummary(report: ImportDiffReport) {
  return [
    `Import Diff Preview - ${report.tenantId}`,
    `Generated: ${report.generatedAt}`,
    `Mode: ${report.mode}`,
    `Incoming: ${report.incomingCount}`,
    `Creates: ${report.createCount}`,
    `Updates: ${report.updateCount}`,
    `Skips: ${report.skipCount}`,
    `Conflicts: ${report.conflictCount}`,
    `Errors: ${report.errorCount}`,
    `Warnings: ${report.warningCount}`,
    'No pages were imported, saved, published, deployed, or purged by this preview.',
  ].join('\n')
}

function downloadJson(fileName: string, value: unknown) {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }
  return fallback
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown) {
  if (value === null || value === undefined) return ''
  return typeof value === 'string' ? value : String(value)
}
