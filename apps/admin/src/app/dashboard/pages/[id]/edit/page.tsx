'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { IHtmlBlock, Page } from 'pumpkin-ts-models'

const LOCAL_PREVIEW_HOSTS: Record<string, string> = {
  'ice-rink-rentals': 'http://localhost:3002',
  'roller-rink-rentals': 'http://roller.localhost:3002',
}

const SUPPORTED_BLOCK_TYPES = new Set([
  'Hero',
  'TrustBar',
  'CardGrid',
  'HowItWorks',
  'FAQ',
  'PrimaryCTA',
  'Contact',
])

const BLOCK_ARRAY_FIELDS: Record<string, string[]> = {
  TrustBar: ['items'],
  CardGrid: ['cards'],
  HowItWorks: ['steps'],
  FAQ: ['items'],
  Contact: ['formFields'],
}

type SeoStringField = 'metaTitle' | 'metaDescription' | 'robots' | 'canonicalUrl'
type PageMetaStringField = 'title' | 'description'
type EditableContent = Record<string, unknown>

interface ValidationResult {
  errors: string[]
  warnings: string[]
}

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
  testId?: string
}

interface ArrayEditorProps {
  label: string
  items: unknown
  blockIndex: number
  arrayKey: string
  renderItem: (item: EditableContent, itemIndex: number) => ReactNode
}

interface ImageSignal {
  slot: string
  source: string
  path: string
  value: string
}

function isRecord(value: unknown): value is EditableContent {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toRecord(value: unknown): EditableContent {
  return isRecord(value) ? value : {}
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function booleanValue(value: unknown) {
  return typeof value === 'boolean' ? value : false
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

function isUrlLike(value: string) {
  if (!value.trim()) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}

function formatJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return 'Unable to serialize this block.'
  }
}

function getPreviewUrl(page: Page) {
  const baseUrl = LOCAL_PREVIEW_HOSTS[page.tenantId] || 'http://localhost:3002'
  return page.pageSlug === 'home' ? `${baseUrl}/` : `${baseUrl}/${page.pageSlug}`
}

function getViewUrl(page: Page) {
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/view?tenantId=${encodeURIComponent(page.tenantId)}`
}

function getEditUrl(page: Page) {
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/edit?tenantId=${encodeURIComponent(page.tenantId)}`
}

function withUpdatedAt(page: Page) {
  return {
    ...page,
    MetaData: {
      ...page.MetaData,
      updatedAt: new Date().toISOString(),
    },
  }
}

function updateBlockTypes(page: Page) {
  const blocks = Array.isArray(page.ContentData?.ContentBlocks)
    ? page.ContentData.ContentBlocks
    : []

  return {
    ...page,
    searchData: {
      ...page.searchData,
      blockTypes: blocks.map((block) => block.type).filter(Boolean),
    },
  }
}

function sanitizeRecordArray(value: unknown, stringFields: string[], booleanFields: string[] = []) {
  if (!Array.isArray(value)) return value

  return value.map((item) => {
    if (!isRecord(item)) return item

    const nextItem: EditableContent = { ...item }
    stringFields.forEach((field) => {
      nextItem[field] = stringValue(nextItem[field])
    })
    booleanFields.forEach((field) => {
      nextItem[field] = booleanValue(nextItem[field])
    })

    return nextItem
  })
}

function sanitizeSupportedBlockForSave(block: IHtmlBlock): IHtmlBlock {
  if (!SUPPORTED_BLOCK_TYPES.has(block.type)) {
    return block
  }

  const content = toRecord(block.content)

  switch (block.type) {
    case 'Hero':
      return {
        ...block,
        content: {
          ...content,
          headline: stringValue(content.headline),
          subheadline: stringValue(content.subheadline),
          buttonText: stringValue(content.buttonText),
          buttonLink: stringValue(content.buttonLink),
          backgroundImage: stringValue(content.backgroundImage),
          backgroundImageAltText: stringValue(content.backgroundImageAltText),
          mainImage: stringValue(content.mainImage),
          mainImageAltText: stringValue(content.mainImageAltText),
        },
      }
    case 'TrustBar':
      return {
        ...block,
        content: {
          ...content,
          items: sanitizeRecordArray(content.items, ['icon', 'title', 'text', 'alt']),
        },
      }
    case 'CardGrid':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          subtitle: stringValue(content.subtitle),
          layout: stringValue(content.layout),
          cards: sanitizeRecordArray(content.cards, ['title', 'description', 'icon', 'link', 'image', 'image-alt', 'alt']),
        },
      }
    case 'HowItWorks':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          steps: sanitizeRecordArray(content.steps, ['title', 'text', 'image', 'alt']),
        },
      }
    case 'FAQ':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          subtitle: stringValue(content.subtitle),
          layout: stringValue(content.layout),
          items: sanitizeRecordArray(content.items, ['question', 'answer']),
        },
      }
    case 'PrimaryCTA':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          description: stringValue(content.description),
          buttonText: stringValue(content.buttonText),
          buttonLink: stringValue(content.buttonLink),
          secondaryText: stringValue(content.secondaryText),
          secondaryLinkText: stringValue(content.secondaryLinkText),
          secondaryLink: stringValue(content.secondaryLink),
          backgroundImage: stringValue(content.backgroundImage),
          mainImage: stringValue(content.mainImage),
          alt: stringValue(content.alt),
        },
      }
    case 'Contact':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          subtitle: stringValue(content.subtitle),
          address: stringValue(content.address),
          phone: stringValue(content.phone),
          email: stringValue(content.email),
          hours: stringValue(content.hours),
          submitButtonText: stringValue(content.submitButtonText),
          formFields: sanitizeRecordArray(content.formFields, ['label', 'type', 'placeholder'], ['required']),
        },
      }
    default:
      return block
  }
}

function preparePageForSave(page: Page) {
  const now = new Date().toISOString()
  const blocks = Array.isArray(page.ContentData?.ContentBlocks)
    ? page.ContentData.ContentBlocks.map(sanitizeSupportedBlockForSave)
    : []

  return updateBlockTypes(withUpdatedAt({
    ...page,
    pageSlug: normalizeSlug(page.pageSlug),
    publishedAt: page.isPublished && !page.publishedAt ? now : page.publishedAt,
    ContentData: {
      ...page.ContentData,
      ContentBlocks: blocks,
    },
  }))
}

function validatePage(page: Page | null, tenantId: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!page) {
    errors.push('Page data has not loaded.')
    return { errors, warnings }
  }

  if (page.tenantId !== tenantId) {
    errors.push('Loaded page tenant does not match the selected tenant.')
  }

  if (!normalizeSlug(page.pageSlug)) {
    errors.push('Page slug is required.')
  }

  if (page.seo?.canonicalUrl && !isUrlLike(page.seo.canonicalUrl)) {
    errors.push('Canonical URL must be a valid http or https URL when set.')
  }

  if (!Array.isArray(page.ContentData?.ContentBlocks)) {
    errors.push('ContentData.ContentBlocks must remain an array.')
  }

  if (!page.MetaData?.title?.trim()) {
    warnings.push('MetaData.title is empty.')
  }

  if (!page.seo?.metaTitle?.trim()) {
    warnings.push('seo.metaTitle is empty.')
  }

  const blocks = Array.isArray(page.ContentData?.ContentBlocks)
    ? page.ContentData.ContentBlocks
    : []

  blocks.forEach((block, index) => {
    const content = toRecord(block.content)
    const arrayFields = BLOCK_ARRAY_FIELDS[block.type] || []

    arrayFields.forEach((field) => {
      if (content[field] !== undefined && !Array.isArray(content[field])) {
        errors.push(`Block ${index + 1} ${block.type}.${field} must remain an array.`)
      }
    })
  })

  return { errors, warnings }
}

function collectImageSignalsFromValue(value: unknown, slot: string, source: string, path: string[] = []): ImageSignal[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectImageSignalsFromValue(item, slot, source, [...path, String(index)]))
  }

  if (!isRecord(value)) return []

  return Object.entries(value).flatMap(([key, item]) => {
    const normalizedKey = key.toLowerCase()
    const nextPath = [...path, key]
    const currentSignal = (normalizedKey.includes('image') || normalizedKey.includes('alt')) && typeof item !== 'object'
      ? [{
          slot,
          source,
          path: nextPath.join('.').replace(/\.(\d+)(?=\.|$)/g, '[$1]'),
          value: String(item || 'Not set'),
        }]
      : []

    return [
      ...currentSignal,
      ...collectImageSignalsFromValue(item, slot, source, nextPath),
    ]
  })
}

function collectImageSignals(page: Page) {
  const blocks = page.ContentData?.ContentBlocks || []

  return blocks.flatMap((block, index) => {
    let slot = 'Other image field'

    if (block.type === 'Hero') slot = 'Hero image slot'
    if (['CardGrid', 'HowItWorks', 'Gallery', 'LocalProTips', 'ServiceAreaMap', 'Testimonials'].includes(block.type)) {
      slot = 'Dynamic/local rink image slot'
    }
    if (['PrimaryCTA', 'SecondaryCTA', 'Contact'].includes(block.type)) {
      slot = 'Closing image slot'
    }

    return collectImageSignalsFromValue(block.content, slot, `Block ${index + 1}: ${block.type || 'Missing type'}`, ['content'])
  })
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

function TextField({ label, value, onChange, placeholder, multiline = false, rows = 3, testId }: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          data-testid={testId}
          className="input text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          data-testid={testId}
          className="input text-sm"
        />
      )}
    </label>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
      />
      {label}
    </label>
  )
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input text-sm"
      >
        {children}
      </select>
    </label>
  )
}

function ReadOnlyPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm text-neutral-800">{value || 'Not set'}</div>
    </div>
  )
}

function ArrayEditor({ label, items, renderItem }: ArrayEditorProps) {
  if (items !== undefined && !Array.isArray(items)) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {label} is not an array and cannot be edited safely.
      </div>
    )
  }

  const arrayItems = Array.isArray(items) ? items : []

  if (arrayItems.length === 0) {
    return (
      <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
        No {label.toLowerCase()} are present on this block.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label} ({arrayItems.length})
      </div>
      {arrayItems.map((item, itemIndex) => (
        <div key={itemIndex} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Item {itemIndex + 1}
          </div>
          {isRecord(item) ? renderItem(item, itemIndex) : (
            <pre className="overflow-auto rounded bg-white p-3 text-xs text-neutral-700">
              {formatJson(item)}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}

function UnsupportedBlock({ block }: { block: IHtmlBlock }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 text-sm font-semibold text-amber-900">Unsupported block type</div>
      <p className="mb-3 text-sm text-amber-900">
        This block is read-only in Phase 2 and will be preserved exactly on save.
      </p>
      <pre className="max-h-96 overflow-auto rounded bg-white p-3 text-xs text-neutral-800">
        {formatJson(block)}
      </pre>
    </div>
  )
}

export default function PageStructuredEditor() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, user, currentTenant } = useAuth()

  const routeId = params.id
  const encodedPageSlug = Array.isArray(routeId) ? routeId[0] : routeId
  const routePageSlug = encodedPageSlug ? decodeURIComponent(encodedPageSlug) : ''
  const tenantId = searchParams.get('tenantId') || currentTenant?.tenantId || user?.tenantId || ''

  const [page, setPage] = useState<Page | null>(null)
  const [originalSlug, setOriginalSlug] = useState(routePageSlug)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let isActive = true

    const fetchPage = async () => {
      if (!token || !user || !tenantId || !routePageSlug) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setSuccess(null)
        const pageData = await apiClient.getPage(token, tenantId, routePageSlug)

        if (!isActive) return

        if (pageData.tenantId !== tenantId) {
          setPage(null)
          setError('Loaded page tenant does not match the selected tenant.')
          return
        }

        setPage(pageData)
        setOriginalSlug(pageData.pageSlug)
      } catch (fetchError) {
        if (isActive) {
          setError(getErrorMessage(fetchError, 'Failed to load page for editing.'))
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchPage()

    return () => {
      isActive = false
    }
  }, [token, user, tenantId, routePageSlug])

  const validation = useMemo(() => validatePage(page, tenantId), [page, tenantId])
  const imageSignals = useMemo(() => (page ? collectImageSignals(page) : []), [page])
  const contentBlocks = page?.ContentData?.ContentBlocks || []

  const updatePageState = (updater: (current: Page) => Page) => {
    setPage((current) => (current ? withUpdatedAt(updater(current)) : current))
    setSuccess(null)
  }

  const updateMetaField = (field: PageMetaStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      MetaData: {
        ...current.MetaData,
        [field]: value,
      },
    }))
  }

  const updateSeoField = (field: SeoStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      seo: {
        ...current.seo,
        [field]: value,
      },
    }))
  }

  const updateBooleanField = (field: 'isPublished' | 'includeInSitemap', value: boolean) => {
    updatePageState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateSlug = (value: string) => {
    updatePageState((current) => ({
      ...current,
      pageSlug: value,
    }))
  }

  const updateBlockContent = (blockIndex: number, updater: (content: EditableContent) => EditableContent) => {
    updatePageState((current) => {
      const blocks = Array.isArray(current.ContentData?.ContentBlocks)
        ? current.ContentData.ContentBlocks
        : []

      const updatedBlocks = blocks.map((block, index) => (
        index === blockIndex
          ? { ...block, content: updater(toRecord(block.content)) }
          : block
      ))

      return {
        ...current,
        ContentData: {
          ...current.ContentData,
          ContentBlocks: updatedBlocks,
        },
      }
    })
  }

  const updateBlockField = (blockIndex: number, field: string, value: string) => {
    updateBlockContent(blockIndex, (content) => ({
      ...content,
      [field]: value,
    }))
  }

  const updateBlockArrayItemField = (
    blockIndex: number,
    arrayKey: string,
    itemIndex: number,
    field: string,
    value: string | boolean,
  ) => {
    updateBlockContent(blockIndex, (content) => {
      const currentItems = Array.isArray(content[arrayKey]) ? [...content[arrayKey] as unknown[]] : []
      const currentItem = toRecord(currentItems[itemIndex])
      currentItems[itemIndex] = {
        ...currentItem,
        [field]: value,
      }

      return {
        ...content,
        [arrayKey]: currentItems,
      }
    })
  }

  const handleSave = async () => {
    if (!page || !token || saving) return

    const result = validatePage(page, tenantId)
    if (result.errors.length > 0) {
      setError(result.errors.join(' '))
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const pageToSave = preparePageForSave(page)
      const savedPage = await apiClient.updatePage(token, tenantId, originalSlug, pageToSave)

      setPage(savedPage)
      setOriginalSlug(savedPage.pageSlug)
      setSuccess('Page saved successfully.')

      if (savedPage.pageSlug !== routePageSlug) {
        router.replace(getEditUrl(savedPage))
      }
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save page.'))
    } finally {
      setSaving(false)
    }
  }

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to edit tenant pages.</p>
      </div>
    )
  }

  if (!tenantId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">No Tenant Selected</h1>
        <p className="text-neutral-600 mb-4">Select a tenant/site before editing a page.</p>
        <button type="button" onClick={() => router.push('/dashboard/pages')} className="btn btn-primary">
          Back to Pages
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-neutral-600">Loading editor...</p>
      </div>
    )
  }

  if (error && !page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Editor Could Not Load</h1>
        <p className="text-neutral-600 mb-4">{error}</p>
        <button type="button" onClick={() => router.push('/dashboard/pages')} className="btn btn-primary">
          Back to Pages
        </button>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Page Missing</h1>
        <p className="text-neutral-600">The API did not return a page to edit.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push(getViewUrl(page))}
            className="mb-3 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Back to page detail
          </button>
          <h1 className="text-3xl font-bold text-neutral-900">Edit {page.MetaData?.title || page.pageSlug || 'Page'}</h1>
          <p className="mt-1 font-mono text-sm text-neutral-600">
            Tenant {page.tenantId} / {page.pageSlug || 'missing-slug'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={getPreviewUrl(page)} target="_blank" rel="noreferrer" className="btn btn-secondary">
            Preview
          </a>
          <button
            type="button"
            onClick={() => router.push(getViewUrl(page))}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || validation.errors.length > 0}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Phase 2 edits existing page fields only. Tenant ID, Page ID, create, duplicate, archive, import, export, and hard delete are not available here.
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {validation.errors.length > 0 && (
            <div>
              <div className="font-semibold">Fix before saving</div>
              <ul className="mt-1 list-disc pl-5">
                {validation.errors.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className={validation.errors.length > 0 ? 'mt-3' : ''}>
              <div className="font-semibold">Warnings</div>
              <ul className="mt-1 list-disc pl-5">
                {validation.warnings.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <Section title="Locked Identifiers" description="Tenant and document identifiers are displayed for context and are not editable in Phase 2.">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnlyPill label="Tenant ID" value={page.tenantId} />
          <ReadOnlyPill label="Page ID" value={page.PageId || page.id || ''} />
          <ReadOnlyPill label="Original Slug For Save" value={originalSlug} />
        </div>
      </Section>

      <Section title="General Page Fields" description="Basic visible metadata and publishing flags for the selected tenant page.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField
            label="MetaData.title"
            value={page.MetaData?.title || ''}
            onChange={(value) => updateMetaField('title', value)}
            testId="metadata-title"
          />
          <TextField
            label="pageSlug"
            value={page.pageSlug || ''}
            onChange={updateSlug}
            placeholder="page-slug"
            testId="page-slug"
          />
          <TextField
            label="MetaData.description"
            value={page.MetaData?.description || ''}
            onChange={(value) => updateMetaField('description', value)}
            multiline
            rows={4}
            testId="metadata-description"
          />
          <div className="space-y-3">
            <CheckboxField
              label="Published"
              checked={Boolean(page.isPublished)}
              onChange={(value) => updateBooleanField('isPublished', value)}
            />
            <CheckboxField
              label="Include in sitemap"
              checked={Boolean(page.includeInSitemap)}
              onChange={(value) => updateBooleanField('includeInSitemap', value)}
            />
          </div>
        </div>
      </Section>

      <Section title="SEO" description="Editable search title, description, robots, and canonical fields. Other SEO structures remain preserved.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField
            label="seo.metaTitle"
            value={page.seo?.metaTitle || ''}
            onChange={(value) => updateSeoField('metaTitle', value)}
            testId="seo-meta-title"
          />
          <TextField
            label="seo.robots"
            value={page.seo?.robots || ''}
            onChange={(value) => updateSeoField('robots', value)}
            placeholder="index, follow"
            testId="seo-robots"
          />
          <TextField
            label="seo.metaDescription"
            value={page.seo?.metaDescription || ''}
            onChange={(value) => updateSeoField('metaDescription', value)}
            multiline
            rows={4}
            testId="seo-meta-description"
          />
          <TextField
            label="seo.canonicalUrl"
            value={page.seo?.canonicalUrl || ''}
            onChange={(value) => updateSeoField('canonicalUrl', value)}
            placeholder="https://example.com/page"
            testId="seo-canonical-url"
          />
        </div>
      </Section>

      <Section title="Image Field Awareness" description="Three-slot publishing target is shown using existing block fields. Dedicated page-level image slots are not modeled yet.">
        {imageSignals.length === 0 ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            No existing image or alt-text fields were detected on this page.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {['Hero image slot', 'Dynamic/local rink image slot', 'Closing image slot'].map((slot) => {
              const signals = imageSignals.filter((signal) => signal.slot === slot)

              return (
                <div key={slot} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{slot}</div>
                  {signals.length === 0 ? (
                    <div className="text-sm italic text-neutral-500">Not present or not detected</div>
                  ) : (
                    <div className="space-y-2">
                      {signals.map((signal, index) => (
                        <div key={`${signal.source}-${signal.path}-${index}`} className="rounded bg-white p-2">
                          <div className="text-xs font-medium text-neutral-500">{signal.source}</div>
                          <div className="mt-1 font-mono text-xs text-neutral-600">{signal.path}</div>
                          <div className="mt-1 break-words text-sm text-neutral-800">{signal.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Content Blocks" description="Structured editors are available for known text, SEO-adjacent, link, form, and image fields. Unsupported blocks are read-only JSON and preserved.">
        {contentBlocks.length === 0 ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            No ContentData.ContentBlocks entries are present.
          </div>
        ) : (
          <div className="space-y-5">
            {contentBlocks.map((block, blockIndex) => (
              <BlockEditor
                key={`${block.type}-${blockIndex}`}
                block={block}
                blockIndex={blockIndex}
                updateBlockField={updateBlockField}
                updateBlockArrayItemField={updateBlockArrayItemField}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function BlockEditor({
  block,
  blockIndex,
  updateBlockField,
  updateBlockArrayItemField,
}: {
  block: IHtmlBlock
  blockIndex: number
  updateBlockField: (blockIndex: number, field: string, value: string) => void
  updateBlockArrayItemField: (blockIndex: number, arrayKey: string, itemIndex: number, field: string, value: string | boolean) => void
}) {
  const content = toRecord(block.content)
  const blockTitle = block.type || 'Missing type'

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Block {blockIndex + 1}</div>
          <h3 className="text-base font-semibold text-neutral-900">{blockTitle}</h3>
        </div>
        {SUPPORTED_BLOCK_TYPES.has(block.type) ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Structured editor
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Read-only JSON
          </span>
        )}
      </div>

      <div className="p-4">
        {SUPPORTED_BLOCK_TYPES.has(block.type)
          ? renderBlockFields(block.type, content, blockIndex, updateBlockField, updateBlockArrayItemField)
          : <UnsupportedBlock block={block} />}
      </div>
    </div>
  )
}

function renderBlockFields(
  blockType: string,
  content: EditableContent,
  blockIndex: number,
  updateBlockField: (blockIndex: number, field: string, value: string) => void,
  updateBlockArrayItemField: (blockIndex: number, arrayKey: string, itemIndex: number, field: string, value: string | boolean) => void,
) {
  const field = (fieldName: string, label: string, options?: Omit<TextFieldProps, 'label' | 'value' | 'onChange'>) => (
    <TextField
      label={label}
      value={stringValue(content[fieldName])}
      onChange={(value) => updateBlockField(blockIndex, fieldName, value)}
      testId={`block-${blockIndex}-${blockType}-${fieldName}`}
      {...options}
    />
  )

  switch (blockType) {
    case 'Hero':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {field('headline', 'headline')}
            {field('subheadline', 'subheadline', { multiline: true, rows: 4 })}
            {field('buttonText', 'buttonText')}
            {field('buttonLink', 'buttonLink')}
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Hero image fields</div>
            <div className="grid gap-4 lg:grid-cols-2">
              {field('backgroundImage', 'backgroundImage')}
              {field('backgroundImageAltText', 'backgroundImageAltText')}
              {field('mainImage', 'mainImage')}
              {field('mainImageAltText', 'mainImageAltText')}
            </div>
          </div>
        </div>
      )
    case 'TrustBar':
      return (
        <ArrayEditor
          label="TrustBar items"
          items={content.items}
          blockIndex={blockIndex}
          arrayKey="items"
          renderItem={(item, itemIndex) => (
            <div className="grid gap-3 lg:grid-cols-2">
              <TextField label="icon" value={stringValue(item.icon)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'icon', value)} />
              <TextField label="title" value={stringValue(item.title)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'title', value)} />
              <TextField label="text" value={stringValue(item.text)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'text', value)} />
              <TextField label="alt" value={stringValue(item.alt)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'alt', value)} />
            </div>
          )}
        />
      )
    case 'CardGrid':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {field('title', 'section title')}
            {field('subtitle', 'subtitle', { multiline: true, rows: 3 })}
            <SelectField label="layout" value={stringValue(content.layout) || 'grid-3'} onChange={(value) => updateBlockField(blockIndex, 'layout', value)}>
              <option value="grid-2">grid-2</option>
              <option value="grid-3">grid-3</option>
              <option value="grid-4">grid-4</option>
              <option value="list">list</option>
            </SelectField>
          </div>
          <ArrayEditor
            label="Cards"
            items={content.cards}
            blockIndex={blockIndex}
            arrayKey="cards"
            renderItem={(item, itemIndex) => (
              <div className="grid gap-3 lg:grid-cols-2">
                <TextField label="title" value={stringValue(item.title)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'title', value)} />
                <TextField label="description" value={stringValue(item.description)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'description', value)} multiline rows={3} />
                <TextField label="icon" value={stringValue(item.icon)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'icon', value)} />
                <TextField label="link" value={stringValue(item.link)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'link', value)} />
                <TextField label="image" value={stringValue(item.image)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'image', value)} />
                <TextField label="image-alt" value={stringValue(item['image-alt'])} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'image-alt', value)} />
                <TextField label="alt" value={stringValue(item.alt)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'alt', value)} />
              </div>
            )}
          />
        </div>
      )
    case 'HowItWorks':
      return (
        <div className="space-y-4">
          {field('title', 'title')}
          <ArrayEditor
            label="Steps"
            items={content.steps}
            blockIndex={blockIndex}
            arrayKey="steps"
            renderItem={(item, itemIndex) => (
              <div className="grid gap-3 lg:grid-cols-2">
                <TextField label="step title" value={stringValue(item.title)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'steps', itemIndex, 'title', value)} />
                <TextField label="step text" value={stringValue(item.text)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'steps', itemIndex, 'text', value)} multiline rows={3} />
                <TextField label="step image" value={stringValue(item.image)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'steps', itemIndex, 'image', value)} />
                <TextField label="step alt" value={stringValue(item.alt)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'steps', itemIndex, 'alt', value)} />
              </div>
            )}
          />
        </div>
      )
    case 'FAQ':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {field('title', 'title')}
            {field('subtitle', 'subtitle')}
            <SelectField label="layout" value={stringValue(content.layout) || 'accordion'} onChange={(value) => updateBlockField(blockIndex, 'layout', value)}>
              <option value="accordion">accordion</option>
              <option value="grid">grid</option>
              <option value="list">list</option>
            </SelectField>
          </div>
          <ArrayEditor
            label="FAQ items"
            items={content.items}
            blockIndex={blockIndex}
            arrayKey="items"
            renderItem={(item, itemIndex) => (
              <div className="space-y-3">
                <TextField label="question" value={stringValue(item.question)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'question', value)} />
                <TextField label="answer" value={stringValue(item.answer)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'answer', value)} multiline rows={4} />
              </div>
            )}
          />
        </div>
      )
    case 'PrimaryCTA':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {field('title', 'title')}
            {field('description', 'description', { multiline: true, rows: 4 })}
            {field('buttonText', 'buttonText')}
            {field('buttonLink', 'buttonLink')}
            {field('secondaryText', 'secondaryText')}
            {field('secondaryLinkText', 'secondaryLinkText')}
            {field('secondaryLink', 'secondaryLink')}
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Closing image fields</div>
            <div className="grid gap-4 lg:grid-cols-2">
              {field('backgroundImage', 'backgroundImage')}
              {field('mainImage', 'mainImage')}
              {field('alt', 'alt')}
            </div>
          </div>
        </div>
      )
    case 'Contact':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {field('title', 'title')}
            {field('subtitle', 'subtitle', { multiline: true, rows: 3 })}
            {field('address', 'address')}
            {field('phone', 'phone')}
            {field('email', 'email')}
            {field('hours', 'hours')}
            {field('submitButtonText', 'submitButtonText')}
          </div>
          <ArrayEditor
            label="Form fields"
            items={content.formFields}
            blockIndex={blockIndex}
            arrayKey="formFields"
            renderItem={(item, itemIndex) => (
              <div className="grid gap-3 lg:grid-cols-2">
                <TextField label="label" value={stringValue(item.label)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'formFields', itemIndex, 'label', value)} />
                <TextField label="type" value={stringValue(item.type)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'formFields', itemIndex, 'type', value)} />
                <TextField label="placeholder" value={stringValue(item.placeholder)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'formFields', itemIndex, 'placeholder', value)} />
                <CheckboxField label="required" checked={booleanValue(item.required)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'formFields', itemIndex, 'required', value)} />
              </div>
            )}
          />
        </div>
      )
    default:
      return <UnsupportedBlock block={{ type: blockType, content }} />
  }
}
