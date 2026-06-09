export const sessionEnvContractVersion = '0.1.0';

export const sessionEnvSpecs = Object.freeze([
  {
    name: 'PUMPKIN_API_URL',
    category: 'non-secret-url',
    registryField: 'apiUrl',
    includeInRegistry: true,
    escrowEligible: false,
    durable: false
  },
  {
    name: 'PUMPKIN_ADMIN_JWT',
    category: 'session-token',
    includeInRegistry: false,
    escrowEligible: false,
    durable: false,
    excludedReason: 'session token excluded from durable escrow by default'
  },
  {
    name: 'ROLLER_RINK_RENTALS_API_KEY',
    category: 'durable-api-key',
    includeInRegistry: false,
    escrowEligible: true,
    durable: true
  },
  {
    name: 'ROLLER_RINK_RENTALS_TENANT_ID',
    category: 'non-secret-tenant-id',
    registryField: 'tenantId',
    includeInRegistry: true,
    escrowEligible: false,
    durable: false
  },
  {
    name: 'PUMPKIN_HANDOFF_VAULT_PASSPHRASE',
    category: 'vault-passphrase',
    includeInRegistry: false,
    escrowEligible: false,
    durable: false,
    excludedReason: 'encryption passphrase is never stored'
  }
]);

export function collectSessionEnvPresence(env = process.env) {
  return {
    schemaVersion: sessionEnvContractVersion,
    valuesIncluded: false,
    variables: sessionEnvSpecs.map((spec) => ({
      name: spec.name,
      presence: env[spec.name] ? 'PRESENT' : 'MISSING',
      category: spec.category,
      escrowEligible: spec.escrowEligible === true,
      durable: spec.durable === true,
      valueIncluded: false,
      excludedReason: spec.excludedReason ?? null
    }))
  };
}

export function collectRegistrySessionMetadata(env = process.env) {
  return {
    valuesIncluded: false,
    pumpkinApiUrl: env.PUMPKIN_API_URL ? env.PUMPKIN_API_URL : null,
    pumpkinApiUrlPresence: env.PUMPKIN_API_URL ? 'PRESENT' : 'MISSING',
    rollerTenantId: env.ROLLER_RINK_RENTALS_TENANT_ID ? env.ROLLER_RINK_RENTALS_TENANT_ID : null,
    rollerTenantIdPresence: env.ROLLER_RINK_RENTALS_TENANT_ID ? 'PRESENT' : 'MISSING',
    adminJwtPresence: env.PUMPKIN_ADMIN_JWT ? 'PRESENT' : 'MISSING',
    rollerApiKeyPresence: env.ROLLER_RINK_RENTALS_API_KEY ? 'PRESENT' : 'MISSING',
    vaultPassphrasePresence: env.PUMPKIN_HANDOFF_VAULT_PASSPHRASE ? 'PRESENT' : 'MISSING'
  };
}

export function collectSessionVaultInputs(env = process.env) {
  const passphrase = env.PUMPKIN_HANDOFF_VAULT_PASSPHRASE ?? null;
  const eligibleItems = [];
  const excludedItems = [];

  if (env.ROLLER_RINK_RENTALS_API_KEY) {
    eligibleItems.push({
      credentialRefId: 'credential-roller-rink-rentals-api-key',
      envName: 'ROLLER_RINK_RENTALS_API_KEY',
      category: 'durable-api-key',
      value: env.ROLLER_RINK_RENTALS_API_KEY
    });
  }

  excludedItems.push({
    credentialRefId: 'credential-pumpkin-admin-jwt-session',
    envName: 'PUMPKIN_ADMIN_JWT',
    category: 'session-token',
    presence: env.PUMPKIN_ADMIN_JWT ? 'PRESENT' : 'MISSING',
    excludedReason: 'session token excluded from durable escrow by default',
    valueIncluded: false
  });

  return {
    passphrase,
    passphrasePresent: Boolean(passphrase),
    eligibleItems,
    excludedItems,
    nonSecretMetadata: collectRegistrySessionMetadata(env)
  };
}

