import type { LoginRequest, LoginResponse, UserInfo, Page, Tenant, TenantInfo, Theme, PageChangeSource, PublishRun, ImportRun, FormEntry, MediaAsset, FormDefinition } from 'pumpkin-ts-models'

export interface DashboardStats {
  totalPages: number
  publishedPages: number
  draftPages: number
  mediaFiles: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  title: string
  time: string
  user: string
}

const DEFAULT_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://app-pumpkin-api-prod-centralus-001.azurewebsites.net'
  : 'http://localhost:5064'

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')

interface ApiError {
  message: string
  status: number
  details?: any
}

interface PageUpdateOptions {
  changeSource?: PageChangeSource
  changeSummary?: string
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    if ((config.method || 'GET').toUpperCase() === 'GET' && !config.cache) {
      config.cache = 'no-store'
    }

    console.log('[API Client] Request:', {
      url,
      method: config.method || 'GET',
      hasAuthorization: typeof headers === 'object' && headers !== null && 'Authorization' in headers,
    })

    try {
      const response = await fetch(url, config)

      console.log('[API Client] Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        let errorData: any = {}
        const contentType = response.headers.get('content-type')

        if (contentType?.includes('application/json')) {
          errorData = await response.json().catch(() => ({}))
        } else {
          const text = await response.text().catch(() => '')
          errorData = { message: text || response.statusText }
        }

        console.error('[API Client] Error response:', errorData)

        const errorMessage = errorData.message ||
                           errorData.error ||
                           errorData.title ||
                           `HTTP ${response.status}: ${response.statusText}`

        throw {
          message: errorMessage,
          status: response.status,
          details: errorData
        } as ApiError
      }

      const data = await response.json()
      console.log('[API Client] Success:', data)
      return data
    } catch (error) {
      if ((error as ApiError).status) {
        throw error
      }
      console.error('[API Client] Network error:', error)
      throw {
        message: 'Network error. Please check your connection and ensure the API is accessible.',
        status: 0,
      } as ApiError
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const loginRequest: LoginRequest = { email, password }

    return this.request<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginRequest),
    })
  }

  async verifyToken(token: string): Promise<UserInfo> {
    return this.request<UserInfo>('/api/auth/verify', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  async logout(token: string): Promise<void> {
    return this.request<void>('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  }

  // Get tenants accessible to the authenticated user
  async getTenants(token: string): Promise<Tenant[]> {
    console.log('[API Client] Getting tenants...')
    const response = await this.request<{ tenants: Tenant[], count: number }>(
      '/api/admin/tenants',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    console.log('[API Client] Tenants response:', response)
    return response.tenants
  }

  // Create a new tenant (requires authentication and SuperAdmin role)
  async createTenant(token: string, tenant: Tenant): Promise<Tenant> {
    console.log('[API Client] Creating tenant...')
    const response = await this.request<Tenant>(
      '/api/admin/tenants',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(tenant),
      }
    )

    console.log('[API Client] Tenant created:', response)
    return response
  }

  // Update an existing tenant (requires authentication and SuperAdmin role)
  async updateTenant(token: string, tenantId: string, tenant: Tenant): Promise<Tenant> {
    console.log('[API Client] Updating tenant:', tenantId)
    const response = await this.request<Tenant>(
      `/api/admin/tenants/${tenantId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(tenant),
      }
    )

    console.log('[API Client] Tenant updated:', response)
    return response
  }

  // Regenerate tenant API key (requires authentication and SuperAdmin role)
  async regenerateTenantApiKey(token: string, tenantId: string): Promise<{ tenant: Tenant; apiKey: string }> {
    console.log('[API Client] Regenerating API key for tenant:', tenantId)
    const response = await this.request<{ tenant: Tenant; apiKey: string }>(
      `/api/admin/tenants/${tenantId}/regenerate-api-key`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    console.log('[API Client] API key regenerated')
    return response
  }

  // Delete a tenant (requires authentication and SuperAdmin role)
  async deleteTenant(token: string, tenantId: string): Promise<{ message: string; tenantId: string }> {
    console.log('[API Client] Deleting tenant:', tenantId)
    const response = await this.request<{ message: string; tenantId: string }>(
      `/api/admin/tenants/${tenantId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )

    console.log('[API Client] Tenant deleted:', response)
    return response
  }

  // Get all pages for a tenant (requires authentication)
  async getPages(token: string, tenantId: string): Promise<Page[]> {
    const query = new URLSearchParams({
      tenantId,
      _: String(Date.now()),
    })
    const response = await this.request<{ pages: Page[], count: number, tenantId: string }>(
      `/api/admin/pages?${query.toString()}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return response.pages
  }

  // Get a single page by slug (admin read endpoint, JWT auth)
  async getPage(token: string, tenantId: string, pageSlug: string): Promise<Page> {
    console.log('[API Client] getPage called:', { tenantId, pageSlug })
    const query = new URLSearchParams({
      _: String(Date.now()),
    })
    return this.request<Page>(
      `/api/admin/pages/${encodeURIComponent(tenantId)}/${encodeURIComponent(pageSlug)}?${query.toString()}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  // Create a new page (admin, JWT auth)
  async createPage(token: string, tenantId: string, page: Page): Promise<Page> {
    console.log('[API Client] Creating page:', { tenantId, pageSlug: page.pageSlug })
    return this.request<Page>(
      `/api/admin/pages/${encodeURIComponent(tenantId)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(page),
      }
    )
  }

  // Update an existing page (admin, JWT auth)
  async updatePage(token: string, tenantId: string, pageSlug: string, page: Page, options: PageUpdateOptions = {}): Promise<Page> {
    console.log('[API Client] Updating page:', { tenantId, pageSlug })
    const query = new URLSearchParams()
    if (options.changeSource) {
      query.set('changeSource', options.changeSource)
    }
    if (options.changeSummary) {
      query.set('changeSummary', options.changeSummary)
    }
    const queryString = query.toString()

    return this.request<Page>(
      `/api/admin/pages/${encodeURIComponent(tenantId)}/${encodeURIComponent(pageSlug)}${queryString ? `?${queryString}` : ''}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(page),
      }
    )
  }

  async rollbackPage(token: string, tenantId: string, pageSlug: string, changeSummary?: string): Promise<Page> {
    console.log('[API Client] Rolling back page:', { tenantId, pageSlug })
    const query = new URLSearchParams()
    if (changeSummary) {
      query.set('changeSummary', changeSummary)
    }
    const queryString = query.toString()

    const response = await this.request<{ page: Page }>(
      `/api/admin/pages/${encodeURIComponent(tenantId)}/${encodeURIComponent(pageSlug)}/rollback${queryString ? `?${queryString}` : ''}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return response.page
  }

  async getPublishRuns(token: string, tenantId: string): Promise<PublishRun[]> {
    const response = await this.request<{ publishRuns: PublishRun[]; count: number; tenantId: string }>(
      `/api/admin/${encodeURIComponent(tenantId)}/publish-runs`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return response.publishRuns
  }

  async getPublishRun(token: string, tenantId: string, id: string): Promise<PublishRun> {
    return this.request<PublishRun>(
      `/api/admin/${encodeURIComponent(tenantId)}/publish-runs/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  async createPublishRun(token: string, tenantId: string, publishRun: PublishRun): Promise<PublishRun> {
    return this.request<PublishRun>(
      `/api/admin/${encodeURIComponent(tenantId)}/publish-runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(publishRun),
      }
    )
  }

  async getImportRuns(token: string, tenantId: string): Promise<ImportRun[]> {
    const response = await this.request<{ importRuns: ImportRun[]; count: number; tenantId: string }>(
      `/api/admin/${encodeURIComponent(tenantId)}/import-runs`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return response.importRuns
  }

  async getImportRun(token: string, tenantId: string, id: string): Promise<ImportRun> {
    return this.request<ImportRun>(
      `/api/admin/${encodeURIComponent(tenantId)}/import-runs/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  async createImportRun(token: string, tenantId: string, importRun: ImportRun): Promise<ImportRun> {
    return this.request<ImportRun>(
      `/api/admin/${encodeURIComponent(tenantId)}/import-runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(importRun),
      }
    )
  }

  async getFormEntries(token: string, tenantId: string): Promise<FormEntry[]> {
    const response = await this.request<{ formEntries: FormEntry[]; count: number; tenantId: string }>(
      `/api/admin/${encodeURIComponent(tenantId)}/form-entries`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return response.formEntries
  }

  async getFormEntry(token: string, tenantId: string, id: string): Promise<FormEntry> {
    return this.request<FormEntry>(
      `/api/admin/${encodeURIComponent(tenantId)}/form-entries/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  async updateFormEntryStatus(token: string, tenantId: string, id: string, status: string, tags?: string[]): Promise<FormEntry> {
    return this.request<FormEntry>(
      `/api/admin/${encodeURIComponent(tenantId)}/form-entries/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status, tags }),
      }
    )
  }

  async getMediaAssets(token: string, tenantId: string): Promise<MediaAsset[]> {
    const response = await this.request<{ mediaAssets: MediaAsset[]; count: number; tenantId: string }>(
      `/api/admin/${encodeURIComponent(tenantId)}/media-assets`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return response.mediaAssets
  }

  async getMediaAsset(token: string, tenantId: string, id: string): Promise<MediaAsset> {
    return this.request<MediaAsset>(
      `/api/admin/${encodeURIComponent(tenantId)}/media-assets/${encodeURIComponent(id)}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  async createMediaAsset(token: string, tenantId: string, mediaAsset: MediaAsset): Promise<MediaAsset> {
    return this.request<MediaAsset>(
      `/api/admin/${encodeURIComponent(tenantId)}/media-assets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(mediaAsset),
      }
    )
  }

  async uploadMediaAsset(token: string, tenantId: string, formData: FormData): Promise<MediaAsset> {
    const url = `${this.baseUrl}/api/admin/${encodeURIComponent(tenantId)}/media-assets/upload`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      const errorData = contentType?.includes('application/json')
        ? await response.json().catch(() => ({}))
        : { message: await response.text().catch(() => response.statusText) }
      throw {
        message: errorData.message || errorData.error || errorData.title || `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
        details: errorData,
      } as ApiError
    }

    return response.json()
  }

  async updateMediaAsset(token: string, tenantId: string, id: string, mediaAsset: MediaAsset): Promise<MediaAsset> {
    return this.request<MediaAsset>(
      `/api/admin/${encodeURIComponent(tenantId)}/media-assets/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(mediaAsset),
      }
    )
  }

  async archiveMediaAsset(token: string, tenantId: string, id: string): Promise<MediaAsset> {
    return this.request<MediaAsset>(
      `/api/admin/${encodeURIComponent(tenantId)}/media-assets/${encodeURIComponent(id)}/archive`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  async restoreMediaAsset(token: string, tenantId: string, id: string): Promise<MediaAsset> {
    return this.request<MediaAsset>(
      `/api/admin/${encodeURIComponent(tenantId)}/media-assets/${encodeURIComponent(id)}/restore`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  async replaceMediaAsset(token: string, tenantId: string, id: string, replacementMediaAssetId: string): Promise<MediaAsset> {
    return this.request<MediaAsset>(
      `/api/admin/${encodeURIComponent(tenantId)}/media-assets/${encodeURIComponent(id)}/replace`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ replacementMediaAssetId }),
      }
    )
  }

  // ===== THEME METHODS =====

  // Get all themes for a tenant
  async getThemes(token: string, tenantId: string): Promise<Theme[]> {
    console.log('[API Client] Getting themes for tenant:', tenantId)
    const response = await this.request<{ themes: Theme[]; count: number; tenantId: string }>(
      `/api/admin/themes/${encodeURIComponent(tenantId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    console.log('[API Client] Themes response:', response)
    return response.themes
  }

  // Get a specific theme by ID
  async getTheme(token: string, tenantId: string, themeId: string): Promise<Theme> {
    console.log('[API Client] Getting theme:', { tenantId, themeId })
    return this.request<Theme>(
      `/api/admin/themes/${encodeURIComponent(tenantId)}/${encodeURIComponent(themeId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  // Get the active theme for a tenant
  async getActiveTheme(token: string, tenantId: string): Promise<Theme | null> {
    console.log('[API Client] Getting active theme for tenant:', tenantId)
    try {
      return await this.request<Theme>(
        `/api/admin/themes/${encodeURIComponent(tenantId)}/active`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )
    } catch (err: any) {
      if (err.status === 404) return null
      throw err
    }
  }

  // Create a new theme
  async createTheme(token: string, tenantId: string, theme: Theme): Promise<Theme> {
    console.log('[API Client] Creating theme:', { tenantId, themeId: theme.themeId })
    return this.request<Theme>(
      `/api/admin/themes/${encodeURIComponent(tenantId)}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(theme),
      }
    )
  }

  // Update an existing theme
  async updateTheme(token: string, tenantId: string, themeId: string, theme: Theme): Promise<Theme> {
    console.log('[API Client] Updating theme:', { tenantId, themeId })
    return this.request<Theme>(
      `/api/admin/themes/${encodeURIComponent(tenantId)}/${encodeURIComponent(themeId)}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(theme),
      }
    )
  }

  // Delete a theme
  async deleteTheme(token: string, tenantId: string, themeId: string): Promise<{ message: string; tenantId: string; themeId: string }> {
    console.log('[API Client] Deleting theme:', { tenantId, themeId })
    return this.request<{ message: string; tenantId: string; themeId: string }>(
      `/api/admin/themes/${encodeURIComponent(tenantId)}/${encodeURIComponent(themeId)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  // ===== FORM DEFINITION METHODS =====

  async getFormDefinitions(token: string, tenantId: string): Promise<FormDefinition[]> {
    const response = await this.request<{ formDefinitions: FormDefinition[]; count: number; tenantId: string }>(
      `/api/admin/forms/${encodeURIComponent(tenantId)}/definitions`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
    return response.formDefinitions
  }

  async getFormDefinition(token: string, tenantId: string, formDefinitionId: string): Promise<FormDefinition> {
    return this.request<FormDefinition>(
      `/api/admin/forms/${encodeURIComponent(tenantId)}/definitions/${encodeURIComponent(formDefinitionId)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  async createFormDefinition(token: string, tenantId: string, definition: FormDefinition): Promise<FormDefinition> {
    return this.request<FormDefinition>(
      `/api/admin/forms/${encodeURIComponent(tenantId)}/definitions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(definition),
      }
    )
  }

  async updateFormDefinition(token: string, tenantId: string, formDefinitionId: string, definition: FormDefinition): Promise<FormDefinition> {
    return this.request<FormDefinition>(
      `/api/admin/forms/${encodeURIComponent(tenantId)}/definitions/${encodeURIComponent(formDefinitionId)}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(definition),
      }
    )
  }

  async deleteFormDefinition(token: string, tenantId: string, formDefinitionId: string): Promise<{ message: string; tenantId: string; id: string }> {
    return this.request<{ message: string; tenantId: string; id: string }>(
      `/api/admin/forms/${encodeURIComponent(tenantId)}/definitions/${encodeURIComponent(formDefinitionId)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    )
  }

  // Get dashboard statistics
  async getDashboardStats(token: string, tenantId: string): Promise<DashboardStats> {
    const pages = await this.getPages(token, tenantId)

    const totalPages = pages.length
    const publishedPages = pages.filter(p => p.isPublished).length
    const draftPages = pages.filter(p => !p.isPublished).length

    // Count unique media referenced in pages (simplified - counts image references in content)
    const mediaCount = this.countMediaReferences(pages)

    return {
      totalPages,
      publishedPages,
      draftPages,
      mediaFiles: mediaCount,
      recentActivity: this.getRecentActivity(pages),
    }
  }

  private countMediaReferences(pages: Page[]): number {
    // This is a simplified count - in a real app you'd query a media library
    // For now, just estimate based on content blocks
    let count = 0
    pages.forEach(page => {
      if (page.ContentData?.ContentBlocks) {
        page.ContentData.ContentBlocks.forEach(block => {
          if (block.type === 'Gallery' || block.type === 'Hero') {
            count += 1
          }
        })
      }
    })
    return count
  }

  private getRecentActivity(pages: Page[]): ActivityItem[] {
    const activities: ActivityItem[] = []

    // Sort pages by updatedAt
    const sortedPages = [...pages]
      .sort((a, b) => {
        const dateA = new Date(a.MetaData?.updatedAt || 0).getTime()
        const dateB = new Date(b.MetaData?.updatedAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 5)

    sortedPages.forEach(page => {
      const wasPublished = page.publishedAt &&
        new Date(page.publishedAt).getTime() > new Date(page.MetaData?.updatedAt || 0).getTime() - 60000

      activities.push({
        title: wasPublished ? `${page.MetaData?.title || page.pageSlug} published` : `${page.MetaData?.title || page.pageSlug} updated`,
        time: this.getRelativeTime(page.MetaData?.updatedAt || page.publishedAt || new Date().toISOString()),
        user: page.MetaData?.author || 'Unknown',
      })
    })

    return activities
  }

  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  // Helper method to create an authenticated client
  withAuth(token: string): ApiClient {
    const client = new ApiClient(this.baseUrl)
    client.setAuthToken(token)
    return client
  }

  private authToken?: string

  private setAuthToken(token: string) {
    this.authToken = token
  }

  // Override request to include auth token if available
  async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (this.authToken) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${this.authToken}`,
      }
    }
    return this.request<T>(endpoint, options)
  }
}

export const apiClient = new ApiClient(API_URL)
export type { ApiError }
