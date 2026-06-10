import type {
  OutboundLinkApiEnvelope,
  OutboundLinkApiMeta,
  OutboundLinkAuditLogRecord,
  OutboundLinkDashboardSummary,
  OutboundLinkDetailResult,
  OutboundLinkExportStatus,
  OutboundLinkInstanceRecord,
  OutboundLinkListResult,
  OutboundLinkPaginationMeta,
  OutboundLinkPolicyRecord,
  OutboundLinkQueryState,
  OutboundLinkRecord,
  OutboundLinkSortDirection,
  OutboundLinkSortField,
  OutboundLinkStatus,
  OutboundLinkStoreSnapshot,
} from './types'

export const OUTBOUND_LINK_READONLY_MODE = 'admin-local-fake-readonly'
export const OUTBOUND_LINK_API_ROUTES = {
  links: '/api/admin/outbound-links',
  instances: '/api/admin/outbound-link-instances',
  policies: '/api/admin/outbound-link-policies',
  scanRuns: '/api/admin/outbound-link-scan-runs',
  audit: '/api/admin/outbound-link-audit',
  dashboardSummary: '/api/admin/outbound-link-dashboard-summary',
} as const

export const defaultOutboundLinkQuery: OutboundLinkQueryState = {
  search: '',
  domain: 'all',
  status: 'all',
  reviewOnly: false,
  page: 1,
  pageSize: 5,
  sortField: 'lastDetectedAt',
  sortDirection: 'desc',
}

const timestamp = {
  first: '2026-06-01T14:00:00.000Z',
  second: '2026-06-04T16:45:00.000Z',
  third: '2026-06-06T11:20:00.000Z',
  fourth: '2026-06-08T20:15:00.000Z',
  latest: '2026-06-10T12:00:00.000Z',
}

interface BaseLinkInput {
  id: string
  originalUrl: string
  domain: string
  status: OutboundLinkStatus
  policyStatus: string
  renderAction: OutboundLinkRecord['renderAction']
  createdAt: string
  updatedAt: string
  firstDetectedAt: string
  lastDetectedAt: string
  disabledBy?: string | null
  disabledAt?: string | null
  disabledReason?: string | null
}

const baseLinks: BaseLinkInput[] = [
  {
    id: 'ol_docs_help',
    originalUrl: 'https://docs.example/help',
    domain: 'docs.example',
    status: 'active',
    policyStatus: 'allowed domain',
    renderAction: 'active_link',
    createdAt: timestamp.first,
    updatedAt: timestamp.latest,
    firstDetectedAt: timestamp.first,
    lastDetectedAt: timestamp.latest,
  },
  {
    id: 'ol_example_home_cta',
    originalUrl: 'https://example.com/home-cta',
    domain: 'example.com',
    status: 'active',
    policyStatus: 'allowed domain',
    renderAction: 'active_link',
    createdAt: timestamp.first,
    updatedAt: timestamp.latest,
    firstDetectedAt: timestamp.first,
    lastDetectedAt: timestamp.latest,
  },
  {
    id: 'ol_partner_vendors',
    originalUrl: 'https://partner.example/vendors',
    domain: 'partner.example',
    status: 'pending_review',
    policyStatus: 'pending domain review',
    renderAction: 'plain_text',
    createdAt: timestamp.second,
    updatedAt: timestamp.latest,
    firstDetectedAt: timestamp.second,
    lastDetectedAt: timestamp.latest,
  },
  {
    id: 'ol_social_profile',
    originalUrl: 'https://social.example/fixture-rink',
    domain: 'social.example',
    status: 'disabled',
    policyStatus: 'disabled by local policy',
    renderAction: 'plain_text',
    createdAt: timestamp.third,
    updatedAt: timestamp.fourth,
    firstDetectedAt: timestamp.third,
    lastDetectedAt: timestamp.fourth,
    disabledBy: 'local-admin-fixture',
    disabledAt: timestamp.fourth,
    disabledReason: 'Read-only fixture for disabled link rendering review.',
  },
  {
    id: 'ol_blocked_coupon',
    originalUrl: 'https://blocked.example/coupon',
    domain: 'blocked.example',
    status: 'domain_blocked',
    policyStatus: 'blocked domain',
    renderAction: 'hidden',
    createdAt: timestamp.third,
    updatedAt: timestamp.latest,
    firstDetectedAt: timestamp.third,
    lastDetectedAt: timestamp.latest,
    disabledBy: 'local-admin-fixture',
    disabledAt: timestamp.latest,
    disabledReason: 'Domain appears on the local blocked-domain fixture list.',
  },
  {
    id: 'ol_theme_reference',
    originalUrl: 'https://example.com/theme-reference',
    domain: 'example.com',
    status: 'active',
    policyStatus: 'allowed domain',
    renderAction: 'active_link',
    createdAt: timestamp.second,
    updatedAt: timestamp.third,
    firstDetectedAt: timestamp.second,
    lastDetectedAt: timestamp.third,
  },
]

interface BaseInstanceInput {
  id: string
  outboundLinkId: string
  pageId: string | null
  contentType: string
  contentBlockId: string | null
  fieldName: string
  anchorText: string | null
  locationPath: string
  isEnabled: boolean
  status: OutboundLinkInstanceRecord['status']
  firstDetectedAt: string
  lastDetectedAt: string
}

const baseInstances: BaseInstanceInput[] = [
  {
    id: 'oli_nav_docs',
    outboundLinkId: 'ol_docs_help',
    pageId: null,
    contentType: 'navigation',
    contentBlockId: null,
    fieldName: 'href',
    anchorText: 'Help Docs',
    locationPath: '$.navigation.items[1].href',
    isEnabled: true,
    status: 'enabled',
    firstDetectedAt: timestamp.first,
    lastDetectedAt: timestamp.latest,
  },
  {
    id: 'oli_home_cta',
    outboundLinkId: 'ol_example_home_cta',
    pageId: 'home',
    contentType: 'page',
    contentBlockId: 'hero',
    fieldName: 'ctaUrl',
    anchorText: 'Plan an event',
    locationPath: '$.pages.home.blocks.hero.ctaUrl',
    isEnabled: true,
    status: 'enabled',
    firstDetectedAt: timestamp.first,
    lastDetectedAt: timestamp.latest,
  },
  {
    id: 'oli_home_partner',
    outboundLinkId: 'ol_partner_vendors',
    pageId: 'home',
    contentType: 'rich-text',
    contentBlockId: 'partners',
    fieldName: 'html',
    anchorText: 'partner vendors',
    locationPath: '$.pages.home.blocks.partners.html',
    isEnabled: false,
    status: 'pending_review',
    firstDetectedAt: timestamp.second,
    lastDetectedAt: timestamp.latest,
  },
  {
    id: 'oli_footer_social',
    outboundLinkId: 'ol_social_profile',
    pageId: null,
    contentType: 'footer',
    contentBlockId: null,
    fieldName: 'socialLinks[0].url',
    anchorText: 'Social profile',
    locationPath: '$.footer.socialLinks[0].url',
    isEnabled: false,
    status: 'disabled',
    firstDetectedAt: timestamp.third,
    lastDetectedAt: timestamp.fourth,
  },
  {
    id: 'oli_coupon_banner',
    outboundLinkId: 'ol_blocked_coupon',
    pageId: 'birthday-parties',
    contentType: 'page',
    contentBlockId: 'promo',
    fieldName: 'buttonLink',
    anchorText: 'Coupon',
    locationPath: '$.pages.birthday-parties.blocks.promo.buttonLink',
    isEnabled: false,
    status: 'pending_review',
    firstDetectedAt: timestamp.third,
    lastDetectedAt: timestamp.latest,
  },
  {
    id: 'oli_theme_reference',
    outboundLinkId: 'ol_theme_reference',
    pageId: null,
    contentType: 'theme',
    contentBlockId: null,
    fieldName: 'externalUrl',
    anchorText: 'Theme reference',
    locationPath: '$.theme.externalUrl',
    isEnabled: false,
    status: 'stale',
    firstDetectedAt: timestamp.second,
    lastDetectedAt: timestamp.third,
  },
]

export function getOutboundLinkAdminSnapshot(tenantKey: string, siteKey?: string): OutboundLinkStoreSnapshot {
  const normalizedTenant = normalizeKey(tenantKey || 'fixture-tenant')
  const normalizedSite = normalizeKey(siteKey || normalizedTenant || 'fixture-site')
  const linksWithoutCounts = baseLinks.map((link) => ({
    ...link,
    tenantKey: normalizedTenant,
    siteKey: normalizedSite,
    normalizedUrl: link.originalUrl,
    createdBy: 'local-admin-fixture',
    disabledBy: link.disabledBy ?? null,
    disabledAt: link.disabledAt ?? null,
    disabledReason: link.disabledReason ?? null,
    instanceCount: 0,
    activeInstanceCount: 0,
    staleInstanceCount: 0,
    pendingReviewCount: 0,
  }))
  const linksById = new Map(linksWithoutCounts.map((link) => [link.id, link]))
  const instances = baseInstances.map((instance) => {
    const link = linksById.get(instance.outboundLinkId)
    return {
      ...instance,
      tenantKey: normalizedTenant,
      siteKey: normalizedSite,
      domain: link?.domain || 'unknown',
      normalizedUrl: link?.normalizedUrl || '',
      renderAction: link?.renderAction || 'plain_text',
    }
  })
  const links = linksWithoutCounts.map((link) => {
    const linkInstances = instances.filter((instance) => instance.outboundLinkId === link.id)
    return {
      ...link,
      instanceCount: linkInstances.length,
      activeInstanceCount: linkInstances.filter((instance) => instance.isEnabled && instance.status === 'enabled').length,
      staleInstanceCount: linkInstances.filter((instance) => instance.status === 'stale').length,
      pendingReviewCount: linkInstances.filter((instance) => instance.status === 'pending_review').length,
    }
  })
  const policies = buildPolicies(normalizedTenant, normalizedSite)
  const scanRuns = buildScanRuns(normalizedTenant, normalizedSite)
  const auditLogs = buildAuditLogs(normalizedTenant, normalizedSite)

  return {
    tenantKey: normalizedTenant,
    siteKey: normalizedSite,
    links,
    instances,
    policies,
    activePolicyId: policies[0]?.id || null,
    scanRuns,
    auditLogs,
    dashboardSummary: buildDashboardSummary(links, instances, policies, scanRuns, auditLogs),
  }
}

export function listOutboundLinks(snapshot: OutboundLinkStoreSnapshot, query: OutboundLinkQueryState): OutboundLinkListResult {
  const filtered = filterLinks(snapshot.links, query)
  const sorted = sortLinks(filtered, query.sortField, query.sortDirection)
  const totalItems = sorted.length
  const totalPages = Math.max(1, Math.ceil(totalItems / query.pageSize))
  const page = Math.min(Math.max(query.page, 1), totalPages)
  const start = (page - 1) * query.pageSize

  return {
    items: sorted.slice(start, start + query.pageSize),
    pagination: {
      page,
      pageSize: query.pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}

export function getOutboundLinkDetail(snapshot: OutboundLinkStoreSnapshot, id: string): OutboundLinkDetailResult | null {
  const link = snapshot.links.find((item) => item.id === id)
  if (!link) return null

  return {
    link,
    instances: snapshot.instances.filter((instance) => instance.outboundLinkId === id),
    activePolicy: snapshot.policies.find((policy) => policy.id === snapshot.activePolicyId) || null,
  }
}

export function listReviewQueue(snapshot: OutboundLinkStoreSnapshot) {
  const linkIds = new Set(
    snapshot.links
      .filter((link) => link.status === 'pending_review' || link.pendingReviewCount > 0 || link.status === 'domain_blocked')
      .map((link) => link.id),
  )
  snapshot.instances
    .filter((instance) => instance.status === 'pending_review')
    .forEach((instance) => linkIds.add(instance.outboundLinkId))

  return snapshot.links.filter((link) => linkIds.has(link.id))
}

export function getOutboundLinkExportStatuses(snapshot: OutboundLinkStoreSnapshot): OutboundLinkExportStatus[] {
  return [
    {
      label: 'Backup Center export',
      status: 'included',
      detail: `${snapshot.links.length} registry records and ${snapshot.instances.length} placement records are available to local backup candidates.`,
    },
    {
      label: 'Tenant website bundle',
      status: 'ready',
      detail: 'Registry, policy, scan-run, audit, and render-decision summaries match the local bundle handoff shape.',
    },
    {
      label: 'Onboarding import validation',
      status: 'ready',
      detail: 'Pending-review domains remain visible for operator review before future write approval.',
    },
    {
      label: 'Write action escrow',
      status: 'blocked',
      detail: 'Enable, disable, policy edit, and scan execution are intentionally not approved in this phase.',
    },
  ]
}

export function createOutboundLinkEnvelope<T>(
  tenantKey: string,
  siteKey: string,
  data: T,
  pagination?: OutboundLinkPaginationMeta,
  filters?: Record<string, string | null>,
): OutboundLinkApiEnvelope<T> {
  return {
    ok: true,
    status: 200,
    code: 'OK',
    message: 'local read-only outbound link data',
    data,
    errors: [],
    meta: createReadOnlyMeta(pagination, filters),
    tenantKey,
    siteKey,
    requestId: `oladmin_${tenantKey}_${siteKey}`,
  }
}

export function getOutboundLinkDomains(snapshot: OutboundLinkStoreSnapshot) {
  return snapshot.dashboardSummary.domains
}

export function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
}

function buildPolicies(tenantKey: string, siteKey: string): OutboundLinkPolicyRecord[] {
  return [
    {
      id: 'policy_local_default',
      tenantKey,
      siteKey,
      name: 'Default tenant outbound link policy',
      defaultDisabledBehavior: 'plain_text',
      defaultRel: ['noopener', 'noreferrer'],
      externalTargetBehavior: 'blank',
      allowedDomains: ['docs.example', 'example.com'],
      blockedDomains: ['blocked.example'],
      pendingReviewDomains: ['partner.example', 'social.example'],
      reviewRequiredForNewDomains: true,
      source: OUTBOUND_LINK_READONLY_MODE,
    },
  ]
}

function buildScanRuns(tenantKey: string, siteKey: string) {
  return [
    {
      id: 'olsr_local_fixture_latest',
      tenantKey,
      siteKey,
      status: 'completed',
      mode: OUTBOUND_LINK_READONLY_MODE,
      startedAt: timestamp.latest,
      completedAt: timestamp.latest,
      pagesScanned: 4,
      linksFound: 6,
      newLinksFound: 1,
      staleInstancesFound: 1,
    },
    {
      id: 'olsr_tenant_bundle_review',
      tenantKey,
      siteKey,
      status: 'completed_with_warnings',
      mode: 'tenant-bundle-local',
      startedAt: timestamp.fourth,
      completedAt: timestamp.fourth,
      pagesScanned: 3,
      linksFound: 5,
      newLinksFound: 2,
      staleInstancesFound: 0,
    },
  ]
}

function buildAuditLogs(tenantKey: string, siteKey: string): OutboundLinkAuditLogRecord[] {
  return [
    {
      id: 'ola_policy_seeded',
      tenantKey,
      siteKey,
      action: 'policy_seeded',
      recordType: 'outbound_link_policy',
      recordId: 'policy_local_default',
      actor: 'local-admin-fixture',
      reason: 'Read-only Admin policy fixture loaded.',
      createdAt: timestamp.first,
      mode: OUTBOUND_LINK_READONLY_MODE,
    },
    {
      id: 'ola_scan_merged',
      tenantKey,
      siteKey,
      action: 'scan_merged',
      recordType: 'outbound_link_scan_run',
      recordId: 'olsr_local_fixture_latest',
      actor: 'local-admin-fixture',
      reason: 'Fixture scan results merged into local read-only store.',
      createdAt: timestamp.latest,
      mode: OUTBOUND_LINK_READONLY_MODE,
    },
    {
      id: 'ola_blocked_domain_reviewed',
      tenantKey,
      siteKey,
      action: 'domain_blocked_fixture',
      recordType: 'outbound_link',
      recordId: 'ol_blocked_coupon',
      actor: 'local-admin-fixture',
      reason: 'Blocked-domain example retained for UI visibility.',
      createdAt: timestamp.latest,
      mode: OUTBOUND_LINK_READONLY_MODE,
    },
  ]
}

function buildDashboardSummary(
  links: OutboundLinkRecord[],
  instances: OutboundLinkInstanceRecord[],
  policies: OutboundLinkPolicyRecord[],
  scanRuns: ReturnType<typeof buildScanRuns>,
  auditLogs: OutboundLinkAuditLogRecord[],
): OutboundLinkDashboardSummary {
  const domains = Array.from(new Set(links.map((link) => link.domain))).sort()
  return {
    linkCount: links.length,
    instanceCount: instances.length,
    policyCount: policies.length,
    scanRunCount: scanRuns.length,
    auditLogCount: auditLogs.length,
    domainCount: domains.length,
    domains,
    linksByStatus: countBy(links, (link) => link.status),
    instancesByStatus: countBy(instances, (instance) => instance.status),
    pendingReviewCount: links.filter((link) => link.status === 'pending_review' || link.pendingReviewCount > 0).length,
    disabledLinkCount: links.filter((link) => link.status === 'disabled').length,
    domainBlockedLinkCount: links.filter((link) => link.status === 'domain_blocked').length,
    staleInstanceCount: instances.filter((instance) => instance.status === 'stale').length,
  }
}

function filterLinks(links: OutboundLinkRecord[], query: OutboundLinkQueryState) {
  const search = query.search.trim().toLowerCase()
  return links.filter((link) => {
    const matchesSearch = !search ||
      link.originalUrl.toLowerCase().includes(search) ||
      link.domain.toLowerCase().includes(search) ||
      link.id.toLowerCase().includes(search)
    const matchesDomain = query.domain === 'all' || link.domain === query.domain
    const matchesStatus = query.status === 'all' || link.status === query.status
    const matchesReview = !query.reviewOnly ||
      link.status === 'pending_review' ||
      link.status === 'domain_blocked' ||
      link.pendingReviewCount > 0

    return matchesSearch && matchesDomain && matchesStatus && matchesReview
  })
}

function sortLinks(links: OutboundLinkRecord[], field: OutboundLinkSortField, direction: OutboundLinkSortDirection) {
  return [...links].sort((first, second) => {
    const firstValue = getSortValue(first, field)
    const secondValue = getSortValue(second, field)
    const result = firstValue.localeCompare(secondValue, undefined, { numeric: true, sensitivity: 'base' })
    return direction === 'asc' ? result : -result
  })
}

function getSortValue(link: OutboundLinkRecord, field: OutboundLinkSortField) {
  if (field === 'instanceCount') return String(link.instanceCount).padStart(5, '0')
  return String(link[field] || '')
}

function createReadOnlyMeta(
  pagination?: OutboundLinkPaginationMeta,
  filters?: Record<string, string | null>,
): OutboundLinkApiMeta {
  return {
    mode: OUTBOUND_LINK_READONLY_MODE,
    localOnly: true,
    externalHttpCrawling: false,
    cmsApiCalls: false,
    cmsWrites: false,
    protectedConfigReads: false,
    pagination: pagination ?? null,
    filters,
    sort: null,
  }
}

function countBy<T>(items: T[], select: (item: T) => string) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = select(item)
    counts[key] = (counts[key] || 0) + 1
    return counts
  }, {})
}
