// /src/runtime/verifyContract.js

import { assert } from './assert.js'
import { ValidationError } from './errors.js'

/**
 * Verifies that a CTX object provided by a Shell satisfies the requirements
 * of a Spore's contract.
 *
 * @param {object} ctx The Shell's context object.
 * @param {object} contract The Spore's contract object.
 * @returns {true} Returns true if the contract is satisfied.
 * @throws {ValidationError} Throws a ValidationError if the contract is not satisfied.
 */
export function verifyContract(ctx, contract) {
  // Define the top-level sections a contract can have.
  const sections = ['state', 'data', 'services']

  for (const section of sections) {
    // Check if the contract has requirements for this section.
    if (contract[section]) {
      // Check if the CTX provides this section.
      if (!ctx[section]) {
        throw new ValidationError({
          property: section,
          rule: 'required',
          message: `Contract requires a '${section}' section, but it's missing from the CTX.`,
        })
      }

      // Use our powerful assert function to validate this section of the CTX
      // against the corresponding section of the contract.
      assert(ctx[section], contract[section])
    }
  }

  return true
}
