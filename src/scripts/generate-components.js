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
                  subProperties = parseClassMembers(
                    innerType.getSymbol().getDeclarations()[0]
                  );
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
              properties: propertyType.subProperties || subProperties, // Include nested properties if applicable
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

  // Generate default values and options before rendering the template
  const defaultValues = {};
  const options = {};

  const generateMockData = (subProperties, index = 0) => {
    const mockData = {};
    subProperties.forEach((prop) => {
      if (prop.yupType === "string") {
        mockData[prop.name] = `${prop.label || prop.name} Example ${index}`;
      } else if (prop.yupType === "number") {
        mockData[prop.name] = Math.floor(Math.random() * 100) + index;
      } else if (prop.yupType === "date") {
        mockData[prop.name] = new Date();
      } else if (prop.yupType === "array") {
        mockData[prop.name] = [];
      } else if (prop.yupType === "object") {
        mockData[prop.name] = null;
      }
    });
    return mockData;
  };

  const generateOptions = (subProperties) => {
    return Array(2)
      .fill(null)
      .map((_, index) => {
        const mockObject = generateMockData(subProperties, index);
        const labelProp = subProperties.find((prop) => prop.optionsLabel);

        // Use a unique combination of the index, random part, and a property value if available
        const uniquePart = Math.random().toString(36).substr(2, 5);
        const keyBase = labelProp
          ? mockObject[labelProp.name]
          : `Unknown-${index}`;
        const uniqueId = `${keyBase}-${index}-${uniquePart}`;

        return {
          value: mockObject,
          label: labelProp
            ? mockObject[labelProp.name]
            : `Unknown Label ${index}`,
          key: uniqueId,
        };
      });
  };

  properties.forEach((type) => {
    if (!type.primaryKey) {
      // Generate default values based on type
      defaultValues[type.name] =
        type.yupType === "string"
          ? ""
          : type.yupType === "number"
            ? 0
            : type.yupType === "date"
              ? new Date()
              : type.yupType === "array"
                ? []
                : type.yupType === "object"
                  ? null
                  : "";

      // Generate options for select and multi-select types
      if (type.type === "multi-select" || type.type === "select") {
        options[type.name] = generateOptions(type.properties || []);
      }
    }
  });

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

  const outputDirectory = path.join(
    process.cwd(),
    settings.generatedOutputDirectory,
    className // Create a folder with the className
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
    const outputPath = path.join(outputDirectory, `${outputFileName}.jsx`);

    const parser = getPrettierParser(outputPath);
    const formattedCode = await prettier.format(str, { parser });

    resilientWrite(outputPath, formattedCode);
    console.log(
      `${outputFileName}.jsx generated successfully in ${className} folder.`
    );
  });

  // Render Storybook file with precomputed default values and options
  ejs.renderFile(
    storyTemplatePath,
    { ...componentData, defaultValues, options },
    async (err, str) => {
      if (err) {
        console.error(`Error generating ${className} Storybook file:`, err);
        return;
      }

      const storyFileName = settings.generatedStoryFileName.replace(
        "{{className}}",
        className
      );
      const storyOutputPath = path.join(
        outputDirectory,
        `${storyFileName}.jsx`
      );

      const parser = getPrettierParser(storyOutputPath);
      const formattedCode = await prettier.format(str, { parser });

      resilientWrite(storyOutputPath, formattedCode);
      console.log(
        `${storyFileName}.jsx generated successfully in ${className} folder.`
      );
    }
  );

  // Generate debug file with the metadata of each type if settings.generateDebugTypes is true
  if (settings.generateDebugTypes === true) {
    const debugFilePath = path.join(outputDirectory, `${className}.debug.json`);
    const debugData = {
      className,
      properties,
    };

    fs.mkdir(outputDirectory, { recursive: true }, (err) => {
      if (err) {
        console.error(`Error creating output directory for ${className}:`, err);
        return;
      }

      fs.writeFile(debugFilePath, JSON.stringify(debugData, null, 2), (err) => {
        if (err) {
          console.error(`Error generating debug file for ${className}:`, err);
        } else {
          console.log(`${className}.debug.json generated successfully.`);
        }
      });
    });
  }
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
