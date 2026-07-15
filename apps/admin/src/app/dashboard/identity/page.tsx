'use client'

import { FormEvent, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { identityFeatureEnabled } from '@/lib/identity/contracts'

const sections = [
  ['My account & security', 'Login email, verified changes, password updates, active sessions and forced rotation.'],
  ['Tenant settings', 'Immutable tenant UID, mutable slug rename preflight, impact report, progress and rollback.'],
  ['Contact & form notifications', 'Contact email and recipients stay independent from login identity and lead persistence.'],
  ['Users & access', 'Invitations, memberships, tenant roles, suspension and protected TenantAdmin transfer.'],
  ['Security audit', 'Tenant-scoped identity, membership, credential, contact and rename history.'],
] as const
type SectionName = typeof sections[number][0]

export default function IdentityPage() {
  const { user, currentTenant, availableTenants } = useAuth()
  const [selected, setSelected] = useState<SectionName>(sections[0][0])
  const [notice, setNotice] = useState<string | null>(null)
  const disabled = !identityFeatureEnabled

  function gatedSubmit(event: FormEvent) {
    event.preventDefault()
    setNotice(disabled ? 'Identity management is disabled until the controlled V2.8.63B migration.' : 'Confirmation is required before this action can continue.')
  }

  return (
    <main className="p-6 lg:p-8 space-y-6" aria-labelledby="identity-title">
      <div>
        <h1 id="identity-title" className="text-2xl font-semibold text-neutral-900">Identity & tenant administration</h1>
        <p className="mt-1 text-sm text-neutral-600">Account security and access for {currentTenant?.name || 'your active tenant'}.</p>
      </div>

      {disabled && (
        <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Source preview only. All identity writes, tenant renames, migrations, and notification delivery are disabled by default.
        </div>
      )}

      {notice && <div role="alert" className="rounded-lg border border-neutral-300 bg-white p-3 text-sm">{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <nav aria-label="Identity settings" className="space-y-2">
          {sections.map(([name]) => (
            <button key={name} onClick={() => { setSelected(name); setNotice(null) }}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium ${selected === name ? 'bg-primary-50 text-primary-800' : 'bg-white text-neutral-700 hover:bg-neutral-100'}`}>
              {name}
            </button>
          ))}
          {user?.role === 'SuperAdmin' && <div className="mt-4 rounded-lg border bg-white p-4 text-sm"><strong>Platform controls</strong><p className="mt-1 text-neutral-600">Global users, tenants, membership matrix, rename jobs, credential actions, audit, and migration conflicts.</p></div>}
        </nav>

        <section className="rounded-xl border border-neutral-200 bg-white p-6" aria-live="polite">
          <h2 className="text-xl font-semibold">{selected}</h2>
          <p className="mt-1 text-sm text-neutral-600">{sections.find(([name]) => name === selected)?.[1]}</p>

          {selected === 'My account & security' && (
            <form onSubmit={gatedSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium">Current login email<input className="mt-1 w-full rounded border p-2" value={user?.email || ''} readOnly /></label>
              <label className="block text-sm font-medium">New verified login email<input type="email" required disabled={disabled} className="mt-1 w-full rounded border p-2 disabled:bg-neutral-100" /></label>
              <label className="block text-sm font-medium">Current password<input type="password" autoComplete="current-password" required disabled={disabled} className="mt-1 w-full rounded border p-2 disabled:bg-neutral-100" /></label>
              <button disabled={disabled} className="btn btn-primary disabled:opacity-50">Request verified change</button>
              <button type="button" disabled={disabled} className="btn btn-secondary ml-2 disabled:opacity-50">Change password</button>
              <button type="button" disabled={disabled} className="btn btn-secondary ml-2 disabled:opacity-50">Revoke other sessions</button>
            </form>
          )}

          {selected === 'Tenant settings' && (
            <form onSubmit={gatedSubmit} className="mt-6 space-y-4">
              <label className="block text-sm font-medium">Active tenant<select className="mt-1 w-full rounded border p-2" disabled={disabled} value={currentTenant?.tenantId || ''} onChange={() => undefined}>{availableTenants.map(t => <option key={t.tenantId} value={t.tenantId}>{t.name}</option>)}</select></label>
              <label className="block text-sm font-medium">New tenant slug<input pattern="[a-z0-9][a-z0-9-]*[a-z0-9]" disabled={disabled} className="mt-1 w-full rounded border p-2 disabled:bg-neutral-100" /></label>
              <button disabled={disabled} className="btn btn-primary disabled:opacity-50">Run rename preflight</button>
              <p className="text-xs text-neutral-500">A successful preflight must show pages, forms, entries, redirects, domains, runtime keys, storage, backup, and external dependencies before typed confirmation.</p>
            </form>
          )}

          {selected === 'Contact & form notifications' && (
            <form onSubmit={gatedSubmit} className="mt-6 space-y-4">
              <div className="rounded border bg-neutral-50 p-3 text-sm"><strong>Lead persistence:</strong> independent &nbsp; <strong>Delivery capability:</strong> no provider configured</div>
              <label className="block text-sm font-medium">Primary contact email<input type="email" disabled={disabled} className="mt-1 w-full rounded border p-2 disabled:bg-neutral-100" /></label>
              <label className="block text-sm font-medium">Notification recipients<textarea disabled={disabled} aria-describedby="recipient-help" className="mt-1 w-full rounded border p-2 disabled:bg-neutral-100" /></label>
              <p id="recipient-help" className="text-xs text-neutral-500">One tenant-scoped email per line. Verification and active state are tracked separately.</p>
              <button disabled={disabled} className="btn btn-primary disabled:opacity-50">Save contact settings</button>
            </form>
          )}

          {selected === 'Users & access' && <div className="mt-6 rounded border border-dashed p-8 text-center text-sm text-neutral-600">No memberships loaded. Invite, add-existing, role, suspend, revoke, and transfer controls become available after identity migration.</div>}
          {selected === 'Security audit' && <div className="mt-6 rounded border border-dashed p-8 text-center text-sm text-neutral-600">No identity audit events are available while the feature is disabled.</div>}
        </section>
      </div>
    </main>
  )
}
