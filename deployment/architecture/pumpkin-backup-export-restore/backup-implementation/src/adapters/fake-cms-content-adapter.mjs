import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';

export async function writeFakeCmsContent({ bundleRoot, request }) {
  const source = await readJson(request.fixtureRefs.cmsContent);
  const scope = request.scope;
  const content = scope.scopeType === 'tenant' ? filterTenantContent(source, scope.tenantKey) : source;
  const outputDir = path.join(bundleRoot, 'cms-content');
  const entries = [];

  for (const [name, value] of Object.entries({
    'tenants.json': content.tenants ?? [],
    'sites.json': content.sites ?? [],
    'pages.json': content.pages ?? [],
    'routes.json': content.routes ?? [],
    'forms.json': content.forms ?? [],
    'seo.json': content.seo ?? [],
    'redirects.json': content.redirects ?? [],
    'theme.json': content.theme ?? {}
  })) {
    await writeJson(path.join(outputDir, name), value);
    entries.push({
      path: `cms-content/${name}`,
      kind: 'cms-content',
      required: true,
      sensitivity: 'redacted',
      schemaRef: null
    });
  }

  return entries;
}

function filterTenantContent(source, tenantKey) {
  const tenantFilter = (item) => item.tenantKey === tenantKey;
  return {
    tenants: (source.tenants ?? []).filter(tenantFilter),
    sites: (source.sites ?? []).filter(tenantFilter),
    pages: (source.pages ?? []).filter(tenantFilter),
    routes: (source.routes ?? []).filter(tenantFilter),
    forms: (source.forms ?? []).filter(tenantFilter),
    seo: (source.seo ?? []).filter(tenantFilter),
    redirects: (source.redirects ?? []).filter(tenantFilter),
    theme: {
      themes: (source.theme?.themes ?? []).filter(tenantFilter)
    }
  };
}
