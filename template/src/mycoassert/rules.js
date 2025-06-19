// /src/runtime/rules.js

/**
 * The Rules Engine for MycoAssert.
 * This object maps rule names to pure validation functions.
 * Each function takes the value to be tested and the rule's argument.
 * It returns `true` if the validation passes, `false` otherwise.
 */
export const rulesEngine = {
  /**
   * Checks the JavaScript typeof the value.
   * @param {any} value - The input value.
   * @param {'string'|'number'|'boolean'|'object'|'undefined'} expectedType - The expected type.
   * @returns {boolean}
   */
  type: (value, expectedType) => typeof value === expectedType,

  /**
   * Checks the minimum length of a string or array.
   * @param {string|any[]} value - The input string or array.
   * @param {number} min - The minimum allowed length.
   * @returns {boolean}
   */
  minLength: (value, min) => {
    if (typeof value !== 'string' && !Array.isArray(value)) return false
    return value.length >= min
  },

  /**
   * Checks the maximum length of a string or array.
   * @param {string|any[]} value - The input string or array.
   * @param {number} max - The maximum allowed length.
   * @returns {boolean}
   */
  maxLength: (value, max) => {
    if (typeof value !== 'string' && !Array.isArray(value)) return false
    return value.length <= max
  },

  /**
   * Checks if a number is an integer.
   * @param {any} value - The input value.
   * @returns {boolean}
   */
  isInteger: (value) => Number.isInteger(value),

  // --- NEW RULES BELOW ---

  /**
   * Checks the maximum value of a number.
   * @param {number} value - The input number.
   * @param {number} max - The maximum allowed value.
   * @returns {boolean}
   */
  max: (value, max) => value <= max,

  /**
   * Checks the minimum value of a number.
   * @param {number} value - The input number.
   * @param {number} min - The minimum allowed value.
   * @returns {boolean}
   */
  min: (value, min) => value >= min,

  /**
   * Checks if a string matches a regular expression.
   * @param {string} value - The input string.
   * @param {string} regexString - The regular expression pattern as a string.
   * @returns {boolean}
   */
  pattern: (value, regexString) => new RegExp(regexString).test(value),

  /**
   * Checks if a value is one of a set of allowed values.
   * @param {any} value - The input value.
   * @param {any[]} allowedValues - An array of allowed values.
   * @returns {boolean}
   */
  enum: (value, allowedValues) => allowedValues.includes(value),
  /**
   *
   * @param {any} value - The input value
   * @returns {boolean}
   */
  isFunction: (value) => typeof value === 'function',
}

/**
 * The Transformations Engine for MycoAssert.
 * Maps transform names to pure functions that modify a value.
 */
export const transformsEngine = {
  /**
   * Trims leading/trailing whitespace from a string.
   * @param {any} value
   * @returns {string|any}
   */
  trim: (value) => (typeof value === 'string' ? value.trim() : value),

  /**
   * Converts a string to lowercase.
   * @param {any} value
   * @returns {string|any}
   */
  toLowerCase: (value) => (typeof value === 'string' ? value.toLowerCase() : value),

  /**
   * Parses a value into an integer. Returns NaN on failure.
   * @param {any} value
   * @returns {number|any}
   */
  toInt: (value) => parseInt(value, 10),
}
