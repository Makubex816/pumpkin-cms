'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { Page } from 'pumpkin-ts-models'

const LOCAL_PREVIEW_HOSTS: Record<string, string> = {
  'ice-rink-rentals': 'http://localhost:3002',
  'roller-rink-rentals': 'http://roller.localhost:3002',
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

export default function PagesPage() {
  const router = useRouter()
  const { token, user, currentTenant } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPages = async () => {
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
      } catch (error) {
        console.error('[Pages] Error fetching pages:', error)
        setError(error instanceof Error ? error.message : 'Failed to load pages')
      } finally {
        setLoading(false)
      }
    }

    fetchPages()
  }, [token, user, currentTenant])

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to view tenant pages.</p>
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Pages</h1>
          <p className="text-neutral-600">
            Read-only page manager for {currentTenant.name || currentTenant.tenantId}
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">Tenant</div>
          <div className="text-sm font-semibold text-neutral-900">{currentTenant.tenantId}</div>
        </div>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Phase 2 supports structured editing for existing pages. Create, duplicate, archive, import, export, and hard delete actions are intentionally unavailable here.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-neutral-600">Loading pages...</p>
          </div>
        ) : pages.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-400 mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Pages Found</h3>
            <p className="text-neutral-600">No CMS pages were returned for {currentTenant.name || currentTenant.tenantId}.</p>
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
                {pages.map((page) => (
                  <tr
                    key={page.id || `${page.tenantId}-${page.pageSlug}`}
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
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          router.push(getDetailUrl(page))
                        }}
                        className="text-primary-700 hover:text-primary-900 mr-4"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          router.push(getEditUrl(page))
                        }}
                        className="text-primary-700 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </button>
                      <a
                        href={getPreviewUrl(page)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="text-neutral-700 hover:text-neutral-900"
                      >
                        Preview
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages.length > 0 && (
        <div className="flex items-center justify-between text-sm text-neutral-600">
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
    </div>
  )
}
