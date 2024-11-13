const logger = require("../utils/logger");
const renderComponent = require("../file-processing/render-component");

const processNode = (node, parseClassMembers, parseTypeFromNode) => {
  const kindName = node.getKindName();

  if (kindName === "EndOfFileToken") {
    logger.warn(`Skipping ${kindName} node.`);
    return;
  }

  if (kindName === "ClassDeclaration") {
    const className = node.getName();
    logger.info(`Processing class: ${className}`);

    const properties = parseClassMembers(node, parseTypeFromNode);

    if (properties.length > 0) {      
      renderComponent(className, properties);
    } else {
      logger.warn(`No properties found for class ${className}`);
    }
  } else {
    logger.info(`Unhandled node kind: ${kindName}`);
  }
};

module.exports = processNode;
