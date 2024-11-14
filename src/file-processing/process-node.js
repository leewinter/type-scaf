const logger = require("../utils/logger");
const parseClassMembers = require("../file-processing/parse-class-members");
const renderComponent = require("../file-processing/render-component");

const processNode = (node, testMode, templateType) => {
  const kindName = node.getKindName();

  if (kindName === "EndOfFileToken") {
    logger.warn(`Skipping ${kindName} node.`);
    return;
  }

  if (kindName === "ClassDeclaration") {
    const className = node.getName();
    logger.info(`Processing class: ${className}`);

    const properties = parseClassMembers(node);

    if (properties.length > 0) {
      renderComponent(className, properties, testMode, templateType);
    } else {
      logger.warn(`No properties found for class ${className}`);
    }

    return;
  }

  logger.info(`Unhandled node kind: ${kindName}`);
  return;
};

module.exports = processNode;
