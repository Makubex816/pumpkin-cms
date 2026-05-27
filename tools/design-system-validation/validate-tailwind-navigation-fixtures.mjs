import { readFileSync } from 'fs';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../..');
const { isTailwindUtilityLikeClass } = require(path.join(repoRoot, 'packages', 'pumpkin-ts-models', 'dist', 'index.js'));

const failures = [];
const warnings = [];

const globalsCssPath = path.join(repoRoot, 'apps', 'ice-rink-web', 'src', 'app', 'globals.css');
const fallbackThemePath = path.join(repoRoot, 'apps', 'ice-rink-web', 'src', 'data', 'fallback-theme.ts');
const tailwindConfigPath = path.join(repoRoot, 'apps', 'ice-rink-web', 'tailwind.config.js');
const importCandidateDir = path.join(repoRoot, 'content-review', 'ice-launch-phase8c10-import-candidate');

const globalsCss = readFileSync(globalsCssPath, 'utf8');
const fallbackTheme = readFileSync(fallbackThemePath, 'utf8');
const tailwindConfig = readFileSync(tailwindConfigPath, 'utf8');

const requiredCssSelectors = [
  '.cms-container',
  '.cms-rich-section',
  '.cms-rich-html',
  '.cms-layout',
  '.cms-copy',
  '.cms-eyebrow',
  '.cms-panel',
  '.cms-trusted-embed',
  '.section-premium-hero',
  '.section-split-feature',
  '.section-trust-band',
  '.section-event-card-grid',
  '.section-service-area-grid',
  '.section-quote-form-panel',
  '.section-contact-card',
  '.section-inline-contact',
  '.section-compact-contact',
  '.section-faq-panel',
  '.section-media-feature',
  '.section-table-comparison',
  '.section-final-cta',
  '.ice-hero-grid',
  '.ice-quote-grid',
  '.ice-check-list',
  '.ice-details-list',
  '.ice-region-list',
  '.ice-event-grid',
  '.ice-event-card',
  '.ice-planning-table',
  '.ice-service-teaser',
  '.ice-response-note',
  '.ice-privacy-note',
  '.ice-area-grid',
  '.ice-area-card',
  '.ice-city-note',
  '.ice-alias-note',
  '.ice-cta-link',
];

for (const selector of requiredCssSelectors) {
  if (!globalsCss.includes(selector)) {
    failures.push(`Missing source CSS selector ${selector}`);
  }
}

if (!tailwindConfig.includes("../../packages/pumpkin-block-views/src/**/*.{ts,tsx}") && !tailwindConfig.includes('../../packages/pumpkin-block-views/src/**/*.{ts,tsx}')) {
  failures.push('Tailwind config does not scan pumpkin-block-views source classes.');
}

if (tailwindConfig.includes('content-review')) {
  failures.push('Tailwind config should not rely on scanning review-only CMS JSON folders.');
}

const requiredNavRoutes = [
  { label: 'Home', url: '/' },
  { label: 'Service Areas', url: '/service-areas' },
  { label: 'Contact', url: '/contact' },
];

for (const item of requiredNavRoutes) {
  if (!fallbackTheme.includes(`label: '${item.label}'`) || !fallbackTheme.includes(`url: '${item.url}'`)) {
    failures.push(`Fallback navigation is missing ${item.label} -> ${item.url}`);
  }
}

for (const staleRoute of ['/ice-rink-rentals', '/events-holiday-activations', '#service-area-map', '#faq']) {
  if (fallbackTheme.includes(`url: '${staleRoute}'`)) {
    failures.push(`Fallback navigation still includes stale route ${staleRoute}`);
  }
}

const importCandidateFiles = [
  'ice-homepage.import-candidate.json',
  'ice-contact.import-candidate.json',
  'ice-service-areas.import-candidate.json',
  'ice-launch-import-candidate-package.json',
];

const semanticPrefixes = ['cms-', 'section-', 'card-', 'cta-', 'trust-', 'grid-', 'media-', 'rich-', 'ice-'];
const classUsage = new Map();

for (const file of importCandidateFiles) {
  const fullPath = path.join(importCandidateDir, file);
  const jsonText = readFileSync(fullPath, 'utf8');
  const parsed = JSON.parse(jsonText);
  for (const className of collectHtmlClasses(parsed)) {
    if (!classUsage.has(className)) classUsage.set(className, new Set());
    classUsage.get(className).add(file);

    const semantic = semanticPrefixes.some((prefix) => className.startsWith(prefix));
    if (isTailwindUtilityLikeClass(className) && !semantic) {
      failures.push(`CMS import candidate ${file} uses Tailwind utility class ${className}`);
    } else if (!semantic) {
      warnings.push(`CMS import candidate ${file} uses non-registry class ${className}`);
    }
  }
}

const summary = {
  ok: failures.length === 0,
  checkedCssSelectors: requiredCssSelectors.length,
  checkedNavigationRoutes: requiredNavRoutes.map((item) => item.url),
  importCandidateClassCount: classUsage.size,
  classes: [...classUsage.keys()].sort(),
  warnings,
  failures,
};

console.log(JSON.stringify(summary, null, 2));

if (failures.length > 0) {
  process.exit(1);
}

function collectHtmlClasses(value) {
  const values = [];
  for (const text of collectStrings(value)) {
    for (const match of text.matchAll(/class="([^"]+)"/g)) {
      values.push(...match[1].split(/\s+/).map((item) => item.trim()).filter(Boolean));
    }
  }
  return values;
}

function collectStrings(value) {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(collectStrings);
}
