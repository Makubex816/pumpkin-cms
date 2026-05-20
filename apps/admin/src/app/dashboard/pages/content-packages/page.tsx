'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  TEMPLATE_CONTRACTS,
  getTemplateKeys,
  validateContentJsonText,
  type ContentContractReport,
  type PageContractResult,
  type TemplateSelection,
} from '@/lib/content-json-contracts'
import { IMPORT_DIFF_HANDOFF_STORAGE_KEY } from '@/lib/import-diff'

type PackageStatus = 'draft' | 'needs_review' | 'ready_for_import' | 'rejected'

interface StagedContentPackage {
  packageId: string
  packageName: string
  tenantId: string
  sourceLabel: string
  createdAt: string
  updatedAt: string
  status: PackageStatus
  notes: string
  rawJson: string
  pageCount: number
  validationSummary: {
    generatedAt: string
    errorCount: number
    warningCount: number
    payloadErrorCount: number
    payloadWarningCount: number
    templateDistribution: Record<string, number>
  }
  perPageResults: PageContractResult[]
  validationReport: ContentContractReport
  selectedTemplate: TemplateSelection
}

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

const PACKAGE_STORAGE_KEY = 'pumpkin:content-packages:v1'
const IMPORT_HANDOFF_STORAGE_KEY = 'pumpkin:page-import-handoff:v1'
const TEMPLATE_OPTIONS: TemplateSelection[] = ['auto', ...getTemplateKeys()]

export default function ContentPackagesPage() {
  const router = useRouter()
  const { token, user, currentTenant } = useAuth()
  const [packages, setPackages] = useState<StagedContentPackage[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const [packageName, setPackageName] = useState('')
  const [sourceLabel, setSourceLabel] = useState('external_content_generation')
  const [notes, setNotes] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSelection>('auto')
  const [jsonText, setJsonText] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tenantId = currentTenant?.tenantId || ''
  const tenantPackages = useMemo(
    () => packages
      .filter((item) => item.tenantId === tenantId)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [packages, tenantId],
  )
  const selectedPackage = tenantPackages.find((item) => item.packageId === selectedPackageId) || tenantPackages[0] || null
  const totals = useMemo(() => buildQueueTotals(tenantPackages), [tenantPackages])

  useEffect(() => {
    setPackages(loadPackages())
  }, [])

  useEffect(() => {
    if (!selectedPackage && tenantPackages.length > 0) {
      setSelectedPackageId(tenantPackages[0].packageId)
    }

    if (selectedPackage && selectedPackage.tenantId !== tenantId) {
      setSelectedPackageId('')
    }
  }, [selectedPackage, tenantPackages, tenantId])

  function persistPackages(nextPackages: StagedContentPackage[]) {
    setPackages(nextPackages)
    try {
      window.localStorage.setItem(PACKAGE_STORAGE_KEY, JSON.stringify(nextPackages))
    } catch {
      setError('Unable to save staged packages in browser localStorage.')
    }
  }

  function stagePackage() {
    if (!tenantId) return
    if (!jsonText.trim()) {
      setError('Paste or upload content JSON before staging a package.')
      setNotice(null)
      return
    }

    const validationReport = validateContentJsonText(jsonText, {
      expectedTenantId: tenantId,
      selectedTemplate,
    })
    const now = new Date().toISOString()
    const packageId = buildPackageId(packageName || 'content-package', now)
    const stagedPackage: StagedContentPackage = {
      packageId,
      packageName: packageName.trim() || `Content package ${now}`,
      tenantId,
      sourceLabel: sourceLabel.trim() || 'external_content_generation',
      createdAt: now,
      updatedAt: now,
      status: validationReport.errorCount > 0 ? 'needs_review' : 'draft',
      notes,
      rawJson: jsonText,
      pageCount: validationReport.pageCount,
      validationSummary: summarizeReport(validationReport),
      perPageResults: validationReport.results,
      validationReport,
      selectedTemplate,
    }

    persistPackages([stagedPackage, ...packages.filter((item) => item.packageId !== packageId)])
    setSelectedPackageId(packageId)
    setError(null)
    setNotice(`Staged "${stagedPackage.packageName}" with ${validationReport.errorCount} errors and ${validationReport.warningCount} warnings. No pages were written.`)
  }

  function revalidatePackage(packageId: string) {
    const item = packages.find((candidate) => candidate.packageId === packageId)
    if (!item) return

    const validationReport = validateContentJsonText(item.rawJson, {
      expectedTenantId: item.tenantId,
      selectedTemplate: item.selectedTemplate,
    })
    const updatedPackage: StagedContentPackage = {
      ...item,
      updatedAt: new Date().toISOString(),
      status: validationReport.errorCount > 0 && item.status === 'ready_for_import' ? 'needs_review' : item.status,
      pageCount: validationReport.pageCount,
      validationSummary: summarizeReport(validationReport),
      perPageResults: validationReport.results,
      validationReport,
    }

    persistPackages(packages.map((candidate) => candidate.packageId === packageId ? updatedPackage : candidate))
    setSelectedPackageId(packageId)
    setError(null)
    setNotice(`Revalidated "${updatedPackage.packageName}". No pages were written.`)
  }

  function updatePackageStatus(packageId: string, status: PackageStatus) {
    const currentPackage = packages.find((item) => item.packageId === packageId)
    if (status === 'ready_for_import' && currentPackage && currentPackage.validationSummary.errorCount > 0) {
      setError('Packages with validation errors cannot be marked ready for import. Fix or reject the package first.')
      setNotice(null)
      return
    }

    const now = new Date().toISOString()
    const nextPackages = packages.map((item) => (
      item.packageId === packageId ? { ...item, status, updatedAt: now } : item
    ))
    persistPackages(nextPackages)
    setSelectedPackageId(packageId)
    setNotice(`Package marked ${status.replace(/_/g, ' ')}. No pages were imported or published.`)
    setError(null)
  }

  function exportPackageJson(item: StagedContentPackage) {
    downloadText(`${item.packageId}.json`, item.rawJson, 'application/json')
  }

  function downloadValidationReport(item: StagedContentPackage) {
    downloadJson(`${item.packageId}-validation-report.json`, item.validationReport)
  }

  async function copyPackageJson(item: StagedContentPackage) {
    try {
      await navigator.clipboard.writeText(item.rawJson)
      setNotice(`Copied JSON for "${item.packageName}" to the clipboard.`)
      setError(null)
    } catch {
      setError('Clipboard copy failed. Use Download Package JSON instead.')
      setNotice(null)
    }
  }

  async function copySummary(item: StagedContentPackage) {
    try {
      await navigator.clipboard.writeText(buildPackageSummary(item))
      setNotice(`Copied review summary for "${item.packageName}".`)
      setError(null)
    } catch {
      setError('Clipboard copy failed. Use the visible summary instead.')
      setNotice(null)
    }
  }

  function openImportExport(item: StagedContentPackage) {
    try {
      window.localStorage.setItem(IMPORT_HANDOFF_STORAGE_KEY, JSON.stringify({
        packageId: item.packageId,
        packageName: item.packageName,
        tenantId: item.tenantId,
        rawJson: item.rawJson,
        handedOffAt: new Date().toISOString(),
      }))
      router.push('/dashboard/pages/import-export')
    } catch {
      setError('Unable to prepare Import/Export handoff. Download or copy the package JSON instead.')
      setNotice(null)
    }
  }

  function openImportDiff(item: StagedContentPackage) {
    try {
      window.localStorage.setItem(IMPORT_DIFF_HANDOFF_STORAGE_KEY, JSON.stringify({
        packageId: item.packageId,
        packageName: item.packageName,
        tenantId: item.tenantId,
        rawJson: item.rawJson,
        importMode: 'dry-run',
        handedOffAt: new Date().toISOString(),
      }))
      router.push('/dashboard/pages/import-diff')
    } catch {
      setError('Unable to prepare Import Diff handoff. Download or copy the package JSON instead.')
      setNotice(null)
    }
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setJsonText(text)
      if (!packageName.trim()) {
        setPackageName(file.name.replace(/\.json$/i, ''))
      }
      setNotice(`Loaded ${file.name}. Stage the package to run validation and add it to the review queue.`)
      setError(null)
    } catch {
      setError(`Unable to read ${file.name}.`)
      setNotice(null)
    } finally {
      event.target.value = ''
    }
  }

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to stage content packages.</p>
      </div>
    )
  }

  if (!currentTenant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">No Tenant Selected</h1>
        <p className="text-neutral-600">Select a tenant/site before staging content packages.</p>
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
          <h1 className="text-3xl font-bold text-neutral-900">Content Package Staging</h1>
          <p className="mt-1 max-w-3xl text-neutral-600">
            Stage externally generated content JSON, review contract validation, and mark packages ready before intentionally importing elsewhere.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Review queue only. This page does not import, save, publish, deploy, or purge.
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

      <Section title="Stage Package" description="Paste or upload a Page JSON document, Page array, or wrapped export object with pages[]. Staging validates and stores a browser-local review record only.">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Package name</span>
            <input value={packageName} onChange={(event) => setPackageName(event.target.value)} className="input" placeholder="Example: first-state-content-pack" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Source label</span>
            <input value={sourceLabel} onChange={(event) => setSourceLabel(event.target.value)} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Template contract</span>
            <select value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value as TemplateSelection)} className="input">
              {TEMPLATE_OPTIONS.map((template) => (
                <option key={template} value={template}>
                  {template === 'auto' ? 'Auto-detect' : TEMPLATE_CONTRACTS[template].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Upload JSON</span>
            <input type="file" accept="application/json,.json" onChange={handleFileUpload} className="input" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Notes</span>
          <input value={notes} onChange={(event) => setNotes(event.target.value)} className="input" placeholder="Optional review notes for this package." />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">Package JSON</span>
          <textarea
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            rows={14}
            className="input font-mono text-xs"
            spellCheck={false}
            placeholder='Paste {"tenantId":"ice-rink-rentals","pages":[...]} or a single Page JSON document.'
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-neutral-600">
            Expected tenant: <span className="font-mono font-semibold text-neutral-900">{tenantId}</span>
          </div>
          <button type="button" onClick={stagePackage} className="btn btn-primary">
            Stage And Validate Package
          </button>
        </div>
      </Section>

      <Section title="Review Queue" description="Browser-local package staging. Ready/rejected only changes review status; imports stay in the existing Import/Export workflow.">
        <div className="grid gap-3 md:grid-cols-5">
          <Metric label="Packages" value={tenantPackages.length} />
          <Metric label="Pages" value={totals.pageCount} />
          <Metric label="Errors" value={totals.errorCount} tone={totals.errorCount > 0 ? 'error' : 'ok'} />
          <Metric label="Warnings" value={totals.warningCount} tone={totals.warningCount > 0 ? 'warn' : 'ok'} />
          <Metric label="Ready" value={totals.readyCount} tone={totals.readyCount > 0 ? 'ok' : 'neutral'} />
        </div>

        {tenantPackages.length === 0 ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            No staged content packages for this tenant yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Package</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Pages</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Issues</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Templates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {tenantPackages.map((item) => {
                  const isSelected = selectedPackage?.packageId === item.packageId
                  return (
                    <tr key={item.packageId} className={isSelected ? 'bg-primary-50/60' : undefined}>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          onClick={() => setSelectedPackageId(item.packageId)}
                          className="text-left font-semibold text-neutral-900 hover:text-primary-700"
                        >
                          {item.packageName}
                        </button>
                        <div className="mt-1 font-mono text-xs text-neutral-500">{item.packageId}</div>
                        <div className="mt-1 text-xs text-neutral-500">Updated {formatDateTime(item.updatedAt)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{item.pageCount}</td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {item.validationSummary.errorCount} errors / {item.validationSummary.warningCount} warnings
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">{formatTemplateDistribution(item.validationSummary.templateDistribution)}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" onClick={() => setSelectedPackageId(item.packageId)} className="btn btn-secondary text-xs">View</button>
                          <button type="button" onClick={() => revalidatePackage(item.packageId)} className="btn btn-secondary text-xs">Revalidate</button>
                          <button type="button" onClick={() => updatePackageStatus(item.packageId, 'ready_for_import')} className="btn btn-secondary text-xs">Mark Ready</button>
                          <button type="button" onClick={() => updatePackageStatus(item.packageId, 'rejected')} className="btn btn-secondary text-xs">Reject</button>
                          <button type="button" onClick={() => exportPackageJson(item)} className="btn btn-secondary text-xs">Export JSON</button>
                          <button type="button" onClick={() => downloadValidationReport(item)} className="btn btn-secondary text-xs">Report</button>
                          <button type="button" onClick={() => openImportDiff(item)} className="btn btn-secondary text-xs">Preview Diff</button>
                          <button type="button" onClick={() => openImportExport(item)} className="btn btn-primary text-xs">Go To Import/Export</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {selectedPackage && (
        <Section title="Package Detail" description="Review validation results before deciding whether this package is ready for the separate import workflow.">
          <div className="grid gap-3 md:grid-cols-3">
            <ReadOnlyDetail label="Package" value={selectedPackage.packageName} />
            <ReadOnlyDetail label="Tenant" value={selectedPackage.tenantId} />
            <ReadOnlyDetail label="Source" value={selectedPackage.sourceLabel} />
            <ReadOnlyDetail label="Status" value={selectedPackage.status.replace(/_/g, ' ')} />
            <ReadOnlyDetail label="Created" value={formatDateTime(selectedPackage.createdAt)} />
            <ReadOnlyDetail label="Updated" value={formatDateTime(selectedPackage.updatedAt)} />
          </div>

          {selectedPackage.notes && (
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              {selectedPackage.notes}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => updatePackageStatus(selectedPackage.packageId, 'ready_for_import')} className="btn btn-secondary">Mark Ready</button>
            <button type="button" onClick={() => updatePackageStatus(selectedPackage.packageId, 'rejected')} className="btn btn-secondary">Reject</button>
            <button type="button" onClick={() => copyPackageJson(selectedPackage)} className="btn btn-secondary">Copy Package JSON</button>
            <button type="button" onClick={() => copySummary(selectedPackage)} className="btn btn-secondary">Copy Summary</button>
            <button type="button" onClick={() => downloadValidationReport(selectedPackage)} className="btn btn-secondary">Download Validation Report</button>
            <button type="button" onClick={() => openImportDiff(selectedPackage)} className="btn btn-secondary">Preview Import Diff</button>
            <button type="button" onClick={() => openImportExport(selectedPackage)} className="btn btn-primary">Open Import/Export With This Package</button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Metric label="Pages" value={selectedPackage.pageCount} />
            <Metric label="Errors" value={selectedPackage.validationSummary.errorCount} tone={selectedPackage.validationSummary.errorCount > 0 ? 'error' : 'ok'} />
            <Metric label="Warnings" value={selectedPackage.validationSummary.warningCount} tone={selectedPackage.validationSummary.warningCount > 0 ? 'warn' : 'ok'} />
            <Metric label="Payload Issues" value={selectedPackage.validationSummary.payloadErrorCount + selectedPackage.validationSummary.payloadWarningCount} />
          </div>

          <div className="overflow-x-auto rounded-md border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Page</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Template</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Issues</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Messages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {selectedPackage.perPageResults.map((result) => (
                  <tr key={`${result.index}-${result.pageSlug}`}>
                    <td className="px-4 py-3 text-sm text-neutral-900">{result.title || 'Untitled page'}</td>
                    <td className="px-4 py-3 font-mono text-sm text-neutral-700">{result.pageSlug || 'missing slug'}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{result.templateKey}</td>
                    <td className="px-4 py-3 text-sm text-neutral-700">{result.errors.length} errors / {result.warnings.length} warnings</td>
                    <td className="px-4 py-3 text-sm">
                      <IssueMessages result={result} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
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

function ReadOnlyDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-neutral-900">{value || 'not recorded'}</div>
    </div>
  )
}

function StatusBadge({ status }: { status: PackageStatus }) {
  const styles: Record<PackageStatus, string> = {
    draft: 'border-neutral-200 bg-neutral-50 text-neutral-700',
    needs_review: 'border-amber-200 bg-amber-50 text-amber-800',
    ready_for_import: 'border-green-200 bg-green-50 text-green-800',
    rejected: 'border-red-200 bg-red-50 text-red-800',
  }

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

function IssueMessages({ result }: { result: PageContractResult }) {
  const messages = [...result.errors, ...result.warnings]
  if (messages.length === 0) {
    return <span className="text-neutral-500">No messages.</span>
  }

  return (
    <div className="max-h-56 space-y-2 overflow-y-auto">
      {messages.map((issue, index) => (
        <div
          key={`${issue.field}-${index}`}
          className={issue.severity === 'error' ? 'text-red-700' : 'text-amber-700'}
        >
          <div className="font-medium">{issue.message}</div>
          <div className="font-mono text-xs opacity-80">{issue.category} / {issue.field}</div>
        </div>
      ))}
    </div>
  )
}

function summarizeReport(report: ContentContractReport): StagedContentPackage['validationSummary'] {
  const templateDistribution = report.results.reduce<Record<string, number>>((counts, result) => {
    counts[result.templateKey] = (counts[result.templateKey] || 0) + 1
    return counts
  }, {})

  return {
    generatedAt: report.generatedAt,
    errorCount: report.errorCount,
    warningCount: report.warningCount,
    payloadErrorCount: report.payloadErrors.length,
    payloadWarningCount: report.payloadWarnings.length,
    templateDistribution,
  }
}

function buildQueueTotals(packages: StagedContentPackage[]) {
  return packages.reduce(
    (totals, item) => ({
      pageCount: totals.pageCount + item.pageCount,
      errorCount: totals.errorCount + item.validationSummary.errorCount,
      warningCount: totals.warningCount + item.validationSummary.warningCount,
      readyCount: totals.readyCount + (item.status === 'ready_for_import' ? 1 : 0),
    }),
    { pageCount: 0, errorCount: 0, warningCount: 0, readyCount: 0 },
  )
}

function formatTemplateDistribution(distribution: Record<string, number>) {
  const entries = Object.entries(distribution)
  if (entries.length === 0) return 'none'
  return entries.map(([key, count]) => `${key}: ${count}`).join(', ')
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

function buildPackageId(name: string, timestamp: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'content-package'
  return `${slug}-${timestamp.replace(/[:.]/g, '-').toLowerCase()}`
}

function loadPackages(): StagedContentPackage[] {
  try {
    const rawValue = window.localStorage.getItem(PACKAGE_STORAGE_KEY)
    if (!rawValue) return []
    const parsed = JSON.parse(rawValue)
    return Array.isArray(parsed) ? parsed.filter(isStagedPackage) : []
  } catch {
    return []
  }
}

function isStagedPackage(value: unknown): value is StagedContentPackage {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'packageId' in value &&
    'tenantId' in value &&
    'rawJson' in value &&
    'validationReport' in value,
  )
}

function downloadJson(fileName: string, value: unknown) {
  downloadText(fileName, JSON.stringify(value, null, 2), 'application/json')
}

function downloadText(fileName: string, text: string, mimeType: string) {
  const blob = new Blob([text], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function buildPackageSummary(item: StagedContentPackage) {
  return [
    `Package: ${item.packageName}`,
    `Tenant: ${item.tenantId}`,
    `Status: ${item.status}`,
    `Pages: ${item.pageCount}`,
    `Errors: ${item.validationSummary.errorCount}`,
    `Warnings: ${item.validationSummary.warningCount}`,
    `Templates: ${formatTemplateDistribution(item.validationSummary.templateDistribution)}`,
    `Updated: ${item.updatedAt}`,
    'No pages were imported, saved, deployed, or published by staging.',
  ].join('\n')
}
