'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import type { MediaAsset, MediaAssetLicenseStatus, MediaAssetStatus, MediaAssetUsageStatus, MediaAssetUsageType } from 'pumpkin-ts-models'

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

const MEDIA_STATUSES: MediaAssetStatus[] = [
  'draft',
  'active',
  'archived',
  'replaced',
  'deleted-pending',
]

const USAGE_TYPES: MediaAssetUsageType[] = [
  'hero',
  'card',
  'gallery',
  'og-image',
  'icon',
  'background',
  'inline',
  'document',
]

interface Filters {
  search: string
  status: string
  siteKey: string
  usageType: string
  licenseStatus: string
  usageStatus: string
  tag: string
  missingAltOnly: boolean
  inUseOnly: boolean
}

const defaultFilters: Filters = {
  search: '',
  status: '',
  siteKey: '',
  usageType: '',
  licenseStatus: '',
  usageStatus: '',
  tag: '',
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
  usageType: MediaAssetUsageType
  tags: string
}

const defaultRegisterForm: RegisterForm = {
  url: '',
  title: '',
  alt: '',
  source: '',
  sourceUrl: '',
  licenseStatus: 'needs_review',
  usageType: 'inline',
  tags: '',
}

interface UploadForm {
  title: string
  altText: string
  caption: string
  credit: string
  license: string
  sourceUrl: string
  tags: string
  usageType: MediaAssetUsageType
  siteKey: string
}

const defaultUploadForm: UploadForm = {
  title: '',
  altText: '',
  caption: '',
  credit: '',
  license: '',
  sourceUrl: '',
  tags: '',
  usageType: 'inline',
  siteKey: '',
}

export default function MediaLibraryPage() {
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [registerForm, setRegisterForm] = useState<RegisterForm>(defaultRegisterForm)
  const [uploadForm, setUploadForm] = useState<UploadForm>(defaultUploadForm)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadInputKey, setUploadInputKey] = useState(0)

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

  async function uploadAsset() {
    if (!token || !currentTenant || uploading) return

    if (!uploadFile) {
      setError('Choose a JPEG, PNG, or WebP file before uploading.')
      return
    }

    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('title', uploadForm.title.trim())
    formData.append('altText', uploadForm.altText.trim())
    formData.append('caption', uploadForm.caption.trim())
    formData.append('credit', uploadForm.credit.trim())
    formData.append('license', uploadForm.license.trim())
    formData.append('sourceUrl', uploadForm.sourceUrl.trim())
    formData.append('tags', uploadForm.tags.trim())
    formData.append('usageType', uploadForm.usageType)
    formData.append('siteKey', uploadForm.siteKey.trim())

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)
      const savedAsset = await apiClient.uploadMediaAsset(token, currentTenant.tenantId, formData)
      setAssets((current) => [savedAsset, ...current.filter((asset) => asset.id !== savedAsset.id)])
      setUploadForm(defaultUploadForm)
      setUploadFile(null)
      setUploadInputKey((current) => current + 1)
      setSuccess(`Uploaded media asset ${savedAsset.assetId || savedAsset.id}.`)
    } catch (err) {
      console.error('[Media Library] Failed to upload media asset:', err)
      setError(getErrorMessage(err, 'Failed to upload media asset.'))
    } finally {
      setUploading(false)
    }
  }

  async function copyAssetUrl(asset: MediaAsset) {
    const url = getAssetUrl(asset)
    if (!url) return

    try {
      await navigator.clipboard.writeText(url)
      setSuccess('Public URL copied.')
    } catch {
      setError('Unable to copy public URL automatically.')
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
              Tenant-scoped image upload, metadata, lifecycle, storage, alt text, source, license, usage, and page-reference tracking.
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            Uploads use the configured media storage provider. Hard delete, Azure resource creation, and Cloudflare actions stay disabled.
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <Metric label="Total Assets" value={summary.total} />
          <Metric label="Needs License Review" value={summary.licenseReviewCount} />
          <Metric label="Missing Alt" value={summary.missingAltCount} />
          <Metric label="Archived/Replaced" value={summary.inactiveCount} />
        </div>
      </header>

      <section className="card">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Upload Image</h2>
            <p className="mt-1 text-sm text-neutral-600">
              Upload JPEG, PNG, or WebP media into tenant-scoped storage and create a MediaAsset record.
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Image File *</span>
            <input
              key={uploadInputKey}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </label>
          <TextInput label="Title" value={uploadForm.title} onChange={(value) => setUploadForm((current) => ({ ...current, title: value }))} />
          <TextInput label="Alt Text" value={uploadForm.altText} onChange={(value) => setUploadForm((current) => ({ ...current, altText: value }))} />
          <TextInput label="Caption" value={uploadForm.caption} onChange={(value) => setUploadForm((current) => ({ ...current, caption: value }))} />
          <TextInput label="Credit" value={uploadForm.credit} onChange={(value) => setUploadForm((current) => ({ ...current, credit: value }))} />
          <TextInput label="License/Source" value={uploadForm.license} onChange={(value) => setUploadForm((current) => ({ ...current, license: value }))} />
          <TextInput label="Source URL" value={uploadForm.sourceUrl} onChange={(value) => setUploadForm((current) => ({ ...current, sourceUrl: value }))} />
          <TextInput label="Site Key" value={uploadForm.siteKey} onChange={(value) => setUploadForm((current) => ({ ...current, siteKey: value }))} placeholder="ice-rink-rentals" />
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Usage Type</span>
            <select
              value={uploadForm.usageType}
              onChange={(event) => setUploadForm((current) => ({ ...current, usageType: event.target.value as MediaAssetUsageType }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {USAGE_TYPES.map((usageType) => (
                <option key={usageType} value={usageType}>{formatStatus(usageType)}</option>
              ))}
            </select>
          </label>
          <TextInput
            label="Tags"
            value={uploadForm.tags}
            onChange={(value) => setUploadForm((current) => ({ ...current, tags: value }))}
            placeholder="hero, seasonal, partner"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={uploadAsset}
            disabled={uploading}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Image'}
          </button>
          <p className="text-sm text-neutral-500">
            SVG upload is blocked. Azure Blob storage is configured later with placeholder app settings only.
          </p>
        </div>
      </section>

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
            <span className="text-sm font-medium text-neutral-700">Usage Type</span>
            <select
              value={registerForm.usageType}
              onChange={(event) => setRegisterForm((current) => ({ ...current, usageType: event.target.value as MediaAssetUsageType }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              {USAGE_TYPES.map((usageType) => (
                <option key={usageType} value={usageType}>{formatStatus(usageType)}</option>
              ))}
            </select>
          </label>
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
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
            <span className="text-sm font-medium text-neutral-700">Status</span>
            <select
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">All statuses</option>
              {MEDIA_STATUSES.map((status) => (
                <option key={status} value={status}>{formatStatus(status)}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">Usage Type</span>
            <select
              value={filters.usageType}
              onChange={(event) => setFilters((current) => ({ ...current, usageType: event.target.value }))}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            >
              <option value="">All types</option>
              {USAGE_TYPES.map((usageType) => (
                <option key={usageType} value={usageType}>{formatStatus(usageType)}</option>
              ))}
            </select>
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

          <TextInput
            label="Tag"
            value={filters.tag}
            onChange={(value) => setFilters((current) => ({ ...current, tag: value }))}
            placeholder="hero"
          />
          <TextInput
            label="Site Key"
            value={filters.siteKey}
            onChange={(value) => setFilters((current) => ({ ...current, siteKey: value }))}
            placeholder="ice-rink-rentals"
          />

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
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Alt</th>
                    <th className="px-4 py-3">License</th>
                    <th className="px-4 py-3">Usage</th>
                    <th className="px-4 py-3">Storage</th>
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
                          {getAssetUrl(asset) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={getAssetUrl(asset)} alt={getAssetAlt(asset) || asset.title || asset.fileName || 'Media asset preview'} className="h-16 w-24 rounded-md border border-neutral-200 object-cover" />
                          ) : (
                            <div className="flex h-16 w-24 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 text-xs text-neutral-500">No URL</div>
                          )}
                        </td>
                        <td className="max-w-xs px-4 py-3">
                          <div className="font-medium text-neutral-900">{asset.title || asset.originalFileName || asset.fileName || asset.assetId || 'Untitled asset'}</div>
                          <div className="mt-1 truncate text-xs text-neutral-500">{getAssetUrl(asset) || 'No URL'}</div>
                          {warnings.length > 0 && (
                            <div className="mt-2 text-xs font-medium text-amber-700">{warnings.length} warning{warnings.length === 1 ? '' : 's'}</div>
                          )}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={asset.status || 'draft'} /></td>
                        <td className="px-4 py-3 text-neutral-700">{formatStatus(asset.usageType || 'inline')}</td>
                        <td className="px-4 py-3 text-neutral-700">
                          {asset.decorative ? <span className="text-neutral-500">Decorative</span> : getAssetAlt(asset) || <span className="text-red-700">Missing</span>}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={asset.licenseStatus || 'unknown'} /></td>
                        <td className="px-4 py-3"><StatusBadge status={asset.usageStatus || 'unused'} /></td>
                        <td className="px-4 py-3 text-neutral-700">{formatStatus(asset.storageProvider || 'external')}</td>
                        <td className="px-4 py-3 text-neutral-700">{formatDimensions(asset)}</td>
                        <td className="px-4 py-3 text-neutral-700">{(asset.tags || []).join(', ') || 'None'}</td>
                        <td className="px-4 py-3 text-neutral-700">{(asset.usedByPages || asset.usageReferences || []).length}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <Link
                              href={`/dashboard/media/${encodeURIComponent(asset.id)}?tenantId=${encodeURIComponent(asset.tenantId)}`}
                              className="text-primary-700 hover:text-primary-900"
                            >
                              View/Edit
                            </Link>
                            {getAssetUrl(asset) && (
                              <button type="button" onClick={() => copyAssetUrl(asset)} className="text-left text-primary-700 hover:text-primary-900">
                                Copy URL
                              </button>
                            )}
                          </div>
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
    siteKey: '',
    assetId: '',
    status: 'draft',
    url: form.url.trim(),
    publicUrl: form.url.trim(),
    thumbnailUrl: '',
    fileName: '',
    originalFileName: '',
    safeFileName: '',
    title: form.title.trim(),
    alt: form.alt.trim(),
    altText: form.alt.trim(),
    caption: '',
    source: form.source.trim(),
    credit: form.source.trim(),
    license: '',
    sourceUrl: form.sourceUrl.trim(),
    usageType: form.usageType,
    licenseStatus: form.licenseStatus,
    usageStatus: 'unused',
    width: null,
    height: null,
    mimeType: '',
    extension: '',
    fileSize: null,
    sizeBytes: null,
    checksum: '',
    hash: '',
    storageProvider: 'external',
    storageContainer: '',
    blobPath: '',
    focalPoint: { x: null, y: null },
    decorative: false,
    tags: splitTags(form.tags),
    notes: '',
    variants: [],
    createdAt: '',
    updatedAt: '',
    createdBy: '',
    uploadedBy: '',
    lastReviewedAt: '',
    reviewedBy: '',
    usageReferences: [],
    usedByPages: [],
    replacedByMediaAssetId: '',
    archivedAt: '',
    archivedBy: '',
  }
}

function filterAssets(assets: MediaAsset[], filters: Filters) {
  const search = filters.search.trim().toLowerCase()
  const tag = filters.tag.trim().toLowerCase()
  const siteKey = filters.siteKey.trim().toLowerCase()

  return assets.filter((asset) => {
    if (filters.status && asset.status !== filters.status) return false
    if (filters.usageType && asset.usageType !== filters.usageType) return false
    if (filters.licenseStatus && asset.licenseStatus !== filters.licenseStatus) return false
    if (filters.usageStatus && asset.usageStatus !== filters.usageStatus) return false
    if (tag && !(asset.tags || []).some((assetTag) => assetTag.toLowerCase().includes(tag))) return false
    if (siteKey && !(asset.siteKey || '').toLowerCase().includes(siteKey)) return false
    if (filters.missingAltOnly && (asset.decorative || getAssetAlt(asset).trim())) return false
    if (filters.inUseOnly && asset.usageStatus !== 'in_use' && asset.usageStatus !== 'approved_for_publish' && (asset.usageReferences?.length || asset.usedByPages?.length || 0) === 0) return false

    if (!search) return true

    const searchText = [
      asset.assetId,
      getAssetUrl(asset),
      asset.fileName,
      asset.originalFileName,
      asset.safeFileName,
      asset.title,
      getAssetAlt(asset),
      asset.caption,
      asset.source,
      asset.credit,
      asset.license,
      asset.sourceUrl,
      asset.status,
      asset.usageType,
      asset.storageProvider,
      ...(asset.tags || []),
    ].join(' ').toLowerCase()

    return searchText.includes(search)
  })
}

function buildSummary(assets: MediaAsset[]) {
  return {
    total: assets.length,
    licenseReviewCount: assets.filter((asset) => asset.licenseStatus === 'unknown' || asset.licenseStatus === 'needs_review').length,
    missingAltCount: assets.filter((asset) => !asset.decorative && !getAssetAlt(asset).trim()).length,
    inUseCount: assets.filter((asset) => asset.usageStatus === 'in_use' || asset.usageStatus === 'approved_for_publish' || (asset.usageReferences?.length || asset.usedByPages?.length || 0) > 0).length,
    inactiveCount: assets.filter((asset) => asset.status === 'archived' || asset.status === 'replaced' || asset.status === 'deleted-pending').length,
  }
}

function getAssetWarnings(asset: MediaAsset) {
  const warnings: string[] = []
  if (getAssetUrl(asset) && !asset.decorative && !getAssetAlt(asset).trim()) warnings.push('Missing alt text')
  if (asset.licenseStatus === 'unknown' || asset.licenseStatus === 'needs_review') warnings.push('License needs review')
  if (asset.status === 'archived') warnings.push('Archived asset')
  if (asset.status === 'replaced') warnings.push('Replaced asset')
  if (getAssetUrl(asset) && !asset.source?.trim() && !asset.credit?.trim()) warnings.push('Source missing')
  if (getAssetUrl(asset) && (!asset.width || !asset.height)) warnings.push('Dimensions missing')
  if ((asset.usageReferences?.length || 0) > 0 && !['approved', 'owned', 'licensed', 'partner_provided'].includes(asset.licenseStatus)) {
    warnings.push('Used asset is not license-approved')
  }
  return warnings
}

function getAssetUrl(asset: MediaAsset) {
  return asset.publicUrl || asset.url || ''
}

function getAssetAlt(asset: MediaAsset) {
  return asset.altText || asset.alt || ''
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
