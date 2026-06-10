import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';
import { localBoundaries } from './publishing-impact-analyzer.mjs';

export function createRollbackPlan({ request, changes = [], impact = null, blocked = false }) {
  return {
    schemaVersion: '0.1.0',
    rollbackType: 'pumpkin-outbound-link-local-action-rollback-plan',
    action: request.action,
    tenantKey: request.tenantKey,
    siteKey: request.siteKey,
    operationId: request.operationId,
    requestId: request.requestId,
    generatedAt: request.now,
    blocked,
    executableAgainstLiveSystems: false,
    rollbackExecutionImplemented: false,
    changes: changes.map((change) => ({
      recordType: change.recordType,
      recordId: change.recordId,
      previousValue: change.previousValue ?? null,
      newValue: change.newValue ?? null
    })),
    summary: {
      changeCount: changes.length,
      affectedLinkCount: impact?.summary?.affectedLinkCount ?? 0,
      affectedInstanceCount: impact?.summary?.affectedInstanceCount ?? 0,
      affectedPageCount: impact?.summary?.affectedPageCount ?? 0
    },
    boundaries: localBoundaries()
  };
}

export async function writeRollbackPlan({ outputRoot, rollbackPlan }) {
  await writeJson(path.join(outputRoot, 'ROLLBACK_PLAN.json'), rollbackPlan);
  await writeJson(path.join(outputRoot, 'ROLLBACK_PLAN_SUMMARY.json'), {
    operationId: rollbackPlan.operationId,
    action: rollbackPlan.action,
    changeCount: rollbackPlan.summary.changeCount,
    liveExecutionImplemented: false
  });
}
