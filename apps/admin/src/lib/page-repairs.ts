import type {
  Page,
  PageChangeSource,
  PageFormConfig,
  PageGoogleAds,
  PageImageAsset,
  PageMedia,
  PageQuality,
  PageStructuredDataControls,
  PageTemplateIdentity,
  PageWorkflow,
} from 'pumpkin-ts-models'

export type RepairCategory =
  | 'workflow'
  | 'staticPublishing'
  | 'template'
  | 'schemaControls'
  | 'formConfig'
  | 'linking'
  | 'media'
  | 'pageQuality'
  | 'fulfillmentGoogleAds'

export interface RepairCategoryDefinition {
  key: RepairCategory
  label: string
  description: string
}

export interface PageRepairAction {
  category: RepairCategory
  label: string
  changedFields: string[]
  warnings: string[]
}

export interface PageRepairPlan {
  page: Page
  actions: PageRepairAction[]
  warnings: string[]
}

export interface TenantRepairPlan {
  generatedAt: string
  totalPagesScanned: number
  pagePlans: PageRepairPlan[]
  summary: Record<RepairCategory, number>
  warnings: string[]
}

export interface RepairApplyResult {
  page: Page
  changedFields: string[]
  warnings: string[]
}

export const METADATA_REPAIR_CHANGE_SOURCE = 'metadata_repair' as PageChangeSource

export const REPAIR_CATEGORIES: RepairCategoryDefinition[] = [
  {
    key: 'workflow',
    label: 'Workflow Defaults',
    description: 'Backfill workflow status, review status, approval flag, and edit metadata without approving content automatically.',
  },
  {
    key: 'staticPublishing',
    label: 'Static Publishing Defaults',
    description: 'Backfill static eligibility and deployment status while marking repaired pages as needing a rebuild.',
  },
  {
    key: 'template',
    label: 'Template Identity Defaults',
    description: 'Infer a conservative template key and default content model metadata from slug/page shape.',
  },
  {
    key: 'schemaControls',
    label: 'Schema Controls',
    description: 'Backfill structured data enablement flags based on page/block shape.',
  },
  {
    key: 'formConfig',
    label: 'Form / Lead Capture Defaults',
    description: 'Backfill safe form metadata for contact pages and CTA pages without adding real endpoints.',
  },
  {
    key: 'linking',
    label: 'Internal Linking Defaults',
    description: 'Backfill simple parent/hub/breadcrumb metadata without inventing related-page lists.',
  },
  {
    key: 'media',
    label: 'Media Metadata Defaults',
    description: 'Backfill empty image metadata containers and needs-review usage flags without inventing images or alt text.',
  },
  {
    key: 'pageQuality',
    label: 'Page Quality Defaults',
    description: 'Backfill quality status, score/check containers, and warning lists without inventing unique value.',
  },
  {
    key: 'fulfillmentGoogleAds',
    label: 'Fulfillment / Ads Safety Defaults',
    description: 'Backfill conservative fulfillment and Ads safety metadata without marking pages ad-eligible.',
  },
]

const CATEGORY_LABELS = REPAIR_CATEGORIES.reduce<Record<RepairCategory, string>>((labels, category) => {
  labels[category.key] = category.label
  return labels
}, {} as Record<RepairCategory, string>)

export const ALL_REPAIR_CATEGORIES = REPAIR_CATEGORIES.map((category) => category.key)

export function buildTenantRepairPlan(pages: Page[]): TenantRepairPlan {
  const generatedAt = new Date().toISOString()
  const pagePlans = pages.map((page) => buildPageRepairPlan(page, ALL_REPAIR_CATEGORIES, generatedAt))
  const summary = ALL_REPAIR_CATEGORIES.reduce<Record<RepairCategory, number>>((counts, category) => {
    counts[category] = pagePlans.filter((plan) => plan.actions.some((action) => action.category === category)).length
    return counts
  }, {} as Record<RepairCategory, number>)

  return {
    generatedAt,
    totalPagesScanned: pages.length,
    pagePlans,
    summary,
    warnings: pagePlans.flatMap((plan) => plan.warnings),
  }
}

export function buildPageRepairPlan(page: Page, categories: RepairCategory[] = ALL_REPAIR_CATEGORIES, now = new Date().toISOString()): PageRepairPlan {
  const actions: PageRepairAction[] = []
  const warnings: string[] = []

  categories.forEach((category) => {
    const result = applyCategory(clonePage(page), category, 'Pumpkin CMS Preview', now)
    if (result.changedFields.length > 0 || result.warnings.length > 0) {
      if (result.changedFields.length > 0) {
        actions.push({
          category,
          label: CATEGORY_LABELS[category],
          changedFields: result.changedFields,
          warnings: result.warnings,
        })
      }
      warnings.push(...result.warnings.map((warning) => `${page.pageSlug}: ${warning}`))
    }
  })

  return { page, actions, warnings }
}

export function applyRepairsToPage(
  page: Page,
  categories: RepairCategory[],
  actor: string,
  now = new Date().toISOString(),
): RepairApplyResult {
  const repairedPage = clonePage(page)
  const changedFields: string[] = []
  const warnings: string[] = []

  categories.forEach((category) => {
    const result = applyCategory(repairedPage, category, actor, now)
    changedFields.push(...result.changedFields)
    warnings.push(...result.warnings)
  })

  if (changedFields.length > 0) {
    repairedPage.staticPublishing = {
      ...createDefaultStaticPublishing(repairedPage),
      ...(repairedPage.staticPublishing || {}),
      needsRebuild: true,
      deploymentStatus: repairedPage.staticPublishing?.deploymentStatus === 'deployed'
        ? 'pending_rebuild'
        : repairedPage.staticPublishing?.deploymentStatus || 'pending_rebuild',
    }
    repairedPage.MetaData = {
      ...repairedPage.MetaData,
      updatedAt: now,
    }
  }

  return {
    page: repairedPage,
    changedFields: Array.from(new Set(changedFields)),
    warnings: Array.from(new Set(warnings)),
  }
}

function applyCategory(page: Page, category: RepairCategory, actor: string, now: string) {
  switch (category) {
    case 'workflow':
      return repairWorkflow(page, actor, now)
    case 'staticPublishing':
      return repairStaticPublishing(page)
    case 'template':
      return repairTemplate(page)
    case 'schemaControls':
      return repairSchemaControls(page)
    case 'formConfig':
      return repairFormConfig(page)
    case 'linking':
      return repairLinking(page)
    case 'media':
      return repairMedia(page)
    case 'pageQuality':
      return repairPageQuality(page, now)
    case 'fulfillmentGoogleAds':
      return repairFulfillmentGoogleAds(page)
  }
}

function repairWorkflow(page: Page, actor: string, now: string) {
  const changedFields: string[] = []
  const workflow = {
    status: page.isPublished ? 'published' : 'draft',
    reviewStatus: page.isPublished && page.workflow?.approvedForPublish ? 'approved' : 'needs_review',
    approvedForPublish: false,
    approvedBy: '',
    approvedAt: '',
    lastEditedBy: '',
    lastEditedAt: '',
    ...(page.workflow || {}),
  }

  if (!page.workflow) changedFields.push('workflow')
  setIfBlank(workflow, 'status', page.isPublished ? 'published' : 'draft', changedFields, 'workflow.status')
  setIfBlank(workflow, 'reviewStatus', page.isPublished && workflow.approvedForPublish ? 'approved' : 'needs_review', changedFields, 'workflow.reviewStatus')
  if (typeof workflow.approvedForPublish !== 'boolean') {
    workflow.approvedForPublish = false
    changedFields.push('workflow.approvedForPublish')
  }
  setIfBlank(workflow, 'lastEditedBy', actor, changedFields, 'workflow.lastEditedBy')
  setIfBlank(workflow, 'lastEditedAt', now, changedFields, 'workflow.lastEditedAt')

  if (!workflow.approvedForPublish) {
    workflow.approvedBy = workflow.approvedBy || ''
    workflow.approvedAt = workflow.approvedAt || ''
  }

  page.workflow = workflow
  return { changedFields, warnings: [] }
}

function repairStaticPublishing(page: Page) {
  const changedFields: string[] = []
  const defaults = createDefaultStaticPublishing(page)
  const staticPublishing = {
    ...defaults,
    ...(page.staticPublishing || {}),
  }

  if (!page.staticPublishing) changedFields.push('staticPublishing')
  setIfNotBoolean(staticPublishing, 'staticEligible', page.isPublished, changedFields, 'staticPublishing.staticEligible')
  setIfNotBoolean(staticPublishing, 'needsRebuild', true, changedFields, 'staticPublishing.needsRebuild')
  setIfBlank(staticPublishing, 'deploymentStatus', 'not_deployed', changedFields, 'staticPublishing.deploymentStatus')
  staticPublishing.lastSnapshotAt ||= ''
  staticPublishing.lastStaticBuildAt ||= ''
  staticPublishing.lastDeployedAt ||= ''
  staticPublishing.contentHash ||= ''
  staticPublishing.lastPublishedContentHash ||= ''

  page.staticPublishing = staticPublishing
  return { changedFields, warnings: [] }
}

function repairTemplate(page: Page) {
  const changedFields: string[] = []
  const template = {
    templateKey: '',
    templateVersion: '',
    layoutVariant: '',
    contentModelVersion: '',
    ...(page.template || {}),
  }

  if (!page.template) changedFields.push('template')
  setIfBlank(template, 'templateKey', inferTemplateKey(page), changedFields, 'template.templateKey')
  setIfBlank(template, 'templateVersion', '1', changedFields, 'template.templateVersion')
  setIfBlank(template, 'layoutVariant', page.Layout || 'default', changedFields, 'template.layoutVariant')
  setIfBlank(template, 'contentModelVersion', '1', changedFields, 'template.contentModelVersion')

  page.template = template
  return { changedFields, warnings: [] }
}

function repairSchemaControls(page: Page) {
  const changedFields: string[] = []
  const hasFaq = hasBlock(page, 'FAQ')
  const isService = inferTemplateKey(page) === 'service'
  const schemaControls: PageStructuredDataControls = {
    enableWebPageSchema: true,
    enableBreadcrumbSchema: true,
    enableFAQSchema: hasFaq,
    enableServiceSchema: isService,
    schemaWarnings: [],
    ...(page.schemaControls || {}),
  }

  if (!page.schemaControls) changedFields.push('schemaControls')
  setIfNotBoolean(schemaControls, 'enableWebPageSchema', true, changedFields, 'schemaControls.enableWebPageSchema')
  setIfNotBoolean(schemaControls, 'enableBreadcrumbSchema', true, changedFields, 'schemaControls.enableBreadcrumbSchema')
  setIfNotBoolean(schemaControls, 'enableFAQSchema', hasFaq, changedFields, 'schemaControls.enableFAQSchema')
  setIfNotBoolean(schemaControls, 'enableServiceSchema', isService, changedFields, 'schemaControls.enableServiceSchema')
  if (!Array.isArray(schemaControls.schemaWarnings)) {
    schemaControls.schemaWarnings = []
    changedFields.push('schemaControls.schemaWarnings')
  }

  page.schemaControls = schemaControls
  return { changedFields, warnings: [] }
}

function repairFormConfig(page: Page) {
  const changedFields: string[] = []
  const warnings: string[] = []
  const hasContact = isContactPage(page) || hasBlock(page, 'Contact')
  const hasCta = hasBlock(page, 'PrimaryCTA') || hasBlock(page, 'CTA')
  const formConfig: PageFormConfig = {
    formId: '',
    formType: '',
    conversionGoal: '',
    routingMode: '',
    thankYouUrl: '',
    thankYouMessage: '',
    recipientGroup: '',
    staticFormEndpointKey: '',
    requiresConsent: true,
    consentRequired: true,
    spamProtectionRequired: true,
    spamProtectionEnabled: false,
    ...(page.formConfig || {}),
  }

  if (!page.formConfig) changedFields.push('formConfig')

  if (hasContact) {
    setIfBlank(formConfig, 'formId', `${page.tenantId}-${page.pageSlug}-quote`, changedFields, 'formConfig.formId')
    setIfBlank(formConfig, 'formType', 'quote_request', changedFields, 'formConfig.formType')
    setIfBlank(formConfig, 'conversionGoal', 'quote_form_submit', changedFields, 'formConfig.conversionGoal')
    setIfBlank(formConfig, 'routingMode', 'manual_review_then_provider_match', changedFields, 'formConfig.routingMode')
    setIfBlank(formConfig, 'thankYouMessage', 'Thank you. Your request has been received.', changedFields, 'formConfig.thankYouMessage')
    if (!formConfig.staticFormEndpointKey) {
      warnings.push('Static form endpoint key remains blank until the production endpoint is chosen.')
    }
  } else if (hasCta) {
    setIfBlank(formConfig, 'formType', 'not_configured', changedFields, 'formConfig.formType')
    setIfBlank(formConfig, 'routingMode', 'not_configured', changedFields, 'formConfig.routingMode')
    warnings.push('CTA exists without a Contact block; conversion goal remains blank for editorial review.')
  } else {
    setIfBlank(formConfig, 'formType', 'not_configured', changedFields, 'formConfig.formType')
    setIfBlank(formConfig, 'routingMode', 'not_configured', changedFields, 'formConfig.routingMode')
  }

  setIfNotBoolean(formConfig, 'requiresConsent', true, changedFields, 'formConfig.requiresConsent')
  setIfNotBoolean(formConfig, 'consentRequired', true, changedFields, 'formConfig.consentRequired')
  setIfNotBoolean(formConfig, 'spamProtectionRequired', true, changedFields, 'formConfig.spamProtectionRequired')
  setIfNotBoolean(formConfig, 'spamProtectionEnabled', false, changedFields, 'formConfig.spamProtectionEnabled')

  page.formConfig = formConfig
  return { changedFields, warnings }
}

function repairLinking(page: Page) {
  const changedFields: string[] = []
  const slug = normalizeSlug(page.pageSlug)
  const isHome = slug === 'home'
  const linking = {
    hubPage: '',
    parentPage: '',
    relatedPages: [],
    requiredLinks: [],
    breadcrumbTrail: [],
    ...(page.linking || {}),
  }

  if (!page.linking) changedFields.push('linking')
  setIfBlank(linking, 'hubPage', isHome ? '' : 'home', changedFields, 'linking.hubPage')
  setIfBlank(linking, 'parentPage', isHome ? '' : 'home', changedFields, 'linking.parentPage')
  if (!Array.isArray(linking.relatedPages)) {
    linking.relatedPages = []
    changedFields.push('linking.relatedPages')
  }
  if (!Array.isArray(linking.requiredLinks)) {
    linking.requiredLinks = []
    changedFields.push('linking.requiredLinks')
  }
  if (!Array.isArray(linking.breadcrumbTrail) || linking.breadcrumbTrail.length === 0) {
    linking.breadcrumbTrail = isHome ? ['home'] : ['home', slug]
    changedFields.push('linking.breadcrumbTrail')
  }

  page.linking = linking
  return { changedFields, warnings: [] }
}

function repairMedia(page: Page) {
  const changedFields: string[] = []
  const warnings: string[] = []
  const media: PageMedia = {
    featuredImage: createDefaultImage(),
    heroImage: createDefaultImage(),
    localImage: createDefaultImage(),
    closingImage: createDefaultImage(),
    openGraphImage: {
      mediaAssetId: '',
      assetId: '',
      requiredMediaSlotId: '',
      mediaRequirementRef: '',
      publicUrl: '',
      url: '',
      alt: '',
      title: '',
      caption: '',
      description: '',
      source: '',
      licenseStatus: 'needs_review',
      usageStatus: 'needs_review',
      usageType: '',
      status: '',
      tags: [],
      width: null,
      height: null,
    } as PageMedia['openGraphImage'],
    ...(page.media || {}),
  }

  if (!page.media) changedFields.push('media')
  ;(['featuredImage', 'heroImage', 'localImage', 'closingImage'] as const).forEach((slot) => {
    const existing = media[slot] || createDefaultImage()
    const repaired = {
      ...createDefaultImage(),
      ...existing,
      licenseStatus: existing.licenseStatus || 'needs_review',
      usageStatus: existing.usageStatus || 'needs_review',
      decorative: existing.decorative === true,
    }

    if (JSON.stringify(existing) !== JSON.stringify(repaired)) {
      changedFields.push(`media.${slot}`)
    }

    if (repaired.url && !repaired.decorative && !repaired.alt) {
      warnings.push(`${slot} has an image URL but missing alt text; repair did not fabricate alt text.`)
    }

    media[slot] = repaired
  })

  media.openGraphImage = {
    ...(media.openGraphImage || {}),
    url: media.openGraphImage?.url || '',
    alt: media.openGraphImage?.alt || '',
  }
  if (media.openGraphImage.url && !media.openGraphImage.alt) {
    warnings.push('Open Graph image has missing alt text; repair did not fabricate alt text.')
  }

  page.media = media
  return { changedFields, warnings }
}

function repairPageQuality(page: Page, now: string) {
  const changedFields: string[] = []
  const warnings: string[] = []
  const pageQuality: PageQuality = {
    status: 'needs_review',
    score: null,
    warnings: [],
    blockingIssues: [],
    lastCheckedAt: '',
    uniqueValueReason: '',
    buyerIntent: '',
    landingPageType: '',
    launchNotes: '',
    ...(page.pageQuality || {}),
  }

  if (!page.pageQuality) changedFields.push('pageQuality')
  setIfBlank(pageQuality, 'status', page.isPublished ? 'needs_review' : 'draft', changedFields, 'pageQuality.status')
  if (pageQuality.score === undefined) {
    pageQuality.score = null
    changedFields.push('pageQuality.score')
  }
  if (!Array.isArray(pageQuality.warnings)) {
    pageQuality.warnings = []
    changedFields.push('pageQuality.warnings')
  }
  if (!Array.isArray(pageQuality.blockingIssues)) {
    pageQuality.blockingIssues = []
    changedFields.push('pageQuality.blockingIssues')
  }
  setIfBlank(pageQuality, 'lastCheckedAt', now, changedFields, 'pageQuality.lastCheckedAt')
  setIfBlank(pageQuality, 'uniqueValueReason', '', changedFields, 'pageQuality.uniqueValueReason')

  if (!pageQuality.uniqueValueReason) {
    warnings.push('uniqueValueReason remains blank for editorial review.')
  }

  page.pageQuality = pageQuality
  return { changedFields, warnings }
}

function repairFulfillmentGoogleAds(page: Page) {
  const changedFields: string[] = []
  const fulfillment = {
    fulfillmentStatus: 'research_only_until_provider_confirmed',
    primaryPartnerAvailable: false,
    manualReviewRequired: true,
    providerResearchCompleted: false,
    topProviderCount: 0,
    leadRoutingMode: 'unmet_demand_followup',
    publicDisclosureRequired: true,
    confirmedServiceStates: [],
    extendedStatesPossible: [],
    ...(page.fulfillment || {}),
  }
  const googleAds: PageGoogleAds = {
    eligible: false,
    finalUrl: '',
    landingPageType: '',
    campaignTheme: '',
    conversionGoals: [],
    notes: '',
    policyRisk: 'unknown',
    bridgePageRisk: 'unknown',
    requiresDisclosure: fulfillment.fulfillmentStatus !== 'direct_partner_available',
    ...(page.googleAds || {}),
  }

  if (!page.fulfillment) changedFields.push('fulfillment')
  if (!page.googleAds) changedFields.push('googleAds')
  setIfBlank(fulfillment, 'fulfillmentStatus', 'research_only_until_provider_confirmed', changedFields, 'fulfillment.fulfillmentStatus')
  setIfNotBoolean(fulfillment, 'primaryPartnerAvailable', false, changedFields, 'fulfillment.primaryPartnerAvailable')
  setIfNotBoolean(fulfillment, 'manualReviewRequired', true, changedFields, 'fulfillment.manualReviewRequired')
  setIfNotBoolean(fulfillment, 'providerResearchCompleted', false, changedFields, 'fulfillment.providerResearchCompleted')
  setIfBlank(fulfillment, 'leadRoutingMode', 'unmet_demand_followup', changedFields, 'fulfillment.leadRoutingMode')
  setIfNotBoolean(fulfillment, 'publicDisclosureRequired', fulfillment.fulfillmentStatus !== 'direct_partner_available', changedFields, 'fulfillment.publicDisclosureRequired')
  if (!Array.isArray(fulfillment.confirmedServiceStates)) {
    fulfillment.confirmedServiceStates = []
    changedFields.push('fulfillment.confirmedServiceStates')
  }
  if (!Array.isArray(fulfillment.extendedStatesPossible)) {
    fulfillment.extendedStatesPossible = []
    changedFields.push('fulfillment.extendedStatesPossible')
  }

  setIfNotBoolean(googleAds, 'eligible', false, changedFields, 'googleAds.eligible')
  setIfBlank(googleAds, 'policyRisk', 'unknown', changedFields, 'googleAds.policyRisk')
  setIfBlank(googleAds, 'bridgePageRisk', 'unknown', changedFields, 'googleAds.bridgePageRisk')
  setIfNotBoolean(googleAds, 'requiresDisclosure', fulfillment.fulfillmentStatus !== 'direct_partner_available', changedFields, 'googleAds.requiresDisclosure')
  if (!Array.isArray(googleAds.conversionGoals)) {
    googleAds.conversionGoals = []
    changedFields.push('googleAds.conversionGoals')
  }

  page.fulfillment = fulfillment
  page.googleAds = googleAds
  return { changedFields, warnings: [] }
}

function createDefaultStaticPublishing(page: Page) {
  return {
    staticEligible: page.isPublished,
    needsRebuild: true,
    lastSnapshotAt: '',
    lastStaticBuildAt: '',
    lastDeployedAt: '',
    contentHash: '',
    lastPublishedContentHash: '',
    deploymentStatus: 'not_deployed',
  }
}

function createDefaultImage(): PageImageAsset {
  return {
    mediaAssetId: '',
    assetId: '',
    requiredMediaSlotId: '',
    mediaRequirementRef: '',
    publicUrl: '',
    url: '',
    alt: '',
    title: '',
    caption: '',
    description: '',
    source: '',
    licenseStatus: 'needs_review',
    usageStatus: 'needs_review',
    usageType: '',
    status: '',
    tags: [],
    blocker: null,
    width: null,
    height: null,
    focalPointX: null,
    focalPointY: null,
    decorative: false,
  } as PageImageAsset
}

function inferTemplateKey(page: Page) {
  const slug = normalizeSlug(page.pageSlug)
  const pageType = page.MetaData?.pageType?.toLowerCase() || ''
  const hasContact = isContactPage(page) || hasBlock(page, 'Contact')

  if (slug === 'home') return 'home'
  if (hasContact) return 'contact'
  if (
    pageType.includes('service') ||
    pageType.includes('landing') ||
    slug.includes('rental') ||
    slug.includes('service')
  ) {
    return 'service'
  }

  return 'general-page'
}

function isContactPage(page: Page) {
  const slug = normalizeSlug(page.pageSlug)
  return slug === 'contact' || slug.endsWith('-contact')
}

function hasBlock(page: Page, blockType: string) {
  return (page.ContentData?.ContentBlocks || []).some((block) => block.type === blockType)
}

function setIfBlank(
  target: object,
  key: string,
  fallback: string,
  changedFields: string[],
  fieldName: string,
) {
  const record = target as Record<string, unknown>
  const value = record[key]
  if (typeof value !== 'string' || value.trim() === '') {
    record[key] = fallback
    changedFields.push(fieldName)
  }
}

function setIfNotBoolean(
  target: object,
  key: string,
  fallback: boolean,
  changedFields: string[],
  fieldName: string,
) {
  const record = target as Record<string, unknown>
  if (typeof record[key] !== 'boolean') {
    record[key] = fallback
    changedFields.push(fieldName)
  }
}

function normalizeSlug(value: string | null | undefined) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/[\\/\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'home'
}

function clonePage(page: Page) {
  return JSON.parse(JSON.stringify(page)) as Page
}
