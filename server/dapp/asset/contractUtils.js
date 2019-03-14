const { rest6: rest } = require('blockapps-rest');

/**
 * Wait until contract with given address became available for search.
 * @param {string} contractName contract name.
 * @param {string} address contract address.
 * @returns {Object} contract state.
 */
async function waitForAddress(contractName, address) {
  const result = await rest.waitQuery(`${contractName}?address=eq.${address}`, 1);
  return result[0];
}

module.exports = {
  waitForAddress,
}
