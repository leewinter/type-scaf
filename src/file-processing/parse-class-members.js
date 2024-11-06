const parseTypeFromNode = require("./parse-type-from-node");

const parseClassMembers = (classDeclaration) => {
  const properties = [];
  const constructor = classDeclaration.getConstructors()[0];

  if (!constructor) {
    console.warn("No constructor found for class:", classDeclaration.getName());
    return properties;
  }

  if (constructor) {
    const parameters = constructor.getParameters();
    const statements = constructor.getBody().getStatements();

    statements.forEach((statement) => {
      if (statement.getKindName() === "ExpressionStatement") {
        const expression = statement.getExpression();
        if (expression.getKindName() === "BinaryExpression") {
          const leftSide = expression.getLeft().getText();

          if (leftSide.startsWith("this.")) {
            const propertyName = leftSide.replace("this.", "");
            const matchingParam = parameters.find(
              (param) => param.getName() === propertyName
            );

            let propertyType = { htmlType: "text", yupType: "string" };
            let isPrimaryKey = false;
            let isRequired = false;
            let isOptionsLabel = false;
            let subProperties = null;

            const classProperty = classDeclaration.getProperty(propertyName);
            if (classProperty) {
              const primaryKeyDecorator =
                classProperty.getDecorator("primaryKey");
              const requiredDecorator = classProperty.getDecorator("required");
              const optionsLabelDecorator =
                classProperty.getDecorator("optionsLabel");

              if (primaryKeyDecorator) {
                isPrimaryKey = true;
              }
              if (requiredDecorator) {
                isRequired = true;
              }
              if (optionsLabelDecorator) {
                isOptionsLabel = true;
              }
            }

            if (matchingParam) {
              const typeNode = matchingParam.getTypeNode();
              if (typeNode) {
                propertyType = parseTypeFromNode(typeNode);

                // Check if the type is a class or interface and parse sub-properties
                if (
                  (propertyType.htmlType === "select" ||
                    propertyType.htmlType === "multi-select") &&
                  typeNode.getType().isClassOrInterface()
                ) {
                  const innerType = typeNode.getType();
                  const innerDeclarations = innerType
                    .getSymbol()
                    .getDeclarations();

                  if (innerDeclarations.length > 0) {
                    // Recursively parse inner class or interface to get its properties
                    subProperties = parseClassMembers(innerDeclarations[0]);
                  }
                }
              }
            }

            properties.push({
              name: propertyName,
              label:
                propertyName.charAt(0).toUpperCase() + propertyName.slice(1),
              type: propertyType.htmlType,
              yupType: propertyType.yupType,
              required: isRequired,
              primaryKey: isPrimaryKey,
              optionsLabel: isOptionsLabel,
              properties: subProperties, // Use the populated subProperties
            });
          }
        }
      }
    });
  }

  return properties;
};

module.exports = parseClassMembers;
