const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const loadSettings = require("./load-settings");
const getPrettierParser = require("./prettier-parse");
const prettier = require("prettier");
const { resilientWrite } = require("../utils/file-copy");

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

module.exports = renderComponent;
