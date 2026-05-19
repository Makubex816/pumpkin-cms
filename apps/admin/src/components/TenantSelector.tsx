'use client'

import { useAuth } from '@/contexts/AuthContext'

export default function TenantSelector() {
  const { currentTenant, availableTenants, setCurrentTenant, isLoading, isLoadingTenants, tenantLoadError } = useAuth()

  // Show loading state
  if (isLoading || (isLoadingTenants && !currentTenant)) {
    return (
      <div className="hidden sm:flex items-center px-3 py-1.5 bg-neutral-100 rounded-lg">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-neutral-300 border-t-primary-500 mr-2"></div>
        <span className="text-sm font-medium text-neutral-500">Loading...</span>
      </div>
    )
  }

  if (!currentTenant && tenantLoadError) {
    return (
      <div className="hidden sm:flex items-center px-3 py-1.5 bg-red-50 text-red-700 rounded-lg" title={tenantLoadError}>
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <span className="text-sm font-medium">Tenant load failed</span>
      </div>
    )
  }

  if (!currentTenant && availableTenants.length === 0) {
    return (
      <div className="hidden sm:flex items-center px-3 py-1.5 bg-neutral-100 rounded-lg">
        <svg className="w-4 h-4 text-neutral-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium text-neutral-700">No tenant</span>
      </div>
    )
  }

  // If only one tenant, don't show selector
  if (availableTenants.length <= 1) {
    const hasTenantLoadWarning = Boolean(tenantLoadError)
    const tenantLabel = currentTenant?.name || 'No tenant'

    return (
      <div
        className={`hidden sm:flex items-center px-3 py-1.5 rounded-lg ${hasTenantLoadWarning ? 'bg-amber-50 text-amber-800' : 'bg-neutral-100 text-neutral-700'}`}
        title={hasTenantLoadWarning ? tenantLoadError || 'Tenant list failed to load' : tenantLabel}
      >
        <svg className={`w-4 h-4 mr-2 ${hasTenantLoadWarning ? 'text-amber-600' : 'text-neutral-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span className="text-sm font-medium">{tenantLabel}{hasTenantLoadWarning ? ' (tenant list issue)' : ''}</span>
      </div>
    )
  }

  return (
    <div className="relative">
      <select
        value={currentTenant?.tenantId || ''}
        onChange={(e) => {
          const selected = availableTenants.find(t => t.tenantId === e.target.value)
          if (selected) {
            console.log('[TenantSelector] Switching to tenant:', selected.name)
            setCurrentTenant(selected)
            // Let React state updates trigger re-renders instead of hard reload
            // Pages using currentTenant in useEffect will automatically refresh
          }
        }}
        className="appearance-none bg-white border border-neutral-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-neutral-700 hover:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors cursor-pointer"
      >
        {availableTenants.map((tenant) => (
          <option key={tenant.tenantId} value={tenant.tenantId}>
            {tenant.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
