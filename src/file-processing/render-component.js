const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const loadSettings = require("./load-settings");
const getPrettierParser = require("../services/prettier-parse-service");
const prettier = require("prettier");
const { resilientWrite } = require("../utils/file-copy");
const logger = require("../utils/logger");
const { generateMockArray } = require("../services/mock-data-service");

const renderComponent = (className, properties, testMode) => {
  logger.info(`Starting to render component for class: ${className}`);

  const settings = loadSettings();

  const componentData = prepareComponentData(className, properties, settings);

  for (const template of settings.transformTemplates) {
    renderFile(
      getTemplatePath(settings.templateType, template.templateFileName),
      componentData,
      getOutputDirectory(template.outputDirectory, className, testMode),
      template.generatedFileName.replace("{{className}}", className),
      `${className} list component file`
    );
  }

  if (settings.generateDebugTypes.enabled === true) {
    generateDebugFile(
      getRuntimePath(settings.generateDebugTypes.outputPath, testMode),
      className,
      componentData
    );
  }

  logger.info(`Completed rendering component for class: ${className}`);
};

const prepareComponentData = (className, properties, settings) => {
  logger.info(`Preparing component data for class: ${className}`);

  const options = {};
  const defaultValues = {};
  const mockData = generateMockArray(5, properties, className);

  // Generate options for relational properties
  properties.forEach((type) => {
    if (
      !type.primaryKey &&
      (type.type === "multi-select" || type.type === "select")
    ) {
      logger.info(`Generating options for property: ${type.name}`);
      options[type.name] = generateMockArray(
        4,
        type.properties || [],
        type.name
      );
    }
  });

  // Generate default values using the generated options
  properties.forEach((type) => {
    if (!type.primaryKey) {
      logger.info(`Generating default value for property: ${type.name}`);

      if (type.type === "multi-select" || type.type === "select") {
        // Assign the default value as a reference to an option from the generated options
        const generatedOptions = options[type.name];
        if (generatedOptions && generatedOptions.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * generatedOptions.length
          );
          defaultValues[type.name] =
            type.type === "multi-select"
              ? [generatedOptions[randomIndex].value]
              : generatedOptions[randomIndex].value;
        }
      } else {
        // For non-relational properties, use the generateDefaultValue function
        defaultValues[type.name] = generateDefaultValue(type);
      }
    }
  });

  return {
    types: properties,
    baseRestApiUrl: settings.baseRestApiUrl,
    className,
    defaultValues,
    options,
    mockData,
  };
};

const generateDefaultValue = (type) => {
  switch (type.yupType) {
    case "string":
      return "";
    case "number":
      return 0;
    case "date":
      return new Date().toISOString();
    case "array":
      return [];
    case "object":
      return {};
    default:
      return "";
  }
};

const getOutputDirectory = (relativePath, className, testMode) => {
  return path.join(
    process.cwd(),
    `${testMode ? "." : ""}${relativePath.replace("{{className}}", className)}`
  );
};

const getRuntimePath = (relativePath, testMode) => {
  return path.join(process.cwd(), `${testMode ? "." : ""}${relativePath}`);
};

const getTemplatePath = (templateType, fileName) => {
  return path.join(
    process.cwd(),
    ".type-scaf",
    "templates",
    templateType,
    fileName
  );
};

const renderFile = (
  templatePath,
  data,
  outputDirectory,
  outputFileName,
  logName
) => {
  ejs.renderFile(templatePath, data, async (err, str) => {
    if (err) {
      logger.error(`Error generating ${logName}:`, err);
      return;
    }

    const outputPath = path.join(outputDirectory, `${outputFileName}.jsx`);

    try {
      const parser = getPrettierParser(outputPath);
      const formattedCode = await prettier.format(str, { parser });

      resilientWrite(outputPath, formattedCode);
      logger.info(`${outputFileName}.jsx generated successfully.`);
    } catch (error) {
      logger.error(`Error formatting or writing ${logName}:`, error);
    }
  });
};

const generateDebugFile = (outputDirectory, className, properties) => {
  const debugFilePath = path.join(outputDirectory, `${className}.debug.json`);
  const debugData = {
    className,
    properties,
  };

  fs.mkdir(outputDirectory, { recursive: true }, (err) => {
    if (err) {
      logger.error(`Error creating output directory for ${className}:`, err);
      return;
    }

    fs.writeFile(debugFilePath, JSON.stringify(debugData, null, 2), (err) => {
      if (err) {
        logger.error(`Error generating debug file for ${className}:`, err);
      } else {
        logger.info(`${className}.debug.json generated successfully.`);
      }
    });
  });
};

module.exports = renderComponent;
