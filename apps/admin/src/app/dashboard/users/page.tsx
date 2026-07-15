'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AdminUserProfile, UpdateUserProfileRequest } from 'pumpkin-ts-models'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

type UserEditState = {
  user: AdminUserProfile
  firstName: string
  lastName: string
}

function RestrictedState() {
  return (
    <div className="card bg-amber-50 border-amber-200">
      <h1 className="text-xl font-semibold text-amber-950">Access Restricted</h1>
      <p className="mt-2 text-sm text-amber-800">Only SuperAdmin users can manage user profiles.</p>
    </div>
  )
}

function formatDate(value?: string) {
  if (!value) return 'Never'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Unknown'
  return parsed.toLocaleDateString()
}

export default function UsersPage() {
  const { token, user, availableTenants } = useAuth()
  const [users, setUsers] = useState<AdminUserProfile[]>([])
  const [tenantFilter, setTenantFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editState, setEditState] = useState<UserEditState | null>(null)
  const usersLoadGeneration = useRef(0)
  const isSuperAdmin = user?.role === 'SuperAdmin'

  const loadUsers = useCallback(async () => {
    const generation = ++usersLoadGeneration.current
    setUsers([])
    setEditState(null)
    if (!token || !isSuperAdmin) {
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await apiClient.getAdminUsers(token, tenantFilter || undefined)
      if (usersLoadGeneration.current === generation) setUsers(result)
    } catch (err: any) {
      if (usersLoadGeneration.current === generation) setError(err.message || 'Users failed to load')
    } finally {
      if (usersLoadGeneration.current === generation) setLoading(false)
    }
  }, [token, isSuperAdmin, tenantFilter])

  useEffect(() => {
    loadUsers()
    return () => { usersLoadGeneration.current += 1 }
  }, [loadUsers])

  const tenantOptions = useMemo(() => {
    const fromUsers = users.map((item) => item.tenantId)
    const fromTenantContext = availableTenants.map((tenant) => tenant.tenantId)
    return Array.from(new Set([...fromTenantContext, ...fromUsers])).sort()
  }, [availableTenants, users])

  const openEdit = (profile: AdminUserProfile) => {
    setEditState({
      user: profile,
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
    })
  }

  const saveEdit = async () => {
    if (!token || !editState) return

    const payload: UpdateUserProfileRequest = {
      // The legacy profile endpoint still requires this field. Preserve the exact
      // current value; login-email mutation belongs to the identity API only.
      email: editState.user.email,
      firstName: editState.firstName,
      lastName: editState.lastName,
    }

    try {
      setSaving(true)
      setError(null)
      const updated = await apiClient.updateAdminUserProfile(
        token,
        editState.user.tenantId,
        editState.user.id,
        payload
      )
      setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setEditState(null)
    } catch (err: any) {
      setError(err.message || 'User profile update failed')
    } finally {
      setSaving(false)
    }
  }

  if (!isSuperAdmin) {
    return <RestrictedState />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Users/Admins</h1>
          <p className="mt-1 text-neutral-600">SuperAdmin profile directory.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          Tenant
          <select
            className="input min-w-56"
            value={tenantFilter}
            onChange={(event) => setTenantFilter(event.target.value)}
          >
            <option value="">All tenants</option>
            {tenantOptions.map((tenantId) => (
              <option key={tenantId} value={tenantId}>
                {tenantId}
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && (
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <p className="text-neutral-600">Loading users...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <caption className="sr-only">Legacy profile users grouped by tenant</caption>
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Tenant</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase text-neutral-500">Last Login</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase text-neutral-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {users.map((profile) => (
                  <tr key={`${profile.tenantId}:${profile.id}`} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900">{profile.displayName}</div>
                      <div className="text-xs text-neutral-500">{profile.username}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{profile.email}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{profile.tenantId}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{profile.role}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{formatDate(profile.lastLogin)}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary-700 hover:text-primary-900" onClick={() => openEdit(profile)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td className="px-6 py-8 text-center text-sm text-neutral-500" colSpan={6}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900">Edit Profile</h2>
                <p className="mt-1 text-sm text-neutral-500">{editState.user.tenantId}</p>
              </div>
              <button className="text-neutral-500 hover:text-neutral-900" onClick={() => setEditState(null)}>
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-neutral-700">
                Login email (managed by Identity &amp; Access)
                <input
                  className="input mt-1 w-full bg-neutral-100"
                  type="email"
                  value={editState.user.email}
                  readOnly
                  aria-describedby="legacy-email-hold"
                />
              </label>
              <p id="legacy-email-hold" className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                Login email editing is disabled here to prevent legacy and identity records from diverging. Use the feature-gated{' '}
                <Link href="/dashboard/identity" className="font-medium underline">Identity &amp; Access</Link> controls.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-neutral-700">
                  First Name
                  <input
                    className="input mt-1 w-full"
                    maxLength={100}
                    value={editState.firstName}
                    onChange={(event) => setEditState({ ...editState, firstName: event.target.value })}
                  />
                </label>
                <label className="block text-sm font-medium text-neutral-700">
                  Last Name
                  <input
                    className="input mt-1 w-full"
                    maxLength={100}
                    value={editState.lastName}
                    onChange={(event) => setEditState({ ...editState, lastName: event.target.value })}
                  />
                </label>
              </div>
              <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
                <div>Role: {editState.user.role}</div>
                <div>Username: {editState.user.username}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setEditState(null)} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
