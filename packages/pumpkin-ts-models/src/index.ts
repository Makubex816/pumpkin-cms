// Core interfaces and types
export type { IHtmlBlock, GenericHtmlBlock } from './models/IHtmlBlock';

// User models
export type {
  User,
  LoginRequest,
  LoginResponse,
  UserInfo,
  AdminUserProfile,
  UpdateUserProfileRequest
} from './models/User';

export {
  UserRole,
  userRoleToString,
  stringToUserRole,
  isUserRole,
  userToUserInfo
} from './models/User';

// Tenant models
export type {
  Tenant,
  ApiKeyMeta,
  TenantSettings,
  Features,
  Contact,
  Billing,
  TenantInfo
} from './models/Tenant';

export {
  tenantToTenantInfo
} from './models/Tenant';

// Form Entry models
export type {
  FormEntry,
  FormEntryMetadata
} from './models/FormEntry';

// Form definition and default form system
export type {
  DefaultFormKey,
  FormBlock,
  FormBlockContent,
  FormBlockVariant,
  FormDefinition,
  FormDefinitionConsent,
  FormDefinitionField,
  FormDefinitionRouting,
  FormDefinitionSpamProtection,
  FormDefinitionStatus,
  FormDefinitionType,
  FormFieldType,
  FormSpamStatus,
  FormSubmissionPayload,
  FormSubmitAction,
  FormValidationIssue,
  FormValidationResult
} from './forms';

export {
  DEFAULT_CONTACT_FORM_DEFINITION,
  DEFAULT_FORM_KEYS,
  FORM_BLOCK_VARIANTS,
  FORM_FIELD_TYPES,
  ICE_DEFAULT_QUOTE_REQUEST_FORM_DEFINITION,
  getDefaultFormDefinition,
  getDefaultFormDefinitions,
  validateFormBlockContent,
  validateFormDefinition,
  validateFormSubmissionPayload,
  validatePageFormBlocks
} from './forms';

// Media asset models
export type {
  MediaAsset,
  MediaAssetFocalPoint,
  MediaAssetStatus,
  MediaAssetStorageProvider,
  MediaAssetUsageType,
  MediaAssetUsageReference,
  MediaAssetVariant,
  MediaAssetLicenseStatus,
  MediaAssetUsageStatus
} from './models/MediaAsset';

// Page models
export type {
  Page,
  PageMetaData,
  SearchData,
  ContentData,
  SeoData,
  PageImageAsset,
  PageOpenGraphImage,
  PageMedia,
  PageFulfillment,
  PageGoogleAds,
  PageQuality,
  PageWorkflow,
  PageRedirect,
  PageRedirectReason,
  PageRevisionMetadata,
  PageChangeSource,
  PageRevisionSnapshot,
  PageStaticPublishing,
  PageTemplateIdentity,
  PageLinking,
  PageStructuredDataControls,
  PageServiceSchema,
  PageProductOffered,
  PageAreaServed,
  PageAreaServedType,
  PageFormConfig,
  PageDomainRouting,
  PageImportProvenance,
  PageDeploymentHooks,
  AlternateUrl,
  OpenGraphData,
  TwitterCardData,
  ContentRelationships,
  NodePosition
} from './models/Page';

// Hero blocks
export type {
  HeroType,
  HeroContent,
  HeroBlock
} from './models/HeroBlocks';

// CTA blocks
export type {
  PrimaryCtaContent,
  PrimaryCtaBlock,
  SecondaryCtaContent,
  SecondaryCtaBlock
} from './models/CtaBlocks';

// Content blocks
export type {
  Card,
  CardGridContent,
  CardGridBlock,
  FaqItem,
  FaqContent,
  FaqBlock
} from './models/ContentBlocks';

// Navigation blocks
export type {
  BreadcrumbItem,
  BreadcrumbsContent,
  BreadcrumbsBlock,
  TrustBarItem,
  TrustBarContent,
  TrustBarBlock,
  Step,
  HowItWorksContent,
  HowItWorksBlock,
  ServiceAreaMapContent,
  ServiceAreaMapBlock,
  ProTipItem,
  LocalProTipsContent,
  LocalProTipsBlock
} from './models/NavigationBlocks';

// Interaction blocks
export type {
  GalleryImage,
  GalleryContent,
  GalleryBlock,
  TestimonialItem,
  TestimonialsContent,
  TestimonialsBlock,
  FormField,
  SocialLink,
  ContactContent,
  ContactBlock
} from './models/InteractionBlocks';

// Blog blocks
export type {
  RelatedPost,
  BlogContent,
  BlogBlock
} from './models/BlogBlocks';

// Block types and utilities
export type {
  HtmlBlock
} from './models/HtmlBlockTypes';

export {
  BLOCK_TYPE_MAP,
  SUPPORTED_BLOCK_TYPES,
  isBlockOfType,
  isHtmlBlock,
  createGenericBlock
} from './models/HtmlBlockTypes';

// Design system and safe rich-section utilities
export type {
  ValidationSeverity,
  DesignSystemValidationIssue,
  DesignSystemValidationResult,
  RichHtmlProfile,
  SectionContainer,
  SectionVariant,
  TrustedEmbedProvider,
  ThemeTokenMap,
  ThemeTokens,
  SectionVariantDefinition,
  DesignSystemMetadata,
  CustomHtmlContent,
  CustomHtmlBlock,
  TrustedEmbedContent,
  TrustedEmbedBlock,
  HtmlValidationOptions,
  CssValidationMode,
  CssValidationOptions,
  NavigationMenuItemLike,
  NavigationValidationOptions
} from './design-system';

export {
  RICH_HTML_PROFILES,
  SECTION_CONTAINERS,
  SECTION_VARIANTS,
  TRUSTED_EMBED_PROVIDERS,
  APPROVED_CLASS_PREFIXES,
  ICE_LAUNCH_NAVIGATION_ROUTES,
  isRichHtmlProfile,
  isSectionContainer,
  isSectionVariant,
  isTrustedEmbedProvider,
  isTailwindUtilityLikeClass,
  normalizeSectionId,
  validateCustomHtmlContent,
  validateTrustedEmbedContent,
  sanitizeHtml,
  validateCss,
  validateContentBlocksDesignSystem,
  validateThemeDesignSystem,
  validateThemeNavigation,
  validateThemeTokens,
  buildThemeTokenCssVariables,
  getContainerClass,
  getSectionVariantClass,
  resolveTrustedEmbedUrl
} from './design-system';

// Theme models
export type {
  Theme,
  ThemeHeader,
  ThemeFooter,
  BlockStyleMap,
  MenuItem,
  ThemeDesignSystem
} from './models/Theme';

// Publish run models
export type {
  PublishRun,
  PublishRunSiteSummary,
  PublishRunManifestSummary,
  PublishRunSource,
  PublishRunType,
  PublishRunStatus,
  PublishRunDeploymentTarget,
  PublishRunDeploymentStatus
} from './models/PublishRun';

// Import run models
export type {
  ImportRun,
  ImportRunAffectedPage,
  ImportRunValidationSummary,
  ImportRunDiffSummary,
  ImportRunResultSummary,
  ImportRunPreflightAcknowledgements,
  ImportRunReportSummary,
  ImportRunSource,
  ImportRunMode,
  ImportRunStatus,
  ImportRunAffectedPageAction
} from './models/ImportRun';

// JSON converter
export { PageJsonConverter } from './PageJsonConverter';
export type { JsonConverterOptions } from './PageJsonConverter';
