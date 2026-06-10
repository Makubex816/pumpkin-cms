import { readJson } from '../utils/json-writer.mjs';
import { resolveFixturePath } from '../utils/safe-paths.mjs';
import { readLocalStore } from '../store/local-store-reader.mjs';
import { buildRenderDecision, renderSchemaVersion } from './render-decision-model.mjs';
import { resolveRenderPolicy } from './render-policy-resolver.mjs';

export async function renderFixture({ fixturePath, storePath, now = new Date() }) {
  const fixture = await readJson(resolveFixturePath(fixturePath));
  const store = await readLocalStore(storePath);
  if (fixture.tenant_id !== store.tenant_id || fixture.site_id !== store.site_id) {
    throw new Error('render fixture scope does not match local store');
  }
  const timestamp = typeof now === 'string' ? now : now.toISOString();
  const linksById = new Map(store.links.map((link) => [link.id, link]));
  const instances = selectInstances({ store, fixture });
  const decisions = instances.map(({ instance, target }) => {
    const link = instance ? linksById.get(instance.outbound_link_id) : null;
    const resolved = resolveRenderPolicy({ store, link, instance, target });
    return buildRenderDecision({
      tenantId: store.tenant_id,
      siteId: store.site_id,
      pageId: target.page_id,
      instance: instance ? { ...instance, anchor_text: target.anchor_text ?? target.anchorText ?? instance.anchor_text } : null,
      link,
      policyStatus: resolved.policyStatus,
      renderAction: resolved.renderAction,
      renderedOutput: resolved.renderedOutput,
      reasonCode: resolved.reasonCode,
      safeRel: resolved.safeRel,
      safeTarget: resolved.safeTarget,
      fallbackUrl: resolved.fallbackUrl
    });
  }).sort(compareDecisions);

  return {
    schemaVersion: renderSchemaVersion,
    fixtureName: fixture.fixtureName ?? 'render-fixture',
    tenant_id: store.tenant_id,
    site_id: store.site_id,
    rendered_at: timestamp,
    render_policy: fixture.render_policy ?? {},
    render_decisions: decisions,
    source: {
      store_manifest: store.manifest,
      fixture_schema_version: fixture.schemaVersion ?? null
    },
    known_link_ids: store.links.map((link) => link.id).sort(),
    known_instance_ids: store.instances.map((instance) => instance.id).sort(),
    summary: buildSummary(decisions)
  };
}

function selectInstances({ store, fixture }) {
  const targets = fixture.render_targets ?? fixture.targets ?? [];
  if (targets.length === 0) {
    return store.instances.map((instance) => ({ instance, target: {} }));
  }
  const selected = [];
  for (const target of targets) {
    const matches = store.instances.filter((instance) => targetMatches({ store, instance, target }));
    if (matches.length === 0) {
      selected.push({ instance: null, target });
      continue;
    }
    for (const instance of matches) {
      selected.push({ instance, target });
    }
  }
  return selected;
}

function targetMatches({ store, instance, target }) {
  const link = store.links.find((item) => item.id === instance.outbound_link_id);
  if (target.instance_id && instance.id !== target.instance_id) {
    return false;
  }
  if (target.location_path && instance.location_path !== target.location_path) {
    return false;
  }
  if (target.page_id && instance.page_id !== target.page_id) {
    return false;
  }
  if (target.link_id && instance.outbound_link_id !== target.link_id) {
    return false;
  }
  if (target.normalized_url && link?.normalized_url !== target.normalized_url) {
    return false;
  }
  if (target.domain && link?.domain !== target.domain.toLowerCase()) {
    return false;
  }
  return true;
}

function buildSummary(decisions) {
  const byAction = {};
  for (const decision of decisions) {
    byAction[decision.render_action] = (byAction[decision.render_action] ?? 0) + 1;
  }
  return {
    decisionCount: decisions.length,
    activeAnchorCount: byAction.active_anchor ?? 0,
    blockedOrDisabledCount: decisions.filter((decision) => decision.render_action !== 'active_anchor').length,
    byAction
  };
}

function compareDecisions(a, b) {
  return [
    String(a.page_id).localeCompare(String(b.page_id)),
    String(a.instance_id).localeCompare(String(b.instance_id)),
    String(a.outbound_link_id).localeCompare(String(b.outbound_link_id)),
    String(a.render_action).localeCompare(String(b.render_action))
  ].find((result) => result !== 0) ?? 0;
}
