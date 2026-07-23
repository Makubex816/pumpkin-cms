import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const files = {
  page: new URL('../src/app/dashboard/publications/page.tsx', import.meta.url),
  component: new URL('../src/components/publications/PublicationCenter.tsx', import.meta.url),
  client: new URL('../src/lib/publication-product/client.ts', import.meta.url),
  flags: new URL('../src/lib/publication-product/feature-flags.ts', import.meta.url),
  types: new URL('../src/lib/publication-product/types.ts', import.meta.url),
  nextConfig: new URL('../next.config.js', import.meta.url),
  onboardingEvidence: new URL('../src/lib/onboarding-workflows.ts', import.meta.url),
  apiContract: new URL(
    '../../pumpkin-api/Services/Publications/PublicationProductContracts.cs',
    import.meta.url,
  ),
}

const source = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([name, url]) => [name, await readFile(url, 'utf8')]),
  ),
)

assert.match(source.page, /PublicationCenter/)
assert.match(source.flags, /NEXT_PUBLIC_PUBLICATION_PRODUCT_UI_ENABLED/)
assert.match(source.flags, /NEXT_PUBLIC_PUBLICATION_CUSTOMER_EXECUTION_ENABLED/)
assert.match(source.component, /TenantAdmin own-tenant/)
assert.match(source.component, /SuperAdmin inventory/)
assert.match(source.component, /typed confirmation/i)
assert.match(source.component, /Customer execution is disabled/)
assert.match(source.component, /Credential-reference metadata/)
assert.match(source.client, /assertResponseContainsNoSecretValues/)
assert.match(source.client, /protected field/)
assert.match(source.client, /\/api\/admin\/publication-products\/center/)
assert.match(source.client, /rollbackArtifactId/)
assert.doesNotMatch(source.client, /publication-product\/.*\/actions/)
assert.match(source.nextConfig, /generateBuildId/)
assert.match(source.nextConfig, /PUMPKIN_BUILD_ID/)
assert.match(source.onboardingEvidence, /AIRSTRIP_OPERATOR_EVIDENCE/)
assert.doesNotMatch(source.onboardingEvidence, /[A-Za-z]:\\\\Users\\\\/)
assert.match(source.component, /artifact\.publicationId === tenant\.publicationId/)
assert.match(source.component, /release\.publicationId === tenant\.publicationId/)
assert.match(source.component, /item\.publicationId === tenant\.publicationId/)
assert.match(source.component, /Select an accepted artifact and release/)
assert.match(source.component, /artifact\.artifactId === selectedArtifactId/)
assert.match(source.types, /TenantPublicationArtifactSummary/)
for (const field of [
  'artifactId',
  'rollbackArtifactId',
  'releaseId',
  'rollbackReleaseId',
  'idempotencyKey',
  'expectedRevision',
]) {
  assert.match(source.apiContract, new RegExp(`JsonPropertyName\\(\"${field}\"\\)`))
  assert.match(source.client, new RegExp(field))
}

for (const value of [
  'STATIC_PUBLISHED_SITE',
  'DYNAMIC_SCALE_TO_ZERO_FRONTEND',
  'SHARED_RUNTIME_COMPATIBILITY',
  'SUPERSEDED',
  'ROLLED_BACK',
]) {
  assert.match(source.types, new RegExp(value))
}

console.log('PUB-30-A01 publication UI source checks passed.')
