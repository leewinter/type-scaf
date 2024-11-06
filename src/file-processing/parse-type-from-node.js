const typeMappings = require("./type-mappings");

const parseTypeFromNode = (typeNode) => {
  const parseClassMembers = require("./parse-class-members"); // Lazy load to prevent circular dependency
  const typeText = typeNode.getText().replace(/\s*\|\s*null/g, ""); // Strip "| null" for matching
  let matchedType = typeMappings[typeText];

  if (matchedType) {
    return matchedType; // Return if found in typeMappings
  }

  const type = typeNode.getType();

  // Handle multi-select type by checking if it's an array
  if (type.isArray()) {
    const elementType = type.getArrayElementType();
    let subProperties = null;

    // Check if the element type is a class or interface
    if (
      elementType &&
      (elementType.isClassOrInterface() || elementType.isObject())
    ) {
      const innerTypeSymbol = elementType.getSymbol();
      if (innerTypeSymbol) {
        subProperties = parseClassMembers(innerTypeSymbol.getDeclarations()[0]);
      }
    }

    return { htmlType: "multi-select", yupType: "array", subProperties };
  }

  // Handle select type if it's a class or object
  if (type.isClassOrInterface() || type.isObject()) {
    const properties = type.getProperties();
    if (properties.length) {
      const innerTypeSymbol = type.getSymbol();
      let subProperties = null;
      if (innerTypeSymbol) {
        subProperties = parseClassMembers(innerTypeSymbol.getDeclarations()[0]);
      }
      return { htmlType: "select", yupType: "object", subProperties };
    }
  } else if (type.isEnum()) {
    return { htmlType: "select", yupType: "string" };
  }

  return { htmlType: "select", yupType: "object" };
};

module.exports = parseTypeFromNode;
