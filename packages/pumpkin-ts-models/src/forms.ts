import type { IHtmlBlock } from './models/IHtmlBlock';

export type FormDefinitionStatus = 'draft' | 'active' | 'archived';
export type FormDefinitionType = 'contact' | 'quote-request' | 'newsletter' | 'custom';
export type FormSubmitAction = 'form-entry';
export type FormSpamStatus = 'clean' | 'suspected-spam';
export type DefaultFormKey = 'default-contact' | 'default-quote-request';
export type FormBlockVariant = 'quote-form-panel' | 'contact-card' | 'inline-contact' | 'compact-contact';
export type FormFieldType =
  | 'text'
  | 'email'
  | 'tel'
  | 'phone'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'hidden'
  | 'dateText'
  | 'number';
export type FormFieldWidth = 'full' | 'half' | 'third' | 'two-thirds' | string;

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  message?: string;
}

export interface FormDefinitionField {
  id: string;
  name: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder: string;
  helpText: string;
  autocomplete: string;
  options: Array<string | FormFieldOption>;
  defaultValue: string;
  hidden: boolean;
  validation: FormFieldValidation;
  order: number;
  width: FormFieldWidth;
  sensitive?: boolean;
  includeInLeadSummary?: boolean;
  attributes: Record<string, string>;
}

export type FormFieldDefinition = FormDefinitionField;

export type FormSubmitBehavior = 'message' | 'redirect';

export interface FormNotificationSettings {
  enabled: boolean;
  replyToField: string;
  subjectTemplate: string;
}

export interface StarterFormSpamProtection {
  honeypotFieldName: string;
  rejectWhenHoneypotFilled: boolean;
  requireConsent: boolean;
  consentFieldName: string;
}

export interface FormRateLimit {
  enabled: boolean;
  maxSubmissions: number;
  windowSeconds: number;
}

export interface FormDefinitionRouting {
  leadType: string;
  routingMode: string;
  recipientGroupRef: string;
}

export interface FormDefinitionSpamProtection {
  honeypotFieldName: string;
  minMessageLength?: number;
  maxPayloadBytes: number;
  maxFieldLength: number;
}

export interface FormDefinitionConsent {
  required: boolean;
  fieldName: string;
  text: string;
}

export interface FormDefinition {
  id: string;
  formDefinitionId: string;
  tenantId: string;
  siteKey: string;
  formKey: string;
  name: string;
  type: string;
  description: string;
  status: FormDefinitionStatus;
  formType: FormDefinitionType;
  version: string;
  submitAction: FormSubmitAction;
  runtimeSubmitPath: string;
  staticEndpointRef: string;
  leadRecipientRef: string;
  notificationEmailRef?: string;
  submitButtonText: string;
  submitBehavior: FormSubmitBehavior | string;
  redirectUrl: string;
  notificationEmails: string[];
  notifications: FormNotificationSettings;
  successMessage: string;
  errorMessage: string;
  spamProtection: FormDefinitionSpamProtection & StarterFormSpamProtection;
  consent: FormDefinitionConsent;
  fields: FormDefinitionField[];
  hiddenFields: FormDefinitionField[];
  validationRules: Record<string, unknown>;
  routing: FormDefinitionRouting;
  rateLimit: FormRateLimit;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  archivedAt?: string;
  archivedBy?: string;
  systemDefault?: boolean;
}

export interface FormBlockContent {
  id: string;
  label?: string;
  formKey: string;
  variant: FormBlockVariant;
  heading: string;
  intro?: string;
  submitLabel: string;
  successMessage?: string;
  errorMessage?: string;
  staticEndpointRef: string;
  leadRecipientRef: string;
  sourcePage: string;
  review?: Record<string, unknown>;
  validation?: Record<string, unknown>;
}

export interface FormBlock extends IHtmlBlock {
  type: 'formBlock';
  content: FormBlockContent;
}

export interface FormValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  path: string;
}

export interface FormValidationResult {
  ok: boolean;
  errors: FormValidationIssue[];
  warnings: FormValidationIssue[];
}

export interface FormSubmissionPayload {
  tenantId?: string;
  siteKey?: string;
  formId?: string;
  formKey?: string;
  pageSlug?: string;
  sourcePage?: string;
  formData?: Record<string, unknown>;
}

export const DEFAULT_FORM_KEYS: DefaultFormKey[] = ['default-contact', 'default-quote-request'];
export const FORM_BLOCK_VARIANTS: FormBlockVariant[] = ['quote-form-panel', 'contact-card', 'inline-contact', 'compact-contact'];
export const FORM_FIELD_TYPES: FormFieldType[] = ['text', 'email', 'tel', 'phone', 'textarea', 'select', 'radio', 'checkbox', 'hidden', 'dateText', 'number'];

const SAFE_REF_PATTERN = /^[A-Z0-9_:-]{3,160}$/;
const FIELD_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{1,80}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SECRET_PATTERNS = [
  /\bBearer\s+[A-Za-z0-9._~-]+/i,
  /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/,
  /\bsk-[A-Za-z0-9]{20,}\b/i,
  /\b(AccountKey|SharedAccessKey|DefaultEndpointsProtocol|EndpointSuffix)=/i,
];

export const DEFAULT_CONTACT_FORM_DEFINITION: FormDefinition = {
  id: 'default-contact',
  formDefinitionId: 'default-contact',
  tenantId: 'default',
  siteKey: 'default',
  formKey: 'default-contact',
  name: 'Default Contact',
  type: 'contact',
  description: 'Reusable tenant-safe default contact form.',
  status: 'active',
  formType: 'contact',
  version: 'phase8c11.v1',
  submitAction: 'form-entry',
  runtimeSubmitPath: '/api/contact',
  staticEndpointRef: 'DEFAULT_STATIC_CONTACT_ENDPOINT',
  leadRecipientRef: 'DEFAULT_LEAD_RECIPIENT',
  notificationEmailRef: 'DEFAULT_NOTIFICATION_EMAIL_REF',
  submitButtonText: 'Submit',
  submitBehavior: 'message',
  redirectUrl: '',
  notificationEmails: [],
  notifications: {
    enabled: false,
    replyToField: 'email',
    subjectTemplate: '',
  },
  successMessage: 'Thanks. Your message has been received.',
  errorMessage: 'Unable to submit this request right now. Please try again.',
  spamProtection: {
    honeypotFieldName: 'honeypot',
    minMessageLength: 10,
    maxPayloadBytes: 20000,
    maxFieldLength: 4000,
    rejectWhenHoneypotFilled: true,
    requireConsent: true,
    consentFieldName: 'consent',
  },
  consent: {
    required: true,
    fieldName: 'consent',
    text: 'I agree to be contacted about this request.',
  },
  fields: [
    field('fullName', 'Full Name', 'text', true, 10, { placeholder: 'Your name', autocomplete: 'name', includeInLeadSummary: true }),
    field('email', 'Email', 'email', true, 20, { placeholder: 'you@example.com', autocomplete: 'email', sensitive: true, includeInLeadSummary: true }),
    field('phone', 'Phone', 'tel', false, 30, { placeholder: 'Best callback number', autocomplete: 'tel', sensitive: true, includeInLeadSummary: true }),
    field('subject', 'Subject', 'text', false, 40, { placeholder: 'How can we help?' }),
    field('message', 'Message', 'textarea', true, 50, { placeholder: 'Tell us what you are planning', validation: { minLength: 10, maxLength: 4000 }, includeInLeadSummary: true, width: 'full' }),
    field('consent', 'Consent', 'checkbox', true, 60, { placeholder: 'I agree to be contacted about this request.', width: 'full' }),
    field('honeypot', 'Leave this field blank', 'text', false, 70, { hidden: true, autocomplete: 'off' }),
  ],
  hiddenFields: hiddenFields('default', 'default', 'default-contact'),
  validationRules: {
    requireEmail: true,
    requireConsent: true,
    requireHoneypot: true,
  },
  routing: {
    leadType: 'contact',
    routingMode: 'manual_review_then_provider_match',
    recipientGroupRef: 'DEFAULT_LEAD_RECIPIENT',
  },
  rateLimit: {
    enabled: false,
    maxSubmissions: 5,
    windowSeconds: 3600,
  },
  isActive: true,
  createdAt: '2026-05-27T00:00:00Z',
  updatedAt: '2026-05-27T00:00:00Z',
  createdBy: 'system_default_phase8c11',
  updatedBy: 'system_default_phase8c11',
  systemDefault: true,
};

export const ICE_DEFAULT_QUOTE_REQUEST_FORM_DEFINITION: FormDefinition = {
  ...DEFAULT_CONTACT_FORM_DEFINITION,
  id: 'ice-rink-rentals-default-quote-request',
  formDefinitionId: 'ice-rink-rentals-default-quote-request',
  tenantId: 'ice-rink-rentals',
  siteKey: 'ice-rink-rentals',
  formKey: 'default-quote-request',
  name: 'Ice Default Quote Request',
  type: 'quote_request',
  description: 'Default quote request form for IceSkatingRinkRentals.com contact pages.',
  formType: 'quote-request',
  staticEndpointRef: 'ICE_RINK_RENTALS_STATIC_CONTACT_ENDPOINT',
  leadRecipientRef: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
  notificationEmailRef: 'ICE_RINK_RENTALS_NOTIFICATION_EMAIL_REF',
  successMessage: 'Thanks. Your ice rink rental request has been received for review.',
  errorMessage: 'Unable to submit this quote request right now. Please try again.',
  consent: {
    required: true,
    fieldName: 'consent',
    text: 'I agree to be contacted about this ice rink rental request.',
  },
  fields: [
    field('fullName', 'Full Name', 'text', true, 10, { placeholder: 'Your name', autocomplete: 'name', includeInLeadSummary: true }),
    field('email', 'Email', 'email', true, 20, { placeholder: 'you@example.com', autocomplete: 'email', sensitive: true, includeInLeadSummary: true }),
    field('phone', 'Phone', 'tel', true, 30, { placeholder: 'Best callback number', autocomplete: 'tel', sensitive: true, includeInLeadSummary: true }),
    field('eventCity', 'Event City', 'text', true, 40, { placeholder: 'City', includeInLeadSummary: true }),
    field('eventState', 'Event State', 'text', true, 50, { placeholder: 'State', includeInLeadSummary: true }),
    field('eventDateOrDateRange', 'Event Date or Date Range', 'dateText', true, 60, { placeholder: 'Preferred date or date range', includeInLeadSummary: true }),
    field('eventType', 'Event Type', 'select', true, 70, {
      placeholder: 'Select event type',
      options: ['Holiday activation', 'Corporate event', 'Municipal/community event', 'School event', 'Venue attraction', 'Private event', 'Other'],
      includeInLeadSummary: true,
    }),
    field('estimatedAttendance', 'Estimated Attendance', 'number', false, 80, { placeholder: 'Estimated guest count', validation: { maxLength: 12 }, includeInLeadSummary: true }),
    field('venueSetting', 'Venue Setting', 'select', true, 90, {
      placeholder: 'Select venue setting',
      options: ['Indoor', 'Outdoor', 'Not sure yet'],
      includeInLeadSummary: true,
    }),
    field('message', 'Event Goals and Notes', 'textarea', true, 100, {
      placeholder: 'Tell us about the venue, surface, operating hours, setup needs, and goals for the rink',
      validation: { minLength: 10, maxLength: 4000 },
      includeInLeadSummary: true,
      width: 'full',
    }),
    field('consent', 'Consent', 'checkbox', true, 110, { placeholder: 'I agree to be contacted about this ice rink rental request.', width: 'full' }),
    field('honeypot', 'Leave this field blank', 'text', false, 120, { hidden: true, autocomplete: 'off' }),
  ],
  hiddenFields: hiddenFields('ice-rink-rentals', 'ice-rink-rentals', 'default-quote-request'),
  routing: {
    leadType: 'quote-request',
    routingMode: 'manual_review_then_provider_match',
    recipientGroupRef: 'ICE_RINK_RENTALS_LEAD_RECIPIENT',
  },
};

export function getDefaultFormDefinitions(tenantId = 'default', siteKey = tenantId): FormDefinition[] {
  const contact = cloneFormDefinition(DEFAULT_CONTACT_FORM_DEFINITION, tenantId, siteKey);
  if (tenantId === 'ice-rink-rentals' || siteKey === 'ice-rink-rentals') {
    return [contact, cloneFormDefinition(ICE_DEFAULT_QUOTE_REQUEST_FORM_DEFINITION, tenantId, siteKey)];
  }

  return [contact];
}

export function getDefaultFormDefinition(formKey: string, tenantId = 'default', siteKey = tenantId): FormDefinition | null {
  return getDefaultFormDefinitions(tenantId, siteKey).find((definition) => definition.formKey === formKey) || null;
}

export function validateFormDefinition(definition: unknown, path = 'formDefinitions[0]'): FormValidationResult {
  const result = resultBag();
  if (!isRecord(definition)) {
    addError(result, 'form.shape', 'Form definition must be an object.', path);
    return result;
  }

  const formKey = stringValue(definition.formKey);
  const fields = Array.isArray(definition.fields) ? definition.fields : [];
  const hidden = Array.isArray(definition.hiddenFields) ? definition.hiddenFields : [];
  const allFields = [...fields, ...hidden].filter(isRecord);

  requiredString(result, definition.id, `${path}.id`, 'form.id');
  requiredString(result, definition.tenantId, `${path}.tenantId`, 'form.tenantId');
  requiredString(result, definition.siteKey, `${path}.siteKey`, 'form.siteKey');
  requiredString(result, formKey, `${path}.formKey`, 'form.formKey');
  requiredString(result, definition.name, `${path}.name`, 'form.name');
  requiredString(result, definition.description, `${path}.description`, 'form.description');
  requiredString(result, definition.version, `${path}.version`, 'form.version');
  requiredString(result, definition.runtimeSubmitPath, `${path}.runtimeSubmitPath`, 'form.runtimeSubmitPath');
  requiredString(result, definition.successMessage, `${path}.successMessage`, 'form.successMessage');
  requiredString(result, definition.errorMessage, `${path}.errorMessage`, 'form.errorMessage');
  requiredString(result, definition.createdAt, `${path}.createdAt`, 'form.createdAt');
  requiredString(result, definition.updatedAt, `${path}.updatedAt`, 'form.updatedAt');
  requiredString(result, definition.createdBy, `${path}.createdBy`, 'form.createdBy');
  requiredString(result, definition.updatedBy, `${path}.updatedBy`, 'form.updatedBy');
  validateSafeRef(result, definition.staticEndpointRef, `${path}.staticEndpointRef`);
  validateSafeRef(result, definition.leadRecipientRef, `${path}.leadRecipientRef`);
  if (stringValue(definition.notificationEmailRef)) {
    validateSafeRef(result, definition.notificationEmailRef, `${path}.notificationEmailRef`);
  }

  if (!['draft', 'active', 'archived'].includes(stringValue(definition.status))) {
    addError(result, 'form.status', 'Form status must be draft, active, or archived.', `${path}.status`);
  }

  if (!['contact', 'quote-request', 'newsletter', 'custom'].includes(stringValue(definition.formType))) {
    addError(result, 'form.type', 'Unsupported formType.', `${path}.formType`);
  }

  if (stringValue(definition.submitAction) !== 'form-entry') {
    addError(result, 'form.submitAction', 'submitAction must be form-entry for FormEntry-backed default forms.', `${path}.submitAction`);
  }

  if (fields.length === 0) {
    addError(result, 'form.fields', 'Form definition must include fields.', `${path}.fields`);
  }

  const spamProtection = isRecord(definition.spamProtection) ? definition.spamProtection : {};
  requiredString(result, spamProtection.honeypotFieldName, `${path}.spamProtection.honeypotFieldName`, 'form.spamProtection.honeypotFieldName');
  if (typeof spamProtection.maxPayloadBytes !== 'number' || spamProtection.maxPayloadBytes <= 0) {
    addError(result, 'form.spamProtection.maxPayloadBytes', 'maxPayloadBytes must be a positive number.', `${path}.spamProtection.maxPayloadBytes`);
  }
  if (typeof spamProtection.maxFieldLength !== 'number' || spamProtection.maxFieldLength <= 0) {
    addError(result, 'form.spamProtection.maxFieldLength', 'maxFieldLength must be a positive number.', `${path}.spamProtection.maxFieldLength`);
  }

  const consent = isRecord(definition.consent) ? definition.consent : {};
  if (consent.required !== true) {
    addError(result, 'form.consent.required', 'Default forms must require consent.', `${path}.consent.required`);
  }
  requiredString(result, consent.fieldName, `${path}.consent.fieldName`, 'form.consent.fieldName');
  requiredString(result, consent.text, `${path}.consent.text`, 'form.consent.text');

  const routing = isRecord(definition.routing) ? definition.routing : {};
  requiredString(result, routing.leadType, `${path}.routing.leadType`, 'form.routing.leadType');
  requiredString(result, routing.routingMode, `${path}.routing.routingMode`, 'form.routing.routingMode');
  validateSafeRef(result, routing.recipientGroupRef, `${path}.routing.recipientGroupRef`);

  const names = new Set<string>();
  allFields.forEach((item, index) => {
    const fieldPath = index < fields.length ? `${path}.fields[${index}]` : `${path}.hiddenFields[${index - fields.length}]`;
    validateField(item, fieldPath, result);
    const name = stringValue(item.name);
    if (name) {
      if (names.has(name)) addError(result, 'form.field.duplicate', `Duplicate field name "${name}".`, `${fieldPath}.name`);
      names.add(name);
    }
  });

  if (!names.has('consent')) addError(result, 'form.consent', 'Default forms must include a consent field.', `${path}.fields`);
  if (!names.has('honeypot')) addError(result, 'form.honeypot', 'Default forms must include a honeypot field.', `${path}.fields`);
  if (!names.has('sourcePage')) addError(result, 'form.sourcePage', 'Default forms must include a sourcePage hidden field.', `${path}.hiddenFields`);
  if (!names.has('tenantId')) addError(result, 'form.tenantId.hidden', 'Default forms must include a tenantId hidden field.', `${path}.hiddenFields`);
  if (!names.has('siteKey')) addError(result, 'form.siteKey.hidden', 'Default forms must include a siteKey hidden field.', `${path}.hiddenFields`);
  if (!names.has('formKey')) addError(result, 'form.formKey.hidden', 'Default forms must include a formKey hidden field.', `${path}.hiddenFields`);

  scanSecretLike(result, definition, path);
  return result;
}

export function validateFormBlockContent(
  content: unknown,
  options: { definitions?: FormDefinition[]; path?: string } = {},
): FormValidationResult {
  const result = resultBag();
  const path = options.path || 'formBlock.content';
  if (!isRecord(content)) {
    addError(result, 'formBlock.shape', 'formBlock content must be an object.', path);
    return result;
  }

  const formKey = stringValue(content.formKey);
  requiredString(result, content.id, `${path}.id`, 'formBlock.id');
  requiredString(result, formKey, `${path}.formKey`, 'formBlock.formKey');
  requiredString(result, content.heading, `${path}.heading`, 'formBlock.heading');
  requiredString(result, content.submitLabel, `${path}.submitLabel`, 'formBlock.submitLabel');
  requiredString(result, content.sourcePage, `${path}.sourcePage`, 'formBlock.sourcePage');
  validateSafeRef(result, content.staticEndpointRef, `${path}.staticEndpointRef`);
  validateSafeRef(result, content.leadRecipientRef, `${path}.leadRecipientRef`);

  if (!FORM_BLOCK_VARIANTS.includes(stringValue(content.variant) as FormBlockVariant)) {
    addError(result, 'formBlock.variant', 'formBlock variant is not supported.', `${path}.variant`);
  }

  const definitions = options.definitions || [];
  if (formKey && definitions.length > 0 && !definitions.some((definition) => definition.formKey === formKey)) {
    addError(result, 'formBlock.formKey.unknown', `Unknown formKey "${formKey}".`, `${path}.formKey`);
  }

  scanSecretLike(result, content, path);
  return result;
}

export function validatePageFormBlocks(page: unknown, path = 'page'): FormValidationResult {
  const result = resultBag();
  if (!isRecord(page)) {
    addError(result, 'page.shape', 'Page must be an object.', path);
    return result;
  }

  const tenantId = stringValue(page.tenantId);
  const siteKey = stringValue(page.siteKey) || tenantId;
  const template = isRecord(page.template) ? page.template : {};
  const pageSlug = stringValue(page.pageSlug) || stringValue(page.slug);
  const isContactPage = pageSlug === 'contact' || stringValue(template.templateKey) === 'contact';
  const contentData = isRecord(page.ContentData) ? page.ContentData : {};
  const blocks = Array.isArray(contentData.ContentBlocks) ? contentData.ContentBlocks.filter(isRecord) : [];
  const pageDefinitions = Array.isArray(page.formDefinitions) ? page.formDefinitions.filter(isRecord) as unknown as FormDefinition[] : [];
  const definitions = [...getDefaultFormDefinitions(tenantId, siteKey), ...pageDefinitions];
  const formBlocks = blocks.filter((block) => block.type === 'formBlock');

  if (isContactPage && formBlocks.length === 0) {
    addError(result, 'contact.formBlock.missing', 'Contact pages must include a visible formBlock section.', `${path}.ContentData.ContentBlocks`);
  }

  blocks.forEach((block, index) => {
    if (block.type === 'formBlock') {
      mergeResult(result, validateFormBlockContent(block.content, {
        definitions,
        path: `${path}.ContentData.ContentBlocks[${index}].content`,
      }));
    }

    if (block.type === 'customHtml') {
      const html = stringValue(isRecord(block.content) ? block.content.html : '');
      if (/<\s*(form|input|button|textarea|select)\b/i.test(html)) {
        addError(result, 'customHtml.rawForm', 'Raw form fields are not allowed inside customHtml; use formBlock.', `${path}.ContentData.ContentBlocks[${index}].content.html`);
      }
    }
  });

  pageDefinitions.forEach((definition, index) => {
    mergeResult(result, validateFormDefinition(definition, `${path}.formDefinitions[${index}]`));
  });

  return result;
}

export function validateFormSubmissionPayload(
  payload: FormSubmissionPayload,
  definition: FormDefinition,
): FormValidationResult & { sanitizedData: Record<string, string>; spamStatus: FormSpamStatus } {
  const result = resultBag() as FormValidationResult & { sanitizedData: Record<string, string>; spamStatus: FormSpamStatus };
  result.sanitizedData = {};
  result.spamStatus = 'clean';

  const formData = isRecord(payload.formData) ? payload.formData : {};
  const allowedFields = new Map([...definition.fields, ...definition.hiddenFields].map((fieldItem) => [fieldItem.name, fieldItem]));
  const bodySize = JSON.stringify(formData).length;

  if (bodySize > definition.spamProtection.maxPayloadBytes) {
    addError(result, 'submission.size', 'Form submission exceeds the configured payload size.', 'formData');
  }

  for (const [key, rawValue] of Object.entries(formData)) {
    if (!allowedFields.has(key)) {
      addWarning(result, 'submission.unknownField', `Unknown field "${key}" was ignored.`, `formData.${key}`);
      continue;
    }

    const value = sanitizeSubmittedValue(rawValue, definition.spamProtection.maxFieldLength);
    result.sanitizedData[key] = value;
  }

  for (const fieldItem of [...definition.fields, ...definition.hiddenFields]) {
    if (fieldItem.required && !stringValue(result.sanitizedData[fieldItem.name])) {
      addError(result, 'submission.required', `${fieldItem.label} is required.`, `formData.${fieldItem.name}`);
    }
  }

  const consentFieldName = definition.consent.fieldName || 'consent';
  if (definition.consent.required && !isTruthy(result.sanitizedData[consentFieldName])) {
    addError(result, 'submission.consent', 'Consent is required.', `formData.${consentFieldName}`);
  }

  const email = stringValue(result.sanitizedData.email);
  if (email && !EMAIL_PATTERN.test(email)) {
    addError(result, 'submission.email', 'Email must be valid.', 'formData.email');
  }

  const honeypotValue = stringValue(result.sanitizedData[definition.spamProtection.honeypotFieldName]);
  if (honeypotValue) {
    result.spamStatus = 'suspected-spam';
    addWarning(result, 'submission.honeypot', 'Honeypot field was filled; submission should be flagged as suspected spam.', `formData.${definition.spamProtection.honeypotFieldName}`);
  }

  return result;
}

function field(
  id: string,
  label: string,
  type: FormFieldType,
  required: boolean,
  order: number,
  extras: Partial<FormDefinitionField> = {},
): FormDefinitionField {
  return {
    id,
    name: id,
    label,
    type,
    required,
    placeholder: '',
    helpText: '',
    autocomplete: '',
    options: [],
    defaultValue: '',
    hidden: false,
    validation: {},
    order,
    width: 'half',
    sensitive: false,
    includeInLeadSummary: false,
    attributes: {},
    ...extras,
  };
}

function hiddenFields(tenantId: string, siteKey: string, formKey: string): FormDefinitionField[] {
  return [
    field('sourcePage', 'Source Page', 'hidden', true, 1000, { defaultValue: '/contact', hidden: true }),
    field('tenantId', 'Tenant ID', 'hidden', true, 1010, { defaultValue: tenantId, hidden: true }),
    field('siteKey', 'Site Key', 'hidden', true, 1020, { defaultValue: siteKey, hidden: true }),
    field('formKey', 'Form Key', 'hidden', true, 1030, { defaultValue: formKey, hidden: true }),
  ];
}

function cloneFormDefinition(definition: FormDefinition, tenantId: string, siteKey: string): FormDefinition {
  const clone = JSON.parse(JSON.stringify(definition)) as FormDefinition;
  clone.tenantId = tenantId;
  clone.siteKey = siteKey;
  clone.hiddenFields = clone.hiddenFields.map((item) => ({
    ...item,
    defaultValue: item.name === 'tenantId'
      ? tenantId
      : item.name === 'siteKey'
        ? siteKey
        : item.name === 'formKey'
          ? clone.formKey
          : item.defaultValue,
  }));
  return clone;
}

function validateField(fieldItem: Record<string, unknown>, path: string, result: FormValidationResult) {
  requiredString(result, fieldItem.id, `${path}.id`, 'form.field.id');
  requiredString(result, fieldItem.name, `${path}.name`, 'form.field.name');
  requiredString(result, fieldItem.label, `${path}.label`, 'form.field.label');

  const name = stringValue(fieldItem.name);
  if (name && !FIELD_NAME_PATTERN.test(name)) {
    addError(result, 'form.field.name', `Invalid field name "${name}".`, `${path}.name`);
  }

  const type = stringValue(fieldItem.type);
  if (!FORM_FIELD_TYPES.includes(type as FormFieldType)) {
    addError(result, 'form.field.type', `Unsupported field type "${type}".`, `${path}.type`);
  }

  const label = stringValue(fieldItem.label);
  if (label.length > 80) {
    addWarning(result, 'form.field.label.long', `Field label "${label.slice(0, 40)}..." is long and should be reviewed.`, `${path}.label`);
  }

  const helpText = stringValue(fieldItem.helpText);
  if (helpText.length > 180) {
    addWarning(result, 'form.field.helpText.long', `Help text for "${name || path}" is long and should be reviewed.`, `${path}.helpText`);
  }

  if (type === 'select' && (!Array.isArray(fieldItem.options) || fieldItem.options.length === 0)) {
    addError(result, 'form.field.options', 'Select fields require options.', `${path}.options`);
  }
}

function validateSafeRef(result: FormValidationResult, value: unknown, path: string) {
  const ref = stringValue(value);
  if (!ref) {
    addError(result, 'form.ref.missing', `${path} is required.`, path);
    return;
  }
  if (!SAFE_REF_PATTERN.test(ref)) {
    addError(result, 'form.ref.invalid', `${path} must be a non-secret reference name, not a URL or credential.`, path);
  }
}

function requiredString(result: FormValidationResult, value: unknown, path: string, code: string) {
  if (!stringValue(value)) addError(result, code, `${path} is required.`, path);
}

function scanSecretLike(result: FormValidationResult, value: unknown, path: string) {
  if (typeof value === 'string') {
    if (SECRET_PATTERNS.some((pattern) => pattern.test(value))) {
      addError(result, 'form.secretLike', 'Secret-like values are not allowed in form configuration.', path);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanSecretLike(result, item, `${path}[${index}]`));
    return;
  }

  if (!isRecord(value)) return;
  Object.entries(value).forEach(([key, item]) => scanSecretLike(result, item, `${path}.${key}`));
}

function sanitizeSubmittedValue(value: unknown, maxLength: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

function isTruthy(value: unknown): boolean {
  return ['true', 'on', 'yes', '1'].includes(String(value ?? '').trim().toLowerCase());
}

function resultBag(): FormValidationResult {
  return { ok: true, errors: [], warnings: [] };
}

function mergeResult(target: FormValidationResult, source: FormValidationResult) {
  target.errors.push(...source.errors);
  target.warnings.push(...source.warnings);
  target.ok = target.errors.length === 0;
}

function addError(result: FormValidationResult, code: string, message: string, path: string) {
  result.errors.push({ severity: 'error', code, message, path });
  result.ok = false;
}

function addWarning(result: FormValidationResult, code: string, message: string, path: string) {
  result.warnings.push({ severity: 'warning', code, message, path });
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
