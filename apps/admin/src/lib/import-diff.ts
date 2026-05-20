import type { Page, PageRedirect } from 'pumpkin-ts-models'
import { normalizeSlug } from './publishing-readiness'

export type ImportDiffMode = 'dry-run' | 'upsert' | 'create-only' | 'update-only'
export type ImportDiffAction = 'create' | 'update' | 'skip' | 'conflict' | 'error'
export type ImportDiffRiskCategory =
  | 'seo'
  | 'slug_redirect'
  | 'publishing'
  | 'media'
  | 'fulfillment_ads'
  | 'form_lead_capture'
  | 'destructive_overwrite'
  | 'tenant_mismatch'
  | 'static_rebuild'

export interface ImportDiffIssue {
  category: ImportDiffRiskCategory | 'shape' | 'matching'
  message: string
  field?: string
}

export interface ImportFieldChange {
  field: string
  label: string
  before: string
  after: string
  riskCategories: ImportDiffRiskCategory[]
}

export interface ImportDiffPageResult {
  index: number
  action: ImportDiffAction
  matchedBy: 'id' | 'PageId' | 'pageSlug' | 'none' | 'conflict'
  title: string
  incomingTenantId: string
  incomingPageId: string
  incomingId: string
  incomingSlug: string
  existingTitle: string
  existingPageId: string
  existingId: string
  existingSlug: string
  errors: ImportDiffIssue[]
  warnings: ImportDiffIssue[]
  changes: ImportFieldChange[]
  riskCategories: ImportDiffRiskCategory[]
  wouldOverwritePublishedPage: boolean
  wouldChangeSlug: boolean
  rollbackAvailable: boolean
  staticRebuildNeeded: boolean
}

export interface ImportDiffReport {
  generatedAt: string
  tenantId: string
  mode: ImportDiffMode
  incomingCount: number
  createCount: number
  updateCount: number
  skipCount: number
  conflictCount: number
  errorCount: number
  warningCount: number
  results: ImportDiffPageResult[]
  payloadErrors: ImportDiffIssue[]
  payloadWarnings: ImportDiffIssue[]
}

interface ImportDiffOptions {
  currentPages: Page[]
  incomingJson: string
  tenantId: string
  mode: ImportDiffMode
}

type JsonRecord = Record<string, unknown>

const FIELD_SUMMARIES: Array<{
  field: string
  label: string
  risks: ImportDiffRiskCategory[]
  customSummary?: (page: JsonRecord) => unknown
}> = [
  { field: 'MetaData.title', label: 'Title', risks: [] },
  { field: 'pageSlug', label: 'Page slug', risks: ['slug_redirect', 'seo', 'static_rebuild'] },
  { field: 'isPublished', label: 'Published status', risks: ['publishing', 'static_rebuild'] },
  { field: 'includeInSitemap', label: 'Sitemap include', risks: ['seo', 'publishing', 'static_rebuild'] },
  { field: 'seo.metaTitle', label: 'SEO title', risks: ['seo', 'static_rebuild'] },
  { field: 'seo.metaDescription', label: 'Meta description', risks: ['seo', 'static_rebuild'] },
  { field: 'seo.canonicalUrl', label: 'Canonical URL', risks: ['seo', 'slug_redirect', 'static_rebuild'] },
  { field: 'searchData.keyword', label: 'Target keyword', risks: ['seo'] },
  { field: 'template.templateKey', label: 'Template key', risks: ['publishing', 'static_rebuild'] },
  { field: 'workflow.status', label: 'Workflow status', risks: ['publishing'] },
  { field: 'staticPublishing.staticEligible', label: 'Static eligible', risks: ['publishing', 'static_rebuild'] },
  { field: 'fulfillment.fulfillmentStatus', label: 'Fulfillment status', risks: ['fulfillment_ads'] },
  { field: 'formConfig', label: 'Form config', risks: ['form_lead_capture', 'static_rebuild'] },
  { field: 'media.featuredImage', label: 'Featured image', risks: ['media', 'static_rebuild'] },
  { field: 'media.heroImage', label: 'Hero image', risks: ['media', 'static_rebuild'] },
  { field: 'media.localImage', label: 'Local image', risks: ['media', 'static_rebuild'] },
  { field: 'media.closingImage', label: 'Closing image', risks: ['media', 'static_rebuild'] },
  { field: 'previousSlugs', label: 'Previous slugs', risks: ['slug_redirect', 'static_rebuild'] },
  { field: 'redirects', label: 'Redirect records', risks: ['slug_redirect', 'static_rebuild'] },
  {
    field: 'ContentData.ContentBlocks',
    label: 'Content blocks',
    risks: ['publishing', 'destructive_overwrite', 'static_rebuild'],
    customSummary: summarizeBlockTypes,
  },
]

export const IMPORT_DIFF_HANDOFF_STORAGE_KEY = 'pumpkin:import-diff-handoff:v1'

export function buildImportDiffReport(options: ImportDiffOptions): ImportDiffReport {
  const payloadErrors: ImportDiffIssue[] = []
  const payloadWarnings: ImportDiffIssue[] = []
  const { pages: incomingPages } = extractIncomingPages(options.incomingJson, payloadErrors, payloadWarnings)
  const duplicateSlugs = getDuplicateIncomingSlugs(incomingPages)
  const results = incomingPages.map((incomingPage, index) => diffIncomingPage(
    incomingPage,
    index,
    options.currentPages,
    options.tenantId,
    options.mode,
    duplicateSlugs,
  ))

  return summarizeDiffReport({
    generatedAt: new Date().toISOString(),
    tenantId: options.tenantId,
    mode: options.mode,
    incomingCount: incomingPages.length,
    createCount: 0,
    updateCount: 0,
    skipCount: 0,
    conflictCount: 0,
    errorCount: 0,
    warningCount: 0,
    results,
    payloadErrors,
    payloadWarnings,
  })
}

function diffIncomingPage(
  incomingValue: unknown,
  index: number,
  currentPages: Page[],
  tenantId: string,
  mode: ImportDiffMode,
  duplicateSlugs: Set<string>,
): ImportDiffPageResult {
  const errors: ImportDiffIssue[] = []
  const warnings: ImportDiffIssue[] = []

  if (!isRecord(incomingValue)) {
    errors.push({ category: 'shape', field: 'page', message: 'Incoming page entry must be a JSON object.' })
    return buildResult(index, 'error', 'none', {}, null, errors, warnings, [])
  }

  const incoming = incomingValue
  const incomingTenantId = stringValue(incoming.tenantId)
  const incomingSlug = normalizeSlug(stringValue(incoming.pageSlug))
  const incomingId = stringValue(incoming.id)
  const incomingPageId = stringValue(incoming.PageId)

  if (!incomingTenantId) {
    warnings.push({
      category: 'tenant_mismatch',
      field: 'tenantId',
      message: `Incoming tenantId is missing; preview assumes selected tenant "${tenantId}".`,
    })
  } else if (incomingTenantId !== tenantId) {
    errors.push({
      category: 'tenant_mismatch',
      field: 'tenantId',
      message: `Incoming tenantId "${incomingTenantId}" does not match selected tenant "${tenantId}".`,
    })
  }

  if (!incomingSlug) {
    errors.push({ category: 'seo', field: 'pageSlug', message: 'Incoming pageSlug is required for import matching.' })
  }

  const currentTenantPages = currentPages.filter((page) => page.tenantId === tenantId)
  const idMatch = incomingId ? currentTenantPages.find((page) => page.id === incomingId || page.PageId === incomingId) || null : null
  const pageIdMatch = incomingPageId ? currentTenantPages.find((page) => page.PageId === incomingPageId || page.id === incomingPageId) || null : null
  const slugMatch = incomingSlug ? currentTenantPages.find((page) => normalizeSlug(page.pageSlug) === incomingSlug) || null : null
  const identityMatch = idMatch || pageIdMatch
  const existingPage = identityMatch || slugMatch
  let matchedBy: ImportDiffPageResult['matchedBy'] = 'none'

  if (idMatch) matchedBy = 'id'
  else if (pageIdMatch) matchedBy = 'PageId'
  else if (slugMatch) matchedBy = 'pageSlug'

  if (identityMatch && slugMatch && getPageIdentity(identityMatch) !== getPageIdentity(slugMatch)) {
    errors.push({
      category: 'matching',
      field: 'pageSlug',
      message: `Incoming id/PageId matches "${identityMatch.pageSlug}", but incoming pageSlug matches existing "${slugMatch.pageSlug}".`,
    })
    matchedBy = 'conflict'
  }

  if (incomingSlug && duplicateSlugs.has(`${incomingTenantId || tenantId}:${incomingSlug}`)) {
    errors.push({
      category: 'matching',
      field: 'pageSlug',
      message: `Incoming payload contains duplicate same-tenant slug "${incomingSlug}".`,
    })
  }

  const changes = existingPage ? getFieldChanges(existingPage, incoming) : []
  const wouldChangeSlug = Boolean(existingPage && incomingSlug && normalizeSlug(existingPage.pageSlug) !== incomingSlug)
  const wouldOverwritePublishedPage = Boolean(existingPage?.isPublished)
  const staticRebuildNeeded = changes.length > 0 || !existingPage

  if (wouldOverwritePublishedPage && changes.length > 0) {
    warnings.push({
      category: 'destructive_overwrite',
      field: 'isPublished',
      message: `Import would update published page "${existingPage?.pageSlug}". Review carefully before writing.`,
    })
  }

  if (wouldChangeSlug && existingPage) {
    warnings.push({
      category: 'slug_redirect',
      field: 'pageSlug',
      message: `Import would change slug from "${existingPage.pageSlug}" to "${incomingSlug}". Redirect coverage is required before publishing.`,
    })

    if (!hasRedirectCoverage(incoming, existingPage.pageSlug, incomingSlug)) {
      warnings.push({
        category: 'slug_redirect',
        field: 'redirects',
        message: 'Incoming page does not include an active redirect from the current slug to the incoming slug.',
      })
    }
  }

  validateRedirects(incoming, warnings)
  validateCanonical(incoming, tenantId, incomingSlug, warnings)

  let action = getBaseAction(existingPage, mode)
  if (errors.length > 0) {
    action = matchedBy === 'conflict' ? 'conflict' : 'error'
  }

  if (action === 'skip' && mode === 'create-only' && existingPage) {
    warnings.push({
      category: 'matching',
      field: 'pageSlug',
      message: 'Create-only mode would skip this page because it already exists.',
    })
  }

  if (action === 'skip' && mode === 'update-only' && !existingPage) {
    warnings.push({
      category: 'matching',
      field: 'pageSlug',
      message: 'Update-only mode would skip this page because no existing page was found.',
    })
  }

  if (staticRebuildNeeded && (action === 'create' || action === 'update')) {
    warnings.push({
      category: 'static_rebuild',
      field: 'staticPublishing.needsRebuild',
      message: 'If imported, this page should be treated as needing a static rebuild.',
    })
  }

  return buildResult(index, action, matchedBy, incoming, existingPage, errors, warnings, changes)
}

function getBaseAction(existingPage: Page | null, mode: ImportDiffMode): ImportDiffAction {
  if (mode === 'create-only') return existingPage ? 'skip' : 'create'
  if (mode === 'update-only') return existingPage ? 'update' : 'skip'
  return existingPage ? 'update' : 'create'
}

function buildResult(
  index: number,
  action: ImportDiffAction,
  matchedBy: ImportDiffPageResult['matchedBy'],
  incoming: JsonRecord,
  existingPage: Page | null,
  errors: ImportDiffIssue[],
  warnings: ImportDiffIssue[],
  changes: ImportFieldChange[],
): ImportDiffPageResult {
  const incomingSlug = normalizeSlug(stringValue(incoming.pageSlug))
  const existingSlug = existingPage?.pageSlug || ''
  const riskCategories = uniqueRiskCategories([
    ...changes.flatMap((change) => change.riskCategories),
    ...errors.map((issue) => issue.category).filter(isRiskCategory),
    ...warnings.map((issue) => issue.category).filter(isRiskCategory),
  ])
  const wouldChangeSlug = Boolean(existingPage && incomingSlug && normalizeSlug(existingPage.pageSlug) !== incomingSlug)
  const staticRebuildNeeded = changes.length > 0 || action === 'create'

  return {
    index,
    action,
    matchedBy,
    title: stringValue(getPath(incoming, 'MetaData.title')) || incomingSlug || `Incoming page ${index + 1}`,
    incomingTenantId: stringValue(incoming.tenantId),
    incomingPageId: stringValue(incoming.PageId),
    incomingId: stringValue(incoming.id),
    incomingSlug,
    existingTitle: existingPage?.MetaData?.title || '',
    existingPageId: existingPage?.PageId || '',
    existingId: existingPage?.id || '',
    existingSlug,
    errors,
    warnings,
    changes,
    riskCategories,
    wouldOverwritePublishedPage: Boolean(existingPage?.isPublished && changes.length > 0),
    wouldChangeSlug,
    rollbackAvailable: Boolean(existingPage?.revision?.rollbackAvailable || existingPage?.revision?.latestSnapshot),
    staticRebuildNeeded,
  }
}

function getFieldChanges(existingPage: Page, incoming: JsonRecord) {
  const existing = existingPage as unknown as JsonRecord
  const changes: ImportFieldChange[] = []

  FIELD_SUMMARIES.forEach((summary) => {
    const beforeValue = summary.customSummary ? summary.customSummary(existing) : getPath(existing, summary.field)
    const afterValue = summary.customSummary ? summary.customSummary(incoming) : getPath(incoming, summary.field)
    if (stableStringify(beforeValue) === stableStringify(afterValue)) return

    changes.push({
      field: summary.field,
      label: summary.label,
      before: summarizeValue(beforeValue),
      after: summarizeValue(afterValue),
      riskCategories: summary.risks,
    })
  })

  return changes
}

function extractIncomingPages(rawJson: string, errors: ImportDiffIssue[], warnings: ImportDiffIssue[]) {
  if (!rawJson.trim()) {
    errors.push({ category: 'shape', field: 'payload', message: 'Paste or upload JSON before running diff preview.' })
    return { pages: [] as unknown[] }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson)
  } catch (error) {
    errors.push({
      category: 'shape',
      field: 'payload',
      message: `JSON parse failed: ${error instanceof Error ? error.message : 'invalid JSON'}`,
    })
    return { pages: [] as unknown[] }
  }

  if (Array.isArray(parsed)) {
    return { pages: parsed }
  }

  if (!isRecord(parsed)) {
    errors.push({ category: 'shape', field: 'payload', message: 'JSON must be a Page object, Page array, or wrapped export object with pages[].' })
    return { pages: [] as unknown[] }
  }

  if (Array.isArray(parsed.pages)) {
    return { pages: parsed.pages }
  }

  if ('pageSlug' in parsed || 'PageId' in parsed || 'ContentData' in parsed) {
    return { pages: [parsed] }
  }

  warnings.push({ category: 'shape', field: 'payload', message: 'Object does not include pages[], but it will be treated as a single Page candidate.' })
  return { pages: [parsed] }
}

function summarizeDiffReport(report: ImportDiffReport): ImportDiffReport {
  const createCount = report.results.filter((result) => result.action === 'create').length
  const updateCount = report.results.filter((result) => result.action === 'update').length
  const skipCount = report.results.filter((result) => result.action === 'skip').length
  const conflictCount = report.results.filter((result) => result.action === 'conflict').length
  const resultErrorCount = report.results.reduce((total, result) => total + result.errors.length, 0)
  const resultWarningCount = report.results.reduce((total, result) => total + result.warnings.length, 0)

  return {
    ...report,
    createCount,
    updateCount,
    skipCount,
    conflictCount,
    errorCount: report.payloadErrors.length + resultErrorCount,
    warningCount: report.payloadWarnings.length + resultWarningCount,
  }
}

function validateCanonical(page: JsonRecord, tenantId: string, incomingSlug: string, warnings: ImportDiffIssue[]) {
  const canonicalUrl = stringValue(getPath(page, 'seo.canonicalUrl'))
  if (!canonicalUrl.trim()) {
    warnings.push({ category: 'seo', field: 'seo.canonicalUrl', message: 'Incoming page has no canonical URL.' })
    return
  }

  try {
    const canonical = new URL(canonicalUrl)
    const canonicalSlug = normalizeSlug(canonical.pathname) || 'home'
    const currentSlug = incomingSlug || 'home'
    if (canonicalSlug !== currentSlug) {
      warnings.push({
        category: 'seo',
        field: 'seo.canonicalUrl',
        message: `Canonical path resolves to "${canonicalSlug}" but incoming pageSlug is "${currentSlug}".`,
      })
    }
  } catch {
    warnings.push({ category: 'seo', field: 'seo.canonicalUrl', message: `Incoming canonical URL is not URL-like for tenant "${tenantId}".` })
  }
}

function validateRedirects(page: JsonRecord, warnings: ImportDiffIssue[]) {
  const redirects = getPath(page, 'redirects')
  if (redirects === undefined) return

  if (!Array.isArray(redirects)) {
    warnings.push({ category: 'slug_redirect', field: 'redirects', message: 'Incoming redirects should be an array.' })
    return
  }

  const fromSlugs = new Set<string>()
  redirects.forEach((redirect, index) => {
    if (!isRecord(redirect)) {
      warnings.push({ category: 'slug_redirect', field: `redirects[${index}]`, message: 'Redirect record should be an object.' })
      return
    }

    const from = normalizeSlug(stringValue(redirect.from))
    const to = normalizeSlug(stringValue(redirect.to))
    if (from && to && from === to) {
      warnings.push({ category: 'slug_redirect', field: `redirects[${index}]`, message: 'Redirect from/to should not be the same slug.' })
    }
    if (fromSlugs.has(from)) {
      warnings.push({ category: 'slug_redirect', field: `redirects[${index}].from`, message: `Duplicate redirect from slug "${from}".` })
    }
    if (from) fromSlugs.add(from)
  })
}

function hasRedirectCoverage(incoming: JsonRecord, oldSlug: string, newSlug: string) {
  const normalizedOld = normalizeSlug(oldSlug)
  const normalizedNew = normalizeSlug(newSlug)
  const previousSlugs = getPath(incoming, 'previousSlugs')
  const redirects = getPath(incoming, 'redirects')

  const hasPreviousSlug = Array.isArray(previousSlugs) && previousSlugs.some((slug) => normalizeSlug(stringValue(slug)) === normalizedOld)
  const hasRedirect = Array.isArray(redirects) && redirects.some((redirect: unknown) => {
    if (!isRecord(redirect)) return false
    const typedRedirect = redirect as Partial<PageRedirect>
    return typedRedirect.active !== false &&
      normalizeSlug(stringValue(typedRedirect.from)) === normalizedOld &&
      normalizeSlug(stringValue(typedRedirect.to)) === normalizedNew
  })

  return hasPreviousSlug && hasRedirect
}

function getDuplicateIncomingSlugs(pages: unknown[]) {
  const seen = new Map<string, number>()
  pages.forEach((page) => {
    if (!isRecord(page)) return
    const tenantId = stringValue(page.tenantId)
    const slug = normalizeSlug(stringValue(page.pageSlug))
    if (!slug) return
    const key = `${tenantId}:${slug}`
    seen.set(key, (seen.get(key) || 0) + 1)
  })

  const duplicates = new Set<string>()
  seen.forEach((count, key) => {
    if (count > 1) duplicates.add(key)
  })
  return duplicates
}

function getPageIdentity(page: Page) {
  return page.id || page.PageId || `${page.tenantId}:${normalizeSlug(page.pageSlug)}`
}

function getPath(value: JsonRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!isRecord(current)) return undefined
    return current[segment]
  }, value)
}

function summarizeBlockTypes(page: JsonRecord) {
  const blocks = getPath(page, 'ContentData.ContentBlocks')
  if (!Array.isArray(blocks)) return blocks
  return blocks.map((block) => isRecord(block) ? stringValue(block.type) || 'Unknown' : 'Invalid')
}

function summarizeValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return 'not set'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'string') return value.length > 160 ? `${value.slice(0, 157)}...` : value
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    if (value.every((item) => typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean')) {
      return value.map(String).join(', ')
    }
    return `${value.length} item${value.length === 1 ? '' : 's'}`
  }
  if (isRecord(value)) {
    const keys = Object.keys(value)
    return keys.length === 0 ? '{}' : `${keys.length} field${keys.length === 1 ? '' : 's'}: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? ', ...' : ''}`
  }
  return String(value)
}

function stableStringify(value: unknown): string {
  if (value === undefined) return '__undefined__'
  return JSON.stringify(sortValue(value))
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!isRecord(value)) return value
  return Object.keys(value)
    .sort()
    .reduce<JsonRecord>((accumulator, key) => {
      accumulator[key] = sortValue(value[key])
      return accumulator
    }, {})
}

function uniqueRiskCategories(values: ImportDiffRiskCategory[]) {
  return Array.from(new Set(values))
}

function isRiskCategory(value: string): value is ImportDiffRiskCategory {
  return [
    'seo',
    'slug_redirect',
    'publishing',
    'media',
    'fulfillment_ads',
    'form_lead_capture',
    'destructive_overwrite',
    'tenant_mismatch',
    'static_rebuild',
  ].includes(value)
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown) {
  if (value === null || value === undefined) return ''
  return typeof value === 'string' ? value : String(value)
}
