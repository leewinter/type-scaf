const renderComponent = require("../render-component");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const prettier = require("prettier");
const { loadSettings } = require("../files");
const {
  getPrettierParser,
  formatString,
} = require("../../services/prettier-parse-service");
const { resilientWrite } = require("../../utils/file-copy");
const logger = require("../../utils/logger");

// Mocking dependencies
jest.mock("ejs");
jest.mock("prettier");
jest.mock("fs");
jest.mock("path");
jest.mock("../files");
jest.mock("../../services/prettier-parse-service");
jest.mock("../../utils/file-copy");
jest.mock("../../utils/logger");

describe("renderComponent", () => {
  const className = "TestComponent";
  const properties = [{ name: "testProperty", yupType: "string" }];
  let settings;

  beforeEach(() => {
    jest.clearAllMocks();
    settings = {
      transformTemplates: [
        {
          templateFileName: "form-component.ejs",
          generatedFileName: "{{className}}Form",
          outputDirectory: "src/components/generated/{{className}}",
        },
        {
          templateFileName: "form-component.stories.ejs",
          generatedFileName: "{{className}}Form.stories",
          outputDirectory: "src/components/generated/{{className}}",
        },
        {
          templateFileName: "list-component.ejs",
          generatedFileName: "{{className}}List",
          outputDirectory: "src/components/generated/{{className}}",
        },
        {
          templateFileName: "use-hook-rest.ejs",
          generatedFileName: "use{{className}}Rest",
          outputDirectory: "src/hooks/generated/{{className}}",
        },
        {
          templateFileName: "use-hook-local.ejs",
          generatedFileName: "use{{className}}Local",
          outputDirectory: "src/hooks/generated/{{className}}",
        },
      ],
      generateDebugTypes: {
        outputPath: "src/components/generated",
        enabled: true,
      },
      baseRestApiUrl: "https://apiUrl.co.uk",
    };
    loadSettings.mockReturnValue(settings);
    fs.mkdir.mockImplementation((dirPath, options, callback) => callback(null));
    fs.writeFile.mockImplementation((filePath, data, callback) =>
      callback(null)
    );
  });

  it("should render all templates without errors", async () => {
    ejs.renderFile.mockImplementation((templatePath, data, callback) => {
      callback(null, "<div>Component Content</div>");
    });
    formatString.mockResolvedValue("<div>Formatted Component Content</div>");
    getPrettierParser.mockReturnValue("babel");

    await renderComponent(className, properties);

    expect(ejs.renderFile).toHaveBeenCalledTimes(
      settings.transformTemplates.length
    );
    expect(formatString).toHaveBeenCalledTimes(
      settings.transformTemplates.length
    );
    expect(resilientWrite).toHaveBeenCalledTimes(
      settings.transformTemplates.length
    );

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Starting to render component for class: TestComponent"
      )
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Preparing component data for class: TestComponent"
      )
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Generating default value for property: testProperty"
      )
    );
  });

  it("should log an error if creating the output directory fails", async () => {
    settings.generateDebugTypes.enabled = true;
    loadSettings.mockReturnValue(settings);
    fs.mkdir.mockImplementation((dirPath, options, callback) =>
      callback(new Error("Directory Creation Error"))
    );

    const consoleErrorSpy = jest.spyOn(logger, "error").mockImplementation();

    await renderComponent(className, properties);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error creating output directory for ${className}:`,
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });

  it("should log an error if generating the debug file fails", async () => {
    settings.generateDebugTypes.enabled = true;
    loadSettings.mockReturnValue(settings);
    fs.writeFile.mockImplementation((filePath, data, callback) =>
      callback(new Error("File Writing Error"))
    );

    const consoleErrorSpy = jest.spyOn(logger, "error").mockImplementation();

    await renderComponent(className, properties);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error generating debug file for ${className}:`,
      expect.any(Error)
    );
    consoleErrorSpy.mockRestore();
  });
});
