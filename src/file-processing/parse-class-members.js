const parseTypeFromNode = require("./parse-type-from-node");
const logger = require("../utils/logger");

/**
 * Parses class members from a given class declaration.
 *
 * @param {ClassDeclaration} classDeclaration - The TypeScript class declaration.
 * @returns {Array} An array of properties parsed from the class.
 */
const parseClassMembers = (classDeclaration) => {
  const properties = [];
  const constructor = classDeclaration.getConstructors()[0];

  if (!constructor) {
    logger.warn(
      `No constructor found for class: ${classDeclaration.getName()}`
    );
    return properties;
  }

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

          if (!matchingParam) {
            logger.warn(
              `No matching parameter found for property "${propertyName}" in class "${classDeclaration.getName()}"`
            );
            return; // Skip if there is no matching parameter
          }

          let propertyType = { htmlType: "text", yupType: "string" };
          let isPrimaryKey = false;
          let isRequired = false;
          let isOptionsLabel = false;
          let subProperties = null;

          try {
            const classProperty = classDeclaration.getProperty(propertyName);
            if (classProperty) {
              const primaryKeyDecorator =
                classProperty.getDecorator("primaryKey");
              const requiredDecorator = classProperty.getDecorator("required");
              const optionsLabelDecorator =
                classProperty.getDecorator("optionsLabel");

              isPrimaryKey = !!primaryKeyDecorator;
              isRequired = !!requiredDecorator;
              isOptionsLabel = !!optionsLabelDecorator;
            }

            const typeNode = matchingParam.getTypeNode();
            if (typeNode) {
              propertyType = parseTypeFromNode(typeNode, parseClassMembers);
            }
          } catch (error) {
            logger.error(
              `Error parsing type for property "${propertyName}" in class "${classDeclaration.getName()}":`,
              error.message || error
            );
            return; // Skip this property if there is an error
          }

          properties.push({
            name: propertyName,
            label: propertyName.charAt(0).toUpperCase() + propertyName.slice(1),
            type: propertyType.htmlType,
            yupType: propertyType.yupType,
            required: isRequired,
            primaryKey: isPrimaryKey,
            optionsLabel: isOptionsLabel,
            properties: subProperties,
          });
        }
      }
    }
  });

  return properties;
};

module.exports = parseClassMembers;
