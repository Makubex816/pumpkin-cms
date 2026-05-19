import type { Page, PageRedirect } from 'pumpkin-ts-models'

export type PublishingWarningCategory =
  | 'seo'
  | 'media'
  | 'fulfillment'
  | 'workflow'
  | 'static'
  | 'redirect'
  | 'template'
  | 'form'

export type PublishingWarningSeverity = 'warning' | 'error'

export type PublishingReadinessStatus =
  | 'ready_for_snapshot'
  | 'needs_review'
  | 'needs_rebuild'
  | 'blocked_by_errors'
  | 'not_configured'

export interface PublishingWarning {
  category: PublishingWarningCategory
  severity: PublishingWarningSeverity
  message: string
  field?: string
}

export interface PagePublishingReadiness {
  page: Page
  warnings: PublishingWarning[]
  errors: PublishingWarning[]
  pageQualityWarningCount: number
  redirectCount: number
  missingFields: string[]
}

export interface PublishingWarningGroup {
  category: PublishingWarningCategory
  label: string
  warnings: PublishingWarning[]
}

export interface TenantPublishingSummary {
  status: PublishingReadinessStatus
  statusLabel: string
  statusDescription: string
  totalPages: number
  publishedPages: number
  draftPages: number
  sitemapPages: number
  pagesNeedingRebuild: number
  pagesWithPageQualityWarnings: number
  pagesWithRedirectWarnings: number
  pagesMissingWorkflowApproval: number
  pagesMissingTemplateIdentity: number
  pagesMissingRequiredFields: number
  warningGroups: PublishingWarningGroup[]
  pageReadiness: PagePublishingReadiness[]
  lastSnapshotAt: string
  lastStaticBuildAt: string
  lastDeployedAt: string
  deploymentStatuses: string[]
  contentHashMismatchCount: number
  needsCloudflarePurgeCount: number
}

const WARNING_LABELS: Record<PublishingWarningCategory, string> = {
  seo: 'SEO Missing',
  media: 'Media And Alt Text Missing',
  fulfillment: 'Fulfillment Missing',
  workflow: 'Workflow Approval Missing',
  static: 'Static Rebuild Required',
  redirect: 'Redirect Or Canonical Mismatch',
  template: 'Template Identity Missing',
  form: 'Form And Lead Capture Missing',
}

export const TENANT_PUBLISHING_PROFILES: Record<string, { domain: string; displayName: string }> = {
  'ice-rink-rentals': {
    displayName: 'Ice Skating Rink Rentals',
    domain: 'iceskatingrinkrentals.com',
  },
  'roller-rink-rentals': {
    displayName: 'Roller Rink Rentals',
    domain: 'rollerrinkrentals.com',
  },
}

export function normalizeSlug(value: string | null | undefined) {
  if (!value) return ''

  let candidate = value.trim()
  try {
    const url = new URL(candidate)
    candidate = url.pathname
  } catch {
    // Plain slugs are expected for most admin data.
  }

  return candidate
    .replace(/\\/g, '/')
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase()
    .replace(/[\/\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || (candidate.trim() === '/' ? 'home' : '')
}

export function getTenantDomain(tenantId: string, pages: Page[]) {
  const profile = TENANT_PUBLISHING_PROFILES[tenantId]
  if (profile?.domain) return profile.domain

  const canonical = pages
    .map((page) => page.seo?.canonicalUrl || '')
    .find((url) => url.trim().startsWith('http'))

  if (!canonical) return ''

  try {
    return new URL(canonical).host
  } catch {
    return ''
  }
}

export function getPreviewUrl(page: Page) {
  const profile = TENANT_PUBLISHING_PROFILES[page.tenantId]
  const localHost = page.tenantId === 'roller-rink-rentals'
    ? 'http://roller.localhost:3002'
    : 'http://localhost:3002'

  if (!profile && page.seo?.canonicalUrl) {
    try {
      const canonical = new URL(page.seo.canonicalUrl)
      const slug = normalizeSlug(page.pageSlug)
      canonical.pathname = !slug || slug === 'home' ? '/' : `/${slug}`
      canonical.search = ''
      canonical.hash = ''
      return canonical.toString()
    } catch {
      // Fall back to the local preview host below.
    }
  }

  return page.pageSlug === 'home' ? `${localHost}/` : `${localHost}/${page.pageSlug}`
}

export function getDetailUrl(page: Page) {
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/view?tenantId=${encodeURIComponent(page.tenantId)}`
}

export function getEditUrl(page: Page) {
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/edit?tenantId=${encodeURIComponent(page.tenantId)}`
}

export function getPageQualityWarnings(page: Page) {
  const warnings: PublishingWarning[] = []
  const targetKeyword = page.searchData?.keyword || page.MetaData?.keyword || page.seo?.keywords?.[0] || ''

  if (!targetKeyword.trim()) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'searchData.keyword',
      message: 'Missing target keyword.',
    })
  }

  if (!page.MetaData?.title?.trim()) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'MetaData.title',
      message: 'Missing visible page title/H1.',
    })
  }

  if (!page.seo?.metaTitle?.trim()) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'seo.metaTitle',
      message: 'Missing SEO meta title.',
    })
  } else if (page.seo.metaTitle.length > 70) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'seo.metaTitle',
      message: 'SEO meta title is longer than 70 characters.',
    })
  }

  if (!page.seo?.metaDescription?.trim()) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'seo.metaDescription',
      message: 'Missing SEO meta description.',
    })
  } else if (page.seo.metaDescription.length > 170) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'seo.metaDescription',
      message: 'SEO meta description is longer than 170 characters.',
    })
  }

  if (!page.seo?.canonicalUrl?.trim()) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'seo.canonicalUrl',
      message: 'Missing canonical URL.',
    })
  } else if (!isCanonicalSlugAligned(page)) {
    warnings.push({
      category: 'redirect',
      severity: 'warning',
      field: 'seo.canonicalUrl',
      message: 'Canonical URL path does not match the current page slug.',
    })
  }

  if (!page.seo?.robots?.trim()) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'seo.robots',
      message: 'Missing robots setting.',
    })
  }

  if (page.isPublished && !page.includeInSitemap) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'includeInSitemap',
      message: 'Published page is not included in sitemap.',
    })
  }

  if (page.includeInSitemap && !page.seo?.canonicalUrl?.trim()) {
    warnings.push({
      category: 'seo',
      severity: 'warning',
      field: 'seo.canonicalUrl',
      message: 'Sitemap page has no canonical URL.',
    })
  }

  return warnings
}

export function getRedirectWarnings(page: Page, tenantPages: Page[] = []) {
  const warnings: PublishingWarning[] = []
  const redirects = getActiveRedirects(page)
  const currentSlug = normalizeSlug(page.pageSlug)
  const tenantSlugSet = new Set(tenantPages.map((candidate) => normalizeSlug(candidate.pageSlug)).filter(Boolean))
  const tenantPublishedSlugSet = new Set(
    tenantPages
      .filter((candidate) => candidate.isPublished)
      .map((candidate) => normalizeSlug(candidate.pageSlug))
      .filter(Boolean),
  )
  const activeFroms = new Set<string>()

  if (!currentSlug) {
    warnings.push({
      category: 'redirect',
      severity: 'error',
      field: 'pageSlug',
      message: 'Page slug is missing.',
    })
  }

  redirects.forEach((redirect) => {
    const from = normalizeSlug(redirect.from)
    const to = normalizeSlug(redirect.to)

    if (!from || !to) {
      warnings.push({
        category: 'redirect',
        severity: 'error',
        field: 'redirects',
        message: 'Active redirect is missing a from or to slug.',
      })
      return
    }

    if (from === to || from === currentSlug) {
      warnings.push({
        category: 'redirect',
        severity: 'error',
        field: 'redirects',
        message: `Redirect from ${from} creates a loop or points from the current slug.`,
      })
    }

    if (activeFroms.has(from)) {
      warnings.push({
        category: 'redirect',
        severity: 'error',
        field: 'redirects',
        message: `Duplicate active redirect from ${from}.`,
      })
    }
    activeFroms.add(from)

    if (!tenantPublishedSlugSet.has(to)) {
      warnings.push({
        category: 'redirect',
        severity: 'warning',
        field: 'redirects',
        message: `Redirect from ${from} points to ${to}, which is not a published tenant page.`,
      })
    }
  })

  ;(page.previousSlugs || []).forEach((previousSlug) => {
    const normalizedPreviousSlug = normalizeSlug(previousSlug)
    if (!normalizedPreviousSlug) return

    if (tenantSlugSet.has(normalizedPreviousSlug)) {
      warnings.push({
        category: 'redirect',
        severity: 'warning',
        field: 'previousSlugs',
        message: `Previous slug ${normalizedPreviousSlug} is also a current tenant page slug.`,
      })
    }

    if (!activeFroms.has(normalizedPreviousSlug)) {
      warnings.push({
        category: 'redirect',
        severity: 'warning',
        field: 'previousSlugs',
        message: `Previous slug ${normalizedPreviousSlug} has no active redirect coverage.`,
      })
    }
  })

  return warnings
}

export function getPublishingWarnings(page: Page, tenantPages: Page[] = []) {
  const warnings: PublishingWarning[] = [
    ...getPageQualityWarnings(page),
    ...getMediaWarnings(page),
    ...getFulfillmentWarnings(page),
    ...getWorkflowWarnings(page),
    ...getStaticWarnings(page),
    ...getRedirectWarnings(page, tenantPages),
    ...getTemplateWarnings(page),
    ...getFormWarnings(page),
  ]

  return dedupeWarnings(warnings)
}

export function getPublishingReadinessStatus(pageReadiness: PagePublishingReadiness[]): PublishingReadinessStatus {
  if (pageReadiness.length === 0) return 'not_configured'

  const publishedPages = pageReadiness.filter((item) => item.page.isPublished)
  if (publishedPages.length === 0) return 'not_configured'

  if (pageReadiness.some((item) => item.errors.length > 0)) return 'blocked_by_errors'
  if (pageReadiness.some((item) => Boolean(item.page.staticPublishing?.needsRebuild))) return 'needs_rebuild'
  if (pageReadiness.some((item) => item.warnings.length > 0)) return 'needs_review'

  return 'ready_for_snapshot'
}

export function buildTenantPublishingSummary(pages: Page[]): TenantPublishingSummary {
  const pageReadiness = pages.map((page) => {
    const warnings = getPublishingWarnings(page, pages)
    const errors = warnings.filter((warning) => warning.severity === 'error')
    const nonErrorWarnings = warnings.filter((warning) => warning.severity === 'warning')

    return {
      page,
      warnings: nonErrorWarnings,
      errors,
      pageQualityWarningCount: warnings.length,
      redirectCount: getActiveRedirects(page).length,
      missingFields: getMissingFields(warnings),
    }
  })

  const status = getPublishingReadinessStatus(pageReadiness)
  const warningGroups = buildWarningGroups(pageReadiness)
  const publishedPages = pages.filter((page) => page.isPublished)
  const allWarnings = pageReadiness.flatMap((item) => [...item.warnings, ...item.errors])

  return {
    status,
    statusLabel: getStatusLabel(status),
    statusDescription: getStatusDescription(status),
    totalPages: pages.length,
    publishedPages: publishedPages.length,
    draftPages: pages.length - publishedPages.length,
    sitemapPages: pages.filter((page) => page.includeInSitemap).length,
    pagesNeedingRebuild: pages.filter((page) => Boolean(page.staticPublishing?.needsRebuild)).length,
    pagesWithPageQualityWarnings: pageReadiness.filter((item) => item.pageQualityWarningCount > 0).length,
    pagesWithRedirectWarnings: pageReadiness.filter((item) => hasWarningCategory(item, 'redirect')).length,
    pagesMissingWorkflowApproval: pageReadiness.filter((item) => hasWarningCategory(item, 'workflow')).length,
    pagesMissingTemplateIdentity: pageReadiness.filter((item) => hasWarningCategory(item, 'template')).length,
    pagesMissingRequiredFields: pageReadiness.filter((item) =>
      ['seo', 'media', 'fulfillment'].some((category) => hasWarningCategory(item, category as PublishingWarningCategory)),
    ).length,
    warningGroups,
    pageReadiness,
    lastSnapshotAt: latestDate(pages.map((page) => page.staticPublishing?.lastSnapshotAt)),
    lastStaticBuildAt: latestDate(pages.map((page) => page.staticPublishing?.lastStaticBuildAt)),
    lastDeployedAt: latestDate(pages.map((page) => page.staticPublishing?.lastDeployedAt)),
    deploymentStatuses: uniqueNonEmpty(pages.map((page) => page.staticPublishing?.deploymentStatus)),
    contentHashMismatchCount: pages.filter((page) =>
      Boolean(page.staticPublishing?.contentHash) &&
      Boolean(page.staticPublishing?.lastPublishedContentHash) &&
      page.staticPublishing?.contentHash !== page.staticPublishing?.lastPublishedContentHash,
    ).length,
    needsCloudflarePurgeCount: pages.filter((page) => getUnknownBoolean(page.staticPublishing, 'needsCloudflarePurge')).length,
  }
}

function getMediaWarnings(page: Page) {
  const warnings: PublishingWarning[] = []
  const mediaSlots = [
    ['media.featuredImage', page.media?.featuredImage],
    ['media.heroImage', page.media?.heroImage],
    ['media.localImage', page.media?.localImage],
    ['media.closingImage', page.media?.closingImage],
  ] as const

  mediaSlots.forEach(([field, image]) => {
    if (image?.url?.trim() && !image.decorative && !image.alt?.trim()) {
      warnings.push({
        category: 'media',
        severity: 'warning',
        field: `${field}.alt`,
        message: `${field} has an image URL but no alt text.`,
      })
    }
  })

  if (page.media?.openGraphImage?.url?.trim() && !page.media.openGraphImage.alt?.trim()) {
    warnings.push({
      category: 'media',
      severity: 'warning',
      field: 'media.openGraphImage.alt',
      message: 'Open Graph image has no alt text.',
    })
  }

  if (page.seo?.openGraph?.['og:image']?.trim() && !page.seo.openGraph['og:image:alt']?.trim()) {
    warnings.push({
      category: 'media',
      severity: 'warning',
      field: 'seo.openGraph.og:image:alt',
      message: 'SEO Open Graph image has no alt text.',
    })
  }

  const blockImageWarnings = getBlockImageWarnings(page)
  warnings.push(...blockImageWarnings)

  return warnings
}

function getFulfillmentWarnings(page: Page) {
  const warnings: PublishingWarning[] = []
  const fulfillmentStatus = page.fulfillment?.fulfillmentStatus || ''

  if (!fulfillmentStatus.trim()) {
    warnings.push({
      category: 'fulfillment',
      severity: 'warning',
      field: 'fulfillment.fulfillmentStatus',
      message: 'Fulfillment status is missing.',
    })
  }

  if (fulfillmentStatus === 'direct_partner_available' && !page.fulfillment?.primaryPartnerAvailable) {
    warnings.push({
      category: 'fulfillment',
      severity: 'warning',
      field: 'fulfillment.primaryPartnerAvailable',
      message: 'Direct partner fulfillment requires primaryPartnerAvailable.',
    })
  }

  if (
    fulfillmentStatus === 'partner_network_or_researched_provider' &&
    !page.fulfillment?.providerResearchCompleted &&
    !page.fulfillment?.manualReviewRequired
  ) {
    warnings.push({
      category: 'fulfillment',
      severity: 'warning',
      field: 'fulfillment.providerResearchCompleted',
      message: 'Partner-network fulfillment needs provider research complete or manual review required.',
    })
  }

  if (fulfillmentStatus && fulfillmentStatus !== 'direct_partner_available' && !page.fulfillment?.publicDisclosureRequired) {
    warnings.push({
      category: 'fulfillment',
      severity: 'warning',
      field: 'fulfillment.publicDisclosureRequired',
      message: 'Non-direct fulfillment should explicitly record public disclosure requirements.',
    })
  }

  if (page.googleAds?.eligible && fulfillmentStatus === 'research_only_until_provider_confirmed') {
    warnings.push({
      category: 'fulfillment',
      severity: 'warning',
      field: 'googleAds.eligible',
      message: 'Google Ads eligible page has research-only fulfillment.',
    })
  }

  return warnings
}

function getWorkflowWarnings(page: Page) {
  const warnings: PublishingWarning[] = []
  const status = page.workflow?.status || ''

  if (page.isPublished && !page.workflow?.approvedForPublish) {
    warnings.push({
      category: 'workflow',
      severity: 'warning',
      field: 'workflow.approvedForPublish',
      message: 'Published page is not approved for publishing.',
    })
  }

  if (page.isPublished && !['approved', 'published'].includes(status)) {
    warnings.push({
      category: 'workflow',
      severity: 'warning',
      field: 'workflow.status',
      message: 'Published page should use workflow.status approved or published.',
    })
  }

  return warnings
}

function getStaticWarnings(page: Page) {
  const warnings: PublishingWarning[] = []

  if (page.isPublished && !page.staticPublishing?.staticEligible) {
    warnings.push({
      category: 'static',
      severity: 'warning',
      field: 'staticPublishing.staticEligible',
      message: 'Published page is not marked static eligible.',
    })
  }

  if (page.staticPublishing?.needsRebuild) {
    warnings.push({
      category: 'static',
      severity: 'warning',
      field: 'staticPublishing.needsRebuild',
      message: 'Page has changes that need a CMS snapshot/static rebuild.',
    })
  }

  return warnings
}

function getTemplateWarnings(page: Page) {
  const warnings: PublishingWarning[] = []

  if (!page.template?.templateKey?.trim()) {
    warnings.push({
      category: 'template',
      severity: 'warning',
      field: 'template.templateKey',
      message: 'Template key is missing.',
    })
  }

  if (!page.template?.contentModelVersion?.trim()) {
    warnings.push({
      category: 'template',
      severity: 'warning',
      field: 'template.contentModelVersion',
      message: 'Content model version is missing.',
    })
  }

  return warnings
}

function getFormWarnings(page: Page) {
  const warnings: PublishingWarning[] = []
  const blocks = page.ContentData?.ContentBlocks || []
  const hasContactBlock = blocks.some((block) => block.type === 'Contact')
  const hasCtaBlock = blocks.some((block) => block.type === 'PrimaryCTA' || block.type === 'CTA')

  if (hasContactBlock && !page.formConfig?.formType?.trim()) {
    warnings.push({
      category: 'form',
      severity: 'warning',
      field: 'formConfig.formType',
      message: 'Contact block exists but form type is missing.',
    })
  }

  if ((hasContactBlock || hasCtaBlock) && !page.formConfig?.conversionGoal?.trim()) {
    warnings.push({
      category: 'form',
      severity: 'warning',
      field: 'formConfig.conversionGoal',
      message: 'Form or CTA exists but conversion goal is missing.',
    })
  }

  if (hasContactBlock && !page.formConfig?.staticFormEndpointKey?.trim()) {
    warnings.push({
      category: 'form',
      severity: 'warning',
      field: 'formConfig.staticFormEndpointKey',
      message: 'Contact form has no static form endpoint key recorded.',
    })
  }

  return warnings
}

function getActiveRedirects(page: Page): PageRedirect[] {
  return (page.redirects || []).filter((redirect) => redirect.active !== false)
}

function isCanonicalSlugAligned(page: Page) {
  const canonicalUrl = page.seo?.canonicalUrl || ''
  if (!canonicalUrl.trim()) return false

  try {
    const canonical = new URL(canonicalUrl)
    const canonicalSlug = normalizeSlug(canonical.pathname) || 'home'
    const pageSlug = normalizeSlug(page.pageSlug) || 'home'
    return canonicalSlug === pageSlug
  } catch {
    return false
  }
}

function getBlockImageWarnings(page: Page) {
  const warnings: PublishingWarning[] = []
  const blocks = page.ContentData?.ContentBlocks || []

  blocks.forEach((block, blockIndex) => {
    inspectBlockImages(
      block.content,
      `ContentData.ContentBlocks[${blockIndex}].content`,
      block.type,
      warnings,
    )
  })

  return warnings
}

function inspectBlockImages(
  value: unknown,
  path: string,
  blockType: string,
  warnings: PublishingWarning[],
) {
  if (!value || typeof value !== 'object') return

  if (Array.isArray(value)) {
    value.forEach((item, index) => inspectBlockImages(item, `${path}[${index}]`, blockType, warnings))
    return
  }

  const record = value as Record<string, unknown>
  Object.entries(record).forEach(([key, entry]) => {
    const entryPath = `${path}.${key}`

    if (typeof entry === 'string' && entry.trim() && isImageFieldName(key)) {
      const altValue = findAltForImageField(record, key)
      if (!altValue) {
        warnings.push({
          category: 'media',
          severity: 'warning',
          field: entryPath,
          message: `${blockType} block image field ${key} has no nearby alt text.`,
        })
      }
    }

    if (entry && typeof entry === 'object') {
      inspectBlockImages(entry, entryPath, blockType, warnings)
    }
  })
}

function isImageFieldName(key: string) {
  const normalized = key.toLowerCase()
  return (
    normalized === 'image' ||
    normalized.endsWith('image') ||
    normalized.endsWith('imageurl') ||
    normalized.includes('backgroundimage') ||
    normalized.includes('mainimage')
  )
}

function findAltForImageField(content: Record<string, unknown>, imageField: string) {
  const candidates = [
    'alt',
    'imageAlt',
    'image-alt',
    `${imageField}Alt`,
    `${imageField}AltText`,
    `${imageField}-alt`,
    `${imageField}AltText`.replace(/imageAltText$/i, 'imageAltText'),
  ]

  return candidates.some((candidate) => {
    const value = content[candidate]
    return typeof value === 'string' && value.trim().length > 0
  })
}

function dedupeWarnings(warnings: PublishingWarning[]) {
  const seen = new Set<string>()
  return warnings.filter((warning) => {
    const key = `${warning.category}:${warning.severity}:${warning.field || ''}:${warning.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getMissingFields(warnings: PublishingWarning[]) {
  return Array.from(new Set(warnings.map((warning) => warning.field).filter((field): field is string => Boolean(field))))
}

function hasWarningCategory(item: PagePublishingReadiness, category: PublishingWarningCategory) {
  return [...item.warnings, ...item.errors].some((warning) => warning.category === category)
}

function buildWarningGroups(pageReadiness: PagePublishingReadiness[]) {
  const grouped = new Map<PublishingWarningCategory, PublishingWarning[]>()

  pageReadiness.forEach((item) => {
    ;[...item.warnings, ...item.errors].forEach((warning) => {
      const existing = grouped.get(warning.category) || []
      existing.push(warning)
      grouped.set(warning.category, existing)
    })
  })

  return Object.entries(WARNING_LABELS).map(([category, label]) => ({
    category: category as PublishingWarningCategory,
    label,
    warnings: grouped.get(category as PublishingWarningCategory) || [],
  }))
}

function latestDate(values: Array<string | null | undefined>) {
  const latest = values
    .filter((value): value is string => Boolean(value && value.trim()))
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0]

  return latest ? latest.toISOString() : ''
}

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))))
}

function getUnknownBoolean(source: unknown, key: string) {
  if (!source || typeof source !== 'object') return false
  const value = (source as Record<string, unknown>)[key]
  return value === true
}

function getStatusLabel(status: PublishingReadinessStatus) {
  switch (status) {
    case 'ready_for_snapshot':
      return 'Ready for snapshot'
    case 'needs_review':
      return 'Needs review'
    case 'needs_rebuild':
      return 'Needs rebuild'
    case 'blocked_by_errors':
      return 'Blocked by errors'
    case 'not_configured':
      return 'Not configured'
  }
}

function getStatusDescription(status: PublishingReadinessStatus) {
  switch (status) {
    case 'ready_for_snapshot':
      return 'Published pages have no current dashboard warnings and can move into CMS snapshot validation.'
    case 'needs_review':
      return 'One or more pages need content, SEO, workflow, redirect, template, media, fulfillment, or form review.'
    case 'needs_rebuild':
      return 'One or more pages are marked stale and need a CMS snapshot/static rebuild before deployment.'
    case 'blocked_by_errors':
      return 'One or more structural redirect or slug issues should be fixed before publishing.'
    case 'not_configured':
      return 'No published static-ready pages are available for this tenant yet.'
  }
}
