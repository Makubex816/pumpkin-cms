import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeProviderBoundaryReport({ outputRoot, profile, capabilityReport }) {
  const report = {
    schemaVersion: '0.1.0',
    reportType: 'pumpkin-outbound-link-provider-boundary-report',
    providerProfileId: profile.providerProfileId,
    providerMode: profile.providerMode,
    capabilityStatus: capabilityReport.status ?? capabilityReport.gate?.status ?? 'unknown',
    liveWriteAllowed: false,
    productionWriteAllowed: false,
    boundaries: {
      localOnly: profile.boundaries.localOnly,
      simulatedOnly: profile.boundaries.simulatedOnly,
      dryRunOnly: profile.boundaries.dryRunOnly,
      liveProviderWrites: false,
      productionWrites: false,
      cmsWrites: false,
      protectedConfigReads: false,
      externalCrawling: false,
      azureMutations: false,
      deployment: false,
      searchConsoleIndexing: false,
      livePagePublication: false
    }
  };
  await writeJson(path.join(outputRoot, 'provider-boundary-report.json'), report);
  return report;
}
