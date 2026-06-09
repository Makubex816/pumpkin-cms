export function buildResourceToTenantMap(registry) {
  return registry.tenantMappings.map((mapping) => ({
    tenantKey: mapping.tenantKey,
    siteKey: mapping.siteKey,
    resourceCount: mapping.resourceIds.length,
    credentialReferenceCount: mapping.credentialRefs.length,
    runtimeProfiles: mapping.runtimeProfileIds,
    resources: mapping.resourceIds.map((resourceId) => {
      const resource = registry.resources.find((item) => item.resourceId === resourceId);
      return {
        resourceId,
        resourceType: resource?.resourceType ?? 'unknown',
        displayName: resource?.displayName ?? resourceId,
        status: resource?.status ?? 'unknown'
      };
    })
  }));
}

export function renderResourceToTenantMapMarkdown(map) {
  const lines = [
    '# Resource To Tenant Map',
    '',
    '| Tenant | Site | Resources | Credential References | Runtime Profiles |',
    '| --- | --- | ---: | ---: | --- |'
  ];
  for (const entry of map) {
    lines.push(`| ${entry.tenantKey ?? 'none'} | ${entry.siteKey ?? 'none'} | ${entry.resourceCount} | ${entry.credentialReferenceCount} | ${entry.runtimeProfiles.join(', ') || 'none'} |`);
  }
  lines.push('');
  for (const entry of map) {
    lines.push(`## ${entry.tenantKey ?? 'none'}`, '');
    for (const resource of entry.resources) {
      lines.push(`- ${resource.resourceId}: ${resource.resourceType}, ${resource.status}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

export function renderRuntimeProfileMapMarkdown(registry) {
  const lines = [
    '# Runtime Profile Map',
    '',
    '| Profile | Environment | Resources | Live Export | Runtime Switch | Production Writes |',
    '| --- | --- | ---: | --- | --- | --- |'
  ];
  for (const profile of registry.runtimeProfiles) {
    lines.push(`| ${profile.profileName} | ${profile.environment} | ${profile.resourceIds.length} | ${profile.liveDatabaseExportAllowed} | ${profile.runtimeSwitchAllowed} | ${profile.productionWritesAllowed} |`);
  }
  lines.push('');
  return `${lines.join('\n')}\n`;
}

