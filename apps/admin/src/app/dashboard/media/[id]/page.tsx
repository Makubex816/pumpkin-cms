'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
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

export default function MediaAssetDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const { token, currentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()
  const [asset, setAsset] = useState<MediaAsset | null>(null)
  const [draft, setDraft] = useState<MediaAsset | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [copyMessage, setCopyMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const id = decodeURIComponent(params.id)
  const routeTenantId = searchParams.get('tenantId') || currentTenant?.tenantId || ''
  const canLoad = Boolean(token && routeTenantId && currentTenant && routeTenantId === currentTenant.tenantId)

  useEffect(() => {
    let isCurrent = true

    async function loadAsset() {
      if (!token || !routeTenantId || !currentTenant) {
        setAsset(null)
        setDraft(null)
        setLoading(false)
        return
      }

      if (routeTenantId !== currentTenant.tenantId) {
        setError('This media asset belongs to a different tenant context. Switch tenants to view it.')
        setAsset(null)
        setDraft(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const loadedAsset = await apiClient.getMediaAsset(token, routeTenantId, id)
        if (isCurrent) {
          setAsset(loadedAsset)
          setDraft(normalizeMediaAssetDraft(loadedAsset))
        }
      } catch (err) {
        console.error('[Media Detail] Failed to load media asset:', err)
        if (isCurrent) {
          setError(getErrorMessage(err, 'Failed to load media asset.'))
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    loadAsset()

    return () => {
      isCurrent = false
    }
  }, [token, currentTenant, routeTenantId, id])

  const warnings = useMemo(() => draft ? getAssetWarnings(draft) : [], [draft])

  async function saveAsset() {
    if (!token || !routeTenantId || !draft || saving) return

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)
      const savedAsset = await apiClient.updateMediaAsset(token, routeTenantId, draft.id, draft)
      setAsset(savedAsset)
      setDraft(normalizeMediaAssetDraft(savedAsset))
      setSuccess('Media asset metadata saved.')
    } catch (err) {
      console.error('[Media Detail] Failed to update media asset:', err)
      setError(getErrorMessage(err, 'Failed to update media asset.'))
    } finally {
      setSaving(false)
    }
  }

  async function copyUrl() {
    if (!draft?.url) return

    try {
      await navigator.clipboard.writeText(draft.url)
      setCopyMessage('URL copied.')
    } catch {
      setCopyMessage('Unable to copy URL automatically.')
    }
  }

  function updateDraft<K extends keyof MediaAsset>(key: K, value: MediaAsset[K]) {
    setDraft((current) => current ? { ...current, [key]: value } : current)
  }

  function updateFocalPoint(key: 'x' | 'y', value: string) {
    setDraft((current) => {
      if (!current) return current
      return {
        ...current,
        focalPoint: {
          ...(current.focalPoint || { x: null, y: null }),
          [key]: parseNullableNumber(value),
        },
      }
    })
  }

  if (isLoading) {
    return <StateCard title="Media Asset" message="Loading admin session..." />
  }

  if (!token) {
    return <StateCard title="Media Asset" message="Please log in to manage media assets." />
  }

  if (!currentTenant && isLoadingTenants) {
    return <StateCard title="Media Asset" message="Loading tenant context..." />
  }

  if (!currentTenant && tenantLoadError) {
    return <StateCard title="Media Asset" message={`Tenant list failed to load: ${tenantLoadError}`} tone="error" />
  }

  if (!currentTenant) {
    return <StateCard title="Media Asset" message="Select a tenant/site before viewing this asset." />
  }

  return (
    <div className="space-y-6">
      <header className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">Media Asset</p>
            <h1 className="mt-1 break-words text-3xl font-bold text-neutral-900">
              {draft?.title || draft?.fileName || draft?.assetId || 'Media Asset'}
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Metadata-only asset record for {currentTenant.name || currentTenant.tenantId}.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/media" className="btn btn-secondary">Back to Media</Link>
            {draft?.url && (
              <button type="button" onClick={copyUrl} className="btn btn-secondary">
                Copy URL
              </button>
            )}
          </div>
        </div>
      </header>

      {!canLoad && (
        <div className="card border-amber-200 bg-amber-50 text-sm text-amber-900">
          Switch to tenant `{routeTenantId}` to view this media asset. Cross-tenant asset viewing is blocked.
        </div>
      )}

      {loading && <div className="card text-sm text-neutral-600">Loading media asset...</div>}
      {error && <div className="card border-red-200 bg-red-50 text-sm text-red-800">{error}</div>}
      {success && <div className="card border-green-200 bg-green-50 text-sm text-green-800">{success}</div>}
      {copyMessage && <div className="card border-blue-200 bg-blue-50 text-sm text-blue-800">{copyMessage}</div>}

      {!loading && draft && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="space-y-6 xl:col-span-2">
            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Metadata</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ReadOnlyInput label="Asset ID" value={draft.assetId || draft.id} />
                <TextInput label="URL" value={draft.url} onChange={(value) => updateDraft('url', value)} required />
                <TextInput label="Title" value={draft.title} onChange={(value) => updateDraft('title', value)} />
                <TextInput label="File Name" value={draft.fileName} onChange={(value) => updateDraft('fileName', value)} />
                <TextInput label="Alt Text" value={draft.alt} onChange={(value) => updateDraft('alt', value)} />
                <TextInput label="Caption" value={draft.caption} onChange={(value) => updateDraft('caption', value)} />
                <TextInput label="Source" value={draft.source} onChange={(value) => updateDraft('source', value)} />
                <TextInput label="Source URL" value={draft.sourceUrl} onChange={(value) => updateDraft('sourceUrl', value)} />
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Publishing Review</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <SelectInput
                  label="License Status"
                  value={draft.licenseStatus}
                  options={LICENSE_STATUSES}
                  onChange={(value) => updateDraft('licenseStatus', value as MediaAssetLicenseStatus)}
                />
                <SelectInput
                  label="Usage Status"
                  value={draft.usageStatus}
                  options={USAGE_STATUSES}
                  onChange={(value) => updateDraft('usageStatus', value as MediaAssetUsageStatus)}
                />
                <TextInput label="Last Reviewed At" value={draft.lastReviewedAt} onChange={(value) => updateDraft('lastReviewedAt', value)} />
                <TextInput label="Reviewed By" value={draft.reviewedBy} onChange={(value) => updateDraft('reviewedBy', value)} />
                <CheckboxInput label="Decorative image" checked={draft.decorative} onChange={(value) => updateDraft('decorative', value)} />
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">File Details And Focal Point</h2>
              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <TextInput label="Width" value={nullableNumberValue(draft.width)} onChange={(value) => updateDraft('width', parseNullableInteger(value))} />
                <TextInput label="Height" value={nullableNumberValue(draft.height)} onChange={(value) => updateDraft('height', parseNullableInteger(value))} />
                <TextInput label="MIME Type" value={draft.mimeType} onChange={(value) => updateDraft('mimeType', value)} />
                <TextInput label="File Size" value={nullableNumberValue(draft.fileSize)} onChange={(value) => updateDraft('fileSize', parseNullableInteger(value))} />
                <TextInput label="Focal Point X (0-1)" value={nullableNumberValue(draft.focalPoint?.x)} onChange={(value) => updateFocalPoint('x', value)} />
                <TextInput label="Focal Point Y (0-1)" value={nullableNumberValue(draft.focalPoint?.y)} onChange={(value) => updateFocalPoint('y', value)} />
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Organization</h2>
              <div className="mt-4 grid grid-cols-1 gap-4">
                <TextInput
                  label="Tags"
                  value={(draft.tags || []).join(', ')}
                  onChange={(value) => updateDraft('tags', splitTags(value))}
                  placeholder="hero, seasonal, partner"
                />
                <TextArea label="Notes" value={draft.notes} onChange={(value) => updateDraft('notes', value)} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={saveAsset}
                disabled={saving}
                className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Metadata'}
              </button>
              <Link href="/dashboard/media" className="btn btn-secondary">Cancel</Link>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Preview</h2>
              <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                {draft.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={draft.url} alt={draft.alt || draft.title || draft.fileName || 'Media asset preview'} className="max-h-80 w-full object-contain" />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-neutral-500">No URL</div>
                )}
              </div>
              <div className="mt-3 break-all text-xs text-neutral-500">{draft.url || 'No URL recorded'}</div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Warnings</h2>
              {warnings.length === 0 ? (
                <p className="mt-3 text-sm text-green-700">No MVP media warnings for this asset.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-amber-900">
                  {warnings.map((warning) => (
                    <li key={warning} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">{warning}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Usage References</h2>
              {(draft.usageReferences || []).length === 0 ? (
                <p className="mt-3 text-sm text-neutral-600">
                  No explicit page usage references are recorded yet. Page-level `assetId` fields can point to this asset.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {draft.usageReferences.map((reference, index) => (
                    <div key={`${reference.pageSlug}-${reference.fieldPath}-${index}`} className="rounded-lg border border-neutral-200 p-3 text-sm">
                      <div className="font-medium text-neutral-900">{reference.pageSlug || reference.pageId || 'Unknown page'}</div>
                      <div className="mt-1 text-neutral-600">{reference.fieldPath || 'No field path'}</div>
                      <div className="mt-1 text-xs text-neutral-500">{reference.blockType || 'Block not recorded'} - {reference.imageRole || 'Role not recorded'}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-neutral-900">Record</h2>
              <div className="mt-3 space-y-3 text-sm">
                <ReadOnlyRow label="Record ID" value={draft.id} />
                <ReadOnlyRow label="Tenant ID" value={draft.tenantId} />
                <ReadOnlyRow label="Created" value={formatDateTime(draft.createdAt)} />
                <ReadOnlyRow label="Updated" value={formatDateTime(draft.updatedAt)} />
                <ReadOnlyRow label="Created By" value={draft.createdBy || 'Not recorded'} />
              </div>
            </div>
          </aside>
        </div>
      )}

      {!loading && !draft && asset === null && !error && (
        <div className="card text-sm text-neutral-600">Media asset not found.</div>
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

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
    </label>
  )
}

function ReadOnlyInput({ label, value }: { label: string; value: string }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <input value={value} readOnly className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600" />
    </label>
  )
}

function SelectInput({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-neutral-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        {options.map((option) => (
          <option key={option} value={option}>{formatStatus(option)}</option>
        ))}
      </select>
    </label>
  )
}

function CheckboxInput({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 pt-6 text-sm font-medium text-neutral-700">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  )
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words text-neutral-900">{value}</div>
    </div>
  )
}

function normalizeMediaAssetDraft(asset: MediaAsset): MediaAsset {
  return {
    ...asset,
    focalPoint: asset.focalPoint || { x: null, y: null },
    tags: asset.tags || [],
    usageReferences: asset.usageReferences || [],
  }
}

function getAssetWarnings(asset: MediaAsset) {
  const warnings: string[] = []
  if (asset.url && !asset.decorative && !asset.alt?.trim()) warnings.push('Missing alt text for non-decorative asset.')
  if (asset.licenseStatus === 'unknown' || asset.licenseStatus === 'needs_review') warnings.push('License status needs review before production use.')
  if (asset.url && !asset.source?.trim()) warnings.push('Image source is missing.')
  if (asset.url && (!asset.width || !asset.height)) warnings.push('Image dimensions are missing.')
  if ((asset.usageReferences?.length || 0) > 0 && !['approved', 'owned', 'licensed', 'partner_provided'].includes(asset.licenseStatus)) {
    warnings.push('This asset is referenced but license status is not approved, owned, licensed, or partner provided.')
  }
  return warnings
}

function splitTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function parseNullableInteger(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number.parseInt(trimmed, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function parseNullableNumber(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const parsed = Number.parseFloat(trimmed)
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : null
}

function nullableNumberValue(value: number | null | undefined) {
  return value == null ? '' : String(value)
}

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Not recorded'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
