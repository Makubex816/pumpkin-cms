'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { IMPORT_DIFF_HANDOFF_STORAGE_KEY } from '@/lib/import-diff'
import type { IHtmlBlock, Page, PageChangeSource, PageRedirect } from 'pumpkin-ts-models'

type ExportScope = 'all' | 'published' | 'single'
type ExportFormat = 'json' | 'csv' | 'xlsx'
type ImportSourceType = 'json' | 'csv' | 'xlsx'
type ImportMode = 'dry-run' | 'upsert' | 'create-only' | 'update-only'
type PlannedAction = 'create' | 'update' | 'skip' | 'error'
type JsonColumnType = 'array' | 'object'

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
  sourceRow: number | null
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
  revisionCreated?: boolean
  writeError?: string
}

interface ImportReport {
  mode: ImportMode
  sourceType: ImportSourceType
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

interface ParsedPageEntry {
  page: Record<string, unknown>
  sourceRow: number | null
  errors: string[]
  warnings: string[]
}

interface ParsedImport {
  entries: ParsedPageEntry[]
  wrapperTenantId?: string
  sourceType: ImportSourceType
  errors: string[]
  warnings: string[]
}

interface CsvParseResult {
  headers: string[]
  rows: string[][]
  errors: string[]
}

interface FlatRowParseResult {
  page: Record<string, unknown>
  errors: string[]
  warnings: string[]
}

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

type FlatPageRow = Record<string, string>

const PAGE_FLAT_HEADERS = [
  'id',
  'PageId',
  'tenantId',
  'pageSlug',
  'PageVersion',
  'Layout',
  'MetaData.title',
  'MetaData.description',
  'MetaData.category',
  'MetaData.product',
  'MetaData.keyword',
  'MetaData.pageType',
  'MetaData.createdAt',
  'MetaData.updatedAt',
  'MetaData.author',
  'MetaData.language',
  'MetaData.market',
  'targetKeyword',
  'secondaryKeywords',
  'pageType',
  'state',
  'city',
  'region',
  'metro',
  'county',
  'primaryService',
  'buyerIntent',
  'landingPageType',
  'previousSlugs',
  'redirects',
  'redirectCount',
  'hasActiveRedirects',
  'seo.metaTitle',
  'seo.metaDescription',
  'seo.robots',
  'seo.canonicalUrl',
  'seo.keywords',
  'seo.alternateUrls',
  'seo.structuredData',
  'seo.openGraph',
  'seo.twitterCard',
  'isPublished',
  'includeInSitemap',
  'sitemapPriority',
  'sitemapChangeFrequency',
  'publishedAt',
  'fulfillmentStatus',
  'primaryPartnerAvailable',
  'leadRoutingMode',
  'publicDisclosureRequired',
  'fulfillment',
  'googleAds.eligible',
  'googleAds.finalUrl',
  'googleAds',
  'featuredImage.assetId',
  'featuredImage.url',
  'featuredImage.alt',
  'heroImage.assetId',
  'heroImage.url',
  'heroImage.alt',
  'localImage.assetId',
  'localImage.url',
  'localImage.alt',
  'closingImage.assetId',
  'closingImage.url',
  'closingImage.alt',
  'media',
  'contentRelationships.isHub',
  'contentRelationships.hubPageSlug',
  'contentRelationships.topicCluster',
  'contentRelationships.relatedHubs',
  'contentRelationships.spokePriority',
  'ContentData.ContentBlocks',
  'searchData',
  'pageQuality',
  'workflow.status',
  'workflow.approvedForPublish',
  'workflow.approvedBy',
  'workflow.approvedAt',
  'workflow.lastEditedBy',
  'workflow.lastEditedAt',
  'workflow',
  'revision.revisionNumber',
  'revision.currentRevisionId',
  'revision.lastSnapshotAt',
  'revision.lastChangeSource',
  'revision.lastChangeSummary',
  'revision.lastChangedBy',
  'revision.lastChangeAt',
  'revision.rollbackAvailable',
  'revision.rollbackNotes',
  'revision',
  'staticPublishing.staticEligible',
  'staticPublishing.needsRebuild',
  'staticPublishing.deploymentStatus',
  'staticPublishing.lastSnapshotAt',
  'staticPublishing.lastStaticBuildAt',
  'staticPublishing.lastDeployedAt',
  'staticPublishing.contentHash',
  'staticPublishing.lastPublishedContentHash',
  'staticPublishing',
  'template.templateKey',
  'template.templateVersion',
  'template.layoutVariant',
  'template.contentModelVersion',
  'template',
  'linking.hubPage',
  'linking.parentPage',
  'linking.relatedPages',
  'linking.requiredLinks',
  'linking.breadcrumbTrail',
  'linking',
  'schemaControls.enableWebPageSchema',
  'schemaControls.enableBreadcrumbSchema',
  'schemaControls.enableFAQSchema',
  'schemaControls.enableServiceSchema',
  'schemaControls.schemaWarnings',
  'schemaControls',
  'formConfig.formType',
  'formConfig.conversionGoal',
  'formConfig.thankYouUrl',
  'formConfig.thankYouMessage',
  'formConfig.recipientGroup',
  'formConfig.staticFormEndpointKey',
  'formConfig.consentRequired',
  'formConfig.spamProtectionEnabled',
  'formConfig',
  'importProvenance.lastImportBatchId',
  'importProvenance.sourceFile',
  'importProvenance.sourceRow',
  'importProvenance.externalId',
  'importProvenance.lockedFields',
  'importProvenance.overwriteBehavior',
  'importProvenance',
  'deploymentHooks.deploymentId',
  'deploymentHooks.buildId',
  'deploymentHooks.buildWarningCount',
  'deploymentHooks.publishSource',
  'deploymentHooks',
  'layoutPositions',
] as const

const JSON_COLUMN_HEADERS = new Set<string>([
  'seo.keywords',
  'seo.alternateUrls',
  'seo.structuredData',
  'seo.openGraph',
  'seo.twitterCard',
  'previousSlugs',
  'redirects',
  'fulfillment',
  'googleAds',
  'media',
  'contentRelationships.relatedHubs',
  'ContentData.ContentBlocks',
  'searchData',
  'pageQuality',
  'workflow',
  'revision',
  'staticPublishing',
  'template',
  'linking.relatedPages',
  'linking.requiredLinks',
  'linking.breadcrumbTrail',
  'linking',
  'schemaControls.schemaWarnings',
  'schemaControls',
  'formConfig',
  'importProvenance.lockedFields',
  'importProvenance',
  'deploymentHooks',
  'layoutPositions',
])

const FILE_ACCEPT: Record<ImportSourceType, string> = {
  json: 'application/json,.json',
  csv: 'text/csv,.csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx',
}

const IMPORT_HANDOFF_STORAGE_KEY = 'pumpkin:page-import-handoff:v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown) {
  if (value === null || value === undefined) return ''
  return typeof value === 'string' ? value : String(value)
}

function numberValue(value: unknown, fallback: number) {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

function booleanOrNull(value: unknown) {
  return typeof value === 'boolean' ? value : null
}

function stringListValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => stringValue(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []

    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => stringValue(item).trim()).filter(Boolean)
      }
    } catch {
      // Fall back to comma-separated values.
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean)
  }

  return []
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

function normalizeRedirectSlug(value: string) {
  try {
    const url = new URL(value)
    return normalizeSlug(url.pathname) || 'home'
  } catch {
    return normalizeSlug(value) || (value.trim() === '/' ? 'home' : '')
  }
}

function getPageRedirects(page: Partial<Page> | null | undefined): PageRedirect[] {
  if (!Array.isArray(page?.redirects)) return []

  return page.redirects
    .map((redirect) => ({
      from: normalizeRedirectSlug(redirect.from),
      to: normalizeRedirectSlug(redirect.to),
      type: 301 as const,
      reason: redirect.reason || 'slug_changed',
      createdAt: redirect.createdAt || '',
      createdBy: redirect.createdBy || '',
      active: redirect.active !== false,
    }))
    .filter((redirect) => redirect.from && redirect.to && redirect.from !== redirect.to)
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

function toJsonCell(value: unknown) {
  if (value === undefined || value === null) return ''
  return JSON.stringify(value)
}

function downloadBlob(fileName: string, content: BlobPart, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function downloadJson(fileName: string, value: unknown) {
  downloadBlob(fileName, JSON.stringify(value, null, 2), 'application/json')
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

function createDefaultMedia() {
  const image = {
    assetId: '',
    url: '',
    alt: '',
    title: '',
    caption: '',
    source: '',
    licenseStatus: '',
    usageStatus: '',
    width: null,
    height: null,
    focalPointX: null,
    focalPointY: null,
    decorative: false,
  }

  return {
    featuredImage: { ...image },
    heroImage: { ...image },
    localImage: { ...image },
    closingImage: { ...image },
    openGraphImage: {
      url: '',
      alt: '',
    },
  }
}

function createDefaultFulfillment() {
  return {
    fulfillmentStatus: '',
    primaryPartnerAvailable: false,
    manualReviewRequired: true,
    providerResearchCompleted: false,
    topProviderCount: 0,
    leadRoutingMode: '',
    publicDisclosureRequired: false,
    confirmedServiceStates: [],
    extendedStatesPossible: [],
  }
}

function createDefaultGoogleAds() {
  return {
    eligible: false,
    finalUrl: '',
    landingPageType: '',
    campaignTheme: '',
    conversionGoals: [],
    notes: '',
  }
}

function createDefaultPageQuality() {
  return {
    buyerIntent: '',
    landingPageType: '',
    launchNotes: '',
  }
}

function createDefaultWorkflow() {
  return {
    status: 'draft',
    approvedForPublish: false,
    approvedBy: '',
    approvedAt: '',
    lastEditedBy: '',
    lastEditedAt: '',
  }
}

function createDefaultRevision() {
  return {
    currentRevisionId: '',
    revisionNumber: 1,
    revisionLabel: '',
    lastSnapshotAt: '',
    lastRevisionAt: '',
    lastRevisionBy: '',
    rollbackAvailable: false,
    rollbackNotes: 'No rollback snapshot has been created yet.',
    lastChangeSummary: '',
    lastChangedBy: '',
    lastChangeSource: 'manual_unknown' as PageChangeSource,
    lastChangeAt: '',
    latestSnapshot: null,
  }
}

function createDefaultStaticPublishing() {
  return {
    staticEligible: false,
    needsRebuild: true,
    lastSnapshotAt: '',
    lastStaticBuildAt: '',
    lastDeployedAt: '',
    contentHash: '',
    lastPublishedContentHash: '',
    deploymentStatus: 'not_deployed',
  }
}

function createDefaultTemplateIdentity() {
  return {
    templateKey: '',
    templateVersion: '',
    layoutVariant: '',
    contentModelVersion: '1',
  }
}

function createDefaultLinking() {
  return {
    hubPage: '',
    parentPage: '',
    relatedPages: [],
    requiredLinks: [],
    breadcrumbTrail: [],
  }
}

function createDefaultSchemaControls() {
  return {
    enableWebPageSchema: true,
    enableBreadcrumbSchema: true,
    enableFAQSchema: true,
    enableServiceSchema: true,
    schemaWarnings: [],
  }
}

function createDefaultFormConfig() {
  return {
    formType: '',
    conversionGoal: '',
    thankYouUrl: '',
    thankYouMessage: '',
    recipientGroup: '',
    staticFormEndpointKey: '',
    consentRequired: true,
    spamProtectionEnabled: false,
  }
}

function createDefaultImportProvenance() {
  return {
    lastImportBatchId: '',
    sourceFile: '',
    sourceRow: '',
    externalId: '',
    lockedFields: [],
    overwriteBehavior: 'warn',
  }
}

function createDefaultDeploymentHooks() {
  return {
    deploymentId: '',
    buildId: '',
    buildWarningCount: 0,
    publishSource: '',
  }
}

function getPageMedia(page: Partial<Page>) {
  return {
    ...createDefaultMedia(),
    ...(isRecord(page.media) ? page.media : {}),
    featuredImage: {
      ...createDefaultMedia().featuredImage,
      ...(isRecord(page.media?.featuredImage) ? page.media.featuredImage : {}),
    },
    heroImage: {
      ...createDefaultMedia().heroImage,
      ...(isRecord(page.media?.heroImage) ? page.media.heroImage : {}),
    },
    localImage: {
      ...createDefaultMedia().localImage,
      ...(isRecord(page.media?.localImage) ? page.media.localImage : {}),
    },
    closingImage: {
      ...createDefaultMedia().closingImage,
      ...(isRecord(page.media?.closingImage) ? page.media.closingImage : {}),
    },
    openGraphImage: {
      ...createDefaultMedia().openGraphImage,
      ...(isRecord(page.media?.openGraphImage) ? page.media.openGraphImage : {}),
    },
  }
}

function getPageFulfillment(page: Partial<Page>) {
  return {
    ...createDefaultFulfillment(),
    ...(isRecord(page.fulfillment) ? page.fulfillment : {}),
  }
}

function getPageGoogleAds(page: Partial<Page>) {
  return {
    ...createDefaultGoogleAds(),
    ...(isRecord(page.googleAds) ? page.googleAds : {}),
  }
}

function getPageQuality(page: Partial<Page>) {
  return {
    ...createDefaultPageQuality(),
    ...(isRecord(page.pageQuality) ? page.pageQuality : {}),
  }
}

function getPageWorkflow(page: Partial<Page>) {
  return {
    ...createDefaultWorkflow(),
    ...(isRecord(page.workflow) ? page.workflow : {}),
  }
}

function getPageRevision(page: Partial<Page>) {
  return {
    ...createDefaultRevision(),
    ...(isRecord(page.revision) ? page.revision : {}),
  }
}

function getPageStaticPublishing(page: Partial<Page>) {
  return {
    ...createDefaultStaticPublishing(),
    ...(isRecord(page.staticPublishing) ? page.staticPublishing : {}),
  }
}

function getPageTemplate(page: Partial<Page>) {
  return {
    ...createDefaultTemplateIdentity(),
    ...(isRecord(page.template) ? page.template : {}),
  }
}

function getPageLinking(page: Partial<Page>) {
  return {
    ...createDefaultLinking(),
    ...(isRecord(page.linking) ? page.linking : {}),
  }
}

function getPageSchemaControls(page: Partial<Page>) {
  return {
    ...createDefaultSchemaControls(),
    ...(isRecord(page.schemaControls) ? page.schemaControls : {}),
  }
}

function getPageFormConfig(page: Partial<Page>) {
  return {
    ...createDefaultFormConfig(),
    ...(isRecord(page.formConfig) ? page.formConfig : {}),
  }
}

function getPageImportProvenance(page: Partial<Page>) {
  return {
    ...createDefaultImportProvenance(),
    ...(isRecord(page.importProvenance) ? page.importProvenance : {}),
  }
}

function getPageDeploymentHooks(page: Partial<Page>) {
  return {
    ...createDefaultDeploymentHooks(),
    ...(isRecord(page.deploymentHooks) ? page.deploymentHooks : {}),
  }
}

function createTemplatePage(tenantId: string) {
  const now = new Date().toISOString()
  const slug = 'example-page'
  const title = 'Example Page'
  const pageId = buildPageId(tenantId, slug)
  const blocks: IHtmlBlock[] = [
    {
      type: 'Hero',
      content: {
        type: 'Main',
        headline: title,
        subheadline: '',
        buttonText: 'Contact Us',
        buttonLink: '/contact',
        backgroundImage: '',
        backgroundImageAltText: '',
        mainImage: '',
        mainImageAltText: '',
      },
    },
  ]

  return {
    id: pageId,
    PageId: pageId,
    tenantId,
    pageSlug: slug,
    PageVersion: 1,
    Layout: 'default',
    MetaData: {
      ...createDefaultMetaData(title, now),
      author: 'Pumpkin CMS Template',
    },
    searchData: createDefaultSearchData(title, blocks.map((block) => block.type)),
    ContentData: {
      ContentBlocks: blocks,
    },
    contentRelationships: createDefaultRelationships(),
    seo: createDefaultSeo(title),
    isPublished: false,
    publishedAt: null,
    includeInSitemap: false,
    previousSlugs: [],
    redirects: [],
    sitemapPriority: null,
    sitemapChangeFrequency: '',
    media: createDefaultMedia(),
    fulfillment: createDefaultFulfillment(),
    googleAds: createDefaultGoogleAds(),
    pageQuality: createDefaultPageQuality(),
    workflow: createDefaultWorkflow(),
    revision: createDefaultRevision(),
    staticPublishing: createDefaultStaticPublishing(),
    template: createDefaultTemplateIdentity(),
    linking: createDefaultLinking(),
    schemaControls: createDefaultSchemaControls(),
    formConfig: createDefaultFormConfig(),
    importProvenance: createDefaultImportProvenance(),
    deploymentHooks: createDefaultDeploymentHooks(),
  } satisfies Page
}

function getBlocks(value: Record<string, unknown>) {
  const contentData = isRecord(value.ContentData) ? value.ContentData : {}
  const blocks = contentData.ContentBlocks
  return Array.isArray(blocks) ? blocks as IHtmlBlock[] : []
}

function parseJsonImportText(importText: string): ParsedImport {
  const errors: string[] = []
  const warnings: string[] = []
  const trimmed = importText.trim()

  if (!trimmed) {
    return {
      entries: [],
      sourceType: 'json',
      errors: ['Paste or upload JSON before running import validation.'],
      warnings,
    }
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(trimmed)
  } catch (error) {
    return {
      entries: [],
      sourceType: 'json',
      errors: [getErrorMessage(error, 'Invalid JSON.')],
      warnings,
    }
  }

  if (Array.isArray(parsed)) {
    const entries = parsed
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => isRecord(entry))
      .map(({ entry, index }) => ({
        page: entry as Record<string, unknown>,
        sourceRow: index + 1,
        errors: [],
        warnings: [],
      }))

    return {
      entries,
      sourceType: 'json',
      errors: parsed.every(isRecord) ? [] : ['Import array contains non-object entries.'],
      warnings,
    }
  }

  if (!isRecord(parsed)) {
    return {
      entries: [],
      sourceType: 'json',
      errors: ['Import JSON must be a Page object, an array of Page objects, or a wrapped export object.'],
      warnings,
    }
  }

  if (Array.isArray(parsed.pages)) {
    const wrapperTenantId = stringValue(parsed.tenantId) || undefined
    const entries = parsed.pages
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => isRecord(entry))
      .map(({ entry, index }) => ({
        page: entry as Record<string, unknown>,
        sourceRow: index + 1,
        errors: [],
        warnings: [],
      }))

    if (entries.length !== parsed.pages.length) {
      errors.push('Wrapped export contains non-object page entries.')
    }

    return { entries, wrapperTenantId, sourceType: 'json', errors, warnings }
  }

  if ('pageSlug' in parsed || 'PageId' in parsed || 'ContentData' in parsed) {
    return {
      entries: [{ page: parsed, sourceRow: 1, errors, warnings }],
      sourceType: 'json',
      errors,
      warnings,
    }
  }

  return {
    entries: [],
    sourceType: 'json',
    errors: ['Import object does not look like a Page document or wrapped page export.'],
    warnings,
  }
}

function getExistingBySlug(pages: Page[]) {
  return new Map(pages.map((page) => [normalizeSlug(page.pageSlug), page]))
}

function escapeCsvValue(value: string) {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
}

function rowsToCsv(rows: FlatPageRow[]) {
  const lines = [
    PAGE_FLAT_HEADERS.join(','),
    ...rows.map((row) => PAGE_FLAT_HEADERS.map((header) => escapeCsvValue(row[header] || '')).join(',')),
  ]

  return `${lines.join('\r\n')}\r\n`
}

function parseCsvText(text: string): CsvParseResult {
  const rows: string[][] = []
  const errors: string[] = []
  let currentRow: string[] = []
  let currentValue = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const nextChar = text[index + 1]

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentValue += '"'
        index += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        currentValue += char
      }
      continue
    }

    if (char === '"') {
      if (currentValue.length > 0) {
        currentValue += char
      } else {
        inQuotes = true
      }
    } else if (char === ',') {
      currentRow.push(currentValue)
      currentValue = ''
    } else if (char === '\r' || char === '\n') {
      currentRow.push(currentValue)
      rows.push(currentRow)
      currentRow = []
      currentValue = ''
      if (char === '\r' && nextChar === '\n') {
        index += 1
      }
    } else {
      currentValue += char
    }
  }

  if (inQuotes) {
    errors.push('CSV contains an unterminated quoted value.')
  }

  if (currentValue.length > 0 || currentRow.length > 0) {
    currentRow.push(currentValue)
    rows.push(currentRow)
  }

  const nonEmptyRows = rows.filter((row) => row.some((value) => value.trim().length > 0))
  const headers = nonEmptyRows[0]?.map((header) => header.trim()) || []

  if (headers.length === 0) {
    errors.push('CSV must include a header row.')
  }

  return {
    headers,
    rows: nonEmptyRows.slice(1),
    errors,
  }
}

function parseBooleanCell(value: string, fieldName: string, sourceRow: number, errors: string[]) {
  const normalized = value.trim().toLowerCase()

  if (['true', '1', 'yes', 'y'].includes(normalized)) return true
  if (['false', '0', 'no', 'n'].includes(normalized)) return false

  errors.push(`Row ${sourceRow}: ${fieldName} must be true or false.`)
  return null
}

function parseOptionalBooleanCell(value: string, fallback: boolean, fieldName: string, sourceRow: number, errors: string[]) {
  if (!value.trim()) return fallback

  const parsed = parseBooleanCell(value, fieldName, sourceRow, errors)
  return parsed === null ? fallback : parsed
}

function parseNumberCell(value: string, fallback: number, fieldName: string, sourceRow: number, warnings: string[]) {
  if (!value.trim()) return fallback

  const parsed = Number(value)
  if (Number.isFinite(parsed)) return parsed

  warnings.push(`Row ${sourceRow}: ${fieldName} is not a number and will use ${fallback}.`)
  return fallback
}

function parseJsonCell(
  value: string,
  fieldName: string,
  sourceRow: number,
  expectedType: JsonColumnType,
  fallback: unknown,
  errors: string[],
) {
  const trimmed = value.trim()
  if (!trimmed) return fallback

  try {
    const parsed = JSON.parse(trimmed)
    if (expectedType === 'array' && !Array.isArray(parsed)) {
      errors.push(`Row ${sourceRow}: ${fieldName} must be a JSON array.`)
      return fallback
    }

    if (expectedType === 'object' && !isRecord(parsed)) {
      errors.push(`Row ${sourceRow}: ${fieldName} must be a JSON object.`)
      return fallback
    }

    return parsed
  } catch (error) {
    errors.push(`Row ${sourceRow}: ${fieldName} contains invalid JSON (${getErrorMessage(error, 'parse failed')}).`)
    return fallback
  }
}

function flattenPage(page: Page): FlatPageRow {
  const media = getPageMedia(page)
  const fulfillment = getPageFulfillment(page)
  const googleAds = getPageGoogleAds(page)
  const pageQuality = getPageQuality(page)
  const workflow = getPageWorkflow(page)
  const revision = getPageRevision(page)
  const staticPublishing = getPageStaticPublishing(page)
  const template = getPageTemplate(page)
  const linking = getPageLinking(page)
  const schemaControls = getPageSchemaControls(page)
  const formConfig = getPageFormConfig(page)
  const importProvenance = getPageImportProvenance(page)
  const deploymentHooks = getPageDeploymentHooks(page)
  const targetKeyword = page.MetaData?.keyword || page.searchData?.keyword || ''
  const secondaryKeywords = page.seo?.keywords || []
  const redirects = getPageRedirects(page)
  const activeRedirectCount = redirects.filter((redirect) => redirect.active).length

  return {
    id: page.id || '',
    PageId: page.PageId || '',
    tenantId: page.tenantId || '',
    pageSlug: page.pageSlug || '',
    PageVersion: stringValue(page.PageVersion),
    Layout: page.Layout || '',
    'MetaData.title': page.MetaData?.title || '',
    'MetaData.description': page.MetaData?.description || '',
    'MetaData.category': page.MetaData?.category || '',
    'MetaData.product': page.MetaData?.product || '',
    'MetaData.keyword': page.MetaData?.keyword || '',
    'MetaData.pageType': page.MetaData?.pageType || '',
    'MetaData.createdAt': page.MetaData?.createdAt || '',
    'MetaData.updatedAt': page.MetaData?.updatedAt || '',
    'MetaData.author': page.MetaData?.author || '',
    'MetaData.language': page.MetaData?.language || '',
    'MetaData.market': page.MetaData?.market || '',
    targetKeyword,
    secondaryKeywords: secondaryKeywords.join(', '),
    pageType: page.MetaData?.pageType || '',
    state: page.searchData?.state || '',
    city: page.searchData?.city || '',
    region: page.searchData?.metro || '',
    metro: page.searchData?.metro || '',
    county: page.searchData?.county || '',
    primaryService: page.MetaData?.product || '',
    buyerIntent: pageQuality.buyerIntent,
    landingPageType: pageQuality.landingPageType || googleAds.landingPageType,
    previousSlugs: toJsonCell(page.previousSlugs || []),
    redirects: toJsonCell(redirects),
    redirectCount: stringValue(redirects.length),
    hasActiveRedirects: stringValue(activeRedirectCount > 0),
    'seo.metaTitle': page.seo?.metaTitle || '',
    'seo.metaDescription': page.seo?.metaDescription || '',
    'seo.robots': page.seo?.robots || '',
    'seo.canonicalUrl': page.seo?.canonicalUrl || '',
    'seo.keywords': toJsonCell(page.seo?.keywords || []),
    'seo.alternateUrls': toJsonCell(page.seo?.alternateUrls || []),
    'seo.structuredData': toJsonCell(page.seo?.structuredData || []),
    'seo.openGraph': toJsonCell(page.seo?.openGraph || {}),
    'seo.twitterCard': toJsonCell(page.seo?.twitterCard || {}),
    isPublished: stringValue(page.isPublished),
    includeInSitemap: stringValue(page.includeInSitemap),
    sitemapPriority: page.sitemapPriority === null || page.sitemapPriority === undefined ? '' : stringValue(page.sitemapPriority),
    sitemapChangeFrequency: page.sitemapChangeFrequency || '',
    publishedAt: page.publishedAt || '',
    fulfillmentStatus: stringValue(fulfillment.fulfillmentStatus),
    primaryPartnerAvailable: stringValue(fulfillment.primaryPartnerAvailable),
    leadRoutingMode: stringValue(fulfillment.leadRoutingMode),
    publicDisclosureRequired: stringValue(fulfillment.publicDisclosureRequired),
    fulfillment: toJsonCell(fulfillment),
    'googleAds.eligible': stringValue(googleAds.eligible),
    'googleAds.finalUrl': stringValue(googleAds.finalUrl),
    googleAds: toJsonCell(googleAds),
    'featuredImage.assetId': stringValue(media.featuredImage.assetId),
    'featuredImage.url': stringValue(media.featuredImage.url),
    'featuredImage.alt': stringValue(media.featuredImage.alt),
    'heroImage.assetId': stringValue(media.heroImage.assetId),
    'heroImage.url': stringValue(media.heroImage.url),
    'heroImage.alt': stringValue(media.heroImage.alt),
    'localImage.assetId': stringValue(media.localImage.assetId),
    'localImage.url': stringValue(media.localImage.url),
    'localImage.alt': stringValue(media.localImage.alt),
    'closingImage.assetId': stringValue(media.closingImage.assetId),
    'closingImage.url': stringValue(media.closingImage.url),
    'closingImage.alt': stringValue(media.closingImage.alt),
    media: toJsonCell(media),
    'contentRelationships.isHub': stringValue(page.contentRelationships?.isHub || false),
    'contentRelationships.hubPageSlug': page.contentRelationships?.hubPageSlug || '',
    'contentRelationships.topicCluster': page.contentRelationships?.topicCluster || '',
    'contentRelationships.relatedHubs': toJsonCell(page.contentRelationships?.relatedHubs || []),
    'contentRelationships.spokePriority': stringValue(page.contentRelationships?.spokePriority || 0),
    'ContentData.ContentBlocks': toJsonCell(page.ContentData?.ContentBlocks || []),
    searchData: toJsonCell(page.searchData || createDefaultSearchData(getPageTitle(page), [])),
    pageQuality: toJsonCell(pageQuality),
    'workflow.status': stringValue(workflow.status),
    'workflow.approvedForPublish': stringValue(workflow.approvedForPublish),
    'workflow.approvedBy': stringValue(workflow.approvedBy),
    'workflow.approvedAt': stringValue(workflow.approvedAt),
    'workflow.lastEditedBy': stringValue(workflow.lastEditedBy),
    'workflow.lastEditedAt': stringValue(workflow.lastEditedAt),
    workflow: toJsonCell(workflow),
    'revision.revisionNumber': stringValue(revision.revisionNumber),
    'revision.currentRevisionId': stringValue(revision.currentRevisionId),
    'revision.lastSnapshotAt': stringValue(revision.lastSnapshotAt),
    'revision.lastChangeSource': stringValue(revision.lastChangeSource),
    'revision.lastChangeSummary': stringValue(revision.lastChangeSummary),
    'revision.lastChangedBy': stringValue(revision.lastChangedBy),
    'revision.lastChangeAt': stringValue(revision.lastChangeAt),
    'revision.rollbackAvailable': stringValue(revision.rollbackAvailable),
    'revision.rollbackNotes': stringValue(revision.rollbackNotes),
    revision: toJsonCell(revision),
    'staticPublishing.staticEligible': stringValue(staticPublishing.staticEligible),
    'staticPublishing.needsRebuild': stringValue(staticPublishing.needsRebuild),
    'staticPublishing.deploymentStatus': stringValue(staticPublishing.deploymentStatus),
    'staticPublishing.lastSnapshotAt': stringValue(staticPublishing.lastSnapshotAt),
    'staticPublishing.lastStaticBuildAt': stringValue(staticPublishing.lastStaticBuildAt),
    'staticPublishing.lastDeployedAt': stringValue(staticPublishing.lastDeployedAt),
    'staticPublishing.contentHash': stringValue(staticPublishing.contentHash),
    'staticPublishing.lastPublishedContentHash': stringValue(staticPublishing.lastPublishedContentHash),
    staticPublishing: toJsonCell(staticPublishing),
    'template.templateKey': stringValue(template.templateKey),
    'template.templateVersion': stringValue(template.templateVersion),
    'template.layoutVariant': stringValue(template.layoutVariant),
    'template.contentModelVersion': stringValue(template.contentModelVersion),
    template: toJsonCell(template),
    'linking.hubPage': stringValue(linking.hubPage),
    'linking.parentPage': stringValue(linking.parentPage),
    'linking.relatedPages': toJsonCell(linking.relatedPages),
    'linking.requiredLinks': toJsonCell(linking.requiredLinks),
    'linking.breadcrumbTrail': toJsonCell(linking.breadcrumbTrail),
    linking: toJsonCell(linking),
    'schemaControls.enableWebPageSchema': stringValue(schemaControls.enableWebPageSchema),
    'schemaControls.enableBreadcrumbSchema': stringValue(schemaControls.enableBreadcrumbSchema),
    'schemaControls.enableFAQSchema': stringValue(schemaControls.enableFAQSchema),
    'schemaControls.enableServiceSchema': stringValue(schemaControls.enableServiceSchema),
    'schemaControls.schemaWarnings': toJsonCell(schemaControls.schemaWarnings),
    schemaControls: toJsonCell(schemaControls),
    'formConfig.formType': stringValue(formConfig.formType),
    'formConfig.conversionGoal': stringValue(formConfig.conversionGoal),
    'formConfig.thankYouUrl': stringValue(formConfig.thankYouUrl),
    'formConfig.thankYouMessage': stringValue(formConfig.thankYouMessage),
    'formConfig.recipientGroup': stringValue(formConfig.recipientGroup),
    'formConfig.staticFormEndpointKey': stringValue(formConfig.staticFormEndpointKey),
    'formConfig.consentRequired': stringValue(formConfig.consentRequired),
    'formConfig.spamProtectionEnabled': stringValue(formConfig.spamProtectionEnabled),
    formConfig: toJsonCell(formConfig),
    'importProvenance.lastImportBatchId': stringValue(importProvenance.lastImportBatchId),
    'importProvenance.sourceFile': stringValue(importProvenance.sourceFile),
    'importProvenance.sourceRow': stringValue(importProvenance.sourceRow),
    'importProvenance.externalId': stringValue(importProvenance.externalId),
    'importProvenance.lockedFields': toJsonCell(importProvenance.lockedFields),
    'importProvenance.overwriteBehavior': stringValue(importProvenance.overwriteBehavior),
    importProvenance: toJsonCell(importProvenance),
    'deploymentHooks.deploymentId': stringValue(deploymentHooks.deploymentId),
    'deploymentHooks.buildId': stringValue(deploymentHooks.buildId),
    'deploymentHooks.buildWarningCount': stringValue(deploymentHooks.buildWarningCount),
    'deploymentHooks.publishSource': stringValue(deploymentHooks.publishSource),
    deploymentHooks: toJsonCell(deploymentHooks),
    layoutPositions: toJsonCell(page.layoutPositions || {}),
  }
}

function flatRowToPage(row: FlatPageRow, sourceRow: number): FlatRowParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const now = new Date().toISOString()
  const rawSlug = row.pageSlug || ''
  const title = row['MetaData.title'] || rawSlug || `Import row ${sourceRow}`
  const blocks = parseJsonCell(row['ContentData.ContentBlocks'] || '', 'ContentData.ContentBlocks', sourceRow, 'array', [], errors) as IHtmlBlock[]
  const blockTypes = blocks.map((block) => block.type).filter(Boolean)
  const searchData = parseJsonCell(
    row.searchData || '',
    'searchData',
    sourceRow,
    'object',
    createDefaultSearchData(title, blockTypes),
    errors,
  ) as Record<string, unknown>
  const keywords = parseJsonCell(row['seo.keywords'] || '', 'seo.keywords', sourceRow, 'array', [], errors)
  const alternateUrls = parseJsonCell(row['seo.alternateUrls'] || '', 'seo.alternateUrls', sourceRow, 'array', [], errors)
  const structuredData = parseJsonCell(row['seo.structuredData'] || '', 'seo.structuredData', sourceRow, 'array', [], errors)
  const openGraph = parseJsonCell(row['seo.openGraph'] || '', 'seo.openGraph', sourceRow, 'object', {}, errors)
  const twitterCard = parseJsonCell(row['seo.twitterCard'] || '', 'seo.twitterCard', sourceRow, 'object', {}, errors)
  const mediaJson = parseJsonCell(row.media || '', 'media', sourceRow, 'object', {}, errors)
  const fulfillmentJson = parseJsonCell(row.fulfillment || '', 'fulfillment', sourceRow, 'object', {}, errors)
  const googleAdsJson = parseJsonCell(row.googleAds || '', 'googleAds', sourceRow, 'object', {}, errors)
  const pageQualityJson = parseJsonCell(row.pageQuality || '', 'pageQuality', sourceRow, 'object', {}, errors)
  const workflowJson = parseJsonCell(row.workflow || '', 'workflow', sourceRow, 'object', {}, errors)
  const revisionJson = parseJsonCell(row.revision || '', 'revision', sourceRow, 'object', {}, errors)
  const staticPublishingJson = parseJsonCell(row.staticPublishing || '', 'staticPublishing', sourceRow, 'object', {}, errors)
  const templateJson = parseJsonCell(row.template || '', 'template', sourceRow, 'object', {}, errors)
  const linkingJson = parseJsonCell(row.linking || '', 'linking', sourceRow, 'object', {}, errors)
  const schemaControlsJson = parseJsonCell(row.schemaControls || '', 'schemaControls', sourceRow, 'object', {}, errors)
  const formConfigJson = parseJsonCell(row.formConfig || '', 'formConfig', sourceRow, 'object', {}, errors)
  const importProvenanceJson = parseJsonCell(row.importProvenance || '', 'importProvenance', sourceRow, 'object', {}, errors)
  const deploymentHooksJson = parseJsonCell(row.deploymentHooks || '', 'deploymentHooks', sourceRow, 'object', {}, errors)
  const previousSlugs = stringListValue(row.previousSlugs || '')
  const redirectsJson = parseJsonCell(row.redirects || '', 'redirects', sourceRow, 'array', [], errors)
  const redirects = getPageRedirects({ redirects: Array.isArray(redirectsJson) ? redirectsJson as PageRedirect[] : [] })
  const relatedHubs = parseJsonCell(
    row['contentRelationships.relatedHubs'] || '',
    'contentRelationships.relatedHubs',
    sourceRow,
    'array',
    [],
    errors,
  )
  const layoutPositions = parseJsonCell(row.layoutPositions || '', 'layoutPositions', sourceRow, 'object', {}, errors)
  const isPublished = parseBooleanCell(row.isPublished || '', 'isPublished', sourceRow, errors)
  const includeInSitemap = parseBooleanCell(row.includeInSitemap || '', 'includeInSitemap', sourceRow, errors)
  const isHub = parseBooleanCell(row['contentRelationships.isHub'] || 'false', 'contentRelationships.isHub', sourceRow, errors)
  const primaryPartnerAvailable = parseOptionalBooleanCell(row.primaryPartnerAvailable || '', false, 'primaryPartnerAvailable', sourceRow, errors)
  const publicDisclosureRequired = parseOptionalBooleanCell(row.publicDisclosureRequired || '', false, 'publicDisclosureRequired', sourceRow, errors)
  const googleAdsEligible = parseOptionalBooleanCell(row['googleAds.eligible'] || '', false, 'googleAds.eligible', sourceRow, errors)
  const workflowApprovedForPublish = parseOptionalBooleanCell(row['workflow.approvedForPublish'] || '', false, 'workflow.approvedForPublish', sourceRow, errors)
  const rollbackAvailable = parseOptionalBooleanCell(row['revision.rollbackAvailable'] || '', false, 'revision.rollbackAvailable', sourceRow, errors)
  const staticEligible = parseOptionalBooleanCell(row['staticPublishing.staticEligible'] || '', false, 'staticPublishing.staticEligible', sourceRow, errors)
  const staticNeedsRebuild = parseOptionalBooleanCell(row['staticPublishing.needsRebuild'] || '', true, 'staticPublishing.needsRebuild', sourceRow, errors)
  const enableWebPageSchema = parseOptionalBooleanCell(row['schemaControls.enableWebPageSchema'] || '', true, 'schemaControls.enableWebPageSchema', sourceRow, errors)
  const enableBreadcrumbSchema = parseOptionalBooleanCell(row['schemaControls.enableBreadcrumbSchema'] || '', true, 'schemaControls.enableBreadcrumbSchema', sourceRow, errors)
  const enableFAQSchema = parseOptionalBooleanCell(row['schemaControls.enableFAQSchema'] || '', true, 'schemaControls.enableFAQSchema', sourceRow, errors)
  const enableServiceSchema = parseOptionalBooleanCell(row['schemaControls.enableServiceSchema'] || '', true, 'schemaControls.enableServiceSchema', sourceRow, errors)
  const consentRequired = parseOptionalBooleanCell(row['formConfig.consentRequired'] || '', true, 'formConfig.consentRequired', sourceRow, errors)
  const spamProtectionEnabled = parseOptionalBooleanCell(row['formConfig.spamProtectionEnabled'] || '', false, 'formConfig.spamProtectionEnabled', sourceRow, errors)
  const version = parseNumberCell(row.PageVersion || '1', 1, 'PageVersion', sourceRow, warnings)
  const sitemapPriority = row.sitemapPriority?.trim()
    ? parseNumberCell(row.sitemapPriority, 0.5, 'sitemapPriority', sourceRow, warnings)
    : null
  const spokePriority = parseNumberCell(
    row['contentRelationships.spokePriority'] || '0',
    0,
    'contentRelationships.spokePriority',
    sourceRow,
    warnings,
  )

  if (!row['MetaData.title']?.trim()) {
    warnings.push(`Row ${sourceRow}: MetaData.title is empty.`)
  }

  const targetKeyword = row.targetKeyword || row['MetaData.keyword'] || title
  const pageType = row.pageType || row['MetaData.pageType'] || 'page'
  const primaryService = row.primaryService || row['MetaData.product'] || ''
  const landingPageType = row.landingPageType || stringValue((pageQualityJson as Record<string, unknown>).landingPageType)
  const mediaRecord = isRecord(mediaJson) ? mediaJson : {}
  const featuredImage = isRecord(mediaRecord.featuredImage) ? mediaRecord.featuredImage : {}
  const heroImage = isRecord(mediaRecord.heroImage) ? mediaRecord.heroImage : {}
  const localImage = isRecord(mediaRecord.localImage) ? mediaRecord.localImage : {}
  const closingImage = isRecord(mediaRecord.closingImage) ? mediaRecord.closingImage : {}
  const openGraphImage = isRecord(mediaRecord.openGraphImage) ? mediaRecord.openGraphImage : {}
  const media = {
    ...createDefaultMedia(),
    ...mediaRecord,
    featuredImage: {
      ...createDefaultMedia().featuredImage,
      ...featuredImage,
      assetId: row['featuredImage.assetId'] || stringValue(featuredImage.assetId),
      url: row['featuredImage.url'] || stringValue(featuredImage.url),
      alt: row['featuredImage.alt'] || stringValue(featuredImage.alt),
    },
    heroImage: {
      ...createDefaultMedia().heroImage,
      ...heroImage,
      assetId: row['heroImage.assetId'] || stringValue(heroImage.assetId),
      url: row['heroImage.url'] || stringValue(heroImage.url),
      alt: row['heroImage.alt'] || stringValue(heroImage.alt),
    },
    localImage: {
      ...createDefaultMedia().localImage,
      ...localImage,
      assetId: row['localImage.assetId'] || stringValue(localImage.assetId),
      url: row['localImage.url'] || stringValue(localImage.url),
      alt: row['localImage.alt'] || stringValue(localImage.alt),
    },
    closingImage: {
      ...createDefaultMedia().closingImage,
      ...closingImage,
      assetId: row['closingImage.assetId'] || stringValue(closingImage.assetId),
      url: row['closingImage.url'] || stringValue(closingImage.url),
      alt: row['closingImage.alt'] || stringValue(closingImage.alt),
    },
    openGraphImage: {
      ...createDefaultMedia().openGraphImage,
      ...openGraphImage,
    },
  }
  const fulfillment = {
    ...createDefaultFulfillment(),
    ...(isRecord(fulfillmentJson) ? fulfillmentJson : {}),
    fulfillmentStatus: row.fulfillmentStatus || stringValue((fulfillmentJson as Record<string, unknown>).fulfillmentStatus),
    primaryPartnerAvailable,
    leadRoutingMode: row.leadRoutingMode || stringValue((fulfillmentJson as Record<string, unknown>).leadRoutingMode),
    publicDisclosureRequired,
  }
  const googleAds = {
    ...createDefaultGoogleAds(),
    ...(isRecord(googleAdsJson) ? googleAdsJson : {}),
    eligible: googleAdsEligible,
    finalUrl: row['googleAds.finalUrl'] || stringValue((googleAdsJson as Record<string, unknown>).finalUrl),
    landingPageType,
    conversionGoals: stringListValue((googleAdsJson as Record<string, unknown>).conversionGoals),
  }
  const pageQuality = {
    ...createDefaultPageQuality(),
    ...(isRecord(pageQualityJson) ? pageQualityJson : {}),
    buyerIntent: row.buyerIntent || stringValue((pageQualityJson as Record<string, unknown>).buyerIntent),
    landingPageType,
  }
  const workflow = {
    ...createDefaultWorkflow(),
    ...(isRecord(workflowJson) ? workflowJson : {}),
    status: row['workflow.status'] || stringValue((workflowJson as Record<string, unknown>).status) || (isPublished ? 'published' : 'draft'),
    approvedForPublish: workflowApprovedForPublish,
    approvedBy: row['workflow.approvedBy'] || stringValue((workflowJson as Record<string, unknown>).approvedBy),
    approvedAt: row['workflow.approvedAt'] || stringValue((workflowJson as Record<string, unknown>).approvedAt),
    lastEditedBy: row['workflow.lastEditedBy'] || stringValue((workflowJson as Record<string, unknown>).lastEditedBy),
    lastEditedAt: row['workflow.lastEditedAt'] || stringValue((workflowJson as Record<string, unknown>).lastEditedAt),
  }
  const revision = {
    ...createDefaultRevision(),
    ...(isRecord(revisionJson) ? revisionJson : {}),
    revisionNumber: parseNumberCell(row['revision.revisionNumber'] || stringValue((revisionJson as Record<string, unknown>).revisionNumber) || '1', 1, 'revision.revisionNumber', sourceRow, warnings),
    currentRevisionId: row['revision.currentRevisionId'] || stringValue((revisionJson as Record<string, unknown>).currentRevisionId),
    lastSnapshotAt: row['revision.lastSnapshotAt'] || stringValue((revisionJson as Record<string, unknown>).lastSnapshotAt),
    lastChangeSource: (row['revision.lastChangeSource'] || stringValue((revisionJson as Record<string, unknown>).lastChangeSource) || 'manual_unknown') as PageChangeSource,
    lastChangeSummary: row['revision.lastChangeSummary'] || stringValue((revisionJson as Record<string, unknown>).lastChangeSummary),
    lastChangedBy: row['revision.lastChangedBy'] || stringValue((revisionJson as Record<string, unknown>).lastChangedBy),
    lastChangeAt: row['revision.lastChangeAt'] || stringValue((revisionJson as Record<string, unknown>).lastChangeAt),
    rollbackAvailable,
    rollbackNotes: row['revision.rollbackNotes'] || stringValue((revisionJson as Record<string, unknown>).rollbackNotes) || 'No rollback snapshot has been created yet.',
  }
  const staticPublishing = {
    ...createDefaultStaticPublishing(),
    ...(isRecord(staticPublishingJson) ? staticPublishingJson : {}),
    staticEligible,
    needsRebuild: staticNeedsRebuild,
    deploymentStatus: row['staticPublishing.deploymentStatus'] || stringValue((staticPublishingJson as Record<string, unknown>).deploymentStatus) || 'not_deployed',
    lastSnapshotAt: row['staticPublishing.lastSnapshotAt'] || stringValue((staticPublishingJson as Record<string, unknown>).lastSnapshotAt),
    lastStaticBuildAt: row['staticPublishing.lastStaticBuildAt'] || stringValue((staticPublishingJson as Record<string, unknown>).lastStaticBuildAt),
    lastDeployedAt: row['staticPublishing.lastDeployedAt'] || stringValue((staticPublishingJson as Record<string, unknown>).lastDeployedAt),
    contentHash: row['staticPublishing.contentHash'] || stringValue((staticPublishingJson as Record<string, unknown>).contentHash),
    lastPublishedContentHash: row['staticPublishing.lastPublishedContentHash'] || stringValue((staticPublishingJson as Record<string, unknown>).lastPublishedContentHash),
  }
  const template = {
    ...createDefaultTemplateIdentity(),
    ...(isRecord(templateJson) ? templateJson : {}),
    templateKey: row['template.templateKey'] || stringValue((templateJson as Record<string, unknown>).templateKey),
    templateVersion: row['template.templateVersion'] || stringValue((templateJson as Record<string, unknown>).templateVersion),
    layoutVariant: row['template.layoutVariant'] || stringValue((templateJson as Record<string, unknown>).layoutVariant),
    contentModelVersion: row['template.contentModelVersion'] || stringValue((templateJson as Record<string, unknown>).contentModelVersion) || '1',
  }
  const linking = {
    ...createDefaultLinking(),
    ...(isRecord(linkingJson) ? linkingJson : {}),
    hubPage: row['linking.hubPage'] || stringValue((linkingJson as Record<string, unknown>).hubPage),
    parentPage: row['linking.parentPage'] || stringValue((linkingJson as Record<string, unknown>).parentPage),
    relatedPages: row['linking.relatedPages'] ? stringListValue(row['linking.relatedPages']) : stringListValue((linkingJson as Record<string, unknown>).relatedPages),
    requiredLinks: row['linking.requiredLinks'] ? stringListValue(row['linking.requiredLinks']) : stringListValue((linkingJson as Record<string, unknown>).requiredLinks),
    breadcrumbTrail: row['linking.breadcrumbTrail'] ? stringListValue(row['linking.breadcrumbTrail']) : stringListValue((linkingJson as Record<string, unknown>).breadcrumbTrail),
  }
  const schemaControls = {
    ...createDefaultSchemaControls(),
    ...(isRecord(schemaControlsJson) ? schemaControlsJson : {}),
    enableWebPageSchema,
    enableBreadcrumbSchema,
    enableFAQSchema,
    enableServiceSchema,
    schemaWarnings: row['schemaControls.schemaWarnings'] ? stringListValue(row['schemaControls.schemaWarnings']) : stringListValue((schemaControlsJson as Record<string, unknown>).schemaWarnings),
  }
  const formConfig = {
    ...createDefaultFormConfig(),
    ...(isRecord(formConfigJson) ? formConfigJson : {}),
    formType: row['formConfig.formType'] || stringValue((formConfigJson as Record<string, unknown>).formType),
    conversionGoal: row['formConfig.conversionGoal'] || stringValue((formConfigJson as Record<string, unknown>).conversionGoal),
    thankYouUrl: row['formConfig.thankYouUrl'] || stringValue((formConfigJson as Record<string, unknown>).thankYouUrl),
    thankYouMessage: row['formConfig.thankYouMessage'] || stringValue((formConfigJson as Record<string, unknown>).thankYouMessage),
    recipientGroup: row['formConfig.recipientGroup'] || stringValue((formConfigJson as Record<string, unknown>).recipientGroup),
    staticFormEndpointKey: row['formConfig.staticFormEndpointKey'] || stringValue((formConfigJson as Record<string, unknown>).staticFormEndpointKey),
    consentRequired,
    spamProtectionEnabled,
  }
  const importProvenance = {
    ...createDefaultImportProvenance(),
    ...(isRecord(importProvenanceJson) ? importProvenanceJson : {}),
    lastImportBatchId: row['importProvenance.lastImportBatchId'] || stringValue((importProvenanceJson as Record<string, unknown>).lastImportBatchId),
    sourceFile: row['importProvenance.sourceFile'] || stringValue((importProvenanceJson as Record<string, unknown>).sourceFile),
    sourceRow: row['importProvenance.sourceRow'] || stringValue((importProvenanceJson as Record<string, unknown>).sourceRow),
    externalId: row['importProvenance.externalId'] || stringValue((importProvenanceJson as Record<string, unknown>).externalId),
    lockedFields: row['importProvenance.lockedFields'] ? stringListValue(row['importProvenance.lockedFields']) : stringListValue((importProvenanceJson as Record<string, unknown>).lockedFields),
    overwriteBehavior: row['importProvenance.overwriteBehavior'] || stringValue((importProvenanceJson as Record<string, unknown>).overwriteBehavior) || 'warn',
  }
  const deploymentHooks = {
    ...createDefaultDeploymentHooks(),
    ...(isRecord(deploymentHooksJson) ? deploymentHooksJson : {}),
    deploymentId: row['deploymentHooks.deploymentId'] || stringValue((deploymentHooksJson as Record<string, unknown>).deploymentId),
    buildId: row['deploymentHooks.buildId'] || stringValue((deploymentHooksJson as Record<string, unknown>).buildId),
    buildWarningCount: parseNumberCell(row['deploymentHooks.buildWarningCount'] || stringValue((deploymentHooksJson as Record<string, unknown>).buildWarningCount) || '0', 0, 'deploymentHooks.buildWarningCount', sourceRow, warnings),
    publishSource: row['deploymentHooks.publishSource'] || stringValue((deploymentHooksJson as Record<string, unknown>).publishSource),
  }

  const page: Record<string, unknown> = {
    id: row.id || '',
    PageId: row.PageId || '',
    tenantId: row.tenantId || '',
    pageSlug: rawSlug,
    PageVersion: version,
    Layout: row.Layout || 'default',
    MetaData: {
      category: row['MetaData.category'] || '',
      product: primaryService,
      keyword: targetKeyword,
      pageType,
      title,
      description: row['MetaData.description'] || '',
      createdAt: row['MetaData.createdAt'] || now,
      updatedAt: row['MetaData.updatedAt'] || now,
      author: row['MetaData.author'] || 'Pumpkin CMS CSV Import',
      language: row['MetaData.language'] || 'en-us',
      market: row['MetaData.market'] || 'us',
    },
    searchData: {
      ...createDefaultSearchData(title, blockTypes),
      ...searchData,
      state: row.state || stringValue(searchData.state),
      city: row.city || stringValue(searchData.city),
      metro: row.metro || row.region || stringValue(searchData.metro),
      county: row.county || stringValue(searchData.county),
      keyword: targetKeyword,
      blockTypes: Array.isArray(searchData.blockTypes) ? searchData.blockTypes : blockTypes,
    },
    ContentData: {
      ContentBlocks: blocks,
    },
    contentRelationships: {
      isHub: isHub === true,
      hubPageSlug: row['contentRelationships.hubPageSlug'] || '',
      topicCluster: row['contentRelationships.topicCluster'] || '',
      relatedHubs,
      spokePriority,
    },
    seo: {
      ...createDefaultSeo(title),
      metaTitle: row['seo.metaTitle'] || title,
      metaDescription: row['seo.metaDescription'] || '',
      robots: row['seo.robots'] || 'noindex, nofollow',
      canonicalUrl: row['seo.canonicalUrl'] || '',
      keywords: row.secondaryKeywords ? stringListValue(row.secondaryKeywords) : keywords,
      alternateUrls,
      structuredData,
      openGraph: {
        ...createDefaultSeo(title).openGraph,
        ...(isRecord(openGraph) ? openGraph : {}),
      },
      twitterCard: {
        ...createDefaultSeo(title).twitterCard,
        ...(isRecord(twitterCard) ? twitterCard : {}),
      },
    },
    isPublished,
    publishedAt: row.publishedAt || null,
    includeInSitemap,
    previousSlugs,
    redirects,
    sitemapPriority,
    sitemapChangeFrequency: row.sitemapChangeFrequency || '',
    media,
    fulfillment,
    googleAds,
    pageQuality,
    workflow,
    revision,
    staticPublishing,
    template,
    linking,
    schemaControls,
    formConfig,
    importProvenance,
    deploymentHooks,
  }

  if (isRecord(layoutPositions) && Object.keys(layoutPositions).length > 0) {
    page.layoutPositions = layoutPositions
  }

  return { page, errors, warnings }
}

function parseFlatRowsToImport(rows: FlatPageRow[], sourceType: ImportSourceType, firstSourceRow = 2): ParsedImport {
  return {
    entries: rows.map((row, index) => {
      const sourceRow = firstSourceRow + index
      const parsed = flatRowToPage(row, sourceRow)
      return {
        page: parsed.page,
        sourceRow,
        errors: parsed.errors,
        warnings: parsed.warnings,
      }
    }),
    sourceType,
    errors: [],
    warnings: [],
  }
}

function parseCsvImportText(importText: string): ParsedImport {
  const trimmed = importText.trim()
  if (!trimmed) {
    return {
      entries: [],
      sourceType: 'csv',
      errors: ['Paste or upload CSV before running import validation.'],
      warnings: [],
    }
  }

  const parsedCsv = parseCsvText(importText)
  if (parsedCsv.errors.length > 0) {
    return {
      entries: [],
      sourceType: 'csv',
      errors: parsedCsv.errors,
      warnings: [],
    }
  }

  const missingHeaders = ['tenantId', 'pageSlug', 'ContentData.ContentBlocks', 'isPublished', 'includeInSitemap'].filter(
    (header) => !parsedCsv.headers.includes(header),
  )
  const warnings = parsedCsv.headers.some((header) => !PAGE_FLAT_HEADERS.includes(header as typeof PAGE_FLAT_HEADERS[number]))
    ? ['CSV includes headers outside the standard Page template. Non-standard columns are ignored in this MVP.']
    : []

  if (missingHeaders.length > 0) {
    return {
      entries: [],
      sourceType: 'csv',
      errors: [`CSV is missing required header(s): ${missingHeaders.join(', ')}.`],
      warnings,
    }
  }

  const rows = parsedCsv.rows.map((row) => {
    const rowRecord: FlatPageRow = {}
    parsedCsv.headers.forEach((header, index) => {
      rowRecord[header] = row[index] || ''
    })
    return rowRecord
  })

  return {
    ...parseFlatRowsToImport(rows, 'csv'),
    warnings,
  }
}

function excelCellToString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toISOString()
  if (typeof value !== 'object') return String(value)

  if ('text' in value) {
    return stringValue((value as { text?: unknown }).text)
  }

  if ('richText' in value && Array.isArray((value as { richText?: unknown }).richText)) {
    return ((value as { richText: Array<{ text?: unknown }> }).richText)
      .map((part) => stringValue(part.text))
      .join('')
  }

  if ('result' in value) {
    return stringValue((value as { result?: unknown }).result)
  }

  return JSON.stringify(value)
}

async function parseXlsxFile(file: File): Promise<ParsedImport> {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  const buffer = await file.arrayBuffer()
  await workbook.xlsx.load(buffer)

  const worksheet = workbook.getWorksheet('Pages') || workbook.worksheets[0]
  if (!worksheet) {
    return {
      entries: [],
      sourceType: 'xlsx',
      errors: ['XLSX file must include a Pages sheet or at least one worksheet.'],
      warnings: [],
    }
  }

  const headerRow = worksheet.getRow(1)
  const headers: string[] = []
  for (let columnNumber = 1; columnNumber <= headerRow.cellCount; columnNumber += 1) {
    headers.push(excelCellToString(headerRow.getCell(columnNumber).value).trim())
  }

  const warnings = headers.some((header) => header && !PAGE_FLAT_HEADERS.includes(header as typeof PAGE_FLAT_HEADERS[number]))
    ? ['XLSX includes headers outside the standard Page template. Non-standard columns are ignored in this MVP.']
    : []
  const requiredHeaders = ['tenantId', 'pageSlug', 'ContentData.ContentBlocks', 'isPublished', 'includeInSitemap']
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header))
  if (missingHeaders.length > 0) {
    return {
      entries: [],
      sourceType: 'xlsx',
      errors: [`XLSX Pages sheet is missing required header(s): ${missingHeaders.join(', ')}.`],
      warnings,
    }
  }

  const rows: FlatPageRow[] = []
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return

    const rowRecord: FlatPageRow = {}
    let hasValue = false

    headers.forEach((header, index) => {
      if (!header) return
      const value = excelCellToString(row.getCell(index + 1).value)
      rowRecord[header] = value
      if (value.trim()) hasValue = true
    })

    if (hasValue) {
      rows.push(rowRecord)
    }
  })

  return {
    ...parseFlatRowsToImport(rows, 'xlsx'),
    warnings,
  }
}

function validateParsedImport(
  parsed: ParsedImport,
  existingPages: Page[],
  tenantId: string,
  mode: ImportMode,
  rewriteTenantId: boolean,
) {
  const existingBySlug = getExistingBySlug(existingPages)
  const seenSlugs = new Set<string>()
  const results: ImportResult[] = []

  parsed.entries.forEach((entry, index) => {
    const page = entry.page
    const errors = [...entry.errors]
    const warnings = [...entry.warnings]
    const incomingTenantId = stringValue(page.tenantId)
    const rawSlug = stringValue(page.pageSlug)
    const normalizedSlug = normalizeSlug(rawSlug)
    const metaData = isRecord(page.MetaData) ? page.MetaData : null
    const seo = isRecord(page.seo) ? page.seo : null
    const blocks = getBlocks(page)
    const title = stringValue(metaData?.title) || rawSlug || `Import row ${entry.sourceRow || index + 1}`
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

    if (!stringValue(metaData?.title)) {
      warnings.push('MetaData.title is empty.')
    }

    if (!stringValue(metaData?.keyword) && !stringValue(isRecord(page.searchData) ? page.searchData.keyword : '')) {
      warnings.push('Target keyword is missing.')
    }

    if (!stringValue(seo?.metaTitle)) {
      warnings.push('seo.metaTitle is empty.')
    }

    if (!stringValue(seo?.metaDescription)) {
      warnings.push('seo.metaDescription is empty.')
    }

    if (!stringValue(seo?.canonicalUrl)) {
      warnings.push('seo.canonicalUrl is empty.')
    }

    if (!stringValue(seo?.robots)) {
      warnings.push('seo.robots is empty.')
    }

    if (page.isPublished === true && page.includeInSitemap !== true) {
      warnings.push('Published page is not included in sitemap.')
    }

    if (page.includeInSitemap === true && !stringValue(seo?.canonicalUrl)) {
      warnings.push('Sitemap page has no canonical URL.')
    }

    const redirects = getPageRedirects(page as Partial<Page>)
    const activeRedirects = redirects.filter((redirect) => redirect.active)
    const redirectFroms = new Set<string>()
    activeRedirects.forEach((redirect) => {
      if (!redirect.from || !redirect.to) {
        errors.push('Active redirects require from and to slugs.')
      }
      if (redirect.from === redirect.to) {
        errors.push(`Redirect from "${redirect.from}" cannot point to itself.`)
      }
      if (redirectFroms.has(redirect.from)) {
        errors.push(`Duplicate active redirect from "${redirect.from}" is not allowed.`)
      }
      redirectFroms.add(redirect.from)
    })

    if (Array.isArray(page.redirects) && page.redirects.length !== redirects.length) {
      warnings.push('Malformed or same-slug redirects will be normalized or skipped before write.')
    }

    if (Array.isArray(page.previousSlugs) && page.previousSlugs.length > 0) {
      const currentSlug = normalizeRedirectSlug(normalizedSlug)
      const missingCoverage = page.previousSlugs
        .map((slug) => normalizeRedirectSlug(stringValue(slug)))
        .filter(Boolean)
        .filter((previousSlug) => !activeRedirects.some((redirect) => redirect.from === previousSlug && redirect.to === currentSlug))

      if (missingCoverage.length > 0) {
        warnings.push(`previousSlugs missing active redirect coverage: ${missingCoverage.join(', ')}.`)
      }
    }

    const workflow = isRecord(page.workflow) ? page.workflow : null
    if (page.isPublished === true && workflow?.approvedForPublish !== true) {
      warnings.push('Published page is not marked workflow.approvedForPublish.')
    }

    if (
      page.isPublished === true &&
      !['approved', 'published'].includes(stringValue(workflow?.status))
    ) {
      warnings.push('Published page should use workflow.status approved or published.')
    }

    const staticPublishing = isRecord(page.staticPublishing) ? page.staticPublishing : null
    if (page.isPublished === true && staticPublishing?.staticEligible !== true) {
      warnings.push('Published page is not marked staticPublishing.staticEligible.')
    }

    if (staticPublishing?.needsRebuild === true) {
      warnings.push('Page is marked staticPublishing.needsRebuild.')
    }

    const template = isRecord(page.template) ? page.template : null
    if (!stringValue(template?.templateKey)) {
      warnings.push('template.templateKey is missing.')
    }

    if (!stringValue(template?.contentModelVersion)) {
      warnings.push('template.contentModelVersion is missing.')
    }

    const importProvenance = isRecord(page.importProvenance) ? page.importProvenance : null
    if (stringListValue(importProvenance?.lockedFields).length > 0) {
      warnings.push('lockedFields are preserved as provenance, but CSV/XLSX import does not enforce field-level locks yet.')
    }

    const fulfillment = isRecord(page.fulfillment) ? page.fulfillment : null
    if (!stringValue(fulfillment?.fulfillmentStatus)) {
      warnings.push('Fulfillment status is missing.')
    }

    if (
      fulfillment &&
      stringValue(fulfillment.fulfillmentStatus) &&
      stringValue(fulfillment.fulfillmentStatus) !== 'direct_partner_available' &&
      fulfillment.publicDisclosureRequired !== true
    ) {
      warnings.push('Non-direct fulfillment should mark publicDisclosureRequired before launch.')
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
        warnings.push('Write mode will create a server-side revision snapshot before updating this existing page.')
      } else {
        action = 'create'
      }
    }

    results.push({
      index,
      sourceRow: entry.sourceRow,
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
      sourceRow: null,
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
      sourceRow: null,
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

  return buildReport(mode, parsed.sourceType, tenantId, results)
}

function buildReport(
  mode: ImportMode,
  sourceType: ImportSourceType,
  tenantId: string,
  results: ImportResult[],
): ImportReport {
  const pageResults = results.filter((result) => result.index >= 0)
  const errorCount = results.reduce((total, result) => total + result.errors.length, 0)
  const warningCount = results.reduce((total, result) => total + result.warnings.length, 0)

  return {
    mode,
    sourceType,
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

function getImportChangeSource(sourceType: ImportSourceType): PageChangeSource {
  if (sourceType === 'csv') return 'csv_import'
  if (sourceType === 'xlsx') return 'xlsx_import'
  return 'json_import'
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
  const media = isRecord(page.media) ? page.media : createDefaultMedia()
  const fulfillment = isRecord(page.fulfillment) ? page.fulfillment : createDefaultFulfillment()
  const googleAds = isRecord(page.googleAds) ? page.googleAds : createDefaultGoogleAds()
  const pageQuality = isRecord(page.pageQuality) ? page.pageQuality : createDefaultPageQuality()
  const workflow = isRecord(page.workflow) ? page.workflow : createDefaultWorkflow()
  const revision = isRecord(page.revision) ? page.revision : createDefaultRevision()
  const staticPublishing = isRecord(page.staticPublishing) ? page.staticPublishing : createDefaultStaticPublishing()
  const template = isRecord(page.template) ? page.template : createDefaultTemplateIdentity()
  const linking = isRecord(page.linking) ? page.linking : createDefaultLinking()
  const schemaControls = isRecord(page.schemaControls) ? page.schemaControls : createDefaultSchemaControls()
  const formConfig = isRecord(page.formConfig) ? page.formConfig : createDefaultFormConfig()
  const importProvenance = isRecord(page.importProvenance) ? page.importProvenance : createDefaultImportProvenance()
  const deploymentHooks = isRecord(page.deploymentHooks) ? page.deploymentHooks : createDefaultDeploymentHooks()
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
    previousSlugs: stringListValue(page.previousSlugs),
    redirects: getPageRedirects(page as Partial<Page>),
    sitemapPriority: page.sitemapPriority === null || page.sitemapPriority === undefined
      ? null
      : numberValue(page.sitemapPriority, 0.5),
    sitemapChangeFrequency: stringValue(page.sitemapChangeFrequency),
    media: {
      ...createDefaultMedia(),
      ...media,
    },
    fulfillment: {
      ...createDefaultFulfillment(),
      ...fulfillment,
      confirmedServiceStates: stringListValue(fulfillment.confirmedServiceStates),
      extendedStatesPossible: stringListValue(fulfillment.extendedStatesPossible),
    },
    googleAds: {
      ...createDefaultGoogleAds(),
      ...googleAds,
      conversionGoals: stringListValue(googleAds.conversionGoals),
    },
    pageQuality: {
      ...createDefaultPageQuality(),
      ...pageQuality,
    },
    workflow: {
      ...createDefaultWorkflow(),
      ...workflow,
    },
    revision: {
      ...createDefaultRevision(),
      ...revision,
      revisionNumber: numberValue(revision.revisionNumber, 1),
      rollbackAvailable: Boolean(revision.rollbackAvailable),
    },
    staticPublishing: {
      ...createDefaultStaticPublishing(),
      ...staticPublishing,
    },
    template: {
      ...createDefaultTemplateIdentity(),
      ...template,
    },
    linking: {
      ...createDefaultLinking(),
      ...linking,
      relatedPages: stringListValue(linking.relatedPages),
      requiredLinks: stringListValue(linking.requiredLinks),
      breadcrumbTrail: stringListValue(linking.breadcrumbTrail),
    },
    schemaControls: {
      ...createDefaultSchemaControls(),
      ...schemaControls,
      schemaWarnings: stringListValue(schemaControls.schemaWarnings),
    },
    formConfig: {
      ...createDefaultFormConfig(),
      ...formConfig,
    },
    importProvenance: {
      ...createDefaultImportProvenance(),
      ...importProvenance,
      lockedFields: stringListValue(importProvenance.lockedFields),
    },
    deploymentHooks: {
      ...createDefaultDeploymentHooks(),
      ...deploymentHooks,
      buildWarningCount: numberValue(deploymentHooks.buildWarningCount, 0),
    },
  }

  return coerced
}

async function downloadXlsx(fileName: string, rows: FlatPageRow[], tenantId: string) {
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'Pumpkin CMS Admin'
  workbook.created = new Date()

  const pageSheet = workbook.addWorksheet('Pages')
  pageSheet.columns = PAGE_FLAT_HEADERS.map((header) => ({
    header,
    key: header,
    width: JSON_COLUMN_HEADERS.has(header) ? 44 : 24,
  }))
  rows.forEach((row) => pageSheet.addRow(row))
  pageSheet.getRow(1).font = { bold: true }
  pageSheet.views = [{ state: 'frozen', ySplit: 1 }]

  const schemaSheet = workbook.addWorksheet('Schema')
  schemaSheet.addRows([
    ['Pumpkin CMS Page Import/Export'],
    ['Tenant', tenantId],
    ['Rule', 'Use the Pages sheet for imports. JSON columns must contain valid JSON.'],
    ['Rule', 'tenantId must match the selected tenant unless rewrite is explicitly enabled.'],
    ['Rule', 'JSON remains the closest canonical Page artifact for future static publishing.'],
    [],
    ['Header', 'Notes'],
    ...PAGE_FLAT_HEADERS.map((header) => [
      header,
      JSON_COLUMN_HEADERS.has(header) ? 'JSON column' : 'Flat field',
    ]),
  ])
  schemaSheet.getColumn(1).width = 36
  schemaSheet.getColumn(2).width = 72

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    fileName,
    buffer as BlobPart,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

export default function PageImportExportPage() {
  const router = useRouter()
  const { token, user, currentTenant } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [exportScope, setExportScope] = useState<ExportScope>('all')
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json')
  const [selectedSlug, setSelectedSlug] = useState('')
  const [importSourceType, setImportSourceType] = useState<ImportSourceType>('json')
  const [importText, setImportText] = useState('')
  const [xlsxImport, setXlsxImport] = useState<ParsedImport | null>(null)
  const [importMode, setImportMode] = useState<ImportMode>('dry-run')
  const [rewriteTenantId, setRewriteTenantId] = useState(false)
  const [report, setReport] = useState<ImportReport | null>(null)
  const [runningImport, setRunningImport] = useState(false)
  const [runningExport, setRunningExport] = useState(false)

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

  useEffect(() => {
    if (!currentTenant) return

    try {
      const rawHandoff = window.localStorage.getItem(IMPORT_HANDOFF_STORAGE_KEY)
      if (!rawHandoff) return

      const handoff = JSON.parse(rawHandoff)
      if (!isRecord(handoff)) {
        window.localStorage.removeItem(IMPORT_HANDOFF_STORAGE_KEY)
        return
      }

      const handoffTenantId = stringValue(handoff.tenantId)
      const rawJson = stringValue(handoff.rawJson)
      const packageName = stringValue(handoff.packageName) || 'staged content package'

      if (handoffTenantId && handoffTenantId !== currentTenant.tenantId) {
        setNotice(`A staged package for ${handoffTenantId} is waiting, but the selected tenant is ${currentTenant.tenantId}. Switch tenants before importing it.`)
        return
      }

      if (rawJson.trim()) {
        setImportSourceType('json')
        setImportText(rawJson)
        setXlsxImport(null)
        setReport(null)
        setError(null)
        setNotice(`Loaded staged package "${packageName}" from the review queue. Run dry-run before importing.`)
        window.localStorage.removeItem(IMPORT_HANDOFF_STORAGE_KEY)
      }
    } catch {
      window.localStorage.removeItem(IMPORT_HANDOFF_STORAGE_KEY)
      setError('Unable to load the staged package handoff. Download or copy the package JSON from Content Package Staging instead.')
    }
  }, [currentTenant])

  const getExportPages = () => {
    if (exportScope === 'published') return publishedPages
    if (exportScope === 'single') return pages.filter((page) => page.pageSlug === selectedSlug)
    return pages
  }

  const parseCurrentImport = () => {
    if (importSourceType === 'xlsx') {
      return xlsxImport || {
        entries: [],
        sourceType: 'xlsx' as const,
        errors: ['Upload an XLSX file before running import validation.'],
        warnings: [],
      }
    }

    if (importSourceType === 'csv') {
      return parseCsvImportText(importText)
    }

    return parseJsonImportText(importText)
  }

  const handleDownloadExport = async () => {
    if (!currentTenant) return

    const pagesToExport = getExportPages().map(clonePage)
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    if (exportScope === 'single' && pagesToExport.length === 0) {
      setError('Select a page before exporting a single page.')
      return
    }

    try {
      setRunningExport(true)
      setError(null)

      if (exportFormat === 'json') {
        if (exportScope === 'single') {
          const page = pagesToExport[0]
          downloadJson(`${tenantId}-${page.pageSlug}-${timestamp}.json`, page)
          setNotice(`Exported page "${getPageTitle(page)}" as JSON.`)
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
        setNotice(`Exported ${pagesToExport.length} page${pagesToExport.length === 1 ? '' : 's'} as JSON.`)
        return
      }

      const rows = pagesToExport.map(flattenPage)
      const suffix = exportScope === 'published'
        ? 'published-pages'
        : exportScope === 'single'
          ? pagesToExport[0].pageSlug
          : 'pages'

      if (exportFormat === 'csv') {
        downloadBlob(`${tenantId}-${suffix}-${timestamp}.csv`, rowsToCsv(rows), 'text/csv')
        setNotice(`Exported ${rows.length} page${rows.length === 1 ? '' : 's'} as CSV.`)
        return
      }

      await downloadXlsx(`${tenantId}-${suffix}-${timestamp}.xlsx`, rows, tenantId)
      setNotice(`Exported ${rows.length} page${rows.length === 1 ? '' : 's'} as XLSX.`)
    } catch (exportError) {
      setError(getErrorMessage(exportError, `Failed to export ${exportFormat.toUpperCase()}.`))
    } finally {
      setRunningExport(false)
    }
  }

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    if (!tenantId) return

    const row = flattenPage(createTemplatePage(tenantId))
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

    try {
      setRunningExport(true)
      setError(null)

      if (format === 'csv') {
        downloadBlob(`${tenantId}-page-import-template-${timestamp}.csv`, rowsToCsv([row]), 'text/csv')
        setNotice('Downloaded CSV template.')
      } else {
        await downloadXlsx(`${tenantId}-page-import-template-${timestamp}.xlsx`, [row], tenantId)
        setNotice('Downloaded XLSX template.')
      }
    } catch (templateError) {
      setError(getErrorMessage(templateError, `Failed to download ${format.toUpperCase()} template.`))
    } finally {
      setRunningExport(false)
    }
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setError(null)
      setReport(null)
      setXlsxImport(null)

      if (importSourceType === 'xlsx') {
        const parsed = await parseXlsxFile(file)
        setXlsxImport(parsed)
        setImportText(JSON.stringify(parsed.entries.map((entry) => entry.page), null, 2))
        setNotice(`Loaded ${file.name}. Run dry-run before importing.`)
      } else {
        const text = await file.text()
        setImportText(text)
        setNotice(`Loaded ${file.name}. Run dry-run before importing.`)
      }
    } catch (fileError) {
      setError(getErrorMessage(fileError, `Failed to read ${importSourceType.toUpperCase()} file.`))
    } finally {
      event.target.value = ''
    }
  }

  const runDryRun = () => {
    if (!tenantId) return
    const parsed = parseCurrentImport()
    const nextReport = validateParsedImport(parsed, pages, tenantId, importMode, rewriteTenantId)
    setReport(nextReport)
    setNotice(`${importSourceType.toUpperCase()} import dry-run complete. No pages were written.`)
  }

  const openDiffPreview = () => {
    if (!currentTenant) return

    if (!importText.trim() || importSourceType === 'csv') {
      router.push('/dashboard/pages/import-diff')
      return
    }

    try {
      window.localStorage.setItem(IMPORT_DIFF_HANDOFF_STORAGE_KEY, JSON.stringify({
        packageName: 'Import/Export input',
        tenantId: currentTenant.tenantId,
        rawJson: importText,
        importMode,
        handedOffAt: new Date().toISOString(),
      }))
      router.push('/dashboard/pages/import-diff')
    } catch {
      setError('Unable to prepare Import Diff handoff. Open Import Diff and paste the JSON manually.')
      setNotice(null)
    }
  }

  const runImport = async () => {
    if (!token || !currentTenant || importMode === 'dry-run') return

    const parsed = parseCurrentImport()
    const initialReport = validateParsedImport(parsed, pages, currentTenant.tenantId, importMode, rewriteTenantId)
    setReport(initialReport)

    if (initialReport.errorCount > 0) {
      setNotice(null)
      setError('Import has validation errors. Fix them before writing changes.')
      return
    }

    const resultByIndex = new Map(initialReport.results.map((result) => [result.index, { ...result }]))
    const writeResults: ImportResult[] = []

    try {
      setRunningImport(true)
      setError(null)
      setNotice(null)

      for (let index = 0; index < parsed.entries.length; index += 1) {
        const entry = parsed.entries[index]
        const planned = resultByIndex.get(index)
        if (!planned || planned.action === 'skip' || planned.action === 'error') {
          if (planned) writeResults.push(planned)
          continue
        }

        const pageToWrite = coercePageForWrite(entry.page, currentTenant.tenantId, rewriteTenantId)

        try {
          if (planned.action === 'create') {
            await apiClient.createPage(token, currentTenant.tenantId, pageToWrite)
            writeResults.push({ ...planned, wrote: true, revisionCreated: false })
          } else {
            const existingPage = pages.find((item) => normalizeSlug(item.pageSlug) === planned.normalizedSlug)
            const updatedPage = await apiClient.updatePage(
              token,
              currentTenant.tenantId,
              existingPage?.pageSlug || planned.normalizedSlug,
              pageToWrite,
              {
                changeSource: getImportChangeSource(parsed.sourceType),
                changeSummary: `${parsed.sourceType.toUpperCase()} import ${planned.action} for ${planned.normalizedSlug}`,
              },
            )
            writeResults.push({
              ...planned,
              wrote: true,
              revisionCreated: Boolean(updatedPage.revision?.latestSnapshot),
            })
          }
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
      const nextReport = buildReport(importMode, parsed.sourceType, currentTenant.tenantId, [...payloadResults, ...writeResults])
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
          <h1 className="text-3xl font-bold text-neutral-900">Page Import/Export</h1>
          <p className="mt-1 text-neutral-600">
            Tenant-scoped Page artifacts for {currentTenant.name || currentTenant.tenantId}.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">Tenant</div>
          <div className="text-sm font-semibold text-neutral-900">{currentTenant.tenantId}</div>
          <div className="mt-2 flex flex-col gap-1">
            <button
              type="button"
              onClick={() => router.push('/dashboard/pages/content-validator')}
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              Validate content JSON
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/pages/content-packages')}
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              Stage content package
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard/pages/import-diff')}
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              Preview import diff
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Phase 5A supports JSON, CSV, and XLSX Page exports plus dry-run validation and safe create/update imports. Static publishing and hard delete are not included.
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

      <Section title="Export Pages" description="Download selected-tenant pages. JSON is closest to the canonical Page document; CSV/XLSX are flattened for bulk editing.">
        {loading ? (
          <div className="text-sm text-neutral-600">Loading tenant pages...</div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-neutral-700">Export format</span>
              <select value={exportFormat} onChange={(event) => setExportFormat(event.target.value as ExportFormat)} className="input">
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xlsx">XLSX</option>
              </select>
            </label>
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
              <button
                type="button"
                onClick={handleDownloadExport}
                disabled={runningExport}
                className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {runningExport ? 'Preparing...' : `Download ${exportFormat.toUpperCase()}`}
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section title="Templates" description="Download blank bulk-edit templates with one example Page row for the selected tenant.">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleDownloadTemplate('csv')}
            disabled={runningExport}
            className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download CSV Template
          </button>
          <button
            type="button"
            onClick={() => handleDownloadTemplate('xlsx')}
            disabled={runningExport}
            className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Download XLSX Template
          </button>
        </div>
      </Section>

      <Section title="Import Pages" description="Paste or upload JSON/CSV, or upload an XLSX file with a Pages sheet. Dry-run is the default and writes nothing.">
        <div className="grid gap-4 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-neutral-700">Source type</span>
            <select
              value={importSourceType}
              onChange={(event) => {
                setImportSourceType(event.target.value as ImportSourceType)
                setImportText('')
                setXlsxImport(null)
                setReport(null)
                setError(null)
                setNotice(null)
              }}
              className="input"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
            </select>
          </label>
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
            <span className="mb-1 block text-sm font-medium text-neutral-700">Upload {importSourceType.toUpperCase()} file</span>
            <input type="file" accept={FILE_ACCEPT[importSourceType]} onChange={handleFileUpload} className="input" />
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

        {importSourceType === 'xlsx' ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            {xlsxImport
              ? `Loaded XLSX Pages sheet with ${xlsxImport.entries.length} row${xlsxImport.entries.length === 1 ? '' : 's'}. The JSON preview below is generated from the sheet.`
              : 'Upload an XLSX file with a Pages sheet before running dry-run.'}
          </div>
        ) : (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
            Paste {importSourceType.toUpperCase()} directly, or upload a file to fill the input.
          </div>
        )}

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-neutral-700">
            {importSourceType === 'xlsx' ? 'Parsed XLSX preview' : `${importSourceType.toUpperCase()} input`}
          </span>
          <textarea
            value={importText}
            onChange={(event) => {
              setImportText(event.target.value)
              setXlsxImport(null)
              setReport(null)
              setError(null)
              setNotice(null)
            }}
            rows={14}
            readOnly={importSourceType === 'xlsx'}
            className="input font-mono text-xs read-only:bg-neutral-100"
            spellCheck={false}
            data-testid="page-import-input"
          />
        </label>

        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" onClick={openDiffPreview} className="btn btn-secondary">
            Preview Diff Before Import
          </button>
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
          <div className="grid gap-3 md:grid-cols-7">
            <ReportStat label="Total" value={report.total} />
            <ReportStat label="Creates" value={report.createdCount} />
            <ReportStat label="Updates" value={report.updatedCount} />
            <ReportStat label="Skips" value={report.skippedCount} />
            <ReportStat label="Errors" value={report.errorCount} />
            <ReportStat label="Warnings" value={report.warningCount} />
            <ReportTextStat label="Source" value={report.sourceType.toUpperCase()} />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => downloadJson(`${tenantId}-${report.sourceType}-import-report-${report.timestamp.replace(/[:.]/g, '-')}.json`, report)}
              className="btn btn-secondary"
            >
              Download Report JSON
            </button>
          </div>

          <div className="overflow-x-auto rounded-md border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-neutral-500">Row</th>
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
                    <td className="px-4 py-3 text-sm text-neutral-700">
                      {result.sourceRow || (result.index < 0 ? 'Payload' : 'n/a')}
                    </td>
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
                        {result.revisionCreated && <div className="text-green-700">Revision snapshot created.</div>}
                        {result.wrote && result.action === 'update' && !result.revisionCreated && (
                          <div className="text-amber-700">Revision snapshot was not reported by the API response.</div>
                        )}
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

function ReportTextStat({ label, value }: { label: string; value: string }) {
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
