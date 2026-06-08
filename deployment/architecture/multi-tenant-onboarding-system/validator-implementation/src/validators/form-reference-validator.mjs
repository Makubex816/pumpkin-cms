import { createFinding } from "../gate-status.mjs";
import { ErrorCode } from "../error-codes.mjs";
import { collectReferences, getDocumentsByRole, walkValues } from "./reference-utils.mjs";

const formReferenceKeys = new Set(["formId", "formIds", "formRef", "formRefs", "contactFormId", "selectedFormId"]);
const leadRecipientReferenceKeys = new Set(["leadRecipientRef", "recipientRef", "mailboxOwnerRef"]);
const endpointReferenceKeys = new Set(["staticEndpointRef", "endpointRef", "formEndpointRef"]);
const allowedEndpointPlaceholders = new Set(["PROFILE_MANAGED_STATIC_ENDPOINT", "PROFILE_MANAGED", "FORM_ENDPOINT_PROFILE_MANAGED", "PLACEHOLDER", "TODO_SECRET_AT_RUNTIME"]);
const safeReferencePattern = /^[a-z][a-z0-9-]{2,80}$/;
const secretLikePatterns = [
  /AKIA[0-9A-Z]{16}/,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /(client_secret|access_token|api[_-]?key|password|secret)\s*[:=]\s*[^\s,;]{8,}/i,
  /[?&](sig|signature|sv|sp|se|token|access_token|api_key|client_secret)=/i
];

export function validateFormReferences(parsedDocuments) {
  const findings = [];
  const formsDoc = parsedDocuments.get("forms.json")?.data;
  const forms = Array.isArray(formsDoc?.forms) ? formsDoc.forms : [];
  const pages = getDocumentsByRole(parsedDocuments, "page");
  const formIds = new Map();
  const recipientRefs = new Set();

  forms.forEach((form, index) => {
    if (!form?.formId) {
      return;
    }
    if (formIds.has(form.formId)) {
      findings.push(formFinding({
        code: ErrorCode.FORM_ID_DUPLICATE,
        file: "forms.json",
        jsonPointer: `/forms/${index}/formId`,
        message: `forms.json repeats formId ${form.formId}.`,
        ownerExplanation: "Each form needs a unique ID so page blocks resolve to one form.",
        nextAction: "Give each form a unique formId."
      }));
    }
    formIds.set(form.formId, form);
    validateFormRecipientRefs(findings, form, index, recipientRefs);
  });

  for (const page of pages) {
    for (const reference of collectReferences(page, formReferenceKeys)) {
      if (!formIds.has(reference.ref)) {
        findings.push(formFinding({
          code: ErrorCode.UNKNOWN_FORM_REFERENCE,
          file: page.relativePath,
          jsonPointer: reference.pointer,
          field: reference.field,
          message: `${page.relativePath}${reference.pointer} references unknown formId ${reference.ref}.`,
          ownerExplanation: "A page block references a form that is not listed in forms.json.",
          nextAction: "Add the form to forms.json or update the page block to use an existing formId."
        }));
      }
    }

    for (const reference of collectReferences(page, leadRecipientReferenceKeys)) {
      if (!recipientRefs.has(reference.ref)) {
        findings.push(formFinding({
          code: ErrorCode.FORM_RECIPIENT_REFERENCE_MISSING,
          file: page.relativePath,
          jsonPointer: reference.pointer,
          field: reference.field,
          message: `${page.relativePath}${reference.pointer} references undeclared recipient ${reference.ref}.`,
          ownerExplanation: "A page block references a lead recipient that is not declared by forms.json.",
          nextAction: "Declare the recipient in forms.json recipient or mailboxOwner, or update the page block."
        }));
      }
    }

    for (const reference of collectReferences(page, endpointReferenceKeys)) {
      if (!isAllowedEndpointRef(reference.ref)) {
        findings.push(formFinding({
          code: ErrorCode.FORM_ENDPOINT_NOT_ALLOWED,
          file: page.relativePath,
          jsonPointer: reference.pointer,
          field: reference.field,
          message: `${page.relativePath}${reference.pointer} uses an unsupported form endpoint reference.`,
          ownerExplanation: "Form endpoint references must be placeholders or profile-managed references in offline packages.",
          nextAction: "Use PROFILE_MANAGED_STATIC_ENDPOINT or a profile: endpoint reference."
        }));
      }
    }
  }

  scanFormObjectsForEndpointRefs(findings, forms);

  return findings;
}

function scanFormObjectsForEndpointRefs(findings, forms) {
  forms.forEach((form, formIndex) => {
    if (form?.domainRoutingKey && !isSafeReference(form.domainRoutingKey)) {
      findings.push(formFinding({
        code: ErrorCode.FORM_RECIPIENT_REFERENCE_INVALID,
        file: "forms.json",
        jsonPointer: `/forms/${formIndex}/domainRoutingKey`,
        field: "domainRoutingKey",
        message: `forms.json form ${form.formId ?? formIndex} uses an unsafe domainRoutingKey.`,
        ownerExplanation: "Domain routing keys must be non-secret reference IDs.",
        nextAction: "Use lowercase letters, numbers, and hyphens, such as example-contact."
      }));
    }

    walkValues(form, (value, pointer) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return;
      }
      for (const [key, child] of Object.entries(value)) {
        if (endpointReferenceKeys.has(key) && typeof child === "string" && !isAllowedEndpointRef(child)) {
          findings.push(formFinding({
            code: ErrorCode.FORM_ENDPOINT_NOT_ALLOWED,
            file: "forms.json",
            jsonPointer: `/forms/${formIndex}${pointer === "/" ? "" : pointer}/${key}`,
            field: key,
            message: `forms.json form ${form.formId ?? formIndex} uses an unsupported endpoint reference.`,
            ownerExplanation: "Form endpoint references must remain profile-managed and must not contain runtime secrets.",
            nextAction: "Replace the endpoint with PROFILE_MANAGED_STATIC_ENDPOINT or a profile-managed reference."
          }));
        }
      }
    });
  });
}

function validateFormRecipientRefs(findings, form, formIndex, recipientRefs) {
  const leadRecipientRef = normalizeRef(form?.leadRecipientRef);
  const recipientGroup = normalizeRef(form?.recipientGroup);

  if (!leadRecipientRef && !recipientGroup) {
    findings.push(formFinding({
      code: ErrorCode.FORM_RECIPIENT_REFERENCE_REQUIRED,
      file: "forms.json",
      jsonPointer: `/forms/${formIndex}`,
      message: `forms.json form ${form?.formId ?? formIndex} needs leadRecipientRef or legacy recipientGroup.`,
      ownerExplanation: "Each form needs a non-secret recipient reference so lead routing can be reviewed without exposing mailbox credentials.",
      nextAction: "Add leadRecipientRef such as example-event-leads, or keep a matching legacy recipientGroup."
    }));
  }

  if (leadRecipientRef) {
    validateRecipientRefValue(findings, "leadRecipientRef", leadRecipientRef, form, formIndex);
    if (isSafeReference(leadRecipientRef)) {
      recipientRefs.add(leadRecipientRef);
    }
  }

  if (recipientGroup) {
    validateRecipientRefValue(findings, "recipientGroup", recipientGroup, form, formIndex);
    if (isSafeReference(recipientGroup)) {
      recipientRefs.add(recipientGroup);
    }
  }

  if (leadRecipientRef && recipientGroup && leadRecipientRef !== recipientGroup) {
    findings.push(formFinding({
      code: ErrorCode.FORM_RECIPIENT_REFERENCE_CONFLICT,
      file: "forms.json",
      jsonPointer: `/forms/${formIndex}/recipientGroup`,
      field: "recipientGroup",
      message: `forms.json form ${form?.formId ?? formIndex} has conflicting leadRecipientRef and recipientGroup values.`,
      ownerExplanation: "The new recipient reference and legacy recipient group must point to the same approved lead routing record.",
      nextAction: "Use the same safe value for leadRecipientRef and recipientGroup, or remove recipientGroup after legacy consumers no longer need it."
    }));
  }
}

function validateRecipientRefValue(findings, field, value, form, formIndex) {
  if (!isSafeReference(value)) {
    findings.push(formFinding({
      code: ErrorCode.FORM_RECIPIENT_REFERENCE_INVALID,
      file: "forms.json",
      jsonPointer: `/forms/${formIndex}/${field}`,
      field,
      message: `forms.json form ${form?.formId ?? formIndex} has an unsafe ${field}.`,
      ownerExplanation: "Lead recipient references must be non-secret IDs, not emails, tokens, URLs, or credentials.",
      nextAction: "Use lowercase letters, numbers, and hyphens, such as example-event-leads."
    }));
  }
}

function normalizeRef(value) {
  return typeof value === "string" ? value.trim() : null;
}

function isSafeReference(value) {
  return typeof value === "string" && safeReferencePattern.test(value) && !secretLikePatterns.some((pattern) => pattern.test(value));
}

function isAllowedEndpointRef(value) {
  if (allowedEndpointPlaceholders.has(value)) {
    return true;
  }
  return typeof value === "string" && value.startsWith("profile:");
}

function formFinding({ code, file, jsonPointer = null, field = null, message, ownerExplanation, nextAction }) {
  return createFinding({
    severity: "error",
    code,
    file,
    jsonPointer,
    field,
    message,
    ownerExplanation,
    operatorDetail: "Form checks run offline against forms.json and pages/*.json. No email is sent.",
    nextAction,
    gateId: "form-references"
  });
}
