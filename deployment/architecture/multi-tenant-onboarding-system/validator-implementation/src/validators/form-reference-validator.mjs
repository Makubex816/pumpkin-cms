import { createFinding } from "../gate-status.mjs";
import { ErrorCode } from "../error-codes.mjs";
import { collectReferences, getDocumentsByRole, walkValues } from "./reference-utils.mjs";

const formReferenceKeys = new Set(["formId", "formIds", "formRef", "formRefs", "contactFormId", "selectedFormId"]);
const leadRecipientReferenceKeys = new Set(["leadRecipientRef", "recipientRef", "mailboxOwnerRef"]);
const endpointReferenceKeys = new Set(["staticEndpointRef", "endpointRef", "formEndpointRef"]);
const allowedEndpointPlaceholders = new Set(["PROFILE_MANAGED_STATIC_ENDPOINT", "PROFILE_MANAGED", "FORM_ENDPOINT_PROFILE_MANAGED", "PLACEHOLDER", "TODO_SECRET_AT_RUNTIME"]);

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
    addRecipientRef(recipientRefs, form.recipient);
    addRecipientRef(recipientRefs, form.mailboxOwner);
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

function addRecipientRef(set, value) {
  if (typeof value === "string" && value.trim()) {
    set.add(value.trim());
  }
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
