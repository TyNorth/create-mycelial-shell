import { rulesEngine, transformsEngine } from './rules.js'
import { ValidationError } from './errors.js'

/**
 * Validates and sanitizes data against a schema object at runtime.
 * Now supports inline nested object validation via a 'properties' keyword.
 * @param {object} data - The data object to validate.
 * @param {object} schema - The schema object for the current level of data.
 * @param {object} [allSchemas={}] - An object containing all available schemas for nesting.
 * @returns {object} The sanitized data object.
 */
export function assert(data, schema, allSchemas = {}) {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError({
      property: null,
      rule: 'type',
      message: 'Input data must be a non-null object.',
    })
  }

  const sanitizedData = { ...data }

  for (const schemaKey in schema) {
    const isOptional = schemaKey.endsWith('?')
    const propertyName = isOptional ? schemaKey.slice(0, -1) : schemaKey
    const rules = schema[schemaKey]

    if (!sanitizedData.hasOwnProperty(propertyName)) {
      if (isOptional) continue
      throw new ValidationError({
        property: propertyName,
        rule: 'required',
        message: `Required property '${propertyName}' is missing.`,
      })
    }

    if (rules.transform && Array.isArray(rules.transform)) {
      let currentValue = sanitizedData[propertyName]
      for (const transformName of rules.transform) {
        const transformFn = transformsEngine[transformName]
        if (transformFn) {
          currentValue = transformFn(currentValue)
        }
      }
      sanitizedData[propertyName] = currentValue
    }

    const value = sanitizedData[propertyName]

    if (allSchemas && allSchemas[rules.type]) {
      try {
        sanitizedData[propertyName] = assert(value, allSchemas[rules.type], allSchemas)
      } catch (error) {
        if (error instanceof ValidationError) {
          throw new ValidationError({
            property: `${propertyName}.${error.property}`,
            message: error.message,
            value: error.value,
            rule: error.rule,
          })
        } else {
          throw new Error(`Validation failed for '${propertyName}': ${error.message}`)
        }
      }
    } else {
      // --- NEW LOGIC: Handle inline nested object validation ---
      if (rules.properties) {
        // The property must be an object to check its properties.
        if (typeof value !== 'object' || value === null) {
          throw new ValidationError({
            property: propertyName,
            rule: 'type',
            message: `Property '${propertyName}' must be an object to validate its properties.`,
            value: value,
          })
        }
        // Recurse into the nested properties.
        sanitizedData[propertyName] = assert(value, rules.properties, allSchemas)
      }
      // --------------------------------------------------------

      for (const ruleName in rules) {
        // We've already handled 'transform' and the new 'properties' rule.
        if (ruleName === 'transform' || ruleName === 'properties') continue

        const ruleArgument = rules[ruleName]
        const validator = rulesEngine[ruleName]

        if (!validator) {
          throw new ValidationError({
            property: propertyName,
            rule: 'unknown',
            message: `Unknown validation rule: '${ruleName}'.`,
          })
        }
        if (!validator(value, ruleArgument)) {
          throw new ValidationError({
            property: propertyName,
            rule: ruleName,
            message: `Validation failed for rule '${ruleName}'.`,
            value: value,
          })
        }
      }
    }
  }
  return sanitizedData
}
