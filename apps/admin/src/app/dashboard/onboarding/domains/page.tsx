'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DomainBinding, DomainBindingDnsRecord, Tenant } from 'pumpkin-ts-models'
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Globe2,
  Lock,
  RefreshCcw,
  Server,
  ShieldCheck,
} from 'lucide-react'
import { apiClient, type DomainBindingDnsValidationResponse } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function RestrictedState() {
  return (
    <div className="card bg-amber-50 border-amber-200">
      <h1 className="text-xl font-semibold text-amber-950">Access Restricted</h1>
      <p className="mt-2 text-sm text-amber-800">Only SuperAdmin users can access Domain Manager.</p>
    </div>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const value = status || 'unknown'
  const styles = value.includes('pending')
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : value.includes('verified') || value.includes('ready') || value.includes('active')
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : 'bg-neutral-50 text-neutral-700 border-neutral-200'

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium ${styles}`}>
      {value}
    </span>
  )
}

function formatDateTime(value?: string | null) {
  if (!value) return 'Not checked'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'
  return parsed.toLocaleString()
}

function formatTenantLabel(tenant: Tenant) {
  return tenant.name || tenant.tenantId
}

function getPreferredTenantId(tenants: Tenant[]) {
  const airstrip = tenants.find((tenant) =>
    `${tenant.tenantId} ${tenant.name}`.toLowerCase().includes('airstrip')
  )
  return airstrip?.tenantId || tenants[0]?.tenantId || ''
}

function RecordStatusIcon({ record }: { record: DomainBindingDnsRecord }) {
  if (record.status === 'verified') {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
  }

  return <Clock3 className="h-4 w-4 text-amber-600" aria-hidden="true" />
}

function DnsRecordsTable({ records }: { records: DomainBindingDnsRecord[] }) {
  if (records.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        No DNS packet is stored for this DomainBinding yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Host</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Name</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Value</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase text-neutral-500">Observed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200 bg-white">
          {records.map((record) => (
            <tr key={`${record.type}:${record.name}:${record.host}`}>
              <td className="px-4 py-3 text-sm">
                <div className="flex items-center gap-2">
                  <RecordStatusIcon record={record} />
                  <span className="text-neutral-700">{record.status || 'pending'}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-neutral-900">{record.type}</td>
              <td className="px-4 py-3 text-sm font-mono text-neutral-700">{record.host}</td>
              <td className="px-4 py-3 text-sm font-mono text-neutral-700">{record.name}</td>
              <td className="max-w-sm px-4 py-3 text-sm font-mono text-neutral-700 break-all">{record.value}</td>
              <td className="px-4 py-3 text-sm text-neutral-600">
                {(record.observedValues || []).length > 0 ? (
                  <div className="space-y-1">
                    {(record.observedValues || []).map((value) => (
                      <div key={value} className="font-mono break-all">{value}</div>
                    ))}
                  </div>
                ) : (
                  <span>None</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FutureControls() {
  const controls = [
    'Bind Azure hostname',
    'Issue TLS certificate',
    'Promote domain',
    'Rollback domain',
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {controls.map((label) => (
        <button
          key={label}
          type="button"
          disabled
          title="Unavailable until a future approved cutover phase"
          className="btn btn-secondary flex items-center justify-center gap-2 opacity-60 cursor-not-allowed"
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

export default function DomainManagerPage() {
  const { token, user } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenantId, setSelectedTenantId] = useState('')
  const [domainBindings, setDomainBindings] = useState<DomainBinding[]>([])
  const [totalBindingCount, setTotalBindingCount] = useState(0)
  const [loadingTenants, setLoadingTenants] = useState(true)
  const [loadingBindings, setLoadingBindings] = useState(false)
  const [validatingId, setValidatingId] = useState<string | null>(null)
  const [lastValidation, setLastValidation] = useState<DomainBindingDnsValidationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isSuperAdmin = user?.role === 'SuperAdmin'

  const selectedTenant = useMemo(
    () => tenants.find((tenant) => tenant.tenantId === selectedTenantId) || null,
    [selectedTenantId, tenants]
  )

  const selectedBinding = domainBindings[0] || null

  const loadTenants = useCallback(async () => {
    if (!token || !isSuperAdmin) {
      setLoadingTenants(false)
      return
    }

    try {
      setLoadingTenants(true)
      setError(null)
      const [tenantResult, bindingResult] = await Promise.all([
        apiClient.getTenants(token),
        apiClient.listDomainBindings(token),
      ])
      setTenants(tenantResult)
      setTotalBindingCount(bindingResult.length)
      setSelectedTenantId((current) => current || getPreferredTenantId(tenantResult))
    } catch (err: any) {
      setError(err.message || 'Domain Manager data failed to load')
    } finally {
      setLoadingTenants(false)
    }
  }, [token, isSuperAdmin])

  const loadDomainBindings = useCallback(async () => {
    if (!token || !isSuperAdmin || !selectedTenantId) return

    try {
      setLoadingBindings(true)
      setError(null)
      setDomainBindings(await apiClient.listTenantDomainBindings(token, selectedTenantId))
    } catch (err: any) {
      setError(err.status === 403 ? 'Domain Manager is restricted to SuperAdmin users.' : err.message || 'Domain bindings failed to load')
    } finally {
      setLoadingBindings(false)
    }
  }, [token, isSuperAdmin, selectedTenantId])

  useEffect(() => {
    loadTenants()
  }, [loadTenants])

  useEffect(() => {
    loadDomainBindings()
  }, [loadDomainBindings])

  const runDnsValidation = async (binding: DomainBinding) => {
    if (!token) return

    try {
      setValidatingId(binding.id)
      setError(null)
      const result = await apiClient.validateDomainBindingDns(token, binding.tenantId, binding.id)
      setLastValidation(result)
      setDomainBindings((current) =>
        current.map((item) => (item.id === result.domainBinding.id ? result.domainBinding : item))
      )
    } catch (err: any) {
      setError(err.message || 'Read-only DNS validation failed')
    } finally {
      setValidatingId(null)
    }
  }

  if (!isSuperAdmin) {
    return <RestrictedState />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Domain Manager</h1>
          <p className="mt-1 text-neutral-600">SuperAdmin domain binding review and DNS readiness.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadDomainBindings}
            disabled={!selectedTenantId || loadingBindings}
            title="Reload selected tenant domain bindings"
            className="btn btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" aria-hidden="true" />
            <span>{loadingBindings ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" aria-hidden="true" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm font-medium text-neutral-500">Tenants</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{tenants.length}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-neutral-500">Domain Bindings</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{totalBindingCount}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-neutral-500">Selected Tenant</p>
          <p className="mt-2 truncate text-xl font-semibold text-neutral-900">
            {selectedTenant ? formatTenantLabel(selectedTenant) : 'None'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="card">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-neutral-900">Tenants</h2>
            {loadingTenants && <span className="text-sm text-neutral-500">Loading...</span>}
          </div>

          <div className="mt-4 space-y-2">
            {tenants.map((tenant) => {
              const selected = tenant.tenantId === selectedTenantId
              return (
                <button
                  key={tenant.tenantId}
                  type="button"
                  onClick={() => setSelectedTenantId(tenant.tenantId)}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
                    selected
                      ? 'border-primary-300 bg-primary-50 text-primary-900'
                      : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{formatTenantLabel(tenant)}</span>
                    <StatusBadge status={tenant.status} />
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">{tenant.tenantId}</div>
                </button>
              )
            })}

            {!loadingTenants && tenants.length === 0 && (
              <p className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                No tenants found.
              </p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-primary-700">
                  <Globe2 className="h-4 w-4" aria-hidden="true" />
                  DomainBinding
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
                  {selectedBinding ? selectedBinding.domain : 'No domain binding'}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  {selectedBinding ? selectedBinding.wwwDomain : 'Select a tenant with a DomainBinding record.'}
                </p>
              </div>
              {selectedBinding && (
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={selectedBinding.status} />
                  <StatusBadge status={selectedBinding.dnsValidationStatus} />
                </div>
              )}
            </div>

            {loadingBindings && (
              <p className="mt-6 text-sm text-neutral-600">Loading domain bindings...</p>
            )}

            {!loadingBindings && selectedBinding && (
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <Server className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                    Hosting Target
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Provider</dt>
                      <dd className="font-medium text-neutral-900">{selectedBinding.provider}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">App</dt>
                      <dd className="font-mono text-neutral-900">{selectedBinding.hostingTarget?.appName || 'Unknown'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Default Host</dt>
                      <dd className="break-all text-right font-mono text-neutral-900">{selectedBinding.hostingTarget?.defaultHost || 'Unknown'}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Canonical</dt>
                      <dd className="font-medium text-neutral-900">{selectedBinding.canonical ? 'true' : 'false'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                    <ShieldCheck className="h-4 w-4 text-neutral-500" aria-hidden="true" />
                    State Machine
                  </div>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Azure hostname</dt>
                      <dd><StatusBadge status={selectedBinding.azureHostnameStatus} /></dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">TLS</dt>
                      <dd><StatusBadge status={selectedBinding.tlsStatus} /></dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Runtime</dt>
                      <dd><StatusBadge status={selectedBinding.runtimeStatus} /></dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-neutral-500">Promotion</dt>
                      <dd><StatusBadge status={selectedBinding.promotionStatus} /></dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {!loadingBindings && !selectedBinding && (
              <p className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                No DomainBinding records were returned for this tenant.
              </p>
            )}
          </div>

          {selectedBinding && (
            <>
              <div className="card space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">DNS Packet</h2>
                    <p className="mt-1 text-sm text-neutral-600">Manual DNS records for the provider zone.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => runDnsValidation(selectedBinding)}
                    disabled={validatingId === selectedBinding.id}
                    title="Run read-only public DNS validation"
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                    <span>{validatingId === selectedBinding.id ? 'Checking...' : 'Run DNS Check'}</span>
                  </button>
                </div>

                <DnsRecordsTable records={selectedBinding.dnsRecords || []} />

                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="text-sm font-semibold text-blue-950">Next Action</h3>
                  <p className="mt-1 text-sm text-blue-900">
                    Add the displayed records in the DNS provider control panel, then run the read-only DNS check again.
                    Custom-domain binding, TLS, promotion, and rollback remain locked for the next approved phase.
                  </p>
                </div>

                {lastValidation && (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
                    <h3 className="text-sm font-semibold text-neutral-900">Last Validation Result</h3>
                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-neutral-500">Status</p>
                        <div className="mt-1"><StatusBadge status={lastValidation.status} /></div>
                      </div>
                      <div>
                        <p className="text-neutral-500">All records verified</p>
                        <p className="mt-1 font-medium text-neutral-900">{lastValidation.allRecordsVerified ? 'true' : 'false'}</p>
                      </div>
                      <div>
                        <p className="text-neutral-500">Updated</p>
                        <p className="mt-1 font-medium text-neutral-900">{formatDateTime(lastValidation.domainBinding.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card space-y-4">
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900">Future Cutover Controls</h2>
                  <p className="mt-1 text-sm text-neutral-600">Unavailable until DNS is applied and the next phase is approved.</p>
                </div>
                <FutureControls />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
