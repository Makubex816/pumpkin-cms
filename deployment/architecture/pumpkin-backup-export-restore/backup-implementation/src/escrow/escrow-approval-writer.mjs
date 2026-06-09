import path from 'node:path';
import { writeJson } from '../utils/json-writer.mjs';

export async function writeEscrowApprovalRecord({ outputRoot, request, createdAt }) {
  const approvalRecord = {
    schemaVersion: '0.1.0',
    fakeOnly: true,
    requestId: request.requestId,
    approvalId: request.approval.approvalId,
    approvedBy: request.approval.approvedBy,
    approvedAt: request.approval.approvedAt,
    approvalScope: request.approval.approvalScope,
    reason: request.reason,
    createdAt,
    realSecretsApproved: false,
    protectedConfigApproved: false,
    productionEscrowApproved: false
  };
  await writeJson(path.join(outputRoot, 'escrow-approval-record.json'), approvalRecord);
  return approvalRecord;
}
