'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { IHtmlBlock, Page } from 'pumpkin-ts-models'

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
  'publishedAt',
  'contentRelationships.isHub',
  'contentRelationships.hubPageSlug',
  'contentRelationships.topicCluster',
  'contentRelationships.relatedHubs',
  'contentRelationships.spokePriority',
  'ContentData.ContentBlocks',
  'searchData',
  'layoutPositions',
] as const

const JSON_COLUMN_HEADERS = new Set<string>([
  'seo.keywords',
  'seo.alternateUrls',
  'seo.structuredData',
  'seo.openGraph',
  'seo.twitterCard',
  'contentRelationships.relatedHubs',
  'ContentData.ContentBlocks',
  'searchData',
  'layoutPositions',
])

const FILE_ACCEPT: Record<ImportSourceType, string> = {
  json: 'application/json,.json',
  csv: 'text/csv,.csv',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx',
}

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
    publishedAt: page.publishedAt || '',
    'contentRelationships.isHub': stringValue(page.contentRelationships?.isHub || false),
    'contentRelationships.hubPageSlug': page.contentRelationships?.hubPageSlug || '',
    'contentRelationships.topicCluster': page.contentRelationships?.topicCluster || '',
    'contentRelationships.relatedHubs': toJsonCell(page.contentRelationships?.relatedHubs || []),
    'contentRelationships.spokePriority': stringValue(page.contentRelationships?.spokePriority || 0),
    'ContentData.ContentBlocks': toJsonCell(page.ContentData?.ContentBlocks || []),
    searchData: toJsonCell(page.searchData || createDefaultSearchData(getPageTitle(page), [])),
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
  const version = parseNumberCell(row.PageVersion || '1', 1, 'PageVersion', sourceRow, warnings)
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

  const page: Record<string, unknown> = {
    id: row.id || '',
    PageId: row.PageId || '',
    tenantId: row.tenantId || '',
    pageSlug: rawSlug,
    PageVersion: version,
    Layout: row.Layout || 'default',
    MetaData: {
      category: row['MetaData.category'] || '',
      product: row['MetaData.product'] || '',
      keyword: row['MetaData.keyword'] || title,
      pageType: row['MetaData.pageType'] || 'page',
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
      keywords,
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
