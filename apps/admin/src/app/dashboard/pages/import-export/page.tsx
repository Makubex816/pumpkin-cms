'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { IHtmlBlock, Page } from 'pumpkin-ts-models'

type ExportScope = 'all' | 'published' | 'single'
type ImportMode = 'dry-run' | 'upsert' | 'create-only' | 'update-only'
type PlannedAction = 'create' | 'update' | 'skip' | 'error'

interface ExportPayload {
  format: 'pumpkin-cms-pages-export'
  version: 1
  tenantId: string
  exportedAt: string
  pageCount: number
  pages: Page[]
}

interface ImportResult {
  index: number
  title: string
  incomingTenantId: string
  pageSlug: string
  normalizedSlug: string
  exists: boolean
  action: PlannedAction
  isPublished: boolean | null
  includeInSitemap: boolean | null
  errors: string[]
  warnings: string[]
  wrote?: boolean
  writeError?: string
}

interface ImportReport {
  mode: ImportMode
  tenantId: string
  timestamp: string
  total: number
  createdCount: number
  updatedCount: number
  skippedCount: number
  errorCount: number
  warningCount: number
  results: ImportResult[]
}

interface ParsedImport {
  pages: Record<string, unknown>[]
  wrapperTenantId?: string
  errors: string[]
  warnings: string[]
}

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function booleanOrNull(value: unknown) {
  return typeof value === 'boolean' ? value : null
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\/\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildPageId(tenantId: string, slug: string) {
  return `${tenantId}-${slug}`
}

function clonePage(page: Page) {
  return JSON.parse(JSON.stringify(page)) as Page
}

function getPageTitle(page: Page) {
  return page.MetaData?.title || page.pageSlug || page.PageId || 'Untitled'
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}

function downloadJson(fileName: string, value: unknown) {
  const json = JSON.stringify(value, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function createDefaultSeo(title: string) {
  return {
    metaTitle: title,
    metaDescription: '',
    keywords: [],
    robots: 'noindex, nofollow',
    canonicalUrl: '',
    alternateUrls: [],
    structuredData: [],
    openGraph: {
      'og:title': title,
      'og:description': '',
      'og:type': 'website',
      'og:url': '',
      'og:image': '',
      'og:image:alt': '',
      'og:site_name': '',
      'og:locale': 'en_US',
    },
    twitterCard: {
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': '',
      'twitter:image': '',
      'twitter:site': '',
      'twitter:creator': '',
    },
  }
}

function createDefaultMetaData(title: string, now: string) {
  return {
    category: '',
    product: '',
    keyword: title,
    pageType: 'page',
    title,
    description: '',
    createdAt: now,
    updatedAt: now,
    author: 'Pumpkin CMS Import',
    language: 'en-us',
    market: 'us',
  }
}

function createDefaultSearchData(title: string, blockTypes: string[]) {
  return {
    state: '',
    city: '',
    metro: '',
    county: '',
    keyword: title,
    tags: [],
    contentSummary: '',
    blockTypes,
  }
}

function createDefaultRelationships() {
  return {
    isHub: false,
    hubPageSlug: '',
    topicCluster: '',
    relatedHubs: [],
    spokePriority: 0,
  }
}

function getBlocks(value: Record<string, unknown>) {
  const contentData = isRecord(value.ContentData) ? value.ContentData : {}
  const blocks = contentData.ContentBlocks
  return Array.isArray(blocks) ? blocks as IHtmlBlock[] : []
}

function parseImportText(importText: string): ParsedImport {
  const errors: string[] = []
  const warnings: string[] = []
  const trimmed = importText.trim()

  if (!trimmed) {
    return { pages: [], errors: ['Paste or upload JSON before running import validation.'], warnings }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch (error) {
    return { pages: [], errors: [getErrorMessage(error, 'Invalid JSON.')], warnings }
  }

  if (Array.isArray(parsed)) {
    return {
      pages: parsed.filter(isRecord),
      errors: parsed.every(isRecord) ? [] : ['Import array contains non-object entries.'],
      warnings,
    }
  }

  if (!isRecord(parsed)) {
    return { pages: [], errors: ['Import JSON must be a Page object, an array of Page objects, or a wrapped export object.'], warnings }
  }

  if (Array.isArray(parsed.pages)) {
    const wrapperTenantId = stringValue(parsed.tenantId) || undefined
    const pages = parsed.pages.filter(isRecord)
    if (pages.length !== parsed.pages.length) {
      errors.push('Wrapped export contains non-object page entries.')
    }

    return { pages, wrapperTenantId, errors, warnings }
  }

  if ('pageSlug' in parsed || 'PageId' in parsed || 'ContentData' in parsed) {
    return { pages: [parsed], errors, warnings }
  }

  return { pages: [], errors: ['Import object does not look like a Page document or wrapped page export.'], warnings }
}

function getExistingBySlug(pages: Page[]) {
  return new Map(pages.map((page) => [normalizeSlug(page.pageSlug), page]))
}

function validateImportPages(
  importText: string,
  existingPages: Page[],
  tenantId: string,
  mode: ImportMode,
  rewriteTenantId: boolean,
) {
  const parsed = parseImportText(importText)
  const existingBySlug = getExistingBySlug(existingPages)
  const seenSlugs = new Set<string>()
  const results: ImportResult[] = []

  parsed.pages.forEach((page, index) => {
    const errors: string[] = []
    const warnings: string[] = []
    const incomingTenantId = stringValue(page.tenantId)
    const rawSlug = stringValue(page.pageSlug)
    const normalizedSlug = normalizeSlug(rawSlug)
    const metaData = isRecord(page.MetaData) ? page.MetaData : null
    const seo = isRecord(page.seo) ? page.seo : null
    const blocks = getBlocks(page)
    const title = stringValue(metaData?.title) || rawSlug || `Import row ${index + 1}`
    const exists = existingBySlug.has(normalizedSlug)
    const isPublished = booleanOrNull(page.isPublished)
    const includeInSitemap = booleanOrNull(page.includeInSitemap)

    if (!incomingTenantId) {
      warnings.push('tenantId is missing and will be set to the selected tenant.')
    } else if (incomingTenantId !== tenantId && !rewriteTenantId) {
      errors.push(`tenantId "${incomingTenantId}" does not match selected tenant "${tenantId}".`)
    } else if (incomingTenantId !== tenantId && rewriteTenantId) {
      warnings.push(`tenantId will be rewritten from "${incomingTenantId}" to "${tenantId}".`)
      warnings.push('id/PageId will be regenerated for the selected tenant.')
    }

    if (!rawSlug) {
      errors.push('pageSlug is required.')
    } else if (!normalizedSlug) {
      errors.push(`pageSlug "${rawSlug}" does not contain valid slug characters.`)
    } else if (rawSlug !== normalizedSlug) {
      warnings.push(`pageSlug will be normalized from "${rawSlug}" to "${normalizedSlug}".`)
    }

    if (normalizedSlug && seenSlugs.has(normalizedSlug)) {
      errors.push(`Duplicate slug "${normalizedSlug}" appears more than once in this import payload.`)
    }
    if (normalizedSlug) {
      seenSlugs.add(normalizedSlug)
    }

    if (!stringValue(page.id) || !stringValue(page.PageId)) {
      warnings.push('id/PageId is missing and will be generated from tenantId and pageSlug.')
    }

    if (!isRecord(page.ContentData) || !Array.isArray(page.ContentData.ContentBlocks)) {
      errors.push('ContentData.ContentBlocks must be an array.')
    }

    if (typeof page.isPublished !== 'boolean') {
      errors.push('isPublished must be a boolean.')
    }

    if (typeof page.includeInSitemap !== 'boolean') {
      errors.push('includeInSitemap must be a boolean.')
    }

    if (!metaData) {
      warnings.push('MetaData is missing and will be generated with safe defaults.')
    }

    if (!seo) {
      warnings.push('seo is missing and will be generated with safe defaults.')
    }

    if (blocks.some((block) => !isRecord(block) || !stringValue(block.type))) {
      warnings.push('One or more content blocks has no block type; unknown block content will still be preserved.')
    }

    let action: PlannedAction = 'error'
    if (errors.length === 0) {
      if (mode === 'create-only' && exists) {
        action = 'skip'
        warnings.push(`Same-tenant slug collision: "${normalizedSlug}" already exists and create-only mode will skip it.`)
      } else if (mode === 'update-only' && !exists) {
        action = 'skip'
        warnings.push(`Page "${normalizedSlug}" does not exist and update-only mode will skip it.`)
      } else if (exists) {
        action = 'update'
      } else {
        action = 'create'
      }
    }

    results.push({
      index,
      title,
      incomingTenantId,
      pageSlug: rawSlug,
      normalizedSlug,
      exists,
      action,
      isPublished,
      includeInSitemap,
      errors,
      warnings,
    })
  })

  const allWarnings = [...parsed.warnings]
  if (parsed.wrapperTenantId && parsed.wrapperTenantId !== tenantId) {
    const message = rewriteTenantId
      ? `Wrapper tenantId will be rewritten from "${parsed.wrapperTenantId}" to "${tenantId}".`
      : `Wrapper tenantId "${parsed.wrapperTenantId}" does not match selected tenant "${tenantId}".`

    if (rewriteTenantId) {
      allWarnings.push(message)
    } else {
      parsed.errors.push(message)
    }
  }

  if (parsed.errors.length > 0) {
    results.unshift({
      index: -1,
      title: 'Import payload',
      incomingTenantId: parsed.wrapperTenantId || '',
      pageSlug: '',
      normalizedSlug: '',
      exists: false,
      action: 'error',
      isPublished: null,
      includeInSitemap: null,
      errors: parsed.errors,
      warnings: allWarnings,
    })
  } else if (allWarnings.length > 0) {
    results.unshift({
      index: -1,
      title: 'Import payload',
      incomingTenantId: parsed.wrapperTenantId || '',
      pageSlug: '',
      normalizedSlug: '',
      exists: false,
      action: 'skip',
      isPublished: null,
      includeInSitemap: null,
      errors: [],
      warnings: allWarnings,
    })
  }

  return buildReport(mode, tenantId, results)
}

function buildReport(mode: ImportMode, tenantId: string, results: ImportResult[]): ImportReport {
  const pageResults = results.filter((result) => result.index >= 0)
  const errorCount = results.reduce((total, result) => total + result.errors.length, 0)
  const warningCount = results.reduce((total, result) => total + result.warnings.length, 0)

  return {
    mode,
    tenantId,
    timestamp: new Date().toISOString(),
    total: pageResults.length,
    createdCount: pageResults.filter((result) => result.action === 'create').length,
    updatedCount: pageResults.filter((result) => result.action === 'update').length,
    skippedCount: pageResults.filter((result) => result.action === 'skip').length,
    errorCount,
    warningCount,
    results,
  }
}

function coercePageForWrite(page: Record<string, unknown>, tenantId: string, rewriteTenantId: boolean) {
  const now = new Date().toISOString()
  const rawSlug = stringValue(page.pageSlug)
  const slug = normalizeSlug(rawSlug)
  const incomingTenantId = stringValue(page.tenantId)
  const shouldRegenerateId = rewriteTenantId && incomingTenantId !== tenantId
  const pageId = shouldRegenerateId
    ? buildPageId(tenantId, slug)
    : stringValue(page.PageId) || stringValue(page.id) || buildPageId(tenantId, slug)
  const metaData = isRecord(page.MetaData) ? page.MetaData : {}
  const title = stringValue(metaData.title) || slug
  const blocks = getBlocks(page)
  const seo = isRecord(page.seo) ? page.seo : createDefaultSeo(title)
  const searchData = isRecord(page.searchData) ? page.searchData : createDefaultSearchData(title, blocks.map((block) => block.type))
  const contentRelationships = isRecord(page.contentRelationships) ? page.contentRelationships : createDefaultRelationships()
  const finalTenantId = rewriteTenantId || !incomingTenantId ? tenantId : incomingTenantId

  const coerced: Page = {
    ...(page as unknown as Page),
    id: pageId,
    PageId: pageId,
    tenantId: finalTenantId,
    pageSlug: slug,
    PageVersion: numberValue(page.PageVersion, 1),
    Layout: stringValue(page.Layout) || 'default',
    MetaData: {
      ...createDefaultMetaData(title, now),
      ...metaData,
      title,
    },
    searchData: {
      ...createDefaultSearchData(title, blocks.map((block) => block.type)),
      ...searchData,
      blockTypes: Array.isArray(searchData.blockTypes) ? searchData.blockTypes as string[] : blocks.map((block) => block.type),
    },
    ContentData: {
      ...(isRecord(page.ContentData) ? page.ContentData : {}),
      ContentBlocks: blocks,
    },
    contentRelationships: {
      ...createDefaultRelationships(),
      ...contentRelationships,
    },
    seo: {
      ...createDefaultSeo(title),
      ...seo,
    },
    isPublished: page.isPublished as boolean,
    publishedAt: stringValue(page.publishedAt) || null,
    includeInSitemap: page.includeInSitemap as boolean,
  }

  return coerced
}

function getPagesForImport(importText: string) {
  return parseImportText(importText).pages
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

export default function PageImportExportPage() {
  const router = useRouter()
  const { token, user, currentTenant } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [exportScope, setExportScope] = useState<ExportScope>('all')
  const [selectedSlug, setSelectedSlug] = useState('')
  const [importText, setImportText] = useState('')
  const [importMode, setImportMode] = useState<ImportMode>('dry-run')
  const [rewriteTenantId, setRewriteTenantId] = useState(false)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [runningImport, setRunningImport] = useState(false)

  const tenantId = currentTenant?.tenantId || ''
  const publishedPages = useMemo(() => pages.filter((page) => page.isPublished), [pages])

  const fetchPages = useCallback(async () => {
    if (!token || !user || !currentTenant) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const pageData = await apiClient.getPages(token, currentTenant.tenantId)
      setPages(pageData)
      if (!selectedSlug && pageData.length > 0) {
        setSelectedSlug(pageData[0].pageSlug)
      }
    } catch (fetchError) {
      setError(getErrorMessage(fetchError, 'Failed to load tenant pages.'))
    } finally {
      setLoading(false)
    }
  }, [token, user, currentTenant, selectedSlug])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const getExportPages = () => {
    if (exportScope === 'published') return publishedPages
    if (exportScope === 'single') return pages.filter((page) => page.pageSlug === selectedSlug)
    return pages
  }

  const handleDownloadExport = () => {
    if (!currentTenant) return

    const pagesToExport = getExportPages().map(clonePage)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    if (exportScope === 'single') {
      const page = pagesToExport[0]
      if (!page) {
        setError('Select a page before exporting a single page.')
        return
      }

      downloadJson(`${tenantId}-${page.pageSlug}-${timestamp}.json`, page)
      setNotice(`Exported page "${getPageTitle(page)}".`)
      return
    }

    const payload: ExportPayload = {
      format: 'pumpkin-cms-pages-export',
      version: 1,
      tenantId: currentTenant.tenantId,
      exportedAt: new Date().toISOString(),
      pageCount: pagesToExport.length,
      pages: pagesToExport,
    }

    const suffix = exportScope === 'published' ? 'published-pages' : 'pages'
    downloadJson(`${tenantId}-${suffix}-${timestamp}.json`, payload)
    setNotice(`Exported ${pagesToExport.length} page${pagesToExport.length === 1 ? '' : 's'}.`)
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      setImportText(text)
      setReport(null)
      setNotice(`Loaded ${file.name}. Run dry-run before importing.`)
    } catch (fileError) {
      setError(getErrorMessage(fileError, 'Failed to read JSON file.'))
    } finally {
      event.target.value = ''
    }
  }

  const runDryRun = () => {
    if (!tenantId) return
    const nextReport = validateImportPages(importText, pages, tenantId, importMode, rewriteTenantId)
    setReport(nextReport)
    setNotice('Import dry-run complete. No pages were written.')
  }

  const runImport = async () => {
    if (!token || !currentTenant || importMode === 'dry-run') return

    const initialReport = validateImportPages(importText, pages, currentTenant.tenantId, importMode, rewriteTenantId)
    setReport(initialReport)

    if (initialReport.errorCount > 0) {
      setNotice(null)
      setError('Import has validation errors. Fix them before writing changes.')
      return
    }

    const parsedPages = getPagesForImport(importText)
    const resultByIndex = new Map(initialReport.results.map((result) => [result.index, { ...result }]))
    const writeResults: ImportResult[] = []

    try {
      setRunningImport(true)
      setError(null)
      setNotice(null)

      for (let index = 0; index < parsedPages.length; index += 1) {
        const pageRecord = parsedPages[index]
        const planned = resultByIndex.get(index)
        if (!planned || planned.action === 'skip' || planned.action === 'error') {
          if (planned) writeResults.push(planned)
          continue
        }

        const pageToWrite = coercePageForWrite(pageRecord, currentTenant.tenantId, rewriteTenantId)

        try {
          if (planned.action === 'create') {
            await apiClient.createPage(token, currentTenant.tenantId, pageToWrite)
          } else {
            const existingPage = pages.find((item) => normalizeSlug(item.pageSlug) === planned.normalizedSlug)
            await apiClient.updatePage(token, currentTenant.tenantId, existingPage?.pageSlug || planned.normalizedSlug, pageToWrite)
          }

          writeResults.push({ ...planned, wrote: true })
        } catch (writeError) {
          writeResults.push({
            ...planned,
            action: 'error',
            wrote: false,
            writeError: getErrorMessage(writeError, 'Page write failed.'),
            errors: [...planned.errors, getErrorMessage(writeError, 'Page write failed.')],
          })
        }
      }

      const payloadResults = initialReport.results.filter((result) => result.index < 0)
      const nextReport = buildReport(importMode, currentTenant.tenantId, [...payloadResults, ...writeResults])
      setReport(nextReport)
      await fetchPages()
      setNotice(`Import complete: ${nextReport.createdCount} created, ${nextReport.updatedCount} updated, ${nextReport.skippedCount} skipped, ${nextReport.errorCount} errors.`)
    } finally {
      setRunningImport(false)
    }
  }

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to import or export tenant pages.</p>
      </div>
    )
  }

  if (!currentTenant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">No Tenant Selected</h1>
        <p className="text-neutral-600">Select a tenant/site before importing or exporting pages.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/pages')}
            className="mb-3 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Back to pages
          </button>
          <h1 className="text-3xl font-bold text-neutral-900">JSON Import/Export</h1>
          <p className="mt-1 text-neutral-600">
            Tenant-scoped Page JSON artifacts for {currentTenant.name || currentTenant.tenantId}.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">Tenant</div>
          <div className="text-sm font-semibold text-neutral-900">{currentTenant.tenantId}</div>
        </div>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Phase 4 supports JSON Page exports, dry-run validation, and safe create/update imports. CSV, XLSX, static publishing, and hard delete are not included.
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {notice}
        </div>
      )}

      <Section title="Export JSON" description="Download full Page documents for the selected tenant. These files are portable content artifacts for future static-first publishing.">
        {loading ? (
          <div className="text-sm text-neutral-600">Loading tenant pages...</div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">Export scope</span>
              <select value={exportScope} onChange={(event) => setExportScope(event.target.value as ExportScope)} className="input">
                <option value="all">All pages ({pages.length})</option>
                <option value="published">Published pages ({publishedPages.length})</option>
                <option value="single">Single selected page</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">Selected page</span>
              <select
                value={selectedSlug}
                onChange={(event) => setSelectedSlug(event.target.value)}
                disabled={exportScope !== 'single'}
                className="input disabled:bg-neutral-100"
              >
                {pages.map((page) => (
                  <option key={`${page.tenantId}-${page.pageSlug}`} value={page.pageSlug}>
                    {page.MetaData?.title || page.pageSlug} ({page.pageSlug})
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-end">
              <button type="button" onClick={handleDownloadExport} className="btn btn-primary w-full">
                Download JSON
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section title="Import JSON" description="Paste or upload a Page, an array of Pages, or a wrapped export object with a pages array. Dry-run is the default and writes nothing.">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Import mode</span>
            <select value={importMode} onChange={(event) => setImportMode(event.target.value as ImportMode)} className="input">
              <option value="dry-run">Dry-run only</option>
              <option value="upsert">Upsert</option>
              <option value="create-only">Create-only</option>
              <option value="update-only">Update-only</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Upload JSON file</span>
            <input type="file" accept="application/json,.json" onChange={handleFileUpload} className="input" />
          </label>
          <label className="flex items-center gap-2 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700 lg:mt-6">
            <input
              type="checkbox"
              checked={rewriteTenantId}
              onChange={(event) => setRewriteTenantId(event.target.checked)}
              className="rounded border-neutral-300 text-primary-600"
            />
            Rewrite imported tenantId to selected tenant
          </label>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">JSON input</span>
          <textarea
            value={importText}
            onChange={(event) => {
              setImportText(event.target.value)
              setReport(null)
              setError(null)
              setNotice(null)
            }}
            rows={14}
            className="input font-mono text-xs"
            spellCheck={false}
            data-testid="json-import-input"
          />
        </label>

        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={runDryRun} className="btn btn-secondary">
            Run Dry-Run
          </button>
          <button
            type="button"
            onClick={runImport}
            disabled={importMode === 'dry-run' || runningImport}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {runningImport ? 'Importing...' : 'Run Import'}
          </button>
        </div>
      </Section>

      {report && (
        <Section title="Import Preview And Report" description="Structured dry-run/import results. Download this report for review or audit trail.">
          <div className="grid gap-3 md:grid-cols-6">
            <ReportStat label="Total" value={report.total} />
            <ReportStat label="Creates" value={report.createdCount} />
            <ReportStat label="Updates" value={report.updatedCount} />
            <ReportStat label="Skips" value={report.skippedCount} />
            <ReportStat label="Errors" value={report.errorCount} />
            <ReportStat label="Warnings" value={report.warningCount} />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => downloadJson(`${tenantId}-import-report-${report.timestamp.replace(/[:.]/g, '-')}.json`, report)}
              className="btn btn-secondary"
            >
              Download Report JSON
            </button>
          </div>

          <div className="overflow-x-auto rounded-md border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Page</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Slug</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Messages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {report.results.map((result) => (
                  <tr key={`${result.index}-${result.normalizedSlug}-${result.title}`}>
                    <td className="px-4 py-3 text-sm text-neutral-900">{result.title}</td>
                    <td className="px-4 py-3 font-mono text-sm text-neutral-700">{result.normalizedSlug || result.pageSlug || 'n/a'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getActionClass(result.action)}`}>
                        {result.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {result.index < 0 ? 'Payload' : (
                        <>
                          {result.exists ? 'Existing' : 'New'} / {result.isPublished === true ? 'Published' : 'Draft'} / {result.includeInSitemap === true ? 'Sitemap' : 'Hidden'}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="space-y-1">
                        {result.errors.map((message) => (
                          <div key={`error-${message}`} className="text-red-700">{message}</div>
                        ))}
                        {result.warnings.map((message) => (
                          <div key={`warning-${message}`} className="text-amber-700">{message}</div>
                        ))}
                        {result.wrote && <div className="text-green-700">Write completed.</div>}
                        {result.writeError && <div className="text-red-700">{result.writeError}</div>}
                        {result.errors.length === 0 && result.warnings.length === 0 && !result.wrote && (
                          <div className="text-neutral-500">No messages.</div>
                        )}
                      </div>
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

function ReportStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-xl font-semibold text-neutral-900">{value}</div>
    </div>
  )
}

function getActionClass(action: PlannedAction) {
  switch (action) {
    case 'create':
      return 'bg-green-100 text-green-800'
    case 'update':
      return 'bg-blue-100 text-blue-800'
    case 'skip':
      return 'bg-neutral-100 text-neutral-700'
    case 'error':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-neutral-100 text-neutral-700'
  }
}
