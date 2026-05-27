#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const dotnetFactoryPath = path.join(repoRoot, 'apps/pumpkin-net-models/Models/HtmlBlockFactory.cs');
const tsBlockTypesPath = path.join(repoRoot, 'packages/pumpkin-ts-models/src/models/HtmlBlockTypes.ts');
const blockViewsPath = path.join(repoRoot, 'packages/pumpkin-block-views/src/views');

const viewByBlockType = {
  Hero: 'HeroBlockView.tsx',
  PrimaryCTA: 'PrimaryCtaBlockView.tsx',
  SecondaryCTA: 'SecondaryCtaBlockView.tsx',
  CardGrid: 'CardGridBlockView.tsx',
  FAQ: 'FaqBlockView.tsx',
  Breadcrumbs: 'BreadcrumbsBlockView.tsx',
  TrustBar: 'TrustBarBlockView.tsx',
  HowItWorks: 'HowItWorksBlockView.tsx',
  ServiceAreaMap: 'ServiceAreaMapBlockView.tsx',
  LocalProTips: 'LocalProTipsBlockView.tsx',
  Gallery: 'GalleryBlockView.tsx',
  Testimonials: 'TestimonialsBlockView.tsx',
  Contact: 'ContactBlockView.tsx',
  formBlock: 'FormBlockView.tsx',
  Blog: 'BlogBlockView.tsx',
  customHtml: 'CustomHtmlBlockView.tsx',
  trustedEmbed: 'TrustedEmbedBlockView.tsx',
};

const issues = [];

function readRequired(file) {
  if (!existsSync(file)) {
    issues.push({ severity: 'error', code: 'file.missing', file: display(file), message: 'Required contract file is missing.' });
    return '';
  }
  return readFileSync(file, 'utf8');
}

function display(file) {
  return path.relative(repoRoot, file).replaceAll(path.sep, '/');
}

function parseMapKeys(source, mapName) {
  const mapStart = source.indexOf(`${mapName} = new()`);
  if (mapStart < 0) {
    issues.push({ severity: 'error', code: `${mapName}.missing`, file: display(dotnetFactoryPath), message: `${mapName} was not found.` });
    return [];
  }

  const mapEnd = source.indexOf('};', mapStart);
  const mapBody = source.slice(mapStart, mapEnd);
  return [...mapBody.matchAll(/\{\s*"([^"]+)"/g)].map((match) => match[1]);
}

function parseTsBlockKeys(source) {
  const mapStart = source.indexOf('export const BLOCK_TYPE_MAP');
  if (mapStart < 0) {
    issues.push({ severity: 'error', code: 'ts.blockMap.missing', file: display(tsBlockTypesPath), message: 'BLOCK_TYPE_MAP was not found.' });
    return [];
  }

  const mapEnd = source.indexOf('} as const', mapStart);
  const mapBody = source.slice(mapStart, mapEnd);
  return [...mapBody.matchAll(/^\s*['"]([^'"]+)['"]\s*:/gm)].map((match) => match[1]);
}

function compareSets(leftName, leftValues, rightName, rightValues) {
  const left = new Set(leftValues);
  const right = new Set(rightValues);
  for (const value of left) {
    if (!right.has(value)) {
      issues.push({
        severity: 'error',
        code: 'contract.blockType.missing',
        message: `${value} exists in ${leftName} but not in ${rightName}.`,
      });
    }
  }
  for (const value of right) {
    if (!left.has(value)) {
      issues.push({
        severity: 'error',
        code: 'contract.blockType.extra',
        message: `${value} exists in ${rightName} but not in ${leftName}.`,
      });
    }
  }
}

const dotnetSource = readRequired(dotnetFactoryPath);
const tsSource = readRequired(tsBlockTypesPath);

const dotnetBlockTypes = parseMapKeys(dotnetSource, 'BlockTypeMap');
const dotnetContentTypes = parseMapKeys(dotnetSource, 'ContentTypeMap');
const tsBlockTypes = parseTsBlockKeys(tsSource);
const viewBlockTypes = Object.keys(viewByBlockType);

compareSets('.NET BlockTypeMap', dotnetBlockTypes, '.NET ContentTypeMap', dotnetContentTypes);
compareSets('.NET BlockTypeMap', dotnetBlockTypes, 'TypeScript BLOCK_TYPE_MAP', tsBlockTypes);
compareSets('.NET BlockTypeMap', dotnetBlockTypes, 'pumpkin-block-views view map', viewBlockTypes);

for (const [blockType, viewFile] of Object.entries(viewByBlockType)) {
  const fullPath = path.join(blockViewsPath, viewFile);
  if (!existsSync(fullPath)) {
    issues.push({
      severity: 'error',
      code: 'blockView.missing',
      file: display(fullPath),
      message: `${blockType} has no package/block HTML renderer view.`,
    });
  }
}

const report = {
  ok: issues.every((issue) => issue.severity !== 'error'),
  dotnetBlockTypes,
  dotnetContentTypes,
  tsBlockTypes,
  blockViewTypes: viewBlockTypes,
  issues,
};

console.log(JSON.stringify(report, null, 2));
process.exit(report.ok ? 0 : 1);
