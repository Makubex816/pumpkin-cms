import type { IHtmlBlock } from './models/IHtmlBlock';

export type ValidationSeverity = 'error' | 'warning';

export interface DesignSystemValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  path?: string;
}

export interface DesignSystemValidationResult {
  ok: boolean;
  errors: DesignSystemValidationIssue[];
  warnings: DesignSystemValidationIssue[];
  sanitizedHtml?: string;
  sanitizedCss?: string;
}

export const RICH_HTML_PROFILES = [
  'marketing-basic',
  'marketing-rich',
  'media-rich',
  'table-rich',
  'layout-rich',
] as const;

export type RichHtmlProfile = typeof RICH_HTML_PROFILES[number];

export const SECTION_CONTAINERS = ['standard', 'wide', 'fullBleed', 'none'] as const;
export type SectionContainer = typeof SECTION_CONTAINERS[number];

export const SECTION_VARIANTS = [
  'premium-hero',
  'split-feature',
  'trust-band',
  'event-card-grid',
  'service-area-grid',
  'quote-form-panel',
  'contact-card',
  'inline-contact',
  'compact-contact',
  'faq-panel',
  'media-feature',
  'table-comparison',
  'final-cta',
] as const;

export type SectionVariant = typeof SECTION_VARIANTS[number];

export const TRUSTED_EMBED_PROVIDERS = ['youtube', 'vimeo', 'googleMaps'] as const;
export type TrustedEmbedProvider = typeof TRUSTED_EMBED_PROVIDERS[number];

export const APPROVED_CLASS_PREFIXES = [
  'cms-',
  'section-',
  'card-',
  'cta-',
  'trust-',
  'grid-',
  'media-',
  'rich-',
  'ice-',
] as const;

export interface ThemeTokenMap {
  [name: string]: string | number;
}

export interface ThemeTokens {
  colors?: ThemeTokenMap;
  typography?: ThemeTokenMap;
  spacing?: ThemeTokenMap;
  layout?: ThemeTokenMap;
  containerWidths?: ThemeTokenMap;
  borderRadius?: ThemeTokenMap;
  buttons?: ThemeTokenMap;
  cards?: ThemeTokenMap;
  heroSections?: ThemeTokenMap;
  ctaBands?: ThemeTokenMap;
  forms?: ThemeTokenMap;
  faqBlocks?: ThemeTokenMap;
  mediaBlocks?: ThemeTokenMap;
  tables?: ThemeTokenMap;
  shadows?: ThemeTokenMap;
  backgrounds?: ThemeTokenMap;
  [category: string]: ThemeTokenMap | undefined;
}

export interface SectionVariantDefinition {
  variant: SectionVariant | string;
  label?: string;
  className?: string;
  description?: string;
}

export interface DesignSystemMetadata {
  version?: string;
  tenantId?: string;
  domain?: string;
  tokens?: ThemeTokens;
  domainCss?: string;
  templateCss?: Partial<Record<SectionVariant, string>> & Record<string, string>;
  approvedClasses?: string[];
  sectionVariants?: Partial<Record<SectionVariant, SectionVariantDefinition>> & Record<string, SectionVariantDefinition>;
  validation?: {
    status?: string;
    lastValidatedAt?: string;
    errors?: string[];
    warnings?: string[];
  };
}

export interface CustomHtmlContent {
  id: string;
  label?: string;
  html: string;
  container?: SectionContainer | string;
  allowedProfile?: RichHtmlProfile | string;
  sectionVariant?: SectionVariant | string;
  css?: string;
  sanitize?: boolean;
  review?: Record<string, unknown>;
  validation?: Record<string, unknown>;
}

export interface CustomHtmlBlock extends IHtmlBlock {
  type: 'customHtml';
  content: CustomHtmlContent;
}

export interface TrustedEmbedContent {
  provider: TrustedEmbedProvider | string;
  url: string;
  title: string;
  aspectRatio?: string;
  caption?: string;
  container?: SectionContainer | string;
  review?: Record<string, unknown>;
  validation?: Record<string, unknown>;
}

export interface TrustedEmbedBlock extends IHtmlBlock {
  type: 'trustedEmbed';
  content: TrustedEmbedContent;
}

export interface HtmlValidationOptions {
  profile?: RichHtmlProfile | string;
  path?: string;
  approvedClasses?: string[];
  requireImageAlt?: boolean;
}

export type CssValidationMode = 'themeTokens' | 'domainCss' | 'templateCss' | 'sectionScopedCss';

export interface CssValidationOptions {
  mode: CssValidationMode;
  tenantId?: string;
  domain?: string;
  sectionId?: string;
  sectionVariant?: string;
  approvedClasses?: string[];
  path?: string;
}

export interface NavigationMenuItemLike {
  label?: unknown;
  url?: unknown;
  target?: unknown;
  icon?: unknown;
  order?: unknown;
  isVisible?: unknown;
  children?: unknown;
}

export interface NavigationValidationOptions {
  path?: string;
  approvedRoutes?: string[];
  requireRoutes?: string[];
  allowExternalHttps?: boolean;
}

export const ICE_LAUNCH_NAVIGATION_ROUTES = ['/', '/service-areas', '/contact'] as const;

const profileTags: Record<RichHtmlProfile, Set<string>> = {
  'marketing-basic': new Set(['h2', 'h3', 'h4', 'p', 'span', 'strong', 'em', 'br', 'ul', 'ol', 'li', 'a']),
  'marketing-rich': new Set(['section', 'div', 'article', 'aside', 'h2', 'h3', 'h4', 'p', 'span', 'strong', 'em', 'br', 'ul', 'ol', 'li', 'a', 'blockquote']),
  'media-rich': new Set(['section', 'div', 'article', 'aside', 'h2', 'h3', 'h4', 'p', 'span', 'strong', 'em', 'br', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'picture', 'source', 'blockquote']),
  'table-rich': new Set(['section', 'div', 'h2', 'h3', 'h4', 'p', 'span', 'strong', 'em', 'br', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'ul', 'ol', 'li', 'a']),
  'layout-rich': new Set(['section', 'div', 'article', 'aside', 'h2', 'h3', 'h4', 'p', 'span', 'strong', 'em', 'br', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'picture', 'source', 'blockquote', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption']),
};

const blockedTags = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'embed',
  'svg',
  'canvas',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'option',
  'link',
  'meta',
  'html',
  'head',
  'body',
  'base',
  'noscript',
  'template',
]);

const voidTags = new Set(['br', 'img', 'source']);
const commonAttributes = new Set(['class', 'id', 'title', 'aria-label', 'aria-hidden', 'role']);
const blockedAttributes = new Set(['style', 'srcdoc', 'formaction', 'autofocus', 'contenteditable']);
const allowedLinkSchemes = ['https:', 'mailto:', 'tel:'];
const allowedImageSchemes = ['https:'];
const cssBlockedPatterns: Array<{ code: string; pattern: RegExp; message: string }> = [
  { code: 'css.import', pattern: /@import\b/i, message: '@import is not allowed in CMS-authored CSS.' },
  { code: 'css.font-face', pattern: /@font-face\b/i, message: '@font-face requires explicit approval and is blocked here.' },
  { code: 'css.javascript-url', pattern: /url\s*\(\s*['"]?\s*javascript:/i, message: 'url(javascript:) is not allowed.' },
  { code: 'css.data-url', pattern: /url\s*\(\s*['"]?\s*data:/i, message: 'url(data:) is not allowed.' },
  { code: 'css.expression', pattern: /expression\s*\(/i, message: 'CSS expression() is not allowed.' },
  { code: 'css.behavior', pattern: /\bbehavior\s*:/i, message: 'CSS behavior: is not allowed.' },
  { code: 'css.moz-binding', pattern: /-moz-binding\s*:/i, message: '-moz-binding is not allowed.' },
  { code: 'css.next-root', pattern: /#__next\b/i, message: 'Content CSS cannot target #__next.' },
  { code: 'css.script-string', pattern: /<\/?script\b/i, message: 'Script-like strings are not allowed in content CSS.' },
];

const cssWarningPatterns: Array<{ code: string; pattern: RegExp; message: string }> = [
  { code: 'css.important', pattern: /!important\b/i, message: '!important should be avoided in CMS-authored CSS.' },
  { code: 'css.fixed', pattern: /\bposition\s*:\s*fixed\b/i, message: 'position: fixed can interfere with navigation and forms.' },
  { code: 'css.animation', pattern: /\banimation(?:-[a-z-]+)?\s*:/i, message: 'Animations should be reviewed for accessibility and performance.' },
  { code: 'css.transform', pattern: /\btransform\s*:/i, message: 'Transforms should be reviewed for layout safety.' },
  { code: 'css.filter', pattern: /\bfilter\s*:/i, message: 'Filters should be reviewed for rendering cost.' },
  { code: 'css.clip-path', pattern: /\bclip-path\s*:/i, message: 'clip-path should be reviewed for browser support and layout safety.' },
];

const tailwindVariantPrefixes = new Set([
  'sm',
  'md',
  'lg',
  'xl',
  '2xl',
  'hover',
  'focus',
  'focus-visible',
  'active',
  'visited',
  'disabled',
  'group-hover',
  'group-focus',
  'peer-checked',
  'dark',
  'motion-safe',
  'motion-reduce',
  'portrait',
  'landscape',
  'print',
]);

const tailwindExactUtilities = new Set([
  'block',
  'inline-block',
  'inline',
  'flex',
  'inline-flex',
  'grid',
  'inline-grid',
  'contents',
  'hidden',
  'relative',
  'absolute',
  'fixed',
  'sticky',
  'static',
  'container',
  'sr-only',
  'not-sr-only',
  'visible',
  'invisible',
  'collapse',
  'isolate',
  'isolation-auto',
  'antialiased',
  'subpixel-antialiased',
  'truncate',
  'clearfix',
]);

const tailwindUtilityPatterns: RegExp[] = [
  /^-?(?:m|mx|my|mt|mr|mb|ml|p|px|py|pt|pr|pb|pl)-/,
  /^(?:w|h|min-w|min-h|max-w|max-h)-/,
  /^(?:text|bg|from|via|to|decoration|accent|caret|fill|stroke|placeholder|border|divide|ring|outline)-/,
  /^(?:rounded|shadow|opacity|z|order|col|row|basis|grow|shrink|gap|gap-x|gap-y|space-x|space-y)-/,
  /^(?:items|justify|content|self|place-items|place-content|place-self)-/,
  /^(?:font|leading|tracking|align|whitespace|break|hyphens|list|underline|no-underline|uppercase|lowercase|capitalize|normal-case)/,
  /^(?:overflow|overscroll|object|inset|top|right|bottom|left)-/,
  /^(?:grid-cols|grid-rows|auto-cols|auto-rows|col-span|row-span)-/,
  /^(?:flex|table|flow-root|clear|float|box|line-clamp)-/,
  /^(?:transition|duration|ease|delay|animate|transform|scale|rotate|translate|skew|origin)-/,
  /^(?:filter|blur|brightness|contrast|drop-shadow|grayscale|hue-rotate|invert|saturate|sepia|backdrop)-/,
  /^(?:cursor|select|resize|appearance|pointer-events|touch|scroll|snap)-/,
  /^(?:aria|data)-/,
  /^\[.+\]$/,
];

const broadlyAllowedCssProperties = new Set([
  'align-items',
  'aspect-ratio',
  'background',
  'background-color',
  'background-image',
  'background-position',
  'background-repeat',
  'background-size',
  'border',
  'border-color',
  'border-radius',
  'border-width',
  'box-shadow',
  'color',
  'column-gap',
  'display',
  'flex',
  'flex-direction',
  'flex-wrap',
  'font-family',
  'font-size',
  'font-weight',
  'gap',
  'grid-template-columns',
  'height',
  'justify-content',
  'line-height',
  'margin',
  'margin-bottom',
  'margin-left',
  'margin-right',
  'margin-top',
  'max-width',
  'min-height',
  'min-width',
  'object-fit',
  'opacity',
  'overflow',
  'padding',
  'padding-bottom',
  'padding-left',
  'padding-right',
  'padding-top',
  'position',
  'row-gap',
  'text-align',
  'text-decoration',
  'text-transform',
  'width',
  'z-index',
]);

export function isRichHtmlProfile(value: unknown): value is RichHtmlProfile {
  return typeof value === 'string' && (RICH_HTML_PROFILES as readonly string[]).includes(value);
}

export function isSectionContainer(value: unknown): value is SectionContainer {
  return typeof value === 'string' && (SECTION_CONTAINERS as readonly string[]).includes(value);
}

export function isSectionVariant(value: unknown): value is SectionVariant {
  return typeof value === 'string' && (SECTION_VARIANTS as readonly string[]).includes(value);
}

export function isTrustedEmbedProvider(value: unknown): value is TrustedEmbedProvider {
  return typeof value === 'string' && (TRUSTED_EMBED_PROVIDERS as readonly string[]).includes(value);
}

export function isTailwindUtilityLikeClass(className: string): boolean {
  const normalized = className.trim().replace(/^!/, '');
  if (!normalized) return false;

  const parts = normalized.split(':').filter(Boolean);
  const candidate = (parts[parts.length - 1] || normalized).replace(/^!/, '');
  const hasTailwindVariant = parts.length > 1 && parts.slice(0, -1).some((part) => tailwindVariantPrefixes.has(part) || /^\[.+\]$/.test(part));

  if (hasTailwindVariant) return true;
  if (tailwindExactUtilities.has(candidate)) return true;
  return tailwindUtilityPatterns.some((pattern) => pattern.test(candidate));
}

export function normalizeSectionId(value: unknown, fallback = 'custom-html-section'): string {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return normalized || fallback;
}

export function validateCustomHtmlContent(content: Partial<CustomHtmlContent>, options: HtmlValidationOptions & { approvedClasses?: string[] } = {}): DesignSystemValidationResult {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];
  const path = options.path || 'customHtml';
  const profile = isRichHtmlProfile(content.allowedProfile) ? content.allowedProfile : (isRichHtmlProfile(options.profile) ? options.profile : 'marketing-basic');
  const container = content.container || 'standard';
  const sectionVariant = content.sectionVariant || '';
  const sectionId = normalizeSectionId(content.id);

  if (!content.id || !String(content.id).trim()) {
    errors.push(issue('error', 'customHtml.id', 'customHtml sections require a stable id.', `${path}.id`));
  }

  if (!isSectionContainer(container)) {
    errors.push(issue('error', 'customHtml.container', `Unsupported container "${String(container)}".`, `${path}.container`));
  }

  if (content.allowedProfile && !isRichHtmlProfile(content.allowedProfile)) {
    errors.push(issue('error', 'customHtml.profile', `Unsupported allowedProfile "${String(content.allowedProfile)}".`, `${path}.allowedProfile`));
  }

  if (sectionVariant && !isSectionVariant(sectionVariant)) {
    errors.push(issue('error', 'customHtml.variant', `Unsupported sectionVariant "${String(sectionVariant)}".`, `${path}.sectionVariant`));
  }

  const htmlResult = sanitizeHtml(String(content.html || ''), {
    profile,
    path: `${path}.html`,
    approvedClasses: options.approvedClasses,
    requireImageAlt: options.requireImageAlt,
  });
  errors.push(...htmlResult.errors);
  warnings.push(...htmlResult.warnings);

  let sanitizedCss = '';
  if (content.css && String(content.css).trim()) {
    const cssResult = validateCss(String(content.css), {
      mode: 'sectionScopedCss',
      sectionId,
      sectionVariant: isSectionVariant(sectionVariant) ? sectionVariant : undefined,
      approvedClasses: options.approvedClasses,
      path: `${path}.css`,
    });
    errors.push(...cssResult.errors);
    warnings.push(...cssResult.warnings);
    sanitizedCss = cssResult.sanitizedCss || '';
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    sanitizedHtml: htmlResult.sanitizedHtml || '',
    sanitizedCss,
  };
}

export function validateTrustedEmbedContent(content: Partial<TrustedEmbedContent>, path = 'trustedEmbed'): DesignSystemValidationResult {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];
  const provider = content.provider;
  const title = String(content.title || '').trim();
  const container = content.container || 'standard';

  if (!isTrustedEmbedProvider(provider)) {
    errors.push(issue('error', 'trustedEmbed.provider', `Unsupported trustedEmbed provider "${String(provider || '')}".`, `${path}.provider`));
  }

  if (!title) {
    errors.push(issue('error', 'trustedEmbed.title', 'trustedEmbed title is required for accessibility.', `${path}.title`));
  }

  if (!isSectionContainer(container)) {
    errors.push(issue('error', 'trustedEmbed.container', `Unsupported container "${String(container)}".`, `${path}.container`));
  }

  const urlResult = resolveTrustedEmbedUrl(String(content.url || ''), isTrustedEmbedProvider(provider) ? provider : undefined);
  if (!urlResult.ok) {
    errors.push(issue('error', 'trustedEmbed.url', urlResult.message, `${path}.url`));
  }

  if (content.aspectRatio && !/^\d+(\.\d+)?:\d+(\.\d+)?$/.test(String(content.aspectRatio))) {
    warnings.push(issue('warning', 'trustedEmbed.aspectRatio', 'Use aspectRatio in width:height format, such as 16:9.', `${path}.aspectRatio`));
  }

  return { ok: errors.length === 0, errors, warnings };
}

export function sanitizeHtml(html: string, options: HtmlValidationOptions = {}): DesignSystemValidationResult {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];
  const path = options.path || 'html';
  const profile = isRichHtmlProfile(options.profile) ? options.profile : 'marketing-basic';
  const allowedTags = profileTags[profile];
  const approvedClasses = new Set([...(options.approvedClasses || [])]);
  let output = '';
  let index = 0;

  while (index < html.length) {
    const char = html[index];
    if (char !== '<') {
      output += escapeHtml(char);
      index += 1;
      continue;
    }

    if (html.startsWith('<!--', index)) {
      const commentEnd = html.indexOf('-->', index + 4);
      index = commentEnd >= 0 ? commentEnd + 3 : html.length;
      continue;
    }

    const parsed = parseTag(html, index);
    if (!parsed) {
      output += '&lt;';
      index += 1;
      warnings.push(issue('warning', 'html.malformed', 'Malformed HTML tag was escaped.', path));
      continue;
    }

    index = parsed.endIndex;
    const tag = parsed.name.toLowerCase();

    if (blockedTags.has(tag)) {
      errors.push(issue('error', 'html.blockedTag', `<${tag}> is not allowed in CMS customHtml.`, path));
      if (!parsed.closing && !voidTags.has(tag)) {
        index = skipTagContent(html, index, tag);
      }
      continue;
    }

    if (!allowedTags.has(tag)) {
      errors.push(issue('error', 'html.disallowedTag', `<${tag}> is not allowed for ${profile}.`, path));
      continue;
    }

    if (parsed.closing) {
      output += `</${tag}>`;
      continue;
    }

    const attrResult = sanitizeAttributes(tag, parsed.attrs, {
      path,
      approvedClasses,
      requireImageAlt: options.requireImageAlt !== false,
    });
    errors.push(...attrResult.errors);
    warnings.push(...attrResult.warnings);

    output += `<${tag}${attrResult.attributes ? ` ${attrResult.attributes}` : ''}${parsed.selfClosing || voidTags.has(tag) ? ' />' : '>'}`;
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    sanitizedHtml: output,
  };
}

export function validateCss(css: string, options: CssValidationOptions): DesignSystemValidationResult {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];
  const path = options.path || options.mode;
  const normalizedCss = stripCssComments(css).trim();

  if (!normalizedCss) {
    return { ok: true, errors, warnings, sanitizedCss: '' };
  }

  if (normalizedCss.length > 12000) {
    warnings.push(issue('warning', 'css.length', 'CMS-authored CSS is long and should be reviewed.', path));
  }

  for (const blocked of cssBlockedPatterns) {
    if (blocked.pattern.test(normalizedCss)) {
      errors.push(issue('error', blocked.code, blocked.message, path));
    }
  }

  for (const warning of cssWarningPatterns) {
    if (warning.pattern.test(normalizedCss)) {
      warnings.push(issue('warning', warning.code, warning.message, path));
    }
  }

  const rules = parseCssRules(normalizedCss);
  if (rules.length === 0) {
    errors.push(issue('error', 'css.rules', 'CSS must contain at least one selector block.', path));
  }

  for (const rule of rules) {
    if (!rule.selector.trim()) continue;
    if (rule.selector.trim().startsWith('@')) {
      if (!/^@(media|supports)\b/i.test(rule.selector.trim())) {
        warnings.push(issue('warning', 'css.at-rule', `At-rule "${rule.selector.trim()}" should be reviewed.`, path));
      }
      continue;
    }

    validateCssSelectors(rule.selector, options, errors, warnings, path);
    validateCssDeclarations(rule.body, errors, warnings, path);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    sanitizedCss: errors.length === 0 ? normalizedCss : '',
  };
}

export function validateContentBlocksDesignSystem(blocks: IHtmlBlock[] | undefined, options: { approvedClasses?: string[] } = {}): DesignSystemValidationResult {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];

  if (!Array.isArray(blocks)) {
    return {
      ok: false,
      errors: [issue('error', 'blocks.shape', 'ContentData.ContentBlocks must be an array.', 'ContentData.ContentBlocks')],
      warnings,
    };
  }

  blocks.forEach((block, index) => {
    if (block.type === 'customHtml') {
      const result = validateCustomHtmlContent(block.content as Partial<CustomHtmlContent>, {
        path: `ContentData.ContentBlocks[${index}].content`,
        approvedClasses: options.approvedClasses,
      });
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    if (block.type === 'trustedEmbed') {
      const result = validateTrustedEmbedContent(block.content as Partial<TrustedEmbedContent>, `ContentData.ContentBlocks[${index}].content`);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }
  });

  return { ok: errors.length === 0, errors, warnings };
}

export function validateThemeDesignSystem(designSystem: Partial<DesignSystemMetadata> | undefined, tenantId = ''): DesignSystemValidationResult {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];

  if (!designSystem) {
    return { ok: true, errors, warnings };
  }

  if (designSystem.domainCss) {
    const result = validateCss(designSystem.domainCss, {
      mode: 'domainCss',
      tenantId: designSystem.tenantId || tenantId,
      domain: designSystem.domain,
      approvedClasses: designSystem.approvedClasses,
      path: 'theme.designSystem.domainCss',
    });
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  if (designSystem.templateCss) {
    Object.entries(designSystem.templateCss).forEach(([variant, css]) => {
      if (!isSectionVariant(variant)) {
        warnings.push(issue('warning', 'theme.templateCss.variant', `Template CSS key "${variant}" is not an approved section variant.`, `theme.designSystem.templateCss.${variant}`));
      }
      const result = validateCss(String(css || ''), {
        mode: 'templateCss',
        sectionVariant: variant,
        approvedClasses: designSystem.approvedClasses,
        path: `theme.designSystem.templateCss.${variant}`,
      });
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });
  }

  const tokenResult = validateThemeTokens(designSystem.tokens);
  errors.push(...tokenResult.errors);
  warnings.push(...tokenResult.warnings);

  return { ok: errors.length === 0, errors, warnings };
}

export function validateThemeNavigation(menu: unknown, options: NavigationValidationOptions = {}): DesignSystemValidationResult {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];
  const path = options.path || 'theme.menu';

  if (!Array.isArray(menu)) {
    errors.push(issue('error', 'navigation.shape', 'Navigation menu must be an array.', path));
    return { ok: false, errors, warnings };
  }

  const visibleUrls = new Set<string>();
  menu.forEach((item, index) => {
    validateMenuItem(item as NavigationMenuItemLike, {
      ...options,
      path: `${path}[${index}]`,
      visibleUrls,
    }, errors, warnings);
  });

  const requiredRoutes = options.requireRoutes || [];
  requiredRoutes.forEach((route) => {
    if (!visibleUrls.has(route)) {
      warnings.push(issue('warning', 'navigation.route.missing', `Primary navigation does not include expected route "${route}".`, path));
    }
  });

  return { ok: errors.length === 0, errors, warnings };
}

export function validateThemeTokens(tokens: ThemeTokens | undefined): DesignSystemValidationResult {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];

  if (!tokens) {
    return { ok: true, errors, warnings };
  }

  Object.entries(tokens).forEach(([category, values]) => {
    if (!values || typeof values !== 'object' || Array.isArray(values)) {
      errors.push(issue('error', 'tokens.category', `Theme token category "${category}" must be an object.`, `theme.designSystem.tokens.${category}`));
      return;
    }

    Object.entries(values).forEach(([name, value]) => {
      if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
        errors.push(issue('error', 'tokens.name', `Token name "${name}" should use letters, numbers, hyphens, or underscores.`, `theme.designSystem.tokens.${category}.${name}`));
      }
      if (typeof value !== 'string' && typeof value !== 'number') {
        errors.push(issue('error', 'tokens.value', `Token "${category}.${name}" must be a string or number.`, `theme.designSystem.tokens.${category}.${name}`));
      }
    });
  });

  return { ok: errors.length === 0, errors, warnings };
}

export function buildThemeTokenCssVariables(tokens: ThemeTokens | undefined): string {
  if (!tokens) return '';

  const lines: string[] = [];
  Object.entries(tokens).forEach(([category, values]) => {
    if (!values || typeof values !== 'object' || Array.isArray(values)) return;
    Object.entries(values).forEach(([name, value]) => {
      if (typeof value !== 'string' && typeof value !== 'number') return;
      const variableName = `--cms-${toCssIdentifier(category)}-${toCssIdentifier(name)}`;
      lines.push(`${variableName}: ${String(value)};`);
    });
  });

  return lines.join('\n');
}

export function getContainerClass(container: string | undefined): string {
  switch (container) {
    case 'wide':
      return 'cms-container cms-container-wide';
    case 'fullBleed':
      return 'cms-container cms-container-full-bleed';
    case 'none':
      return 'cms-container-none';
    case 'standard':
    default:
      return 'cms-container cms-container-standard';
  }
}

export function getSectionVariantClass(variant: string | undefined): string {
  return isSectionVariant(variant) ? `section-${variant}` : '';
}

export function resolveTrustedEmbedUrl(url: string, provider?: TrustedEmbedProvider): { ok: boolean; embedUrl?: string; message: string } {
  if (!url.trim()) {
    return { ok: false, message: 'trustedEmbed url is required.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { ok: false, message: 'trustedEmbed url must be an absolute https URL.' };
  }

  if (parsed.protocol !== 'https:') {
    return { ok: false, message: 'trustedEmbed url must use https.' };
  }

  if (provider === 'youtube') {
    const host = parsed.hostname.replace(/^www\./, '');
    let videoId = '';
    if (host === 'youtu.be') videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/embed/')) videoId = parsed.pathname.split('/').filter(Boolean)[1] || '';
      if (!videoId) videoId = parsed.searchParams.get('v') || '';
    }
    if (!/^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
      return { ok: false, message: 'YouTube embeds require a valid youtube.com or youtu.be video URL.' };
    }
    return { ok: true, embedUrl: `https://www.youtube.com/embed/${videoId}`, message: 'ok' };
  }

  if (provider === 'vimeo') {
    const host = parsed.hostname.replace(/^www\./, '');
    const parts = parsed.pathname.split('/').filter(Boolean);
    const videoId = host === 'player.vimeo.com' && parts[0] === 'video' ? parts[1] : parts[0];
    if ((host !== 'vimeo.com' && host !== 'player.vimeo.com') || !/^\d+$/.test(videoId || '')) {
      return { ok: false, message: 'Vimeo embeds require a valid vimeo.com video URL.' };
    }
    return { ok: true, embedUrl: `https://player.vimeo.com/video/${videoId}`, message: 'ok' };
  }

  if (provider === 'googleMaps') {
    const host = parsed.hostname.replace(/^www\./, '');
    if (!['google.com', 'maps.google.com'].includes(host) || !parsed.pathname.toLowerCase().includes('/maps')) {
      return { ok: false, message: 'Google Maps embeds require a valid google.com/maps URL.' };
    }
    return { ok: true, embedUrl: url, message: 'ok' };
  }

  return { ok: false, message: 'trustedEmbed provider is required.' };
}

function sanitizeAttributes(
  tag: string,
  attrs: ParsedAttribute[],
  options: { path: string; approvedClasses: Set<string>; requireImageAlt: boolean },
): { attributes: string; errors: DesignSystemValidationIssue[]; warnings: DesignSystemValidationIssue[] } {
  const errors: DesignSystemValidationIssue[] = [];
  const warnings: DesignSystemValidationIssue[] = [];
  const output = new Map<string, string>();

  for (const attr of attrs) {
    const name = attr.name.toLowerCase();
    const value = attr.value;

    if (!name) continue;

    if (name.startsWith('on') || blockedAttributes.has(name)) {
      errors.push(issue('error', 'html.blockedAttribute', `Attribute "${name}" is not allowed.`, options.path));
      continue;
    }

    if (!isAllowedAttribute(tag, name)) {
      warnings.push(issue('warning', 'html.unknownAttribute', `Attribute "${name}" was removed from <${tag}>.`, options.path));
      continue;
    }

    if ((name === 'href' || name === 'src') && !isSafeUrl(value, name === 'src' ? 'image' : 'link')) {
      errors.push(issue('error', 'html.unsafeUrl', `${name} uses an unsafe or unsupported URL.`, options.path));
      continue;
    }

    if (name === 'class') {
      const classes = value.split(/\s+/).map((item) => item.trim()).filter(Boolean);
      classes.forEach((className) => {
        if (!isApprovedClass(className, options.approvedClasses)) {
          if (isTailwindUtilityLikeClass(className)) {
            errors.push(issue('error', 'html.tailwindUtilityClass', `Tailwind utility class "${className}" is not allowed in CMS customHtml unless it is explicitly registered. Use semantic CMS classes or sectionScopedCss.`, options.path));
          } else {
            warnings.push(issue('warning', 'html.unknownClass', `Class "${className}" is not in the approved registry.`, options.path));
          }
        }
      });
      output.set(name, classes.join(' '));
      continue;
    }

    output.set(name, value);
  }

  if (tag === 'a' && output.get('target') === '_blank') {
    const rel = output.get('rel') || '';
    const relParts = new Set(rel.split(/\s+/).filter(Boolean));
    if (!relParts.has('noopener') || !relParts.has('noreferrer')) {
      relParts.add('noopener');
      relParts.add('noreferrer');
      output.set('rel', [...relParts].join(' '));
      warnings.push(issue('warning', 'html.blankRel', 'target="_blank" links require rel="noopener noreferrer"; rel was normalized.', options.path));
    }
  }

  if (tag === 'img') {
    const alt = output.get('alt');
    const role = output.get('role');
    if (options.requireImageAlt && alt === undefined) {
      warnings.push(issue('warning', 'html.imageAlt', 'Images should include alt text or alt="" with role="presentation".', options.path));
    }
    if (alt === '' && role !== 'presentation') {
      warnings.push(issue('warning', 'html.decorativeImage', 'Decorative images should use alt="" with role="presentation".', options.path));
    }
  }

  const attributes = [...output.entries()]
    .map(([name, value]) => `${name}="${escapeAttribute(value)}"`)
    .join(' ');

  return { attributes, errors, warnings };
}

function isAllowedAttribute(tag: string, name: string): boolean {
  if (commonAttributes.has(name) || name.startsWith('aria-') || name.startsWith('data-')) return true;
  if (tag === 'a') return ['href', 'target', 'rel'].includes(name);
  if (tag === 'img') return ['src', 'alt', 'width', 'height', 'loading', 'decoding'].includes(name);
  if (tag === 'source') return ['src', 'srcset', 'media', 'type', 'sizes'].includes(name);
  if (tag === 'th' || tag === 'td') return ['colspan', 'rowspan', 'scope'].includes(name);
  return false;
}

function isSafeUrl(value: string, kind: 'link' | 'image'): boolean {
  const trimmed = value.trim();
  const lower = trimmed.toLowerCase();
  if (!trimmed) return false;
  if (lower.startsWith('#')) return true;
  if (kind === 'link' && lower.startsWith('/')) return true;
  if (kind === 'image' && (lower.startsWith('/media/') || lower.startsWith('/images/') || lower.startsWith('./') || lower.startsWith('../'))) return true;
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:') || lower.startsWith('file:') || lower.startsWith('blob:')) return false;

  try {
    const parsed = new URL(trimmed);
    return kind === 'image'
      ? allowedImageSchemes.includes(parsed.protocol)
      : allowedLinkSchemes.includes(parsed.protocol);
  } catch {
    return kind === 'link' && !trimmed.includes(':');
  }
}

function validateCssSelectors(
  selectorText: string,
  options: CssValidationOptions,
  errors: DesignSystemValidationIssue[],
  warnings: DesignSystemValidationIssue[],
  path: string,
) {
  const selectors = selectorText.split(',').map((item) => item.trim()).filter(Boolean);
  const sectionId = normalizeSectionId(options.sectionId || '');
  const tenantId = normalizeSectionId(options.tenantId || '');
  const variant = options.sectionVariant || '';
  const approvedClasses = new Set(options.approvedClasses || []);

  selectors.forEach((selector) => {
    if (/\b(html|body)\b/i.test(selector)) {
      errors.push(issue('error', 'css.globalSelector', 'Content CSS cannot target html or body.', path));
    }

    if (/^\s*\*/.test(selector)) {
      errors.push(issue('error', 'css.unscopedUniversal', 'Unscoped universal selectors are not allowed.', path));
    }

    if (options.mode === 'sectionScopedCss') {
      const allowedScopes = [
        `[data-section-id="${sectionId}"]`,
        `[data-section-id='${sectionId}']`,
        `[data-cms-section="${sectionId}"]`,
        `[data-cms-section='${sectionId}']`,
        `.section-${sectionId}`,
      ];
      if (!allowedScopes.some((scope) => selector.startsWith(scope))) {
        errors.push(issue('error', 'css.sectionScope', `sectionScopedCss selector "${selector}" must start with a data-section-id wrapper for "${sectionId}".`, path));
      }
    }

    if (options.mode === 'domainCss') {
      const allowedScopes = [
        `[data-tenant-id="${tenantId}"]`,
        `[data-tenant-id='${tenantId}']`,
        `.tenant-${tenantId}`,
      ];
      if (tenantId && !allowedScopes.some((scope) => selector.startsWith(scope))) {
        errors.push(issue('error', 'css.domainScope', `domainCss selector "${selector}" must start with the tenant wrapper for "${tenantId}".`, path));
      }
    }

    if (options.mode === 'templateCss' && variant && !selector.includes(`section-${variant}`) && !selector.includes(`cms-variant-${variant}`)) {
      warnings.push(issue('warning', 'css.templateScope', `templateCss selector "${selector}" should reference section-${variant} or cms-variant-${variant}.`, path));
    }

    for (const className of selector.matchAll(/\.([A-Za-z_][A-Za-z0-9_-]*)/g)) {
      const value = className[1];
      if (!isApprovedClass(value, approvedClasses)) {
        if (isTailwindUtilityLikeClass(value)) {
          errors.push(issue('error', 'css.tailwindUtilityClass', `Selector class "${value}" looks like a Tailwind utility and is not allowed in CMS-authored CSS unless explicitly registered.`, path));
        } else {
          warnings.push(issue('warning', 'css.unknownClass', `Selector class "${value}" is not in the approved registry.`, path));
        }
      }
    }
  });
}

function validateMenuItem(
  item: NavigationMenuItemLike,
  options: NavigationValidationOptions & { path: string; visibleUrls: Set<string> },
  errors: DesignSystemValidationIssue[],
  warnings: DesignSystemValidationIssue[],
) {
  const label = typeof item?.label === 'string' ? item.label.trim() : '';
  const url = typeof item?.url === 'string' ? item.url.trim() : '';
  const target = typeof item?.target === 'string' && item.target.trim() ? item.target.trim() : '_self';
  const isVisible = item?.isVisible !== false;

  if (!label) {
    errors.push(issue('error', 'navigation.label', 'Navigation items require a label.', `${options.path}.label`));
  }

  if (!url) {
    errors.push(issue('error', 'navigation.url', 'Navigation items require a URL.', `${options.path}.url`));
  } else if (!isSafeNavigationUrl(url, options.allowExternalHttps !== false)) {
    errors.push(issue('error', 'navigation.url.unsafe', `Navigation URL "${url}" is not allowed.`, `${options.path}.url`));
  } else if (isVisible) {
    options.visibleUrls.add(stripHash(url));
  }

  if (!['_self', '_blank'].includes(target)) {
    errors.push(issue('error', 'navigation.target', 'Navigation target must be "_self" or "_blank".', `${options.path}.target`));
  }

  const approvedRoutes = options.approvedRoutes || [];
  const normalizedUrl = stripHash(url);
  if (
    isVisible &&
    approvedRoutes.length > 0 &&
    isInternalNavigationUrl(url) &&
    normalizedUrl &&
    !approvedRoutes.includes(normalizedUrl)
  ) {
    warnings.push(issue('warning', 'navigation.route.unapproved', `Navigation URL "${url}" is not in the approved route list for this launch package.`, `${options.path}.url`));
  }

  if (Array.isArray(item?.children)) {
    item.children.forEach((child, index) => {
      validateMenuItem(child as NavigationMenuItemLike, {
        ...options,
        path: `${options.path}.children[${index}]`,
      }, errors, warnings);
    });
  }
}

function isSafeNavigationUrl(url: string, allowExternalHttps: boolean): boolean {
  const lower = url.trim().toLowerCase();
  if (!lower) return false;
  if (lower.startsWith('//')) return false;
  if (lower.startsWith('#') || lower.startsWith('/')) return true;
  if (lower.startsWith('mailto:') || lower.startsWith('tel:')) return true;
  if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:') || lower.startsWith('file:') || lower.startsWith('blob:')) return false;

  try {
    const parsed = new URL(url);
    return allowExternalHttps && parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function isInternalNavigationUrl(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith('/') && !trimmed.startsWith('//');
}

function stripHash(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('/')) return trimmed;
  const hashIndex = trimmed.indexOf('#');
  return hashIndex >= 0 ? trimmed.slice(0, hashIndex) || '/' : trimmed;
}

function validateCssDeclarations(body: string, errors: DesignSystemValidationIssue[], warnings: DesignSystemValidationIssue[], path: string) {
  const declarations = body.split(';').map((item) => item.trim()).filter(Boolean);
  declarations.forEach((declaration) => {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex < 0) return;
    const property = declaration.slice(0, colonIndex).trim().toLowerCase();
    const value = declaration.slice(colonIndex + 1).trim();

    if (property === 'z-index') {
      const zIndex = Number(value);
      if (Number.isFinite(zIndex) && zIndex > 50) {
        warnings.push(issue('warning', 'css.highZIndex', `z-index ${zIndex} should be reviewed.`, path));
      }
    }

    if (!property.startsWith('--') && !broadlyAllowedCssProperties.has(property)) {
      warnings.push(issue('warning', 'css.unsupportedProperty', `CSS property "${property}" should be reviewed before launch.`, path));
    }

    if (property === 'position' && value.toLowerCase() === 'fixed') {
      warnings.push(issue('warning', 'css.fixed', 'position: fixed can interfere with site chrome.', path));
    }

    if (/url\s*\(/i.test(value) && /javascript:|data:|file:|blob:/i.test(value)) {
      errors.push(issue('error', 'css.unsafeUrl', `Unsafe URL found in "${property}".`, path));
    }
  });
}

function parseCssRules(css: string): Array<{ selector: string; body: string }> {
  const rules: Array<{ selector: string; body: string }> = [];
  let selectorStart = 0;
  let braceDepth = 0;
  let currentSelector = '';
  let bodyStart = -1;

  for (let index = 0; index < css.length; index += 1) {
    const char = css[index];
    if (char === '{') {
      if (braceDepth === 0) {
        currentSelector = css.slice(selectorStart, index).trim();
        bodyStart = index + 1;
      }
      braceDepth += 1;
      continue;
    }
    if (char === '}') {
      braceDepth -= 1;
      if (braceDepth === 0 && bodyStart >= 0) {
        rules.push({ selector: currentSelector, body: css.slice(bodyStart, index).trim() });
        selectorStart = index + 1;
        bodyStart = -1;
        currentSelector = '';
      }
    }
  }

  return rules;
}

function stripCssComments(css: string): string {
  let output = '';
  let index = 0;
  while (index < css.length) {
    if (css[index] === '/' && css[index + 1] === '*') {
      const end = css.indexOf('*/', index + 2);
      index = end >= 0 ? end + 2 : css.length;
      continue;
    }
    output += css[index];
    index += 1;
  }
  return output;
}

interface ParsedAttribute {
  name: string;
  value: string;
}

interface ParsedTag {
  name: string;
  attrs: ParsedAttribute[];
  closing: boolean;
  selfClosing: boolean;
  endIndex: number;
}

function parseTag(input: string, start: number): ParsedTag | null {
  let index = start + 1;
  let quote = '';

  while (index < input.length) {
    const char = input[index];
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      break;
    }
    index += 1;
  }

  if (index >= input.length || input[index] !== '>') return null;

  let body = input.slice(start + 1, index).trim();
  const closing = body.startsWith('/');
  if (closing) body = body.slice(1).trim();
  const selfClosing = body.endsWith('/');
  if (selfClosing) body = body.slice(0, -1).trim();

  const nameMatch = body.match(/^([A-Za-z][A-Za-z0-9-]*)/);
  if (!nameMatch) return null;

  const name = nameMatch[1];
  const rest = body.slice(name.length);
  return {
    name,
    attrs: closing ? [] : parseAttributes(rest),
    closing,
    selfClosing,
    endIndex: index + 1,
  };
}

function parseAttributes(input: string): ParsedAttribute[] {
  const attrs: ParsedAttribute[] = [];
  let index = 0;

  while (index < input.length) {
    while (/\s/.test(input[index] || '')) index += 1;
    if (index >= input.length) break;

    const nameStart = index;
    while (index < input.length && /[^\s=]/.test(input[index])) index += 1;
    const name = input.slice(nameStart, index).trim();
    while (/\s/.test(input[index] || '')) index += 1;

    let value = '';
    if (input[index] === '=') {
      index += 1;
      while (/\s/.test(input[index] || '')) index += 1;
      const quote = input[index] === '"' || input[index] === "'" ? input[index] : '';
      if (quote) {
        index += 1;
        const valueStart = index;
        while (index < input.length && input[index] !== quote) index += 1;
        value = input.slice(valueStart, index);
        if (input[index] === quote) index += 1;
      } else {
        const valueStart = index;
        while (index < input.length && !/\s/.test(input[index])) index += 1;
        value = input.slice(valueStart, index);
      }
    }

    if (name) attrs.push({ name, value });
  }

  return attrs;
}

function skipTagContent(input: string, index: number, tag: string): number {
  const closing = `</${tag}`;
  const lower = input.toLowerCase();
  const closingIndex = lower.indexOf(closing, index);
  if (closingIndex < 0) return index;
  const parsed = parseTag(input, closingIndex);
  return parsed ? parsed.endIndex : closingIndex;
}

function isApprovedClass(className: string, approvedClasses: Set<string>): boolean {
  return approvedClasses.has(className) || APPROVED_CLASS_PREFIXES.some((prefix) => className.startsWith(prefix));
}

function toCssIdentifier(value: string): string {
  return value
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function issue(severity: ValidationSeverity, code: string, message: string, path?: string): DesignSystemValidationIssue {
  return { severity, code, message, path };
}
