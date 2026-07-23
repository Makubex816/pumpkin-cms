(() => {
  "use strict";

  const DEFAULT_TIMEOUT_MS = 8000;
  const MAX_RESPONSE_BYTES = 65536;
  const logicalIdentities = new WeakMap();

  function mount(root = globalThis.document) {
    if (!root?.querySelectorAll) return 0;
    const forms = [...root.querySelectorAll("[data-pumpkin-public-form]")];
    for (const form of forms) {
      if (form.dataset.pumpkinMounted === "true") continue;
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        void submitForm(form).catch(() => fail(form, "client_error", "The submission could not be completed.", true));
      });
      form.addEventListener("reset", () => {
        logicalIdentities.delete(form);
        renderStatus(form, {
          state: "idle",
          code: "ready",
          message: "Ready.",
          retryable: false,
        });
      });
      try {
        const metadata = readMetadata(form.ownerDocument ?? root);
        const mapping = resolveMapping(metadata, String(form.dataset.formId ?? ""));
        activateForm(form, mapping);
        form.dataset.pumpkinMounted = "true";
      } catch (error) {
        deactivateForm(form);
        form.dataset.pumpkinMounted = "failed";
        const normalized = normalizeError(error, "metadata_invalid");
        fail(form, normalized.code, normalized.message, normalized.retryable);
      }
    }
    return forms.length;
  }

  async function submitForm(form, options = {}) {
    if (form.dataset.pumpkinMounted !== "true") {
      return fail(form, "form_not_mounted", "This form is unavailable.", false);
    }
    let metadata;
    let mapping;
    try {
      metadata = options.metadata ?? readMetadata(form.ownerDocument ?? globalThis.document);
      mapping = resolveMapping(metadata, String(form.dataset.formId ?? ""));
    } catch (error) {
      const normalized = normalizeError(error, "metadata_invalid");
      return fail(form, normalized.code, normalized.message, normalized.retryable);
    }

    if (metadata.publicMode === "preview-no-post") {
      return succeed(form, "preview_no_post", "Preview mode: no submission was sent.");
    }
    if (metadata.publicMode !== "public-live") {
      return fail(form, "public_mode_invalid", "This form is not configured for public submission.", false);
    }

    const values = collectValues(form, mapping);
    if (values.honeypotValue) return fail(form, "honeypot_rejected", "Submission was not accepted.", false);
    if (!values.consentAccepted) return fail(form, "consent_required", "Consent is required before submission.", false);
    if (values.missingRequired.length > 0) return fail(form, "required_fields_missing", "Complete all required fields.", false);

    let identity;
    try {
      identity = getOrCreateLogicalIdentity(form, options.cryptoImpl ?? globalThis.crypto);
    } catch (error) {
      const normalized = normalizeError(error);
      return fail(form, normalized.code, normalized.message, normalized.retryable);
    }
    if (identity.completed) return succeed(form, "already_submitted", "Submission already received.");
    const fetchImpl = options.fetchImpl ?? globalThis.fetch;
    const timeoutMs = boundedTimeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
    if (typeof fetchImpl !== "function") return fail(form, "transport_unavailable", "Submission transport is unavailable.", true);

    renderStatus(form, {
      state: "pending",
      code: "requesting_ticket",
      message: "Preparing secure submission...",
      retryable: false,
    });

    try {
      const ticketResponse = await requestJson(
        new URL(mapping.preflightPath, metadata.apiBaseUrl).href,
        {
          method: "POST",
          headers: publicHeaders(),
          body: JSON.stringify({ clientIdempotencySeed: identity.clientIdempotencySeed }),
          credentials: "omit",
          cache: "no-store",
          mode: "cors",
          referrerPolicy: "strict-origin",
        },
        { fetchImpl, timeoutMs },
      );
      const preflight = validatePreflightResponse(ticketResponse, mapping);

      renderStatus(form, {
        state: "pending",
        code: "submitting",
        message: "Sending submission...",
        retryable: false,
      });
      const submitResponse = await requestJson(
        new URL(mapping.submitPath, metadata.apiBaseUrl).href,
        {
          method: "POST",
          headers: publicHeaders(preflight.ticket),
          body: JSON.stringify({
            submissionId: preflight.submissionId,
            correlationId: preflight.correlationId,
            fieldContractVersion: preflight.fieldContractVersion,
            formData: {
              ...values.fields,
              [mapping.consentField]: true,
              [mapping.honeypotField]: "",
            },
          }),
          credentials: "omit",
          cache: "no-store",
          mode: "cors",
          referrerPolicy: "strict-origin",
        },
        { fetchImpl, timeoutMs },
      );
      if (submitResponse?.success !== true
        || submitResponse?.submissionId !== preflight.submissionId
        || submitResponse?.correlationId !== preflight.correlationId) {
        throw new PublicFormError("submit_response_invalid", "The submission response was invalid.", true);
      }

      identity.completed = true;
      return succeed(
        form,
        "submitted",
        "Submission received.",
        safePublicReceipt(submitResponse),
      );
    } catch (error) {
      const normalized = normalizeError(error);
      return fail(form, normalized.code, normalized.message, normalized.retryable);
    }
  }

  function readMetadata(documentRef) {
    const node = documentRef?.querySelector?.("script[data-pumpkin-public-metadata]");
    if (!node?.textContent) throw new PublicFormError("metadata_missing", "Public form metadata is unavailable.", false);
    let metadata;
    try {
      metadata = JSON.parse(node.textContent);
    } catch {
      throw new PublicFormError("metadata_invalid", "Public form metadata is invalid.", false);
    }
    const allowedKeys = [
      "apiBaseUrl",
      "indexingState",
      "publicFormMapping",
      "publicMode",
      "publicationId",
      "releaseId",
      "tenantUid",
    ];
    const actualKeys = Object.keys(metadata).sort();
    if (JSON.stringify(actualKeys) !== JSON.stringify(allowedKeys)) {
      throw new PublicFormError("metadata_invalid", "Public form metadata is invalid.", false);
    }
    return metadata;
  }

  function resolveMapping(metadata, formId) {
    if (metadata.publicMode !== "preview-no-post" && metadata.publicMode !== "public-live") {
      throw new PublicFormError("public_mode_invalid", "This form is not configured for public submission.", false);
    }
    const mapping = metadata.publicFormMapping?.[formId];
    if (!mapping || !Array.isArray(mapping.fields)
      || typeof mapping.consentField !== "string"
      || typeof mapping.honeypotField !== "string"
      || typeof mapping.fieldContractVersion !== "string") {
      throw new PublicFormError("form_mapping_missing", "This form is not available.", false);
    }
    return mapping;
  }

  function activateForm(form, mapping) {
    const controls = [...form.querySelectorAll("[data-field-name]")];
    const expectedNames = new Set([
      ...mapping.fields.map((field) => field.name),
      mapping.consentField,
      mapping.honeypotField,
    ]);
    const actualNames = controls.map((control) => String(control.dataset.fieldName ?? ""));
    const submit = form.querySelector("[data-pumpkin-submit]");
    if (!submit || actualNames.length !== expectedNames.size
      || new Set(actualNames).size !== expectedNames.size
      || actualNames.some((name) => !expectedNames.has(name))) {
      throw new PublicFormError("form_controls_invalid", "This form is unavailable.", false);
    }
    for (const control of controls) control.setAttribute("name", control.dataset.fieldName);
    submit.type = "submit";
    submit.disabled = false;
    submit.setAttribute("aria-disabled", "false");
  }

  function deactivateForm(form) {
    for (const control of form.querySelectorAll?.("[data-field-name]") ?? []) control.removeAttribute?.("name");
    const submit = form.querySelector?.("[data-pumpkin-submit]");
    if (submit) {
      submit.type = "button";
      submit.disabled = true;
      submit.setAttribute?.("aria-disabled", "true");
    }
  }

  function collectValues(form, mapping) {
    const fields = {};
    const missingRequired = [];
    for (const field of mapping.fields ?? []) {
      const control = form.elements?.namedItem?.(field.name);
      const value = String(control?.value ?? "").trim();
      fields[field.name] = value;
      if (field.required && value.length === 0) missingRequired.push(field.name);
    }
    const consentControl = form.elements?.namedItem?.(mapping.consentField);
    const honeypotControl = form.elements?.namedItem?.(mapping.honeypotField);
    return {
      fields,
      missingRequired,
      consentAccepted: consentControl?.checked === true,
      honeypotValue: String(honeypotControl?.value ?? "").trim(),
    };
  }

  function getOrCreateLogicalIdentity(form, cryptoImpl) {
    const existing = logicalIdentities.get(form);
    if (existing) return existing;
    if (!cryptoImpl || typeof cryptoImpl.randomUUID !== "function") {
      throw new PublicFormError("secure_random_unavailable", "Secure submission identity is unavailable.", true);
    }
    const identity = {
      clientIdempotencySeed: cryptoImpl.randomUUID().toLowerCase(),
      completed: false,
    };
    if (!isCanonicalUuid(identity.clientIdempotencySeed)) {
      throw new PublicFormError("secure_random_invalid", "Secure submission identity is unavailable.", true);
    }
    logicalIdentities.set(form, identity);
    return identity;
  }

  async function requestJson(url, init, { fetchImpl, timeoutMs }) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetchImpl(url, { ...init, signal: controller.signal });
      const text = await response.text();
      if (text.length > MAX_RESPONSE_BYTES) {
        throw new PublicFormError("response_too_large", "The server response was too large.", true);
      }
      const parsed = text ? JSON.parse(text) : {};
      if (!response.ok) {
        const code = safeCode(parsed?.errorCode) ?? `http_${response.status}`;
        const retryable = typeof parsed?.retryable === "boolean"
          ? parsed.retryable
          : response.status >= 500 || response.status === 429;
        throw new PublicFormError(code, "The submission could not be completed.", retryable);
      }
      return parsed;
    } catch (error) {
      if (error?.name === "AbortError") {
        throw new PublicFormError("request_timeout", "The request timed out. Please retry.", true);
      }
      if (error instanceof PublicFormError) throw error;
      throw new PublicFormError("transport_error", "The submission could not be completed.", true);
    } finally {
      clearTimeout(timeout);
    }
  }

  function publicHeaders(ticket) {
    const headers = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };
    if (ticket) headers["X-Pumpkin-Public-Form-Ticket"] = ticket;
    return headers;
  }

  function validatePreflightResponse(value, mapping) {
    if (value?.ready !== true || value?.createsFormEntry !== false) {
      throw new PublicFormError("preflight_not_ready", "The form is not ready for submission.", true);
    }
    if (typeof value.ticket !== "string" || value.ticket.length < 8 || value.ticket.length > 4096) {
      throw new PublicFormError("ticket_invalid", "The submission ticket was invalid.", false);
    }
    if (!isCanonicalUuid(value.submissionId) || !isCanonicalUuid(value.correlationId)) {
      throw new PublicFormError("preflight_identity_invalid", "The submission identity was invalid.", false);
    }
    if (typeof value.fieldContractVersion !== "string"
      || value.fieldContractVersion !== mapping.fieldContractVersion) {
      throw new PublicFormError("field_contract_mismatch", "The form contract changed. Refresh and retry.", false);
    }
    return {
      ticket: value.ticket,
      submissionId: value.submissionId.toLowerCase(),
      correlationId: value.correlationId.toLowerCase(),
      fieldContractVersion: value.fieldContractVersion,
    };
  }

  function boundedTimeout(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return DEFAULT_TIMEOUT_MS;
    return Math.min(15000, Math.max(1, Math.floor(number)));
  }

  function succeed(form, code, message, receipt = null) {
    const result = { ok: true, state: "success", code, message, retryable: false, receipt };
    renderStatus(form, result);
    return result;
  }

  function fail(form, code, message, retryable) {
    const result = { ok: false, state: "error", code, message, retryable: Boolean(retryable), receipt: null };
    renderStatus(form, result);
    return result;
  }

  function renderStatus(form, result) {
    const status = form.querySelector?.("[data-pumpkin-form-status]");
    if (!status) return;
    status.dataset.state = result.state;
    status.dataset.code = result.code;
    status.dataset.retryable = String(Boolean(result.retryable));
    status.textContent = result.message;
  }

  function safePublicReceipt(value) {
    if (!value || typeof value !== "object") return null;
    const receipt = {};
    for (const key of ["formEntryId", "submissionId", "correlationId"]) {
      if (typeof value[key] === "string" && value[key].length <= 128) receipt[key] = value[key];
    }
    if (typeof value.idempotentReplay === "boolean") receipt.idempotentReplay = value.idempotentReplay;
    return Object.keys(receipt).length > 0 ? receipt : null;
  }

  function isCanonicalUuid(value) {
    return typeof value === "string"
      && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  }

  function safeCode(value) {
    return typeof value === "string" && /^[a-z0-9_-]{1,64}$/i.test(value) ? value : null;
  }

  function normalizeError(error, fallbackCode = "client_error") {
    if (error instanceof PublicFormError) return error;
    return new PublicFormError(fallbackCode, "The submission could not be completed.", fallbackCode === "client_error");
  }

  class PublicFormError extends Error {
    constructor(code, message, retryable) {
      super(message);
      this.name = "PublicFormError";
      this.code = code;
      this.retryable = Boolean(retryable);
    }
  }

  const publicApi = Object.freeze({
    mount,
    submitForm,
    version: "1.0.0",
  });
  globalThis.PumpkinPublicFormClient = publicApi;

  if (globalThis.document) {
    if (globalThis.document.readyState === "loading") {
      globalThis.document.addEventListener("DOMContentLoaded", () => mount(globalThis.document), { once: true });
    } else {
      mount(globalThis.document);
    }
  }
})();
