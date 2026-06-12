import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';
import process from 'process';

const siteConfigs = {
  'ice-rink-rentals': {
    requiredFiles: ['index.html', 'sitemap.xml', 'robots.txt'],
    expectedPageFolders: ['contact', 'service-areas'],
    obsoletePageFolders: ['ice-rink-rentals', 'events-holiday-activations'],
    mediaOrigin: 'https://media.iceskatingrinkrentals.com',
    requiresStaticFormEndpoint: true,
  },
  'roller-rink-rentals': {
    requiredFiles: ['index.html', 'sitemap.xml', 'robots.txt'],
    expectedPageFolders: ['roller-rink-rentals', 'contact'],
    obsoletePageFolders: [],
    mediaOrigin: '',
    requiresStaticFormEndpoint: false,
  },
};

const textExtensions = new Set(['.html', '.htm', '.js', '.css', '.json', '.txt', '.xml', '.map']);

const secretPatterns = [
  { label: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/i },
  { label: 'Azure storage connection string', pattern: /DefaultEndpointsProtocol=|AccountKey=/i },
  { label: 'OpenAI-style API key', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { label: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9_]{30,}\b/ },
  { label: 'Cloudflare token-like value', pattern: /\b[A-Za-z0-9_-]{40,}\b.*cloudflare/i },
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

function walkFiles(rootDir) {
  const files = [];
  for (const entry of readdirSync(rootDir, { withFileTypes: true })) {
    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

function isTextFile(filePath) {
  return textExtensions.has(path.extname(filePath).toLowerCase());
}

function relative(rootDir, filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join('/');
}

function getConfiguredStaticFormEndpoint() {
  return (
    process.env.NEXT_PUBLIC_STATIC_FORM_ENDPOINT ||
    process.env.STATIC_FORM_ENDPOINT ||
    process.env.NEXT_PUBLIC_STATIC_FORM_ACTION ||
    process.env.STATIC_FORM_ACTION ||
    ''
  );
}

function addExternalApprovalGate(externalApprovalGates, id, message, requiredEvidence) {
  externalApprovalGates.push({
    id,
    category: 'external_backend_approval_gate',
    severity: 'no-go',
    message,
    requiredEvidence,
  });
}

function validateStaticFormProductionGate(site, externalApprovalGates) {
  if (!site.requiresStaticFormEndpoint) return;

  const endpoint = getConfiguredStaticFormEndpoint();
  const endpointVerified = process.env.STATIC_FORM_ENDPOINT_VERIFIED === 'true';

  if (!endpoint) {
    addExternalApprovalGate(
      externalApprovalGates,
      'static-form-endpoint-configured',
      'Static form endpoint is not configured for production/static deploy readiness.',
      'Approved HTTPS static form endpoint supplied through process environment without reading protected config.',
    );
  } else if (!/^https:\/\//i.test(endpoint) || /localhost|127\.0\.0\.1|<|>|\bexample\./i.test(endpoint)) {
    addExternalApprovalGate(
      externalApprovalGates,
      'static-form-endpoint-approved-https',
      'Static form endpoint must be a verified HTTPS endpoint, not a local or placeholder URL.',
      'Owner-approved non-placeholder HTTPS endpoint for the Ice static contact form.',
    );
  }

  if (!endpointVerified) {
    addExternalApprovalGate(
      externalApprovalGates,
      'static-form-backend-verification',
      'Static form endpoint/backend verification is missing; mailbox readiness is not app form readiness.',
      'Backend proof that the approved endpoint accepts the static form payload and routes leads to the approved owner workflow.',
    );
  }
}

function validatePackage({ siteKey, folder }) {
  const site = siteConfigs[siteKey];
  const errors = [];
  const warnings = [];
  const externalApprovalGates = [];
  const resolvedFolder = folder ? path.resolve(folder) : '';

  if (!site) {
    errors.push(`Unknown site: ${siteKey || '(missing)'}`);
  }

  if (!resolvedFolder) {
    errors.push('Missing --folder path.');
  } else if (!existsSync(resolvedFolder)) {
    errors.push(`Folder does not exist: ${resolvedFolder}`);
  } else if (!statSync(resolvedFolder).isDirectory()) {
    errors.push(`Folder is not a directory: ${resolvedFolder}`);
  }

  if (errors.length > 0) {
    return {
      ok: false,
      siteKey,
      folder: resolvedFolder,
      fileCount: 0,
      localStaticIntegrityOk: false,
      externalApprovalGatesOk: true,
      gateClassification: {
        status: 'failed_local_static_integrity',
        localStaticIntegrityErrorCount: errors.length,
        externalApprovalGateCount: 0,
        warningCount: warnings.length,
      },
      structuralErrors: errors,
      externalApprovalGates,
      errors,
      warnings,
    };
  }

  const files = walkFiles(resolvedFolder);
  if (files.length === 0) {
    errors.push('Staging package folder contains no files.');
  }

  for (const requiredFile of site.requiredFiles) {
    const requiredPath = path.join(resolvedFolder, requiredFile);
    if (!existsSync(requiredPath) || !statSync(requiredPath).isFile()) {
      errors.push(`Missing required file: ${requiredFile}`);
    }
  }

  for (const pageFolder of site.expectedPageFolders || []) {
    const pagePath = path.join(resolvedFolder, pageFolder, 'index.html');
    if (!existsSync(pagePath) || !statSync(pagePath).isFile()) {
      errors.push(`Missing expected page output: ${pageFolder}/index.html`);
    }
  }

  for (const pageFolder of site.obsoletePageFolders || []) {
    const pagePath = path.join(resolvedFolder, pageFolder, 'index.html');
    if (existsSync(pagePath)) {
      errors.push(`Obsolete Ice route output must not be deployable: ${pageFolder}/index.html`);
    }
  }

  const nextStatic = path.join(resolvedFolder, '_next', 'static');
  if (!existsSync(nextStatic)) {
    warnings.push('No _next/static folder found. Confirm this is expected for the package.');
  }

  const redirectsPath = path.join(resolvedFolder, 'redirects.json');
  if (!existsSync(redirectsPath)) {
    warnings.push('redirects.json was not found. Confirm there are no previous slugs or static redirect requirements.');
  } else {
    try {
      const parsed = JSON.parse(readFileSync(redirectsPath, 'utf8'));
      if (!Array.isArray(parsed.redirects)) {
        warnings.push('redirects.json does not contain a redirects array.');
      }
    } catch (error) {
      errors.push(`redirects.json could not be parsed: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const rel = relative(resolvedFolder, filePath);

    if (fileName === '.env' || fileName.startsWith('.env.')) {
      errors.push(`Forbidden env file found: ${rel}`);
    }

    if (/appsettings(\.|$)/i.test(fileName)) {
      errors.push(`Forbidden appsettings file found: ${rel}`);
    }

    if (!isTextFile(filePath)) continue;

    const content = readFileSync(filePath, 'utf8');
    if (/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(content)) {
      errors.push(`Localhost reference found: ${rel}`);
    }

    if (site.mediaOrigin) {
      if (/["'(]\s*\/media\/ice-rink-rentals\//i.test(content) || /src=["']\/media\/ice-rink-rentals\//i.test(content)) {
        errors.push(`Local-dev media URL found in staging package: ${rel}`);
      }

      if (/data:image\//i.test(content)) {
        errors.push(`Base64 image payload found in staging package: ${rel}`);
      }

      if (/https?:\/\/(?:[^/\s"']+\.)?(?:placehold\.co|placeholder\.com|example\.(?:com|test))\b/i.test(content)) {
        errors.push(`Placeholder or fake media URL found in staging package: ${rel}`);
      }

      const imageUrls = [...content.matchAll(/https?:\/\/[^"'\s)]+?\.(?:png|jpe?g|webp|gif|svg)(?:[?#][^"'\s)]*)?/gi)]
        .map((match) => match[0]);
      for (const url of imageUrls) {
        if (!url.startsWith(`${site.mediaOrigin}/`)) {
          errors.push(`Unapproved image URL found in staging package: ${rel} -> ${url}`);
        }
      }
    }

    if (content.includes('CMS LIVE')) {
      errors.push(`CMS LIVE marker found: ${rel}`);
    }

    for (const { label, pattern } of secretPatterns) {
      if (pattern.test(content)) {
        errors.push(`Possible ${label} found: ${rel}`);
      }
    }

    if (path.extname(filePath).toLowerCase() === '.html' && !rel.startsWith('_next/')) {
      if (
        rel !== '404.html' &&
        rel !== '404/index.html' &&
        /<meta\b[^>]*name=["']robots["'][^>]*content=["'][^"']*\bnoindex\b/i.test(content)
      ) {
        errors.push(`Noindex robots meta found in production static page: ${rel}`);
      }

      const unsafeCmsPatterns = [
        { label: 'javascript URL', pattern: /javascript:/i },
        { label: 'inline onclick handler', pattern: /\sonclick\s*=/i },
        { label: 'inline onerror handler', pattern: /\sonerror\s*=/i },
        { label: 'base64 image blob', pattern: /\ssrc=["']data:image\//i },
        { label: 'script tag in CMS section', pattern: /data-cms-section=["'][^"']+["'][\s\S]*?<script\b/i },
        { label: 'object tag', pattern: /<object\b/i },
        { label: 'embed tag', pattern: /<embed\b/i },
        { label: 'form tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<form\b/i },
        { label: 'input tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<input\b/i },
        { label: 'textarea tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<textarea\b/i },
        { label: 'select tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<select\b/i },
        { label: 'style tag in CMS rich HTML', pattern: /cms-rich-html[\s\S]*?<style\b/i },
      ];

      for (const { label, pattern } of unsafeCmsPatterns) {
        if (pattern.test(content)) {
          errors.push(`Unsafe CMS-authored ${label} found in page HTML: ${rel}`);
        }
      }

      if (/data-cms-section=["'][^"']+["'][\s\S]*?<iframe\b/i.test(content)) {
        warnings.push(`Iframe found inside CMS section; confirm it came from trustedEmbed, not customHtml: ${rel}`);
      }
    }
  }

  validateStaticFormProductionGate(site, externalApprovalGates);

  const localStaticIntegrityOk = errors.length === 0;
  const externalApprovalGatesOk = externalApprovalGates.length === 0;
  const combinedErrors = [
    ...errors,
    ...externalApprovalGates.map((gate) => gate.message),
  ];

  return {
    ok: localStaticIntegrityOk && externalApprovalGatesOk,
    siteKey,
    folder: resolvedFolder,
    fileCount: files.length,
    localStaticIntegrityOk,
    externalApprovalGatesOk,
    gateClassification: {
      status: localStaticIntegrityOk
        ? (externalApprovalGatesOk ? 'passed' : 'blocked_external_approval_gate')
        : 'failed_local_static_integrity',
      localStaticIntegrityErrorCount: errors.length,
      externalApprovalGateCount: externalApprovalGates.length,
      warningCount: warnings.length,
      notes: [
        'Local package integrity covers required files, route shape, media URL safety, noindex, forbidden files, sensitive content, redirects, and CMS-authored HTML safety.',
        'External approval gates cover backend/owner evidence that cannot be proven by local package inspection.',
      ],
    },
    structuralErrors: errors,
    externalApprovalGates,
    errors: combinedErrors,
    warnings,
  };
}

const args = parseArgs(process.argv);
const result = validatePackage({
  siteKey: String(args.site || ''),
  folder: args.folder ? String(args.folder) : '',
});

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exit(1);
}
