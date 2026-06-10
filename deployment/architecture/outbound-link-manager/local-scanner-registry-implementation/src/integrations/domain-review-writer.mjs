import fs from 'node:fs/promises';
import { getActivePolicy } from '../policies/policy-applier.mjs';
import { summarizeDomains } from './integration-common.mjs';

export async function writeDomainReviewReport({ filePath, store, title = 'External Domain Review' }) {
  const activePolicy = getActivePolicy(store);
  const domains = summarizeDomains({ store, activePolicy });
  await fs.writeFile(filePath, renderDomainReviewMarkdown({ title, domains, activePolicy }), 'utf8');
  return { domains };
}

export function renderDomainReviewMarkdown({ title = 'External Domain Review', domains, activePolicy = null }) {
  const rows = (domains ?? []).map((domain) => `| ${domain.domain} | ${domain.status} | ${domain.link_count} | ${domain.statuses.join(', ')} |`).join('\n');
  return `# ${title}

Active policy: ${activePolicy?.id ?? 'none'}

| Domain | Review status | Links | Link statuses |
| --- | --- | ---: | --- |
${rows || '| none | none | 0 | none |'}

This report is generated from local fixture/store data only. It does not crawl domains or perform live HTTP checks.
`;
}
