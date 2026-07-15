'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { API_URL } from '@/lib/api'
import { IdentityClient, IdentityClientError, isIdentityNotificationProviderUnavailable } from '@/lib/identity/client'
import {
  EMPTY_IDENTITY_FEATURE_STATE,
  IDENTITY_BCRYPT_PASSWORD_MAX_BYTES,
  IDENTITY_CONFIRMATION_MAX_LENGTH,
  IDENTITY_EMAIL_MAX_LENGTH,
  IDENTITY_EXISTING_PASSWORD_MAX_BYTES,
  IDENTITY_IDENTIFIER_MAX_LENGTH,
  IDENTITY_REASON_MAX_LENGTH,
  IDENTITY_RECIPIENT_MAX_COUNT,
  IDENTITY_SEARCH_MAX_LENGTH,
  canSetIdentityMembershipStatus,
  deriveIdentityCapabilities,
  identityMembershipLabel,
  identityTenantLabel,
  isFinalActiveTenantAdmin,
  isMembershipInActiveTenantAdminTokenScope,
  isStrongBcryptPassword,
  isWithinExistingPasswordLimit,
  normalizeBoundedIdentityReason,
  normalizeIdentityEmail,
  stableIdentityIdempotencyKey,
} from '@/lib/identity/contracts'
import type {
  CurrentIdentityProfile,
  FormNotificationRecipient,
  GlobalIdentityUser,
  IdentityAuditEvent,
  IdentityFeatureState,
  IdentityInvitation,
  IdentityMembership,
  IdentityMigrationConflict,
  IdentityRecordStatus,
  IdentitySession,
  IdentityTenant,
  TemporaryPasswordResult,
  TenantContactSettings,
  TenantRole,
} from '@/lib/identity/contracts'

const baseSections = [
  ['Overview', 'Runtime feature state, identity profile, preservation boundaries, and provider status.'],
  ['Account & sessions', 'Own-password rotation, session revocation, and provider-aware login-email requests.'],
  ['Tenant switcher', 'Active memberships and explicit tenant-context switching without cross-tenant fallback.'],
  ['Users & memberships', 'Invitations, existing-user membership, roles, status, and final-admin protection.'],
  ['Contact & notifications', 'Tenant contact and form recipients, independent from login identity and lead persistence.'],
  ['Security audit', 'Tenant-scoped identity and authorization events.'],
] as const

type BaseSectionName = typeof baseSections[number][0]
type SectionName = BaseSectionName | 'SuperAdmin controls'
const tenantAdministrationSections: SectionName[] = [
  'Users & memberships',
  'Contact & notifications',
  'Security audit',
]

const roles: TenantRole[] = ['TenantAdmin', 'Editor', 'Viewer']
const membershipStatuses: IdentityRecordStatus[] = ['Active', 'Suspended', 'Revoked']

function isBoundedIdentityEmail(value: string): boolean {
  const normalized = value.trim()
  return normalized.length > 0 &&
    normalized.length <= IDENTITY_EMAIL_MAX_LENGTH &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
}

function errorMessage(error: unknown): string {
  if (error instanceof IdentityClientError) {
    const request = error.requestId ? ` Request ${error.requestId}.` : ''
    return `${error.code}: ${error.message}.${request}`
  }
  return error instanceof Error ? error.message : 'Identity request failed.'
}

function formatDate(value?: string | null): string {
  if (!value) return 'Not recorded'
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? 'Unknown' : parsed.toLocaleString()
}

function StatusPill({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <span
      role="status"
      aria-label={`${label}: ${enabled ? 'enabled' : 'disabled'}`}
      data-state={enabled ? 'enabled' : 'disabled'}
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-100 text-neutral-600'}`}
    >
      {label}
    </span>
  )
}

function DisabledReason({ children }: { children: React.ReactNode }) {
  return <p className="mt-2 text-xs text-amber-700">{children}</p>
}

export default function IdentityPage() {
  const { token, user, currentTenant, availableTenants, setCurrentTenant, adoptIdentityTenantSession, logout } = useAuth()
  const isSuperAdmin = user?.role === 'SuperAdmin'
  const client = useMemo(() => token ? new IdentityClient(API_URL, token) : null, [token])

  const [selected, setSelected] = useState<SectionName>('Overview')
  const [featureState, setFeatureState] = useState<IdentityFeatureState | null>(null)
  const [featureStateToken, setFeatureStateToken] = useState('')
  const [featureStateRefreshKey, setFeatureStateRefreshKey] = useState(-1)
  const [featureLoading, setFeatureLoading] = useState(true)
  const [featureError, setFeatureError] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ kind: 'success' | 'held' | 'error'; message: string } | null>(null)
  const [actionBusy, setActionBusy] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [profile, setProfile] = useState<CurrentIdentityProfile | null>(null)
  const [memberships, setMemberships] = useState<IdentityMembership[]>([])
  const [sessions, setSessions] = useState<IdentitySession[]>([])
  const [currentDataLoading, setCurrentDataLoading] = useState(false)
  const [currentDataReady, setCurrentDataReady] = useState(false)
  const [currentDataToken, setCurrentDataToken] = useState('')
  const [currentDataRefreshKey, setCurrentDataRefreshKey] = useState(-1)
  const [currentDataError, setCurrentDataError] = useState<string | null>(null)
  const [sessionDataLoading, setSessionDataLoading] = useState(false)
  const [sessionDataReady, setSessionDataReady] = useState(false)
  const [sessionDataToken, setSessionDataToken] = useState('')
  const [sessionDataRefreshKey, setSessionDataRefreshKey] = useState(-1)
  const [sessionDataError, setSessionDataError] = useState<string | null>(null)

  const [selectedSwitchTenantUid, setSelectedSwitchTenantUid] = useState('')
  const [selectedManagedTenantUid, setSelectedManagedTenantUid] = useState('')
  const [tenantMemberships, setTenantMemberships] = useState<IdentityMembership[]>([])
  const [contactSettings, setContactSettings] = useState<TenantContactSettings | null>(null)
  const [auditEvents, setAuditEvents] = useState<IdentityAuditEvent[]>([])
  const [tenantDataError, setTenantDataError] = useState<string | null>(null)
  const [tenantDataLoading, setTenantDataLoading] = useState(false)
  const [tenantDataReady, setTenantDataReady] = useState(false)
  const [tenantDataToken, setTenantDataToken] = useState('')
  const [tenantDataRefreshKey, setTenantDataRefreshKey] = useState(-1)
  const [loadedTenantUid, setLoadedTenantUid] = useState('')

  const [globalUsers, setGlobalUsers] = useState<GlobalIdentityUser[]>([])
  const [globalUsersLoading, setGlobalUsersLoading] = useState(false)
  const [globalUsersReady, setGlobalUsersReady] = useState(false)
  const [globalUsersToken, setGlobalUsersToken] = useState('')
  const [globalUsersRefreshKey, setGlobalUsersRefreshKey] = useState(-1)
  const [globalUsersError, setGlobalUsersError] = useState<string | null>(null)
  const [globalTenants, setGlobalTenants] = useState<IdentityTenant[]>([])
  const [globalTenantsLoading, setGlobalTenantsLoading] = useState(false)
  const [globalTenantsReady, setGlobalTenantsReady] = useState(false)
  const [globalTenantsToken, setGlobalTenantsToken] = useState('')
  const [globalTenantsRefreshKey, setGlobalTenantsRefreshKey] = useState(-1)
  const [globalTenantsError, setGlobalTenantsError] = useState<string | null>(null)
  const [globalAuditEvents, setGlobalAuditEvents] = useState<IdentityAuditEvent[]>([])
  const [migrationConflicts, setMigrationConflicts] = useState<IdentityMigrationConflict[]>([])
  const [globalSecurityLoading, setGlobalSecurityLoading] = useState(false)
  const [globalSecurityReady, setGlobalSecurityReady] = useState(false)
  const [globalSecurityToken, setGlobalSecurityToken] = useState('')
  const [globalSecurityRefreshKey, setGlobalSecurityRefreshKey] = useState(-1)
  const [globalSecurityError, setGlobalSecurityError] = useState<string | null>(null)
  const [globalSearch, setGlobalSearch] = useState('')
  const [selectedGlobalUserId, setSelectedGlobalUserId] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [requestedEmail, setRequestedEmail] = useState('')
  const [emailRequestPassword, setEmailRequestPassword] = useState('')

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TenantRole>('Viewer')
  const [inviteIdempotencyKey, setInviteIdempotencyKey] = useState('')
  const [createdInvitation, setCreatedInvitation] = useState<IdentityInvitation | null>(null)
  const [existingUserId, setExistingUserId] = useState('')
  const [existingUserRole, setExistingUserRole] = useState<TenantRole>('Viewer')
  const [membershipIdempotencyKey, setMembershipIdempotencyKey] = useState('')
  const [membershipReason, setMembershipReason] = useState('')
  const [transferMembershipId, setTransferMembershipId] = useState('')
  const [transferConfirmation, setTransferConfirmation] = useState('')

  const [contactEmail, setContactEmail] = useState('')
  const [notificationPolicy, setNotificationPolicy] = useState('all-active')
  const [recipientDrafts, setRecipientDrafts] = useState<FormNotificationRecipient[]>([])

  const [adminReason, setAdminReason] = useState('')
  const [adminConfirmation, setAdminConfirmation] = useState('')
  const [administrativeEmail, setAdministrativeEmail] = useState('')
  const [forcePasswordChange, setForcePasswordChange] = useState(false)
  const [administrativePassword, setAdministrativePassword] = useState('')
  const [administrativePasswordConfirmation, setAdministrativePasswordConfirmation] = useState('')
  const [oneTimePassword, setOneTimePassword] = useState<TemporaryPasswordResult | null>(null)

  const featureGeneration = useRef(0)
  const currentDataGeneration = useRef(0)
  const sessionDataGeneration = useRef(0)
  const tenantDataGeneration = useRef(0)
  const globalUsersGeneration = useRef(0)
  const globalTenantsGeneration = useRef(0)
  const globalSecurityGeneration = useRef(0)

  const featureScopeReady = Boolean(
    featureState && featureStateToken === token && featureStateRefreshKey === refreshKey,
  )
  const runtimeState: IdentityFeatureState = featureScopeReady && featureState
    ? featureState
    : EMPTY_IDENTITY_FEATURE_STATE
  const capabilities = useMemo(
    () => deriveIdentityCapabilities(runtimeState, isSuperAdmin),
    [runtimeState, isSuperAdmin],
  )
  const canReadGlobalUsers = capabilities.superAdminRead
  const canReadGlobalTenants = capabilities.superAdminRead
  const canManageGlobalUserCredentials = capabilities.superAdminCredentials
  const canConfirmGlobalUserAction = capabilities.superAdminCredentials || capabilities.superAdmin
  const canTransferTenantAdmin = isSuperAdmin && capabilities.memberships
  const currentScopeReady = currentDataReady && currentDataToken === token &&
    currentDataRefreshKey === refreshKey
  const currentScopeMemberships = useMemo(
    () => currentScopeReady ? memberships : [],
    [currentScopeReady, memberships],
  )
  const globalTenantScopeReady = globalTenantsReady && globalTenantsToken === token &&
    globalTenantsRefreshKey === refreshKey
  const managedTenants = useMemo<IdentityTenant[]>(() => {
    const candidates = isSuperAdmin
      ? (globalTenantScopeReady ? globalTenants : [])
      : currentScopeMemberships
        .filter((membership) =>
          isMembershipInActiveTenantAdminTokenScope(membership, user?.tenantId),
        )
        .map((membership) => ({
          tenantUid: membership.tenantUid,
          legacyTenantId: membership.legacyTenantId || '',
          canonicalSlug: membership.canonicalSlug || '',
          displayName: membership.displayName || '',
          status: 'Active' as const,
        }))
    return Array.from(new Map(candidates.map((tenant) => [tenant.tenantUid, tenant])).values())
      .sort((left, right) =>
        identityTenantLabel(left).localeCompare(identityTenantLabel(right)) ||
        left.tenantUid.localeCompare(right.tenantUid),
      )
  }, [currentScopeMemberships, globalTenantScopeReady, globalTenants, isSuperAdmin, user?.tenantId])
  const tenantScopeAuthorized = managedTenants.some(
    (tenant) => tenant.tenantUid === selectedManagedTenantUid,
  )
  const tenantScopeReady = Boolean(
    selectedManagedTenantUid &&
    tenantScopeAuthorized &&
    tenantDataReady &&
    tenantDataToken === token &&
    tenantDataRefreshKey === refreshKey &&
    loadedTenantUid === selectedManagedTenantUid &&
    !tenantDataLoading,
  )
  const tenantMutationBusy = !tenantScopeReady || actionBusy !== null

  useEffect(() => {
    const generation = ++featureGeneration.current
    if (!client) {
      setFeatureLoading(false)
      setFeatureState(null)
      setFeatureStateToken('')
      setFeatureStateRefreshKey(-1)
      setFeatureError(null)
      return
    }

    setFeatureLoading(true)
    setFeatureState(null)
    setFeatureStateToken('')
    setFeatureStateRefreshKey(-1)
    setFeatureError(null)
    client.featureState()
      .then((state) => {
        if (featureGeneration.current === generation) {
          setFeatureState(state)
          setFeatureStateToken(token || '')
          setFeatureStateRefreshKey(refreshKey)
        }
      })
      .catch((error) => {
        if (featureGeneration.current === generation) {
          setFeatureState(null)
          setFeatureStateToken('')
          setFeatureStateRefreshKey(-1)
          setFeatureError(errorMessage(error))
        }
      })
      .finally(() => {
        if (featureGeneration.current === generation) setFeatureLoading(false)
      })

    return () => {
      if (featureGeneration.current === generation) featureGeneration.current += 1
    }
  }, [client, refreshKey, token])

  useEffect(() => {
    const generation = ++currentDataGeneration.current
    setProfile(null)
    setMemberships([])
    setCurrentDataReady(false)
    setCurrentDataToken('')
    setCurrentDataRefreshKey(-1)
    if (!client || !capabilities.read) {
      setCurrentDataLoading(false)
      setCurrentDataError(null)
      return
    }

    setCurrentDataLoading(true)
    setCurrentDataError(null)
    Promise.allSettled([client.profile(), client.memberships()])
      .then(([profileResult, membershipsResult]) => {
        if (currentDataGeneration.current !== generation) return
        if (profileResult.status === 'fulfilled' && membershipsResult.status === 'fulfilled') {
          setProfile(profileResult.value)
          setMemberships(membershipsResult.value)
          setCurrentDataToken(token || '')
          setCurrentDataRefreshKey(refreshKey)
          setCurrentDataReady(true)
          return
        }

        const errors = [profileResult, membershipsResult]
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map((result) => errorMessage(result.reason))
        setCurrentDataError(Array.from(new Set(errors)).join(' '))
      })
      .finally(() => {
        if (currentDataGeneration.current === generation) setCurrentDataLoading(false)
      })

    return () => {
      if (currentDataGeneration.current === generation) currentDataGeneration.current += 1
    }
  }, [client, capabilities.read, refreshKey, token])

  useEffect(() => {
    const generation = ++sessionDataGeneration.current
    setSessions([])
    setSessionDataReady(false)
    setSessionDataToken('')
    setSessionDataRefreshKey(-1)
    if (!client || !capabilities.passwordAndSessions) {
      setSessionDataLoading(false)
      setSessionDataError(null)
      return
    }

    setSessionDataLoading(true)
    setSessionDataError(null)
    client.sessions()
      .then((items) => {
        if (sessionDataGeneration.current === generation) {
          setSessions(items)
          setSessionDataToken(token || '')
          setSessionDataRefreshKey(refreshKey)
          setSessionDataReady(true)
        }
      })
      .catch((error) => {
        if (sessionDataGeneration.current === generation) {
          setSessions([])
          setSessionDataError(errorMessage(error))
        }
      })
      .finally(() => {
        if (sessionDataGeneration.current === generation) setSessionDataLoading(false)
      })

    return () => {
      if (sessionDataGeneration.current === generation) sessionDataGeneration.current += 1
    }
  }, [client, capabilities.passwordAndSessions, refreshKey, token])

  useEffect(() => {
    if (currentScopeMemberships.length === 0) {
      setSelectedSwitchTenantUid('')
      return
    }

    setSelectedSwitchTenantUid((current) => {
      const active = currentScopeMemberships.filter((membership) => membership.status === 'Active')
      if (active.some((membership) => membership.tenantUid === current)) return current
      const contextMatch = active.find((membership) =>
        membership.legacyTenantId === currentTenant?.tenantId ||
        membership.canonicalSlug === currentTenant?.tenantId ||
        membership.tenantUid === currentTenant?.tenantId,
      )
      const deterministicFallback = [...active].sort((left, right) =>
        identityMembershipLabel(left).localeCompare(identityMembershipLabel(right)) ||
        left.tenantUid.localeCompare(right.tenantUid),
      )[0]
      return (contextMatch || deterministicFallback)?.tenantUid || ''
    })
  }, [currentScopeMemberships, currentTenant?.tenantId])

  useEffect(() => {
    if (managedTenants.length === 0) {
      setSelectedManagedTenantUid('')
      return
    }

    setSelectedManagedTenantUid((current) => {
      if (managedTenants.some((tenant) => tenant.tenantUid === current)) return current
      const contextMatch = managedTenants.find((tenant) =>
        tenant.legacyTenantId === currentTenant?.tenantId ||
        tenant.canonicalSlug === currentTenant?.tenantId ||
        tenant.tenantUid === currentTenant?.tenantId,
      )
      return (contextMatch || managedTenants[0]).tenantUid
    })
  }, [managedTenants, currentTenant?.tenantId])

  useEffect(() => {
    const generation = ++tenantDataGeneration.current
    setTenantMemberships([])
    setContactSettings(null)
    setAuditEvents([])
    setTenantDataReady(false)
    setTenantDataToken('')
    setTenantDataRefreshKey(-1)
    setLoadedTenantUid('')
    if (!client || !capabilities.read || !selectedManagedTenantUid || !tenantScopeAuthorized) {
      setTenantDataLoading(false)
      setTenantDataError(null)
      return
    }

    setTenantDataError(null)
    setTenantDataLoading(true)
    Promise.allSettled([
      client.tenantMemberships(selectedManagedTenantUid),
      client.contactSettings(selectedManagedTenantUid),
      client.tenantAudit(selectedManagedTenantUid),
    ]).then(([membershipResult, contactResult, auditResult]) => {
      if (tenantDataGeneration.current !== generation) return
      if (membershipResult.status === 'fulfilled' &&
          contactResult.status === 'fulfilled' &&
          auditResult.status === 'fulfilled') {
        setTenantMemberships(membershipResult.value)
        setContactSettings(contactResult.value)
        setAuditEvents(auditResult.value)
        setLoadedTenantUid(selectedManagedTenantUid)
        setTenantDataToken(token || '')
        setTenantDataRefreshKey(refreshKey)
        setTenantDataReady(true)
        return
      }

      const errors = [membershipResult, contactResult, auditResult]
        .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
        .map((result) => errorMessage(result.reason))
      setTenantDataError(Array.from(new Set(errors)).join(' '))
    })
      .finally(() => {
        if (tenantDataGeneration.current === generation) setTenantDataLoading(false)
      })

    return () => {
      if (tenantDataGeneration.current === generation) tenantDataGeneration.current += 1
    }
  }, [client, capabilities.read, selectedManagedTenantUid, tenantScopeAuthorized, refreshKey, token])

  useEffect(() => {
    const generation = ++globalUsersGeneration.current
    setGlobalUsers([])
    setGlobalUsersReady(false)
    setGlobalUsersToken('')
    setGlobalUsersRefreshKey(-1)
    if (!client || !canReadGlobalUsers) {
      setGlobalUsersLoading(false)
      setGlobalUsersError(null)
      return
    }
    setGlobalUsersLoading(true)
    setGlobalUsersError(null)
    client.globalUsers()
      .then((items) => {
        if (globalUsersGeneration.current === generation) {
          setGlobalUsers(items)
          setGlobalUsersToken(token || '')
          setGlobalUsersRefreshKey(refreshKey)
          setGlobalUsersReady(true)
        }
      })
      .catch((error) => {
        if (globalUsersGeneration.current === generation) setGlobalUsersError(errorMessage(error))
      })
      .finally(() => {
        if (globalUsersGeneration.current === generation) setGlobalUsersLoading(false)
      })
    return () => {
      if (globalUsersGeneration.current === generation) globalUsersGeneration.current += 1
    }
  }, [client, canReadGlobalUsers, refreshKey, token])

  useEffect(() => {
    const generation = ++globalTenantsGeneration.current
    setGlobalTenants([])
    setGlobalTenantsReady(false)
    setGlobalTenantsToken('')
    setGlobalTenantsRefreshKey(-1)
    if (!client || !canReadGlobalTenants) {
      setGlobalTenantsLoading(false)
      setGlobalTenantsError(null)
      return
    }
    setGlobalTenantsLoading(true)
    setGlobalTenantsError(null)
    client.globalTenants()
      .then((items) => {
        if (globalTenantsGeneration.current === generation) {
          setGlobalTenants(items)
          setGlobalTenantsToken(token || '')
          setGlobalTenantsRefreshKey(refreshKey)
          setGlobalTenantsReady(true)
        }
      })
      .catch((error) => {
        if (globalTenantsGeneration.current === generation) {
          setGlobalTenants([])
          setGlobalTenantsError(errorMessage(error))
        }
      })
      .finally(() => {
        if (globalTenantsGeneration.current === generation) setGlobalTenantsLoading(false)
      })
    return () => {
      if (globalTenantsGeneration.current === generation) globalTenantsGeneration.current += 1
    }
  }, [client, canReadGlobalTenants, refreshKey, token])

  useEffect(() => {
    const generation = ++globalSecurityGeneration.current
    setGlobalAuditEvents([])
    setMigrationConflicts([])
    setGlobalSecurityReady(false)
    setGlobalSecurityToken('')
    setGlobalSecurityRefreshKey(-1)
    if (!client || !capabilities.superAdminRead) {
      setGlobalSecurityLoading(false)
      setGlobalSecurityError(null)
      return
    }
    setGlobalSecurityLoading(true)
    setGlobalSecurityError(null)
    Promise.allSettled([client.globalAudit(), client.migrationConflicts()])
      .then(([auditResult, conflictResult]) => {
        if (globalSecurityGeneration.current !== generation) return
        if (auditResult.status === 'fulfilled' && conflictResult.status === 'fulfilled') {
          setGlobalAuditEvents(auditResult.value)
          setMigrationConflicts(conflictResult.value)
          setGlobalSecurityToken(token || '')
          setGlobalSecurityRefreshKey(refreshKey)
          setGlobalSecurityReady(true)
          return
        }

        const errors = [auditResult, conflictResult]
          .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
          .map((result) => errorMessage(result.reason))
        setGlobalSecurityError(Array.from(new Set(errors)).join(' '))
      })
      .finally(() => {
        if (globalSecurityGeneration.current === generation) setGlobalSecurityLoading(false)
      })
    return () => {
      if (globalSecurityGeneration.current === generation) globalSecurityGeneration.current += 1
    }
  }, [client, capabilities.superAdminRead, refreshKey, token])

  useEffect(() => {
    setContactEmail(contactSettings?.primaryContactEmail || '')
    setNotificationPolicy(contactSettings?.defaultNotificationPolicy || 'all-active')
    setRecipientDrafts(contactSettings?.recipients || [])
  }, [contactSettings])

  useEffect(() => {
    setCreatedInvitation(null)
    setMembershipReason('')
    setTransferMembershipId('')
    setTransferConfirmation('')
    setInviteIdempotencyKey('')
    setMembershipIdempotencyKey('')
  }, [selectedManagedTenantUid])

  useEffect(() => {
    setInviteIdempotencyKey('')
  }, [inviteEmail, inviteRole])

  useEffect(() => {
    setMembershipIdempotencyKey('')
  }, [existingUserId, existingUserRole])

  useEffect(() => {
    setOneTimePassword(null)
    setAdminReason('')
    setAdminConfirmation('')
    setAdministrativePassword('')
    setAdministrativePasswordConfirmation('')
    setForcePasswordChange(false)
  }, [selectedGlobalUserId])

  useEffect(() => {
    const selectedUser = globalUsers.find((item) => item.userId === selectedGlobalUserId)
    setAdministrativeEmail(selectedUser?.loginEmail || '')
  }, [selectedGlobalUserId, globalUsers])

  useEffect(() => {
    if (!globalUsersReady || globalUsersToken !== token ||
        globalUsersRefreshKey !== refreshKey || !selectedGlobalUserId) return
    if (!globalUsers.some((item) => item.userId === selectedGlobalUserId)) {
      setSelectedGlobalUserId('')
    }
  }, [globalUsers, globalUsersReady, globalUsersRefreshKey, globalUsersToken, refreshKey, selectedGlobalUserId, token])

  useEffect(() => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setRequestedEmail('')
    setEmailRequestPassword('')
    setAdminReason('')
    setAdminConfirmation('')
    setAdministrativePassword('')
    setAdministrativePasswordConfirmation('')
    setOneTimePassword(null)
    setCreatedInvitation(null)
    setInviteEmail('')
    setInviteIdempotencyKey('')
    setExistingUserId('')
    setMembershipIdempotencyKey('')
    setMembershipReason('')
    setTransferMembershipId('')
    setTransferConfirmation('')
    setContactEmail('')
    setRecipientDrafts([])
  }, [client])

  useEffect(() => {
    if (selected !== 'Account & sessions') {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setRequestedEmail('')
      setEmailRequestPassword('')
    }
    if (selected !== 'SuperAdmin controls') {
      setAdminReason('')
      setAdminConfirmation('')
      setAdministrativePassword('')
      setAdministrativePasswordConfirmation('')
      setOneTimePassword(null)
    }
  }, [selected])

  useEffect(() => {
    if (!featureScopeReady) return
    if (!capabilities.passwordAndSessions) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    if (!capabilities.providerAwareEmailRequests) {
      setRequestedEmail('')
      setEmailRequestPassword('')
    }
    if (!canManageGlobalUserCredentials) {
      setAdministrativePassword('')
      setAdministrativePasswordConfirmation('')
      setOneTimePassword(null)
    }
    if (!canConfirmGlobalUserAction) {
      setAdminReason('')
      setAdminConfirmation('')
    }
    if (!capabilities.memberships) {
      setCreatedInvitation(null)
      setInviteEmail('')
      setInviteIdempotencyKey('')
      setExistingUserId('')
      setMembershipIdempotencyKey('')
      setMembershipReason('')
      setTransferMembershipId('')
      setTransferConfirmation('')
    }
    if (!capabilities.contacts) {
      setContactEmail('')
      setRecipientDrafts([])
    }
  }, [
    canConfirmGlobalUserAction,
    canManageGlobalUserCredentials,
    capabilities.passwordAndSessions,
    capabilities.providerAwareEmailRequests,
    capabilities.contacts,
    capabilities.memberships,
    featureScopeReady,
  ])

  async function performAction<T>(
    key: string,
    action: () => Promise<T>,
    success: string,
  ): Promise<T | undefined> {
    setActionBusy(key)
    setNotice(null)
    try {
      const result = await action()
      setNotice({ kind: 'success', message: success })
      setRefreshKey((value) => value + 1)
      return result
    } catch (error) {
      setNotice({ kind: 'error', message: errorMessage(error) })
      if (error instanceof IdentityClientError && error.status === 412 &&
          (error.code === 'contact_settings_concurrency_conflict' ||
           error.code === 'contact_settings_concurrency_token_required')) {
        setRefreshKey((value) => value + 1)
      }
      return undefined
    } finally {
      setActionBusy(null)
    }
  }

  function requireReason(value: string, label: string): string | null {
    const reason = normalizeBoundedIdentityReason(value)
    if (!reason) {
      setNotice({
        kind: 'error',
        message: `${label} is required after trimming and may contain at most ${IDENTITY_REASON_MAX_LENGTH} characters.`,
      })
    }
    return reason
  }

  async function submitPassword(event: FormEvent) {
    event.preventDefault()
    if (!client || !capabilities.passwordAndSessions) return
    if (!isWithinExistingPasswordLimit(currentPassword)) {
      setNotice({ kind: 'error', message: 'The current password exceeds the accepted credential size.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setNotice({ kind: 'error', message: 'New-password confirmation does not match.' })
      return
    }
    if (!isStrongBcryptPassword(newPassword)) {
      setNotice({
        kind: 'error',
        message: `New passwords require at least 12 characters, uppercase, lowercase, and a number, with at most ${IDENTITY_BCRYPT_PASSWORD_MAX_BYTES} UTF-8 bytes.`,
      })
      return
    }
    const result = await performAction(
      'password',
      () => client.changePassword(currentPassword, newPassword, true),
      'Password changed and other sessions were marked for revocation.',
    )
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    if (result) {
      await logout()
    }
  }

  async function submitEmailRequest(event: FormEvent) {
    event.preventDefault()
    if (!client || !capabilities.providerAwareEmailRequests) return
    const normalizedEmail = requestedEmail.trim()
    if (!isBoundedIdentityEmail(normalizedEmail)) {
      setNotice({ kind: 'error', message: 'Enter a valid login email within the accepted length.' })
      return
    }
    if (!isWithinExistingPasswordLimit(emailRequestPassword)) {
      setNotice({ kind: 'error', message: 'The current password exceeds the accepted credential size.' })
      return
    }
    setActionBusy('email-request')
    setNotice(null)
    try {
      await client.requestEmailChange(normalizedEmail, emailRequestPassword)
      setNotice({ kind: 'success', message: 'Verified login-email request created; activation still requires confirmation.' })
      setRequestedEmail('')
      setEmailRequestPassword('')
    } catch (error) {
      if (isIdentityNotificationProviderUnavailable(error)) {
        setNotice({ kind: 'held', message: 'Held / not sent: the request was validated, but no notification provider is configured. No login email changed.' })
        setRequestedEmail('')
        setEmailRequestPassword('')
      } else {
        setNotice({ kind: 'error', message: errorMessage(error) })
        setEmailRequestPassword('')
      }
    } finally {
      setActionBusy(null)
    }
  }

  async function revokeAllSessions() {
    if (!client || !capabilities.passwordAndSessions) return
    const result = await performAction(
      'revoke-sessions',
      () => client.revokeSessions(),
      'All sessions revoked. Sign in again to continue.',
    )
    if (result) await logout()
  }

  async function submitTenantSwitch(event: FormEvent) {
    event.preventDefault()
    if (!client || !capabilities.tenantSwitcher || !currentScopeReady || !selectedSwitchTenantUid ||
        !currentScopeMemberships.some((item) => item.tenantUid === selectedSwitchTenantUid && item.status === 'Active')) return
    const result = await performAction(
      'tenant-switch',
      () => client.switchTenant(selectedSwitchTenantUid),
      'Identity tenant context accepted by the API.',
    )
    if (!result) return
    adoptIdentityTenantSession(result.token, result.legacyTenantId, result.role)
    const membership = currentScopeMemberships.find((item) => item.tenantUid === result.activeTenantUid)
    const mappedTenant = availableTenants.find((tenant) => tenant.tenantId === result.legacyTenantId)
    setCurrentTenant(mappedTenant || {
      id: result.legacyTenantId,
      tenantId: result.legacyTenantId,
      name: membership?.displayName || membership?.canonicalSlug || result.legacyTenantId,
      status: 'active',
    })
  }

  async function submitInvitation(event: FormEvent) {
    event.preventDefault()
    if (!client || !capabilities.memberships || !tenantScopeReady || !selectedManagedTenantUid) return
    const email = inviteEmail.trim()
    if (!isBoundedIdentityEmail(email)) {
      setNotice({ kind: 'error', message: 'Enter a valid invitation email within the accepted length.' })
      return
    }
    const idempotencyKey = stableIdentityIdempotencyKey(inviteIdempotencyKey)
    if (!inviteIdempotencyKey) setInviteIdempotencyKey(idempotencyKey)
    const result = await performAction(
      'invitation',
      () => client.inviteUser(selectedManagedTenantUid, email, inviteRole, idempotencyKey),
      'Invitation creation completed; delivery status was returned by the server.',
    )
    if (result) {
      setInviteEmail('')
      setInviteIdempotencyKey('')
      setCreatedInvitation(result)
      if (result.messageSent) {
        setNotice({ kind: 'success', message: 'Invitation recorded and the server reports that its message was sent.' })
      } else {
        setNotice({
          kind: 'held',
          message: `Held / not sent: invitation recorded with delivery capability ${result.deliveryCapability}; no message was sent.`,
        })
      }
    }
  }

  async function submitExistingMembership(event: FormEvent) {
    event.preventDefault()
    if (!client || !capabilities.memberships || !tenantScopeReady || !selectedManagedTenantUid) return
    const userId = existingUserId.trim()
    if (!userId || userId.length > IDENTITY_IDENTIFIER_MAX_LENGTH) {
      setNotice({ kind: 'error', message: 'Enter a valid immutable user ID within the accepted length.' })
      return
    }
    const idempotencyKey = stableIdentityIdempotencyKey(membershipIdempotencyKey)
    if (!membershipIdempotencyKey) setMembershipIdempotencyKey(idempotencyKey)
    const result = await performAction(
      'add-membership',
      () => client.addMembership(selectedManagedTenantUid, userId, existingUserRole, idempotencyKey),
      'Existing user membership added.',
    )
    if (result) {
      setExistingUserId('')
      setMembershipIdempotencyKey('')
    }
  }

  async function revokeCreatedInvitation() {
    if (!client || !capabilities.memberships || !tenantScopeReady || !createdInvitation ||
        createdInvitation.tenantUid !== selectedManagedTenantUid) return
    const reason = requireReason(membershipReason, 'Invitation revocation reason')
    if (!reason) return
    const result = await performAction(
      'revoke-invitation',
      () => client.revokeInvitation(createdInvitation.tenantUid, createdInvitation.id, reason),
      'Pending invitation revoked.',
    )
    if (result) setCreatedInvitation(null)
  }

  async function submitTransfer(event: FormEvent) {
    event.preventDefault()
    if (!client || !canTransferTenantAdmin || !tenantScopeReady || !selectedManagedTenantUid) return
    const reason = requireReason(membershipReason, 'TenantAdmin transfer reason')
    if (!reason || transferConfirmation.trim() !== 'TRANSFER TENANT ADMIN' || !transferMembershipId.trim()) return
    await performAction(
      'tenant-admin-transfer',
      () => client.transferTenantAdmin(selectedManagedTenantUid, transferMembershipId, reason, transferConfirmation),
      'Primary TenantAdmin responsibility transferred. Verify and transfer back before synthetic cleanup.',
    )
  }

  async function submitContacts(event: FormEvent) {
    event.preventDefault()
    if (!client || !capabilities.contacts || !tenantScopeReady || !selectedManagedTenantUid || !contactSettings) return
    const primaryContactEmail = contactEmail.trim()
    if (!isBoundedIdentityEmail(primaryContactEmail)) {
      setNotice({ kind: 'error', message: 'Enter a valid primary contact email within the accepted length.' })
      return
    }
    if (recipientDrafts.length > IDENTITY_RECIPIENT_MAX_COUNT) {
      setNotice({ kind: 'error', message: `At most ${IDENTITY_RECIPIENT_MAX_COUNT} notification recipients are allowed.` })
      return
    }
    if (!contactSettings.concurrencyToken?.trim()) {
      setNotice({
        kind: 'error',
        message: 'Contact settings cannot be saved without a client-observed concurrency token. Reload before editing.',
      })
      return
    }
    const normalized = recipientDrafts.map((recipient, order) => ({
      id: recipient.id.trim(),
      email: recipient.email.trim().normalize('NFKC'),
      normalizedEmail: normalizeIdentityEmail(recipient.email),
      order,
      isActive: recipient.isActive,
      isVerified: recipient.isVerified,
      replyTo: recipient.replyTo ?? null,
      createdAt: recipient.createdAt,
      updatedAt: recipient.updatedAt,
    }))
    if (normalized.some((recipient) =>
      !recipient.id || recipient.id.length > IDENTITY_IDENTIFIER_MAX_LENGTH ||
      !isBoundedIdentityEmail(recipient.email) ||
      Boolean(recipient.replyTo) && !isBoundedIdentityEmail(recipient.replyTo || ''),
    )) {
      setNotice({ kind: 'error', message: 'Each recipient needs a valid bounded ID, email, and optional reply-to email.' })
      return
    }
    const uniqueEmails = new Set(normalized.map((recipient) => recipient.normalizedEmail))
    if (uniqueEmails.size !== normalized.length) {
      setNotice({ kind: 'error', message: 'Notification recipients must be unique within the tenant.' })
      return
    }
    await performAction(
      'contact-settings',
      () => client.updateContactSettings(selectedManagedTenantUid, {
        primaryContactEmail,
        recipients: normalized,
        defaultNotificationPolicy: notificationPolicy,
        formDefinitionOverrides: contactSettings.formDefinitionOverrides || {},
        expectedConcurrencyToken: contactSettings.concurrencyToken!.trim(),
      }),
      'Tenant contact and notification settings saved. Lead persistence was not changed.',
    )
  }

  const availableGlobalUsers = globalUsersReady && globalUsersToken === token &&
    globalUsersRefreshKey === refreshKey ? globalUsers : []
  const selectedGlobalUser = availableGlobalUsers.find((item) => item.userId === selectedGlobalUserId) || null
  const selectedGlobalUserIsSynthetic = selectedGlobalUser?.isSyntheticValidation === true
  const globalUserConfirmationMatches = Boolean(
    selectedGlobalUser && adminConfirmation.trim().toLowerCase() === selectedGlobalUser.loginEmail.toLowerCase(),
  )
  const filteredGlobalUsers = availableGlobalUsers.filter((item) => {
    const query = globalSearch.trim().toLowerCase()
    return !query || item.loginEmail.toLowerCase().includes(query) || item.userId.toLowerCase().includes(query)
  })

  async function submitAdministrativeEmail(event: FormEvent) {
    event.preventDefault()
    if (!client || !capabilities.superAdmin || !selectedGlobalUser || !globalUserConfirmationMatches) return
    const reason = requireReason(adminReason, 'Administrative reason')
    const newEmail = administrativeEmail.trim()
    if (!reason) return
    if (!isBoundedIdentityEmail(newEmail)) {
      setNotice({ kind: 'error', message: 'Enter a valid administrative login email within the accepted length.' })
      return
    }
    await performAction(
      'admin-email',
      () => client.changeAdministrativeEmail(
        selectedGlobalUser.userId,
        newEmail,
        reason,
        true,
        forcePasswordChange,
      ),
      'Administrative login email changed and prior sessions revoked.',
    )
  }

  async function issueTemporaryPassword() {
    if (!client || !canManageGlobalUserCredentials || !selectedGlobalUser || !globalUserConfirmationMatches) return
    const reason = requireReason(adminReason, 'Administrative reason')
    if (!reason) return
    const targetUserId = selectedGlobalUser.userId
    setOneTimePassword(null)
    const result = await performAction(
      'temporary-password',
      () => client.issueTemporaryPassword(targetUserId, reason, true),
      'Temporary password issued once; forced rotation remains required.',
    )
    if (result?.userId === targetUserId && selectedGlobalUserId === targetUserId) {
      setOneTimePassword(result)
    }
  }

  async function submitAdministrativePassword(event: FormEvent) {
    event.preventDefault()
    if (!client || !canManageGlobalUserCredentials || !selectedGlobalUser || !globalUserConfirmationMatches) return
    const reason = requireReason(adminReason, 'Administrative reason')
    if (!reason) return
    if (administrativePassword !== administrativePasswordConfirmation) {
      setNotice({ kind: 'error', message: 'Administrative password confirmation does not match.' })
      return
    }
    if (!isStrongBcryptPassword(administrativePassword)) {
      setNotice({
        kind: 'error',
        message: `New passwords require at least 12 characters, uppercase, lowercase, and a number, with at most ${IDENTITY_BCRYPT_PASSWORD_MAX_BYTES} UTF-8 bytes.`,
      })
      return
    }
    await performAction(
      'admin-password-reset',
      () => client.resetPassword(selectedGlobalUser.userId, administrativePassword, reason, true),
      'Password reset completed, sessions revoked, and forced rotation enabled.',
    )
    setAdministrativePassword('')
    setAdministrativePasswordConfirmation('')
  }

  const sectionEntries: Array<readonly [SectionName, string]> = isSuperAdmin
    ? [...baseSections, ['SuperAdmin controls', 'Global identity readback and explicitly confirmed synthetic validation controls.']]
    : [...baseSections]

  const activeMemberships = currentScopeMemberships.filter((membership) => membership.status === 'Active')
  const displayedProfile = currentScopeReady ? profile : null
  const displayedTenantMemberships = tenantScopeReady ? tenantMemberships : []
  const displayedTenantAuditEvents = tenantScopeReady ? auditEvents : []
  const globalSecurityScopeReady = globalSecurityReady && globalSecurityToken === token &&
    globalSecurityRefreshKey === refreshKey
  const displayedGlobalAuditEvents = globalSecurityScopeReady ? globalAuditEvents : []
  const displayedMigrationConflicts = globalSecurityScopeReady ? migrationConflicts : []
  const displayedSessions = sessionDataReady && sessionDataToken === token &&
    sessionDataRefreshKey === refreshKey ? sessions : []
  const transferTargets = displayedTenantMemberships.filter((membership) =>
    membership.status === 'Active' && membership.role === 'TenantAdmin' && !membership.isPrimaryTenantAdmin,
  )
  const membershipReasonValue = normalizeBoundedIdentityReason(membershipReason)
  const adminReasonValue = normalizeBoundedIdentityReason(adminReason)
  const selectedManagedTenant = managedTenants.find((tenant) => tenant.tenantUid === selectedManagedTenantUid) || null
  const showTenantAdministrationScope = tenantAdministrationSections.includes(selected)

  return (
    <main className="space-y-6 p-6 lg:p-8" aria-labelledby="identity-title">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 id="identity-title" className="text-2xl font-semibold text-neutral-900">Identity & tenant administration</h1>
          <p className="mt-1 text-sm text-neutral-600">
            Authenticated identity controls for {currentTenant?.name || 'the active account context'}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Identity runtime summary">
          <StatusPill enabled={runtimeState.foundationEnabled} label="Foundation" />
          <StatusPill enabled={capabilities.read} label="Read" />
          <StatusPill enabled={capabilities.mutate} label="Mutations" />
          <StatusPill enabled={false} label="Rename held" />
        </div>
      </div>

      {featureLoading && (
        <div role="status" className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
          Reading authenticated identity feature state…
        </div>
      )}
      {featureError && (
        <div role="alert" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
          Feature-state readback failed: {featureError}
        </div>
      )}
      {!featureLoading && featureScopeReady && !capabilities.read && (
        <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Identity read pages remain gated until foundation, dual-read, and management readback are all enabled.
        </div>
      )}
      {capabilities.read && !capabilities.mutate && (
        <div role="status" className="rounded-lg border border-sky-300 bg-sky-50 p-4 text-sm text-sky-900">
          Read-only identity stage is active. Mutation controls remain disabled until production dual-write and their specific runtime gates are enabled.
        </div>
      )}
      {notice && (
        <div
          role="alert"
          className={`rounded-lg border p-4 text-sm ${notice.kind === 'success'
            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
            : notice.kind === 'held'
              ? 'border-amber-300 bg-amber-50 text-amber-900'
              : 'border-red-300 bg-red-50 text-red-900'}`}
        >
          {notice.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <nav aria-label="Identity settings" className="space-y-2">
          {sectionEntries.map(([name]) => (
            <button
              key={name}
              type="button"
              onClick={() => { setSelected(name); setNotice(null) }}
              aria-current={selected === name ? 'page' : undefined}
              className={`w-full rounded-lg px-4 py-3 text-left text-sm font-medium ${selected === name ? 'bg-primary-50 text-primary-800' : 'bg-white text-neutral-700 hover:bg-neutral-100'}`}
            >
              {name}
            </button>
          ))}
        </nav>

        <section className="min-w-0 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-neutral-900">{selected}</h2>
          <p className="mt-1 text-sm text-neutral-600">{sectionEntries.find(([name]) => name === selected)?.[1]}</p>

          {showTenantAdministrationScope && capabilities.read && (
            <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
              <label className="block text-sm font-medium text-sky-950">
                {isSuperAdmin ? 'SuperAdmin tenant administration scope' : 'Tenant administration scope'}
                <select
                  value={selectedManagedTenantUid}
                  onChange={(event) => setSelectedManagedTenantUid(event.target.value)}
                  disabled={managedTenants.length === 0 || actionBusy !== null}
                  className="input mt-1 w-full disabled:bg-neutral-100"
                >
                  {managedTenants.map((tenant) => (
                    <option key={tenant.tenantUid} value={tenant.tenantUid}>
                      {identityTenantLabel(tenant)} — {tenant.canonicalSlug || tenant.legacyTenantId || tenant.tenantUid} ({tenant.status})
                    </option>
                  ))}
                </select>
              </label>
              <p className="mt-2 text-xs text-sky-800">
                Administration scope: {selectedManagedTenant ? identityTenantLabel(selectedManagedTenant) : 'none available'}.
                This selector reads and manages tenant-scoped identity data only; it never issues or replaces a tenant-switch token.
              </p>
              {tenantDataLoading && <p role="status" className="mt-2 text-sm text-sky-900">Loading the selected tenant administration scope…</p>}
              {globalTenantsLoading && isSuperAdmin && <p role="status" className="mt-2 text-sm text-sky-900">Loading the authorized global tenant inventory…</p>}
              {globalTenantsError && isSuperAdmin && <p role="alert" className="mt-2 text-sm text-red-800">Global tenant inventory unavailable: {globalTenantsError}</p>}
              {tenantDataError && <p role="alert" className="mt-2 text-sm text-red-800">Selected tenant reads failed closed: {tenantDataError}</p>}
            </div>
          )}

          {currentDataError && selected !== 'Overview' && (
            <p role="alert" className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{currentDataError}</p>
          )}

          {selected === 'Overview' && (
            <div className="mt-6 space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {([
                  ['Foundation', runtimeState.foundationEnabled],
                  ['Dual read', runtimeState.dualReadEnabled],
                  ['Dual write', runtimeState.dualWriteEnabled],
                  ['Tenant switcher', runtimeState.tenantSwitcherEnabled],
                  ['Password & sessions', runtimeState.passwordAndSessionManagementEnabled],
                  ['Memberships', runtimeState.membershipManagementEnabled],
                  ['Contact settings', runtimeState.contactManagementEnabled],
                  ['SuperAdmin management', runtimeState.superAdminManagementEnabled],
                  ['Email request workflow', runtimeState.providerAwareEmailRequestsEnabled],
                ] as Array<[string, boolean]>).map(([label, enabled]) => (
                  <div key={label} className="rounded-lg border border-neutral-200 p-3">
                    <div className="text-sm font-medium text-neutral-800">{label}</div>
                    <div className={`mt-1 text-xs ${enabled ? 'text-emerald-700' : 'text-neutral-500'}`}>{enabled ? 'Enabled' : 'Disabled'}</div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-neutral-200 p-4">
                <h3 className="font-semibold text-neutral-900">Current identity profile</h3>
                {currentDataLoading ? (
                  <p role="status" className="mt-2 text-sm text-neutral-500">Loading the current identity profile…</p>
                ) : displayedProfile ? (
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div><dt className="text-neutral-500">Login email</dt><dd className="font-medium text-neutral-900">{displayedProfile.loginEmail}</dd></div>
                    <div><dt className="text-neutral-500">Verification</dt><dd>{displayedProfile.emailVerified ? 'Verified' : 'Not verified'}</dd></div>
                    <div><dt className="text-neutral-500">Session version</dt><dd>{displayedProfile.sessionVersion}</dd></div>
                    <div><dt className="text-neutral-500">Forced rotation</dt><dd>{displayedProfile.forcePasswordChange ? 'Required' : 'Not required'}</dd></div>
                  </dl>
                ) : currentDataReady && <p className="mt-2 text-sm text-neutral-500">No profile is available under the current read gate.</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <strong>Tenant rename is disabled pending V2.8.63D.</strong>
                  <p className="mt-1">No rename input, preflight action, execution action, or rollback action is exposed by this Admin surface.</p>
                </div>
                <div className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
                  <strong>Email delivery provider:</strong> {runtimeState.notificationProviderEnabled ? 'configured' : 'not configured'}.
                  <p className="mt-1">Lead persistence remains independent. The UI never claims a verification, reset, or invitation email was sent while the provider is unavailable.</p>
                </div>
              </div>
            </div>
          )}

          {selected === 'Account & sessions' && (
            <div className="mt-6 space-y-8">
              <form onSubmit={submitPassword} className="space-y-4 rounded-lg border border-neutral-200 p-4">
                <div><h3 className="font-semibold text-neutral-900">Change my password</h3><p className="text-sm text-neutral-500">At least 12 characters with uppercase, lowercase, and a number; 72 UTF-8 bytes maximum.</p></div>
                <label className="block text-sm font-medium text-neutral-700">Current password
                  <input type="password" autoComplete="current-password" maxLength={IDENTITY_EXISTING_PASSWORD_MAX_BYTES} required value={featureScopeReady ? currentPassword : ''} onChange={(event) => setCurrentPassword(event.target.value)} disabled={!capabilities.passwordAndSessions || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-medium text-neutral-700">New password
                    <input type="password" autoComplete="new-password" minLength={12} maxLength={IDENTITY_BCRYPT_PASSWORD_MAX_BYTES} required value={featureScopeReady ? newPassword : ''} onChange={(event) => setNewPassword(event.target.value)} disabled={!capabilities.passwordAndSessions || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" />
                  </label>
                  <label className="block text-sm font-medium text-neutral-700">Confirm new password
                    <input type="password" autoComplete="new-password" minLength={12} maxLength={IDENTITY_BCRYPT_PASSWORD_MAX_BYTES} required value={featureScopeReady ? confirmPassword : ''} onChange={(event) => setConfirmPassword(event.target.value)} disabled={!capabilities.passwordAndSessions || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" />
                  </label>
                </div>
                <button className="btn btn-primary disabled:opacity-50" disabled={!capabilities.passwordAndSessions || actionBusy !== null}>{actionBusy === 'password' ? 'Changing…' : 'Change password and revoke other sessions'}</button>
                {!capabilities.passwordAndSessions && <DisabledReason>Password/session mutation is not enabled by authenticated runtime state.</DisabledReason>}
              </form>

              <div className="rounded-lg border border-neutral-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><h3 className="font-semibold text-neutral-900">Sessions</h3><p className="text-sm text-neutral-500">Current session version: {displayedProfile?.sessionVersion ?? 'unavailable'}.</p></div>
                  <button type="button" className="btn btn-secondary disabled:opacity-50" disabled={!capabilities.passwordAndSessions || actionBusy !== null} onClick={revokeAllSessions}>{actionBusy === 'revoke-sessions' ? 'Revoking…' : 'Revoke all sessions and sign out'}</button>
                </div>
                {sessionDataError && <p className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-800">Session inventory API unavailable: {sessionDataError}</p>}
                {sessionDataLoading && <p role="status" className="mt-3 text-sm text-neutral-500">Loading the current session inventory…</p>}
                {displayedSessions.length > 0 && <ul className="mt-3 divide-y divide-neutral-200">{displayedSessions.map((session) => <li key={session.sessionId} className="py-3 text-sm"><strong>{session.current ? 'Current session' : session.sessionId}</strong><span className="ml-2 text-neutral-500">Issued {formatDate(session.issuedAt)} · last seen {formatDate(session.lastSeenAt)} · expires {formatDate(session.expiresAt)}</span></li>)}</ul>}
              </div>

              <form onSubmit={submitEmailRequest} className="space-y-4 rounded-lg border border-neutral-200 p-4">
                <div><h3 className="font-semibold text-neutral-900">Request verified login-email change</h3><p className="text-sm text-neutral-500">Current login email: {displayedProfile?.loginEmail || user?.email || 'unavailable'}.</p></div>
                {!runtimeState.notificationProviderEnabled && <div role="status" className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Provider unavailable: no message will be claimed sent and no email will activate from this screen.</div>}
                <label className="block text-sm font-medium text-neutral-700">Requested login email
                  <input type="email" required maxLength={IDENTITY_EMAIL_MAX_LENGTH} value={featureScopeReady ? requestedEmail : ''} onChange={(event) => setRequestedEmail(event.target.value)} disabled={!capabilities.providerAwareEmailRequests || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" />
                </label>
                <label className="block text-sm font-medium text-neutral-700">Current password
                  <input type="password" autoComplete="current-password" maxLength={IDENTITY_EXISTING_PASSWORD_MAX_BYTES} required value={featureScopeReady ? emailRequestPassword : ''} onChange={(event) => setEmailRequestPassword(event.target.value)} disabled={!capabilities.providerAwareEmailRequests || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" />
                </label>
                <button className="btn btn-primary disabled:opacity-50" disabled={!capabilities.providerAwareEmailRequests || actionBusy !== null}>{actionBusy === 'email-request' ? 'Requesting…' : 'Request verified change'}</button>
                {!capabilities.providerAwareEmailRequests && <DisabledReason>Provider-aware email requests are held by runtime policy.</DisabledReason>}
              </form>
            </div>
          )}

          {selected === 'Tenant switcher' && (
            <form onSubmit={submitTenantSwitch} className="mt-6 space-y-4">
              <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm"><strong>Legacy Admin context:</strong> {currentTenant?.name || 'none'}<br /><strong>Identity membership context:</strong> {currentScopeMemberships.find((item) => item.tenantUid === selectedSwitchTenantUid) ? identityMembershipLabel(currentScopeMemberships.find((item) => item.tenantUid === selectedSwitchTenantUid)!) : 'none'}</div>
              <label className="block text-sm font-medium text-neutral-700">Active membership
                <select value={selectedSwitchTenantUid} onChange={(event) => setSelectedSwitchTenantUid(event.target.value)} disabled={!capabilities.read || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100">
                  {currentScopeMemberships.map((membership) => <option key={membership.membershipId} value={membership.tenantUid} disabled={membership.status !== 'Active'}>{identityMembershipLabel(membership)} — {membership.role} ({membership.status})</option>)}
                </select>
              </label>
              <button className="btn btn-primary disabled:opacity-50" disabled={!capabilities.tenantSwitcher || !activeMemberships.some((item) => item.tenantUid === selectedSwitchTenantUid) || actionBusy !== null}>{actionBusy === 'tenant-switch' ? 'Switching…' : 'Switch tenant'}</button>
              {!capabilities.tenantSwitcher && <DisabledReason>Tenant switching requires dual-write and the tenant-switcher mutation gate. Suspended and unknown memberships are never offered as an active target.</DisabledReason>}
            </form>
          )}

          {selected === 'Users & memberships' && (
            <div className="mt-6 space-y-8">
              <div className="grid gap-5 xl:grid-cols-2">
                <form onSubmit={submitInvitation} className="space-y-4 rounded-lg border border-neutral-200 p-4">
                  <div><h3 className="font-semibold text-neutral-900">Invite user</h3><p className="text-sm text-neutral-500">Invitation delivery remains provider-aware.</p></div>
                  <label className="block text-sm font-medium">Email<input type="email" required maxLength={IDENTITY_EMAIL_MAX_LENGTH} value={tenantScopeReady ? inviteEmail : ''} onChange={(event) => setInviteEmail(event.target.value)} disabled={!capabilities.memberships || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100" /></label>
                  <label className="block text-sm font-medium">Tenant role<select value={inviteRole} onChange={(event) => setInviteRole(event.target.value as TenantRole)} disabled={!capabilities.memberships || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100">{roles.map((role) => <option key={role} value={role} disabled={role === 'TenantAdmin' && !isSuperAdmin}>{role}</option>)}</select></label>
                  <button className="btn btn-primary disabled:opacity-50" disabled={!capabilities.memberships || tenantMutationBusy}>Create invitation</button>
                  {tenantScopeReady && createdInvitation && <div role="status" className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><strong>Pending invitation:</strong> {createdInvitation.normalizedEmail} · delivery {createdInvitation.deliveryCapability} · message sent: {createdInvitation.messageSent ? 'yes' : 'no'}.<button type="button" className="mt-2 block font-medium underline disabled:opacity-50" disabled={!membershipReasonValue || actionBusy !== null} onClick={revokeCreatedInvitation}>Revoke this invitation</button></div>}
                </form>
                <form onSubmit={submitExistingMembership} className="space-y-4 rounded-lg border border-neutral-200 p-4">
                  <div><h3 className="font-semibold text-neutral-900">Add existing user</h3><p className="text-sm text-neutral-500">Use the immutable identity user ID, not an email lookup.</p></div>
                  <label className="block text-sm font-medium">User ID<input required maxLength={IDENTITY_IDENTIFIER_MAX_LENGTH} value={tenantScopeReady ? existingUserId : ''} onChange={(event) => setExistingUserId(event.target.value)} disabled={!capabilities.memberships || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100" /></label>
                  <label className="block text-sm font-medium">Tenant role<select value={existingUserRole} onChange={(event) => setExistingUserRole(event.target.value as TenantRole)} disabled={!capabilities.memberships || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100">{roles.map((role) => <option key={role} value={role} disabled={role === 'TenantAdmin' && !isSuperAdmin}>{role}</option>)}</select></label>
                  <button className="btn btn-primary disabled:opacity-50" disabled={!capabilities.memberships || tenantMutationBusy}>Add membership</button>
                </form>
              </div>

              <label className="block text-sm font-medium text-neutral-700">Required audit reason for role, status, and transfer actions
                <input required maxLength={IDENTITY_REASON_MAX_LENGTH} value={tenantScopeReady ? membershipReason : ''} onChange={(event) => setMembershipReason(event.target.value)} disabled={!tenantScopeReady} className="input mt-1 w-full disabled:bg-neutral-100" placeholder="Controlled synthetic validation or approved administrative reason" />
              </label>

              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <table className="min-w-full divide-y divide-neutral-200 text-sm">
                  <caption className="sr-only">Memberships in the selected authorized tenant administration scope</caption>
                  <thead className="bg-neutral-50"><tr><th scope="col" className="px-4 py-3 text-left">User</th><th scope="col" className="px-4 py-3 text-left">Role</th><th scope="col" className="px-4 py-3 text-left">Status</th><th scope="col" className="px-4 py-3 text-left">Protection</th></tr></thead>
                  <tbody className="divide-y divide-neutral-200">{displayedTenantMemberships.map((membership) => {
                    const finalAdmin = isFinalActiveTenantAdmin(displayedTenantMemberships, membership.membershipId)
                    return <tr key={membership.membershipId}><td className="px-4 py-3 font-mono text-xs">{membership.userId}</td><td className="px-4 py-3"><select aria-label={`Role for ${membership.userId}`} value={membership.role} disabled={!capabilities.memberships || !membershipReasonValue || finalAdmin || tenantMutationBusy} onChange={(event) => client && membershipReasonValue && performAction(`role-${membership.membershipId}`, () => client.changeMembershipRole(selectedManagedTenantUid, membership.membershipId, event.target.value as TenantRole, membershipReasonValue), 'Membership role changed.')} className="input min-w-32 disabled:bg-neutral-100">{roles.map((role) => <option key={role} value={role} disabled={role === 'TenantAdmin' && !isSuperAdmin}>{role}</option>)}</select></td><td className="px-4 py-3"><select aria-label={`Status for ${membership.userId}`} value={membership.status} disabled={!capabilities.memberships || !membershipReasonValue || finalAdmin || tenantMutationBusy} onChange={(event) => client && membershipReasonValue && performAction(`status-${membership.membershipId}`, () => client.changeMembershipStatus(selectedManagedTenantUid, membership.membershipId, event.target.value as IdentityRecordStatus, membershipReasonValue), 'Membership status changed.')} className="input min-w-32 disabled:bg-neutral-100">{membershipStatuses.map((status) => <option key={status} disabled={!canSetIdentityMembershipStatus(membership, status, isSuperAdmin)}>{status}</option>)}</select></td><td className="px-4 py-3">{finalAdmin ? <span className="font-medium text-amber-700">Final active TenantAdmin protected</span> : membership.isPrimaryTenantAdmin ? 'Primary TenantAdmin' : 'Standard'}</td></tr>
                  })}</tbody>
                </table>
                {tenantScopeReady && displayedTenantMemberships.length === 0 && <p className="p-6 text-center text-sm text-neutral-500">No authorized tenant membership rows were returned.</p>}
              </div>

              {isSuperAdmin && (
                <form onSubmit={submitTransfer} className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div><h3 className="font-semibold text-amber-950">Protected TenantAdmin transfer</h3><p className="text-sm text-amber-800">Use only after isolated proof. Keep the original admin active and transfer back before cleanup.</p></div>
                  <label className="block text-sm font-medium">Target active TenantAdmin<select required value={tenantScopeReady ? transferMembershipId : ''} onChange={(event) => setTransferMembershipId(event.target.value)} disabled={!canTransferTenantAdmin || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100"><option value="">Select target</option>{transferTargets.map((membership) => <option key={membership.membershipId} value={membership.membershipId}>{membership.userId}</option>)}</select></label>
                  <label className="block text-sm font-medium">Typed confirmation<input required maxLength={IDENTITY_CONFIRMATION_MAX_LENGTH} value={tenantScopeReady ? transferConfirmation : ''} onChange={(event) => setTransferConfirmation(event.target.value)} placeholder="TRANSFER TENANT ADMIN" disabled={!canTransferTenantAdmin || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100" /></label>
                  <button className="btn btn-primary disabled:opacity-50" disabled={!canTransferTenantAdmin || !membershipReasonValue || transferConfirmation !== 'TRANSFER TENANT ADMIN' || !transferMembershipId || tenantMutationBusy}>Transfer primary TenantAdmin</button>
                </form>
              )}
            </div>
          )}

          {selected === 'Contact & notifications' && (
            <form onSubmit={submitContacts} className="mt-6 space-y-6">
              <div className="rounded border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900"><strong>Lead persistence:</strong> independent · <strong>Delivery capability:</strong> {tenantScopeReady && contactSettings ? contactSettings.deliveryCapability : 'unavailable until the selected scope loads'}</div>
              <label className="block text-sm font-medium">Primary contact email<input type="email" required maxLength={IDENTITY_EMAIL_MAX_LENGTH} value={tenantScopeReady ? contactEmail : ''} onChange={(event) => setContactEmail(event.target.value)} disabled={!capabilities.contacts || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100" /></label>
              <label className="block text-sm font-medium">Default notification policy<select value={tenantScopeReady ? notificationPolicy : 'all-active'} onChange={(event) => setNotificationPolicy(event.target.value)} disabled={!capabilities.contacts || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100"><option value="legacy-compatible">Legacy compatible (preserve existing behavior)</option><option value="all-active">All active recipients</option><option value="first-active">First active recipient</option><option value="suppressed">Suppress delivery</option></select></label>
              <div className="space-y-3">
                <div className="flex items-center justify-between"><h3 className="font-semibold">Notification recipients</h3><button type="button" className="btn btn-secondary disabled:opacity-50" disabled={!capabilities.contacts || tenantMutationBusy || recipientDrafts.length >= IDENTITY_RECIPIENT_MAX_COUNT} onClick={() => setRecipientDrafts((items) => items.length >= IDENTITY_RECIPIENT_MAX_COUNT ? items : [...items, { id: crypto.randomUUID().replaceAll('-', ''), email: '', normalizedEmail: '', order: items.length, isActive: false, isVerified: false }])}>Add inactive recipient</button></div>
                {(tenantScopeReady ? recipientDrafts : []).map((recipient, index) => <div key={recipient.id} className="grid gap-3 rounded border border-neutral-200 p-3 md:grid-cols-[1fr_auto_auto] md:items-end"><label className="block text-sm font-medium">Recipient email<input type="email" required maxLength={IDENTITY_EMAIL_MAX_LENGTH} value={recipient.email} onChange={(event) => setRecipientDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, email: event.target.value } : item))} disabled={!capabilities.contacts || tenantMutationBusy} className="input mt-1 w-full disabled:bg-neutral-100" /></label><label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" checked={recipient.isActive} onChange={(event) => setRecipientDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, isActive: event.target.checked } : item))} disabled={!capabilities.contacts || tenantMutationBusy} />Active</label><button type="button" className="btn btn-secondary" disabled={!capabilities.contacts || tenantMutationBusy} onClick={() => setRecipientDrafts((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button><p className="text-xs text-neutral-500 md:col-span-3">Server-managed verification: {recipient.isVerified ? 'verified' : 'not verified'}. New recipients start inactive; this form cannot grant verification.</p></div>)}
                {tenantScopeReady && recipientDrafts.length === 0 && <p className="rounded border border-dashed p-5 text-center text-sm text-neutral-500">No notification recipients configured.</p>}
              </div>
              <button className="btn btn-primary disabled:opacity-50" disabled={!capabilities.contacts || !contactSettings?.concurrencyToken || tenantMutationBusy}>{actionBusy === 'contact-settings' ? 'Saving…' : 'Save contact and notification settings'}</button>
              {tenantScopeReady && contactSettings && !contactSettings.concurrencyToken && <DisabledReason>Saving is held because the API did not return an opaque client-observed concurrency token.</DisabledReason>}
              {!capabilities.contacts && <DisabledReason>Contact and notification writes require dual-write and the contact-management mutation gate.</DisabledReason>}
            </form>
          )}

          {selected === 'Security audit' && (
            <div className="mt-6 space-y-6">
              <div className="overflow-x-auto rounded-lg border border-neutral-200">
                <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3"><h3 className="font-semibold text-neutral-900">Selected-tenant audit</h3><p className="text-xs text-neutral-500">Authorized events for {managedTenants.find((tenant) => tenant.tenantUid === selectedManagedTenantUid)?.displayName || selectedManagedTenantUid || 'the selected tenant'}.</p></div>
                <table className="min-w-full divide-y divide-neutral-200 text-sm"><caption className="sr-only">Identity security audit for the selected authorized tenant scope</caption><thead className="bg-neutral-50"><tr><th scope="col" className="px-4 py-3 text-left">Time</th><th scope="col" className="px-4 py-3 text-left">Event</th><th scope="col" className="px-4 py-3 text-left">Actor</th><th scope="col" className="px-4 py-3 text-left">Target</th><th scope="col" className="px-4 py-3 text-left">Tenant</th><th scope="col" className="px-4 py-3 text-left">Request</th><th scope="col" className="px-4 py-3 text-left">Result</th><th scope="col" className="px-4 py-3 text-left">Reason</th></tr></thead><tbody className="divide-y divide-neutral-200">{displayedTenantAuditEvents.map((event) => <tr key={event.id}><td className="whitespace-nowrap px-4 py-3">{formatDate(event.createdAt)}</td><td className="px-4 py-3 font-medium">{event.eventType}</td><td className="px-4 py-3 font-mono text-xs">{event.actorUserId || 'system'}</td><td className="px-4 py-3 font-mono text-xs">{event.targetUserId || '—'}</td><td className="px-4 py-3 font-mono text-xs">{event.targetTenantUid || selectedManagedTenantUid}</td><td className="px-4 py-3 font-mono text-xs">{event.requestId || '—'}</td><td className="px-4 py-3">{event.result || 'recorded'}</td><td className="px-4 py-3">{event.reason || '—'}</td></tr>)}</tbody></table>
                {tenantScopeReady && displayedTenantAuditEvents.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">No authorized tenant audit events were returned.</p>}
              </div>
              {isSuperAdmin && (
                <>
                  {globalSecurityError && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{globalSecurityError}</p>}
                  {globalSecurityLoading && <p role="status" className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">Loading the current global audit and reconciliation generation…</p>}
                  <div className="overflow-x-auto rounded-lg border border-neutral-200">
                    <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3"><h3 className="font-semibold text-neutral-900">SuperAdmin global audit readback</h3><p className="text-xs text-neutral-500">Read-only security events across all tenants; mutation controls remain separately gated.</p></div>
                    <table className="min-w-full divide-y divide-neutral-200 text-sm"><caption className="sr-only">Global identity security audit across all authorized tenant scopes</caption><thead className="bg-neutral-50"><tr><th scope="col" className="px-4 py-3 text-left">Time</th><th scope="col" className="px-4 py-3 text-left">Event</th><th scope="col" className="px-4 py-3 text-left">Actor</th><th scope="col" className="px-4 py-3 text-left">Target</th><th scope="col" className="px-4 py-3 text-left">Tenant</th><th scope="col" className="px-4 py-3 text-left">Request</th><th scope="col" className="px-4 py-3 text-left">Result</th><th scope="col" className="px-4 py-3 text-left">Reason</th></tr></thead><tbody className="divide-y divide-neutral-200">{displayedGlobalAuditEvents.map((event) => <tr key={event.id}><td className="whitespace-nowrap px-4 py-3">{formatDate(event.createdAt)}</td><td className="px-4 py-3 font-medium">{event.eventType}</td><td className="px-4 py-3 font-mono text-xs">{event.actorUserId || 'system'}</td><td className="px-4 py-3 font-mono text-xs">{event.targetUserId || '—'}</td><td className="px-4 py-3 font-mono text-xs">{event.targetTenantUid || 'global'}</td><td className="px-4 py-3 font-mono text-xs">{event.requestId || '—'}</td><td className="px-4 py-3">{event.result || 'recorded'}</td><td className="px-4 py-3">{event.reason || '—'}</td></tr>)}</tbody></table>
                    {globalSecurityScopeReady && displayedGlobalAuditEvents.length === 0 && <p className="p-8 text-center text-sm text-neutral-500">No global audit events were returned.</p>}
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-neutral-200">
                    <div className="border-b border-neutral-200 bg-neutral-50 px-4 py-3"><h3 className="font-semibold text-neutral-900">Migration and reconciliation readback</h3><p className="text-xs text-neutral-500">Safe status projection only; credentials and mutation payloads are never returned.</p></div>
                    <table className="min-w-full divide-y divide-neutral-200 text-sm"><caption className="sr-only">Identity migration and reconciliation status records</caption><thead className="bg-neutral-50"><tr><th scope="col" className="px-4 py-3 text-left">Time</th><th scope="col" className="px-4 py-3 text-left">Type</th><th scope="col" className="px-4 py-3 text-left">User</th><th scope="col" className="px-4 py-3 text-left">Scope</th><th scope="col" className="px-4 py-3 text-left">Operation</th><th scope="col" className="px-4 py-3 text-left">Request</th><th scope="col" className="px-4 py-3 text-left">Status</th><th scope="col" className="px-4 py-3 text-left">Safe code</th></tr></thead><tbody className="divide-y divide-neutral-200">{displayedMigrationConflicts.map((item) => <tr key={item.id}><td className="whitespace-nowrap px-4 py-3">{formatDate(item.createdAt)}</td><td className="px-4 py-3 font-medium">{item.type || item.category || 'identity-reconciliation'}</td><td className="px-4 py-3 font-mono text-xs">{item.userId || '—'}</td><td className="px-4 py-3 font-mono text-xs">{item.tenantUid || item.legacyTenantId || 'global'}</td><td className="px-4 py-3">{item.operation || '—'}</td><td className="px-4 py-3 font-mono text-xs">{item.requestId || '—'}</td><td className="px-4 py-3">{item.status || 'recorded'}</td><td className="px-4 py-3">{item.safeCode || '—'}</td></tr>)}</tbody></table>
                    {globalSecurityScopeReady && displayedMigrationConflicts.length === 0 && <p className="p-8 text-center text-sm text-emerald-700">No migration conflicts or reconciliation records were returned.</p>}
                  </div>
                </>
              )}
            </div>
          )}

          {selected === 'SuperAdmin controls' && isSuperAdmin && (
            <div className="mt-6 space-y-6">
              {globalUsersError && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{globalUsersError}</p>}
              {globalUsersLoading && <p role="status" className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">Loading the current global user generation…</p>}
              <label className="block text-sm font-medium">Search global users<input maxLength={IDENTITY_SEARCH_MAX_LENGTH} value={globalSearch} onChange={(event) => setGlobalSearch(event.target.value)} disabled={!canReadGlobalUsers} className="input mt-1 w-full disabled:bg-neutral-100" placeholder="Email or immutable user ID" /></label>
              <label className="block text-sm font-medium">Selected global user<select value={selectedGlobalUserId} onChange={(event) => setSelectedGlobalUserId(event.target.value)} disabled={!canReadGlobalUsers || !globalUsersReady || globalUsersToken !== token || globalUsersRefreshKey !== refreshKey || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100"><option value="">Select user</option>{filteredGlobalUsers.map((item) => <option key={item.userId} value={item.userId}>{item.loginEmail} — {item.status}</option>)}</select></label>
              {selectedGlobalUser && <div className="rounded border border-neutral-200 bg-neutral-50 p-3 text-sm"><strong>User ID:</strong> <span className="font-mono">{selectedGlobalUser.userId}</span><br /><strong>Role:</strong> {selectedGlobalUser.globalRole} · <strong>Session version:</strong> {selectedGlobalUser.sessionVersion}<br /><strong>Server validation marker:</strong> {selectedGlobalUserIsSynthetic ? 'synthetic validation identity' : 'absent or false (status proof held)'}</div>}

              <label className="block text-sm font-medium">Required administrative reason<input required maxLength={IDENTITY_REASON_MAX_LENGTH} value={selectedGlobalUser ? adminReason : ''} onChange={(event) => setAdminReason(event.target.value)} disabled={!canConfirmGlobalUserAction || !selectedGlobalUser || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" /></label>
              <label className="block text-sm font-medium">Confirm selected login email<input maxLength={IDENTITY_CONFIRMATION_MAX_LENGTH} value={selectedGlobalUser ? adminConfirmation : ''} onChange={(event) => setAdminConfirmation(event.target.value)} disabled={!canConfirmGlobalUserAction || !selectedGlobalUser || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" autoComplete="off" /></label>

              <form onSubmit={submitAdministrativeEmail} className="space-y-4 rounded-lg border border-neutral-200 p-4">
                <h3 className="font-semibold">Administrative login-email change</h3>
                <label className="block text-sm font-medium">New login email<input type="email" required maxLength={IDENTITY_EMAIL_MAX_LENGTH} value={selectedGlobalUser ? administrativeEmail : ''} onChange={(event) => setAdministrativeEmail(event.target.value)} disabled={!capabilities.superAdmin || !selectedGlobalUser || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(selectedGlobalUser && forcePasswordChange)} onChange={(event) => setForcePasswordChange(event.target.checked)} disabled={!capabilities.superAdmin || !selectedGlobalUser || actionBusy !== null} />Force password change at next login</label>
                <button className="btn btn-primary disabled:opacity-50" disabled={!capabilities.superAdmin || !selectedGlobalUser || !adminReasonValue || !globalUserConfirmationMatches || actionBusy !== null}>Change email and revoke sessions</button>
              </form>

              <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-950">Password and session controls</h3>
                <form onSubmit={submitAdministrativePassword} className="grid gap-3 md:grid-cols-2">
                  <label className="block text-sm font-medium">New controlled password (72 UTF-8 bytes max)<input type="password" autoComplete="new-password" minLength={12} maxLength={IDENTITY_BCRYPT_PASSWORD_MAX_BYTES} required value={selectedGlobalUser ? administrativePassword : ''} onChange={(event) => setAdministrativePassword(event.target.value)} disabled={!canManageGlobalUserCredentials || !selectedGlobalUser || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" /></label>
                  <label className="block text-sm font-medium">Confirm controlled password<input type="password" autoComplete="new-password" minLength={12} maxLength={IDENTITY_BCRYPT_PASSWORD_MAX_BYTES} required value={selectedGlobalUser ? administrativePasswordConfirmation : ''} onChange={(event) => setAdministrativePasswordConfirmation(event.target.value)} disabled={!canManageGlobalUserCredentials || !selectedGlobalUser || actionBusy !== null} className="input mt-1 w-full disabled:bg-neutral-100" /></label>
                  <button className="btn btn-primary disabled:opacity-50 md:col-span-2" disabled={!canManageGlobalUserCredentials || !selectedGlobalUser || !adminReasonValue || !globalUserConfirmationMatches || actionBusy !== null}>Reset password, revoke sessions, and force rotation</button>
                </form>
                <div className="flex flex-wrap gap-3"><button type="button" className="btn btn-primary disabled:opacity-50" disabled={!canManageGlobalUserCredentials || !selectedGlobalUser || !adminReasonValue || !globalUserConfirmationMatches || actionBusy !== null} onClick={issueTemporaryPassword}>Issue one-time temporary password</button><button type="button" className="btn btn-secondary disabled:opacity-50" disabled={!canManageGlobalUserCredentials || !selectedGlobalUser || !adminReasonValue || !globalUserConfirmationMatches || actionBusy !== null} onClick={() => canManageGlobalUserCredentials && client && selectedGlobalUser && adminReasonValue && performAction('force-sign-out', () => client.forceSignOut(selectedGlobalUser.userId, adminReasonValue), 'Selected user forced to sign in again.')}>Force sign-out</button></div>
                {!canManageGlobalUserCredentials && <DisabledReason>Global password reset, temporary password, and force sign-out activate at the password-and-session management stage.</DisabledReason>}
                {oneTimePassword && selectedGlobalUser && oneTimePassword.userId === selectedGlobalUser.userId && <div aria-label="One-time temporary password handoff" className="rounded border border-amber-400 bg-white p-4"><strong>Shown once — place only in the restricted one-time handoff:</strong><output className="mt-2 block break-all font-mono text-sm">{oneTimePassword.temporaryPassword}</output><button type="button" className="mt-3 text-sm font-medium text-amber-900 underline" onClick={() => setOneTimePassword(null)}>Dismiss and clear from this screen</button></div>}
              </div>

              <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <h3 className="font-semibold text-red-950">Synthetic-only status proof</h3>
                <p className="text-sm text-red-800">Disable/restore controls require the immutable server-derived synthetic-validation marker. A missing or false marker fails closed regardless of the login email.</p>
                <div className="flex gap-3"><button type="button" className="btn btn-secondary disabled:opacity-50" disabled={!capabilities.superAdmin || !selectedGlobalUserIsSynthetic || !adminReasonValue || !globalUserConfirmationMatches || actionBusy !== null} onClick={() => client && selectedGlobalUser && adminReasonValue && performAction('suspend-synthetic', () => client.setGlobalUserStatus(selectedGlobalUser.userId, 'Suspended', adminReasonValue), 'Synthetic identity suspended.')}>Disable synthetic identity</button><button type="button" className="btn btn-secondary disabled:opacity-50" disabled={!capabilities.superAdmin || !selectedGlobalUserIsSynthetic || !adminReasonValue || !globalUserConfirmationMatches || actionBusy !== null} onClick={() => client && selectedGlobalUser && adminReasonValue && performAction('restore-synthetic', () => client.setGlobalUserStatus(selectedGlobalUser.userId, 'Active', adminReasonValue), 'Synthetic identity restored.')}>Restore synthetic identity</button></div>
              </div>
            </div>
          )}
        </section>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-600">
        Legacy profile names remain available under <Link href="/dashboard/users" className="font-medium text-primary-700 underline">Users/Admins</Link>, but login-email mutation is held there to prevent divergence. Login identity changes belong only in this feature-gated surface.
      </div>
    </main>
  )
}
