const logger = require("../utils/logger");

/**
 * Parses the sub-properties for a given symbol declaration.
 *
 * @param {Symbol} typeSymbol - The symbol representing the type to parse.
 * @param {Function} parseClassMembers - The function to parse class members.
 * @returns {Array} An array of parsed class members.
 */
const parseSubProperties = (typeSymbol, parseClassMembers) => {
  if (typeSymbol) {
    const declarations = typeSymbol.getDeclarations();
    if (declarations.length > 0) {
      return parseClassMembers(declarations[0]);
    }
  }
  return null;
};

module.exports = {
  parseSubProperties,
};
