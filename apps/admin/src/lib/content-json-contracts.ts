import type { Page } from 'pumpkin-ts-models'
import { TENANT_PUBLISHING_PROFILES, normalizeSlug } from './publishing-readiness'

export type TemplateKey =
  | 'home'
  | 'contact'
  | 'service'
  | 'state-service-hub'
  | 'city-service-area'
  | 'event-use'
  | 'product-intent'
  | 'general-page'

export type TemplateSelection = TemplateKey | 'auto'
export type ContractSeverity = 'error' | 'warning'
export type ContractCategory =
  | 'shape'
  | 'tenant'
  | 'template'
  | 'seo'
  | 'media'
  | 'blocks'
  | 'fulfillment'
  | 'forms'
  | 'linking'
  | 'static'
  | 'redirect'
  | 'service_schema'

export interface TemplateContract {
  key: TemplateKey
  label: string
  description: string
  requiredPageFields: string[]
  requiredSeoFields: string[]
  requiredMediaSlots: Array<'featuredImage' | 'heroImage' | 'localImage' | 'closingImage'>
  requiredBlocks: string[]
  allowedBlocks: string[]
  requiredFulfillmentFields: string[]
  requiredServiceSchemaFields: string[]
  requiredLeadFields: string[]
  requiredFormLeadFields: string[]
  requiredInternalLinkFields: string[]
  staticRequirements: string[]
}

export interface ContractIssue {
  severity: ContractSeverity
  category: ContractCategory
  field: string
  message: string
}

export interface PageContractResult {
  index: number
  pageSlug: string
  title: string
  tenantId: string
  templateKey: TemplateKey
  contractLabel: string
  errors: ContractIssue[]
  warnings: ContractIssue[]
}

export interface ContentContractReport {
  generatedAt: string
  tenantId: string
  selectedTemplate: TemplateSelection
  wrapperTenantId: string
  pageCount: number
  errorCount: number
  warningCount: number
  results: PageContractResult[]
  payloadErrors: ContractIssue[]
  payloadWarnings: ContractIssue[]
}

interface ValidateOptions {
  expectedTenantId: string
  selectedTemplate: TemplateSelection
}

type JsonRecord = Record<string, unknown>

const COMMON_ALLOWED_BLOCKS = [
  'Hero',
  'TrustBar',
  'CardGrid',
  'HowItWorks',
  'FAQ',
  'PrimaryCTA',
  'Contact',
  'Breadcrumbs',
  'SecondaryCTA',
  'ServiceAreaMap',
  'LocalProTips',
  'Gallery',
  'Testimonials',
  'Blog',
]

const COMMON_PAGE_FIELDS = [
  'tenantId',
  'pageSlug',
  'Layout',
  'MetaData.title',
  'MetaData.description',
  'MetaData.pageType',
  'ContentData.ContentBlocks',
  'template.templateKey',
  'template.contentModelVersion',
]

const COMMON_SEO_FIELDS = [
  'seo.metaTitle',
  'seo.metaDescription',
  'seo.canonicalUrl',
  'seo.robots',
]

const COMMON_FULFILLMENT_FIELDS = [
  'fulfillment.fulfillmentStatus',
  'fulfillment.leadRoutingMode',
  'fulfillment.manualReviewRequired',
  'fulfillment.publicDisclosureRequired',
]

const COMMON_STATIC_REQUIREMENTS = [
  'isPublished',
  'includeInSitemap',
  'staticPublishing.staticEligible',
  'staticPublishing.needsRebuild',
  'staticPublishing.deploymentStatus',
]

const COMMON_LEAD_FIELDS = [
  'formConfig.formType',
  'formConfig.conversionGoal',
  'formConfig.routingMode',
]

const COMMON_SERVICE_SCHEMA_FIELDS = [
  'serviceSchema.serviceName',
  'serviceSchema.serviceType',
  'serviceSchema.productsOffered',
]

const LOCATION_SERVICE_SCHEMA_FIELDS = [
  ...COMMON_SERVICE_SCHEMA_FIELDS,
  'serviceSchema.areasServed',
]

export const TEMPLATE_CONTRACTS: Record<TemplateKey, TemplateContract> = {
  home: {
    key: 'home',
    label: 'Home',
    description: 'Tenant homepage with primary hero, trust proof, service paths, FAQ, and closing CTA.',
    requiredPageFields: COMMON_PAGE_FIELDS,
    requiredSeoFields: COMMON_SEO_FIELDS,
    requiredMediaSlots: ['heroImage', 'localImage', 'closingImage'],
    requiredBlocks: ['Hero', 'TrustBar', 'CardGrid', 'HowItWorks', 'FAQ', 'PrimaryCTA'],
    allowedBlocks: COMMON_ALLOWED_BLOCKS,
    requiredFulfillmentFields: COMMON_FULFILLMENT_FIELDS,
    requiredServiceSchemaFields: [],
    requiredLeadFields: ['formConfig.conversionGoal'],
    requiredFormLeadFields: [],
    requiredInternalLinkFields: ['linking.requiredLinks'],
    staticRequirements: COMMON_STATIC_REQUIREMENTS,
  },
  contact: {
    key: 'contact',
    label: 'Contact',
    description: 'Quote/contact page with a lead form and static-compatible form metadata.',
    requiredPageFields: COMMON_PAGE_FIELDS,
    requiredSeoFields: COMMON_SEO_FIELDS,
    requiredMediaSlots: ['featuredImage'],
    requiredBlocks: ['Contact'],
    allowedBlocks: ['Hero', 'FAQ', 'PrimaryCTA', 'Contact', 'Breadcrumbs'],
    requiredFulfillmentFields: COMMON_FULFILLMENT_FIELDS,
    requiredServiceSchemaFields: [],
    requiredLeadFields: COMMON_LEAD_FIELDS,
    requiredFormLeadFields: ['name', 'email', 'phone', 'eventLocation', 'message'],
    requiredInternalLinkFields: ['linking.breadcrumbTrail'],
    staticRequirements: COMMON_STATIC_REQUIREMENTS,
  },
  service: {
    key: 'service',
    label: 'Service',
    description: 'Primary service page for a tenant offering.',
    requiredPageFields: [...COMMON_PAGE_FIELDS, 'searchData.keyword'],
    requiredSeoFields: COMMON_SEO_FIELDS,
    requiredMediaSlots: ['heroImage', 'localImage', 'closingImage'],
    requiredBlocks: ['Hero', 'TrustBar', 'CardGrid', 'HowItWorks', 'FAQ', 'PrimaryCTA'],
    allowedBlocks: COMMON_ALLOWED_BLOCKS,
    requiredFulfillmentFields: COMMON_FULFILLMENT_FIELDS,
    requiredServiceSchemaFields: COMMON_SERVICE_SCHEMA_FIELDS,
    requiredLeadFields: COMMON_LEAD_FIELDS,
    requiredFormLeadFields: ['name', 'email', 'phone', 'eventLocation'],
    requiredInternalLinkFields: ['linking.breadcrumbTrail', 'linking.requiredLinks'],
    staticRequirements: COMMON_STATIC_REQUIREMENTS,
  },
  'state-service-hub': {
    key: 'state-service-hub',
    label: 'State Service Hub',
    description: 'State-level hub only when provider coverage and unique state context justify it.',
    requiredPageFields: [...COMMON_PAGE_FIELDS, 'searchData.state', 'searchData.keyword'],
    requiredSeoFields: COMMON_SEO_FIELDS,
    requiredMediaSlots: ['heroImage', 'localImage', 'closingImage'],
    requiredBlocks: ['Hero', 'CardGrid', 'FAQ', 'PrimaryCTA'],
    allowedBlocks: COMMON_ALLOWED_BLOCKS,
    requiredFulfillmentFields: [...COMMON_FULFILLMENT_FIELDS, 'fulfillment.topProviderCount'],
    requiredServiceSchemaFields: LOCATION_SERVICE_SCHEMA_FIELDS,
    requiredLeadFields: COMMON_LEAD_FIELDS,
    requiredFormLeadFields: ['name', 'email', 'phone', 'eventLocation'],
    requiredInternalLinkFields: ['linking.breadcrumbTrail', 'linking.relatedPages', 'linking.requiredLinks'],
    staticRequirements: COMMON_STATIC_REQUIREMENTS,
  },
  'city-service-area': {
    key: 'city-service-area',
    label: 'City Service Area',
    description: 'City or metro service-area page with local value, routeability, and disclosure controls.',
    requiredPageFields: [...COMMON_PAGE_FIELDS, 'searchData.state', 'searchData.city', 'searchData.keyword'],
    requiredSeoFields: COMMON_SEO_FIELDS,
    requiredMediaSlots: ['heroImage', 'localImage', 'closingImage'],
    requiredBlocks: ['Hero', 'HowItWorks', 'FAQ', 'PrimaryCTA'],
    allowedBlocks: COMMON_ALLOWED_BLOCKS,
    requiredFulfillmentFields: [...COMMON_FULFILLMENT_FIELDS, 'fulfillment.topProviderCount'],
    requiredServiceSchemaFields: LOCATION_SERVICE_SCHEMA_FIELDS,
    requiredLeadFields: COMMON_LEAD_FIELDS,
    requiredFormLeadFields: ['name', 'email', 'phone', 'eventLocation'],
    requiredInternalLinkFields: ['linking.breadcrumbTrail', 'linking.parentPage', 'linking.requiredLinks'],
    staticRequirements: COMMON_STATIC_REQUIREMENTS,
  },
  'event-use': {
    key: 'event-use',
    label: 'Event Use',
    description: 'Use-case page for seasonal, municipal, school, corporate, or venue-based demand.',
    requiredPageFields: [...COMMON_PAGE_FIELDS, 'searchData.keyword'],
    requiredSeoFields: COMMON_SEO_FIELDS,
    requiredMediaSlots: ['heroImage', 'localImage', 'closingImage'],
    requiredBlocks: ['Hero', 'CardGrid', 'FAQ', 'PrimaryCTA'],
    allowedBlocks: COMMON_ALLOWED_BLOCKS,
    requiredFulfillmentFields: COMMON_FULFILLMENT_FIELDS,
    requiredServiceSchemaFields: COMMON_SERVICE_SCHEMA_FIELDS,
    requiredLeadFields: COMMON_LEAD_FIELDS,
    requiredFormLeadFields: ['name', 'email', 'phone', 'eventLocation', 'eventDate'],
    requiredInternalLinkFields: ['linking.breadcrumbTrail', 'linking.relatedPages'],
    staticRequirements: COMMON_STATIC_REQUIREMENTS,
  },
  'product-intent': {
    key: 'product-intent',
    label: 'Product Intent',
    description: 'Buyer-intent page for a specific rental/product phrase or comparison angle.',
    requiredPageFields: [...COMMON_PAGE_FIELDS, 'searchData.keyword'],
    requiredSeoFields: COMMON_SEO_FIELDS,
    requiredMediaSlots: ['heroImage', 'closingImage'],
    requiredBlocks: ['Hero', 'CardGrid', 'FAQ', 'PrimaryCTA'],
    allowedBlocks: COMMON_ALLOWED_BLOCKS,
    requiredFulfillmentFields: COMMON_FULFILLMENT_FIELDS,
    requiredServiceSchemaFields: COMMON_SERVICE_SCHEMA_FIELDS,
    requiredLeadFields: COMMON_LEAD_FIELDS,
    requiredFormLeadFields: ['name', 'email', 'phone'],
    requiredInternalLinkFields: ['linking.breadcrumbTrail', 'linking.requiredLinks'],
    staticRequirements: COMMON_STATIC_REQUIREMENTS,
  },
  'general-page': {
    key: 'general-page',
    label: 'General Page',
    description: 'Flexible informational page with baseline SEO, media, and static publishing metadata.',
    requiredPageFields: COMMON_PAGE_FIELDS,
    requiredSeoFields: COMMON_SEO_FIELDS,
    requiredMediaSlots: ['featuredImage'],
    requiredBlocks: ['Hero'],
    allowedBlocks: COMMON_ALLOWED_BLOCKS,
    requiredFulfillmentFields: [],
    requiredServiceSchemaFields: [],
    requiredLeadFields: [],
    requiredFormLeadFields: [],
    requiredInternalLinkFields: ['linking.breadcrumbTrail'],
    staticRequirements: COMMON_STATIC_REQUIREMENTS,
  },
}

const TEMPLATE_KEYS = Object.keys(TEMPLATE_CONTRACTS) as TemplateKey[]
const FULFILLMENT_STATUSES = new Set([
  'direct_partner_available',
  'partner_network_or_researched_provider',
  'research_only_until_provider_confirmed',
])
const LEAD_ROUTING_MODES = new Set([
  'send_to_primary_partner',
  'manual_review_then_provider_match',
  'researched_provider_match',
  'unmet_demand_followup',
])

export function getTemplateKeys() {
  return TEMPLATE_KEYS
}

export function validateContentJsonText(rawJson: string, options: ValidateOptions): ContentContractReport {
  const payloadErrors: ContractIssue[] = []
  const payloadWarnings: ContractIssue[] = []
  let parsed: unknown

  try {
    parsed = JSON.parse(rawJson)
  } catch (error) {
    payloadErrors.push(issue('error', 'shape', 'payload', `JSON parse failed: ${getErrorMessage(error, 'invalid JSON')}`))
    return buildReport(options, '', [], payloadErrors, payloadWarnings)
  }

  const { pages, wrapperTenantId } = extractPages(parsed, payloadErrors, payloadWarnings)
  const results = pages.map((page, index) => validatePageContract(page, index, options))
  addDuplicateSlugIssues(results)

  return buildReport(options, wrapperTenantId, results, payloadErrors, payloadWarnings)
}

export function validatePageContract(pageValue: unknown, index: number, options: ValidateOptions): PageContractResult {
  const errors: ContractIssue[] = []
  const warnings: ContractIssue[] = []

  if (!isRecord(pageValue)) {
    errors.push(issue('error', 'shape', 'page', 'Page entry must be a JSON object.'))
    return result(index, '', '', '', 'general-page', errors, warnings)
  }

  const page = pageValue as Partial<Page> & JsonRecord
  const templateKey = getPageTemplateKey(page, options.selectedTemplate, warnings)
  const contract = TEMPLATE_CONTRACTS[templateKey]
  const pageSlug = stringValue(getPath(page, 'pageSlug'))
  const tenantId = stringValue(getPath(page, 'tenantId'))
  const title = stringValue(getPath(page, 'MetaData.title')) || pageSlug || `Page ${index + 1}`

  if (options.expectedTenantId && tenantId && tenantId !== options.expectedTenantId) {
    errors.push(issue('error', 'tenant', 'tenantId', `Page tenantId "${tenantId}" does not match selected tenant "${options.expectedTenantId}".`))
  }

  validateRequiredFields(page, contract.requiredPageFields, 'template', 'error', errors)
  validateRequiredFields(page, contract.requiredSeoFields, 'seo', 'error', errors)
  validateRequiredFields(page, contract.requiredFulfillmentFields, 'fulfillment', 'error', errors)
  validateRequiredFields(page, contract.requiredServiceSchemaFields, 'service_schema', 'warning', warnings)
  validateRequiredFields(page, contract.requiredLeadFields, 'forms', 'warning', warnings)
  validateRequiredFields(page, contract.requiredInternalLinkFields, 'linking', 'warning', warnings)
  validateRequiredFields(page, contract.staticRequirements, 'static', 'warning', warnings)
  validateSlugAndCanonical(page, tenantId || options.expectedTenantId, errors, warnings)
  validateBlocks(page, contract, errors, warnings)
  validateMedia(page, contract, errors, warnings)
  validateFulfillment(page, errors, warnings)
  validateServiceSchema(page, contract, errors, warnings)
  validateForms(page, contract, errors, warnings)
  validateStatic(page, warnings)
  validateRedirects(page, warnings)

  return result(index, pageSlug, title, tenantId, templateKey, errors, warnings)
}

function buildReport(
  options: ValidateOptions,
  wrapperTenantId: string,
  results: PageContractResult[],
  payloadErrors: ContractIssue[] = [],
  payloadWarnings: ContractIssue[] = [],
): ContentContractReport {
  const pageErrorCount = results.reduce((total, item) => total + item.errors.length, 0)
  const pageWarningCount = results.reduce((total, item) => total + item.warnings.length, 0)

  return {
    generatedAt: new Date().toISOString(),
    tenantId: options.expectedTenantId,
    selectedTemplate: options.selectedTemplate,
    wrapperTenantId,
    pageCount: results.length,
    errorCount: payloadErrors.length + pageErrorCount,
    warningCount: payloadWarnings.length + pageWarningCount,
    results,
    payloadErrors,
    payloadWarnings,
  }
}

function extractPages(value: unknown, errors: ContractIssue[], warnings: ContractIssue[]) {
  if (Array.isArray(value)) {
    return { pages: value, wrapperTenantId: '' }
  }

  if (!isRecord(value)) {
    errors.push(issue('error', 'shape', 'payload', 'JSON must be a Page object, an array of Pages, or an export object with pages[].'))
    return { pages: [] as unknown[], wrapperTenantId: '' }
  }

  if (Array.isArray(value.pages)) {
    return {
      pages: value.pages,
      wrapperTenantId: stringValue(value.tenantId),
    }
  }

  if ('pageSlug' in value || 'PageId' in value || 'ContentData' in value) {
    return { pages: [value], wrapperTenantId: stringValue(value.tenantId) }
  }

  warnings.push(issue('warning', 'shape', 'payload', 'Object does not include pages[], but it will be treated as a single Page candidate.'))
  return { pages: [value], wrapperTenantId: stringValue(value.tenantId) }
}

function getPageTemplateKey(page: JsonRecord, selectedTemplate: TemplateSelection, warnings: ContractIssue[]): TemplateKey {
  if (selectedTemplate !== 'auto') return selectedTemplate

  const fromTemplate = stringValue(getPath(page, 'template.templateKey'))
  const fromMeta = stringValue(getPath(page, 'MetaData.pageType'))
  const normalized = normalizeTemplateKey(fromTemplate || fromMeta)

  if (normalized) return normalized

  warnings.push(issue('warning', 'template', 'template.templateKey', 'Template key was missing or unknown; general-page contract was used.'))
  return 'general-page'
}

function normalizeTemplateKey(value: string): TemplateKey | '' {
  const normalized = value.trim().toLowerCase().replace(/_/g, '-')
  return TEMPLATE_KEYS.includes(normalized as TemplateKey) ? normalized as TemplateKey : ''
}

function validateRequiredFields(
  page: JsonRecord,
  paths: string[],
  category: ContractCategory,
  severity: ContractSeverity,
  issues: ContractIssue[],
) {
  paths.forEach((path) => {
    if (!hasValue(getPath(page, path))) {
      issues.push(issue(severity, category, path, `Required field ${path} is missing or empty.`))
    }
  })
}

function validateSlugAndCanonical(page: JsonRecord, tenantId: string, errors: ContractIssue[], warnings: ContractIssue[]) {
  const rawSlug = stringValue(getPath(page, 'pageSlug'))
  const normalized = normalizeSlug(rawSlug)
  const canonicalUrl = stringValue(getPath(page, 'seo.canonicalUrl'))

  if (!rawSlug.trim()) {
    errors.push(issue('error', 'seo', 'pageSlug', 'pageSlug is required.'))
  } else if (rawSlug !== normalized && rawSlug !== 'home') {
    warnings.push(issue('warning', 'seo', 'pageSlug', `pageSlug should be normalized to "${normalized}".`))
  }

  if (!canonicalUrl.trim()) return

  try {
    const canonical = new URL(canonicalUrl)
    const canonicalSlug = normalizeSlug(canonical.pathname) || 'home'
    const currentSlug = normalized || 'home'
    const expectedDomain = TENANT_PUBLISHING_PROFILES[tenantId]?.domain

    if (canonicalSlug !== currentSlug) {
      errors.push(issue('error', 'seo', 'seo.canonicalUrl', `Canonical path resolves to "${canonicalSlug}" but pageSlug is "${currentSlug}".`))
    }

    if (expectedDomain && canonical.host !== expectedDomain) {
      warnings.push(issue('warning', 'tenant', 'seo.canonicalUrl', `Canonical host "${canonical.host}" does not match expected tenant domain "${expectedDomain}".`))
    }
  } catch {
    errors.push(issue('error', 'seo', 'seo.canonicalUrl', 'Canonical URL is not URL-like.'))
  }
}

function validateBlocks(page: JsonRecord, contract: TemplateContract, errors: ContractIssue[], warnings: ContractIssue[]) {
  const blocks = getBlocks(page)
  const blockTypes = blocks.map((block) => stringValue(block.type)).filter(Boolean)

  if (!Array.isArray(getPath(page, 'ContentData.ContentBlocks'))) {
    errors.push(issue('error', 'blocks', 'ContentData.ContentBlocks', 'ContentData.ContentBlocks must be an array.'))
    return
  }

  contract.requiredBlocks.forEach((blockType) => {
    if (!blockTypes.includes(blockType)) {
      errors.push(issue('error', 'blocks', 'ContentData.ContentBlocks', `Required ${blockType} block is missing for ${contract.label}.`))
    }
  })

  blockTypes.forEach((blockType, blockIndex) => {
    if (!contract.allowedBlocks.includes(blockType)) {
      warnings.push(issue('warning', 'blocks', `ContentData.ContentBlocks[${blockIndex}].type`, `${blockType} is not listed in the ${contract.label} allowed block set.`))
    }
  })
}

function validateMedia(page: JsonRecord, contract: TemplateContract, errors: ContractIssue[], warnings: ContractIssue[]) {
  contract.requiredMediaSlots.forEach((slot) => {
    const basePath = `media.${slot}`
    const image = getPath(page, basePath)
    if (!isRecord(image)) {
      errors.push(issue('error', 'media', basePath, `${basePath} is required for ${contract.label}.`))
      return
    }

    const url = stringValue(image.url)
    const alt = stringValue(image.alt)
    const decorative = image.decorative === true
    const assetId = stringValue(image.assetId)
    const licenseStatus = stringValue(image.licenseStatus)
    const usageStatus = stringValue(image.usageStatus)

    if (!url.trim()) errors.push(issue('error', 'media', `${basePath}.url`, `${basePath}.url is required.`))
    if (url.trim() && !decorative && !alt.trim()) errors.push(issue('error', 'media', `${basePath}.alt`, `${basePath}.alt is required for non-decorative images.`))
    if (url.trim() && !assetId.trim()) warnings.push(issue('warning', 'media', `${basePath}.assetId`, `${basePath}.assetId should reference a MediaAsset.`))
    if (url.trim() && (!licenseStatus || licenseStatus === 'unknown' || licenseStatus === 'needs_review')) {
      warnings.push(issue('warning', 'media', `${basePath}.licenseStatus`, `${basePath}.licenseStatus needs review before publish.`))
    }
    if (url.trim() && usageStatus && usageStatus !== 'approved_for_publish') {
      warnings.push(issue('warning', 'media', `${basePath}.usageStatus`, `${basePath}.usageStatus is not approved_for_publish.`))
    }
  })
}

function validateFulfillment(page: JsonRecord, errors: ContractIssue[], warnings: ContractIssue[]) {
  const status = stringValue(getPath(page, 'fulfillment.fulfillmentStatus'))
  const routingMode = stringValue(getPath(page, 'fulfillment.leadRoutingMode'))
  const primaryPartnerAvailable = getPath(page, 'fulfillment.primaryPartnerAvailable') === true
  const providerResearchCompleted = getPath(page, 'fulfillment.providerResearchCompleted') === true
  const manualReviewRequired = getPath(page, 'fulfillment.manualReviewRequired') === true
  const publicDisclosureRequired = getPath(page, 'fulfillment.publicDisclosureRequired') === true
  const adsEligible = getPath(page, 'googleAds.eligible') === true

  if (status && !FULFILLMENT_STATUSES.has(status)) {
    errors.push(issue('error', 'fulfillment', 'fulfillment.fulfillmentStatus', `${status} is not an allowed fulfillment status.`))
  }

  if (routingMode && !LEAD_ROUTING_MODES.has(routingMode)) {
    errors.push(issue('error', 'fulfillment', 'fulfillment.leadRoutingMode', `${routingMode} is not an allowed lead routing mode.`))
  }

  if (status === 'direct_partner_available' && !primaryPartnerAvailable) {
    errors.push(issue('error', 'fulfillment', 'fulfillment.primaryPartnerAvailable', 'direct_partner_available requires primaryPartnerAvailable true.'))
  }

  if (status === 'partner_network_or_researched_provider' && !providerResearchCompleted && !manualReviewRequired) {
    warnings.push(issue('warning', 'fulfillment', 'fulfillment.providerResearchCompleted', 'Partner/researched provider pages should have provider research completed or manual review required.'))
  }

  if (status && status !== 'direct_partner_available' && !publicDisclosureRequired) {
    warnings.push(issue('warning', 'fulfillment', 'fulfillment.publicDisclosureRequired', 'Non-direct fulfillment should require public disclosure before publishing.'))
  }

  if (status === 'research_only_until_provider_confirmed' && adsEligible) {
    warnings.push(issue('warning', 'fulfillment', 'googleAds.eligible', 'Google Ads eligible should be reviewed for research-only fulfillment.'))
  }
}

function validateServiceSchema(page: JsonRecord, contract: TemplateContract, errors: ContractIssue[], warnings: ContractIssue[]) {
  const serviceSchema = getPath(page, 'serviceSchema')
  const productsOffered = getPath(page, 'serviceSchema.productsOffered')
  const areasServed = getPath(page, 'serviceSchema.areasServed')
  const publicSchemaEnabled = getPath(page, 'serviceSchema.publicSchemaEnabled') === true
  const adsEligible = getPath(page, 'googleAds.eligible') === true
  const fulfillmentStatus = stringValue(getPath(page, 'fulfillment.fulfillmentStatus'))
  const publicDisclosureRequired = getPath(page, 'fulfillment.publicDisclosureRequired') === true
  const templateKey = contract.key

  if (serviceSchema !== undefined && !isRecord(serviceSchema)) {
    errors.push(issue('error', 'service_schema', 'serviceSchema', 'serviceSchema must be an object when supplied.'))
    return
  }

  if (productsOffered !== undefined && !Array.isArray(productsOffered)) {
    errors.push(issue('error', 'service_schema', 'serviceSchema.productsOffered', 'productsOffered must be an array when supplied.'))
  }

  if (areasServed !== undefined && !Array.isArray(areasServed)) {
    errors.push(issue('error', 'service_schema', 'serviceSchema.areasServed', 'areasServed must be an array when supplied.'))
  }

  if (Array.isArray(productsOffered)) {
    productsOffered.forEach((item, index) => {
      if (!isRecord(item)) {
        warnings.push(issue('warning', 'service_schema', `serviceSchema.productsOffered[${index}]`, 'Product offered item should be an object.'))
        return
      }

      if (!stringValue(item.name).trim() || !stringValue(item.type).trim()) {
        warnings.push(issue('warning', 'service_schema', `serviceSchema.productsOffered[${index}]`, 'Product offered item should include name and type.'))
      }
    })
  }

  if (Array.isArray(areasServed)) {
    areasServed.forEach((item, index) => {
      if (!isRecord(item)) {
        warnings.push(issue('warning', 'service_schema', `serviceSchema.areasServed[${index}]`, 'areasServed item should be an object.'))
        return
      }

      if (!stringValue(item.name).trim() || !stringValue(item.type).trim()) {
        warnings.push(issue('warning', 'service_schema', `serviceSchema.areasServed[${index}]`, 'areasServed item should include name and type.'))
      }
    })
  }

  if (publicSchemaEnabled) {
    if (!stringValue(getPath(page, 'serviceSchema.serviceName')).trim()) {
      warnings.push(issue('warning', 'service_schema', 'serviceSchema.serviceName', 'publicSchemaEnabled requires serviceName.'))
    }

    if (!stringValue(getPath(page, 'serviceSchema.serviceType')).trim()) {
      warnings.push(issue('warning', 'service_schema', 'serviceSchema.serviceType', 'publicSchemaEnabled requires serviceType.'))
    }

    if (!Array.isArray(productsOffered) || productsOffered.length === 0) {
      warnings.push(issue('warning', 'service_schema', 'serviceSchema.productsOffered', 'publicSchemaEnabled should have at least one productsOffered item.'))
    }
  }

  if (adsEligible) {
    if (!Array.isArray(productsOffered) || productsOffered.length === 0) {
      warnings.push(issue('warning', 'service_schema', 'serviceSchema.productsOffered', 'Google Ads eligible pages should record productsOffered.'))
    }

    if (!Array.isArray(areasServed) || areasServed.length === 0) {
      warnings.push(issue('warning', 'service_schema', 'serviceSchema.areasServed', 'Google Ads eligible pages should record areasServed or service area context.'))
    }
  }

  if (['state-service-hub', 'city-service-area'].includes(templateKey) && (!Array.isArray(areasServed) || areasServed.length === 0)) {
    warnings.push(issue('warning', 'service_schema', 'serviceSchema.areasServed', `${contract.label} should include at least one areasServed entry.`))
  }

  if (
    Array.isArray(areasServed) &&
    areasServed.length > 0 &&
    fulfillmentStatus &&
    fulfillmentStatus !== 'direct_partner_available' &&
    !publicDisclosureRequired
  ) {
    warnings.push(issue('warning', 'fulfillment', 'fulfillment.publicDisclosureRequired', 'areasServed on non-direct fulfillment should keep publicDisclosureRequired true.'))
  }

  if (adsEligible && !stringValue(getPath(page, 'formConfig.domainRoutingKey')).trim()) {
    warnings.push(issue('warning', 'forms', 'formConfig.domainRoutingKey', 'Google Ads eligible pages should record a domain routing key.'))
  }
}

function validateForms(page: JsonRecord, contract: TemplateContract, errors: ContractIssue[], warnings: ContractIssue[]) {
  if (contract.requiredFormLeadFields.length === 0) return

  const blocks = getBlocks(page)
  const contactBlocks = blocks.filter((block) => stringValue(block.type) === 'Contact')
  if (contactBlocks.length === 0) {
    errors.push(issue('error', 'forms', 'ContentData.ContentBlocks', `${contract.label} requires a Contact block or lead capture form.`))
    return
  }

  const availableLeadFields = getAvailableLeadFields(page, contactBlocks)
  contract.requiredFormLeadFields.forEach((field) => {
    if (!availableLeadFields.has(field)) {
      warnings.push(issue('warning', 'forms', 'formConfig.normalizedFieldMap', `Recommended lead field "${field}" is missing from form mapping or Contact block fields.`))
    }
  })

  if (!stringValue(getPath(page, 'formConfig.domainRoutingKey')).trim()) {
    warnings.push(issue('warning', 'forms', 'formConfig.domainRoutingKey', 'Contact/quote page should record a domain routing key before production import.'))
  }

  if (!stringValue(getPath(page, 'formConfig.staticFormEndpointKey')).trim()) {
    warnings.push(issue('warning', 'forms', 'formConfig.staticFormEndpointKey', 'Static public form pages should record a static form endpoint key.'))
  }
}

function validateStatic(page: JsonRecord, warnings: ContractIssue[]) {
  const includeInSitemap = getPath(page, 'includeInSitemap') === true
  const robots = stringValue(getPath(page, 'seo.robots')).toLowerCase()
  const canonicalUrl = stringValue(getPath(page, 'seo.canonicalUrl'))

  if (includeInSitemap && robots.includes('noindex')) {
    warnings.push(issue('warning', 'static', 'seo.robots', 'Page is included in sitemap but robots contains noindex.'))
  }

  if (includeInSitemap && !canonicalUrl.trim()) {
    warnings.push(issue('warning', 'static', 'seo.canonicalUrl', 'Sitemap page should have a canonical URL.'))
  }
}

function validateRedirects(page: JsonRecord, warnings: ContractIssue[]) {
  const redirects = getPath(page, 'redirects')
  if (redirects !== undefined && !Array.isArray(redirects)) {
    warnings.push(issue('warning', 'redirect', 'redirects', 'redirects should be an array.'))
    return
  }

  if (!Array.isArray(redirects)) return

  redirects.forEach((redirect, index) => {
    if (!isRecord(redirect)) {
      warnings.push(issue('warning', 'redirect', `redirects[${index}]`, 'Redirect record should be an object.'))
      return
    }

    const from = normalizeSlug(stringValue(redirect.from))
    const to = normalizeSlug(stringValue(redirect.to))
    if (from && to && from === to) {
      warnings.push(issue('warning', 'redirect', `redirects[${index}]`, 'Redirect from/to should not be the same slug.'))
    }
  })
}

function addDuplicateSlugIssues(results: PageContractResult[]) {
  const seen = new Map<string, PageContractResult[]>()
  results.forEach((item) => {
    const key = `${item.tenantId}:${normalizeSlug(item.pageSlug)}`
    if (!item.pageSlug) return
    const existing = seen.get(key) || []
    existing.push(item)
    seen.set(key, existing)
  })

  seen.forEach((items) => {
    if (items.length < 2) return
    items.forEach((item) => {
      item.errors.push(issue('error', 'seo', 'pageSlug', `Duplicate same-tenant pageSlug "${item.pageSlug}" appears in this JSON payload.`))
    })
  })
}

function getAvailableLeadFields(page: JsonRecord, contactBlocks: JsonRecord[]) {
  const fields = new Set<string>()
  const normalizedMap = getPath(page, 'formConfig.normalizedFieldMap')
  if (isRecord(normalizedMap)) {
    Object.keys(normalizedMap).forEach((key) => fields.add(normalizeLeadFieldKey(key)))
    Object.values(normalizedMap).forEach((value) => fields.add(normalizeLeadFieldKey(String(value))))
  }

  contactBlocks.forEach((block) => {
    const formFields = getPath(block, 'content.formFields')
    if (!Array.isArray(formFields)) return

    formFields.forEach((field) => {
      if (!isRecord(field)) return
      const text = [
        field.name,
        field.key,
        field.id,
        field.label,
        field.placeholder,
        field.type,
      ].map((value) => String(value || '').toLowerCase()).join(' ')

      if (text.includes('name')) fields.add('name')
      if (text.includes('email')) fields.add('email')
      if (text.includes('phone') || text.includes('tel')) fields.add('phone')
      if (text.includes('date')) fields.add('eventDate')
      if (text.includes('location') || text.includes('venue')) fields.add('eventLocation')
      if (text.includes('message') || text.includes('details')) fields.add('message')
    })
  })

  return fields
}

function normalizeLeadFieldKey(value: string) {
  const key = value.trim().toLowerCase().replace(/[-_\s]/g, '')
  if (key.includes('eventdate') || key === 'date') return 'eventDate'
  if (key.includes('eventlocation') || key.includes('venue') || key === 'location') return 'eventLocation'
  if (key.includes('email')) return 'email'
  if (key.includes('phone') || key.includes('tel')) return 'phone'
  if (key.includes('message') || key.includes('details')) return 'message'
  if (key.includes('name')) return 'name'
  return value
}

function getBlocks(page: JsonRecord): JsonRecord[] {
  const blocks = getPath(page, 'ContentData.ContentBlocks')
  return Array.isArray(blocks) ? blocks.filter(isRecord) : []
}

function getPath(value: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (!isRecord(current)) return undefined
    return current[key]
  }, value)
}

function hasValue(value: unknown) {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return true
  return true
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function issue(severity: ContractSeverity, category: ContractCategory, field: string, message: string): ContractIssue {
  return { severity, category, field, message }
}

function result(
  index: number,
  pageSlug: string,
  title: string,
  tenantId: string,
  templateKey: TemplateKey,
  errors: ContractIssue[],
  warnings: ContractIssue[],
): PageContractResult {
  return {
    index,
    pageSlug,
    title,
    tenantId,
    templateKey,
    contractLabel: TEMPLATE_CONTRACTS[templateKey].label,
    errors,
    warnings,
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}
