'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingTenants, setIsLoadingTenants] = useState(false)
  const [tenantLoadError, setTenantLoadError] = useState<string | null>(null)
  const [currentTenant, setCurrentTenantState] = useState<TenantInfo | null>(null)
  const [availableTenants, setAvailableTenants] = useState<TenantInfo[]>([])

  // Load tenants when authenticated
  useEffect(() => {
    async function loadTenants() {
      if (!token || !user) {
        console.log('[AuthContext] Skipping tenant load - no token or user')
        setIsLoadingTenants(false)
        return
      }
      
      console.log('[AuthContext] Loading tenants for user:', user.username, 'tenantId:', user.tenantId)
      
      try {
        setIsLoadingTenants(true)
        setTenantLoadError(null)
        const tenants = (await apiClient.getTenants(token))
          .map(toTenantInfo)
          .filter((tenant): tenant is TenantInfo => Boolean(tenant))
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
        console.error('[AuthContext] Failed to load tenants:', error)
        setTenantLoadError(error instanceof Error ? error.message : 'Failed to load tenant list')
        const fallbackTenant = getStoredTenant() || getFallbackTenant(user)
        if (fallbackTenant) {
          setCurrentTenantState(fallbackTenant)
          localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(fallbackTenant))
        }
      } finally {
        setIsLoadingTenants(false)
      }
    }
    
    loadTenants()
  }, [token, user])

  const setCurrentTenant = (tenant: TenantInfo) => {
    const safeTenant = toTenantInfo(tenant)
    if (!safeTenant) return

    setCurrentTenantState(safeTenant)
    localStorage.setItem(CURRENT_TENANT_KEY, JSON.stringify(safeTenant))
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
          
          // Optionally verify token with API (if endpoint exists)
          // If verification fails, we'll still trust localStorage until an actual API call fails
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
            // Token verification endpoint may not exist - that's OK
            // We'll trust localStorage and let actual API calls handle auth errors
            console.log('[AuthContext] Token verification skipped (endpoint may not exist)')
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
