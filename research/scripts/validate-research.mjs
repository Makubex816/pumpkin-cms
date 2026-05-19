import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..', '..');
const researchRoot = path.join(repoRoot, 'research');
const schemasRoot = path.join(researchRoot, 'schemas');

const pagePublishThreshold = 20;

const schemaByType = new Map([
  ['partner', 'partner.schema.json'],
  ['provider', 'provider.schema.json'],
  ['stateResearch', 'state-research.schema.json'],
  ['pageRecommendation', 'page-recommendation.schema.json'],
  ['leadRouting', 'lead-routing.schema.json']
]);

const results = {
  filesChecked: 0,
  errors: [],
  warnings: []
};

function relative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll(path.sep, '/');
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    results.errors.push({
      file: relative(filePath),
      message: `Invalid JSON: ${error.message}`
    });
    return null;
  }
}

function walkJsonFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  const files = [];
  for (const entry of readdirSync(directory)) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walkJsonFiles(fullPath));
      continue;
    }

    if (entry.endsWith('.json')) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => relative(a).localeCompare(relative(b)));
}

function addError(filePath, message) {
  results.errors.push({ file: relative(filePath), message });
}

function addWarning(filePath, message) {
  results.warnings.push({ file: relative(filePath), message });
}

function typeMatches(value, expectedType) {
  switch (expectedType) {
    case 'array':
      return Array.isArray(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'integer':
      return Number.isInteger(value);
    case 'null':
      return value === null;
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'object':
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    default:
      return true;
  }
}

function describeValue(value) {
  if (Array.isArray(value)) {
    return 'array';
  }

  if (value === null) {
    return 'null';
  }

  return typeof value;
}

function validateSchemaValue(value, schema, pointer, filePath) {
  if (!schema || typeof schema !== 'object') {
    return;
  }

  if (schema.const !== undefined && value !== schema.const) {
    addError(filePath, `${pointer} must equal ${JSON.stringify(schema.const)}.`);
    return;
  }

  if (Array.isArray(schema.enum) && !schema.enum.includes(value)) {
    addError(filePath, `${pointer} must be one of: ${schema.enum.join(', ')}.`);
    return;
  }

  if (schema.type !== undefined) {
    const expectedTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const hasMatch = expectedTypes.some((expectedType) => typeMatches(value, expectedType));

    if (!hasMatch) {
      addError(filePath, `${pointer} expected ${expectedTypes.join(' or ')}, found ${describeValue(value)}.`);
      return;
    }
  }

  if (typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      addError(filePath, `${pointer} must be at least ${schema.minLength} characters.`);
    }

    if (typeof schema.maxLength === 'number' && value.length > schema.maxLength) {
      addError(filePath, `${pointer} must be at most ${schema.maxLength} characters.`);
    }
  }

  if (typeof value === 'number') {
    if (typeof schema.minimum === 'number' && value < schema.minimum) {
      addError(filePath, `${pointer} must be >= ${schema.minimum}.`);
    }

    if (typeof schema.maximum === 'number' && value > schema.maximum) {
      addError(filePath, `${pointer} must be <= ${schema.maximum}.`);
    }
  }

  if (Array.isArray(value) && schema.items) {
    value.forEach((item, index) => {
      validateSchemaValue(item, schema.items, `${pointer}[${index}]`, filePath);
    });
  }

  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    const properties = schema.properties ?? {};

    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          addError(filePath, `${pointer}.${key} is required.`);
        }
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          addError(filePath, `${pointer}.${key} is not allowed by the schema.`);
        }
      }
    }

    for (const [key, propertySchema] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateSchemaValue(value[key], propertySchema, `${pointer}.${key}`, filePath);
      }
    }
  }
}

function sumValues(values) {
  return values.reduce((total, value) => total + (typeof value === 'number' ? value : 0), 0);
}

function isTemplateLike(record) {
  return record.recordStatus === 'template' || record.recordStatus === 'example';
}

function hasUsefulText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function checkPlaceholderSafety(record, filePath) {
  if (isTemplateLike(record)) {
    return;
  }

  const serialized = JSON.stringify(record);
  const placeholderPattern = /\b(template|placeholder|fake|sample|tbd)\b|example\.com/i;
  if (placeholderPattern.test(serialized)) {
    addWarning(filePath, 'Record contains placeholder-looking text but is not marked template/example.');
  }
}

function validateProviderRules(record, filePath) {
  const breakdown = record.scoreBreakdown ?? {};
  const score = sumValues([
    breakdown.portableRinkService,
    breakdown.stateRegionService,
    breakdown.nearbyLocationPresence,
    breakdown.eventRentalRelevance,
    breakdown.websiteClarityProof,
    breakdown.commercialEventCapacity,
    breakdown.responseContactQuality,
    breakdown.reviewReputationSignals,
    breakdown.leadRoutingFit
  ]);

  if (typeof record.totalScore === 'number' && record.totalScore !== score) {
    addWarning(filePath, `Provider totalScore is ${record.totalScore}, but scoreBreakdown totals ${score}.`);
  }

  if (!isTemplateLike(record) && record.confidence !== 'unknown' && record.evidenceUrls.length === 0) {
    addWarning(filePath, 'Provider confidence is set but no evidenceUrls are recorded.');
  }
}

function validateStateResearchRules(record, filePath) {
  if (record.recommendedPageCount !== record.pageRecommendations.length) {
    addWarning(
      filePath,
      `recommendedPageCount is ${record.recommendedPageCount}, but pageRecommendations contains ${record.pageRecommendations.length} item(s).`
    );
  }

  if (record.researchStatus === 'approved_for_content' && record.pageRecommendations.length === 0) {
    addWarning(filePath, 'State is approved_for_content but has no pageRecommendations.');
  }
}

function validatePageRecommendationRules(record, filePath) {
  const breakdown = record.scoreBreakdown ?? {};
  const score = sumValues([
    breakdown.searchVolumeDemand,
    breakdown.supplierCoverage,
    breakdown.eventLocationDensity,
    breakdown.leadValue,
    breakdown.uniqueIntent,
    breakdown.contentDepthPossible
  ]);

  if (typeof record.pageScore === 'number' && record.pageScore !== score) {
    addWarning(filePath, `pageScore is ${record.pageScore}, but scoreBreakdown totals ${score}.`);
  }

  if (record.publishRecommended && record.pageScore < pagePublishThreshold) {
    addWarning(filePath, `publishRecommended is true, but pageScore is below ${pagePublishThreshold}.`);
  }

  if (record.fulfillmentStatus === 'research_only_until_provider_confirmed' && !record.noindexRecommended) {
    addWarning(filePath, 'research_only_until_provider_confirmed should default noindexRecommended to true.');
  }

  if (record.googleAdsEligible && record.fulfillmentStatus === 'research_only_until_provider_confirmed') {
    addWarning(filePath, 'Google Ads eligibility is risky while fulfillment is research_only_until_provider_confirmed.');
  }

  if (record.fulfillmentStatus === 'direct_partner_available' && !record.primaryPartnerAvailable) {
    addWarning(filePath, 'direct_partner_available requires primaryPartnerAvailable to be true.');
  }

  if (
    record.fulfillmentStatus === 'partner_network_or_researched_provider' &&
    !record.providerResearchCompleted &&
    !record.manualReviewRequired
  ) {
    addWarning(
      filePath,
      'partner_network_or_researched_provider requires providerResearchCompleted or manualReviewRequired.'
    );
  }

  if (!hasUsefulText(record.uniqueValueReason)) {
    addWarning(filePath, 'Page recommendation lacks uniqueValueReason.');
  }

  if (!hasUsefulText(record.targetKeyword)) {
    addWarning(filePath, 'Page recommendation lacks targetKeyword.');
  }

  if (record.fulfillmentStatus !== 'direct_partner_available' && record.publicDisclosureRequired !== true) {
    addWarning(filePath, 'Non-direct fulfillment should set publicDisclosureRequired to true.');
  }
}

function validateLeadRoutingRules(record, filePath) {
  if (
    (record.fulfillmentStatus === 'direct_partner_available' || record.leadRoutingMode === 'send_to_primary_partner') &&
    !hasUsefulText(record.partnerId)
  ) {
    addWarning(filePath, 'Direct partner routing requires partnerId.');
  }

  if (record.leadRoutingMode === 'researched_provider_match' && record.providerIds.length === 0) {
    addWarning(filePath, 'researched_provider_match requires at least one providerId.');
  }

  if (
    record.fulfillmentStatus === 'research_only_until_provider_confirmed' &&
    record.fallbackAction === 'send_to_primary_partner'
  ) {
    addWarning(filePath, 'Research-only fulfillment should not fall back to send_to_primary_partner.');
  }
}

function validateBusinessRules(record, filePath) {
  checkPlaceholderSafety(record, filePath);

  switch (record.schemaType) {
    case 'provider':
      validateProviderRules(record, filePath);
      break;
    case 'stateResearch':
      validateStateResearchRules(record, filePath);
      break;
    case 'pageRecommendation':
      validatePageRecommendationRules(record, filePath);
      break;
    case 'leadRouting':
      validateLeadRoutingRules(record, filePath);
      break;
    default:
      break;
  }
}

function loadSchemas() {
  const schemas = new Map();

  for (const [schemaType, schemaFile] of schemaByType.entries()) {
    const schemaPath = path.join(schemasRoot, schemaFile);
    const schema = readJson(schemaPath);

    if (!schema) {
      continue;
    }

    if (schema.type !== 'object') {
      addError(schemaPath, 'Schema root type must be object.');
    }

    schemas.set(schemaType, schema);
  }

  return schemas;
}

function main() {
  if (!existsSync(researchRoot)) {
    console.error('Research folder not found.');
    process.exit(1);
  }

  const schemas = loadSchemas();
  const researchFiles = walkJsonFiles(researchRoot).filter((filePath) => !filePath.includes(`${path.sep}schemas${path.sep}`));

  for (const filePath of researchFiles) {
    results.filesChecked += 1;
    const record = readJson(filePath);

    if (!record) {
      continue;
    }

    if (!record.schemaType) {
      addError(filePath, '$.schemaType is required to select a research schema.');
      continue;
    }

    const schema = schemas.get(record.schemaType);
    if (!schema) {
      addError(filePath, `Unknown schemaType "${record.schemaType}".`);
      continue;
    }

    validateSchemaValue(record, schema, '$', filePath);
    validateBusinessRules(record, filePath);
  }

  console.log('Pumpkin research validation');
  console.log(`Files checked: ${results.filesChecked}`);
  console.log(`Errors: ${results.errors.length}`);
  console.log(`Warnings: ${results.warnings.length}`);

  if (results.errors.length > 0) {
    console.log('\nErrors');
    for (const error of results.errors) {
      console.log(`- ${error.file}: ${error.message}`);
    }
  }

  if (results.warnings.length > 0) {
    console.log('\nWarnings');
    for (const warning of results.warnings) {
      console.log(`- ${warning.file}: ${warning.message}`);
    }
  }

  if (results.errors.length > 0) {
    process.exit(1);
  }
}

main();
