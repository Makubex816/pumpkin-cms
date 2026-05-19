'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { IHtmlBlock, Page } from 'pumpkin-ts-models'

const LOCAL_PREVIEW_HOSTS: Record<string, string> = {
  'ice-rink-rentals': 'http://localhost:3002',
  'roller-rink-rentals': 'http://roller.localhost:3002',
}

type PageTemplate = 'blank' | 'landing' | 'contact'

interface CreatePageFormState {
  title: string
  slug: string
  template: PageTemplate
  isPublished: boolean
  includeInSitemap: boolean
}

interface DuplicatePageFormState {
  title: string
  slug: string
}

interface LifecycleModalProps {
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
}

const defaultCreateForm: CreatePageFormState = {
  title: '',
  slug: '',
  template: 'blank',
  isPublished: false,
  includeInSitemap: false,
}

function getPreviewUrl(page: Page) {
  const baseUrl = LOCAL_PREVIEW_HOSTS[page.tenantId] || 'http://localhost:3002'
  return page.pageSlug === 'home' ? `${baseUrl}/` : `${baseUrl}/${page.pageSlug}`
}

function getDetailUrl(page: Page) {
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/view?tenantId=${encodeURIComponent(page.tenantId)}`
}

function getEditUrl(page: Page) {
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/edit?tenantId=${encodeURIComponent(page.tenantId)}`
}

function getPageKey(page: Page) {
  return page.PageId || page.id || `${page.tenantId}-${page.pageSlug}`
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return 'Not set'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Invalid date'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function hasSlugCollision(pages: Page[], slug: string) {
  const normalizedSlug = normalizeSlug(slug)
  return pages.some((page) => normalizeSlug(page.pageSlug) === normalizedSlug)
}

function nextAvailableSlug(baseSlug: string, pages: Page[]) {
  const normalizedBase = normalizeSlug(baseSlug) || 'new-page'
  let candidate = normalizedBase
  let suffix = 2

  while (hasSlugCollision(pages, candidate)) {
    candidate = `${normalizedBase}-${suffix}`
    suffix += 1
  }

  return candidate
}

function clonePage(page: Page) {
  return JSON.parse(JSON.stringify(page)) as Page
}

function getAuthor(user: { username?: string; email?: string } | null | undefined) {
  return user?.username || user?.email || 'Pumpkin CMS Admin'
}

function getTemplateBlocks(template: PageTemplate, title: string): IHtmlBlock[] {
  if (template === 'blank') {
    return []
  }

  const heroBlock: IHtmlBlock = {
    type: 'Hero',
    content: {
      type: 'Main',
      headline: title,
      subheadline: '',
      backgroundImage: '',
      backgroundImageAltText: '',
      mainImage: '',
      mainImageAltText: '',
      buttonText: 'Contact Us',
      buttonLink: '/contact',
    },
  }

  if (template === 'contact') {
    return [
      heroBlock,
      {
        type: 'Contact',
        content: {
          id: 'contact',
          title: 'Contact Us',
          subtitle: '',
          address: '',
          phone: '',
          email: '',
          hours: '',
          formFields: [
            { label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
            { label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
            { label: 'Message', type: 'textarea', required: true, placeholder: 'Tell us about your event' },
          ],
          submitButtonText: 'Send Message',
          socialLinks: [],
        },
      },
    ]
  }

  return [
    heroBlock,
    {
      type: 'FAQ',
      content: {
        title: 'Questions',
        subtitle: '',
        layout: 'accordion',
        items: [
          { question: '', answer: '' },
        ],
      },
    },
    {
      type: 'PrimaryCTA',
      content: {
        title: title,
        description: '',
        buttonText: 'Request a Quote',
        buttonLink: '/contact',
        secondaryText: '',
        secondaryLinkText: '',
        secondaryLink: '',
        backgroundImage: '',
        mainImage: '',
        alt: '',
      },
    },
  ]
}

function createSeo(title: string, isPublished: boolean) {
  return {
    metaTitle: title,
    metaDescription: '',
    keywords: [],
    robots: isPublished ? 'index, follow' : 'noindex, nofollow',
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

function createPageFromForm(
  form: CreatePageFormState,
  tenantId: string,
  author: string,
) {
  const title = form.title.trim()
  const slug = normalizeSlug(form.slug)
  const now = new Date().toISOString()
  const blocks = getTemplateBlocks(form.template, title)
  const pageId = buildPageId(tenantId, slug)
  const isPublished = form.isPublished

  const page: Page = {
    id: pageId,
    PageId: pageId,
    tenantId,
    pageSlug: slug,
    PageVersion: 1,
    Layout: 'default',
    MetaData: {
      category: '',
      product: '',
      keyword: title,
      pageType: form.template === 'blank' ? 'page' : form.template,
      title,
      description: '',
      createdAt: now,
      updatedAt: now,
      author,
      language: 'en-us',
      market: 'us',
    },
    searchData: {
      state: '',
      city: '',
      metro: '',
      county: '',
      keyword: title,
      tags: [],
      contentSummary: '',
      blockTypes: blocks.map((block) => block.type),
    },
    ContentData: {
      ContentBlocks: blocks,
    },
    contentRelationships: {
      isHub: false,
      hubPageSlug: '',
      topicCluster: '',
      relatedHubs: [],
      spokePriority: 0,
    },
    seo: createSeo(title, isPublished),
    isPublished,
    publishedAt: isPublished ? now : null,
    includeInSitemap: isPublished ? form.includeInSitemap : false,
  }

  return page
}

function updateCanonicalForSlug(canonicalUrl: string, slug: string) {
  if (!canonicalUrl.trim()) return ''

  try {
    const url = new URL(canonicalUrl)
    url.pathname = slug === 'home' ? '/' : `/${slug}`
    url.search = ''
    url.hash = ''
    return url.toString()
  } catch {
    return ''
  }
}

function duplicatePageFromForm(sourcePage: Page, form: DuplicatePageFormState, tenantId: string) {
  const title = form.title.trim()
  const slug = normalizeSlug(form.slug)
  const now = new Date().toISOString()
  const pageId = buildPageId(tenantId, slug)
  const duplicated = clonePage(sourcePage)
  const blockTypes = Array.isArray(duplicated.ContentData?.ContentBlocks)
    ? duplicated.ContentData.ContentBlocks.map((block) => block.type)
    : []

  return {
    ...duplicated,
    id: pageId,
    PageId: pageId,
    tenantId,
    pageSlug: slug,
    PageVersion: 1,
    MetaData: {
      ...duplicated.MetaData,
      title,
      createdAt: now,
      updatedAt: now,
    },
    searchData: {
      ...duplicated.searchData,
      keyword: title,
      blockTypes,
    },
    seo: {
      ...duplicated.seo,
      metaTitle: title,
      canonicalUrl: updateCanonicalForSlug(duplicated.seo?.canonicalUrl || '', slug),
      openGraph: {
        ...duplicated.seo?.openGraph,
        'og:title': title,
        'og:url': updateCanonicalForSlug(duplicated.seo?.openGraph?.['og:url'] || '', slug),
      },
      twitterCard: {
        ...duplicated.seo?.twitterCard,
        'twitter:title': title,
      },
    },
    isPublished: false,
    publishedAt: null,
    includeInSitemap: false,
  } satisfies Page
}

function LifecycleModal({ title, description, children, onClose }: LifecycleModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}

export default function PagesPage() {
  const router = useRouter()
  const { token, user, currentTenant } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreatePageFormState>(defaultCreateForm)
  const [duplicateSource, setDuplicateSource] = useState<Page | null>(null)
  const [duplicateForm, setDuplicateForm] = useState<DuplicatePageFormState>({ title: '', slug: '' })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionPageKey, setActionPageKey] = useState<string | null>(null)

  const currentTenantId = currentTenant?.tenantId || ''
  const normalizedCreateSlug = normalizeSlug(createForm.slug)
  const normalizedDuplicateSlug = normalizeSlug(duplicateForm.slug)

  const pagesByUpdatedDate = useMemo(() => (
    [...pages].sort((a, b) => {
      const dateA = new Date(a.MetaData?.updatedAt || 0).getTime()
      const dateB = new Date(b.MetaData?.updatedAt || 0).getTime()
      return dateB - dateA
    })
  ), [pages])

  const fetchPages = useCallback(async () => {
    if (!token || !user) {
      setLoading(false)
      return
    }

    if (!currentTenant) {
      setPages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const pagesData = await apiClient.getPages(token, currentTenant.tenantId)
      setPages(pagesData)
    } catch (fetchError) {
      console.error('[Pages] Error fetching pages:', fetchError)
      setError(getErrorMessage(fetchError, 'Failed to load pages'))
    } finally {
      setLoading(false)
    }
  }, [token, user, currentTenant])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  const openCreateModal = () => {
    setCreateForm({ ...defaultCreateForm })
    setIsCreateModalOpen(true)
    setFormError(null)
    setNotice(null)
  }

  const closeCreateModal = () => {
    setCreateForm({ ...defaultCreateForm })
    setIsCreateModalOpen(false)
    setFormError(null)
  }

  const openDuplicateModal = (page: Page) => {
    const sourceTitle = page.MetaData?.title || page.pageSlug || 'Untitled'
    const nextSlug = nextAvailableSlug(`${page.pageSlug}-copy`, pages)
    setDuplicateSource(page)
    setDuplicateForm({
      title: `${sourceTitle} Copy`,
      slug: nextSlug,
    })
    setFormError(null)
    setNotice(null)
  }

  const closeDuplicateModal = () => {
    setDuplicateSource(null)
    setDuplicateForm({ title: '', slug: '' })
    setFormError(null)
  }

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token || !currentTenant) return

    const title = createForm.title.trim()
    const slug = normalizeSlug(createForm.slug)

    if (!title) {
      setFormError('Page title is required.')
      return
    }

    if (!slug) {
      setFormError('Page slug is required.')
      return
    }

    if (hasSlugCollision(pages, slug)) {
      setFormError(`A page with slug "${slug}" already exists for this tenant.`)
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      const pageToCreate = createPageFromForm(
        { ...createForm, slug },
        currentTenant.tenantId,
        getAuthor(user),
      )
      const createdPage = await apiClient.createPage(token, currentTenant.tenantId, pageToCreate)
      setPages((currentPages) => [createdPage, ...currentPages])
      setNotice(`Created draft page "${createdPage.MetaData.title}".`)
      closeCreateModal()
    } catch (createError) {
      setFormError(getErrorMessage(createError, 'Failed to create page.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDuplicateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token || !currentTenant || !duplicateSource) return

    const title = duplicateForm.title.trim()
    const slug = normalizeSlug(duplicateForm.slug)

    if (!title) {
      setFormError('New page title is required.')
      return
    }

    if (!slug) {
      setFormError('New page slug is required.')
      return
    }

    if (hasSlugCollision(pages, slug)) {
      setFormError(`A page with slug "${slug}" already exists for this tenant.`)
      return
    }

    try {
      setSubmitting(true)
      setFormError(null)
      const pageToCreate = duplicatePageFromForm(duplicateSource, { title, slug }, currentTenant.tenantId)
      const createdPage = await apiClient.createPage(token, currentTenant.tenantId, pageToCreate)
      setPages((currentPages) => [createdPage, ...currentPages])
      setNotice(`Duplicated "${duplicateSource.MetaData?.title || duplicateSource.pageSlug}" as a draft.`)
      closeDuplicateModal()
    } catch (duplicateError) {
      setFormError(getErrorMessage(duplicateError, 'Failed to duplicate page.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleTogglePublish = async (page: Page) => {
    if (!token || !currentTenant || actionPageKey) return

    const nextIsPublished = !page.isPublished
    const actionLabel = nextIsPublished ? 'publish' : 'unpublish'
    const confirmed = window.confirm(
      nextIsPublished
        ? `Publish "${page.MetaData?.title || page.pageSlug}"?`
        : `Unpublish "${page.MetaData?.title || page.pageSlug}"? This also removes it from the sitemap.`,
    )

    if (!confirmed) return

    try {
      setActionPageKey(getPageKey(page))
      setError(null)
      setNotice(null)

      const nextPage = clonePage(page)
      nextPage.isPublished = nextIsPublished
      nextPage.includeInSitemap = nextIsPublished ? true : false
      nextPage.publishedAt = nextIsPublished
        ? nextPage.publishedAt || new Date().toISOString()
        : nextPage.publishedAt
      nextPage.MetaData.updatedAt = new Date().toISOString()

      const updatedPage = await apiClient.updatePage(token, currentTenant.tenantId, page.pageSlug, nextPage)
      setPages((currentPages) => currentPages.map((item) => (
        getPageKey(item) === getPageKey(page) ? updatedPage : item
      )))
      setNotice(`Page ${actionLabel}ed successfully.`)
    } catch (publishError) {
      setError(getErrorMessage(publishError, `Failed to ${actionLabel} page.`))
    } finally {
      setActionPageKey(null)
    }
  }

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to manage tenant pages.</p>
      </div>
    )
  }

  if (!currentTenant) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">No Tenant Selected</h1>
        <p className="text-neutral-600">Select a tenant/site from the admin header to list CMS pages.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Pages</h1>
          <p className="text-neutral-600">
            Safe lifecycle manager for {currentTenant.name || currentTenant.tenantId}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">Tenant</div>
            <div className="text-sm font-semibold text-neutral-900">{currentTenant.tenantId}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              openCreateModal()
            }}
            className="btn btn-primary"
          >
            Create Page
          </button>
        </div>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Phase 3 adds create, duplicate, and publish lifecycle controls. Archive is documented as unavailable because the current Page model has no archive field; hard delete is not exposed.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {notice && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {notice}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-neutral-600">Loading pages...</p>
          </div>
        ) : pagesByUpdatedDate.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Pages Found</h3>
            <p className="text-neutral-600 mb-4">No CMS pages were returned for {currentTenant.name || currentTenant.tenantId}.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="btn btn-primary"
            >
              Create Page
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Published
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Sitemap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {pagesByUpdatedDate.map((page) => {
                  const isActionRunning = actionPageKey === getPageKey(page)

                  return (
                    <tr
                      key={getPageKey(page)}
                      onClick={() => router.push(getDetailUrl(page))}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900">
                          {page.MetaData?.title || 'Untitled'}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {page.MetaData?.pageType || 'Page type not set'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-neutral-700">
                          /{page.pageSlug || 'missing-slug'}
                        </div>
                        {!page.isPublished && (
                          <div className="mt-1 text-xs text-neutral-500">Public route may return 404 while draft.</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {page.isPublished ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {page.includeInSitemap ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Included
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                            Hidden
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                        {formatDate(page.MetaData?.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              router.push(getDetailUrl(page))
                            }}
                            className="text-primary-700 hover:text-primary-900"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              router.push(getEditUrl(page))
                            }}
                            className="text-primary-700 hover:text-primary-900"
                          >
                            Edit
                          </button>
                          <a
                            href={getPreviewUrl(page)}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="text-neutral-700 hover:text-neutral-900"
                            title={page.isPublished ? 'Open the public page' : 'Draft pages are available in admin view/edit; public route may return 404.'}
                          >
                            Preview
                          </a>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              openDuplicateModal(page)
                            }}
                            className="text-primary-700 hover:text-primary-900"
                          >
                            Duplicate
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleTogglePublish(page)
                            }}
                            disabled={isActionRunning}
                            className="text-primary-700 hover:text-primary-900 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isActionRunning ? 'Saving...' : page.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            type="button"
                            disabled
                            className="cursor-not-allowed text-neutral-400"
                            title="Archive requires a first-class archive/status field. Use Unpublish for this MVP."
                          >
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-neutral-600">
          <div>
            Showing {pages.length} page{pages.length !== 1 ? 's' : ''} for {currentTenant.tenantId}
          </div>
          <div>
            {pages.filter((page) => page.isPublished).length} published,{' '}
            {pages.filter((page) => !page.isPublished).length} draft,{' '}
            {pages.filter((page) => page.includeInSitemap).length} in sitemap
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <LifecycleModal
          title="Create Page"
          description="Create a tenant-scoped page from a minimal starting point. Draft pages do not appear publicly."
          onClose={closeCreateModal}
        >
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {formError}
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">Page title</span>
                <input
                  value={createForm.title}
                  onChange={(event) => {
                    const title = event.target.value
                    setCreateForm((current) => ({
                      ...current,
                      title,
                      slug: current.slug ? current.slug : normalizeSlug(title),
                    }))
                  }}
                  className="input"
                  required
                  data-testid="create-page-title"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">Page slug</span>
                <input
                  value={createForm.slug}
                  onChange={(event) => setCreateForm((current) => ({ ...current, slug: event.target.value }))}
                  className="input font-mono"
                  required
                  data-testid="create-page-slug"
                />
                <span className="mt-1 block text-xs text-neutral-500">Normalized: /{normalizedCreateSlug || 'required'}</span>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">Template type</span>
                <select
                  value={createForm.template}
                  onChange={(event) => setCreateForm((current) => ({ ...current, template: event.target.value as PageTemplate }))}
                  className="input"
                >
                  <option value="blank">Blank page</option>
                  <option value="landing">Landing starter</option>
                  <option value="contact">Contact starter</option>
                </select>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={createForm.isPublished}
                    onChange={(event) => setCreateForm((current) => ({
                      ...current,
                      isPublished: event.target.checked,
                      includeInSitemap: event.target.checked ? current.includeInSitemap : false,
                    }))}
                    className="rounded border-neutral-300 text-primary-600"
                  />
                  Published
                </label>
                <label className="flex items-center gap-2 text-sm text-neutral-700">
                  <input
                    type="checkbox"
                    checked={createForm.includeInSitemap}
                    disabled={!createForm.isPublished}
                    onChange={(event) => setCreateForm((current) => ({ ...current, includeInSitemap: event.target.checked }))}
                    className="rounded border-neutral-300 text-primary-600 disabled:opacity-50"
                  />
                  Include in sitemap
                </label>
              </div>
            </div>
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              Tenant ID is locked to {currentTenantId}. Page ID will be generated from the tenant and slug.
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeCreateModal} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? 'Creating...' : 'Create Page'}
              </button>
            </div>
          </form>
        </LifecycleModal>
      )}

      {duplicateSource && (
        <LifecycleModal
          title="Duplicate Page"
          description="Duplicate keeps content blocks and SEO fields, but creates a new draft with a new slug and title."
          onClose={closeDuplicateModal}
        >
          <form onSubmit={handleDuplicateSubmit} className="space-y-4">
            {formError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {formError}
              </div>
            )}
            <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
              Source: {duplicateSource.MetaData?.title || duplicateSource.pageSlug} ({duplicateSource.pageSlug})
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">New title</span>
                <input
                  value={duplicateForm.title}
                  onChange={(event) => setDuplicateForm((current) => ({ ...current, title: event.target.value }))}
                  className="input"
                  required
                  data-testid="duplicate-page-title"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-neutral-700">New slug</span>
                <input
                  value={duplicateForm.slug}
                  onChange={(event) => setDuplicateForm((current) => ({ ...current, slug: event.target.value }))}
                  className="input font-mono"
                  required
                  data-testid="duplicate-page-slug"
                />
                <span className="mt-1 block text-xs text-neutral-500">Normalized: /{normalizedDuplicateSlug || 'required'}</span>
              </label>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              The duplicated page will be unpublished and hidden from the sitemap. Canonical URL is updated when the source has a valid canonical URL; otherwise it is left blank for review.
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={closeDuplicateModal} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? 'Duplicating...' : 'Duplicate Page'}
              </button>
            </div>
          </form>
        </LifecycleModal>
      )}
    </div>
  )
}
