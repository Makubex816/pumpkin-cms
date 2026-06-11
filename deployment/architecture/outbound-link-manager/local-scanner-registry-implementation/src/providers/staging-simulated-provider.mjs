import { StagingProviderInterface } from './staging-provider-interface.mjs';
import { evaluateNoLiveWriteGate } from './no-live-write-gate.mjs';
import { mapMigrationToApplyPlanRecords } from '../apply-plan/apply-plan-record-mapper.mjs';

export class StagingSimulatedProvider extends StagingProviderInterface {
  checkCapabilities() {
    const gate = evaluateNoLiveWriteGate({ profile: this.profile, operation: 'apply-plan-dry-run' });
    return {
      schemaVersion: '0.1.0',
      providerProfileId: this.profile.providerProfileId,
      providerMode: this.profile.providerMode,
      gate,
      capabilities: this.profile.capabilities,
      liveWriteAllowed: false,
      productionWriteAllowed: false
    };
  }

  planApply({ migration }) {
    const capabilityReport = this.checkCapabilities();
    if (!capabilityReport.gate.allowed) {
      return {
        status: 'blocked',
        capabilityReport,
        records: [],
        blockReason: capabilityReport.gate.message
      };
    }
    return {
      status: 'planned',
      capabilityReport,
      records: mapMigrationToApplyPlanRecords({ migration, profile: this.profile }),
      blockReason: null
    };
  }
}
