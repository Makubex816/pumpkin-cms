// ── Components ─────────────────────────────────────────────
export { Icon } from './components/Icon';
export type { IconProps } from './components/Icon';

// ── Views ──────────────────────────────────────────────────
export {
  HeroBlockView,
  PrimaryCtaBlockView,
  SecondaryCtaBlockView,
  CardGridBlockView,
  FaqBlockView,
  BreadcrumbsBlockView,
  TrustBarBlockView,
  HowItWorksBlockView,
  ServiceAreaMapBlockView,
  LocalProTipsBlockView,
  GalleryBlockView,
  TestimonialsBlockView,
  ContactBlockView,
  FormBlockView,
  BlogBlockView,
  CustomHtmlBlockView,
  TrustedEmbedBlockView,
  HeaderView,
  FooterView,
} from './views';

export type {
  HeroBlockViewProps,
  PrimaryCtaBlockViewProps,
  SecondaryCtaBlockViewProps,
  CardGridBlockViewProps,
  FaqBlockViewProps,
  BreadcrumbsBlockViewProps,
  TrustBarBlockViewProps,
  HowItWorksBlockViewProps,
  ServiceAreaMapBlockViewProps,
  LocalProTipsBlockViewProps,
  GalleryBlockViewProps,
  TestimonialsBlockViewProps,
  ContactBlockViewProps,
  FormBlockSubmitPayload,
  FormBlockViewProps,
  BlogBlockViewProps,
  CustomHtmlBlockViewProps,
  TrustedEmbedBlockViewProps,
  HeaderViewProps,
  FooterViewProps,
} from './views';

// ── Factory Renderer ───────────────────────────────────────
export { BlockViewRenderer } from './BlockViewRenderer';
export type { BlockViewRendererProps, BlockClassNamesMap, BlockOverrides } from './BlockViewRenderer';

// ── Default Class Constants ────────────────────────────────
export {
  heroDefaults,
  primaryCtaDefaults,
  secondaryCtaDefaults,
  cardGridDefaults,
  faqDefaults,
  breadcrumbsDefaults,
  trustBarDefaults,
  howItWorksDefaults,
  serviceAreaMapDefaults,
  localProTipsDefaults,
  galleryDefaults,
  testimonialsDefaults,
  contactDefaults,
  formBlockDefaults,
  blogDefaults,
  headerDefaults,
  footerDefaults,
} from './defaults';

export type {
  HeroClassNames,
  PrimaryCtaClassNames,
  SecondaryCtaClassNames,
  CardGridClassNames,
  FaqClassNames,
  BreadcrumbsClassNames,
  TrustBarClassNames,
  HowItWorksClassNames,
  ServiceAreaMapClassNames,
  LocalProTipsClassNames,
  GalleryClassNames,
  TestimonialsClassNames,
  ContactClassNames,
  FormBlockClassNames,
  BlogClassNames,
  HeaderClassNames,
  FooterClassNames,
} from './defaults';

// ── Utilities ──────────────────────────────────────────────
export { mergeClasses } from './utils/mergeClasses';
