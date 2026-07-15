import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const fixture = JSON.parse(await readFile(new URL('../preview-fixtures/strip-club-near-me-vegas/preview.json', import.meta.url)));
const route = await readFile(new URL('../src/app/api/forms/submit/[type]/route.ts', import.meta.url), 'utf8');
const adapter = await readFile(new URL('../src/components/PreviewBehaviorAdapter.tsx', import.meta.url), 'utf8');
const preflight = await readFile(new URL('../src/app/api/forms/preflight/[type]/route.ts', import.meta.url), 'utf8');
const definitions = new Map(fixture.forms.definitions.map((definition) => [definition.formKey, definition]));

assert.equal(definitions.size, 32);
assert.equal(fixture.forms.instances.length, 65);
assert.equal(fixture.forms.instances.filter((instance) => !definitions.has(instance.normalizedFormKey)).length, 0);
assert.equal(fixture.forms.instances.filter((instance) => instance.normalizedFormKey === 'strip-club-near-me-vegas-fidelity-15').length, 9);
assert.match(route, /upstreamController\.abort\(\), 15_000/);
assert.match(route, /Idempotency-Key/);
assert.match(route, /X-Pumpkin-Submission-Id/);
assert.match(route, /X-Correlation-Id/);
assert.match(route, /retryable: false/);
assert.match(route, /persistenceCompleted/);
assert.match(adapter, /requestController\.abort\(\), 25_000/);
assert.match(adapter, /form\.dataset\.pumpkinSubmissionId/);
assert.doesNotMatch(route, /retry\s*\(/i);
assert.match(preflight, /createsFormEntry: false/);
assert.match(preflight, /\/preflight\//);
assert.match(preflight, /upstreamTimeout|upstream_timeout/);
assert.match(preflight, /Promise\.race/);
assert.match(route, /Promise\.race/);

console.log(JSON.stringify({ definitions: definitions.size, instances: fixture.forms.instances.length, fidelity15Instances: 9, upstreamTimeoutMs: 15000, browserTimeoutMs: 25000, automaticRetry: false }));
