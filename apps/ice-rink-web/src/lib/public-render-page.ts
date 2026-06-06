import type {
  ContentRelationships,
  Page,
  PageDomainRouting,
  PageFormConfig,
  PageMetaData,
  SearchData,
  SeoData,
} from 'pumpkin-ts-models';

const publicPayloadOmitKeys = new Set([
  'blockingIssues',
  'deploymentHooks',
  'draftNotes',
  'fulfillment',
  'googleAds',
  'importProvenance',
  'lastCheckedAt',
  'lastChangeAt',
  'lastChangeSource',
  'lastChangeSummary',
  'lastChangedBy',
  'lastEditedAt',
  'lastEditedBy',
  'launchNotes',
  'layoutPositions',
  'licenseStatus',
  'pageQuality',
  'review',
  'revision',
  'schemaControls',
  'source',
  'sourceFile',
  'sourceRow',
  'staticPublishing',
  'status',
  'template',
  'uniqueValueReason',
  'usageStatus',
  'validation',
  'workflow',
]);

/**
 * Keep full CMS snapshots available for validators while preventing admin-only
 * workflow/review payload from becoming serialized client props in public HTML.
 */
export function toPublicRenderPage(page: Page): Page {
  return {
    id: page.id,
    PageId: page.PageId,
    tenantId: page.tenantId,
    pageSlug: page.pageSlug,
    PageVersion: page.PageVersion,
    Layout: page.Layout,
    MetaData: pickPublicMetaData(page.MetaData),
    searchData: emptySearchData(),
    ContentData: {
      ContentBlocks: stripPublicPayload(page.ContentData?.ContentBlocks ?? []) as Page['ContentData']['ContentBlocks'],
    },
    contentRelationships: emptyContentRelationships(),
    seo: pickPublicSeo(page.seo),
    isPublished: page.isPublished,
    publishedAt: page.publishedAt,
    includeInSitemap: page.includeInSitemap,
    formConfig: pickPublicFormConfig(page.formConfig),
    formDefinitions: stripPublicPayload(page.formDefinitions ?? []) as Page['formDefinitions'],
    domainRouting: pickPublicDomainRouting(page.domainRouting),
  };
}

function stripPublicPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripPublicPayload);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (publicPayloadOmitKeys.has(key)) continue;
    output[key] = stripPublicPayload(entry);
  }

  return output;
}

function pickPublicMetaData(meta: PageMetaData): PageMetaData {
  return {
    category: meta.category,
    product: meta.product,
    keyword: meta.keyword,
    pageType: meta.pageType,
    title: meta.title,
    description: meta.description,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    author: meta.author,
    language: meta.language,
    market: meta.market,
  };
}

function pickPublicSeo(seo: SeoData): SeoData {
  return {
    metaTitle: seo.metaTitle,
    metaDescription: seo.metaDescription,
    keywords: seo.keywords ?? [],
    robots: seo.robots,
    canonicalUrl: seo.canonicalUrl,
    alternateUrls: seo.alternateUrls ?? [],
    structuredData: [],
    openGraph: seo.openGraph,
    twitterCard: seo.twitterCard,
  };
}

function pickPublicFormConfig(formConfig?: PageFormConfig): PageFormConfig | undefined {
  if (!formConfig) return undefined;

  return {
    formId: formConfig.formId,
    formType: formConfig.formType,
    conversionGoal: formConfig.conversionGoal,
    routingMode: formConfig.routingMode,
    domainRoutingKey: formConfig.domainRoutingKey,
    replyToMode: formConfig.replyToMode,
    emailSubjectTemplate: formConfig.emailSubjectTemplate,
    mailtoFallbackEnabled: formConfig.mailtoFallbackEnabled,
    thankYouUrl: formConfig.thankYouUrl,
    thankYouMessage: formConfig.thankYouMessage,
    recipientGroup: formConfig.recipientGroup,
    staticFormEndpointKey: formConfig.staticFormEndpointKey,
    normalizedFieldMap: formConfig.normalizedFieldMap,
    requiresConsent: formConfig.requiresConsent,
    consentRequired: formConfig.consentRequired,
    spamProtectionRequired: formConfig.spamProtectionRequired,
    spamProtectionEnabled: formConfig.spamProtectionEnabled,
  };
}

function pickPublicDomainRouting(domainRouting?: PageDomainRouting): PageDomainRouting | undefined {
  if (!domainRouting) return undefined;

  return {
    domain: domainRouting.domain,
    brandName: domainRouting.brandName,
    businessDisplayName: domainRouting.businessDisplayName,
    publicContactEmail: domainRouting.publicContactEmail,
    quoteRequestEmail: '',
    supportEmail: '',
    replyToEmail: '',
    fromName: domainRouting.fromName,
    fromEmail: '',
    contactPageSlug: domainRouting.contactPageSlug,
    primaryPhone: domainRouting.primaryPhone,
    mailtoLinksEnabled: domainRouting.mailtoLinksEnabled,
    defaultLeadRoutingMode: domainRouting.defaultLeadRoutingMode,
    defaultRecipientGroup: domainRouting.defaultRecipientGroup,
    staticFormEndpointKey: domainRouting.staticFormEndpointKey,
    leadRecipientRef: domainRouting.leadRecipientRef,
    staticEndpointRef: domainRouting.staticEndpointRef,
    emailProvider: '',
    emailProviderStatus: '',
    mxStatus: '',
    spfStatus: '',
    dkimStatus: '',
    dmarcStatus: '',
    notes: '',
  };
}

function emptySearchData(): SearchData {
  return {
    state: '',
    city: '',
    metro: '',
    county: '',
    keyword: '',
    tags: [],
    contentSummary: '',
    blockTypes: [],
  };
}

function emptyContentRelationships(): ContentRelationships {
  return {
    isHub: false,
    hubPageSlug: '',
    topicCluster: '',
    relatedHubs: [],
    spokePriority: 0,
  };
}
