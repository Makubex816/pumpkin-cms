import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import process from 'process';

const sites = {
  'ice-rink-rentals': {
    domain: 'iceskatingrinkrentals.com',
    oppositeDomains: ['rollerrinkrentals.com'],
    expectedPageFolders: ['ice-rink-rentals', 'events-holiday-activations', 'contact'],
  },
  'roller-rink-rentals': {
    domain: 'rollerrinkrentals.com',
    oppositeDomains: ['iceskatingrinkrentals.com'],
    expectedPageFolders: ['roller-rink-rentals', 'contact'],
  },
};

const textExtensions = new Set([
  '.css',
  '.html',
  '.htm',
  '.js',
  '.json',
  '.map',
  '.txt',
  '.xml',
]);

const highConfidenceSecretPatterns = [
  { label: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i },
  { label: 'Azure storage connection string', pattern: /DefaultEndpointsProtocol=|AccountKey=/i },
  { label: 'OpenAI-style API key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/ },
  { label: 'Slack token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { label: 'JWT token', pattern: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  {
    label: 'assigned secret-like value',
    pattern: /\b(password|api[_-]?key|secret|token|connectionString)\b\s*[:=]\s*["'][^"']{12,}["']/i,
  },
];

function parseArgs(argv) {
  const args = {};

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith('--')) {
      args[key] = true;
    } else {
      args[key] = next;
      index += 1;
    }
  }

  return args;
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function walkFiles(rootDir) {
  const files = [];
  const entries = readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function readText(filePath) {
  return readFileSync(filePath, 'utf8');
}

function getRelativePath(outDir, filePath) {
  return toPosixPath(path.relative(outDir, filePath));
}

function isTextFile(filePath) {
  return textExtensions.has(path.extname(filePath).toLowerCase());
}

function validateRequiredArtifacts(outDir, site, errors, warnings) {
  const requiredFiles = ['index.html', 'sitemap.xml', 'robots.txt'];

  for (const fileName of requiredFiles) {
    const filePath = path.join(outDir, fileName);

    if (!existsSync(filePath)) {
      errors.push(`Missing required file: ${fileName}`);
    } else if (!statSync(filePath).isFile()) {
      errors.push(`Required artifact is not a file: ${fileName}`);
    }
  }

  for (const pageFolder of site.expectedPageFolders) {
    const pagePath = path.join(outDir, pageFolder, 'index.html');

    if (!existsSync(pagePath)) {
      errors.push(`Missing expected page output: ${pageFolder}/index.html`);
    }
  }

  const nextDir = path.join(outDir, '_next');
  const nextStaticDir = path.join(nextDir, 'static');

  if (!existsSync(nextDir)) {
    warnings.push('No _next directory was found. This is unusual for the current Next.js export.');
  } else if (!existsSync(nextStaticDir)) {
    errors.push('Found _next directory but missing _next/static assets.');
  }
}

function validateNoForbiddenFiles(outDir, files, errors) {
  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const relativePath = getRelativePath(outDir, filePath);

    if (fileName === 'appsettings.Development.json') {
      errors.push(`Forbidden development settings file found in output: ${relativePath}`);
    }

    if (fileName === '.env' || fileName.startsWith('.env.')) {
      errors.push(`Forbidden env file found in output: ${relativePath}`);
    }
  }
}

function validateSensitiveContent(outDir, files, errors) {
  for (const filePath of files) {
    if (!isTextFile(filePath)) continue;

    const relativePath = getRelativePath(outDir, filePath);
    const content = readText(filePath);

    if (content.includes('CMS LIVE')) {
      errors.push(`CMS LIVE marker found in output: ${relativePath}`);
    }

    for (const { label, pattern } of highConfidenceSecretPatterns) {
      if (pattern.test(content)) {
        errors.push(`Possible ${label} found in output: ${relativePath}`);
      }
    }
  }
}

function validateDomainReferences(outDir, files, site, errors) {
  const expectedOrigin = `https://${site.domain}`;
  const sitemapPath = path.join(outDir, 'sitemap.xml');
  const robotsPath = path.join(outDir, 'robots.txt');

  if (existsSync(sitemapPath)) {
    const sitemapXml = readText(sitemapPath);
    const locMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

    if (locMatches.length === 0) {
      errors.push('sitemap.xml does not contain any <loc> entries.');
    }

    for (const loc of locMatches) {
      if (!loc.startsWith(expectedOrigin)) {
        errors.push(`sitemap.xml contains non-matching canonical URL: ${loc}`);
      }
    }
  }

  if (existsSync(robotsPath)) {
    const robotsTxt = readText(robotsPath);

    if (!robotsTxt.includes(`Sitemap: ${expectedOrigin}/sitemap.xml`)) {
      errors.push(`robots.txt must reference ${expectedOrigin}/sitemap.xml`);
    }
  }

  for (const filePath of files) {
    if (!isTextFile(filePath)) continue;

    const relativePath = getRelativePath(outDir, filePath);
    const content = readText(filePath);

    for (const oppositeDomain of site.oppositeDomains) {
      if (content.includes(oppositeDomain)) {
        errors.push(`Output for ${site.domain} references ${oppositeDomain}: ${relativePath}`);
      }
    }

    if (path.extname(filePath).toLowerCase() !== '.html') continue;

    const canonicalLinks = [...content.matchAll(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi)];

    for (const [tag] of canonicalLinks) {
      const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);
      const href = hrefMatch?.[1] || '';

      if (!href) {
        errors.push(`Canonical link is missing href: ${relativePath}`);
      } else if (!href.startsWith(expectedOrigin)) {
        errors.push(`Canonical link does not match ${expectedOrigin}: ${relativePath} -> ${href}`);
      }
    }
  }
}

function validateRedirectManifest(outDir, warnings) {
  const redirectPath = path.join(outDir, 'redirects.json');
  if (!existsSync(redirectPath)) {
    warnings.push('redirects.json was not found. Static redirects may need separate deployment configuration.');
    return;
  }

  try {
    const manifest = JSON.parse(readText(redirectPath));
    const redirects = Array.isArray(manifest.redirects) ? manifest.redirects : [];
    const fromPaths = new Set();

    for (const redirect of redirects) {
      const from = typeof redirect.from === 'string' ? redirect.from : '';
      const to = typeof redirect.to === 'string' ? redirect.to : '';

      if (!from || !to) {
        warnings.push('redirects.json contains a redirect without from/to paths.');
        continue;
      }

      if (from === to) {
        warnings.push(`redirects.json contains a loop: ${from} -> ${to}.`);
      }

      if (fromPaths.has(from)) {
        warnings.push(`redirects.json contains duplicate from path: ${from}.`);
      }
      fromPaths.add(from);

      if (redirect.type !== 301) {
        warnings.push(`redirects.json redirect ${from} should use type 301.`);
      }
    }
  } catch (error) {
    warnings.push(`redirects.json could not be parsed: ${error instanceof Error ? error.message : 'unknown parse error'}.`);
  }
}

function validateCmsAuthoredHtmlSafety(outDir, files, errors, warnings) {
  const unsafePatterns = [
    { label: 'javascript URL', pattern: /javascript:/i },
    { label: 'inline onclick handler', pattern: /\sonclick\s*=/i },
    { label: 'inline onerror handler', pattern: /\sonerror\s*=/i },
    { label: 'script tag in CMS section', pattern: /data-cms-section=["'][^"']+["'][\s\S]*?<script\b/i },
    { label: 'object tag', pattern: /<object\b/i },
    { label: 'embed tag', pattern: /<embed\b/i },
    { label: 'form tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<form\b/i },
    { label: 'input tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<input\b/i },
    { label: 'textarea tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<textarea\b/i },
    { label: 'select tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<select\b/i },
    { label: 'style tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<style\b/i },
  ];

  for (const filePath of files) {
    if (path.extname(filePath).toLowerCase() !== '.html') continue;
    if (getRelativePath(outDir, filePath).startsWith('_next/')) continue;

    const relativePath = getRelativePath(outDir, filePath);
    const content = readText(filePath);

    for (const { label, pattern } of unsafePatterns) {
      if (pattern.test(content)) {
        errors.push(`Unsafe CMS-authored ${label} found in page HTML: ${relativePath}`);
      }
    }

    if (/data-cms-section=["'][^"']+["'][\s\S]*?<iframe\b/i.test(content)) {
      warnings.push(`Iframe found inside CMS section in page HTML; confirm it came from trustedEmbed, not customHtml: ${relativePath}`);
    }
  }
}

function main() {
  const args = parseArgs(process.argv);
  const siteKey = String(args.site || '');
  const outDir = args.out ? path.resolve(String(args.out)) : '';
  const site = sites[siteKey];
  const errors = [];
  const warnings = [];

  if (!site) {
    console.error('Usage: node deployment/static-azure/validate-static-output.mjs --site <site-key> --out <out-dir>');
    console.error(`Known sites: ${Object.keys(sites).join(', ')}`);
    process.exit(1);
  }

  if (!outDir) {
    errors.push('Missing --out path.');
  } else if (!existsSync(outDir)) {
    errors.push(`Static output folder was not found: ${outDir}`);
  } else if (!statSync(outDir).isDirectory()) {
    errors.push(`Static output path is not a directory: ${outDir}`);
  }

  const files = errors.length === 0 ? walkFiles(outDir) : [];

  if (errors.length === 0) {
    validateRequiredArtifacts(outDir, site, errors, warnings);
    validateNoForbiddenFiles(outDir, files, errors);
    validateSensitiveContent(outDir, files, errors);
    validateDomainReferences(outDir, files, site, errors);
    validateRedirectManifest(outDir, warnings);
    validateCmsAuthoredHtmlSafety(outDir, files, errors, warnings);
  }

  const summary = {
    ok: errors.length === 0,
    siteKey,
    expectedDomain: site.domain,
    outDir,
    fileCount: files.length,
    errors,
    warnings,
  };

  console.log(JSON.stringify(summary, null, 2));

  if (errors.length > 0) {
    process.exit(1);
  }
}

main();
