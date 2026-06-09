import { readJson } from '../utils/json-writer.mjs';
import { resolveFixturePath } from '../utils/safe-paths.mjs';

export async function loadFakeEscrowRequest(requestPath) {
  const request = await readJson(resolveFixturePath(requestPath));
  const policy = await readJson(resolveFixturePath(request.policyRef));
  const catalog = await readJson(resolveFixturePath(request.catalogRef));
  const recipient = await readJson(resolveFixturePath(request.recipientRef));
  return { request, policy, catalog, recipient };
}

export function selectFakeCatalogItems({ request, catalog }) {
  const selected = new Set(request.selectedItemIds ?? []);
  return (catalog.items ?? []).filter((item) => selected.has(item.itemId));
}

export function buildFakePayload({ request, selectedItems }) {
  return {
    schemaVersion: '0.1.0',
    fakeOnly: true,
    requestId: request.requestId,
    createdBy: 'local-prototype',
    itemCount: selectedItems.length,
    items: selectedItems.map((item) => ({
      itemId: item.itemId,
      label: item.label,
      category: item.category,
      fakeValue: item.fakeValue
    }))
  };
}
