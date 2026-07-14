export interface TenantRuntimeConfig {
  tenantId: string;
  apiUrl: string;
  apiKey: string;
  apiKeySettingName: string;
  source: 'tenant-scoped' | 'legacy-global';
}

const SAFE_TENANT_ID = /^[a-z0-9][a-z0-9-]{1,80}$/;

export function getTenantApiKeySettingName(tenantId: string) {
  const normalized = tenantId.trim().toLowerCase();
  if (!SAFE_TENANT_ID.test(normalized)) return null;
  return `PUMPKIN_TENANT_API_KEY__${normalized.replace(/-/g, '_').toUpperCase()}`;
}

export function resolveTenantRuntimeConfig(
  tenantId: string,
  environment: Record<string, string | undefined>,
  registeredTenantIds: readonly string[],
): TenantRuntimeConfig | null {
  const normalizedTenantId = tenantId.trim().toLowerCase();
  if (!SAFE_TENANT_ID.test(normalizedTenantId) || !registeredTenantIds.includes(normalizedTenantId)) {
    return null;
  }

  const apiUrl = (environment.PUMPKIN_API_URL || environment.NEXT_PUBLIC_PUMPKIN_API_URL || '')
    .trim()
    .replace(/\/+$/, '');
  if (!apiUrl) return null;

  const scopedSettingName = getTenantApiKeySettingName(normalizedTenantId);
  const scopedApiKey = scopedSettingName ? environment[scopedSettingName]?.trim() : '';
  if (scopedSettingName && scopedApiKey) {
    return {
      tenantId: normalizedTenantId,
      apiUrl,
      apiKey: scopedApiKey,
      apiKeySettingName: scopedSettingName,
      source: 'tenant-scoped',
    };
  }

  const legacyTenantId = environment.PUMPKIN_TENANT_ID?.trim().toLowerCase();
  const legacyApiKey = environment.PUMPKIN_API_KEY?.trim();
  if (legacyTenantId === normalizedTenantId && legacyApiKey) {
    return {
      tenantId: normalizedTenantId,
      apiUrl,
      apiKey: legacyApiKey,
      apiKeySettingName: 'PUMPKIN_API_KEY',
      source: 'legacy-global',
    };
  }

  return null;
}
