'use client'

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import MediaPicker, { getMediaAssetReference } from '@/components/MediaPicker'
import { apiClient } from '@/lib/api'
import type { IHtmlBlock, MediaAsset, Page, PageRedirect } from 'pumpkin-ts-models'
import {
  RICH_HTML_PROFILES,
  SECTION_CONTAINERS,
  SECTION_VARIANTS,
  TRUSTED_EMBED_PROVIDERS,
  getDefaultFormDefinitions,
  validateContentBlocksDesignSystem,
  validateCustomHtmlContent,
  validateFormBlockContent,
  validatePageFormBlocks,
  validateTrustedEmbedContent,
} from 'pumpkin-ts-models'

const LOCAL_PREVIEW_HOSTS: Record<string, string> = {
  'ice-rink-rentals': 'http://localhost:3002',
  'roller-rink-rentals': 'http://roller.localhost:3002',
}

const SUPPORTED_BLOCK_TYPES = new Set([
  'Hero',
  'TrustBar',
  'CardGrid',
  'HowItWorks',
  'FAQ',
  'PrimaryCTA',
  'Contact',
  'formBlock',
  'customHtml',
  'trustedEmbed',
])

const BLOCK_ARRAY_FIELDS: Record<string, string[]> = {
  TrustBar: ['items'],
  CardGrid: ['cards'],
  HowItWorks: ['steps'],
  FAQ: ['items'],
  Contact: ['formFields'],
}

const FULFILLMENT_STATUSES = [
  '',
  'direct_partner_available',
  'partner_network_or_researched_provider',
  'research_only_until_provider_confirmed',
] as const

const LEAD_ROUTING_MODES = [
  '',
  'send_to_primary_partner',
  'manual_review_then_provider_match',
  'researched_provider_match',
  'unmet_demand_followup',
] as const

const AREA_SERVED_TYPES = ['', 'Country', 'State', 'City', 'County', 'Metro', 'Region', 'ServiceArea', 'Custom'] as const
const SITEMAP_CHANGE_FREQUENCIES = ['', 'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'] as const
const WORKFLOW_STATUSES = ['', 'draft', 'review', 'approved', 'published', 'unpublished', 'archived', 'deprecated'] as const

type SeoStringField = 'metaTitle' | 'metaDescription' | 'robots' | 'canonicalUrl'
type PageMetaStringField = 'title' | 'description' | 'category' | 'product' | 'keyword' | 'pageType'
type SearchStringField = 'state' | 'city' | 'metro' | 'county' | 'keyword' | 'contentSummary'
type PageQualityStringField = 'buyerIntent' | 'landingPageType' | 'launchNotes'
type FulfillmentStringField = 'fulfillmentStatus' | 'leadRoutingMode'
type FulfillmentBooleanField = 'primaryPartnerAvailable' | 'manualReviewRequired' | 'providerResearchCompleted' | 'publicDisclosureRequired'
type GoogleAdsStringField = 'finalUrl' | 'landingPageType' | 'campaignTheme' | 'notes'
type MediaSlot = 'featuredImage' | 'heroImage' | 'localImage' | 'closingImage'
type MediaStringField = 'assetId' | 'url' | 'alt' | 'title' | 'caption' | 'source' | 'licenseStatus' | 'usageStatus'
type MediaNumberField = 'width' | 'height' | 'focalPointX' | 'focalPointY'
type WorkflowStringField = 'status'
type WorkflowBooleanField = 'approvedForPublish'
type StaticPublishingBooleanField = 'staticEligible' | 'needsRebuild'
type TemplateStringField = 'templateKey' | 'templateVersion' | 'layoutVariant' | 'contentModelVersion'
type LinkingStringField = 'hubPage' | 'parentPage'
type LinkingListField = 'relatedPages' | 'requiredLinks' | 'breadcrumbTrail'
type SchemaControlBooleanField = 'enableWebPageSchema' | 'enableBreadcrumbSchema' | 'enableFAQSchema' | 'enableServiceSchema'
type ServiceSchemaStringField = 'serviceName' | 'serviceType' | 'serviceCategory' | 'schemaOutputMode' | 'notes'
type ServiceSchemaListField = 'audience' | 'eventTypes'
type ProductOfferedStringField = 'name' | 'type' | 'description' | 'url' | 'category'
type ProductOfferedBooleanField = 'isPrimary'
type ProductOfferedNumberField = 'displayOrder'
type AreaServedStringField = 'name' | 'type' | 'stateCode' | 'city' | 'county' | 'metro' | 'country' | 'url' | 'serviceAreaType' | 'confidence'
type AreaServedBooleanField = 'isPrimary'
type FormConfigStringField = 'formType' | 'conversionGoal' | 'routingMode' | 'domainRoutingKey' | 'replyToMode' | 'emailSubjectTemplate' | 'thankYouUrl' | 'thankYouMessage' | 'recipientGroup' | 'staticFormEndpointKey'
type FormConfigBooleanField = 'consentRequired' | 'spamProtectionEnabled' | 'mailtoFallbackEnabled'
type DomainRoutingStringField = 'domain' | 'brandName' | 'publicContactEmail' | 'quoteRequestEmail' | 'supportEmail' | 'replyToEmail' | 'fromName' | 'fromEmail' | 'contactPageSlug' | 'primaryPhone' | 'defaultLeadRoutingMode' | 'defaultRecipientGroup' | 'staticFormEndpointKey' | 'emailProvider' | 'emailProviderStatus' | 'mxStatus' | 'spfStatus' | 'dkimStatus' | 'dmarcStatus' | 'notes'
type DomainRoutingBooleanField = 'mailtoLinksEnabled'
type EditableContent = Record<string, unknown>

interface ValidationResult {
  errors: string[]
  warnings: string[]
}

interface SectionProps {
  title: string
  description?: string
  children: ReactNode
}

interface TextFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  multiline?: boolean
  rows?: number
  testId?: string
}

interface ArrayEditorProps {
  label: string
  items: unknown
  blockIndex: number
  arrayKey: string
  renderItem: (item: EditableContent, itemIndex: number) => ReactNode
}

interface ImageSignal {
  slot: string
  source: string
  path: string
  value: string
}

function isRecord(value: unknown): value is EditableContent {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toRecord(value: unknown): EditableContent {
  return isRecord(value) ? value : {}
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function booleanValue(value: unknown) {
  return typeof value === 'boolean' ? value : false
}

function numberValue(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
  }

  return fallback
}

function nullableNumberValue(value: unknown) {
  if (value === null || value === undefined || value === '') return ''
  const parsed = Number(value)
  return Number.isFinite(parsed) ? String(parsed) : ''
}

function nullableParsedNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function getEditorName(user: { username?: string; email?: string } | null | undefined) {
  return user?.username || user?.email || 'Pumpkin CMS Admin'
}

function stringListValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => stringValue(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }

  return []
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\\/\s]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function normalizeRedirectSlug(value: string) {
  try {
    const url = new URL(value)
    return normalizeSlug(url.pathname) || 'home'
  } catch {
    return normalizeSlug(value) || (value.trim() === '/' ? 'home' : '')
  }
}

function getPageRedirects(page: Page | null | undefined): PageRedirect[] {
  if (!Array.isArray(page?.redirects)) return []

  return page.redirects
    .map((redirect) => ({
      from: normalizeRedirectSlug(redirect.from),
      to: normalizeRedirectSlug(redirect.to),
      type: 301 as const,
      reason: redirect.reason || 'slug_changed',
      createdAt: redirect.createdAt || '',
      createdBy: redirect.createdBy || '',
      active: redirect.active !== false,
    }))
    .filter((redirect) => redirect.from && redirect.to && redirect.from !== redirect.to)
}

function getActiveRedirects(page: Page | null | undefined) {
  return getPageRedirects(page).filter((redirect) => redirect.active)
}

function getMissingRedirectCoverage(page: Page | null | undefined) {
  if (!page) return []
  const currentSlug = normalizeRedirectSlug(page.pageSlug)
  const activeRedirects = getActiveRedirects(page)

  return stringListValue(page.previousSlugs)
    .map(normalizeRedirectSlug)
    .filter(Boolean)
    .filter((previousSlug) => !activeRedirects.some((redirect) => (
      redirect.from === previousSlug && normalizeRedirectSlug(redirect.to) === currentSlug
    )))
}

function getCanonicalSlugMismatch(page: Page | null | undefined) {
  const canonicalUrl = page?.seo?.canonicalUrl || ''
  if (!page || !canonicalUrl.trim()) return false

  try {
    const canonical = new URL(canonicalUrl)
    return (normalizeRedirectSlug(canonical.pathname) || 'home') !== normalizeRedirectSlug(page.pageSlug)
  } catch {
    return false
  }
}

function isUrlLike(value: string) {
  if (!value.trim()) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message?: unknown }).message || fallback)
  }

  return fallback
}

function formatJson(value: unknown) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return 'Unable to serialize this block.'
  }
}

function emptyImageAsset() {
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
    licenseStatus: '',
    usageStatus: '',
    usageType: '',
    status: '',
    tags: [] as string[],
    blocker: null as boolean | null,
    width: null as number | null,
    height: null as number | null,
    focalPointX: null as number | null,
    focalPointY: null as number | null,
    decorative: false,
  }
}

function emptyOpenGraphImage() {
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
    licenseStatus: '',
    usageStatus: '',
    usageType: '',
    status: '',
    tags: [] as string[],
    width: null as number | null,
    height: null as number | null,
  }
}

function emptyProductOffered() {
  return {
    name: '',
    type: '',
    description: '',
    url: '',
    category: '',
    isPrimary: false,
    displayOrder: 0,
  }
}

function emptyAreaServed() {
  return {
    name: '',
    type: '',
    stateCode: '',
    city: '',
    county: '',
    metro: '',
    country: 'US',
    url: '',
    serviceAreaType: '',
    confidence: '',
    isPrimary: false,
  }
}

function getPageMedia(page: Page) {
  return {
    ...(page.media || {}),
    featuredImage: { ...emptyImageAsset(), ...page.media?.featuredImage },
    heroImage: { ...emptyImageAsset(), ...page.media?.heroImage },
    localImage: { ...emptyImageAsset(), ...page.media?.localImage },
    closingImage: { ...emptyImageAsset(), ...page.media?.closingImage },
    openGraphImage: {
      ...emptyOpenGraphImage(),
      ...(page.media?.openGraphImage || {}),
      url: page.media?.openGraphImage?.url || page.seo?.openGraph?.['og:image'] || '',
      alt: page.media?.openGraphImage?.alt || page.seo?.openGraph?.['og:image:alt'] || '',
    },
  }
}

type ImageAssetDraft = ReturnType<typeof emptyImageAsset>

function imageAssetFromMediaAsset(asset: MediaAsset, current: ImageAssetDraft): ImageAssetDraft {
  return {
    ...current,
    mediaAssetId: asset.id || current.mediaAssetId,
    assetId: getMediaAssetReference(asset),
    publicUrl: getMediaAssetPublicUrl(asset) || current.publicUrl,
    url: getMediaAssetPublicUrl(asset) || current.url,
    alt: getMediaAssetAltText(asset) || current.alt,
    title: asset.title || current.title,
    caption: asset.caption || current.caption,
    source: asset.credit || asset.source || current.source,
    licenseStatus: asset.licenseStatus || current.licenseStatus,
    usageStatus: asset.usageStatus || current.usageStatus,
    width: asset.width ?? current.width,
    height: asset.height ?? current.height,
    focalPointX: asset.focalPoint?.x ?? current.focalPointX,
    focalPointY: asset.focalPoint?.y ?? current.focalPointY,
    decorative: asset.decorative,
  }
}

function getMediaAssetPublicUrl(asset: MediaAsset) {
  return asset.publicUrl || asset.url || ''
}

function getMediaAssetAltText(asset: MediaAsset) {
  return asset.altText || asset.alt || ''
}

function getImageSlotWarnings(slot: MediaSlot, asset: ImageAssetDraft, isPublished: boolean) {
  const warnings: string[] = []

  if (asset.url && !asset.assetId) warnings.push('Image URL is not linked to a Media Library assetId.')
  if (asset.url && !asset.decorative && !asset.alt.trim()) warnings.push('Alt text is missing for a non-decorative image.')
  if (asset.decorative && asset.alt.trim()) warnings.push('Decorative images usually should have empty alt text.')
  if (asset.url && (asset.licenseStatus === 'unknown' || asset.licenseStatus === 'needs_review' || !asset.licenseStatus)) {
    warnings.push('License status needs review before publish.')
  }
  if (isPublished && asset.url && asset.usageStatus !== 'approved_for_publish') {
    warnings.push('Published page uses an image that is not marked approved_for_publish.')
  }
  if ((slot === 'featuredImage' || slot === 'heroImage') && asset.url && (asset.focalPointX === null || asset.focalPointY === null)) {
    warnings.push('Focal point is missing for a primary image slot.')
  }

  return warnings
}

function getBlockImageWarnings(url: string, assetId: string, alt: string, licenseStatus: string, usageStatus: string) {
  const warnings: string[] = []

  if (url && !assetId) warnings.push('URL is not linked to a Media Library assetId.')
  if (url && !alt.trim()) warnings.push('Alt text is missing.')
  if (url && (licenseStatus === 'unknown' || licenseStatus === 'needs_review')) warnings.push('License needs review.')
  if (url && usageStatus && usageStatus !== 'approved_for_publish') warnings.push('Asset usage is not approved_for_publish.')

  return warnings
}

function getPageFulfillment(page: Page) {
  return {
    fulfillmentStatus: page.fulfillment?.fulfillmentStatus || '',
    primaryPartnerAvailable: Boolean(page.fulfillment?.primaryPartnerAvailable),
    manualReviewRequired: page.fulfillment?.manualReviewRequired ?? true,
    providerResearchCompleted: Boolean(page.fulfillment?.providerResearchCompleted),
    topProviderCount: numberValue(page.fulfillment?.topProviderCount, 0),
    leadRoutingMode: page.fulfillment?.leadRoutingMode || '',
    publicDisclosureRequired: Boolean(page.fulfillment?.publicDisclosureRequired),
    confirmedServiceStates: stringListValue(page.fulfillment?.confirmedServiceStates),
    extendedStatesPossible: stringListValue(page.fulfillment?.extendedStatesPossible),
  }
}

function getPageGoogleAds(page: Page) {
  return {
    eligible: Boolean(page.googleAds?.eligible),
    finalUrl: page.googleAds?.finalUrl || '',
    landingPageType: page.googleAds?.landingPageType || page.pageQuality?.landingPageType || '',
    campaignTheme: page.googleAds?.campaignTheme || '',
    conversionGoals: stringListValue(page.googleAds?.conversionGoals),
    notes: page.googleAds?.notes || '',
  }
}

function getPageQuality(page: Page) {
  return {
    buyerIntent: page.pageQuality?.buyerIntent || '',
    landingPageType: page.pageQuality?.landingPageType || page.googleAds?.landingPageType || '',
    launchNotes: page.pageQuality?.launchNotes || '',
  }
}

function getPageWorkflow(page: Page) {
  return {
    status: page.workflow?.status || (page.isPublished ? 'published' : 'draft'),
    approvedForPublish: Boolean(page.workflow?.approvedForPublish),
    approvedBy: page.workflow?.approvedBy || '',
    approvedAt: page.workflow?.approvedAt || '',
    lastEditedBy: page.workflow?.lastEditedBy || '',
    lastEditedAt: page.workflow?.lastEditedAt || '',
  }
}

function getPageRevision(page: Page) {
  return {
    currentRevisionId: page.revision?.currentRevisionId || '',
    revisionNumber: numberValue(page.revision?.revisionNumber, page.PageVersion || 1),
    revisionLabel: page.revision?.revisionLabel || '',
    lastSnapshotAt: page.revision?.lastSnapshotAt || '',
    lastRevisionAt: page.revision?.lastRevisionAt || '',
    lastRevisionBy: page.revision?.lastRevisionBy || '',
    rollbackAvailable: Boolean(page.revision?.rollbackAvailable),
    rollbackNotes: page.revision?.rollbackNotes || 'No rollback snapshot has been created yet.',
    lastChangeSummary: page.revision?.lastChangeSummary || '',
    lastChangedBy: page.revision?.lastChangedBy || '',
    lastChangeSource: page.revision?.lastChangeSource || 'manual_unknown',
    lastChangeAt: page.revision?.lastChangeAt || '',
    latestSnapshot: page.revision?.latestSnapshot || null,
  }
}

function getPageStaticPublishing(page: Page) {
  return {
    staticEligible: Boolean(page.staticPublishing?.staticEligible),
    needsRebuild: page.staticPublishing?.needsRebuild ?? true,
    lastSnapshotAt: page.staticPublishing?.lastSnapshotAt || '',
    lastStaticBuildAt: page.staticPublishing?.lastStaticBuildAt || '',
    lastDeployedAt: page.staticPublishing?.lastDeployedAt || '',
    contentHash: page.staticPublishing?.contentHash || '',
    lastPublishedContentHash: page.staticPublishing?.lastPublishedContentHash || '',
    deploymentStatus: page.staticPublishing?.deploymentStatus || 'not_deployed',
  }
}

function getPageTemplateIdentity(page: Page) {
  return {
    templateKey: page.template?.templateKey || '',
    templateVersion: page.template?.templateVersion || '',
    layoutVariant: page.template?.layoutVariant || page.Layout || '',
    contentModelVersion: page.template?.contentModelVersion || '1',
  }
}

function getPageLinking(page: Page) {
  return {
    hubPage: page.linking?.hubPage || page.contentRelationships?.hubPageSlug || '',
    parentPage: page.linking?.parentPage || '',
    relatedPages: stringListValue(page.linking?.relatedPages),
    requiredLinks: stringListValue(page.linking?.requiredLinks),
    breadcrumbTrail: stringListValue(page.linking?.breadcrumbTrail),
  }
}

function getPageSchemaControls(page: Page) {
  return {
    enableWebPageSchema: page.schemaControls?.enableWebPageSchema ?? true,
    enableBreadcrumbSchema: page.schemaControls?.enableBreadcrumbSchema ?? true,
    enableFAQSchema: page.schemaControls?.enableFAQSchema ?? true,
    enableServiceSchema: page.schemaControls?.enableServiceSchema ?? true,
    schemaWarnings: stringListValue(page.schemaControls?.schemaWarnings),
  }
}

function getPageServiceSchema(page: Page) {
  const serviceSchema = toRecord(page.serviceSchema)
  const productsOffered = Array.isArray(serviceSchema.productsOffered)
    ? serviceSchema.productsOffered.filter(isRecord).map((item) => ({
        ...emptyProductOffered(),
        ...item,
        name: stringValue(item.name),
        type: stringValue(item.type),
        description: stringValue(item.description),
        url: stringValue(item.url),
        category: stringValue(item.category),
        isPrimary: booleanValue(item.isPrimary),
        displayOrder: numberValue(item.displayOrder, 0),
      }))
    : []
  const areasServed = Array.isArray(serviceSchema.areasServed)
    ? serviceSchema.areasServed.filter(isRecord).map((item) => ({
        ...emptyAreaServed(),
        ...item,
        name: stringValue(item.name),
        type: stringValue(item.type),
        stateCode: stringValue(item.stateCode),
        city: stringValue(item.city),
        county: stringValue(item.county),
        metro: stringValue(item.metro),
        country: stringValue(item.country) || 'US',
        url: stringValue(item.url),
        serviceAreaType: stringValue(item.serviceAreaType),
        confidence: stringValue(item.confidence),
        isPrimary: booleanValue(item.isPrimary),
      }))
    : []

  return {
    serviceName: stringValue(serviceSchema.serviceName),
    serviceType: stringValue(serviceSchema.serviceType),
    serviceCategory: stringValue(serviceSchema.serviceCategory),
    productsOffered,
    areasServed,
    audience: stringListValue(serviceSchema.audience),
    eventTypes: stringListValue(serviceSchema.eventTypes),
    schemaOutputMode: stringValue(serviceSchema.schemaOutputMode) || 'validate_only',
    publicSchemaEnabled: booleanValue(serviceSchema.publicSchemaEnabled),
    notes: stringValue(serviceSchema.notes),
  }
}

function getPageFormConfig(page: Page) {
  return {
    formId: page.formConfig?.formId || '',
    formType: page.formConfig?.formType || '',
    conversionGoal: page.formConfig?.conversionGoal || '',
    routingMode: page.formConfig?.routingMode || '',
    domainRoutingKey: page.formConfig?.domainRoutingKey || '',
    replyToMode: page.formConfig?.replyToMode || '',
    emailSubjectTemplate: page.formConfig?.emailSubjectTemplate || '',
    mailtoFallbackEnabled: Boolean(page.formConfig?.mailtoFallbackEnabled),
    thankYouUrl: page.formConfig?.thankYouUrl || '',
    thankYouMessage: page.formConfig?.thankYouMessage || '',
    recipientGroup: page.formConfig?.recipientGroup || '',
    staticFormEndpointKey: page.formConfig?.staticFormEndpointKey || '',
    normalizedFieldMap: page.formConfig?.normalizedFieldMap || {},
    requiresConsent: page.formConfig?.requiresConsent ?? true,
    consentRequired: page.formConfig?.consentRequired ?? true,
    spamProtectionRequired: page.formConfig?.spamProtectionRequired ?? true,
    spamProtectionEnabled: Boolean(page.formConfig?.spamProtectionEnabled),
  }
}

function getPageDomainRouting(page: Page) {
  const domainRouting = toRecord(page.domainRouting)

  return {
    ...domainRouting,
    domain: stringValue(domainRouting.domain),
    brandName: stringValue(domainRouting.brandName),
    businessDisplayName: stringValue(domainRouting.businessDisplayName),
    publicContactEmail: stringValue(domainRouting.publicContactEmail),
    publicEmailDisplayPolicy: stringValue(domainRouting.publicEmailDisplayPolicy),
    selectedMailbox: stringValue(domainRouting.selectedMailbox),
    selectedMailboxMetadata: stringValue(domainRouting.selectedMailboxMetadata),
    quoteRequestEmail: stringValue(domainRouting.quoteRequestEmail),
    supportEmail: stringValue(domainRouting.supportEmail),
    replyToEmail: stringValue(domainRouting.replyToEmail),
    fromName: stringValue(domainRouting.fromName),
    fromEmail: stringValue(domainRouting.fromEmail),
    contactPageSlug: stringValue(domainRouting.contactPageSlug),
    primaryPhone: stringValue(domainRouting.primaryPhone),
    mailtoLinksEnabled: booleanValue(domainRouting.mailtoLinksEnabled),
    defaultLeadRoutingMode: stringValue(domainRouting.defaultLeadRoutingMode),
    defaultRecipientGroup: stringValue(domainRouting.defaultRecipientGroup),
    staticFormEndpointKey: stringValue(domainRouting.staticFormEndpointKey),
    leadRecipientRef: stringValue(domainRouting.leadRecipientRef),
    staticEndpointRef: stringValue(domainRouting.staticEndpointRef),
    emailProvider: stringValue(domainRouting.emailProvider),
    selectedEmailProvider: stringValue(domainRouting.selectedEmailProvider),
    pumpkinAppSendStatus: stringValue(domainRouting.pumpkinAppSendStatus),
    emailProviderStatus: stringValue(domainRouting.emailProviderStatus),
    mxStatus: stringValue(domainRouting.mxStatus),
    spfStatus: stringValue(domainRouting.spfStatus),
    dkimStatus: stringValue(domainRouting.dkimStatus),
    dmarcStatus: stringValue(domainRouting.dmarcStatus),
    notes: stringValue(domainRouting.notes),
  }
}

function getPageImportProvenance(page: Page) {
  return {
    lastImportBatchId: page.importProvenance?.lastImportBatchId || '',
    sourceFile: page.importProvenance?.sourceFile || '',
    sourceRow: page.importProvenance?.sourceRow || '',
    externalId: page.importProvenance?.externalId || '',
    lockedFields: stringListValue(page.importProvenance?.lockedFields),
    overwriteBehavior: page.importProvenance?.overwriteBehavior || 'warn',
  }
}

function getPageDeploymentHooks(page: Page) {
  return {
    deploymentId: page.deploymentHooks?.deploymentId || '',
    buildId: page.deploymentHooks?.buildId || '',
    buildWarningCount: numberValue(page.deploymentHooks?.buildWarningCount, 0),
    publishSource: page.deploymentHooks?.publishSource || '',
  }
}

function getPreviewUrl(page: Page) {
  const baseUrl = LOCAL_PREVIEW_HOSTS[page.tenantId] || 'http://localhost:3002'
  return page.pageSlug === 'home' ? `${baseUrl}/` : `${baseUrl}/${page.pageSlug}`
}

function getViewUrl(page: Page, refreshKey?: string | number) {
  const query = new URLSearchParams({ tenantId: page.tenantId })
  if (refreshKey) query.set('fresh', String(refreshKey))
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/view?${query.toString()}`
}

function getEditUrl(page: Page, refreshKey?: string | number) {
  const query = new URLSearchParams({ tenantId: page.tenantId })
  if (refreshKey) query.set('fresh', String(refreshKey))
  return `/dashboard/pages/${encodeURIComponent(page.pageSlug)}/edit?${query.toString()}`
}

function withUpdatedAt(page: Page) {
  return {
    ...page,
    MetaData: {
      ...page.MetaData,
      updatedAt: new Date().toISOString(),
    },
  }
}

function updateBlockTypes(page: Page) {
  const blocks = Array.isArray(page.ContentData?.ContentBlocks)
    ? page.ContentData.ContentBlocks
    : []

  return {
    ...page,
    searchData: {
      ...page.searchData,
      blockTypes: blocks.map((block) => block.type).filter(Boolean),
    },
  }
}

function normalizeProductionFields(page: Page, editorName = 'Pumpkin CMS Admin'): Page {
  const media = getPageMedia(page)
  const fulfillment = getPageFulfillment(page)
  const googleAds = getPageGoogleAds(page)
  const pageQuality = getPageQuality(page)
  const workflow = getPageWorkflow(page)
  const revision = getPageRevision(page)
  const staticPublishing = getPageStaticPublishing(page)
  const template = getPageTemplateIdentity(page)
  const linking = getPageLinking(page)
  const schemaControls = getPageSchemaControls(page)
  const serviceSchema = getPageServiceSchema(page)
  const formConfig = getPageFormConfig(page)
  const domainRouting = getPageDomainRouting(page)
  const importProvenance = getPageImportProvenance(page)
  const deploymentHooks = getPageDeploymentHooks(page)
  const targetKeyword = page.MetaData?.keyword || page.searchData?.keyword || ''
  const now = new Date().toISOString()
  const approvedForPublish = workflow.approvedForPublish || workflow.status === 'approved' || workflow.status === 'published'

  return {
    ...page,
    previousSlugs: stringListValue(page.previousSlugs),
    redirects: getPageRedirects(page),
    sitemapPriority: page.sitemapPriority ?? null,
    sitemapChangeFrequency: page.sitemapChangeFrequency || '',
    MetaData: {
      ...page.MetaData,
      keyword: targetKeyword,
    },
    searchData: {
      ...page.searchData,
      keyword: targetKeyword,
    },
    seo: {
      ...page.seo,
      openGraph: {
        ...page.seo?.openGraph,
        'og:image': media.openGraphImage.url || page.seo?.openGraph?.['og:image'] || '',
        'og:image:alt': media.openGraphImage.alt || page.seo?.openGraph?.['og:image:alt'] || '',
      },
    },
    media,
    fulfillment,
    googleAds,
    pageQuality,
    workflow: {
      ...workflow,
      approvedForPublish,
      approvedBy: approvedForPublish ? workflow.approvedBy || editorName : workflow.approvedBy,
      approvedAt: approvedForPublish ? workflow.approvedAt || now : workflow.approvedAt,
      lastEditedBy: editorName,
      lastEditedAt: now,
    },
    revision,
    staticPublishing: {
      ...staticPublishing,
      needsRebuild: true,
      deploymentStatus: staticPublishing.deploymentStatus || 'pending_rebuild',
    },
    template,
    linking,
    schemaControls,
    serviceSchema,
    formConfig,
    domainRouting,
    importProvenance,
    deploymentHooks,
  }
}

function sanitizeRecordArray(value: unknown, stringFields: string[], booleanFields: string[] = []) {
  if (!Array.isArray(value)) return value

  return value.map((item) => {
    if (!isRecord(item)) return item

    const nextItem: EditableContent = { ...item }
    stringFields.forEach((field) => {
      nextItem[field] = stringValue(nextItem[field])
    })
    booleanFields.forEach((field) => {
      nextItem[field] = booleanValue(nextItem[field])
    })

    return nextItem
  })
}

function sanitizeSupportedBlockForSave(block: IHtmlBlock): IHtmlBlock {
  if (!SUPPORTED_BLOCK_TYPES.has(block.type)) {
    return block
  }

  const content = toRecord(block.content)

  switch (block.type) {
    case 'Hero':
      return {
        ...block,
        content: {
          ...content,
          headline: stringValue(content.headline),
          subheadline: stringValue(content.subheadline),
          buttonText: stringValue(content.buttonText),
          buttonLink: stringValue(content.buttonLink),
          backgroundImage: stringValue(content.backgroundImage),
          backgroundImageAltText: stringValue(content.backgroundImageAltText),
          mainImage: stringValue(content.mainImage),
          mainImageAltText: stringValue(content.mainImageAltText),
        },
      }
    case 'TrustBar':
      return {
        ...block,
        content: {
          ...content,
          items: sanitizeRecordArray(content.items, ['icon', 'title', 'text', 'alt']),
        },
      }
    case 'CardGrid':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          subtitle: stringValue(content.subtitle),
          layout: stringValue(content.layout),
          cards: sanitizeRecordArray(content.cards, ['title', 'description', 'icon', 'link', 'image', 'image-alt', 'alt']),
        },
      }
    case 'HowItWorks':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          steps: sanitizeRecordArray(content.steps, ['title', 'text', 'image', 'alt']),
        },
      }
    case 'FAQ':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          subtitle: stringValue(content.subtitle),
          layout: stringValue(content.layout),
          items: sanitizeRecordArray(content.items, ['question', 'answer']),
        },
      }
    case 'PrimaryCTA':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          description: stringValue(content.description),
          buttonText: stringValue(content.buttonText),
          buttonLink: stringValue(content.buttonLink),
          secondaryText: stringValue(content.secondaryText),
          secondaryLinkText: stringValue(content.secondaryLinkText),
          secondaryLink: stringValue(content.secondaryLink),
          backgroundImage: stringValue(content.backgroundImage),
          mainImage: stringValue(content.mainImage),
          alt: stringValue(content.alt),
        },
      }
    case 'Contact':
      return {
        ...block,
        content: {
          ...content,
          title: stringValue(content.title),
          subtitle: stringValue(content.subtitle),
          address: stringValue(content.address),
          phone: stringValue(content.phone),
          email: stringValue(content.email),
          hours: stringValue(content.hours),
          submitButtonText: stringValue(content.submitButtonText),
          formFields: sanitizeRecordArray(content.formFields, ['label', 'type', 'placeholder'], ['required']),
        },
      }
    case 'formBlock':
      return {
        ...block,
        content: {
          ...content,
          id: stringValue(content.id),
          label: stringValue(content.label),
          formKey: stringValue(content.formKey) || 'default-contact',
          variant: stringValue(content.variant) || 'contact-card',
          heading: stringValue(content.heading),
          intro: stringValue(content.intro),
          submitLabel: stringValue(content.submitLabel) || 'Submit',
          successMessage: stringValue(content.successMessage),
          errorMessage: stringValue(content.errorMessage),
          staticEndpointRef: stringValue(content.staticEndpointRef),
          leadRecipientRef: stringValue(content.leadRecipientRef),
          sourcePage: stringValue(content.sourcePage),
          review: isRecord(content.review) ? content.review : { status: 'draft' },
          validation: isRecord(content.validation) ? content.validation : {},
        },
      }
    case 'customHtml':
      return {
        ...block,
        content: {
          ...content,
          id: stringValue(content.id),
          label: stringValue(content.label),
          html: stringValue(content.html),
          container: stringValue(content.container) || 'standard',
          allowedProfile: stringValue(content.allowedProfile) || 'marketing-basic',
          sectionVariant: stringValue(content.sectionVariant),
          css: stringValue(content.css),
          sanitize: content.sanitize !== false,
          review: isRecord(content.review) ? content.review : { status: 'draft' },
          validation: isRecord(content.validation) ? content.validation : {},
        },
      }
    case 'trustedEmbed':
      return {
        ...block,
        content: {
          ...content,
          provider: stringValue(content.provider) || 'youtube',
          url: stringValue(content.url),
          title: stringValue(content.title),
          aspectRatio: stringValue(content.aspectRatio) || '16:9',
          caption: stringValue(content.caption),
          container: stringValue(content.container) || 'standard',
          review: isRecord(content.review) ? content.review : { status: 'draft' },
          validation: isRecord(content.validation) ? content.validation : {},
        },
      }
    default:
      return block
  }
}

function preparePageForSave(page: Page, editorName = 'Pumpkin CMS Admin') {
  const now = new Date().toISOString()
  const blocks = Array.isArray(page.ContentData?.ContentBlocks)
    ? page.ContentData.ContentBlocks.map(sanitizeSupportedBlockForSave)
    : []

  return normalizeProductionFields(updateBlockTypes(withUpdatedAt({
    ...page,
    pageSlug: normalizeSlug(page.pageSlug),
    publishedAt: page.isPublished && !page.publishedAt ? now : page.publishedAt,
    ContentData: {
      ...page.ContentData,
      ContentBlocks: blocks,
    },
  })), editorName)
}

function hasFormOrCta(page: Page) {
  const blocks = Array.isArray(page.ContentData?.ContentBlocks)
    ? page.ContentData.ContentBlocks
    : []

  return blocks.some((block) => {
    const content = toRecord(block.content)
    if (block.type === 'Contact') return true
    if (block.type === 'formBlock') return true
    if (block.type === 'PrimaryCTA') return Boolean(stringValue(content.buttonText) || stringValue(content.buttonLink))
    return false
  })
}

function collectPageImageWarnings(page: Page) {
  const warnings: string[] = []
  const media = getPageMedia(page)

  Object.entries(media).forEach(([slot, asset]) => {
    const image = toRecord(asset)
    const url = stringValue(image.url)
    if (!url) return

    if (!stringValue(image.alt) && image.decorative !== true) {
      warnings.push(`${slot}.alt is missing while ${slot}.url is set.`)
    }

    if ('source' in image && !stringValue(image.source)) {
      warnings.push(`${slot}.source is missing while ${slot}.url is set.`)
    }

    if ('licenseStatus' in image && !stringValue(image.licenseStatus)) {
      warnings.push(`${slot}.licenseStatus is missing while ${slot}.url is set.`)
    }

    if ('usageStatus' in image && !stringValue(image.usageStatus)) {
      warnings.push(`${slot}.usageStatus is missing while ${slot}.url is set.`)
    }
  })

  const blocks = Array.isArray(page.ContentData?.ContentBlocks)
    ? page.ContentData.ContentBlocks
    : []

  blocks.forEach((block, blockIndex) => {
    const content = toRecord(block.content)
    Object.entries(content).forEach(([key, value]) => {
      if (!key.toLowerCase().includes('image') || typeof value !== 'string' || !value.trim()) return

      const altCandidates = [
        `${key}Alt`,
        `${key}AltText`,
        key.replace(/Image$/i, 'ImageAlt'),
        key.replace(/Image$/i, 'ImageAltText'),
        'alt',
        'image-alt',
      ]

      const hasAlt = altCandidates.some((candidate) => stringValue(content[candidate]).trim())
      if (!hasAlt) {
        warnings.push(`Block ${blockIndex + 1} ${block.type}.${key} has an image URL but no nearby alt text.`)
      }
    })
  })

  return warnings
}

function validatePage(page: Page | null, tenantId: string): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!page) {
    errors.push('Page data has not loaded.')
    return { errors, warnings }
  }

  if (page.tenantId !== tenantId) {
    errors.push('Loaded page tenant does not match the selected tenant.')
  }

  if (!normalizeSlug(page.pageSlug)) {
    errors.push('Page slug is required.')
  }

  if (page.seo?.canonicalUrl && !isUrlLike(page.seo.canonicalUrl)) {
    errors.push('Canonical URL must be a valid http or https URL when set.')
  }

  if (!Array.isArray(page.ContentData?.ContentBlocks)) {
    errors.push('ContentData.ContentBlocks must remain an array.')
  }

  const blocks = Array.isArray(page.ContentData?.ContentBlocks)
    ? page.ContentData.ContentBlocks
    : []

  const designValidation = validateContentBlocksDesignSystem(blocks)
  designValidation.errors.forEach((issue) => errors.push(issue.message))
  designValidation.warnings.forEach((issue) => warnings.push(issue.message))

  const formValidation = validatePageFormBlocks(page)
  formValidation.errors.forEach((issue) => errors.push(issue.message))
  formValidation.warnings.forEach((issue) => warnings.push(issue.message))

  if (!page.MetaData?.title?.trim()) {
    warnings.push('MetaData.title is empty.')
  }

  if (!page.seo?.metaTitle?.trim()) {
    warnings.push('seo.metaTitle is empty.')
  }

  if (!page.seo?.metaDescription?.trim()) {
    warnings.push('seo.metaDescription is empty.')
  }

  if (!page.seo?.canonicalUrl?.trim()) {
    warnings.push('seo.canonicalUrl is empty.')
  }

  if (!page.seo?.robots?.trim()) {
    warnings.push('seo.robots is empty.')
  }

  if (page.seo?.metaTitle && page.seo.metaTitle.length > 65) {
    warnings.push('seo.metaTitle is longer than 65 characters.')
  }

  if (page.seo?.metaDescription && page.seo.metaDescription.length > 165) {
    warnings.push('seo.metaDescription is longer than 165 characters.')
  }

  const targetKeyword = page.MetaData?.keyword || page.searchData?.keyword || ''
  if (!targetKeyword.trim()) {
    warnings.push('Target keyword is missing.')
  }

  if (page.isPublished && !page.includeInSitemap) {
    warnings.push('Published page is not included in sitemap.')
  }

  if (page.includeInSitemap && !page.seo?.canonicalUrl?.trim()) {
    warnings.push('Sitemap page has no canonical URL.')
  }

  if (page.sitemapPriority !== undefined && page.sitemapPriority !== null && (page.sitemapPriority < 0 || page.sitemapPriority > 1)) {
    warnings.push('sitemapPriority should be between 0 and 1.')
  }

  const activeRedirects = getActiveRedirects(page)
  const redirectFroms = new Set<string>()
  activeRedirects.forEach((redirect) => {
    if (!redirect.from || !redirect.to) {
      errors.push('Active redirects require both from and to slugs.')
    }
    if (redirect.from === redirect.to) {
      errors.push(`Redirect from "${redirect.from}" cannot point to itself.`)
    }
    if (redirectFroms.has(redirect.from)) {
      errors.push(`Duplicate active redirect from "${redirect.from}" is not allowed.`)
    }
    redirectFroms.add(redirect.from)
  })

  const missingCoverage = getMissingRedirectCoverage(page)
  if (missingCoverage.length > 0) {
    warnings.push(`Previous slug redirect coverage is missing for: ${missingCoverage.join(', ')}.`)
  }

  if (getCanonicalSlugMismatch(page)) {
    warnings.push('Canonical URL path does not appear to match the current page slug.')
  }

  const workflow = getPageWorkflow(page)
  if (page.isPublished && !workflow.approvedForPublish) {
    warnings.push('Published page is not marked approvedForPublish.')
  }

  if (page.isPublished && !['approved', 'published'].includes(workflow.status)) {
    warnings.push('Published page should use workflow.status approved or published.')
  }

  const revision = getPageRevision(page)
  if (!revision.rollbackAvailable) {
    warnings.push('No latest rollback snapshot exists yet; the next successful update will create one.')
  }

  const staticPublishing = getPageStaticPublishing(page)
  if (page.isPublished && !staticPublishing.staticEligible) {
    warnings.push('Published page is not marked staticEligible.')
  }

  if (staticPublishing.needsRebuild) {
    warnings.push('Page is marked needsRebuild; static output should be regenerated before deployment.')
  }

  const template = getPageTemplateIdentity(page)
  if (!template.templateKey) {
    warnings.push('template.templateKey is missing.')
  }

  if (!template.contentModelVersion) {
    warnings.push('template.contentModelVersion is missing.')
  }

  const serviceSchema = getPageServiceSchema(page)
  const isServiceLikePage = [
    'service',
    'state-service-hub',
    'city-service-area',
    'event-use',
    'product-intent',
  ].includes(template.templateKey) || ['service', 'state', 'city', 'event', 'product'].some((value) =>
    `${page.MetaData?.pageType || ''} ${page.pageSlug || ''}`.toLowerCase().includes(value),
  )

  if (isServiceLikePage && !serviceSchema.serviceName.trim()) {
    warnings.push('serviceSchema.serviceName is missing for a service-like page.')
  }

  if (isServiceLikePage && !serviceSchema.serviceType.trim()) {
    warnings.push('serviceSchema.serviceType is missing for a service-like page.')
  }

  if (isServiceLikePage && serviceSchema.productsOffered.length === 0) {
    warnings.push('serviceSchema.productsOffered should include at least one item for service-like pages.')
  }

  if (['state-service-hub', 'city-service-area'].includes(template.templateKey) && serviceSchema.areasServed.length === 0) {
    warnings.push('serviceSchema.areasServed should include at least one area for location/service-area pages.')
  }

  serviceSchema.productsOffered.forEach((product, index) => {
    if (!product.name.trim() || !product.type.trim()) {
      warnings.push(`serviceSchema.productsOffered[${index}] should include name and type.`)
    }
  })

  serviceSchema.areasServed.forEach((area, index) => {
    if (!area.name.trim() || !area.type.trim()) {
      warnings.push(`serviceSchema.areasServed[${index}] should include name and type.`)
    }
  })

  if (serviceSchema.publicSchemaEnabled && (!serviceSchema.serviceName.trim() || !serviceSchema.serviceType.trim())) {
    warnings.push('Public Service schema is enabled but serviceName/serviceType are incomplete.')
  }

  const fulfillment = getPageFulfillment(page)
  if (!fulfillment.fulfillmentStatus) {
    warnings.push('Fulfillment status is missing.')
  }

  if (fulfillment.fulfillmentStatus && fulfillment.fulfillmentStatus !== 'direct_partner_available' && !fulfillment.publicDisclosureRequired) {
    warnings.push('Non-direct fulfillment should mark public disclosure required before launch.')
  }

  const googleAds = getPageGoogleAds(page)
  if (googleAds.eligible && !page.seo?.metaDescription?.trim()) {
    warnings.push('Google Ads eligible page is missing a meta description.')
  }

  if (googleAds.eligible && !hasFormOrCta(page)) {
    warnings.push('Google Ads eligible page should include a form or CTA.')
  }

  if (googleAds.eligible && fulfillment.fulfillmentStatus === 'research_only_until_provider_confirmed') {
    warnings.push('Google Ads eligible page uses research-only fulfillment; review before launch.')
  }

  warnings.push(...collectPageImageWarnings(page))

  const linking = getPageLinking(page)
  if (linking.requiredLinks.length > 0) {
    const pageText = JSON.stringify(page.ContentData || {})
    linking.requiredLinks.forEach((requiredLink) => {
      if (requiredLink && !pageText.includes(requiredLink)) {
        warnings.push(`Required link "${requiredLink}" was not found in ContentData.`)
      }
    })
  }

  const schemaControls = getPageSchemaControls(page)
  const hasFaqBlock = blocks.some((block) => block.type === 'FAQ')
  if (hasFaqBlock && !schemaControls.enableFAQSchema) {
    warnings.push('Page has FAQ content but FAQ schema is disabled.')
  }

  const formConfig = getPageFormConfig(page)
  if (hasFormOrCta(page) && !formConfig.conversionGoal) {
    warnings.push('Page has a form or CTA but formConfig.conversionGoal is missing.')
  }

  const hasStructuredForm = blocks.some((block) => block.type === 'Contact' || block.type === 'formBlock')

  if (hasStructuredForm && !formConfig.formType) {
    warnings.push('Contact/formBlock exists but formConfig.formType is missing.')
  }

  if (hasStructuredForm && !formConfig.domainRoutingKey) {
    warnings.push('Contact/formBlock exists but formConfig.domainRoutingKey is missing.')
  }

  if (hasStructuredForm && !formConfig.staticFormEndpointKey) {
    warnings.push('Contact/formBlock exists but formConfig.staticFormEndpointKey is missing for static publishing.')
  }

  blocks.forEach((block, index) => {
    const content = toRecord(block.content)
    const arrayFields = BLOCK_ARRAY_FIELDS[block.type] || []

    arrayFields.forEach((field) => {
      if (content[field] !== undefined && !Array.isArray(content[field])) {
        errors.push(`Block ${index + 1} ${block.type}.${field} must remain an array.`)
      }
    })
  })

  return { errors, warnings }
}

function collectImageSignalsFromValue(value: unknown, slot: string, source: string, path: string[] = []): ImageSignal[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => collectImageSignalsFromValue(item, slot, source, [...path, String(index)]))
  }

  if (!isRecord(value)) return []

  return Object.entries(value).flatMap(([key, item]) => {
    const normalizedKey = key.toLowerCase()
    const nextPath = [...path, key]
    const currentSignal = (normalizedKey.includes('image') || normalizedKey.includes('alt')) && typeof item !== 'object'
      ? [{
          slot,
          source,
          path: nextPath.join('.').replace(/\.(\d+)(?=\.|$)/g, '[$1]'),
          value: String(item || 'Not set'),
        }]
      : []

    return [
      ...currentSignal,
      ...collectImageSignalsFromValue(item, slot, source, nextPath),
    ]
  })
}

function collectImageSignals(page: Page) {
  const blocks = page.ContentData?.ContentBlocks || []

  return blocks.flatMap((block, index) => {
    let slot = 'Other image field'

    if (block.type === 'Hero') slot = 'Hero image slot'
    if (['CardGrid', 'HowItWorks', 'Gallery', 'LocalProTips', 'ServiceAreaMap', 'Testimonials'].includes(block.type)) {
      slot = 'Dynamic/local rink image slot'
    }
    if (['PrimaryCTA', 'SecondaryCTA', 'Contact'].includes(block.type)) {
      slot = 'Closing image slot'
    }

    return collectImageSignalsFromValue(block.content, slot, `Block ${index + 1}: ${block.type || 'Missing type'}`, ['content'])
  })
}

function Section({ title, description, children }: SectionProps) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
      </div>
      <div className="space-y-4 px-5 py-5">{children}</div>
    </section>
  )
}

function TextField({ label, value, onChange, placeholder, multiline = false, rows = 3, testId }: TextFieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={rows}
          data-testid={testId}
          className="input text-sm"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          data-testid={testId}
          className="input text-sm"
        />
      )}
    </label>
  )
}

function CheckboxField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-800">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
      />
      {label}
    </label>
  )
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input text-sm"
      >
        {children}
      </select>
    </label>
  )
}

function RichValidationPanel({ errors, warnings }: { errors: string[]; warnings: string[] }) {
  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
        Rich section validation passed.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {errors.length > 0 && (
        <div className="space-y-1 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errors.map((error) => <div key={error}>{error}</div>)}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {warnings.map((warning) => <div key={warning}>{warning}</div>)}
        </div>
      )}
    </div>
  )
}

function ReadOnlyPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
      <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 break-words font-mono text-sm text-neutral-800">{value || 'Not set'}</div>
    </div>
  )
}

function ArrayEditor({ label, items, renderItem }: ArrayEditorProps) {
  if (items !== undefined && !Array.isArray(items)) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {label} is not an array and cannot be edited safely.
      </div>
    )
  }

  const arrayItems = Array.isArray(items) ? items : []

  if (arrayItems.length === 0) {
    return (
      <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
        No {label.toLowerCase()} are present on this block.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
        {label} ({arrayItems.length})
      </div>
      {arrayItems.map((item, itemIndex) => (
        <div key={itemIndex} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Item {itemIndex + 1}
          </div>
          {isRecord(item) ? renderItem(item, itemIndex) : (
            <pre className="overflow-auto rounded bg-white p-3 text-xs text-neutral-700">
              {formatJson(item)}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}

function UnsupportedBlock({ block }: { block: IHtmlBlock }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <div className="mb-2 text-sm font-semibold text-amber-900">Unsupported block type</div>
      <p className="mb-3 text-sm text-amber-900">
        This block is read-only in Phase 2 and will be preserved exactly on save.
      </p>
      <pre className="max-h-96 overflow-auto rounded bg-white p-3 text-xs text-neutral-800">
        {formatJson(block)}
      </pre>
    </div>
  )
}

export default function PageStructuredEditor() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { token, user, currentTenant } = useAuth()

  const routeId = params.id
  const encodedPageSlug = Array.isArray(routeId) ? routeId[0] : routeId
  const routePageSlug = encodedPageSlug ? decodeURIComponent(encodedPageSlug) : ''
  const tenantId = searchParams.get('tenantId') || currentTenant?.tenantId || user?.tenantId || ''
  const freshnessToken = searchParams.get('fresh') || ''

  const [page, setPage] = useState<Page | null>(null)
  const [originalSlug, setOriginalSlug] = useState(routePageSlug)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [changeSummary, setChangeSummary] = useState('')

  useEffect(() => {
    let isActive = true

    const fetchPage = async () => {
      if (!token || !user || !tenantId || !routePageSlug) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        setSuccess(null)
        const pageData = await apiClient.getPage(token, tenantId, routePageSlug)

        if (!isActive) return

        if (pageData.tenantId !== tenantId) {
          setPage(null)
          setError('Loaded page tenant does not match the selected tenant.')
          return
        }

        setPage(pageData)
        setOriginalSlug(pageData.pageSlug)
      } catch (fetchError) {
        if (isActive) {
          setError(getErrorMessage(fetchError, 'Failed to load page for editing.'))
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchPage()

    return () => {
      isActive = false
    }
  }, [token, user, tenantId, routePageSlug, freshnessToken])

  const validation = useMemo(() => validatePage(page, tenantId), [page, tenantId])
  const imageSignals = useMemo(() => (page ? collectImageSignals(page) : []), [page])
  const contentBlocks = page?.ContentData?.ContentBlocks || []
  const pageMedia = page ? getPageMedia(page) : null
  const pageFulfillment = page ? getPageFulfillment(page) : null
  const pageGoogleAds = page ? getPageGoogleAds(page) : null
  const pageQuality = page ? getPageQuality(page) : null
  const pageWorkflow = page ? getPageWorkflow(page) : null
  const pageRevision = page ? getPageRevision(page) : null
  const pageStaticPublishing = page ? getPageStaticPublishing(page) : null
  const pageTemplate = page ? getPageTemplateIdentity(page) : null
  const pageLinking = page ? getPageLinking(page) : null
  const pageSchemaControls = page ? getPageSchemaControls(page) : null
  const pageServiceSchema = page ? getPageServiceSchema(page) : null
  const pageFormConfig = page ? getPageFormConfig(page) : null
  const pageDomainRouting = page ? getPageDomainRouting(page) : null
  const pageImportProvenance = page ? getPageImportProvenance(page) : null
  const pageDeploymentHooks = page ? getPageDeploymentHooks(page) : null
  const slugChanged = page ? normalizeRedirectSlug(page.pageSlug) !== normalizeRedirectSlug(originalSlug) : false
  const activeRedirects = page ? getActiveRedirects(page) : []
  const missingRedirectCoverage = page ? getMissingRedirectCoverage(page) : []
  const canonicalSlugMismatch = page ? getCanonicalSlugMismatch(page) : false

  const updatePageState = (updater: (current: Page) => Page) => {
    setPage((current) => (current ? withUpdatedAt(updater(current)) : current))
    setSuccess(null)
  }

  const updateMetaField = (field: PageMetaStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      MetaData: {
        ...current.MetaData,
        [field]: value,
      },
    }))
  }

  const updateSeoField = (field: SeoStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      seo: {
        ...current.seo,
        [field]: value,
      },
    }))
  }

  const updateSeoKeywords = (value: string) => {
    updatePageState((current) => ({
      ...current,
      seo: {
        ...current.seo,
        keywords: stringListValue(value),
      },
    }))
  }

  const updateOpenGraphField = (field: 'og:title' | 'og:description' | 'og:image' | 'og:image:alt', value: string) => {
    updatePageState((current) => ({
      ...current,
      seo: {
        ...current.seo,
        openGraph: {
          ...current.seo.openGraph,
          [field]: value,
        },
      },
    }))
  }

  const updateTwitterField = (field: 'twitter:title' | 'twitter:description' | 'twitter:image', value: string) => {
    updatePageState((current) => ({
      ...current,
      seo: {
        ...current.seo,
        twitterCard: {
          ...current.seo.twitterCard,
          [field]: value,
        },
      },
    }))
  }

  const updateSearchField = (field: SearchStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      searchData: {
        ...current.searchData,
        [field]: value,
      },
      MetaData: field === 'keyword'
        ? {
            ...current.MetaData,
            keyword: value,
          }
        : current.MetaData,
    }))
  }

  const updatePreviousSlugs = (value: string) => {
    updatePageState((current) => ({
      ...current,
      previousSlugs: stringListValue(value),
    }))
  }

  const updateSitemapPriority = (value: string) => {
    updatePageState((current) => {
      const parsed = value.trim() ? Number(value) : null
      return {
        ...current,
        sitemapPriority: parsed !== null && Number.isFinite(parsed) ? parsed : null,
      }
    })
  }

  const updateSitemapChangeFrequency = (value: string) => {
    updatePageState((current) => ({
      ...current,
      sitemapChangeFrequency: value,
    }))
  }

  const updatePageQualityField = (field: PageQualityStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      pageQuality: {
        ...getPageQuality(current),
        [field]: value,
      },
      googleAds: field === 'landingPageType'
        ? {
            ...getPageGoogleAds(current),
            landingPageType: value,
          }
        : current.googleAds,
    }))
  }

  const updateMediaField = (slot: MediaSlot, field: MediaStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      media: {
        ...getPageMedia(current),
        [slot]: {
          ...getPageMedia(current)[slot],
          [field]: value,
        },
      },
    }))
  }

  const updateMediaNumberField = (slot: MediaSlot, field: MediaNumberField, value: string) => {
    updatePageState((current) => ({
      ...current,
      media: {
        ...getPageMedia(current),
        [slot]: {
          ...getPageMedia(current)[slot],
          [field]: nullableParsedNumber(value),
        },
      },
    }))
  }

  const updateMediaDecorative = (slot: MediaSlot, value: boolean) => {
    updatePageState((current) => ({
      ...current,
      media: {
        ...getPageMedia(current),
        [slot]: {
          ...getPageMedia(current)[slot],
          decorative: value,
        },
      },
    }))
  }

  const applyMediaAssetToSlot = (slot: MediaSlot, asset: MediaAsset) => {
    updatePageState((current) => {
      const media = getPageMedia(current)

      return {
        ...current,
        media: {
          ...media,
          [slot]: imageAssetFromMediaAsset(asset, media[slot]),
        },
      }
    })
  }

  const clearMediaSlotAsset = (slot: MediaSlot) => {
    updatePageState((current) => {
      const media = getPageMedia(current)

      return {
        ...current,
        media: {
          ...media,
          [slot]: {
            ...media[slot],
            mediaAssetId: '',
            assetId: '',
          },
        },
      }
    })
  }

  const applyOpenGraphMediaAsset = (asset: MediaAsset) => {
    updatePageState((current) => {
      const media = getPageMedia(current)
      const openGraphImage = media.openGraphImage

      return {
        ...current,
        media: {
          ...media,
          openGraphImage: {
            ...openGraphImage,
            mediaAssetId: asset.id || openGraphImage.mediaAssetId,
            assetId: getMediaAssetReference(asset),
            publicUrl: getMediaAssetPublicUrl(asset),
            url: getMediaAssetPublicUrl(asset),
            alt: getMediaAssetAltText(asset),
            title: asset.title || openGraphImage.title,
            caption: asset.caption || openGraphImage.caption,
            source: asset.credit || asset.source || openGraphImage.source,
            licenseStatus: asset.licenseStatus || openGraphImage.licenseStatus,
            usageStatus: asset.usageStatus || openGraphImage.usageStatus,
            width: asset.width ?? openGraphImage.width,
            height: asset.height ?? openGraphImage.height,
          },
        },
        seo: {
          ...current.seo,
          openGraph: {
            ...current.seo.openGraph,
            'og:image': getMediaAssetPublicUrl(asset),
            'og:image:alt': getMediaAssetAltText(asset),
          },
        },
      }
    })
  }

  const updateWorkflowField = (field: WorkflowStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      workflow: {
        ...getPageWorkflow(current),
        [field]: value,
      },
    }))
  }

  const updateWorkflowBoolean = (field: WorkflowBooleanField, value: boolean) => {
    updatePageState((current) => ({
      ...current,
      workflow: {
        ...getPageWorkflow(current),
        [field]: value,
      },
    }))
  }

  const updateStaticPublishingBoolean = (field: StaticPublishingBooleanField, value: boolean) => {
    updatePageState((current) => ({
      ...current,
      staticPublishing: {
        ...getPageStaticPublishing(current),
        [field]: value,
      },
    }))
  }

  const updateTemplateField = (field: TemplateStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      template: {
        ...getPageTemplateIdentity(current),
        [field]: value,
      },
    }))
  }

  const updateLinkingField = (field: LinkingStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      linking: {
        ...getPageLinking(current),
        [field]: value,
      },
    }))
  }

  const updateLinkingList = (field: LinkingListField, value: string) => {
    updatePageState((current) => ({
      ...current,
      linking: {
        ...getPageLinking(current),
        [field]: stringListValue(value),
      },
    }))
  }

  const updateSchemaControlBoolean = (field: SchemaControlBooleanField, value: boolean) => {
    updatePageState((current) => ({
      ...current,
      schemaControls: {
        ...getPageSchemaControls(current),
        [field]: value,
      },
    }))
  }

  const updateServiceSchemaField = (field: ServiceSchemaStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      serviceSchema: {
        ...getPageServiceSchema(current),
        [field]: value,
      },
    }))
  }

  const updateServiceSchemaBoolean = (field: 'publicSchemaEnabled', value: boolean) => {
    updatePageState((current) => ({
      ...current,
      serviceSchema: {
        ...getPageServiceSchema(current),
        [field]: value,
      },
    }))
  }

  const updateServiceSchemaList = (field: ServiceSchemaListField, value: string) => {
    updatePageState((current) => ({
      ...current,
      serviceSchema: {
        ...getPageServiceSchema(current),
        [field]: stringListValue(value),
      },
    }))
  }

  const addProductOffered = () => {
    updatePageState((current) => {
      const serviceSchema = getPageServiceSchema(current)
      return {
        ...current,
        serviceSchema: {
          ...serviceSchema,
          productsOffered: [
            ...serviceSchema.productsOffered,
            { ...emptyProductOffered(), displayOrder: serviceSchema.productsOffered.length + 1 },
          ],
        },
      }
    })
  }

  const updateProductOffered = (
    index: number,
    field: ProductOfferedStringField | ProductOfferedBooleanField | ProductOfferedNumberField,
    value: string | boolean,
  ) => {
    updatePageState((current) => {
      const serviceSchema = getPageServiceSchema(current)
      const productsOffered = serviceSchema.productsOffered.map((item, itemIndex) => {
        if (itemIndex !== index) return item
        if (field === 'isPrimary') return { ...item, [field]: Boolean(value) }
        if (field === 'displayOrder') return { ...item, [field]: numberValue(value, item.displayOrder) }
        return { ...item, [field]: stringValue(value) }
      })

      return {
        ...current,
        serviceSchema: {
          ...serviceSchema,
          productsOffered,
        },
      }
    })
  }

  const removeProductOffered = (index: number) => {
    updatePageState((current) => {
      const serviceSchema = getPageServiceSchema(current)
      return {
        ...current,
        serviceSchema: {
          ...serviceSchema,
          productsOffered: serviceSchema.productsOffered.filter((_, itemIndex) => itemIndex !== index),
        },
      }
    })
  }

  const addAreaServed = () => {
    updatePageState((current) => {
      const serviceSchema = getPageServiceSchema(current)
      return {
        ...current,
        serviceSchema: {
          ...serviceSchema,
          areasServed: [...serviceSchema.areasServed, emptyAreaServed()],
        },
      }
    })
  }

  const updateAreaServed = (
    index: number,
    field: AreaServedStringField | AreaServedBooleanField,
    value: string | boolean,
  ) => {
    updatePageState((current) => {
      const serviceSchema = getPageServiceSchema(current)
      const areasServed = serviceSchema.areasServed.map((item, itemIndex) => {
        if (itemIndex !== index) return item
        if (field === 'isPrimary') return { ...item, [field]: Boolean(value) }
        return { ...item, [field]: stringValue(value) }
      })

      return {
        ...current,
        serviceSchema: {
          ...serviceSchema,
          areasServed,
        },
      }
    })
  }

  const removeAreaServed = (index: number) => {
    updatePageState((current) => {
      const serviceSchema = getPageServiceSchema(current)
      return {
        ...current,
        serviceSchema: {
          ...serviceSchema,
          areasServed: serviceSchema.areasServed.filter((_, itemIndex) => itemIndex !== index),
        },
      }
    })
  }

  const updateFormConfigField = (field: FormConfigStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      formConfig: {
        ...getPageFormConfig(current),
        [field]: value,
      },
    }))
  }

  const updateFormConfigBoolean = (field: FormConfigBooleanField, value: boolean) => {
    updatePageState((current) => ({
      ...current,
      formConfig: {
        ...getPageFormConfig(current),
        [field]: value,
      },
    }))
  }

  const updateDomainRoutingField = (field: DomainRoutingStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      domainRouting: {
        ...getPageDomainRouting(current),
        [field]: value,
      },
    }))
  }

  const updateDomainRoutingBoolean = (field: DomainRoutingBooleanField, value: boolean) => {
    updatePageState((current) => ({
      ...current,
      domainRouting: {
        ...getPageDomainRouting(current),
        [field]: value,
      },
    }))
  }

  const updateOpenGraphImageField = (field: 'url' | 'alt', value: string) => {
    updatePageState((current) => ({
      ...current,
      media: {
        ...getPageMedia(current),
        openGraphImage: {
          ...getPageMedia(current).openGraphImage,
          [field]: value,
        },
      },
      seo: {
        ...current.seo,
        openGraph: {
          ...current.seo.openGraph,
          [field === 'url' ? 'og:image' : 'og:image:alt']: value,
        },
      },
    }))
  }

  const updateFulfillmentField = (field: FulfillmentStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      fulfillment: {
        ...getPageFulfillment(current),
        [field]: value,
      },
    }))
  }

  const updateFulfillmentBoolean = (field: FulfillmentBooleanField, value: boolean) => {
    updatePageState((current) => ({
      ...current,
      fulfillment: {
        ...getPageFulfillment(current),
        [field]: value,
      },
    }))
  }

  const updateFulfillmentNumber = (field: 'topProviderCount', value: string) => {
    updatePageState((current) => ({
      ...current,
      fulfillment: {
        ...getPageFulfillment(current),
        [field]: numberValue(value, 0),
      },
    }))
  }

  const updateFulfillmentList = (field: 'confirmedServiceStates' | 'extendedStatesPossible', value: string) => {
    updatePageState((current) => ({
      ...current,
      fulfillment: {
        ...getPageFulfillment(current),
        [field]: stringListValue(value),
      },
    }))
  }

  const updateGoogleAdsField = (field: GoogleAdsStringField, value: string) => {
    updatePageState((current) => ({
      ...current,
      googleAds: {
        ...getPageGoogleAds(current),
        [field]: value,
      },
      pageQuality: field === 'landingPageType'
        ? {
            ...getPageQuality(current),
            landingPageType: value,
          }
        : current.pageQuality,
    }))
  }

  const updateGoogleAdsEligible = (value: boolean) => {
    updatePageState((current) => ({
      ...current,
      googleAds: {
        ...getPageGoogleAds(current),
        eligible: value,
      },
    }))
  }

  const updateGoogleAdsGoals = (value: string) => {
    updatePageState((current) => ({
      ...current,
      googleAds: {
        ...getPageGoogleAds(current),
        conversionGoals: stringListValue(value),
      },
    }))
  }

  const updateBooleanField = (field: 'isPublished' | 'includeInSitemap', value: boolean) => {
    updatePageState((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateSlug = (value: string) => {
    updatePageState((current) => ({
      ...current,
      pageSlug: value,
    }))
  }

  const updateBlockContent = (blockIndex: number, updater: (content: EditableContent) => EditableContent) => {
    updatePageState((current) => {
      const blocks = Array.isArray(current.ContentData?.ContentBlocks)
        ? current.ContentData.ContentBlocks
        : []

      const updatedBlocks = blocks.map((block, index) => (
        index === blockIndex
          ? { ...block, content: updater(toRecord(block.content)) }
          : block
      ))

      return {
        ...current,
        ContentData: {
          ...current.ContentData,
          ContentBlocks: updatedBlocks,
        },
      }
    })
  }

  const updateBlockField = (blockIndex: number, field: string, value: string) => {
    updateBlockContent(blockIndex, (content) => ({
      ...content,
      [field]: value,
    }))
  }

  const addFormBlockSection = () => {
    updatePageState((current) => {
      const blocks = Array.isArray(current.ContentData?.ContentBlocks)
        ? current.ContentData.ContentBlocks
        : []
      const isIce = current.tenantId === 'ice-rink-rentals'
      const formKey = isIce && normalizeSlug(current.pageSlug) === 'contact'
        ? 'default-quote-request'
        : 'default-contact'
      const endpointRef = current.formConfig?.staticFormEndpointKey || current.domainRouting?.staticFormEndpointKey || (isIce ? 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT' : '')
      const leadRecipientRef = current.formConfig?.recipientGroup || current.formConfig?.domainRoutingKey || current.domainRouting?.defaultRecipientGroup || (isIce ? 'ICE_RINK_RENTALS_LEAD_RECIPIENT' : '')
      const normalizedPageSlug = normalizeSlug(current.pageSlug) || 'contact'
      const sourcePage = normalizedPageSlug === 'home' ? '/' : `/${normalizedPageSlug}`

      return {
        ...current,
        ContentData: {
          ...current.ContentData,
          ContentBlocks: [
            ...blocks,
            {
              type: 'formBlock',
              content: {
                id: 'contact-quote-form',
                label: 'Quote request form',
                formKey,
                variant: isIce ? 'quote-form-panel' : 'contact-card',
                heading: isIce ? 'Request an ice rink rental quote' : 'Send a message',
                intro: isIce ? 'Share the event basics so the request can be reviewed for timing, location, and setup needs.' : 'Send the details needed for follow-up.',
                submitLabel: isIce ? 'Submit Quote Request' : 'Submit',
                successMessage: current.formConfig?.thankYouMessage || 'Thanks. Your request has been received.',
                errorMessage: 'Unable to submit this request right now. Please try again.',
                staticEndpointRef: endpointRef,
                leadRecipientRef,
                sourcePage,
                review: { status: 'draft' },
                validation: { expected: 'visible structured formBlock' },
              },
            } as IHtmlBlock,
          ],
        },
      }
    })
  }

  const updateBlockArrayItemField = (
    blockIndex: number,
    arrayKey: string,
    itemIndex: number,
    field: string,
    value: string | boolean,
  ) => {
    updateBlockContent(blockIndex, (content) => {
      const currentItems = Array.isArray(content[arrayKey]) ? [...content[arrayKey] as unknown[]] : []
      const currentItem = toRecord(currentItems[itemIndex])
      currentItems[itemIndex] = {
        ...currentItem,
        [field]: value,
      }

      return {
        ...content,
        [arrayKey]: currentItems,
      }
    })
  }

  const applyMediaAssetToBlockField = (
    blockIndex: number,
    imageField: string,
    altField: string,
    asset: MediaAsset,
  ) => {
    updateBlockContent(blockIndex, (content) => ({
      ...content,
      [imageField]: getMediaAssetPublicUrl(asset),
      ...(altField ? { [altField]: getMediaAssetAltText(asset) } : {}),
      [`${imageField}AssetId`]: getMediaAssetReference(asset),
      [`${imageField}LicenseStatus`]: asset.licenseStatus || '',
      [`${imageField}UsageStatus`]: asset.usageStatus || '',
      [`${imageField}FocalPointX`]: asset.focalPoint?.x ?? null,
      [`${imageField}FocalPointY`]: asset.focalPoint?.y ?? null,
    }))
  }

  const applyMediaAssetToBlockArrayItem = (
    blockIndex: number,
    arrayKey: string,
    itemIndex: number,
    imageField: string,
    altField: string,
    asset: MediaAsset,
  ) => {
    updateBlockContent(blockIndex, (content) => {
      const currentItems = Array.isArray(content[arrayKey]) ? [...content[arrayKey] as unknown[]] : []
      const currentItem = toRecord(currentItems[itemIndex])
      currentItems[itemIndex] = {
        ...currentItem,
        [imageField]: getMediaAssetPublicUrl(asset),
        ...(altField ? { [altField]: getMediaAssetAltText(asset) } : {}),
        [`${imageField}AssetId`]: getMediaAssetReference(asset),
        [`${imageField}LicenseStatus`]: asset.licenseStatus || '',
        [`${imageField}UsageStatus`]: asset.usageStatus || '',
        [`${imageField}FocalPointX`]: asset.focalPoint?.x ?? null,
        [`${imageField}FocalPointY`]: asset.focalPoint?.y ?? null,
      }

      return {
        ...content,
        [arrayKey]: currentItems,
      }
    })
  }

  const handleSave = async () => {
    if (!page || !token || saving) return

    const result = validatePage(page, tenantId)
    if (result.errors.length > 0) {
      setError(result.errors.join(' '))
      return
    }

    if (page.isPublished && slugChanged) {
      const confirmed = window.confirm(
        [
          'This published page slug is changing.',
          '',
          `Old slug: /${normalizeRedirectSlug(originalSlug)}`,
          `New slug: /${normalizeRedirectSlug(page.pageSlug)}`,
          '',
          'Saving will create a 301 redirect, mark static publishing as needing rebuild, and may affect SEO, Google Ads final URLs, internal links, and existing backlinks.',
          'Continue?',
        ].join('\n'),
      )

      if (!confirmed) return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      const pageToSave = preparePageForSave(page, getEditorName(user))
      const savedPage = await apiClient.updatePage(token, tenantId, originalSlug, pageToSave, {
        changeSource: 'admin_editor',
        changeSummary,
      })

      setPage(savedPage)
      setOriginalSlug(savedPage.pageSlug)
      setChangeSummary('')
      setSuccess(`Page saved successfully. Detail view will refresh from revision ${savedPage.revision?.currentRevisionId || 'latest'}.`)

      if (savedPage.pageSlug !== routePageSlug) {
        router.replace(getEditUrl(savedPage, Date.now()))
      }
    } catch (saveError) {
      setError(getErrorMessage(saveError, 'Failed to save page.'))
    } finally {
      setSaving(false)
    }
  }

  if (!user || !token) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Authentication Required</h1>
        <p className="text-neutral-600">Please log in to edit tenant pages.</p>
      </div>
    )
  }

  if (!tenantId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">No Tenant Selected</h1>
        <p className="text-neutral-600 mb-4">Select a tenant/site before editing a page.</p>
        <button type="button" onClick={() => router.push('/dashboard/pages')} className="btn btn-primary">
          Back to Pages
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-neutral-600">Loading editor...</p>
      </div>
    )
  }

  if (error && !page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Editor Could Not Load</h1>
        <p className="text-neutral-600 mb-4">{error}</p>
        <button type="button" onClick={() => router.push('/dashboard/pages')} className="btn btn-primary">
          Back to Pages
        </button>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-neutral-900 mb-2">Page Missing</h1>
        <p className="text-neutral-600">The API did not return a page to edit.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.push(getViewUrl(page, Date.now()))}
            className="mb-3 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            Back to page detail
          </button>
          <h1 className="text-3xl font-bold text-neutral-900">Edit {page.MetaData?.title || page.pageSlug || 'Page'}</h1>
          <p className="mt-1 font-mono text-sm text-neutral-600">
            Tenant {page.tenantId} / {page.pageSlug || 'missing-slug'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={getPreviewUrl(page)} target="_blank" rel="noreferrer" className="btn btn-secondary">
            Preview
          </a>
          <button
            type="button"
            onClick={() => router.push(getViewUrl(page, Date.now()))}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || validation.errors.length > 0}
            className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      <div className="rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        Phase 6C creates a latest pre-update revision snapshot before admin saves. Tenant ID, Page ID, hard delete, and live deployment are still locked.
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {success}
        </div>
      )}

      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {validation.errors.length > 0 && (
            <div>
              <div className="font-semibold">Fix before saving</div>
              <ul className="mt-1 list-disc pl-5">
                {validation.errors.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className={validation.errors.length > 0 ? 'mt-3' : ''}>
              <div className="font-semibold">Warnings</div>
              <ul className="mt-1 list-disc pl-5">
                {validation.warnings.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      <Section title="Locked Identifiers" description="Tenant and document identifiers are displayed for context and are not editable in Phase 2.">
        <div className="grid gap-3 md:grid-cols-3">
          <ReadOnlyPill label="Tenant ID" value={page.tenantId} />
          <ReadOnlyPill label="Page ID" value={page.PageId || page.id || ''} />
          <ReadOnlyPill label="Original Slug For Save" value={originalSlug} />
        </div>
      </Section>

      <Section title="Slug / Redirects" description="Slug changes on published pages can affect SEO, Google Ads final URLs, internal links, static deployment, and backlinks. Saving a changed slug creates a 301 redirect from the old slug to the new slug.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField
            label="pageSlug"
            value={page.pageSlug || ''}
            onChange={updateSlug}
            placeholder="page-slug"
            testId="page-slug"
          />
          <TextField label="previousSlugs" value={(page.previousSlugs || []).join(', ')} onChange={updatePreviousSlugs} />
          <ReadOnlyPill label="Current slug" value={`/${normalizeRedirectSlug(page.pageSlug) || 'missing-slug'}`} />
          <ReadOnlyPill label="Redirect coverage" value={missingRedirectCoverage.length === 0 ? 'Covered or not needed' : `Missing: ${missingRedirectCoverage.join(', ')}`} />
          <ReadOnlyPill label="Canonical path status" value={canonicalSlugMismatch ? 'Review canonical URL' : 'Matches current slug or empty'} />
          <ReadOnlyPill label="Active redirects" value={String(activeRedirects.length)} />
        </div>
        {slugChanged && page.isPublished && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Published slug change pending: saving will create a 301 redirect from /{normalizeRedirectSlug(originalSlug)} to /{normalizeRedirectSlug(page.pageSlug)} and mark static publishing as needing rebuild.
          </div>
        )}
        {activeRedirects.length > 0 && (
          <pre className="mt-4 max-h-64 overflow-auto rounded-md bg-neutral-950 p-3 text-xs text-neutral-50">
            {JSON.stringify(activeRedirects, null, 2)}
          </pre>
        )}
      </Section>

      <Section title="Basics" description="Visible page title, targeting, geography, and production page classification.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField
            label="Page title / H1 (MetaData.title)"
            value={page.MetaData?.title || ''}
            onChange={(value) => updateMetaField('title', value)}
            testId="metadata-title"
          />
          <TextField
            label="MetaData.description"
            value={page.MetaData?.description || ''}
            onChange={(value) => updateMetaField('description', value)}
            multiline
            rows={4}
            testId="metadata-description"
          />
          <TextField
            label="pageType"
            value={page.MetaData?.pageType || ''}
            onChange={(value) => updateMetaField('pageType', value)}
            placeholder="service, state, city, lead-routing"
          />
          <TextField
            label="primaryService (MetaData.product)"
            value={page.MetaData?.product || ''}
            onChange={(value) => updateMetaField('product', value)}
            placeholder="Portable Ice Rink Rentals"
          />
          <TextField
            label="targetKeyword (MetaData.keyword / searchData.keyword)"
            value={page.MetaData?.keyword || page.searchData?.keyword || ''}
            onChange={(value) => updateSearchField('keyword', value)}
            placeholder="portable ice rink rentals"
          />
          <TextField
            label="secondaryKeywords (seo.keywords)"
            value={(page.seo?.keywords || []).join(', ')}
            onChange={updateSeoKeywords}
            placeholder="keyword one, keyword two"
          />
          <TextField
            label="state"
            value={page.searchData?.state || ''}
            onChange={(value) => updateSearchField('state', value)}
          />
          <TextField
            label="city"
            value={page.searchData?.city || ''}
            onChange={(value) => updateSearchField('city', value)}
          />
          <TextField
            label="region/metro"
            value={page.searchData?.metro || ''}
            onChange={(value) => updateSearchField('metro', value)}
          />
          <TextField
            label="county"
            value={page.searchData?.county || ''}
            onChange={(value) => updateSearchField('county', value)}
          />
          <TextField
            label="buyerIntent"
            value={pageQuality?.buyerIntent || ''}
            onChange={(value) => updatePageQualityField('buyerIntent', value)}
            placeholder="high, medium, informational, lead-routing"
          />
          <TextField
            label="landingPageType"
            value={pageQuality?.landingPageType || ''}
            onChange={(value) => updatePageQualityField('landingPageType', value)}
            placeholder="service, state, event, quote"
          />
        </div>
      </Section>

      <Section title="SEO" description="Search title, meta description, canonical, robots, sitemap, Open Graph, and Twitter Card fields.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField
            label="seo.metaTitle"
            value={page.seo?.metaTitle || ''}
            onChange={(value) => updateSeoField('metaTitle', value)}
            testId="seo-meta-title"
          />
          <TextField
            label="seo.robots"
            value={page.seo?.robots || ''}
            onChange={(value) => updateSeoField('robots', value)}
            placeholder="index, follow"
            testId="seo-robots"
          />
          <TextField
            label="seo.metaDescription"
            value={page.seo?.metaDescription || ''}
            onChange={(value) => updateSeoField('metaDescription', value)}
            multiline
            rows={4}
            testId="seo-meta-description"
          />
          <TextField
            label="seo.canonicalUrl"
            value={page.seo?.canonicalUrl || ''}
            onChange={(value) => updateSeoField('canonicalUrl', value)}
            placeholder="https://example.com/page"
            testId="seo-canonical-url"
          />
          <TextField
            label="Open Graph title"
            value={page.seo?.openGraph?.['og:title'] || ''}
            onChange={(value) => updateOpenGraphField('og:title', value)}
          />
          <TextField
            label="Open Graph description"
            value={page.seo?.openGraph?.['og:description'] || ''}
            onChange={(value) => updateOpenGraphField('og:description', value)}
            multiline
            rows={3}
          />
          <TextField
            label="Open Graph image"
            value={page.seo?.openGraph?.['og:image'] || ''}
            onChange={(value) => updateOpenGraphImageField('url', value)}
          />
          <TextField
            label="Open Graph image alt"
            value={page.seo?.openGraph?.['og:image:alt'] || ''}
            onChange={(value) => updateOpenGraphImageField('alt', value)}
          />
          <TextField
            label="Twitter title"
            value={page.seo?.twitterCard?.['twitter:title'] || ''}
            onChange={(value) => updateTwitterField('twitter:title', value)}
          />
          <TextField
            label="Twitter description"
            value={page.seo?.twitterCard?.['twitter:description'] || ''}
            onChange={(value) => updateTwitterField('twitter:description', value)}
            multiline
            rows={3}
          />
          <TextField
            label="Twitter image"
            value={page.seo?.twitterCard?.['twitter:image'] || ''}
            onChange={(value) => updateTwitterField('twitter:image', value)}
          />
        </div>
      </Section>

      <Section title="Service Schema / Areas Served" description="Products offered and internal areasServed data for future Schema.org areaServed output. Do not invent provider or coverage claims.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="serviceSchema.serviceName" value={pageServiceSchema?.serviceName || ''} onChange={(value) => updateServiceSchemaField('serviceName', value)} placeholder="Portable ice rink rentals" />
          <TextField label="serviceSchema.serviceType" value={pageServiceSchema?.serviceType || ''} onChange={(value) => updateServiceSchemaField('serviceType', value)} placeholder="RentalService" />
          <TextField label="serviceSchema.serviceCategory" value={pageServiceSchema?.serviceCategory || ''} onChange={(value) => updateServiceSchemaField('serviceCategory', value)} placeholder="Event rentals" />
          <TextField label="serviceSchema.schemaOutputMode" value={pageServiceSchema?.schemaOutputMode || ''} onChange={(value) => updateServiceSchemaField('schemaOutputMode', value)} placeholder="validate_only or json_ld" />
          <TextField label="serviceSchema.audience" value={(pageServiceSchema?.audience || []).join(', ')} onChange={(value) => updateServiceSchemaList('audience', value)} placeholder="municipal events, corporate events" />
          <TextField label="serviceSchema.eventTypes" value={(pageServiceSchema?.eventTypes || []).join(', ')} onChange={(value) => updateServiceSchemaList('eventTypes', value)} placeholder="holiday activations, school events" />
          <TextField label="serviceSchema.notes" value={pageServiceSchema?.notes || ''} onChange={(value) => updateServiceSchemaField('notes', value)} multiline rows={3} />
          <CheckboxField label="Public Service schema enabled" checked={Boolean(pageServiceSchema?.publicSchemaEnabled)} onChange={(value) => updateServiceSchemaBoolean('publicSchemaEnabled', value)} />
        </div>

        <div className="mt-5 rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Products Offered</h3>
              <p className="text-xs text-neutral-600">Use factual service/product items only. These are preserved for future offers or hasOfferCatalog mapping.</p>
            </div>
            <button type="button" onClick={addProductOffered} className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-white">
              Add Product
            </button>
          </div>
          {(pageServiceSchema?.productsOffered || []).length === 0 ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              No productsOffered items are recorded yet.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {(pageServiceSchema?.productsOffered || []).map((product, index) => (
                <div key={`product-${index}`} className="rounded-md border border-neutral-200 bg-white p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Product {index + 1}</div>
                    <button type="button" onClick={() => removeProductOffered(index)} className="text-xs font-semibold text-red-700 hover:text-red-900">
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <TextField label="name" value={product.name} onChange={(value) => updateProductOffered(index, 'name', value)} />
                    <TextField label="type" value={product.type} onChange={(value) => updateProductOffered(index, 'type', value)} />
                    <TextField label="category" value={product.category} onChange={(value) => updateProductOffered(index, 'category', value)} />
                    <TextField label="url" value={product.url} onChange={(value) => updateProductOffered(index, 'url', value)} />
                    <TextField label="displayOrder" value={String(product.displayOrder || 0)} onChange={(value) => updateProductOffered(index, 'displayOrder', value)} />
                    <CheckboxField label="Primary product" checked={Boolean(product.isPrimary)} onChange={(value) => updateProductOffered(index, 'isPrimary', value)} />
                    <div className="lg:col-span-2">
                      <TextField label="description" value={product.description} onChange={(value) => updateProductOffered(index, 'description', value)} multiline rows={3} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">Areas Served</h3>
              <p className="text-xs text-neutral-600">Internal areasServed values map to Schema.org areaServed when public schema output is enabled.</p>
            </div>
            <button type="button" onClick={addAreaServed} className="rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-white">
              Add Area
            </button>
          </div>
          {(pageServiceSchema?.areasServed || []).length === 0 ? (
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              No areasServed items are recorded yet.
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {(pageServiceSchema?.areasServed || []).map((area, index) => (
                <div key={`area-${index}`} className="rounded-md border border-neutral-200 bg-white p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Area {index + 1}</div>
                    <button type="button" onClick={() => removeAreaServed(index)} className="text-xs font-semibold text-red-700 hover:text-red-900">
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    <TextField label="name" value={area.name} onChange={(value) => updateAreaServed(index, 'name', value)} />
                    <SelectField label="type" value={area.type} onChange={(value) => updateAreaServed(index, 'type', value)}>
                      {AREA_SERVED_TYPES.map((type) => <option key={type || 'blank'} value={type}>{type || 'Select area type'}</option>)}
                    </SelectField>
                    <TextField label="stateCode" value={area.stateCode} onChange={(value) => updateAreaServed(index, 'stateCode', value)} />
                    <TextField label="city" value={area.city} onChange={(value) => updateAreaServed(index, 'city', value)} />
                    <TextField label="county" value={area.county} onChange={(value) => updateAreaServed(index, 'county', value)} />
                    <TextField label="metro" value={area.metro} onChange={(value) => updateAreaServed(index, 'metro', value)} />
                    <TextField label="country" value={area.country} onChange={(value) => updateAreaServed(index, 'country', value)} />
                    <TextField label="serviceAreaType" value={area.serviceAreaType} onChange={(value) => updateAreaServed(index, 'serviceAreaType', value)} />
                    <TextField label="confidence" value={area.confidence} onChange={(value) => updateAreaServed(index, 'confidence', value)} />
                    <TextField label="url" value={area.url} onChange={(value) => updateAreaServed(index, 'url', value)} />
                    <CheckboxField label="Primary area" checked={Boolean(area.isPrimary)} onChange={(value) => updateAreaServed(index, 'isPrimary', value)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>

      <Section title="Media" description="Page-level image slots for production readiness plus detected per-block image fields. Use assetId to reference registered Media Library records.">
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-900">
          Select registered tenant media assets directly from the Media Library, or keep using manual URLs as a fallback.
          Image changes save through the same revision and static rebuild path as other page edits.
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {([
            ['featuredImage', 'Featured image'],
            ['heroImage', 'Hero image'],
            ['localImage', 'Dynamic/local rink image'],
            ['closingImage', 'Closing image'],
          ] as Array<[MediaSlot, string]>).map(([slot, label]) => {
            const asset = pageMedia?.[slot]

            return (
              <div key={slot} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
                    {asset?.assetId && (
                      <div className="mt-1 text-xs text-green-700">Selected from Media Library: {asset.assetId}</div>
                    )}
                  </div>
                  {asset?.assetId && (
                    <a
                      href={`/dashboard/media/${encodeURIComponent(asset.assetId)}?tenantId=${encodeURIComponent(page.tenantId)}`}
                      className="text-xs font-semibold text-primary-700 hover:text-primary-900"
                    >
                      View Asset
                    </a>
                  )}
                </div>
                {asset?.url && (
                  <div className="mb-3 overflow-hidden rounded-md border border-neutral-200 bg-white">
                    <img
                      src={asset.url}
                      alt={asset.alt || asset.title || `${label} preview`}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
                <MediaPicker
                  token={token}
                  tenantId={page.tenantId}
                  selectedAssetId={asset?.assetId || ''}
                  buttonLabel={`Choose ${label}`}
                  panelTitle={`${label} picker`}
                  onSelect={(selectedAsset) => applyMediaAssetToSlot(slot, selectedAsset)}
                />
                {asset?.assetId && (
                  <button
                    type="button"
                    onClick={() => clearMediaSlotAsset(slot)}
                    className="mt-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                  >
                    Clear Media Library asset link
                  </button>
                )}
                {getImageSlotWarnings(slot, asset || emptyImageAsset(), Boolean(page.isPublished)).length > 0 && (
                  <div className="mt-3 space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {getImageSlotWarnings(slot, asset || emptyImageAsset(), Boolean(page.isPublished)).map((warning) => (
                      <div key={warning}>{warning}</div>
                    ))}
                    {asset?.url && !asset.assetId && (
                      <a href="/dashboard/media" className="font-semibold underline">Register this URL in Media Library</a>
                    )}
                  </div>
                )}
                <div className="grid gap-3 lg:grid-cols-2">
                  <TextField label="assetId" value={asset?.assetId || ''} onChange={(value) => updateMediaField(slot, 'assetId', value)} />
                  <TextField label="url" value={asset?.url || ''} onChange={(value) => updateMediaField(slot, 'url', value)} />
                  <TextField label="alt" value={asset?.alt || ''} onChange={(value) => updateMediaField(slot, 'alt', value)} />
                  <TextField label="title" value={asset?.title || ''} onChange={(value) => updateMediaField(slot, 'title', value)} />
                  <TextField label="caption" value={asset?.caption || ''} onChange={(value) => updateMediaField(slot, 'caption', value)} />
                  <TextField label="source" value={asset?.source || ''} onChange={(value) => updateMediaField(slot, 'source', value)} />
                  <TextField label="licenseStatus" value={asset?.licenseStatus || ''} onChange={(value) => updateMediaField(slot, 'licenseStatus', value)} />
                  <TextField label="usageStatus" value={asset?.usageStatus || ''} onChange={(value) => updateMediaField(slot, 'usageStatus', value)} />
                  <TextField label="width" value={nullableNumberValue(asset?.width)} onChange={(value) => updateMediaNumberField(slot, 'width', value)} />
                  <TextField label="height" value={nullableNumberValue(asset?.height)} onChange={(value) => updateMediaNumberField(slot, 'height', value)} />
                  <TextField label="focalPointX" value={nullableNumberValue(asset?.focalPointX)} onChange={(value) => updateMediaNumberField(slot, 'focalPointX', value)} />
                  <TextField label="focalPointY" value={nullableNumberValue(asset?.focalPointY)} onChange={(value) => updateMediaNumberField(slot, 'focalPointY', value)} />
                  <CheckboxField label="Decorative image" checked={Boolean(asset?.decorative)} onChange={(value) => updateMediaDecorative(slot, value)} />
                </div>
              </div>
            )
          })}
          <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Open Graph image mirror</div>
            {pageMedia?.openGraphImage.url && (
              <div className="mb-3 overflow-hidden rounded-md border border-neutral-200 bg-white">
                <img
                  src={pageMedia.openGraphImage.url}
                  alt={pageMedia.openGraphImage.alt || 'Open Graph image preview'}
                  className="h-32 w-full object-cover"
                />
              </div>
            )}
            <MediaPicker
              token={token}
              tenantId={page.tenantId}
              buttonLabel="Choose Open Graph image"
              panelTitle="Open Graph image picker"
              onSelect={applyOpenGraphMediaAsset}
            />
            <p className="mt-2 text-xs text-neutral-500">
              Current Open Graph schema stores URL and alt text only; the page-level slots above retain assetId and license metadata.
            </p>
            <div className="grid gap-3 lg:grid-cols-2">
              <TextField label="url" value={pageMedia?.openGraphImage.url || ''} onChange={(value) => updateOpenGraphImageField('url', value)} />
              <TextField label="alt" value={pageMedia?.openGraphImage.alt || ''} onChange={(value) => updateOpenGraphImageField('alt', value)} />
            </div>
          </div>
        </div>

        {imageSignals.length === 0 ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            No existing image or alt-text fields were detected on this page.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-3">
            {['Hero image slot', 'Dynamic/local rink image slot', 'Closing image slot'].map((slot) => {
              const signals = imageSignals.filter((signal) => signal.slot === slot)

              return (
                <div key={slot} className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">{slot}</div>
                  {signals.length === 0 ? (
                    <div className="text-sm italic text-neutral-500">Not present or not detected</div>
                  ) : (
                    <div className="space-y-2">
                      {signals.map((signal, index) => (
                        <div key={`${signal.source}-${signal.path}-${index}`} className="rounded bg-white p-2">
                          <div className="text-xs font-medium text-neutral-500">{signal.source}</div>
                          <div className="mt-1 font-mono text-xs text-neutral-600">{signal.path}</div>
                          <div className="mt-1 break-words text-sm text-neutral-800">{signal.value}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Fulfillment" description="Partner availability, routing, and disclosure fields for production transparency.">
        <div className="grid gap-4 lg:grid-cols-2">
          <SelectField label="fulfillmentStatus" value={pageFulfillment?.fulfillmentStatus || ''} onChange={(value) => updateFulfillmentField('fulfillmentStatus', value)}>
            {FULFILLMENT_STATUSES.map((status) => <option key={status || 'blank'} value={status}>{status || 'Select status'}</option>)}
          </SelectField>
          <SelectField label="leadRoutingMode" value={pageFulfillment?.leadRoutingMode || ''} onChange={(value) => updateFulfillmentField('leadRoutingMode', value)}>
            {LEAD_ROUTING_MODES.map((mode) => <option key={mode || 'blank'} value={mode}>{mode || 'Select routing mode'}</option>)}
          </SelectField>
          <TextField label="topProviderCount" value={String(pageFulfillment?.topProviderCount ?? 0)} onChange={(value) => updateFulfillmentNumber('topProviderCount', value)} />
          <TextField label="confirmedServiceStates" value={(pageFulfillment?.confirmedServiceStates || []).join(', ')} onChange={(value) => updateFulfillmentList('confirmedServiceStates', value)} />
          <TextField label="extendedStatesPossible" value={(pageFulfillment?.extendedStatesPossible || []).join(', ')} onChange={(value) => updateFulfillmentList('extendedStatesPossible', value)} />
          <div className="space-y-3">
            <CheckboxField label="Primary partner available" checked={Boolean(pageFulfillment?.primaryPartnerAvailable)} onChange={(value) => updateFulfillmentBoolean('primaryPartnerAvailable', value)} />
            <CheckboxField label="Manual review required" checked={Boolean(pageFulfillment?.manualReviewRequired)} onChange={(value) => updateFulfillmentBoolean('manualReviewRequired', value)} />
            <CheckboxField label="Provider research completed" checked={Boolean(pageFulfillment?.providerResearchCompleted)} onChange={(value) => updateFulfillmentBoolean('providerResearchCompleted', value)} />
            <CheckboxField label="Public disclosure required" checked={Boolean(pageFulfillment?.publicDisclosureRequired)} onChange={(value) => updateFulfillmentBoolean('publicDisclosureRequired', value)} />
          </div>
        </div>
      </Section>

      <Section title="Ads" description="Google Ads eligibility and campaign readiness metadata.">
        <div className="grid gap-4 lg:grid-cols-2">
          <CheckboxField label="Google Ads eligible" checked={Boolean(pageGoogleAds?.eligible)} onChange={updateGoogleAdsEligible} />
          <TextField label="googleAds.finalUrl" value={pageGoogleAds?.finalUrl || ''} onChange={(value) => updateGoogleAdsField('finalUrl', value)} />
          <TextField label="googleAds.landingPageType" value={pageGoogleAds?.landingPageType || ''} onChange={(value) => updateGoogleAdsField('landingPageType', value)} />
          <TextField label="googleAds.campaignTheme" value={pageGoogleAds?.campaignTheme || ''} onChange={(value) => updateGoogleAdsField('campaignTheme', value)} />
          <TextField label="googleAds.conversionGoals" value={(pageGoogleAds?.conversionGoals || []).join(', ')} onChange={updateGoogleAdsGoals} />
          <TextField label="googleAds.notes" value={pageGoogleAds?.notes || ''} onChange={(value) => updateGoogleAdsField('notes', value)} multiline rows={4} />
        </div>
      </Section>

      <Section title="Publishing/Quality" description="Launch checks, sitemap settings, and editorial readiness notes.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <CheckboxField
              label="Published"
              checked={Boolean(page.isPublished)}
              onChange={(value) => updateBooleanField('isPublished', value)}
            />
            <CheckboxField
              label="Include in sitemap"
              checked={Boolean(page.includeInSitemap)}
              onChange={(value) => updateBooleanField('includeInSitemap', value)}
            />
          </div>
          <TextField label="sitemapPriority" value={nullableNumberValue(page.sitemapPriority)} onChange={updateSitemapPriority} placeholder="0.7" />
          <SelectField label="sitemapChangeFrequency" value={page.sitemapChangeFrequency || ''} onChange={updateSitemapChangeFrequency}>
            {SITEMAP_CHANGE_FREQUENCIES.map((frequency) => <option key={frequency || 'blank'} value={frequency}>{frequency || 'Select frequency'}</option>)}
          </SelectField>
          <TextField label="pageQuality.launchNotes" value={pageQuality?.launchNotes || ''} onChange={(value) => updatePageQualityField('launchNotes', value)} multiline rows={4} />
        </div>
      </Section>

      <Section title="Workflow And Review" description="Editorial status and approval gates. Last-edited and approval stamps are updated on save when applicable.">
        <div className="grid gap-4 lg:grid-cols-2">
          <SelectField label="workflow.status" value={pageWorkflow?.status || ''} onChange={(value) => updateWorkflowField('status', value)}>
            {WORKFLOW_STATUSES.map((status) => <option key={status || 'blank'} value={status}>{status || 'Select status'}</option>)}
          </SelectField>
          <CheckboxField label="Approved for publish" checked={Boolean(pageWorkflow?.approvedForPublish)} onChange={(value) => updateWorkflowBoolean('approvedForPublish', value)} />
          <ReadOnlyPill label="approvedBy" value={pageWorkflow?.approvedBy || ''} />
          <ReadOnlyPill label="approvedAt" value={pageWorkflow?.approvedAt || ''} />
          <ReadOnlyPill label="lastEditedBy" value={pageWorkflow?.lastEditedBy || ''} />
          <ReadOnlyPill label="lastEditedAt" value={pageWorkflow?.lastEditedAt || ''} />
        </div>
      </Section>

      <Section title="Revision And Static Publishing" description="Admin saves create one latest pre-update snapshot for rollback readiness. Static fields guide snapshot/build/deploy workflows.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="Change summary for next save" value={changeSummary} onChange={setChangeSummary} placeholder="Briefly describe this update" />
          <ReadOnlyPill label="currentRevisionId" value={pageRevision?.currentRevisionId || ''} />
          <ReadOnlyPill label="revisionNumber" value={String(pageRevision?.revisionNumber ?? 1)} />
          <ReadOnlyPill label="lastSnapshotAt" value={pageRevision?.lastSnapshotAt || ''} />
          <ReadOnlyPill label="lastChangeSource" value={pageRevision?.lastChangeSource || 'manual_unknown'} />
          <ReadOnlyPill label="lastChangeSummary" value={pageRevision?.lastChangeSummary || ''} />
          <ReadOnlyPill label="lastChangedBy" value={pageRevision?.lastChangedBy || pageRevision?.lastRevisionBy || ''} />
          <ReadOnlyPill label="lastChangeAt" value={pageRevision?.lastChangeAt || pageRevision?.lastRevisionAt || ''} />
          <ReadOnlyPill label="rollbackAvailable" value={pageRevision?.rollbackAvailable ? 'Yes' : 'No'} />
          <ReadOnlyPill label="latestSnapshot" value={pageRevision?.latestSnapshot?.revisionId || 'No snapshot stored yet'} />
          <ReadOnlyPill label="rollbackNotes" value={pageRevision?.rollbackNotes || 'No server-side snapshot has been created yet.'} />
          <CheckboxField label="staticEligible" checked={Boolean(pageStaticPublishing?.staticEligible)} onChange={(value) => updateStaticPublishingBoolean('staticEligible', value)} />
          <CheckboxField label="needsRebuild" checked={Boolean(pageStaticPublishing?.needsRebuild)} onChange={(value) => updateStaticPublishingBoolean('needsRebuild', value)} />
          <ReadOnlyPill label="deploymentStatus" value={pageStaticPublishing?.deploymentStatus || 'not_deployed'} />
          <ReadOnlyPill label="lastSnapshotAt" value={pageStaticPublishing?.lastSnapshotAt || ''} />
          <ReadOnlyPill label="lastStaticBuildAt" value={pageStaticPublishing?.lastStaticBuildAt || ''} />
          <ReadOnlyPill label="lastDeployedAt" value={pageStaticPublishing?.lastDeployedAt || ''} />
          <ReadOnlyPill label="contentHash" value={pageStaticPublishing?.contentHash || ''} />
          <ReadOnlyPill label="lastPublishedContentHash" value={pageStaticPublishing?.lastPublishedContentHash || ''} />
        </div>
      </Section>

      <Section title="Template And Linking" description="Template identity plus internal link and breadcrumb requirements for future page generation and review.">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextField label="template.templateKey" value={pageTemplate?.templateKey || ''} onChange={(value) => updateTemplateField('templateKey', value)} />
          <TextField label="template.templateVersion" value={pageTemplate?.templateVersion || ''} onChange={(value) => updateTemplateField('templateVersion', value)} />
          <TextField label="template.layoutVariant" value={pageTemplate?.layoutVariant || ''} onChange={(value) => updateTemplateField('layoutVariant', value)} />
          <TextField label="template.contentModelVersion" value={pageTemplate?.contentModelVersion || ''} onChange={(value) => updateTemplateField('contentModelVersion', value)} />
          <TextField label="linking.hubPage" value={pageLinking?.hubPage || ''} onChange={(value) => updateLinkingField('hubPage', value)} />
          <TextField label="linking.parentPage" value={pageLinking?.parentPage || ''} onChange={(value) => updateLinkingField('parentPage', value)} />
          <TextField label="linking.relatedPages" value={(pageLinking?.relatedPages || []).join(', ')} onChange={(value) => updateLinkingList('relatedPages', value)} />
          <TextField label="linking.requiredLinks" value={(pageLinking?.requiredLinks || []).join(', ')} onChange={(value) => updateLinkingList('requiredLinks', value)} />
          <TextField label="linking.breadcrumbTrail" value={(pageLinking?.breadcrumbTrail || []).join(', ')} onChange={(value) => updateLinkingList('breadcrumbTrail', value)} />
        </div>
      </Section>

      <Section title="Structured Data And Forms" description="Schema switches and lead capture metadata for static publishing readiness.">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            <CheckboxField label="Enable WebPage schema" checked={Boolean(pageSchemaControls?.enableWebPageSchema)} onChange={(value) => updateSchemaControlBoolean('enableWebPageSchema', value)} />
            <CheckboxField label="Enable Breadcrumb schema" checked={Boolean(pageSchemaControls?.enableBreadcrumbSchema)} onChange={(value) => updateSchemaControlBoolean('enableBreadcrumbSchema', value)} />
            <CheckboxField label="Enable FAQ schema" checked={Boolean(pageSchemaControls?.enableFAQSchema)} onChange={(value) => updateSchemaControlBoolean('enableFAQSchema', value)} />
            <CheckboxField label="Enable Service schema" checked={Boolean(pageSchemaControls?.enableServiceSchema)} onChange={(value) => updateSchemaControlBoolean('enableServiceSchema', value)} />
          </div>
          <ReadOnlyPill label="schemaWarnings" value={(pageSchemaControls?.schemaWarnings || []).join(', ')} />
          <TextField label="formConfig.formType" value={pageFormConfig?.formType || ''} onChange={(value) => updateFormConfigField('formType', value)} />
          <TextField label="formConfig.conversionGoal" value={pageFormConfig?.conversionGoal || ''} onChange={(value) => updateFormConfigField('conversionGoal', value)} />
          <TextField label="formConfig.routingMode" value={pageFormConfig?.routingMode || ''} onChange={(value) => updateFormConfigField('routingMode', value)} />
          <TextField label="formConfig.domainRoutingKey" value={pageFormConfig?.domainRoutingKey || ''} onChange={(value) => updateFormConfigField('domainRoutingKey', value)} />
          <TextField label="formConfig.replyToMode" value={pageFormConfig?.replyToMode || ''} onChange={(value) => updateFormConfigField('replyToMode', value)} />
          <TextField label="formConfig.emailSubjectTemplate" value={pageFormConfig?.emailSubjectTemplate || ''} onChange={(value) => updateFormConfigField('emailSubjectTemplate', value)} />
          <TextField label="formConfig.thankYouUrl" value={pageFormConfig?.thankYouUrl || ''} onChange={(value) => updateFormConfigField('thankYouUrl', value)} />
          <TextField label="formConfig.thankYouMessage" value={pageFormConfig?.thankYouMessage || ''} onChange={(value) => updateFormConfigField('thankYouMessage', value)} />
          <TextField label="formConfig.recipientGroup" value={pageFormConfig?.recipientGroup || ''} onChange={(value) => updateFormConfigField('recipientGroup', value)} />
          <TextField label="formConfig.staticFormEndpointKey" value={pageFormConfig?.staticFormEndpointKey || ''} onChange={(value) => updateFormConfigField('staticFormEndpointKey', value)} />
          <div className="space-y-3">
            <CheckboxField label="Consent required" checked={Boolean(pageFormConfig?.consentRequired)} onChange={(value) => updateFormConfigBoolean('consentRequired', value)} />
            <CheckboxField label="Spam protection enabled" checked={Boolean(pageFormConfig?.spamProtectionEnabled)} onChange={(value) => updateFormConfigBoolean('spamProtectionEnabled', value)} />
            <CheckboxField label="Mailto fallback enabled" checked={Boolean(pageFormConfig?.mailtoFallbackEnabled)} onChange={(value) => updateFormConfigBoolean('mailtoFallbackEnabled', value)} />
          </div>
        </div>
        <div className="mt-5 rounded-md border border-neutral-200 bg-neutral-50 p-3">
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-neutral-900">Domain Routing Snapshot</h3>
            <p className="text-xs text-neutral-600">Non-secret routing/contact metadata only. Do not store SMTP passwords, API tokens, or provider credentials here.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TextField label="domainRouting.domain" value={pageDomainRouting?.domain || ''} onChange={(value) => updateDomainRoutingField('domain', value)} />
            <TextField label="domainRouting.brandName" value={pageDomainRouting?.brandName || ''} onChange={(value) => updateDomainRoutingField('brandName', value)} />
            <TextField label="domainRouting.publicContactEmail" value={pageDomainRouting?.publicContactEmail || ''} onChange={(value) => updateDomainRoutingField('publicContactEmail', value)} />
            <TextField label="domainRouting.quoteRequestEmail" value={pageDomainRouting?.quoteRequestEmail || ''} onChange={(value) => updateDomainRoutingField('quoteRequestEmail', value)} />
            <TextField label="domainRouting.supportEmail" value={pageDomainRouting?.supportEmail || ''} onChange={(value) => updateDomainRoutingField('supportEmail', value)} />
            <TextField label="domainRouting.replyToEmail" value={pageDomainRouting?.replyToEmail || ''} onChange={(value) => updateDomainRoutingField('replyToEmail', value)} />
            <TextField label="domainRouting.fromName" value={pageDomainRouting?.fromName || ''} onChange={(value) => updateDomainRoutingField('fromName', value)} />
            <TextField label="domainRouting.fromEmail" value={pageDomainRouting?.fromEmail || ''} onChange={(value) => updateDomainRoutingField('fromEmail', value)} />
            <TextField label="domainRouting.contactPageSlug" value={pageDomainRouting?.contactPageSlug || ''} onChange={(value) => updateDomainRoutingField('contactPageSlug', value)} />
            <TextField label="domainRouting.primaryPhone" value={pageDomainRouting?.primaryPhone || ''} onChange={(value) => updateDomainRoutingField('primaryPhone', value)} />
            <TextField label="domainRouting.defaultLeadRoutingMode" value={pageDomainRouting?.defaultLeadRoutingMode || ''} onChange={(value) => updateDomainRoutingField('defaultLeadRoutingMode', value)} />
            <TextField label="domainRouting.defaultRecipientGroup" value={pageDomainRouting?.defaultRecipientGroup || ''} onChange={(value) => updateDomainRoutingField('defaultRecipientGroup', value)} />
            <TextField label="domainRouting.staticFormEndpointKey" value={pageDomainRouting?.staticFormEndpointKey || ''} onChange={(value) => updateDomainRoutingField('staticFormEndpointKey', value)} />
            <TextField label="domainRouting.emailProvider" value={pageDomainRouting?.emailProvider || ''} onChange={(value) => updateDomainRoutingField('emailProvider', value)} />
            <TextField label="domainRouting.emailProviderStatus" value={pageDomainRouting?.emailProviderStatus || ''} onChange={(value) => updateDomainRoutingField('emailProviderStatus', value)} />
            <TextField label="domainRouting.mxStatus" value={pageDomainRouting?.mxStatus || ''} onChange={(value) => updateDomainRoutingField('mxStatus', value)} />
            <TextField label="domainRouting.spfStatus" value={pageDomainRouting?.spfStatus || ''} onChange={(value) => updateDomainRoutingField('spfStatus', value)} />
            <TextField label="domainRouting.dkimStatus" value={pageDomainRouting?.dkimStatus || ''} onChange={(value) => updateDomainRoutingField('dkimStatus', value)} />
            <TextField label="domainRouting.dmarcStatus" value={pageDomainRouting?.dmarcStatus || ''} onChange={(value) => updateDomainRoutingField('dmarcStatus', value)} />
            <TextField label="domainRouting.notes" value={pageDomainRouting?.notes || ''} onChange={(value) => updateDomainRoutingField('notes', value)} multiline rows={3} />
            <CheckboxField label="Mailto links enabled" checked={Boolean(pageDomainRouting?.mailtoLinksEnabled)} onChange={(value) => updateDomainRoutingBoolean('mailtoLinksEnabled', value)} />
          </div>
        </div>
      </Section>

      <Section title="Import And Deployment Hooks" description="Read-only provenance/build hooks. Imports and publish dry-runs may populate these later; editor saves preserve them.">
        <div className="grid gap-4 lg:grid-cols-2">
          <ReadOnlyPill label="lastImportBatchId" value={pageImportProvenance?.lastImportBatchId || ''} />
          <ReadOnlyPill label="sourceFile" value={pageImportProvenance?.sourceFile || ''} />
          <ReadOnlyPill label="sourceRow" value={pageImportProvenance?.sourceRow || ''} />
          <ReadOnlyPill label="externalId" value={pageImportProvenance?.externalId || ''} />
          <ReadOnlyPill label="lockedFields" value={(pageImportProvenance?.lockedFields || []).join(', ')} />
          <ReadOnlyPill label="overwriteBehavior" value={pageImportProvenance?.overwriteBehavior || 'warn'} />
          <ReadOnlyPill label="deploymentId" value={pageDeploymentHooks?.deploymentId || ''} />
          <ReadOnlyPill label="buildId" value={pageDeploymentHooks?.buildId || ''} />
          <ReadOnlyPill label="buildWarningCount" value={String(pageDeploymentHooks?.buildWarningCount ?? 0)} />
          <ReadOnlyPill label="publishSource" value={pageDeploymentHooks?.publishSource || ''} />
        </div>
      </Section>

      <Section title="Content Blocks" description="Structured editors are available for known text, SEO-adjacent, link, form, and image fields. Unsupported blocks are read-only JSON and preserved.">
        <div className="mb-4 flex flex-wrap gap-3">
          <button type="button" onClick={addFormBlockSection} className="btn btn-secondary">
            Add Form Block
          </button>
        </div>
        {contentBlocks.length === 0 ? (
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-600">
            No ContentData.ContentBlocks entries are present.
          </div>
        ) : (
          <div className="space-y-5">
            {contentBlocks.map((block, blockIndex) => (
              <BlockEditor
                key={`${block.type}-${blockIndex}`}
                block={block}
                blockIndex={blockIndex}
                token={token}
                tenantId={page.tenantId}
                updateBlockField={updateBlockField}
                updateBlockArrayItemField={updateBlockArrayItemField}
                applyMediaAssetToBlockField={applyMediaAssetToBlockField}
                applyMediaAssetToBlockArrayItem={applyMediaAssetToBlockArrayItem}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function BlockEditor({
  block,
  blockIndex,
  token,
  tenantId,
  updateBlockField,
  updateBlockArrayItemField,
  applyMediaAssetToBlockField,
  applyMediaAssetToBlockArrayItem,
}: {
  block: IHtmlBlock
  blockIndex: number
  token: string | null
  tenantId: string
  updateBlockField: (blockIndex: number, field: string, value: string) => void
  updateBlockArrayItemField: (blockIndex: number, arrayKey: string, itemIndex: number, field: string, value: string | boolean) => void
  applyMediaAssetToBlockField: (blockIndex: number, imageField: string, altField: string, asset: MediaAsset) => void
  applyMediaAssetToBlockArrayItem: (blockIndex: number, arrayKey: string, itemIndex: number, imageField: string, altField: string, asset: MediaAsset) => void
}) {
  const content = toRecord(block.content)
  const blockTitle = block.type || 'Missing type'

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Block {blockIndex + 1}</div>
          <h3 className="text-base font-semibold text-neutral-900">{blockTitle}</h3>
        </div>
        {SUPPORTED_BLOCK_TYPES.has(block.type) ? (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
            Structured editor
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
            Read-only JSON
          </span>
        )}
      </div>

      <div className="p-4">
        {SUPPORTED_BLOCK_TYPES.has(block.type)
          ? renderBlockFields(
              block.type,
              content,
              blockIndex,
              token,
              tenantId,
              updateBlockField,
              updateBlockArrayItemField,
              applyMediaAssetToBlockField,
              applyMediaAssetToBlockArrayItem,
            )
          : <UnsupportedBlock block={block} />}
      </div>
    </div>
  )
}

function BlockImageField({
  token,
  tenantId,
  content,
  blockIndex,
  imageField,
  altField,
  label,
  updateBlockField,
  applyMediaAssetToBlockField,
}: {
  token: string | null
  tenantId: string
  content: EditableContent
  blockIndex: number
  imageField: string
  altField: string
  label: string
  updateBlockField: (blockIndex: number, field: string, value: string) => void
  applyMediaAssetToBlockField: (blockIndex: number, imageField: string, altField: string, asset: MediaAsset) => void
}) {
  const url = stringValue(content[imageField])
  const alt = altField ? stringValue(content[altField]) : ''
  const assetId = stringValue(content[`${imageField}AssetId`])
  const licenseStatus = stringValue(content[`${imageField}LicenseStatus`])
  const usageStatus = stringValue(content[`${imageField}UsageStatus`])
  const warnings = getBlockImageWarnings(url, assetId, alt, licenseStatus, usageStatus)

  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 p-3">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
          {assetId && <div className="mt-1 text-xs text-green-700">Selected from Media Library: {assetId}</div>}
        </div>
        {assetId && (
          <a
            href={`/dashboard/media/${encodeURIComponent(assetId)}?tenantId=${encodeURIComponent(tenantId)}`}
            className="text-xs font-semibold text-primary-700 hover:text-primary-900"
          >
            View Asset
          </a>
        )}
      </div>
      {url && (
        <div className="mb-3 overflow-hidden rounded-md border border-neutral-200 bg-white">
          <img src={url} alt={alt || `${label} preview`} className="h-28 w-full object-cover" />
        </div>
      )}
      <MediaPicker
        token={token}
        tenantId={tenantId}
        selectedAssetId={assetId}
        buttonLabel={`Choose ${label}`}
        panelTitle={`${label} picker`}
        onSelect={(asset) => applyMediaAssetToBlockField(blockIndex, imageField, altField, asset)}
      />
      {warnings.length > 0 && (
        <div className="mt-3 space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {warnings.map((warning) => <div key={warning}>{warning}</div>)}
          {url && !assetId && <a href="/dashboard/media" className="font-semibold underline">Register this URL in Media Library</a>}
        </div>
      )}
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <TextField label={imageField} value={url} onChange={(value) => updateBlockField(blockIndex, imageField, value)} />
        {altField && <TextField label={altField} value={alt} onChange={(value) => updateBlockField(blockIndex, altField, value)} />}
        <TextField label={`${imageField}AssetId`} value={assetId} onChange={(value) => updateBlockField(blockIndex, `${imageField}AssetId`, value)} />
      </div>
    </div>
  )
}

function BlockArrayImageField({
  token,
  tenantId,
  item,
  blockIndex,
  arrayKey,
  itemIndex,
  imageField,
  altField,
  label,
  updateBlockArrayItemField,
  applyMediaAssetToBlockArrayItem,
}: {
  token: string | null
  tenantId: string
  item: EditableContent
  blockIndex: number
  arrayKey: string
  itemIndex: number
  imageField: string
  altField: string
  label: string
  updateBlockArrayItemField: (blockIndex: number, arrayKey: string, itemIndex: number, field: string, value: string | boolean) => void
  applyMediaAssetToBlockArrayItem: (blockIndex: number, arrayKey: string, itemIndex: number, imageField: string, altField: string, asset: MediaAsset) => void
}) {
  const url = stringValue(item[imageField])
  const alt = altField ? stringValue(item[altField]) : ''
  const assetId = stringValue(item[`${imageField}AssetId`])
  const licenseStatus = stringValue(item[`${imageField}LicenseStatus`])
  const usageStatus = stringValue(item[`${imageField}UsageStatus`])
  const warnings = getBlockImageWarnings(url, assetId, alt, licenseStatus, usageStatus)

  return (
    <div className="rounded-md border border-neutral-200 bg-white p-3 lg:col-span-2">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
          {assetId && <div className="mt-1 text-xs text-green-700">Selected from Media Library: {assetId}</div>}
        </div>
        {assetId && (
          <a
            href={`/dashboard/media/${encodeURIComponent(assetId)}?tenantId=${encodeURIComponent(tenantId)}`}
            className="text-xs font-semibold text-primary-700 hover:text-primary-900"
          >
            View Asset
          </a>
        )}
      </div>
      {url && (
        <div className="mb-3 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50">
          <img src={url} alt={alt || `${label} preview`} className="h-28 w-full object-cover" />
        </div>
      )}
      <MediaPicker
        token={token}
        tenantId={tenantId}
        selectedAssetId={assetId}
        buttonLabel={`Choose ${label}`}
        panelTitle={`${label} picker`}
        onSelect={(asset) => applyMediaAssetToBlockArrayItem(blockIndex, arrayKey, itemIndex, imageField, altField, asset)}
      />
      {warnings.length > 0 && (
        <div className="mt-3 space-y-1 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          {warnings.map((warning) => <div key={warning}>{warning}</div>)}
          {url && !assetId && <a href="/dashboard/media" className="font-semibold underline">Register this URL in Media Library</a>}
        </div>
      )}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <TextField label={imageField} value={url} onChange={(value) => updateBlockArrayItemField(blockIndex, arrayKey, itemIndex, imageField, value)} />
        {altField && <TextField label={altField} value={alt} onChange={(value) => updateBlockArrayItemField(blockIndex, arrayKey, itemIndex, altField, value)} />}
        <TextField label={`${imageField}AssetId`} value={assetId} onChange={(value) => updateBlockArrayItemField(blockIndex, arrayKey, itemIndex, `${imageField}AssetId`, value)} />
      </div>
    </div>
  )
}

function renderBlockFields(
  blockType: string,
  content: EditableContent,
  blockIndex: number,
  token: string | null,
  tenantId: string,
  updateBlockField: (blockIndex: number, field: string, value: string) => void,
  updateBlockArrayItemField: (blockIndex: number, arrayKey: string, itemIndex: number, field: string, value: string | boolean) => void,
  applyMediaAssetToBlockField: (blockIndex: number, imageField: string, altField: string, asset: MediaAsset) => void,
  applyMediaAssetToBlockArrayItem: (blockIndex: number, arrayKey: string, itemIndex: number, imageField: string, altField: string, asset: MediaAsset) => void,
) {
  const field = (fieldName: string, label: string, options?: Omit<TextFieldProps, 'label' | 'value' | 'onChange'>) => (
    <TextField
      label={label}
      value={stringValue(content[fieldName])}
      onChange={(value) => updateBlockField(blockIndex, fieldName, value)}
      testId={`block-${blockIndex}-${blockType}-${fieldName}`}
      {...options}
    />
  )

  switch (blockType) {
    case 'Hero':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {field('headline', 'headline')}
            {field('subheadline', 'subheadline', { multiline: true, rows: 4 })}
            {field('buttonText', 'buttonText')}
            {field('buttonLink', 'buttonLink')}
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Hero image fields</div>
            <div className="grid gap-4 lg:grid-cols-2">
              <BlockImageField
                token={token}
                tenantId={tenantId}
                content={content}
                blockIndex={blockIndex}
                imageField="backgroundImage"
                altField="backgroundImageAltText"
                label="backgroundImage"
                updateBlockField={updateBlockField}
                applyMediaAssetToBlockField={applyMediaAssetToBlockField}
              />
              <BlockImageField
                token={token}
                tenantId={tenantId}
                content={content}
                blockIndex={blockIndex}
                imageField="mainImage"
                altField="mainImageAltText"
                label="mainImage"
                updateBlockField={updateBlockField}
                applyMediaAssetToBlockField={applyMediaAssetToBlockField}
              />
            </div>
          </div>
        </div>
      )
    case 'TrustBar':
      return (
        <ArrayEditor
          label="TrustBar items"
          items={content.items}
          blockIndex={blockIndex}
          arrayKey="items"
          renderItem={(item, itemIndex) => (
            <div className="grid gap-3 lg:grid-cols-2">
              <TextField label="icon" value={stringValue(item.icon)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'icon', value)} />
              <TextField label="title" value={stringValue(item.title)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'title', value)} />
              <TextField label="text" value={stringValue(item.text)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'text', value)} />
              <TextField label="alt" value={stringValue(item.alt)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'alt', value)} />
            </div>
          )}
        />
      )
    case 'CardGrid':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {field('title', 'section title')}
            {field('subtitle', 'subtitle', { multiline: true, rows: 3 })}
            <SelectField label="layout" value={stringValue(content.layout) || 'grid-3'} onChange={(value) => updateBlockField(blockIndex, 'layout', value)}>
              <option value="grid-2">grid-2</option>
              <option value="grid-3">grid-3</option>
              <option value="grid-4">grid-4</option>
              <option value="list">list</option>
            </SelectField>
          </div>
          <ArrayEditor
            label="Cards"
            items={content.cards}
            blockIndex={blockIndex}
            arrayKey="cards"
            renderItem={(item, itemIndex) => (
              <div className="grid gap-3 lg:grid-cols-2">
                <TextField label="title" value={stringValue(item.title)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'title', value)} />
                <TextField label="description" value={stringValue(item.description)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'description', value)} multiline rows={3} />
                <TextField label="icon" value={stringValue(item.icon)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'icon', value)} />
                <TextField label="link" value={stringValue(item.link)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'link', value)} />
                <BlockArrayImageField
                  token={token}
                  tenantId={tenantId}
                  item={item}
                  blockIndex={blockIndex}
                  arrayKey="cards"
                  itemIndex={itemIndex}
                  imageField="image"
                  altField="image-alt"
                  label="card image"
                  updateBlockArrayItemField={updateBlockArrayItemField}
                  applyMediaAssetToBlockArrayItem={applyMediaAssetToBlockArrayItem}
                />
                <TextField label="alt" value={stringValue(item.alt)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'cards', itemIndex, 'alt', value)} />
              </div>
            )}
          />
        </div>
      )
    case 'HowItWorks':
      return (
        <div className="space-y-4">
          {field('title', 'title')}
          <ArrayEditor
            label="Steps"
            items={content.steps}
            blockIndex={blockIndex}
            arrayKey="steps"
            renderItem={(item, itemIndex) => (
              <div className="grid gap-3 lg:grid-cols-2">
                <TextField label="step title" value={stringValue(item.title)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'steps', itemIndex, 'title', value)} />
                <TextField label="step text" value={stringValue(item.text)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'steps', itemIndex, 'text', value)} multiline rows={3} />
                <BlockArrayImageField
                  token={token}
                  tenantId={tenantId}
                  item={item}
                  blockIndex={blockIndex}
                  arrayKey="steps"
                  itemIndex={itemIndex}
                  imageField="image"
                  altField="alt"
                  label="step image"
                  updateBlockArrayItemField={updateBlockArrayItemField}
                  applyMediaAssetToBlockArrayItem={applyMediaAssetToBlockArrayItem}
                />
              </div>
            )}
          />
        </div>
      )
    case 'FAQ':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            {field('title', 'title')}
            {field('subtitle', 'subtitle')}
            <SelectField label="layout" value={stringValue(content.layout) || 'accordion'} onChange={(value) => updateBlockField(blockIndex, 'layout', value)}>
              <option value="accordion">accordion</option>
              <option value="grid">grid</option>
              <option value="list">list</option>
            </SelectField>
          </div>
          <ArrayEditor
            label="FAQ items"
            items={content.items}
            blockIndex={blockIndex}
            arrayKey="items"
            renderItem={(item, itemIndex) => (
              <div className="space-y-3">
                <TextField label="question" value={stringValue(item.question)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'question', value)} />
                <TextField label="answer" value={stringValue(item.answer)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'items', itemIndex, 'answer', value)} multiline rows={4} />
              </div>
            )}
          />
        </div>
      )
    case 'PrimaryCTA':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {field('title', 'title')}
            {field('description', 'description', { multiline: true, rows: 4 })}
            {field('buttonText', 'buttonText')}
            {field('buttonLink', 'buttonLink')}
            {field('secondaryText', 'secondaryText')}
            {field('secondaryLinkText', 'secondaryLinkText')}
            {field('secondaryLink', 'secondaryLink')}
          </div>
          <div className="rounded-md border border-neutral-200 bg-white p-3">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Closing image fields</div>
            <div className="grid gap-4 lg:grid-cols-2">
              <BlockImageField
                token={token}
                tenantId={tenantId}
                content={content}
                blockIndex={blockIndex}
                imageField="backgroundImage"
                altField="alt"
                label="backgroundImage"
                updateBlockField={updateBlockField}
                applyMediaAssetToBlockField={applyMediaAssetToBlockField}
              />
              <BlockImageField
                token={token}
                tenantId={tenantId}
                content={content}
                blockIndex={blockIndex}
                imageField="mainImage"
                altField="alt"
                label="mainImage"
                updateBlockField={updateBlockField}
                applyMediaAssetToBlockField={applyMediaAssetToBlockField}
              />
            </div>
          </div>
        </div>
      )
    case 'Contact':
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {field('title', 'title')}
            {field('subtitle', 'subtitle', { multiline: true, rows: 3 })}
            {field('address', 'address')}
            {field('phone', 'phone')}
            {field('email', 'email')}
            {field('hours', 'hours')}
            {field('submitButtonText', 'submitButtonText')}
          </div>
          <ArrayEditor
            label="Form fields"
            items={content.formFields}
            blockIndex={blockIndex}
            arrayKey="formFields"
            renderItem={(item, itemIndex) => (
              <div className="grid gap-3 lg:grid-cols-2">
                <TextField label="label" value={stringValue(item.label)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'formFields', itemIndex, 'label', value)} />
                <TextField label="type" value={stringValue(item.type)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'formFields', itemIndex, 'type', value)} />
                <TextField label="placeholder" value={stringValue(item.placeholder)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'formFields', itemIndex, 'placeholder', value)} />
                <CheckboxField label="required" checked={booleanValue(item.required)} onChange={(value) => updateBlockArrayItemField(blockIndex, 'formFields', itemIndex, 'required', value)} />
              </div>
            )}
          />
        </div>
      )
    case 'formBlock': {
      const definitions = getDefaultFormDefinitions(tenantId, tenantId)
      const validation = validateFormBlockContent(content, { definitions })
      const selectedDefinition = definitions.find((definition) => definition.formKey === stringValue(content.formKey))
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {field('id', 'section id')}
            {field('label', 'label')}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <SelectField label="formKey" value={stringValue(content.formKey) || 'default-contact'} onChange={(value) => updateBlockField(blockIndex, 'formKey', value)}>
              {definitions.map((definition) => <option key={definition.formKey} value={definition.formKey}>{definition.formKey}</option>)}
            </SelectField>
            <SelectField label="variant" value={stringValue(content.variant) || 'contact-card'} onChange={(value) => updateBlockField(blockIndex, 'variant', value)}>
              {['quote-form-panel', 'contact-card', 'inline-contact', 'compact-contact'].map((option) => <option key={option} value={option}>{option}</option>)}
            </SelectField>
            {field('sourcePage', 'sourcePage')}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {field('heading', 'heading')}
            {field('submitLabel', 'submitLabel')}
            {field('staticEndpointRef', 'staticEndpointRef')}
            {field('leadRecipientRef', 'leadRecipientRef')}
          </div>
          {field('intro', 'intro', { multiline: true, rows: 3 })}
          <div className="grid gap-4 lg:grid-cols-2">
            {field('successMessage', 'successMessage', { multiline: true, rows: 3 })}
            {field('errorMessage', 'errorMessage', { multiline: true, rows: 3 })}
          </div>
          <RichValidationPanel errors={validation.errors.map((issue) => issue.message)} warnings={validation.warnings.map((issue) => issue.message)} />
          <div className="rounded-md border border-neutral-200 bg-white p-4">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Form preview</div>
            <div className="space-y-3">
              <h4 className="text-base font-semibold text-neutral-900">{stringValue(content.heading) || selectedDefinition?.name || 'Form block'}</h4>
              {stringValue(content.intro) && <p className="text-sm text-neutral-600">{stringValue(content.intro)}</p>}
              <div className="grid gap-2 md:grid-cols-2">
                {(selectedDefinition?.fields || []).filter((item) => !item.hidden).map((item) => (
                  <div key={item.name} className={item.width === 'full' || item.type === 'textarea' || item.type === 'checkbox' ? 'md:col-span-2 rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm' : 'rounded border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm'}>
                    <span className="font-medium text-neutral-800">{item.label}{item.required ? ' *' : ''}</span>
                    <span className="ml-2 text-neutral-500">{item.type}</span>
                  </div>
                ))}
              </div>
              <div className="text-xs text-neutral-500">
                Uses non-secret refs only: {stringValue(content.staticEndpointRef) || 'missing staticEndpointRef'} / {stringValue(content.leadRecipientRef) || 'missing leadRecipientRef'}
              </div>
            </div>
          </div>
        </div>
      )
    }
    case 'customHtml': {
      const validation = validateCustomHtmlContent(content)
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {field('id', 'section id')}
            {field('label', 'label')}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <SelectField label="container" value={stringValue(content.container) || 'standard'} onChange={(value) => updateBlockField(blockIndex, 'container', value)}>
              {SECTION_CONTAINERS.map((option) => <option key={option} value={option}>{option}</option>)}
            </SelectField>
            <SelectField label="allowedProfile" value={stringValue(content.allowedProfile) || 'marketing-basic'} onChange={(value) => updateBlockField(blockIndex, 'allowedProfile', value)}>
              {RICH_HTML_PROFILES.map((option) => <option key={option} value={option}>{option}</option>)}
            </SelectField>
            <SelectField label="sectionVariant" value={stringValue(content.sectionVariant) || 'split-feature'} onChange={(value) => updateBlockField(blockIndex, 'sectionVariant', value)}>
              {SECTION_VARIANTS.map((option) => <option key={option} value={option}>{option}</option>)}
            </SelectField>
          </div>
          {field('html', 'html', { multiline: true, rows: 12 })}
          {field('css', 'section scoped css', { multiline: true, rows: 8 })}
          <RichValidationPanel errors={validation.errors.map((issue) => issue.message)} warnings={validation.warnings.map((issue) => issue.message)} />
          <div className="rounded-md border border-neutral-200 bg-white p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">Sanitized preview</div>
            <div className="prose max-w-none text-sm" dangerouslySetInnerHTML={{ __html: validation.sanitizedHtml || '' }} />
          </div>
        </div>
      )
    }
    case 'trustedEmbed': {
      const validation = validateTrustedEmbedContent(content)
      return (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <SelectField label="provider" value={stringValue(content.provider) || 'youtube'} onChange={(value) => updateBlockField(blockIndex, 'provider', value)}>
              {TRUSTED_EMBED_PROVIDERS.map((option) => <option key={option} value={option}>{option}</option>)}
            </SelectField>
            <SelectField label="container" value={stringValue(content.container) || 'standard'} onChange={(value) => updateBlockField(blockIndex, 'container', value)}>
              {SECTION_CONTAINERS.map((option) => <option key={option} value={option}>{option}</option>)}
            </SelectField>
            {field('aspectRatio', 'aspectRatio')}
          </div>
          {field('url', 'url')}
          {field('title', 'title')}
          {field('caption', 'caption', { multiline: true, rows: 3 })}
          <RichValidationPanel errors={validation.errors.map((issue) => issue.message)} warnings={validation.warnings.map((issue) => issue.message)} />
        </div>
      )
    }
    default:
      return <UnsupportedBlock block={{ type: blockType, content }} />
  }
}
