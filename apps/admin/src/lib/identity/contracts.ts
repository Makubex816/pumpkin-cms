export type IdentityRecordStatus = 'Pending' | 'Active' | 'Suspended' | 'Revoked' | 'Completed' | 'Failed'
export type TenantRole = 'TenantAdmin' | 'Editor' | 'Viewer'

export interface IdentityMembership {
  membershipId: string
  tenantUid: string
  canonicalSlug: string
  displayName: string
  role: TenantRole
  status: IdentityRecordStatus
  isPrimaryTenantAdmin: boolean
}

export interface CurrentIdentityProfile {
  userId: string
  loginEmail: string
  emailVerified: boolean
  forcePasswordChange: boolean
  sessionVersion: number
}

export interface TenantContactSettings {
  tenantUid: string
  primaryContactEmail: string
  primaryContactVerified: boolean
  deliveryCapability: 'DisabledNoProvider' | 'Suppressed' | 'Configured'
  defaultNotificationPolicy: string
  recipients: Array<{ id: string; email: string; order: number; isActive: boolean; isVerified: boolean }>
  formDefinitionOverrides: Record<string, string[]>
}

export interface IdentityApiError { code: string; message: string; requestId: string }

export const identityFeatureEnabled = process.env.NEXT_PUBLIC_IDENTITY_FOUNDATION_ENABLED === 'true'
