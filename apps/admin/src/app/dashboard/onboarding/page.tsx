'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Tenant } from 'pumpkin-ts-models'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

function RestrictedState() {
  return (
    <div className="card bg-amber-50 border-amber-200">
      <h1 className="text-xl font-semibold text-amber-950">Access Restricted</h1>
      <p className="mt-2 text-sm text-amber-800">Only SuperAdmin users can access tenant onboarding.</p>
    </div>
  )
}

export default function OnboardingPage() {
  const { token, user } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isSuperAdmin = user?.role === 'SuperAdmin'

  useEffect(() => {
    async function loadTenants() {
      if (!token || !isSuperAdmin) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setTenants(await apiClient.getTenants(token))
      } catch (err: any) {
        setError(err.message || 'Tenant onboarding data failed to load')
      } finally {
        setLoading(false)
      }
    }

    loadTenants()
  }, [token, isSuperAdmin])

  if (!isSuperAdmin) {
    return <RestrictedState />
  }

  const activeTenants = tenants.filter((tenant) => tenant.status === 'active').length
  const tenantsWithOrigins = tenants.filter((tenant) => (tenant.settings?.allowedOrigins || []).length > 0).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Tenant Onboarding</h1>
          <p className="mt-1 text-neutral-600">SuperAdmin tenant intake, setup, and readiness control.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/tenants" className="btn btn-primary">
            Tenants
          </Link>
          <Link href="/dashboard/import-intake" className="btn btn-secondary">
            Import Intake
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm font-medium text-neutral-500">Total Tenants</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{tenants.length}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-neutral-500">Active Tenants</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{activeTenants}</p>
        </div>
        <div className="card">
          <p className="text-sm font-medium text-neutral-500">Origins Configured</p>
          <p className="mt-2 text-3xl font-bold text-neutral-900">{tenantsWithOrigins}</p>
        </div>
      </div>

      {loading && (
        <div className="card">
          <p className="text-neutral-600">Loading onboarding state...</p>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead className="bg-neutral-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Tenant ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Allowed Origins</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {tenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">{tenant.name}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{tenant.tenantId}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{tenant.plan || 'standard'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{tenant.status || 'unknown'}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {(tenant.settings?.allowedOrigins || []).length}
                    </td>
                  </tr>
                ))}
                {tenants.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-sm text-neutral-500" colSpan={5}>
                      No tenants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
