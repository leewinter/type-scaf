const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const loadSettings = require("./load-settings");
const getPrettierParser = require("./prettier-parse");
const prettier = require("prettier");
const { resilientWrite } = require("../utils/file-copy");
const logger = require("../utils/logger");

const { componentTemplatePath, storyTemplatePath } = require("./files");

const renderComponent = (className, properties) => {
  logger.info(`Starting to render component for class: ${className}`);

  const componentData = {
    componentName: `${className}Form`,
    types: properties,
  };

  const settings = loadSettings();

  // Generate default values and options before rendering the template
  const defaultValues = {};
  const options = {};

  logger.info(
    `Generating mock data and options for properties of class: ${className}`
  );

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
    return Array(3)
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
      logger.info(`Generating default value for property: ${type.name}`);
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
        logger.info(`Generating options for property: ${type.name}`);
        options[type.name] = generateOptions(type.properties || []);
      }
    }
  });

  const outputDirectory = path.join(
    process.cwd(),
    settings.generatedOutputDirectory,
    className // Create a folder with the className
  );

  // Render main component file
  ejs.renderFile(componentTemplatePath, componentData, async (err, str) => {
    if (err) {
      logger.error(`Error generating ${className} component:`, err);
      return;
    }

    const outputFileName = settings.generatedComponentFileName.replace(
      "{{className}}",
      className
    );
    const outputPath = path.join(outputDirectory, `${outputFileName}.jsx`);

    try {
      const parser = getPrettierParser(outputPath);
      const formattedCode = await prettier.format(str, { parser });

      resilientWrite(outputPath, formattedCode);
      logger.info(
        `${outputFileName}.jsx generated successfully in ${className} folder.`
      );
    } catch (error) {
      logger.error(
        `Error formatting or writing component file for ${className}:`,
        error
      );
    }
  });

  // Render Storybook file with precomputed default values and options
  ejs.renderFile(
    storyTemplatePath,
    { ...componentData, defaultValues, options },
    async (err, str) => {
      if (err) {
        logger.error(`Error generating ${className} Storybook file:`, err);
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

      try {
        const parser = getPrettierParser(storyOutputPath);
        const formattedCode = await prettier.format(str, { parser });

        resilientWrite(storyOutputPath, formattedCode);
        logger.info(
          `${storyFileName}.jsx generated successfully in ${className} folder.`
        );
      } catch (error) {
        logger.error(
          `Error formatting or writing Storybook file for ${className}:`,
          error
        );
      }
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
  }

  logger.info(`Completed rendering component for class: ${className}`);
};

module.exports = renderComponent;
