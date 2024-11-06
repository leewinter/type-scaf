const { Project } = require("ts-morph");
const path = require("path");
const ejs = require("ejs");
const prettier = require("prettier");
const fs = require("fs");
const { resilientWrite } = require("../utils/file-copy");

// Load settings from settings.json globally
const settingsPath = path.join(
  process.cwd(),
  "type-scaf",
  "config",
  "settings.json"
);

const loadSettings = () => {
  const settings = require(settingsPath);
  return settings;
};

const typeMappings = {
  string: { htmlType: "text", yupType: "string" },
  number: { htmlType: "number", yupType: "number" },
  Date: { htmlType: "date", yupType: "date" },
  boolean: { htmlType: "checkbox", yupType: "boolean" },
  bigint: { htmlType: "number", yupType: "number" },
  symbol: { htmlType: "text", yupType: "string" },
  any: { htmlType: "text", yupType: "mixed" },
};

const parseTypeFromNode = (typeNode) => {
  const typeText = typeNode.getText().replace(/\s*\|\s*null/g, ""); // Strip "| null" for matching
  let matchedType = typeMappings[typeText];

  if (matchedType) {
    return matchedType; // Return if found in typeMappings
  }

  if (typeText.endsWith("[]")) {
    return { htmlType: "multi-select", yupType: "array" };
  }

  const type = typeNode.getType();
  if (type.isClassOrInterface() || type.isObject()) {
    const properties = type.getProperties();
    if (properties.length) {
      return { htmlType: "select", yupType: "object" };
    }
  } else if (type.isEnum()) {
    return { htmlType: "select", yupType: "string" };
  }

  return { htmlType: "select", yupType: "object" };
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
            let isPrimaryKey = false;
            let isRequired = false;

            const classProperty = classDeclaration.getProperty(propertyName);
            if (classProperty) {
              const primaryKeyDecorator =
                classProperty.getDecorator("primaryKey");
              const requiredDecorator = classProperty.getDecorator("required");

              if (primaryKeyDecorator) {
                isPrimaryKey = true;
              }
              if (requiredDecorator) {
                isRequired = true;
              }
            }

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
              required: isRequired,
              primaryKey: isPrimaryKey,
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

  const settings = loadSettings();

  const componentTemplatePath = path.join(
    process.cwd(),
    "type-scaf",
    "templates",
    "component.ejs"
  );

  const storyTemplatePath = path.join(
    process.cwd(),
    "type-scaf",
    "templates",
    "component.stories.ejs"
  );

  // Render main component file
  ejs.renderFile(componentTemplatePath, componentData, async (err, str) => {
    if (err) {
      console.error(`Error generating ${className} component:`, err);
      return;
    }

    const outputFileName = settings.generatedComponentFileName.replace(
      "{{className}}",
      className
    );
    const outputPath = path.join(
      process.cwd(),
      settings.generatedOutputDirectory,
      className, // Create a folder with the className
      `${outputFileName}.jsx`
    );

    const parser = getPrettierParser(outputPath);
    const formattedCode = await prettier.format(str, { parser });

    resilientWrite(outputPath, formattedCode);
    console.log(
      `${outputFileName}.jsx generated successfully in ${className} folder.`
    );
  });

  // Render Storybook file
  ejs.renderFile(storyTemplatePath, componentData, async (err, str) => {
    if (err) {
      console.error(`Error generating ${className} Storybook file:`, err);
      return;
    }

    const storyFileName = settings.generatedStoryFileName.replace(
      "{{className}}",
      className
    );
    const storyOutputPath = path.join(
      process.cwd(),
      settings.generatedOutputDirectory,
      className, // Use className for the folder
      `${storyFileName}.jsx`
    );

    const parser = getPrettierParser(storyOutputPath);
    const formattedCode = await prettier.format(str, { parser });

    resilientWrite(storyOutputPath, formattedCode);
    console.log(
      `${storyFileName}.js generated successfully in ${className} folder.`
    );
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

module.exports = {
  generateComponents: () => {
    const packageJsonPath = path.join(
      process.cwd(),
      "type-scaf",
      "config",
      "package-types.ts"
    );
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(packageJsonPath);

    sourceFile.forEachChild(processNode);
  },
  parseTypeFromNode,
};
