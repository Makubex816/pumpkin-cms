'use client'

import { useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  TEMPLATE_CONTRACTS,
  getTemplateKeys,
  validateContentJsonText,
  type ContentContractReport,
  type ContractIssue,
  type TemplateSelection,
} from '@/lib/content-json-contracts'

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

const TEMPLATE_OPTIONS: TemplateSelection[] = ['auto', ...getTemplateKeys()]

export default function ContentJsonContractValidatorPage() {
  const router = useRouter()
  const { token, user, currentTenant } = useAuth()
  const [jsonText, setJsonText] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateSelection>('auto')
  const [report, setReport] = useState<ContentContractReport | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const selectedContract = selectedTemplate === 'auto' ? null : TEMPLATE_CONTRACTS[selectedTemplate]
  const displayedContracts = useMemo(() => (
    selectedContract ? [selectedContract] : getTemplateKeys().map((key) => TEMPLATE_CONTRACTS[key])
  ), [selectedContract])

  function validateJson() {
    if (!currentTenant) return
    if (!jsonText.trim()) {
      setError('Paste or upload Page JSON before validating.')
      setNotice(null)
      setReport(null)
      return
    }

    const nextReport = validateContentJsonText(jsonText, {
      expectedTenantId: currentTenant.tenantId,
      selectedTemplate,
    })

    setReport(nextReport)
    setError(null)
    setNotice(`Validation complete: ${nextReport.errorCount} errors, ${nextReport.warningCount} warnings. No pages were written.`)
  }

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setJsonText(text)
      setReport(null)
      setError(null)
      setNotice(`Loaded ${file.name}. Run validation before importing or publishing.`)
    } catch {
      setError(`Unable to read ${file.name}.`)
      setNotice(null)
    } finally {
      event.target.value = ''
    }
  }

  function downloadReport() {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${report.tenantId || 'tenant'}-content-contract-validation-${report.generatedAt.replace(/[:.]/g, '-')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to validate content JSON contracts.</p>
      </div>
    )
  }

  if (!currentTenant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">No Tenant Selected</h1>
        <p className="text-neutral-600">Select a tenant/site before validating content JSON.</p>
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
          <h1 className="text-3xl font-bold text-neutral-900">Content JSON Contract Validator</h1>
          <p className="mt-1 text-neutral-600">
            Dry-run externally generated Page JSON before import, static publishing, or production review.
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard/pages/content-packages')}
            className="mt-3 text-sm font-medium text-primary-700 hover:text-primary-900"
          >
            Open content package staging
          </button>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Validation only. This page does not import, save, publish, deploy, or purge.
        </div>
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>}
      {notice && <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

      <Section title="Validate JSON" description="Paste a Page document, Page array, or wrapped export object with pages[].">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Template contract</span>
            <select
              value={selectedTemplate}
              onChange={(event) => setSelectedTemplate(event.target.value as TemplateSelection)}
              className="input"
            >
              {TEMPLATE_OPTIONS.map((template) => (
                <option key={template} value={template}>
                  {template === 'auto' ? 'Auto-detect from template.templateKey' : TEMPLATE_CONTRACTS[template].label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Upload JSON</span>
            <input type="file" accept="application/json,.json" onChange={handleFileUpload} className="input" />
          </label>
          <div className="flex items-end gap-2">
            <button type="button" onClick={validateJson} className="btn btn-primary">
              Validate
            </button>
            <button
              type="button"
              onClick={downloadReport}
              disabled={!report}
              className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              Download Report
            </button>
          </div>
        </div>
        <textarea
          value={jsonText}
          onChange={(event) => {
            setJsonText(event.target.value)
            setReport(null)
          }}
          rows={16}
          className="input font-mono text-xs"
          placeholder='Paste {"tenantId":"ice-rink-rentals","pages":[...]} or a single Page JSON document.'
        />
      </Section>

      <Section title="Template Requirements" description="Contract requirements are visible before validation so external content can be generated against the right target.">
        <div className="grid gap-4 xl:grid-cols-2">
          {displayedContracts.map((contract) => (
            <div key={contract.key} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-neutral-900">{contract.label}</h2>
                <span className="rounded-full bg-white px-2 py-0.5 font-mono text-xs text-neutral-600">{contract.key}</span>
              </div>
              <p className="mt-2 text-sm text-neutral-600">{contract.description}</p>
              <div className="mt-4 grid gap-3 text-sm lg:grid-cols-2">
                <RequirementList label="Page fields" values={contract.requiredPageFields} />
                <RequirementList label="SEO" values={contract.requiredSeoFields} />
                <RequirementList label="Media slots" values={contract.requiredMediaSlots.map((slot) => `media.${slot}`)} />
                <RequirementList label="Required blocks" values={contract.requiredBlocks} />
                <RequirementList label="Allowed blocks" values={contract.allowedBlocks} />
                <RequirementList label="Fulfillment" values={contract.requiredFulfillmentFields} />
                <RequirementList label="Lead/form" values={[...contract.requiredLeadFields, ...contract.requiredFormLeadFields]} />
                <RequirementList label="Static/linking" values={[...contract.staticRequirements, ...contract.requiredInternalLinkFields]} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {report && (
        <Section title="Validation Report" description="Blocking errors should be fixed before import. Warnings are review items for publishing readiness.">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <Metric label="Pages" value={report.pageCount} />
            <Metric label="Errors" value={report.errorCount} tone={report.errorCount > 0 ? 'error' : 'ok'} />
            <Metric label="Warnings" value={report.warningCount} tone={report.warningCount > 0 ? 'warn' : 'ok'} />
            <Metric label="Template" value={report.selectedTemplate} />
          </div>

          {(report.payloadErrors.length > 0 || report.payloadWarnings.length > 0) && (
            <IssueList title="Payload Issues" issues={[...report.payloadErrors, ...report.payloadWarnings]} />
          )}

          <div className="space-y-4">
            {report.results.map((result) => (
              <div key={`${result.index}-${result.pageSlug}`} className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Page {result.index + 1}</div>
                    <h3 className="text-lg font-semibold text-neutral-900">{result.title || result.pageSlug || 'Untitled page'}</h3>
                    <p className="mt-1 font-mono text-xs text-neutral-600">
                      {result.tenantId || 'missing tenant'} / {result.pageSlug || 'missing slug'} / {result.templateKey}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={result.errors.length > 0 ? 'error' : 'ok'}>{result.errors.length} errors</Badge>
                    <Badge tone={result.warnings.length > 0 ? 'warn' : 'ok'}>{result.warnings.length} warnings</Badge>
                  </div>
                </div>
                {result.errors.length === 0 && result.warnings.length === 0 ? (
                  <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                    This page passed the selected contract with no issues.
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <IssueList title="Errors" issues={result.errors} />
                    <IssueList title="Warnings" issues={result.warnings} />
                  </div>
                )}
              </div>
            ))}
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

function RequirementList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 flex flex-wrap gap-1">
        {values.length === 0 ? (
          <span className="text-xs italic text-neutral-500">None required</span>
        ) : values.map((value) => (
          <span key={value} className="rounded bg-white px-2 py-1 font-mono text-xs text-neutral-700">
            {value}
          </span>
        ))}
      </div>
    </div>
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

function Badge({ tone, children }: { tone: 'ok' | 'warn' | 'error'; children: ReactNode }) {
  const styles = {
    ok: 'border-green-200 bg-green-50 text-green-800',
    warn: 'border-amber-200 bg-amber-50 text-amber-800',
    error: 'border-red-200 bg-red-50 text-red-800',
  }[tone]

  return <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${styles}`}>{children}</span>
}

function IssueList({ title, issues }: { title: string; issues: ContractIssue[] }) {
  if (issues.length === 0) {
    return (
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</div>
        <div className="mt-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-500">
          None
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{title}</div>
      <div className="mt-2 space-y-2">
        {issues.map((issue, index) => (
          <div
            key={`${issue.field}-${index}`}
            className={`rounded-md border px-3 py-2 text-sm ${
              issue.severity === 'error'
                ? 'border-red-200 bg-red-50 text-red-900'
                : 'border-amber-200 bg-amber-50 text-amber-900'
            }`}
          >
            <div className="font-semibold">{issue.message}</div>
            <div className="mt-1 font-mono text-xs opacity-80">{issue.category} / {issue.field}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
