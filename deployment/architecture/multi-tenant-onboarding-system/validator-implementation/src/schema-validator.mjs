import { createFinding } from "./gate-status.mjs";
import { ErrorCode } from "./error-codes.mjs";

export function validateParsedDocuments(parsedDocuments, schemaRegistry) {
  const findings = [];

  for (const document of parsedDocuments.values()) {
    const schemaRecord = schemaRegistry.get(document.role);
    if (!schemaRecord) {
      findings.push(
        createFinding({
          severity: "warning",
          code: "SCHEMA_NOT_FOUND",
          file: document.relativePath,
          message: `No schema is mapped for ${document.relativePath}.`,
          ownerExplanation: "The skeleton validator could not find a matching schema for this file.",
          operatorDetail: `Role ${document.role} is not in the schema registry.`,
          nextAction: "Add a schema mapping before relying on this file for import validation.",
          gateId: "schema-validation",
          blocksGate: false
        })
      );
      continue;
    }

    const errors = validateValue(document.data, schemaRecord.schema, "");
    for (const error of errors) {
      findings.push(
        createFinding({
          severity: "error",
          code: ErrorCode.SCHEMA_VALIDATION_ERROR,
          file: document.relativePath,
          jsonPointer: error.pointer || "/",
          field: error.field,
          message: `${document.relativePath}${error.pointer || "/"} ${error.message}`,
          ownerExplanation: toOwnerMessage(document.relativePath, error),
          operatorDetail: error.detail,
          nextAction: error.nextAction,
          gateId: "schema-validation"
        })
      );
    }
  }

  return findings;
}

function validateValue(value, schema, pointer) {
  const errors = [];

  if (!schema || typeof schema !== "object") {
    return errors;
  }

  if (schema.const !== undefined && value !== schema.const) {
    errors.push(makeError(pointer, "must match the required constant value", `Expected constant ${JSON.stringify(schema.const)}.`, "Use the required template value."));
    return errors;
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(makeError(pointer, `must be one of: ${schema.enum.join(", ")}`, `Value ${JSON.stringify(value)} is outside the allowed enum.`, "Choose one of the allowed values from the schema."));
    return errors;
  }

  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(makeError(pointer, `must be ${schema.type}`, `Actual type was ${Array.isArray(value) ? "array" : typeof value}.`, "Replace the value with the expected JSON type."));
    return errors;
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(makeError(pointer, `must be at least ${schema.minLength} characters`, `String length was ${value.length}.`, "Add a longer value."));
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push(makeError(pointer, `must be at most ${schema.maxLength} characters`, `String length was ${value.length}.`, "Shorten the value."));
    }
    if (schema.pattern) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push(makeError(pointer, `must match pattern ${schema.pattern}`, `Value did not match pattern ${schema.pattern}.`, "Use the format required by the template."));
      }
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(makeError(pointer, `must include at least ${schema.minItems} item(s)`, `Array length was ${value.length}.`, "Add the required item."));
    }
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) {
      errors.push(makeError(pointer, "must not include duplicate items", "The array contains duplicate values.", "Remove duplicate values."));
    }
    if (schema.items) {
      value.forEach((item, index) => {
        errors.push(...validateValue(item, schema.items, `${pointer}/${index}`));
      });
    }
  }

  if (isPlainObject(value)) {
    const required = schema.required ?? [];
    for (const key of required) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(makeError(`${pointer}/${escapePointer(key)}`, "is required", `Missing required property ${key}.`, `Add ${key} from the package template.`));
      }
    }

    const properties = schema.properties ?? {};
    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push(makeError(`${pointer}/${escapePointer(key)}`, "is not allowed by the schema", `Unexpected property ${key}.`, "Remove the unsupported field or add it through an approved extension schema."));
        }
      }
    }

    for (const [key, childSchema] of Object.entries(properties)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(...validateValue(value[key], childSchema, `${pointer}/${escapePointer(key)}`));
      }
    }

    if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
      for (const [key, childValue] of Object.entries(value)) {
        if (!Object.prototype.hasOwnProperty.call(properties, key)) {
          errors.push(...validateValue(childValue, schema.additionalProperties, `${pointer}/${escapePointer(key)}`));
        }
      }
    }
  }

  return errors;
}

function matchesType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "object") return isPlainObject(value);
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function makeError(pointer, message, detail, nextAction) {
  const field = pointer ? pointer.split("/").filter(Boolean).pop() : null;
  return {
    pointer,
    field: field ? unescapePointer(field) : null,
    message,
    detail,
    nextAction
  };
}

function toOwnerMessage(file, error) {
  const location = error.pointer || "/";
  return `${file} has a value at ${location} that does not match the approved import package template.`;
}

function escapePointer(value) {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}

function unescapePointer(value) {
  return String(value).replaceAll("~1", "/").replaceAll("~0", "~");
}
