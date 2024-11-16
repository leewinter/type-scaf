const renderComponent = require("../render-component");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const prettier = require("prettier");
const loadSettings = require("../load-settings");
const getPrettierParser = require("../prettier-parse");
const { resilientWrite } = require("../../utils/file-copy");
const logger = require("../../utils/logger");

// Mocking dependencies
jest.mock("ejs");
jest.mock("prettier");
jest.mock("fs");
jest.mock("path");
jest.mock("../load-settings");
jest.mock("../prettier-parse");
jest.mock("../../utils/file-copy");
jest.mock("../../utils/logger");

describe("renderComponent", () => {
  const className = "TestComponent";
  const properties = [{ name: "testProperty", yupType: "string" }];
  let settings;

  beforeEach(() => {
    jest.clearAllMocks();
    settings = {
      generatedComponentsOutputDirectory: "output",
      generatedFormComponentFileName: "{{className}}Form",
      generatedFormStoryFileName: "{{className}}Story",
      generatedHookRestFileName: "use{{className}}Rest",
      generatedHookLocalFileName: "use{{className}}Rest",
      generatedListComponentFileName: "{{className}}List",
      generateDebugTypes: false,
    };
    loadSettings.mockReturnValue(settings);
    fs.mkdir.mockImplementation((dirPath, options, callback) => callback(null));
    fs.writeFile.mockImplementation((filePath, data, callback) =>
      callback(null)
    );
  });

  it("should render the component, story, and hook files without errors", async () => {
    ejs.renderFile.mockImplementation((templatePath, data, callback) => {
      callback(null, "<div>Component Content</div>");
    });
    prettier.format.mockResolvedValue("<div>Formatted Component Content</div>");
    getPrettierParser.mockReturnValue("babel");

    await renderComponent(className, properties);

    expect(ejs.renderFile).toHaveBeenCalledTimes(5);
    expect(prettier.format).toHaveBeenCalledTimes(5);
    expect(resilientWrite).toHaveBeenCalledTimes(5);

    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Starting to render component for class: TestComponent"
      )
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Generating mock data and options for properties of class: TestComponent"
      )
    );
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        "Generating default value for property: testProperty"
      )
    );
  });

  it("should generate the debug file if generateDebugTypes is true", async () => {
    settings.generateDebugTypes = true;
    loadSettings.mockReturnValue(settings);

    ejs.renderFile.mockImplementation((templatePath, data, callback) => {
      callback(null, "<div>Component Content</div>");
    });
    prettier.format.mockResolvedValue("<div>Formatted Component Content</div>");
    getPrettierParser.mockReturnValue("babel");

    await renderComponent(className, properties);

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.join(
        process.cwd(),
        settings.generatedComponentsOutputDirectory,
        className,
        `${className}.debug.json`
      ),
      JSON.stringify({ className, properties }, null, 2),
      expect.any(Function)
    );
  });

  it("should log an error if creating the output directory fails", async () => {
    settings.generateDebugTypes = true;
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
    settings.generateDebugTypes = true;
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
