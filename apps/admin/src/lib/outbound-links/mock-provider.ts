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
  quickFilter: 'all',
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
  severity: OutboundLinkRecord['severity']
  riskReason: string
  policyStatus: string
  policyExplanation: string
  policyRuleReference: string
  renderAction: OutboundLinkRecord['renderAction']
  sourceContent: string
  sourceType: string
  owner: string
  isBroken: boolean
  isSuspicious: boolean
  isNew: boolean
  hasPolicyViolation: boolean
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
    severity: 'low',
    riskReason: 'Allowed support documentation domain.',
    policyStatus: 'allowed domain',
    policyExplanation: 'This domain appears on the allowed-domain list and keeps the standard safe rel values.',
    policyRuleReference: 'OLM-POLICY-ALLOW-001',
    renderAction: 'active_link',
    sourceContent: 'Header Navigation: Help Docs',
    sourceType: 'Navigation',
    owner: 'Admin',
    isBroken: false,
    isSuspicious: false,
    isNew: false,
    hasPolicyViolation: false,
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
    severity: 'low',
    riskReason: 'Allowed marketing CTA domain.',
    policyStatus: 'allowed domain',
    policyExplanation: 'The selected policy allows example.com and renders this as a normal outbound link.',
    policyRuleReference: 'OLM-POLICY-ALLOW-001',
    renderAction: 'active_link',
    sourceContent: 'Homepage Hero CTA',
    sourceType: 'Landing Page',
    owner: 'Marketing',
    isBroken: false,
    isSuspicious: false,
    isNew: false,
    hasPolicyViolation: false,
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
    severity: 'medium',
    riskReason: 'New partner domain needs owner review before it should render as a live link.',
    policyStatus: 'pending domain review',
    policyExplanation: 'The default policy requires review for new partner domains. The fixture renders this as plain text until approval is allowed.',
    policyRuleReference: 'OLM-POLICY-REVIEW-NEW-DOMAIN',
    renderAction: 'plain_text',
    sourceContent: 'Homepage Partner Vendors Section',
    sourceType: 'Landing Page',
    owner: 'Marketing',
    isBroken: false,
    isSuspicious: false,
    isNew: true,
    hasPolicyViolation: false,
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
    severity: 'medium',
    riskReason: 'Disabled social profile remains visible for audit and restore context.',
    policyStatus: 'disabled by local policy',
    policyExplanation: 'A local fixture decision disables this social profile and renders the placement as plain text.',
    policyRuleReference: 'OLM-DECISION-DISABLED-LOCAL',
    renderAction: 'plain_text',
    sourceContent: 'Footer Social Link',
    sourceType: 'Footer',
    owner: 'SEO',
    isBroken: false,
    isSuspicious: true,
    isNew: false,
    hasPolicyViolation: false,
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
    severity: 'high',
    riskReason: 'Blocked coupon domain should not render publicly until policy changes are approved.',
    policyStatus: 'blocked domain',
    policyExplanation: 'The active policy blocks blocked.example. Current render behavior hides the link in fixture output.',
    policyRuleReference: 'OLM-POLICY-BLOCK-002',
    renderAction: 'hidden',
    sourceContent: 'Birthday Parties Promo CTA',
    sourceType: 'Event Page',
    owner: 'Marketing',
    isBroken: false,
    isSuspicious: true,
    isNew: false,
    hasPolicyViolation: true,
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
    severity: 'low',
    riskReason: 'Allowed theme reference, but the only placement is stale.',
    policyStatus: 'allowed domain',
    policyExplanation: 'The domain is allowed, but the latest scan marks its only placement stale.',
    policyRuleReference: 'OLM-SCAN-STALE-INSTANCE',
    renderAction: 'active_link',
    sourceContent: 'Theme Reference Field',
    sourceType: 'Theme',
    owner: 'System',
    isBroken: false,
    isSuspicious: false,
    isNew: false,
    hasPolicyViolation: false,
    createdAt: timestamp.second,
    updatedAt: timestamp.third,
    firstDetectedAt: timestamp.second,
    lastDetectedAt: timestamp.third,
  },
  {
    id: 'ol_broken_booking',
    originalUrl: 'https://booking.example/checkout',
    domain: 'booking.example',
    status: 'policy_conflict',
    severity: 'critical',
    riskReason: 'Critical booking CTA is fixture-marked as broken and outside allowed policy.',
    policyStatus: 'policy conflict',
    policyExplanation: 'The domain is not allowed yet, the CTA is business-critical, and fixture scan metadata marks it as broken. Future write approval must decide whether to approve, replace, or remove it.',
    policyRuleReference: 'OLM-POLICY-CONFLICT-CRITICAL-CTA',
    renderAction: 'fallback',
    sourceContent: 'Private Event Booking CTA',
    sourceType: 'Event Page',
    owner: 'Admin',
    isBroken: true,
    isSuspicious: true,
    isNew: true,
    hasPolicyViolation: true,
    createdAt: timestamp.latest,
    updatedAt: timestamp.latest,
    firstDetectedAt: timestamp.latest,
    lastDetectedAt: timestamp.latest,
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
  sourceContent: string
  owner: string
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
    sourceContent: 'Header Navigation: Help Docs',
    owner: 'Admin',
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
    sourceContent: 'Homepage Hero CTA',
    owner: 'Marketing',
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
    sourceContent: 'Homepage Partner Vendors Section',
    owner: 'Marketing',
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
    sourceContent: 'Footer Social Link',
    owner: 'SEO',
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
    sourceContent: 'Birthday Parties Promo CTA',
    owner: 'Marketing',
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
    sourceContent: 'Theme Reference Field',
    owner: 'System',
    firstDetectedAt: timestamp.second,
    lastDetectedAt: timestamp.third,
  },
  {
    id: 'oli_booking_cta',
    outboundLinkId: 'ol_broken_booking',
    pageId: 'private-events',
    contentType: 'page',
    contentBlockId: 'booking',
    fieldName: 'bookingUrl',
    anchorText: 'Book private event',
    locationPath: '$.pages.private-events.blocks.booking.bookingUrl',
    isEnabled: false,
    status: 'pending_review',
    sourceContent: 'Private Event Booking CTA',
    owner: 'Admin',
    firstDetectedAt: timestamp.second,
    lastDetectedAt: timestamp.latest,
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
      label: 'Registry Export: Backup Center',
      status: 'included',
      detail: `Includes links, domains, policy decisions, scan history, and ${snapshot.instances.length} placement records for standard backup candidates.`,
    },
    {
      label: 'Registry Export: Tenant Website Bundle',
      status: 'ready',
      detail: 'The local registry can be bundled with tenant website files so operators can restore link governance with page content.',
    },
    {
      label: 'Registry Export: Onboarding Review',
      status: 'ready',
      detail: 'Pending and blocked domains stay visible for onboarding review before any future approval changes status.',
    },
    {
      label: 'Future Action Gate',
      status: 'blocked',
      detail: 'Approve, block, ignore, enable, disable, policy edit, and live scan actions require a separate write-action approval.',
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
    policyConflictCount: links.filter((link) => link.status === 'policy_conflict' || link.hasPolicyViolation).length,
    brokenLinkCount: links.filter((link) => link.isBroken).length,
    suspiciousDomainCount: links.filter((link) => link.isSuspicious).length,
    newLinkCount: links.filter((link) => link.isNew).length,
    lastScan: {
      id: scanRuns[0]?.id || 'not-recorded',
      status: scanRuns[0]?.status || 'not recorded',
      timestamp: scanRuns[0]?.completedAt || scanRuns[0]?.startedAt || '',
      durationSeconds: 42,
      linksScanned: links.length,
      newLinks: links.filter((link) => link.isNew).length,
      violations: links.filter((link) => link.hasPolicyViolation || link.isBroken).length,
    },
    registryActivity: {
      todayDelta: links.filter((link) => link.updatedAt === '2026-06-10T12:00:00.000Z').length,
      weekDelta: 4,
      monthDelta: links.length,
      domainsAdded: 3,
      domainsRemoved: 1,
    },
    domainHealth: {
      allowedDomains: policies.reduce((count, policy) => count + policy.allowedDomains.length, 0),
      pendingDomains: policies.reduce((count, policy) => count + policy.pendingReviewDomains.length, 0),
      blockedDomains: policies.reduce((count, policy) => count + policy.blockedDomains.length, 0),
      brokenDomains: new Set(links.filter((link) => link.isBroken).map((link) => link.domain)).size,
      suspiciousDomains: new Set(links.filter((link) => link.isSuspicious).map((link) => link.domain)).size,
    },
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
    const matchesQuickFilter = matchesQuickFilterValue(link, query.quickFilter)
    const matchesReview = !query.reviewOnly ||
      link.status === 'pending_review' ||
      link.status === 'domain_blocked' ||
      link.status === 'policy_conflict' ||
      link.pendingReviewCount > 0

    return matchesSearch && matchesDomain && matchesStatus && matchesQuickFilter && matchesReview
  })
}

function matchesQuickFilterValue(link: OutboundLinkRecord, filter: OutboundLinkQueryState['quickFilter']) {
  if (filter === 'all') return true
  if (filter === 'pending') return link.status === 'pending_review' || link.pendingReviewCount > 0
  if (filter === 'blocked') return link.status === 'domain_blocked'
  if (filter === 'disabled') return link.status === 'disabled'
  if (filter === 'stale') return link.staleInstanceCount > 0
  if (filter === 'broken') return link.isBroken
  if (filter === 'new') return link.isNew
  return link.status === 'policy_conflict' || link.hasPolicyViolation
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
