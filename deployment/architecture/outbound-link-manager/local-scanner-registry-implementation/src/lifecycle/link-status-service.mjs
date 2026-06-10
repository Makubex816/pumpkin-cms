import { appendAuditLog } from '../audit/audit-log-writer.mjs';
import { linkStatuses } from '../store/store-files.mjs';
import { cloneStore, readLocalStore } from '../store/local-store-reader.mjs';
import { writeLocalStore } from '../store/local-store-writer.mjs';

export async function setLinkStatus({
  storePath,
  outputPath,
  status,
  reason = null,
  linkId = null,
  linkDomain = null,
  normalizedUrl = null,
  overwrite = false,
  now = new Date()
}) {
  if (!linkStatuses.has(status)) {
    throw new Error(`unknown link status: ${status}`);
  }
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const store = cloneStore(await readLocalStore(storePath));
  const link = selectLink(store.links, { linkId, linkDomain, normalizedUrl });
  const before = {
    status: link.status,
    disabled_at: link.disabled_at ?? null,
    disabled_reason: link.disabled_reason ?? null
  };
  const afterLink = {
    ...link,
    status,
    status_source: 'local-lifecycle',
    updated_at: timestamp,
    lifecycle_reason: reason
  };
  if (status === 'disabled') {
    afterLink.disabled_at = timestamp;
    afterLink.disabled_by = 'local-cli';
    afterLink.disabled_reason = reason;
  } else if (link.status === 'disabled') {
    afterLink.disabled_at = null;
    afterLink.disabled_by = null;
    afterLink.disabled_reason = null;
  }

  const links = store.links.map((item) => item.id === link.id ? afterLink : item);
  let nextStore = {
    ...store,
    links
  };
  nextStore = appendAuditLog(nextStore, {
    action: 'link_status_changed',
    recordType: 'outbound_link',
    recordId: link.id,
    actor: 'local-cli',
    reason,
    before,
    after: {
      status: afterLink.status,
      disabled_at: afterLink.disabled_at ?? null,
      disabled_reason: afterLink.disabled_reason ?? null
    },
    now: timestamp
  });

  const outputRoot = await writeLocalStore({
    store: nextStore,
    outputPath,
    overwrite,
    now: timestamp
  });

  return {
    outputRoot,
    link: afterLink,
    auditLogCount: nextStore.auditLogs.length
  };
}

function selectLink(links, { linkId, linkDomain, normalizedUrl }) {
  const matches = links.filter((link) => {
    if (linkId) {
      return link.id === linkId;
    }
    if (normalizedUrl) {
      return link.normalized_url === normalizedUrl;
    }
    if (linkDomain) {
      return link.domain === linkDomain.toLowerCase();
    }
    return false;
  });
  if (matches.length === 0) {
    throw new Error('no matching outbound link found');
  }
  if (matches.length > 1) {
    throw new Error('link selector matched multiple records; use --link-id or --normalized-url');
  }
  return matches[0];
}
