const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const loadSettings = require("./load-settings");
const getPrettierParser = require("./prettier-parse");
const prettier = require("prettier");
const { resilientWrite } = require("../utils/file-copy");
const logger = require("../utils/logger");

const {
  componentTemplatePath,
  storyTemplatePath,
  hookRestTemplatePath,
  hookLocalTemplatePath,
} = require("./files");

const renderComponent = (className, properties, testMode, templateType) => {
  logger.info(`Starting to render component for class: ${className}`);

  const settings = loadSettings();
  const componentData = prepareComponentData(className, properties, settings);
  const { defaultValues, options } = generateDefaultValuesAndOptions(
    className,
    properties
  );

  const componentsOutputDirectory = createComponentsOutputDirectory(
    settings,
    className,
    testMode
  );

  const hooksOutputDirectory = createHooksOutputDirectory(
    settings,
    className,
    testMode
  );

  renderFile(
    componentTemplatePath(templateType),
    componentData,
    componentsOutputDirectory,
    settings.generatedComponentFileName.replace("{{className}}", className),
    `${className} component file`
  );

  renderFile(
    storyTemplatePath(templateType),
    { ...componentData, defaultValues, options },
    componentsOutputDirectory,
    settings.generatedStoryFileName.replace("{{className}}", className),
    `${className} Storybook file`
  );

  renderFile(
    hookRestTemplatePath(templateType),
    componentData,
    hooksOutputDirectory,
    settings.generatedHookRestFileName.replace("{{className}}", className),
    `${className} Hook rest file`
  );

  renderFile(
    hookLocalTemplatePath(templateType),
    componentData,
    hooksOutputDirectory,
    settings.generatedHookLocalFileName.replace("{{className}}", className),
    `${className} Hook local file`
  );

  if (settings.generateDebugTypes === true) {
    generateDebugFile(componentsOutputDirectory, className, properties);
  }

  logger.info(`Completed rendering component for class: ${className}`);
};

const prepareComponentData = (className, properties, settings) => {
  return {
    componentName: `${className}Form`,
    types: properties,
    baseRestApiUrl: settings.baseRestApiUrl,
    className,
  };
};

const generateDefaultValuesAndOptions = (className, properties) => {
  logger.info(
    `Generating mock data and options for properties of class: ${className}`
  );

  const defaultValues = {};
  const options = {};

  properties.forEach((type) => {
    if (!type.primaryKey) {
      logger.info(`Generating default value for property: ${type.name}`);
      defaultValues[type.name] = generateDefaultValue(type);

      if (type.type === "multi-select" || type.type === "select") {
        logger.info(`Generating options for property: ${type.name}`);
        options[type.name] = generateOptions(type.properties || [], type.name); // Pass the type name here as parentName
      }
    }
  });

  return { defaultValues, options };
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
      return {}; // Setting default object to prevent warning, "A component is changing an uncontrolled input to be controlled"
    default:
      return "";
  }
};

const generateMockData = (subProperties, index = 0, parentName = "") => {
  const mockData = {};
  subProperties.forEach((prop) => {
    const labelPrefix = parentName
      ? `${parentName} ${prop.label || prop.name}`
      : prop.label || prop.name;
    if (prop.yupType === "string") {
      mockData[prop.name] = `${labelPrefix} ${index}`;
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

const generateOptions = (subProperties, parentName = "") => {
  return Array(3)
    .fill(null)
    .map((_, index) => {
      const mockObject = generateMockData(subProperties, index, parentName); // Pass parentName dynamically
      const labelProp = subProperties.find((prop) => prop.optionsLabel);

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

const createComponentsOutputDirectory = (settings, className, testMode) => {
  return path.join(
    process.cwd(),
    `${testMode ? "." : ""}${settings.generatedComponentsOutputDirectory}`,
    className
  );
};

const createHooksOutputDirectory = (settings, className, testMode) => {
  return path.join(
    process.cwd(),
    `${testMode ? "." : ""}${settings.generatedHooksOutputDirectory}`,
    className
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
