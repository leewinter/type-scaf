const typeMappings = require("./type-mappings");
const logger = require("../utils/logger");
const { parseSubProperties } = require("./parse-helpers");

/**
 * Parses the type from a given type node.
 *
 * @param {TypeNode} typeNode - The TypeScript type node to be parsed.
 * @param {Function} parseClassMembers - Function to parse class members, passed as a parameter to avoid circular dependencies.
 * @returns {Object} An object containing type information for HTML and validation.
 */
const parseTypeFromNode = (typeNode, parseClassMembers) => {
  try {
    logger.info(`Parsing type from node: ${typeNode.getText()}`);

    // Remove nullable unions (e.g., "| null") to get the core type
    const typeText = typeNode.getText().replace(/\s*\|\s*null/g, "");

    // Check if the type is directly mapped in typeMappings
    const matchedType = typeMappings[typeText];
    if (matchedType) {
      logger.info(
        `Matched type found in typeMappings for "${typeText}": ${JSON.stringify(matchedType)}`
      );
      return matchedType;
    }

    // Get the type from the typeNode
    const type = typeNode.getType();
    if (!type) {
      throw new Error(`Could not resolve type for typeNode "${typeText}".`);
    }

    // Handle array types as multi-select
    if (type.isArray()) {
      logger.info(`Type "${typeText}" is identified as an array.`);
      const elementType = type.getArrayElementType();
      if (!elementType) {
        throw new Error(
          `Could not resolve element type for array "${typeText}".`
        );
      }

      let subProperties = null;

      // If the array element is a class or object, get its properties
      if (elementType.isClassOrInterface() || elementType.isObject()) {
        const elementTypeSymbol = elementType.getSymbol();
        if (elementTypeSymbol) {
          try {
            subProperties = parseSubProperties(
              elementTypeSymbol,
              parseClassMembers
            );
          } catch (subPropertiesError) {
            logger.error(
              `Failed to parse sub-properties for array element "${typeText}":`,
              subPropertiesError.message
            );
            throw subPropertiesError;
          }
        } else {
          logger.error(
            `Error: Could not resolve symbol for element type in array "${typeText}".`
          );
          throw new Error(
            `Could not resolve symbol for element type in array "${typeText}".`
          );
        }
      }

      return { htmlType: "multi-select", yupType: "array", subProperties };
    }

    // Handle class or object types
    if (type.isClassOrInterface() || type.isObject()) {
      logger.info(`Type "${typeText}" is identified as a class or object.`);
      const typeSymbol = type.getSymbol();
      if (!typeSymbol) {
        throw new Error(
          `Could not resolve symbol for class or object type "${typeText}".`
        );
      }

      const subProperties = parseSubProperties(typeSymbol, parseClassMembers);
      return { htmlType: "select", yupType: "object", subProperties };
    }

    // Handle enum types as select dropdowns
    if (type.isEnum()) {
      logger.info(`Type "${typeText}" is identified as an enum.`);
      return { htmlType: "select", yupType: "string" };
    }

    // Default case: handle as a select type
    logger.warn(
      `Type "${typeText}" is not directly matched; defaulting to select type.`
    );
    return { htmlType: "select", yupType: "object" };
  } catch (error) {
    logger.error(
      `Error in parseTypeFromNode for type node "${typeNode.getText()}":`,
      error.message || error,
      error.stack
    );
    throw error; // Rethrow error so it can be caught and logged at a higher level.
  }
};

module.exports = parseTypeFromNode;
