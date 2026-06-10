import fs from 'node:fs/promises';
import path from 'node:path';
import { readJson, writeJson } from '../utils/json-writer.mjs';
import { resolveTmpRenderPath } from '../utils/safe-paths.mjs';
import { renderActions, renderReasonCodes } from '../rendering/render-decision-model.mjs';

export async function validateRenderOutput({ renderedPath, writeReport = true }) {
  const outputRoot = resolveTmpRenderPath(renderedPath);
  const failures = [];
  const warnings = [];
  const decisionsEnvelope = await readRequiredJson(outputRoot, 'render-decisions.json', failures);
  const report = await readRequiredJson(outputRoot, 'render-report.json', failures);
  let staticHtml = '';
  try {
    staticHtml = await fs.readFile(path.join(outputRoot, 'static-export.html'), 'utf8');
  } catch (error) {
    failures.push({ code: 'STATIC_EXPORT_MISSING', path: 'static-export.html', message: error.message });
  }
  if (failures.length > 0) {
    return finalize({ outputRoot, failures, warnings, writeReport });
  }

  const decisions = decisionsEnvelope.render_decisions ?? [];
  const knownLinkIds = new Set(report.known_link_ids ?? []);
  const knownInstanceIds = new Set(report.known_instance_ids ?? []);
  for (const decision of decisions) {
    validateDecisionScope(decision, decisionsEnvelope, failures);
    validateDecisionShape(decision, failures);
    if (decision.instance_id && !knownInstanceIds.has(decision.instance_id)) {
      failures.push({ code: 'UNKNOWN_RENDER_INSTANCE', path: `render-decisions.json:${decision.instance_id}`, message: 'render decision references unknown instance' });
    }
    if (decision.outbound_link_id && !knownLinkIds.has(decision.outbound_link_id)) {
      failures.push({ code: 'UNKNOWN_RENDER_LINK', path: `render-decisions.json:${decision.outbound_link_id}`, message: 'render decision references unknown link' });
    }
    if (decision.reason_code === 'unknown_instance') {
      failures.push({ code: 'UNKNOWN_RENDER_INSTANCE', path: `render-decisions.json:${decision.instance_id ?? 'unknown'}`, message: 'render decision could not resolve an instance' });
    }
    if (decision.reason_code === 'unknown_link') {
      failures.push({ code: 'UNKNOWN_RENDER_LINK', path: `render-decisions.json:${decision.outbound_link_id ?? 'unknown'}`, message: 'render decision could not resolve a link' });
    }
    validateSafety(decision, failures);
  }
  if (/<script\b/i.test(staticHtml)) {
    failures.push({ code: 'STATIC_EXPORT_SCRIPT_TAG', path: 'static-export.html', message: 'static export must not contain script tags' });
  }

  return finalize({
    outputRoot,
    failures,
    warnings,
    writeReport,
    decisions,
    report
  });
}

async function readRequiredJson(outputRoot, fileName, failures) {
  try {
    return await readJson(path.join(outputRoot, fileName));
  } catch (error) {
    failures.push({ code: 'RENDER_JSON_MISSING_OR_INVALID', path: fileName, message: error.message });
    return null;
  }
}

function validateDecisionScope(decision, envelope, failures) {
  if (decision.tenant_id !== envelope.tenant_id) {
    failures.push({ code: 'RENDER_TENANT_SCOPE_MISMATCH', path: `render-decisions.json:${decision.instance_id}`, message: 'decision tenant does not match render output tenant' });
  }
  if (decision.site_id !== envelope.site_id) {
    failures.push({ code: 'RENDER_SITE_SCOPE_MISMATCH', path: `render-decisions.json:${decision.instance_id}`, message: 'decision site does not match render output site' });
  }
}

function validateDecisionShape(decision, failures) {
  for (const field of ['tenant_id', 'site_id', 'render_action', 'rendered_output', 'reason_code']) {
    if (decision[field] === undefined || decision[field] === null) {
      failures.push({ code: 'RENDER_DECISION_FIELD_MISSING', path: `render-decisions.json:${field}`, message: `${field} is required` });
    }
  }
  if (!renderActions.has(decision.render_action)) {
    failures.push({ code: 'RENDER_ACTION_INVALID', path: `render-decisions.json:${decision.instance_id}`, message: `invalid render action ${decision.render_action}` });
  }
  if (!renderReasonCodes.has(decision.reason_code)) {
    failures.push({ code: 'RENDER_REASON_INVALID', path: `render-decisions.json:${decision.instance_id}`, message: `invalid reason code ${decision.reason_code}` });
  }
}

function validateSafety(decision, failures) {
  const output = decision.rendered_output ?? '';
  const activeLike = decision.render_action === 'active_anchor';
  if (activeLike) {
    if (!/\bnoopener\b/.test(decision.safe_rel ?? '') || !/\bnoreferrer\b/.test(decision.safe_rel ?? '')) {
      failures.push({ code: 'ACTIVE_ANCHOR_UNSAFE_REL', path: `render-decisions.json:${decision.instance_id}`, message: 'active anchor must include noopener noreferrer' });
    }
    if (!/^<a\b/i.test(output)) {
      failures.push({ code: 'ACTIVE_ANCHOR_MARKUP_MISSING', path: `render-decisions.json:${decision.instance_id}`, message: 'active anchor action must emit anchor markup' });
    }
  }
  if (decision.render_action === 'fallback_anchor' && !/\bnoopener\b/.test(decision.safe_rel ?? '')) {
    failures.push({ code: 'FALLBACK_ANCHOR_UNSAFE_REL', path: `render-decisions.json:${decision.instance_id}`, message: 'fallback anchor must include safe rel' });
  }
  if (decision.link_status === 'disabled' && activeLike) {
    failures.push({ code: 'DISABLED_LINK_RENDERED_ACTIVE', path: `render-decisions.json:${decision.instance_id}`, message: 'disabled global link cannot render active anchor' });
  }
  if (['disabled', 'hidden', 'plain_text', 'pending_review', 'stale'].includes(decision.instance_status) && activeLike) {
    failures.push({ code: 'DISABLED_INSTANCE_RENDERED_ACTIVE', path: `render-decisions.json:${decision.instance_id}`, message: 'disabled or controlled instance cannot render active anchor' });
  }
  if (decision.policy_status === 'domain_blocked' && activeLike) {
    failures.push({ code: 'DOMAIN_BLOCKED_RENDERED_ACTIVE', path: `render-decisions.json:${decision.instance_id}`, message: 'domain-blocked link cannot render active anchor' });
  }
  if (decision.policy_status === 'pending_review' && activeLike) {
    failures.push({ code: 'PENDING_REVIEW_RENDERED_ACTIVE', path: `render-decisions.json:${decision.instance_id}`, message: 'pending-review link cannot render active anchor by default' });
  }
  if (decision.render_action === 'hidden' && /<a\b/i.test(output)) {
    failures.push({ code: 'HIDDEN_RENDERED_ANCHOR', path: `render-decisions.json:${decision.instance_id}`, message: 'hidden mode cannot output active link markup' });
  }
  if (['plain_text', 'pending_review_plain_text', 'domain_blocked_plain_text'].includes(decision.render_action) && /<a\b/i.test(output)) {
    failures.push({ code: 'PLAIN_TEXT_RENDERED_ANCHOR', path: `render-decisions.json:${decision.instance_id}`, message: 'plain text mode cannot output anchor markup' });
  }
  if (decision.render_action === 'fallback_anchor' && (!decision.fallback_url || !output.includes(decision.fallback_url))) {
    failures.push({ code: 'FALLBACK_URL_NOT_RENDERED', path: `render-decisions.json:${decision.instance_id}`, message: 'fallback mode must render configured fallback URL' });
  }
}

async function finalize({
  outputRoot,
  failures,
  warnings,
  writeReport,
  decisions = [],
  report = null
}) {
  const result = {
    schemaVersion: '0.3.0',
    validator: 'pumpkin-outbound-link-render-output-validator',
    status: failures.length === 0 ? 'passed' : 'failed',
    summary: {
      decisionCount: decisions.length,
      activeAnchorCount: decisions.filter((decision) => decision.render_action === 'active_anchor').length,
      blockedOrDisabledCount: decisions.filter((decision) => decision.render_action !== 'active_anchor').length,
      reportDecisionCount: report?.summary?.decisionCount ?? null,
      warningCount: warnings.length,
      failureCount: failures.length
    },
    warnings,
    failures,
    boundaries: {
      outputUnderTmp: true,
      productionRendererIntegration: false,
      externalHttpCrawling: false,
      liveHttpChecks: false,
      cmsApiCalls: false,
      cmsWrites: false
    }
  };
  if (writeReport) {
    await writeJson(path.join(outputRoot, 'VALIDATION_RESULT.json'), result);
    await fs.writeFile(path.join(outputRoot, 'VALIDATION_RESULT.md'), renderValidationMarkdown(result), 'utf8');
  }
  return result;
}

function renderValidationMarkdown(result) {
  return `# Render Validation Result

Status: ${result.status}

| Metric | Count |
| --- | ---: |
| Decisions | ${result.summary.decisionCount} |
| Active anchors | ${result.summary.activeAnchorCount} |
| Blocked or disabled decisions | ${result.summary.blockedOrDisabledCount} |
| Failures | ${result.summary.failureCount} |

Boundary: local/offline render validation only. No production renderer integration or live checks.
`;
}
