'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { MediaAsset, MediaAssetLicenseStatus, MediaAssetUsageStatus } from 'pumpkin-ts-models'

const LICENSE_STATUSES: MediaAssetLicenseStatus[] = [
  'unknown',
  'needs_review',
  'approved',
  'rejected',
  'owned',
  'licensed',
  'ai_generated',
  'partner_provided',
]

const USAGE_STATUSES: MediaAssetUsageStatus[] = [
  'unused',
  'in_use',
  'needs_review',
  'approved_for_publish',
]

interface Filters {
  search: string
  licenseStatus: string
  usageStatus: string
  missingAltOnly: boolean
  inUseOnly: boolean
}

const defaultFilters: Filters = {
  search: '',
  licenseStatus: '',
  usageStatus: '',
  missingAltOnly: false,
  inUseOnly: false,
}

interface RegisterForm {
  url: string
  title: string
  alt: string
  source: string
  sourceUrl: string
  licenseStatus: MediaAssetLicenseStatus
  tags: string
}

const defaultRegisterForm: RegisterForm = {
  url: '',
  title: '',
  alt: '',
  source: '',
  sourceUrl: '',
  licenseStatus: 'needs_review',
  tags: '',
}

export default function MediaLibraryPage() {
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [registerForm, setRegisterForm] = useState<RegisterForm>(defaultRegisterForm)

  useEffect(() => {
    let isCurrent = true

    async function loadAssets() {
      if (!token || !currentTenant) {
        setAssets([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const tenantAssets = await apiClient.getMediaAssets(token, currentTenant.tenantId)
        if (isCurrent) {
          setAssets(tenantAssets)
        }
      } catch (err) {
        console.error('[Media Library] Failed to load media assets:', err)
        if (isCurrent) {
          setError(getErrorMessage(err, 'Failed to load media assets. Confirm the MediaAsset container exists locally.'))
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadAssets()

    return () => {
      isCurrent = false
    }
  }, [token, currentTenant])

  const filteredAssets = useMemo(() => filterAssets(assets, filters), [assets, filters])
  const summary = useMemo(() => buildSummary(assets), [assets])

  async function registerAsset() {
    if (!token || !currentTenant || saving) return

    const url = registerForm.url.trim()
    if (!url) {
      setError('Asset URL is required.')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const mediaAsset = createMediaAssetPayload(registerForm, currentTenant.tenantId)
      const savedAsset = await apiClient.createMediaAsset(token, currentTenant.tenantId, mediaAsset)
      setAssets((current) => [savedAsset, ...current.filter((asset) => asset.id !== savedAsset.id)])
      setRegisterForm(defaultRegisterForm)
      setSuccess(`Registered media asset ${savedAsset.assetId || savedAsset.id}.`)
    } catch (err) {
      console.error('[Media Library] Failed to register media asset:', err)
      setError(getErrorMessage(err, 'Failed to register media asset.'))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <StateCard title="Media" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Media" message="Please log in to manage media assets." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Media" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Media" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Media" message="Select a tenant/site before managing media assets." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Media Library</p>
            <h1 className="mt-1 text-3xl font-bold text-neutral-900">Asset Manager</h1>
            <p className="mt-2 max-w-3xl text-sm text-neutral-600">
              Tenant-scoped metadata for existing image URLs. This MVP tracks alt text, source, license status,
              focal point, usage state, and page references without uploading files.
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            No binary upload, hard delete, Azure deployment, or Cloudflare action exists in this phase.
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Metric label="Total Assets" value={summary.total} />
          <Metric label="Needs License Review" value={summary.licenseReviewCount} />
          <Metric label="Missing Alt" value={summary.missingAltCount} />
          <Metric label="In Use" value={summary.inUseCount} />
        </div>
      </header>

      <section className="card">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Register Existing URL</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Create a metadata record for an image that is already hosted elsewhere or available as a site-relative path.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TextInput label="URL" value={registerForm.url} onChange={(value) => setRegisterForm((current) => ({ ...current, url: value }))} required />
          <TextInput label="Title" value={registerForm.title} onChange={(value) => setRegisterForm((current) => ({ ...current, title: value }))} />
          <TextInput label="Alt Text" value={registerForm.alt} onChange={(value) => setRegisterForm((current) => ({ ...current, alt: value }))} />
          <TextInput label="Source" value={registerForm.source} onChange={(value) => setRegisterForm((current) => ({ ...current, source: value }))} />
          <TextInput label="Source URL" value={registerForm.sourceUrl} onChange={(value) => setRegisterForm((current) => ({ ...current, sourceUrl: value }))} />
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">License Status</span>
            <select
              value={registerForm.licenseStatus}
              onChange={(event) => setRegisterForm((current) => ({ ...current, licenseStatus: event.target.value as MediaAssetLicenseStatus }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {LICENSE_STATUSES.map((status) => (
                <option key={status} value={status}>{formatStatus(status)}</option>
              ))}
            </select>
          </label>
          <TextInput
            label="Tags"
            value={registerForm.tags}
            onChange={(value) => setRegisterForm((current) => ({ ...current, tags: value }))}
            placeholder="hero, seasonal, partner"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={registerAsset}
            disabled={saving}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Registering...' : 'Register Asset'}
          </button>
          <p className="text-sm text-neutral-500">Registering stores metadata only. It does not copy or host the image.</p>
        </div>
      </section>

      {error && <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>}
      {success && <div className="card border-green-200 bg-green-50 text-sm text-green-800">{success}</div>}

      <section className="card">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          <label className="block lg:col-span-2">
            <span className="text-sm font-medium text-neutral-700">Search</span>
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              placeholder="Title, URL, alt, source, tag"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">License</span>
            <select
              value={filters.licenseStatus}
              onChange={(event) => setFilters((current) => ({ ...current, licenseStatus: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">All licenses</option>
              {LICENSE_STATUSES.map((status) => (
                <option key={status} value={status}>{formatStatus(status)}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Usage</span>
            <select
              value={filters.usageStatus}
              onChange={(event) => setFilters((current) => ({ ...current, usageStatus: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">All usage</option>
              {USAGE_STATUSES.map((status) => (
                <option key={status} value={status}>{formatStatus(status)}</option>
              ))}
            </select>
          </label>

          <div className="space-y-2 pt-6 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.missingAltOnly}
                onChange={(event) => setFilters((current) => ({ ...current, missingAltOnly: event.target.checked }))}
              />
              Missing alt
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.inUseOnly}
                onChange={(event) => setFilters((current) => ({ ...current, inUseOnly: event.target.checked }))}
              />
              In use
            </label>
          </div>
        </div>
      </section>

      {loading && <div className="card text-sm text-neutral-600">Loading media assets...</div>}

      {!loading && assets.length === 0 && !error && (
        <div className="card">
          <h2 className="text-lg font-semibold text-neutral-900">No Media Assets Yet</h2>
          <p className="mt-2 text-sm text-neutral-600">
            Register an existing image URL to start tracking alt text, license state, and usage metadata for this tenant.
          </p>
        </div>
      )}

      {!loading && assets.length > 0 && (
        <section className="card overflow-hidden">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">Assets</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Showing {filteredAssets.length} of {assets.length} tenant media records.
            </p>
          </div>

          {filteredAssets.length === 0 ? (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
              No assets match the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 text-sm">
                <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="px-4 py-3">Preview</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3">Alt</th>
                    <th className="px-4 py-3">License</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Dimensions</th>
                    <th className="px-4 py-3">Tags</th>
                    <th className="px-4 py-3">Refs</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {filteredAssets.map((asset) => {
                    const warnings = getAssetWarnings(asset)
                    return (
                      <tr key={asset.id}>
                        <td className="px-4 py-3">
                          {asset.url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={asset.url} alt={asset.alt || asset.title || asset.fileName || 'Media asset preview'} className="h-16 w-24 rounded-md border border-neutral-200 object-cover" />
                          ) : (
                            <div className="flex h-16 w-24 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-xs text-neutral-500">No URL</div>
                          )}
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          <div className="font-medium text-neutral-900">{asset.title || asset.fileName || asset.assetId || 'Untitled asset'}</div>
                          <div className="mt-1 truncate text-xs text-neutral-500">{asset.url || 'No URL'}</div>
                          {warnings.length > 0 && (
                            <div className="mt-2 text-xs font-medium text-amber-700">{warnings.length} warning{warnings.length === 1 ? '' : 's'}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-700">
                          {asset.decorative ? <span className="text-neutral-500">Decorative</span> : asset.alt || <span className="text-red-700">Missing</span>}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={asset.licenseStatus || 'unknown'} /></td>
                        <td className="px-4 py-3"><StatusBadge status={asset.usageStatus || 'unused'} /></td>
                        <td className="px-4 py-3 text-neutral-700">{formatDimensions(asset)}</td>
                        <td className="px-4 py-3 text-neutral-700">{(asset.tags || []).join(', ') || 'None'}</td>
                        <td className="px-4 py-3 text-neutral-700">{asset.usageReferences?.length || 0}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/dashboard/media/${encodeURIComponent(asset.id)}?tenantId=${encodeURIComponent(asset.tenantId)}`}
                            className="text-primary-700 hover:text-primary-900"
                          >
                            View/Edit
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function StateCard({ title, message, tone = 'neutral' }: { title: string; message: string; tone?: 'neutral' | 'error' }) {
  return (
    <div className={`card ${tone === 'error' ? 'border-red-200 bg-red-50' : ''}`}>
      <h1 className={`text-2xl font-bold ${tone === 'error' ? 'text-red-900' : 'text-neutral-900'}`}>{title}</h1>
      <p className={`mt-2 ${tone === 'error' ? 'text-red-800' : 'text-neutral-600'}`}>{message}</p>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-bold text-neutral-900">{value}</div>
    </div>
  )
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-700"> *</span>}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        placeholder={placeholder}
      />
    </label>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = status === 'approved' || status === 'owned' || status === 'licensed' || status === 'approved_for_publish'
    ? 'border-green-200 bg-green-50 text-green-800'
    : status === 'rejected'
      ? 'border-red-200 bg-red-50 text-red-800'
      : status === 'unknown' || status === 'needs_review'
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : 'border-neutral-200 bg-neutral-50 text-neutral-700'

  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${styles}`}>
      {formatStatus(status)}
    </span>
  )
}

function createMediaAssetPayload(form: RegisterForm, tenantId: string): MediaAsset {
  return {
    id: '',
    tenantId,
    assetId: '',
    url: form.url.trim(),
    fileName: '',
    title: form.title.trim(),
    alt: form.alt.trim(),
    caption: '',
    source: form.source.trim(),
    sourceUrl: form.sourceUrl.trim(),
    licenseStatus: form.licenseStatus,
    usageStatus: 'unused',
    width: null,
    height: null,
    mimeType: '',
    fileSize: null,
    focalPoint: { x: null, y: null },
    decorative: false,
    tags: splitTags(form.tags),
    notes: '',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
    lastReviewedAt: '',
    reviewedBy: '',
    usageReferences: [],
  }
}

function filterAssets(assets: MediaAsset[], filters: Filters) {
  const search = filters.search.trim().toLowerCase()

  return assets.filter((asset) => {
    if (filters.licenseStatus && asset.licenseStatus !== filters.licenseStatus) return false
    if (filters.usageStatus && asset.usageStatus !== filters.usageStatus) return false
    if (filters.missingAltOnly && (asset.decorative || asset.alt?.trim())) return false
    if (filters.inUseOnly && asset.usageStatus !== 'in_use' && asset.usageStatus !== 'approved_for_publish' && (asset.usageReferences?.length || 0) === 0) return false

    if (!search) return true

    const searchText = [
      asset.assetId,
      asset.url,
      asset.fileName,
      asset.title,
      asset.alt,
      asset.caption,
      asset.source,
      asset.sourceUrl,
      ...(asset.tags || []),
    ].join(' ').toLowerCase()

    return searchText.includes(search)
  })
}

function buildSummary(assets: MediaAsset[]) {
  return {
    total: assets.length,
    licenseReviewCount: assets.filter((asset) => asset.licenseStatus === 'unknown' || asset.licenseStatus === 'needs_review').length,
    missingAltCount: assets.filter((asset) => !asset.decorative && !asset.alt?.trim()).length,
    inUseCount: assets.filter((asset) => asset.usageStatus === 'in_use' || asset.usageStatus === 'approved_for_publish' || (asset.usageReferences?.length || 0) > 0).length,
  }
}

function getAssetWarnings(asset: MediaAsset) {
  const warnings: string[] = []
  if (asset.url && !asset.decorative && !asset.alt?.trim()) warnings.push('Missing alt text')
  if (asset.licenseStatus === 'unknown' || asset.licenseStatus === 'needs_review') warnings.push('License needs review')
  if (asset.url && !asset.source?.trim()) warnings.push('Source missing')
  if (asset.url && (!asset.width || !asset.height)) warnings.push('Dimensions missing')
  if ((asset.usageReferences?.length || 0) > 0 && !['approved', 'owned', 'licensed', 'partner_provided'].includes(asset.licenseStatus)) {
    warnings.push('Used asset is not license-approved')
  }
  return warnings
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function formatDimensions(asset: MediaAsset) {
  if (!asset.width || !asset.height) return 'Unknown'
  return `${asset.width} x ${asset.height}`
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
