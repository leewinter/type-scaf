const { Project } = require("ts-morph");
const path = require("path");
const ejs = require("ejs");
const prettier = require("prettier");
const { resilientWrite } = require("../utils/file");

const typeMappings = {
  string: { htmlType: "text", yupType: "string" },
  number: { htmlType: "number", yupType: "number" },
  Date: { htmlType: "date", yupType: "date" },
};

const parseTypeFromNode = (typeNode) => {
  const typeText = typeNode.getText().replace(/\s*\|\s*null/g, ""); // Strip "| null" for matching
  let matchedType = typeMappings[typeText];

  if (matchedType) {
    return matchedType; // Return if found in typeMappings
  }

  // Handle arrays generically
  if (typeText.endsWith("[]")) {
    return { htmlType: "multi-select", yupType: "array" };
  }

  // Fallback for custom objects or unknown types
  console.warn(
    `No specific type mapping found for ${typeText}, defaulting to object.`
  );
  return { htmlType: "select", yupType: "object" }; // Fallback for custom objects
};

const parseClassMembers = (classDeclaration) => {
  const properties = [];
  const constructor = classDeclaration.getConstructors()[0];

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
            if (matchingParam) {
              const typeNode = matchingParam.getTypeNode();
              if (typeNode) {
                propertyType = parseTypeFromNode(typeNode);
              }
            }

            properties.push({
              name: propertyName,
              label:
                propertyName.charAt(0).toUpperCase() + propertyName.slice(1),
              type: propertyType.htmlType,
              yupType: propertyType.yupType,
              required: true,
              primaryKey: false,
            });
          }
        }
      }
    });
  }

  return properties;
};

const getPrettierParser = (filePath) => {
  if (filePath.endsWith(".jsx")) return "babel";
  if (filePath.endsWith(".ts")) return "typescript";
  return "babel";
};

const renderComponent = (className, properties) => {
  const componentData = {
    componentName: `${className}Form`,
    types: properties,
  };

  const templatePath = path.join(
    process.cwd(),
    "type-scaf",
    "templates",
    "component.ejs"
  );

  ejs.renderFile(templatePath, componentData, async (err, str) => {
    if (err) {
      console.error(`Error generating ${className} component:`, err);
      return;
    }

    const settingsJsonPath = path.join(
      process.cwd(),
      "type-scaf",
      "config",
      "settings.json"
    );
    const settingsJson = require(settingsJsonPath);

    const outputPath = path.join(
      process.cwd(),
      settingsJson.generatedOutputDirectory,
      componentData.componentName,
      `${componentData.componentName}.jsx`
    );

    const parser = getPrettierParser(outputPath);
    const formattedCode = await prettier.format(str, { parser });

    resilientWrite(outputPath, formattedCode);
    console.log(`${componentData.componentName}.jsx generated successfully.`);
  });
};

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

module.exports = () => {
  const packageJsonPath = path.join(
    process.cwd(),
    "type-scaf",
    "config",
    "package-types.ts"
  );
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(packageJsonPath);

  sourceFile.forEachChild(processNode);
};
