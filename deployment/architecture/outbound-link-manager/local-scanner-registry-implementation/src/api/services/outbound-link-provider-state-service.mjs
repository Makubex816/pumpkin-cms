import path from 'node:path';
import { readJson } from '../../utils/json-writer.mjs';
import { resolveTmpOutputPath } from '../../utils/safe-paths.mjs';
import { createErrorEnvelope, createSuccessEnvelope } from '../contracts/response-envelope.mjs';
import { errorCodes } from '../contracts/error-codes.mjs';
import { normalizeActor, normalizeApiQuery } from '../contracts/query-normalizer.mjs';
import { assertLocalRoleAllowed } from '../security/local-role-guard.mjs';

export async function getOutboundLinkProviderState({ executionPath, query = {}, actor = {} }) {
  let providerState = null;
  let readiness = null;
  let normalizedQuery = null;
  try {
    const executionRoot = resolveTmpOutputPath(executionPath);
    providerState = await readJson(path.join(executionRoot, 'provider-state-report.json'));
    readiness = await readJson(path.join(executionRoot, 'staging-readiness-summary.json'));
    normalizedQuery = normalizeApiQuery({
      query,
      defaultTenantKey: providerState.tenantKey,
      defaultSiteKey: providerState.siteKey
    });
    const roleGuard = assertLocalRoleAllowed({
      actor: normalizeActor(actor),
      tenantKey: normalizedQuery.tenantKey,
      siteKey: normalizedQuery.siteKey,
      capability: 'read-provider-state'
    });
    if (!roleGuard.ok) {
      return roleGuard.envelope;
    }
    if (normalizedQuery.tenantKey !== providerState.tenantKey || normalizedQuery.siteKey !== providerState.siteKey) {
      return createErrorEnvelope({
        code: errorCodes.OUTBOUND_LINK_FORBIDDEN_TENANT,
        tenantKey: normalizedQuery.tenantKey,
        siteKey: normalizedQuery.siteKey,
        errors: [{
          code: errorCodes.OUTBOUND_LINK_FORBIDDEN_TENANT,
          message: 'requested scope does not match local staging provider state'
        }],
        meta: providerStateMeta(providerState)
      });
    }
    return createSuccessEnvelope({
      data: {
        providerState,
        readiness
      },
      meta: providerStateMeta(providerState),
      tenantKey: normalizedQuery.tenantKey,
      siteKey: normalizedQuery.siteKey,
      message: 'Outbound link provider state read from local staging-simulated execution evidence.'
    });
  } catch (error) {
    return createErrorEnvelope({
      code: errorCodes.OUTBOUND_LINK_STORE_INVALID,
      tenantKey: normalizedQuery?.tenantKey ?? providerState?.tenantKey ?? query.tenantKey ?? query.tenant ?? null,
      siteKey: normalizedQuery?.siteKey ?? providerState?.siteKey ?? query.siteKey ?? query.site ?? null,
      errors: [{
        code: errorCodes.OUTBOUND_LINK_STORE_INVALID,
        message: error.message
      }],
      meta: {
        mode: 'local-staging-simulated-provider-state',
        localOnly: true,
        externalHttpCrawling: false,
        cmsApiCalls: false,
        cmsWrites: false,
        protectedConfigReads: false,
        liveProviderWrites: false
      }
    });
  }
}

function providerStateMeta(providerState) {
  return {
    mode: 'local-staging-simulated-provider-state',
    providerMode: providerState.providerMode,
    providerProfileId: providerState.providerProfileId,
    stagingExecutionRunId: providerState.stagingExecutionRunId,
    readbackRunId: providerState.readbackRunId,
    localOnly: true,
    stagingSimulatedOnly: true,
    externalHttpCrawling: false,
    cmsApiCalls: false,
    cmsWrites: false,
    protectedConfigReads: false,
    liveProviderWrites: false,
    productionDatabaseMigration: false
  };
}

