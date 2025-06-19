// /src/runtime/errors.js

/**
 * A custom error class for detailed validation failures.
 * This allows for programmatic error handling.
 */
export class ValidationError extends Error {
  /**
   * @param {object} details - The details of the validation failure.
   * @param {string} details.property - The name of the property that failed validation.
   * @param {string} details.message - The human-readable error message.
   * @param {any} [details.value] - The value that failed validation.
   * @param {string} [details.rule] - The specific rule that failed.
   */
  constructor({ property, message, value, rule }) {
    // Call the parent Error constructor with the message
    super(message)

    // Set custom properties
    this.name = 'ValidationError' // Useful for identifying the error type
    this.property = property
    this.rule = rule
    this.value = value
  }
}
