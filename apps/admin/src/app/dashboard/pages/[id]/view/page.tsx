'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { IHtmlBlock, Page, PageRedirect } from 'pumpkin-ts-models'

const LOCAL_PREVIEW_HOSTS: Record<string, string> = {
  'ice-rink-rentals': 'http://localhost:3002',
  'roller-rink-rentals': 'http://roller.localhost:3002',
}

const supportedBlockTypes = new Set<string>([
  'Hero',
  'PrimaryCTA',
  'SecondaryCTA',
  'CardGrid',
  'FAQ',
  'Breadcrumbs',
  'TrustBar',
  'HowItWorks',
  'ServiceAreaMap',
  'LocalProTips',
  'Gallery',
  'Testimonials',
  'Contact',
  'Blog',
])

interface FieldRowProps {
  label: string
  children: ReactNode
}

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

interface ImageFieldSignal {
  source: string
  path: string
  value: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isScalar(value: unknown): value is string | number | boolean {
  return ['string', 'number', 'boolean'].includes(typeof value)
}

function formatDateTime(dateString: string | null | undefined) {
  if (!dateString) return 'Not set'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatBoolean(value: boolean | null | undefined) {
  if (typeof value !== 'boolean') return 'Not set'
  return value ? 'Yes' : 'No'
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

function getPageRedirects(page: Page | null | undefined): PageRedirect[] {
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

function getActiveRedirects(page: Page | null | undefined) {
  return getPageRedirects(page).filter((redirect) => redirect.active)
}

function getMissingRedirectCoverage(page: Page | null | undefined) {
  if (!page) return []
  const currentSlug = normalizeRedirectSlug(page.pageSlug)
  const activeRedirects = getActiveRedirects(page)

  return (page.previousSlugs || [])
    .map(normalizeRedirectSlug)
    .filter(Boolean)
    .filter((previousSlug) => !activeRedirects.some((redirect) => redirect.from === previousSlug && redirect.to === currentSlug))
}

function getCanonicalSlugStatus(page: Page) {
  const canonicalUrl = page.seo?.canonicalUrl || ''
  if (!canonicalUrl.trim()) return 'Missing canonical URL'

  try {
    const canonical = new URL(canonicalUrl)
    return (normalizeRedirectSlug(canonical.pathname) || 'home') === normalizeRedirectSlug(page.pageSlug)
      ? 'Matches current slug'
      : 'Review canonical path'
  } catch {
    return 'Invalid canonical URL'
  }
}

function formatPath(parts: string[]) {
  return parts.join('.').replace(/\.(\d+)(?=\.|$)/g, '[$1]')
}

function getPreviewUrl(page: Page) {
  const baseUrl = LOCAL_PREVIEW_HOSTS[page.tenantId] || 'http://localhost:3002'
  return page.pageSlug === 'home' ? `${baseUrl}/` : `${baseUrl}/${page.pageSlug}`
}

function getEditUrl(page: Page, refreshKey?: string | number) {
  const query = new URLSearchParams({ tenantId: page.tenantId })
  if (refreshKey) query.set('fresh', String(refreshKey))
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/edit?${query.toString()}`
}

function getViewUrl(page: Page, refreshKey?: string | number) {
  const query = new URLSearchParams({ tenantId: page.tenantId })
  if (refreshKey) query.set('fresh', String(refreshKey))
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/view?${query.toString()}`
}

function collectImageFields(value: unknown, source: string, path: string[] = []): ImageFieldSignal[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectImageFields(item, source, [...path, String(index)]))
  }

  if (!isRecord(value)) {
    return []
  }

  return Object.entries(value).flatMap(([key, item]) => {
    const nextPath = [...path, key]
    const normalizedKey = key.toLowerCase()
    const isImageLikeField = normalizedKey.includes('image') || normalizedKey.includes('alt')
    const currentField = isImageLikeField && isScalar(item)
      ? [{
          source,
          path: formatPath(nextPath),
          value: String(item || 'Not set'),
        }]
      : []

    if (Array.isArray(item) || isRecord(item)) {
      return [...currentField, ...collectImageFields(item, source, nextPath)]
    }

    return currentField
  })
}

function firstImageValue(block: IHtmlBlock | undefined) {
  if (!block) return 'Not set or not detected'

  const imageField = collectImageFields(block.content, block.type || 'Block')
    .find((field) => field.path.toLowerCase().includes('image') && !field.path.toLowerCase().includes('alt'))

  return imageField?.value || 'Not set or not detected'
}

function getImageFields(page: Page) {
  const blockFields = (page.ContentData?.ContentBlocks || []).flatMap((block, index) => (
    collectImageFields(block.content, `Block ${index + 1}: ${block.type || 'Missing type'}`, ['content'])
  ))

  const seoFields = collectImageFields(page.seo || {}, 'SEO', ['seo'])
  return [...seoFields, ...blockFields]
}

function getImageSlotSummary(page: Page) {
  const blocks = page.ContentData?.ContentBlocks || []
  const heroBlock = blocks.find((block) => block.type === 'Hero')
  const localBlock = blocks.find((block) => ['ServiceAreaMap', 'Gallery', 'CardGrid', 'Testimonials'].includes(block.type))
  const closingBlock = [...blocks].reverse().find((block) => ['PrimaryCTA', 'SecondaryCTA', 'Contact'].includes(block.type))

  return {
    hero: firstImageValue(heroBlock),
    local: firstImageValue(localBlock),
    closing: firstImageValue(closingBlock),
  }
}

function MissingValue({ text = 'Not set' }: { text?: string }) {
  return <span className="text-neutral-400 italic">{text}</span>
}

function ReadOnlyValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null || value === undefined || value === '') {
    return <MissingValue />
  }

  if (typeof value === 'boolean') {
    return <span>{value ? 'Yes' : 'No'}</span>
  }

  if (typeof value === 'number') {
    return <span>{value}</span>
  }

  if (typeof value === 'string') {
    return <span className="whitespace-pre-wrap break-words">{value}</span>
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <MissingValue text="Empty list" />
    }

    if (value.every(isScalar)) {
      return (
        <div className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <span key={`${String(item)}-${index}`} className="inline-flex items-center rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">
              {String(item)}
            </span>
          ))}
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {value.map((item, index) => (
          <div key={index} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Item {index + 1}</div>
            <ReadOnlyValue value={item} depth={depth + 1} />
          </div>
        ))}
      </div>
    )
  }

  if (isRecord(value)) {
    const entries = Object.entries(value)
    if (entries.length === 0) {
      return <MissingValue text="Empty object" />
    }

    return (
      <div className={depth > 0 ? 'space-y-2' : 'space-y-3'}>
        {entries.map(([key, item]) => (
          <div key={key} className="grid gap-1 md:grid-cols-[180px_1fr]">
            <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{key}</div>
            <div className="min-w-0 text-sm text-neutral-800">
              <ReadOnlyValue value={item} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <MissingValue text="Unsupported value" />
}

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className="grid gap-1 border-b border-neutral-100 py-3 last:border-b-0 md:grid-cols-[220px_1fr]">
      <div className="text-sm font-medium text-neutral-600">{label}</div>
      <div className="min-w-0 text-sm text-neutral-900">{children}</div>
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
      <div className="px-5 py-2">{children}</div>
    </section>
  )
}

function StatusBadge({ active, activeLabel, inactiveLabel }: { active: boolean; activeLabel: string; inactiveLabel: string }) {
  return active ? (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      {activeLabel}
    </span>
  ) : (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      {inactiveLabel}
    </span>
  )
}

export default function PageReadOnlyView() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, user, currentTenant } = useAuth()

  const routeId = params.id
  const encodedPageSlug = Array.isArray(routeId) ? routeId[0] : routeId
  const pageSlug = encodedPageSlug ? decodeURIComponent(encodedPageSlug) : ''
  const tenantId = searchParams.get('tenantId') || currentTenant?.tenantId || user?.tenantId || ''
  const freshnessToken = searchParams.get('fresh') || ''

  const [page, setPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [rollingBack, setRollingBack] = useState(false)

  useEffect(() => {
    let isActive = true

    const fetchPage = async () => {
      if (!token || !user || !tenantId || !pageSlug) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const pageData = await apiClient.getPage(token, tenantId, pageSlug)
        if (isActive) {
          setPage(pageData)
        }
      } catch (error) {
        const message = error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: unknown }).message)
          : 'Failed to load page'

        if (isActive) {
          setError(message)
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
  }, [token, user, tenantId, pageSlug, freshnessToken])

  const imageFields = useMemo(() => (page ? getImageFields(page) : []), [page])
  const imageSlots = useMemo(() => (page ? getImageSlotSummary(page) : null), [page])
  const contentBlocks = page?.ContentData?.ContentBlocks || []
  const latestSnapshotId = page?.revision?.latestSnapshot?.revisionId || ''
  const canRollback = Boolean(page?.revision?.rollbackAvailable && page.revision.latestSnapshot?.page)
  const activeRedirects = useMemo(() => getActiveRedirects(page), [page])
  const missingRedirectCoverage = useMemo(() => getMissingRedirectCoverage(page), [page])

  const handleRollback = async () => {
    if (!page || !token || rollingBack || !canRollback) return

    const confirmed = window.confirm(
      `Roll back "${page.MetaData?.title || page.pageSlug}" to snapshot ${latestSnapshotId || 'latest'}? This creates a new revision before restoring.`,
    )

    if (!confirmed) return

    try {
      setRollingBack(true)
      setActionError(null)
      setNotice(null)

      const rolledBackPage = await apiClient.rollbackPage(
        token,
        page.tenantId,
        page.pageSlug,
        `Rollback from page detail view to ${latestSnapshotId || 'latest snapshot'}`,
      )

      setPage(rolledBackPage)
      setNotice(`Rollback completed to ${latestSnapshotId || 'latest snapshot'}. Static publishing is marked for rebuild.`)

      if (rolledBackPage.pageSlug !== pageSlug) {
        router.replace(getViewUrl(rolledBackPage, Date.now()))
      }
    } catch (rollbackError) {
      const message = rollbackError && typeof rollbackError === 'object' && 'message' in rollbackError
        ? String((rollbackError as { message?: unknown }).message)
        : 'Rollback failed'

      setActionError(message)
    } finally {
      setRollingBack(false)
    }
  }

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to view page details.</p>
      </div>
    )
  }

  if (!tenantId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">No Tenant Selected</h1>
        <p className="text-neutral-600 mb-4">Select a tenant/site before opening page details.</p>
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
        <p className="mt-4 text-neutral-600">Loading page details...</p>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Page Could Not Be Loaded</h1>
        <p className="text-neutral-600 mb-4">{error || 'The page was not returned by the API.'}</p>
        <button type="button" onClick={() => router.push('/dashboard/pages')} className="btn btn-primary">
          Back to Pages
        </button>
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
          <h1 className="text-3xl font-bold text-neutral-900">{page.MetaData?.title || 'Untitled Page'}</h1>
          <p className="mt-1 font-mono text-sm text-neutral-600">/{page.pageSlug || 'missing-slug'}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge active={page.isPublished} activeLabel="Published" inactiveLabel="Draft" />
          <StatusBadge active={page.includeInSitemap} activeLabel="In sitemap" inactiveLabel="Sitemap hidden" />
          <button
            type="button"
            onClick={() => router.push(getEditUrl(page, Date.now()))}
            className="btn btn-primary"
          >
            Edit
          </button>
          <a
            href={getPreviewUrl(page)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-secondary"
          >
            Preview
          </a>
        </div>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        This page detail view is read-only. Use Edit for structured content and production-readiness fields; rollback uses the latest stored snapshot when available. Live deployment and hard delete are not available.
      </div>

      {notice && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {notice}
        </div>
      )}

      {actionError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {actionError}
        </div>
      )}

      <Section title="Page Summary">
        <FieldRow label="Page Title / H1">{page.MetaData?.title || <MissingValue />}</FieldRow>
        <FieldRow label="Page Slug">{page.pageSlug || <MissingValue />}</FieldRow>
        <FieldRow label="MetaData.description">{page.MetaData?.description || <MissingValue />}</FieldRow>
        <FieldRow label="Tenant ID">{page.tenantId || <MissingValue />}</FieldRow>
        <FieldRow label="Page ID">{page.PageId || page.id || <MissingValue />}</FieldRow>
        <FieldRow label="Page Version">{page.PageVersion ?? <MissingValue />}</FieldRow>
        <FieldRow label="Layout">{page.Layout || <MissingValue />}</FieldRow>
        <FieldRow label="Page Type">{page.MetaData?.pageType || <MissingValue />}</FieldRow>
        <FieldRow label="Category">{page.MetaData?.category || <MissingValue />}</FieldRow>
        <FieldRow label="Product">{page.MetaData?.product || <MissingValue />}</FieldRow>
        <FieldRow label="Keyword">{page.MetaData?.keyword || <MissingValue />}</FieldRow>
        <FieldRow label="Author">{page.MetaData?.author || <MissingValue />}</FieldRow>
        <FieldRow label="Published">{formatBoolean(page.isPublished)}</FieldRow>
        <FieldRow label="Published At">{formatDateTime(page.publishedAt)}</FieldRow>
        <FieldRow label="Include In Sitemap">{formatBoolean(page.includeInSitemap)}</FieldRow>
        <FieldRow label="Created At">{formatDateTime(page.MetaData?.createdAt)}</FieldRow>
        <FieldRow label="Updated At">{formatDateTime(page.MetaData?.updatedAt)}</FieldRow>
      </Section>

      <Section title="Slug And Redirects" description="Previous slugs and active redirects protect SEO, Google Ads final URLs, internal links, static deployments, and backlinks after slug changes.">
        <FieldRow label="Current Slug">/{normalizeRedirectSlug(page.pageSlug) || 'missing-slug'}</FieldRow>
        <FieldRow label="Previous Slugs">
          {(page.previousSlugs || []).length > 0 ? (page.previousSlugs || []).join(', ') : <MissingValue text="No previous slugs recorded" />}
        </FieldRow>
        <FieldRow label="Active Redirect Count">{activeRedirects.length}</FieldRow>
        <FieldRow label="Redirect Coverage">
          {missingRedirectCoverage.length === 0 ? 'Covered or not needed' : `Missing coverage for ${missingRedirectCoverage.join(', ')}`}
        </FieldRow>
        <FieldRow label="Canonical Slug Status">{getCanonicalSlugStatus(page)}</FieldRow>
        <FieldRow label="Redirect Records"><ReadOnlyValue value={page.redirects || []} /></FieldRow>
      </Section>

      <Section title="SEO" description="Search, canonical, robots, Open Graph, Twitter Card, and structured data values.">
        <FieldRow label="Meta Title">{page.seo?.metaTitle || <MissingValue />}</FieldRow>
        <FieldRow label="Meta Description">{page.seo?.metaDescription || <MissingValue />}</FieldRow>
        <FieldRow label="Canonical URL">{page.seo?.canonicalUrl || <MissingValue />}</FieldRow>
        <FieldRow label="Robots">{page.seo?.robots || <MissingValue />}</FieldRow>
        <FieldRow label="Keywords"><ReadOnlyValue value={page.seo?.keywords} /></FieldRow>
        <FieldRow label="Alternate URLs"><ReadOnlyValue value={page.seo?.alternateUrls} /></FieldRow>
        <FieldRow label="Open Graph"><ReadOnlyValue value={page.seo?.openGraph} /></FieldRow>
        <FieldRow label="Twitter Card"><ReadOnlyValue value={page.seo?.twitterCard} /></FieldRow>
        <FieldRow label="Structured Data"><ReadOnlyValue value={page.seo?.structuredData} /></FieldRow>
      </Section>

      <Section title="Image Fields" description="Detected image and alt-text values from SEO and content blocks.">
        <FieldRow label="Hero Image Slot">{imageSlots?.hero || <MissingValue text="Not set or not detected" />}</FieldRow>
        <FieldRow label="Dynamic/Local Image Slot">{imageSlots?.local || <MissingValue text="Not set or not detected" />}</FieldRow>
        <FieldRow label="Closing Image Slot">{imageSlots?.closing || <MissingValue text="Not set or not detected" />}</FieldRow>
        <FieldRow label="First-Class Page Image Slots">
          <ReadOnlyValue value={page.media} />
        </FieldRow>
        <FieldRow label="Detected Fields">
          {imageFields.length === 0 ? (
            <MissingValue text="No image-like fields found" />
          ) : (
            <div className="space-y-2">
              {imageFields.map((field, index) => (
                <div key={`${field.source}-${field.path}-${index}`} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{field.source}</div>
                  <div className="mt-1 font-mono text-xs text-neutral-600">{field.path}</div>
                  <div className="mt-2 break-words text-sm text-neutral-900">{field.value || <MissingValue />}</div>
                </div>
              ))}
            </div>
          )}
        </FieldRow>
      </Section>

      <Section title="Content Blocks" description="Structured read-only view of ContentData.ContentBlocks.">
        {contentBlocks.length === 0 ? (
          <div className="py-6 text-sm text-neutral-600">No content blocks were found for this page.</div>
        ) : (
          <div className="space-y-4 py-4">
            {contentBlocks.map((block, index) => {
              const blockType = block.type || 'Missing type'
              const isSupported = supportedBlockTypes.has(block.type)

              return (
                <div key={`${blockType}-${index}`} className="rounded-lg border border-neutral-200 bg-neutral-50">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Block {index + 1}</div>
                      <h3 className="text-base font-semibold text-neutral-900">{blockType}</h3>
                    </div>
                    {isSupported ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Supported
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                        Unsupported
                      </span>
                    )}
                  </div>
                  {!isSupported && (
                    <div className="border-b border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                      This block type is not listed in pumpkin-ts-models SUPPORTED_BLOCK_TYPES. Raw content is shown for inspection.
                    </div>
                  )}
                  <div className="p-4">
                    <ReadOnlyValue value={block.content} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Search And Relationships">
        <FieldRow label="Search Data"><ReadOnlyValue value={page.searchData} /></FieldRow>
        <FieldRow label="Content Relationships"><ReadOnlyValue value={page.contentRelationships} /></FieldRow>
        <FieldRow label="Linking"><ReadOnlyValue value={page.linking} /></FieldRow>
      </Section>

      <Section title="Workflow And Publishing Contract">
        <FieldRow label="Revision ID">{page.revision?.currentRevisionId || <MissingValue text="No revision saved yet" />}</FieldRow>
        <FieldRow label="Revision Number">{page.revision?.revisionNumber ?? <MissingValue />}</FieldRow>
        <FieldRow label="Last Change Source">{page.revision?.lastChangeSource || <MissingValue />}</FieldRow>
        <FieldRow label="Last Change Summary">{page.revision?.lastChangeSummary || <MissingValue />}</FieldRow>
        <FieldRow label="Rollback Available">{formatBoolean(page.revision?.rollbackAvailable)}</FieldRow>
        <FieldRow label="Latest Snapshot">{page.revision?.latestSnapshot?.revisionId || <MissingValue text="No snapshot stored yet" />}</FieldRow>
        <FieldRow label="Static Needs Rebuild">{formatBoolean(page.staticPublishing?.needsRebuild)}</FieldRow>
        <FieldRow label="Workflow"><ReadOnlyValue value={page.workflow} /></FieldRow>
        <FieldRow label="Revision">
          <div className="space-y-3">
            <ReadOnlyValue value={page.revision} />
            <button
              type="button"
              onClick={handleRollback}
              disabled={!canRollback || rollingBack}
              className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rollingBack ? 'Rolling back...' : 'Rollback to latest snapshot'}
            </button>
            {!canRollback && (
              <div className="text-sm text-neutral-500">Rollback unavailable until an update creates a latest snapshot.</div>
            )}
          </div>
        </FieldRow>
        <FieldRow label="Static Publishing"><ReadOnlyValue value={page.staticPublishing} /></FieldRow>
        <FieldRow label="Template Identity"><ReadOnlyValue value={page.template} /></FieldRow>
        <FieldRow label="Structured Data Controls"><ReadOnlyValue value={page.schemaControls} /></FieldRow>
        <FieldRow label="Form Config"><ReadOnlyValue value={page.formConfig} /></FieldRow>
        <FieldRow label="Import Provenance"><ReadOnlyValue value={page.importProvenance} /></FieldRow>
        <FieldRow label="Deployment Hooks"><ReadOnlyValue value={page.deploymentHooks} /></FieldRow>
      </Section>
    </div>
  )
}
