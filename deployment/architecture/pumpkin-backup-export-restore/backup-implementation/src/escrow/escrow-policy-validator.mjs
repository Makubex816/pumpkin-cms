import { hasSecretLikeValue } from '../validators/backup-validator.mjs';

const blockedCategoryNames = new Set([
  'short_lived_' + 'token',
  'session_' + 'cookie',
  'j' + 'wt'
]);

export function validateEscrowPolicyInputs({ request, policy, catalog, recipient, selectedItems }) {
  const failures = [];

  if (request.fakeOnly !== true || policy.fakeOnly !== true || catalog.fakeOnly !== true || recipient.fakeOnly !== true) {
    addFailure(failures, 'ESCROW_FAKE_ONLY_REQUIRED', 'fixtures', 'escrow prototype inputs must be fake-only');
  }
  if (request.mode !== 'recovery_escrow' || policy.mode !== 'recovery_escrow') {
    addFailure(failures, 'ESCROW_MODE_INVALID', 'fixtures/fake-escrow-request.json', 'escrow mode must be recovery_escrow');
  }
  if (policy.standardBackupsIncludeEscrow !== false) {
    addFailure(failures, 'ESCROW_STANDARD_BACKUP_POLICY_INVALID', 'fixtures/fake-escrow-policy.json', 'standard backups must continue to exclude escrow');
  }
  if (!request.reason || typeof request.reason !== 'string') {
    addFailure(failures, 'ESCROW_REASON_REQUIRED', 'fixtures/fake-escrow-request.json', 'escrow request reason is required');
  }
  if (!request.approval || !request.approval.approvalId || !request.approval.approvedBy || !request.approval.approvedAt) {
    addFailure(failures, 'ESCROW_APPROVAL_REQUIRED', 'fixtures/fake-escrow-request.json', 'fake approval record is required');
  }
  if (!recipient.recipientId || recipient.privateKeyPersistence !== 'not-written') {
    addFailure(failures, 'ESCROW_RECIPIENT_INVALID', 'fixtures/fake-escrow-recipient.json', 'recipient metadata must exist and private-key material must not be written');
  }
  if (!Array.isArray(selectedItems) || selectedItems.length === 0) {
    addFailure(failures, 'ESCROW_SELECTED_ITEMS_REQUIRED', 'fixtures/fake-secret-catalog.json', 'at least one fake catalog item must be selected');
  }

  const allowedCategories = new Set(policy.allowedCategories ?? []);
  for (const item of selectedItems ?? []) {
    const itemPath = `catalog:${item.itemId ?? 'unknown'}`;
    if (!item.escrowEligible) {
      addFailure(failures, 'ESCROW_ITEM_NOT_ELIGIBLE', itemPath, 'selected item is not escrow eligible');
    }
    if (!allowedCategories.has(item.category)) {
      addFailure(failures, 'ESCROW_CATEGORY_NOT_ALLOWED', itemPath, 'selected item category is not allowlisted');
    }
    if (blockedCategoryNames.has(item.category)) {
      addFailure(failures, 'ESCROW_CATEGORY_BLOCKED', itemPath, 'short-lived token, JWT, and session-cookie categories are blocked');
    }
    if (typeof item.fakeValue !== 'string' || item.fakeValue.length === 0) {
      addFailure(failures, 'ESCROW_FAKE_VALUE_REQUIRED', itemPath, 'fake value is required for fake-only encryption test');
    } else if (hasSecretLikeValue(item.fakeValue) || hasSecretLikeValue(`value="${item.fakeValue}"`)) {
      addFailure(failures, 'ESCROW_VALUE_LOOKS_REAL', itemPath, 'fake value matched a high-risk detector');
    }
  }

  return {
    status: failures.length === 0 ? 'passed' : 'failed',
    failures
  };
}

function addFailure(failures, code, path, message) {
  failures.push({ code, path, message });
}
