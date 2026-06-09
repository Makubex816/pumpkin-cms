import path from 'node:path';
import { buildProviderConnectorReadiness, buildProviderMetadataResponse, validateProviderMetadata } from './provider-discovery-model.mjs';
import { readJson } from '../utils/json-writer.mjs';
import { resolveFixturePath } from '../utils/safe-paths.mjs';

export class ProviderSourceResolver {
  async resolve() {
    throw new Error('ProviderSourceResolver implementations must define resolve()');
  }
}

export class FakeProviderSourceResolver extends ProviderSourceResolver {
  constructor({ fixturePath }) {
    super();
    this.fixturePath = fixturePath;
  }

  async resolve({ tenantKey = null, siteKey = null, environment = null, profile = null } = {}) {
    const raw = await readJson(resolveFixturePath(this.fixturePath));
    const candidate = {
      ...raw,
      tenantKey: raw.tenantKey ?? tenantKey,
      siteKey: raw.siteKey ?? siteKey ?? raw.tenantKey ?? tenantKey,
      environment: raw.environment ?? environment,
      profile: raw.profile ?? profile ?? 'fixture'
    };
    const metadata = buildProviderMetadataResponse(candidate);
    return {
      fixturePath: this.fixturePath,
      metadata,
      readiness: buildProviderConnectorReadiness(metadata),
      validation: validateProviderMetadata(candidate)
    };
  }
}

export async function resolveProviderSourceFromFixture({ fixturePath, tenantKey, siteKey, environment, profile }) {
  const resolver = new FakeProviderSourceResolver({ fixturePath });
  return resolver.resolve({ tenantKey, siteKey, environment, profile });
}

export function fixtureNameForProviderState(state) {
  const fixtures = {
    configuredCosmos: 'fixtures/provider-source.cosmos.configured.json',
    iceMissing: 'fixtures/provider-source.ice.missing.json',
    iceFutureTargetCosmos: 'fixtures/provider-source.ice.future-target-cosmos.json',
    localProvider: 'fixtures/provider-source.local-provider.json'
  };
  if (!fixtures[state]) {
    throw new Error(`unknown provider source fixture state: ${state}`);
  }
  return fixtures[state];
}

export function providerSourceReportName(fixturePath) {
  return path.basename(fixturePath).replace(/\.json$/i, '');
}
