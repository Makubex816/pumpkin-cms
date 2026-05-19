'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, ReactNode } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import {
  ALL_REPAIR_CATEGORIES,
  METADATA_REPAIR_CHANGE_SOURCE,
  REPAIR_CATEGORIES,
  applyRepairsToPage,
  buildPageRepairPlan,
  buildTenantRepairPlan,
  type PageRepairPlan,
  type RepairCategory,
  type TenantRepairPlan,
} from '@/lib/page-repairs'
import { getDetailUrl, getEditUrl, getPreviewUrl } from '@/lib/publishing-readiness'
import type { Page } from 'pumpkin-ts-models'

export default function PublishingRepairsPage() {
  const { token, user, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [selectedCategories, setSelectedCategories] = useState<RepairCategory[]>(ALL_REPAIR_CATEGORIES)
  const [selectedPageKeys, setSelectedPageKeys] = useState<string[]>([])
  const [previewedAt, setPreviewedAt] = useState<string>('')
  const [applying, setApplying] = useState(false)
  const [lastResult, setLastResult] = useState<{ updated: number; skipped: number; errors: string[] } | null>(null)

  const loadPages = useCallback(async () => {
    if (!token || !currentTenant) {
      setPages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const tenantPages = await apiClient.getPages(token, currentTenant.tenantId)
      setPages(tenantPages)
      setPreviewedAt(new Date().toISOString())
      setLastResult(null)
    } catch (loadError) {
      console.error('[Publishing Repairs] Failed to load pages:', loadError)
      setError(getErrorMessage(loadError, 'Failed to load tenant pages.'))
    } finally {
      setLoading(false)
    }
  }, [token, currentTenant])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  const fullPlan = useMemo(() => buildTenantRepairPlan(pages), [pages])
  const selectedCategoriesKey = selectedCategories.join('|')
  const selectedPlan = useMemo(() => {
    const pagePlans = pages.map((page) => buildPageRepairPlan(page, selectedCategories, previewedAt || new Date().toISOString()))
    return {
      generatedAt: previewedAt,
      totalPagesScanned: pages.length,
      pagePlans,
      summary: selectedCategories.reduce<Record<RepairCategory, number>>((counts, category) => {
        counts[category] = pagePlans.filter((plan) => plan.actions.some((action) => action.category === category)).length
        return counts
      }, {} as Record<RepairCategory, number>),
      warnings: pagePlans.flatMap((plan) => plan.warnings),
    } satisfies TenantRepairPlan
  }, [pages, previewedAt, selectedCategories])

  const affectedPlans = useMemo(() => selectedPlan.pagePlans.filter((plan) => plan.actions.length > 0), [selectedPlan])
  const affectedPageKeys = useMemo(() => affectedPlans.map((plan) => getPageKey(plan.page)), [affectedPlans])
  const selectedPlans = useMemo(
    () => affectedPlans.filter((plan) => selectedPageKeys.includes(getPageKey(plan.page))),
    [affectedPlans, selectedPageKeys],
  )

  useEffect(() => {
    setSelectedPageKeys((currentKeys) => {
      if (currentKeys.length > 0) {
        return currentKeys.filter((key) => affectedPageKeys.includes(key))
      }
      return affectedPageKeys
    })
  }, [affectedPageKeys, selectedCategoriesKey])

  const handlePreview = () => {
    setPreviewedAt(new Date().toISOString())
    setNotice('Repair plan refreshed. No changes were written.')
    setLastResult(null)
  }

  const handleCategoryChange = (category: RepairCategory, checked: boolean) => {
    setSelectedCategories((current) => (
      checked
        ? Array.from(new Set([...current, category]))
        : current.filter((item) => item !== category)
    ))
    setPreviewedAt('')
    setLastResult(null)
  }

  const handlePageSelection = (pageKey: string, checked: boolean) => {
    setSelectedPageKeys((current) => (
      checked ? Array.from(new Set([...current, pageKey])) : current.filter((key) => key !== pageKey)
    ))
  }

  const applySelectedRepairs = async () => {
    if (!token || !currentTenant || applying) return

    if (selectedPlans.length === 0) {
      setError('Select at least one affected page before applying repairs.')
      return
    }

    if (selectedCategories.length === 0) {
      setError('Select at least one repair category before applying repairs.')
      return
    }

    const confirmed = window.confirm(
      `Apply ${selectedCategories.length} repair categor${selectedCategories.length === 1 ? 'y' : 'ies'} to ${selectedPlans.length} selected page${selectedPlans.length === 1 ? '' : 's'}? This updates metadata only and creates revision snapshots through the admin API.`,
    )
    if (!confirmed) return

    const actor = user?.username || user?.email || 'Pumpkin CMS Admin'
    const errors: string[] = []
    let updated = 0
    let skipped = 0

    try {
      setApplying(true)
      setError(null)
      setNotice(null)
      setLastResult(null)

      for (const plan of selectedPlans) {
        const repairResult = applyRepairsToPage(plan.page, selectedCategories, actor)
        if (repairResult.changedFields.length === 0) {
          skipped += 1
          continue
        }

        try {
          const updatedPage = await apiClient.updatePage(
            token,
            currentTenant.tenantId,
            plan.page.pageSlug,
            repairResult.page,
            {
              changeSource: METADATA_REPAIR_CHANGE_SOURCE,
              changeSummary: `Metadata repair: ${selectedCategories.join(', ')}`,
            },
          )
          updated += 1
          setPages((currentPages) => currentPages.map((page) => (
            getPageKey(page) === getPageKey(plan.page) ? updatedPage : page
          )))
        } catch (updateError) {
          errors.push(`${plan.page.pageSlug}: ${getErrorMessage(updateError, 'Update failed')}`)
        }
      }

      setLastResult({ updated, skipped, errors })
      setNotice(`Repair apply finished. Updated ${updated}, skipped ${skipped}, errors ${errors.length}.`)
      setPreviewedAt(new Date().toISOString())
      await loadPages()
    } finally {
      setApplying(false)
    }
  }

  if (isLoading) {
    return <StateCard title="Repair Actions" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Repair Actions" message="Please log in to repair tenant metadata." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Repair Actions" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Repair Actions" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Repair Actions" message="Select a tenant/site before previewing metadata repairs." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Static Publishing</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Page Quality Repair Actions</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Preview and apply safe metadata backfills for {currentTenant.name || currentTenant.tenantId}. Repairs update metadata, not editorial page copy or invented image alt text.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/publishing/action-center" className="btn btn-secondary">
              Action Center
            </Link>
            <Link href="/dashboard/publishing" className="btn btn-secondary">
              Back To Publishing
            </Link>
          </div>
        </div>
      </header>

      {loading && <div className="card text-sm text-neutral-600">Loading tenant pages...</div>}
      {error && <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>}
      {notice && <div className="card border-green-200 bg-green-50 text-sm text-green-800">{notice}</div>}

      {!loading && (
        <>
          <RepairSummary plan={fullPlan} selectedPlan={selectedPlan} />
          <RepairControls
            selectedCategories={selectedCategories}
            selectedCount={selectedPlans.length}
            affectedCount={affectedPlans.length}
            applying={applying}
            previewedAt={previewedAt}
            onCategoryChange={handleCategoryChange}
            onPreview={handlePreview}
            onSelectAllAffected={() => setSelectedPageKeys(affectedPlans.map((plan) => getPageKey(plan.page)))}
            onClearSelection={() => setSelectedPageKeys([])}
            onApply={applySelectedRepairs}
          />
          {lastResult && <ApplyResult result={lastResult} />}
          <RepairTable
            plans={selectedPlan.pagePlans}
            selectedPageKeys={selectedPageKeys}
            onPageSelection={handlePageSelection}
          />
        </>
      )}
    </div>
  )
}

function RepairSummary({ plan, selectedPlan }: { plan: TenantRepairPlan; selectedPlan: TenantRepairPlan }) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard label="Pages Scanned" value={plan.totalPagesScanned} />
      <MetricCard label="Pages With Selected Repairs" value={selectedPlan.pagePlans.filter((item) => item.actions.length > 0).length} tone="blue" />
      {REPAIR_CATEGORIES.slice(0, 8).map((category) => (
        <MetricCard key={category.key} label={category.label} value={plan.summary[category.key] || 0} tone={(plan.summary[category.key] || 0) > 0 ? 'amber' : 'neutral'} />
      ))}
      <MetricCard label={REPAIR_CATEGORIES[8].label} value={plan.summary[REPAIR_CATEGORIES[8].key] || 0} tone={(plan.summary[REPAIR_CATEGORIES[8].key] || 0) > 0 ? 'amber' : 'neutral'} />
    </section>
  )
}

function RepairControls({
  selectedCategories,
  selectedCount,
  affectedCount,
  applying,
  previewedAt,
  onCategoryChange,
  onPreview,
  onSelectAllAffected,
  onClearSelection,
  onApply,
}: {
  selectedCategories: RepairCategory[]
  selectedCount: number
  affectedCount: number
  applying: boolean
  previewedAt: string
  onCategoryChange: (category: RepairCategory, checked: boolean) => void
  onPreview: () => void
  onSelectAllAffected: () => void
  onClearSelection: () => void
  onApply: () => void
}) {
  return (
    <section className="card">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Repair Plan</h2>
        <p className="text-sm text-neutral-600">
          Dry-run preview is the default. Applying selected repairs uses the normal admin update endpoint and creates revision snapshots.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {REPAIR_CATEGORIES.map((category) => (
          <label key={category.key} className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-3">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category.key)}
              onChange={(event: ChangeEvent<HTMLInputElement>) => onCategoryChange(category.key, event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-900">{category.label}</span>
              <span className="mt-1 block text-xs text-neutral-600">{category.description}</span>
            </span>
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={onPreview} className="btn btn-secondary">
          Preview Repair Plan
        </button>
        <button type="button" onClick={onSelectAllAffected} className="btn btn-secondary">
          Select All Affected ({affectedCount})
        </button>
        <button type="button" onClick={onClearSelection} className="btn btn-secondary">
          Clear Selection
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={applying || selectedCount === 0 || selectedCategories.length === 0}
          className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          {applying ? 'Applying...' : `Apply Selected Repairs (${selectedCount})`}
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Repairs are metadata backfills only. They do not invent production page copy, provider claims, detailed image alt text, production form endpoints, or deployment history.
        {previewedAt && <span className="block mt-1">Last preview: {formatDateTime(previewedAt)}</span>}
      </div>
    </section>
  )
}

function RepairTable({
  plans,
  selectedPageKeys,
  onPageSelection,
}: {
  plans: PageRepairPlan[]
  selectedPageKeys: string[]
  onPageSelection: (pageKey: string, checked: boolean) => void
}) {
  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold text-neutral-900">Pages Needing Repairs</h2>
        <p className="text-sm text-neutral-600">Rows with no selected-category repairs are shown for context and are not selectable.</p>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <Th>Select</Th>
              <Th>Page</Th>
              <Th>Status</Th>
              <Th>Repair Categories</Th>
              <Th>Changed Fields Preview</Th>
              <Th>Warnings</Th>
              <Th>Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 bg-white">
            {plans.map((plan) => {
              const pageKey = getPageKey(plan.page)
              const hasRepairs = plan.actions.length > 0
              return (
                <tr key={pageKey} className="align-top hover:bg-neutral-50">
                  <Td>
                    <input
                      type="checkbox"
                      checked={selectedPageKeys.includes(pageKey)}
                      disabled={!hasRepairs}
                      onChange={(event) => onPageSelection(pageKey, event.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500 disabled:opacity-40"
                    />
                  </Td>
                  <Td>
                    <div className="font-medium text-neutral-900">{plan.page.MetaData?.title || 'Untitled page'}</div>
                    <code className="mt-1 inline-block rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700">{plan.page.pageSlug}</code>
                  </Td>
                  <Td>
                    <div>{plan.page.isPublished ? 'Published' : 'Draft/Unpublished'}</div>
                    <div className="mt-1 text-xs text-neutral-500">Sitemap: {plan.page.includeInSitemap ? 'Yes' : 'No'}</div>
                  </Td>
                  <Td>
                    {hasRepairs ? (
                      <div className="flex flex-wrap gap-1">
                        {plan.actions.map((action) => (
                          <span key={action.category} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            {action.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-500">No selected repairs</span>
                    )}
                  </Td>
                  <Td>
                    {hasRepairs ? (
                      <span className="text-xs text-neutral-700">
                        {plan.actions.flatMap((action) => action.changedFields).slice(0, 8).join(', ')}
                        {plan.actions.flatMap((action) => action.changedFields).length > 8 ? '...' : ''}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-500">None</span>
                    )}
                  </Td>
                  <Td>
                    {plan.warnings.length > 0 ? (
                      <div className="space-y-1">
                        {plan.warnings.slice(0, 3).map((warning) => (
                          <div key={warning} className="text-xs text-amber-800">{warning}</div>
                        ))}
                        {plan.warnings.length > 3 && <div className="text-xs text-neutral-500">+{plan.warnings.length - 3} more</div>}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-500">None</span>
                    )}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-2">
                      <Link href={getDetailUrl(plan.page)} className="text-xs font-medium text-primary-700 hover:text-primary-900">View</Link>
                      <Link href={getEditUrl(plan.page)} className="text-xs font-medium text-primary-700 hover:text-primary-900">Edit</Link>
                      <a href={getPreviewUrl(plan.page)} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary-700 hover:text-primary-900">Preview</a>
                    </div>
                  </Td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function ApplyResult({ result }: { result: { updated: number; skipped: number; errors: string[] } }) {
  return (
    <section className={`card ${result.errors.length > 0 ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}>
      <h2 className="text-lg font-semibold text-neutral-900">Apply Result</h2>
      <p className="mt-2 text-sm text-neutral-700">
        Updated {result.updated}, skipped {result.skipped}, errors {result.errors.length}.
      </p>
      {result.errors.length > 0 && (
        <div className="mt-3 space-y-1">
          {result.errors.map((error) => (
            <div key={error} className="text-sm text-amber-900">{error}</div>
          ))}
        </div>
      )}
    </section>
  )
}

function MetricCard({ label, value, tone = 'neutral' }: { label: string; value: number; tone?: 'neutral' | 'amber' | 'blue' }) {
  const toneClass = tone === 'amber'
    ? 'border-amber-200 bg-amber-50 text-amber-900'
    : tone === 'blue'
      ? 'border-blue-200 bg-blue-50 text-blue-900'
      : 'border-neutral-100 bg-white text-neutral-900'

  return (
    <div className={`rounded-xl border p-5 shadow-sm ${toneClass}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
    </div>
  )
}

function StateCard({ title, message, tone = 'neutral' }: { title: string; message: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`card ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-800' : ''}`}>
      <h1 className="text-2xl font-bold text-neutral-900">{title}</h1>
      <p className="mt-2 text-sm">{message}</p>
    </div>
  )
}

function Th({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-neutral-600">{children}</th>
}

function Td({ children }: { children: ReactNode }) {
  return <td className="max-w-sm px-4 py-3 text-neutral-700">{children}</td>
}

function getPageKey(page: Page) {
  return page.PageId || page.id || `${page.tenantId}-${page.pageSlug}`
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

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
