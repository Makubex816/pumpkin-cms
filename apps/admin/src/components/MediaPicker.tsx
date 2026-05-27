'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/lib/api'
import type { MediaAsset } from 'pumpkin-ts-models'

interface MediaPickerProps {
  token: string | null
  tenantId: string
  selectedAssetId?: string
  buttonLabel?: string
  panelTitle?: string
  onSelect: (asset: MediaAsset) => void
}

const APPROVED_LICENSE_STATUSES = new Set(['approved', 'owned', 'licensed', 'ai_generated', 'partner_provided'])

export default function MediaPicker({
  token,
  tenantId,
  selectedAssetId,
  buttonLabel = 'Select from Media Library',
  panelTitle = 'Media Library',
  onSelect,
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [assets, setAssets] = useState<MediaAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [usageType, setUsageType] = useState('')
  const [tag, setTag] = useState('')
  const [licenseStatus, setLicenseStatus] = useState('')
  const [usageStatus, setUsageStatus] = useState('')

  useEffect(() => {
    let isCurrent = true

    async function loadAssets() {
      if (!isOpen || !token || !tenantId) return

      try {
        setLoading(true)
        setError(null)
        const tenantAssets = await apiClient.getMediaAssets(token, tenantId)
        if (isCurrent) {
          setAssets(tenantAssets)
        }
      } catch (loadError) {
        console.error('[MediaPicker] Failed to load media assets:', loadError)
        if (isCurrent) {
          setError(getErrorMessage(loadError, 'Failed to load Media Library assets.'))
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
  }, [isOpen, token, tenantId])

  const filteredAssets = useMemo(() => {
    const query = search.trim().toLowerCase()

    return assets.filter((asset) => {
      if (asset.tenantId && asset.tenantId !== tenantId) return false
      if (status && asset.status !== status) return false
      if (usageType && asset.usageType !== usageType) return false
      if (licenseStatus && asset.licenseStatus !== licenseStatus) return false
      if (usageStatus && asset.usageStatus !== usageStatus) return false
      if (tag.trim() && !(asset.tags || []).some((assetTag) => assetTag.toLowerCase().includes(tag.trim().toLowerCase()))) return false
      if (!query) return true

      return [
        asset.id,
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
        asset.usageType,
        asset.status,
        asset.sourceUrl,
        ...(asset.tags || []),
      ].join(' ').toLowerCase().includes(query)
    })
  }, [assets, licenseStatus, search, status, tag, tenantId, usageStatus, usageType])

  const licenseOptions = useMemo(() => uniqueOptions(assets.map((asset) => asset.licenseStatus)), [assets])
  const usageOptions = useMemo(() => uniqueOptions(assets.map((asset) => asset.usageStatus)), [assets])
  const statusOptions = useMemo(() => uniqueOptions(assets.map((asset) => asset.status || 'draft')), [assets])
  const usageTypeOptions = useMemo(() => uniqueOptions(assets.map((asset) => asset.usageType || 'inline')), [assets])

  function selectAsset(asset: MediaAsset) {
    if (asset.tenantId && asset.tenantId !== tenantId) return
    onSelect(asset)
    setIsOpen(false)
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        disabled={!token || !tenantId}
        className="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isOpen ? 'Close Media Picker' : buttonLabel}
      </button>

      {isOpen && (
        <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h3 className="text-base font-semibold text-neutral-900">{panelTitle}</h3>
              <p className="mt-1 text-sm text-neutral-600">
                Select a tenant-scoped MediaAsset. This copies the asset id, public URL, alt text, and publishing metadata into the page.
              </p>
            </div>
            <a
              href="/dashboard/media"
              className="text-sm font-medium text-primary-700 hover:text-primary-900"
            >
              Open Media Library
            </a>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-6">
            <label className="block lg:col-span-2">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">Search</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input text-sm"
                placeholder="Title, URL, alt, source, tag"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">License</span>
              <select value={licenseStatus} onChange={(event) => setLicenseStatus(event.target.value)} className="input text-sm">
                <option value="">All licenses</option>
                {licenseOptions.map((status) => (
                  <option key={status} value={status}>{formatStatus(status)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)} className="input text-sm">
                <option value="">All statuses</option>
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{formatStatus(option)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">Type</span>
              <select value={usageType} onChange={(event) => setUsageType(event.target.value)} className="input text-sm">
                <option value="">All types</option>
                {usageTypeOptions.map((option) => (
                  <option key={option} value={option}>{formatStatus(option)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">Usage</span>
              <select value={usageStatus} onChange={(event) => setUsageStatus(event.target.value)} className="input text-sm">
                <option value="">All usage</option>
                {usageOptions.map((status) => (
                  <option key={status} value={status}>{formatStatus(status)}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">Tag</span>
              <input
                value={tag}
                onChange={(event) => setTag(event.target.value)}
                className="input text-sm"
                placeholder="hero"
              />
            </label>
          </div>

          {loading && (
            <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              Loading media assets...
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}

          {!loading && !error && filteredAssets.length === 0 && (
            <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
              No matching media assets are registered for this tenant.
            </div>
          )}

          {!loading && !error && filteredAssets.length > 0 && (
            <div className="mt-4 max-h-96 space-y-3 overflow-auto pr-1">
              {filteredAssets.map((asset) => {
                const referenceId = getMediaAssetReference(asset)
                const selected = selectedAssetId
                  ? selectedAssetId === asset.id || selectedAssetId === asset.assetId || selectedAssetId === referenceId
                  : false
                const warnings = getAssetWarnings(asset)

                return (
                  <div
                    key={asset.id || referenceId}
                    className={`rounded-lg border p-3 ${selected ? 'border-primary-300 bg-primary-50' : 'border-neutral-200 bg-neutral-50'}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start">
                      <AssetThumb asset={asset} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="break-words text-sm font-semibold text-neutral-900">
                            {asset.title || asset.fileName || asset.assetId || 'Untitled asset'}
                          </h4>
                          {selected && (
                            <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-800">
                              Selected
                            </span>
                          )}
                        </div>
                        <p className="mt-1 break-all font-mono text-xs text-neutral-600">{getAssetUrl(asset)}</p>
                        <dl className="mt-2 grid grid-cols-1 gap-2 text-xs text-neutral-700 md:grid-cols-2">
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-neutral-500">assetId</dt>
                            <dd className="break-words font-mono">{referenceId || 'Not set'}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-neutral-500">Alt</dt>
                            <dd>{getAssetAlt(asset) || 'Missing alt text'}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-neutral-500">Status</dt>
                            <dd>{formatStatus(asset.status || 'draft')}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-neutral-500">Type</dt>
                            <dd>{formatStatus(asset.usageType || 'inline')}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-neutral-500">License</dt>
                            <dd>{formatStatus(asset.licenseStatus || 'unknown')}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold uppercase tracking-wide text-neutral-500">Usage</dt>
                            <dd>{formatStatus(asset.usageStatus || 'unused')}</dd>
                          </div>
                        </dl>
                        {warnings.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {warnings.map((warning) => (
                              <span key={warning} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                                {warning}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => selectAsset(asset)}
                        disabled={asset.status === 'archived' || asset.status === 'deleted-pending' || Boolean(asset.tenantId && asset.tenantId !== tenantId)}
                        className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50 md:self-center"
                      >
                        Use Asset
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function getMediaAssetReference(asset: MediaAsset) {
  return asset.assetId || asset.id
}

function AssetThumb({ asset }: { asset: MediaAsset }) {
  const url = getAssetUrl(asset)
  if (!url) {
    return (
      <div className="flex h-20 w-28 items-center justify-center rounded-md border border-neutral-200 bg-white text-xs text-neutral-500">
        No URL
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={getAssetAlt(asset) || asset.title || asset.fileName || 'Media asset preview'}
      className="h-20 w-28 rounded-md border border-neutral-200 bg-white object-cover"
    />
  )
}

function getAssetWarnings(asset: MediaAsset) {
  const warnings: string[] = []

  if (getAssetUrl(asset) && !asset.decorative && !getAssetAlt(asset).trim()) warnings.push('Missing alt')
  if (asset.status === 'archived') warnings.push('Archived')
  if (asset.status === 'replaced') warnings.push('Replaced')
  if (asset.status === 'deleted-pending') warnings.push('Delete pending')
  if (asset.licenseStatus === 'unknown' || asset.licenseStatus === 'needs_review') warnings.push('License review')
  if (getAssetUrl(asset) && asset.usageStatus !== 'approved_for_publish' && !APPROVED_LICENSE_STATUSES.has(asset.licenseStatus)) {
    warnings.push('Not publish-approved')
  }

  return warnings
}

function getAssetUrl(asset: MediaAsset) {
  return asset.publicUrl || asset.url || ''
}

function getAssetAlt(asset: MediaAsset) {
  return asset.altText || asset.alt || ''
}

function uniqueOptions(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort()
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
