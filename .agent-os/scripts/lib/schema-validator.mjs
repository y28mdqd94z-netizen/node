export function validateSchema(schema, data, path = "$") {
  const errors = [];
  validate(schema, data, path, errors, schema);
  return errors;
}

function validate(schema, data, path, errors, rootSchema) {
  if (!schema) {
    return;
  }

  if (schema.$ref) {
    const resolved = resolveRef(rootSchema, schema.$ref);
    if (!resolved) {
      errors.push(`${path}: Unresolved $ref ${schema.$ref}`);
      return;
    }
    validate(resolved, data, path, errors, rootSchema);
    return;
  }

  if (schema.anyOf) {
    const anyValid = schema.anyOf.some((subschema) => {
      const subErrors = [];
      validate(subschema, data, path, subErrors, rootSchema);
      return subErrors.length === 0;
    });
    if (!anyValid) {
      errors.push(`${path}: Value does not match anyOf schemas.`);
    }
  }

  if (schema.type) {
    const allowed = Array.isArray(schema.type) ? schema.type : [schema.type];
    const validType = allowed.some((t) => matchesType(data, t));
    if (!validType) {
      errors.push(`${path}: Expected type ${allowed.join("|")}.`);
      return;
    }
  }

  if (schema.enum) {
    if (!schema.enum.includes(data)) {
      errors.push(`${path}: Expected one of ${schema.enum.join(", ")}.`);
      return;
    }
  }

  if (schema.minLength !== undefined && typeof data === "string") {
    if (data.length < schema.minLength) {
      errors.push(`${path}: Expected string length >= ${schema.minLength}.`);
      return;
    }
  }

  if (schema.pattern && typeof data === "string") {
    const regex = new RegExp(schema.pattern);
    if (!regex.test(data)) {
      errors.push(`${path}: Value does not match pattern ${schema.pattern}.`);
      return;
    }
  }

  if (schema.type === "array" && schema.items && Array.isArray(data)) {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push(`${path}: Expected array length >= ${schema.minItems}.`);
    }
    data.forEach((item, index) => {
      validate(schema.items, item, `${path}[${index}]`, errors, rootSchema);
    });
    return;
  }

  if (schema.type === "object" && isPlainObject(data)) {
    if (schema.required) {
      schema.required.forEach((key) => {
        if (!(key in data)) {
          errors.push(`${path}: Missing required property '${key}'.`);
        }
      });
    }

    const properties = schema.properties || {};
    const additional = schema.additionalProperties;

    Object.keys(data).forEach((key) => {
      if (properties[key]) {
        validate(properties[key], data[key], `${path}.${key}`, errors, rootSchema);
      } else if (additional === false) {
        errors.push(`${path}: Unexpected property '${key}'.`);
      } else if (additional) {
        validate(additional, data[key], `${path}.${key}`, errors, rootSchema);
      }
    });
  }
}

function resolveRef(schema, ref) {
  if (!ref.startsWith("#/")) return null;
  const parts = ref.slice(2).split("/");
  let current = schema;
  for (const part of parts) {
    if (!current || typeof current !== "object") return null;
    current = current[part];
  }
  return current || null;
}

function matchesType(value, type) {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number" && !Number.isNaN(value);
    case "integer":
      return Number.isInteger(value);
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "object":
      return isPlainObject(value);
    default:
      return false;
  }
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
