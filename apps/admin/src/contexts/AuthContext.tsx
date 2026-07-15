'use client'

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import type { UserInfo, TenantInfo } from 'pumpkin-ts-models'
import { apiClient } from '@/lib/api'

interface AuthContextType {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  isLoadingTenants: boolean
  tenantLoadError: string | null
  currentTenant: TenantInfo | null
  availableTenants: TenantInfo[]
  setCurrentTenant: (tenant: TenantInfo) => void
  adoptIdentityTenantSession: (replacementToken: string, legacyTenantId: string, tenantRole: string) => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_KEY = 'pumpkin_auth_token'
const USER_KEY = 'pumpkin_user'
const CURRENT_TENANT_KEY = 'pumpkin_current_tenant'

function toTenantInfo(value: unknown): TenantInfo | null {
  if (!value || typeof value !== 'object') return null

  const source = value as Partial<TenantInfo>
  if (!source.tenantId) return null

  return {
    id: String(source.id || source.tenantId),
    tenantId: String(source.tenantId),
    name: String(source.name || source.tenantId),
    status: String(source.status || 'active'),
  }
}

function getStoredTenant() {
  if (typeof window === 'undefined') return null

  try {
    const storedTenant = localStorage.getItem(CURRENT_TENANT_KEY)
    return storedTenant ? toTenantInfo(JSON.parse(storedTenant)) : null
  } catch (error) {
    console.warn('[AuthContext] Ignoring invalid stored tenant:', error)
    localStorage.removeItem(CURRENT_TENANT_KEY)
    return null
  }
}

function getFallbackTenant(user: UserInfo | null) {
  if (!user?.tenantId) return null

  return {
    id: user.tenantId,
    tenantId: user.tenantId,
    name: user.tenantId,
    status: 'active',
  }
}

function isAuthoritativeVerifyRejection(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false
  const status = (error as { status?: unknown }).status
  return status === 401 || status === 403
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTenants, setIsLoadingTenants] = useState(false)
  const [tenantLoadError, setTenantLoadError] = useState<string | null>(null)
  const [currentTenant, setCurrentTenantState] = useState<TenantInfo | null>(null)
  const [availableTenants, setAvailableTenants] = useState<TenantInfo[]>([])
  const tenantLoadGeneration = useRef(0)

  // Load tenants when authenticated
  useEffect(() => {
    const generation = ++tenantLoadGeneration.current
    async function loadTenants() {
      setAvailableTenants([])
      if (!token || !user) {
        console.log('[AuthContext] Skipping tenant load - no token or user')
        if (tenantLoadGeneration.current === generation) {
          setTenantLoadError(null)
          setIsLoadingTenants(false)
        }
        return
      }
      
      console.log('[AuthContext] Loading tenants for user:', user.username, 'tenantId:', user.tenantId)
      
      try {
        setIsLoadingTenants(true)
        setTenantLoadError(null)
        const tenants = (await apiClient.getTenants(token))
          .map(toTenantInfo)
          .filter((tenant): tenant is TenantInfo => Boolean(tenant))
        if (tenantLoadGeneration.current !== generation) return
        console.log('[AuthContext] Loaded tenants:', tenants)
        setAvailableTenants(tenants)
        
        // Set current tenant from localStorage or default to user's tenant
        const storedTenant = getStoredTenant()
        if (storedTenant) {
          // Verify tenant still exists in available list
          const matchedTenant = tenants.find(t => t.tenantId === storedTenant.tenantId)
          if (matchedTenant) {
            console.log('[AuthContext] Using stored tenant:', matchedTenant.name)
            setCurrentTenantState(matchedTenant)
            localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(matchedTenant))
            return
          }
        }
        
        // Default to user's own tenant
        const userTenant = tenants.find(t => t.tenantId === user.tenantId)
        if (userTenant) {
          console.log('[AuthContext] Using user tenant:', userTenant.name)
          setCurrentTenantState(userTenant)
          localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(userTenant))
        } else {
          console.warn('[AuthContext] User tenant not found in available tenants. Available:', tenants.map(t => t.tenantId))
          const fallbackTenant = getFallbackTenant(user)
          if (fallbackTenant) {
            setCurrentTenantState(fallbackTenant)
            localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(fallbackTenant))
          }
        }
      } catch (error) {
        if (tenantLoadGeneration.current !== generation) return
        console.error('[AuthContext] Failed to load tenants:', error)
        setTenantLoadError(error instanceof Error ? error.message : 'Failed to load tenant list')
        const fallbackTenant = getStoredTenant() || getFallbackTenant(user)
        if (fallbackTenant) {
          setCurrentTenantState(fallbackTenant)
          localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(fallbackTenant))
        }
      } finally {
        if (tenantLoadGeneration.current === generation) setIsLoadingTenants(false)
      }
    }
    
    loadTenants()
    return () => {
      if (tenantLoadGeneration.current === generation) tenantLoadGeneration.current += 1
    }
  }, [token, user])

  const setCurrentTenant = (tenant: TenantInfo) => {
    const safeTenant = toTenantInfo(tenant)
    if (!safeTenant) return

    setCurrentTenantState(safeTenant)
    localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(safeTenant))
  }

  const adoptIdentityTenantSession = (replacementToken: string, legacyTenantId: string, tenantRole: string) => {
    if (!replacementToken || !user) return

    const updatedUser: UserInfo = {
      ...user,
      tenantId: legacyTenantId,
      role: user.role === 'SuperAdmin' ? user.role : tenantRole,
    }
    setToken(replacementToken)
    setUser(updatedUser)
    localStorage.setItem(TOKEN_KEY, replacementToken)
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
  }

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY)
        const storedUser = localStorage.getItem(USER_KEY)

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser) as UserInfo
          setToken(storedToken)
          setUser(parsedUser)
          const storedTenant = getStoredTenant()
          const fallbackTenant = storedTenant || getFallbackTenant(parsedUser)
          if (fallbackTenant) {
            setCurrentTenantState(fallbackTenant)
          }
          
          // The verify endpoint is authoritative for explicit authentication and authorization rejection.
          // Network failures retain the local session so a transient outage does not force a logout.
          try {
            const verifiedUser = await apiClient.verifyToken(storedToken)
            setUser(verifiedUser)
            localStorage.setItem(USER_KEY, JSON.stringify(verifiedUser))
            if (!fallbackTenant) {
              const verifiedFallbackTenant = getFallbackTenant(verifiedUser)
              if (verifiedFallbackTenant) {
                setCurrentTenantState(verifiedFallbackTenant)
              }
            }
          } catch (error) {
            if (isAuthoritativeVerifyRejection(error)) {
              setToken(null)
              setUser(null)
              setCurrentTenantState(null)
              setAvailableTenants([])
              setTenantLoadError(null)
              setIsLoadingTenants(false)
              localStorage.removeItem(TOKEN_KEY)
              localStorage.removeItem(USER_KEY)
              localStorage.removeItem(CURRENT_TENANT_KEY)
              window.location.replace('/login')
              return
            }

            console.warn('[AuthContext] Token verification was inconclusive; retaining the local session for a transient failure.', error)
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password)
      
      setToken(response.token)
      setUser(response.user)
      const fallbackTenant = getFallbackTenant(response.user)
      if (fallbackTenant) {
        setCurrentTenantState(fallbackTenant)
        localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(fallbackTenant))
      }
      
      localStorage.setItem(TOKEN_KEY, response.token)
      localStorage.setItem(USER_KEY, JSON.stringify(response.user))
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.message || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      if (token) {
        await apiClient.logout(token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setToken(null)
      setUser(null)
      setCurrentTenantState(null)
      setAvailableTenants([])
      setTenantLoadError(null)
      setIsLoadingTenants(false)
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(CURRENT_TENANT_KEY)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    isLoadingTenants,
    tenantLoadError,
    currentTenant,
    availableTenants,
    setCurrentTenant,
    adoptIdentityTenantSession,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
