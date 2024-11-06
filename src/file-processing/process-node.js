const parseClassMembers = require("./parse-class-members");
const renderComponent = require("./render-component");

const processNode = (node) => {
  const kindName = node.getKindName();

  if (kindName === "EndOfFileToken") {
    console.warn(`Skipping ${kindName} node.`);
    return;
  }

  if (kindName === "ClassDeclaration") {
    const className = node.getName();
    console.log(`Processing class: ${className}`);

    const properties = parseClassMembers(node);

    if (properties.length > 0) {
      renderComponent(className, properties);
    } else {
      console.warn(`No properties found for class ${className}`);
    }
  } else {
    console.log(`Unhandled node kind: ${kindName}`);
  }
};

module.exports = processNode;
