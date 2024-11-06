const renderComponent = require("../render-component");
const path = require("path");
const ejs = require("ejs");
const prettier = require("prettier");
const fs = require("fs");
const loadSettings = require("../load-settings");
const getPrettierParser = require("../prettier-parse");
const { resilientWrite } = require("../../utils/file-copy");

// Mocking dependencies
jest.mock("ejs");
jest.mock("prettier");
jest.mock("fs");
jest.mock("../load-settings");
jest.mock("../prettier-parse");
jest.mock("../../utils/file-copy");

describe("renderComponent", () => {
  const className = "TestComponent";
  const properties = [{ name: "testProperty", yupType: "string" }];
  let settings;

  beforeEach(() => {
    jest.clearAllMocks();
    settings = {
      generatedOutputDirectory: "output",
      generatedComponentFileName: "{{className}}Form",
      generatedStoryFileName: "{{className}}Story",
      generateDebugTypes: false,
    };
    loadSettings.mockReturnValue(settings);
    fs.mkdir.mockImplementation((dirPath, options, callback) => callback(null));
    fs.writeFile.mockImplementation((filePath, data, callback) =>
      callback(null)
    );
  });

  it("should render the component and story files without errors", async () => {
    ejs.renderFile.mockImplementation((templatePath, data, callback) => {
      callback(null, "<div>Component Content</div>");
    });
    prettier.format.mockResolvedValue("<div>Formatted Component Content</div>");
    getPrettierParser.mockReturnValue("babel");

    await renderComponent(className, properties);

    expect(ejs.renderFile).toHaveBeenCalledTimes(2);
    expect(prettier.format).toHaveBeenCalledTimes(2);
    expect(resilientWrite).toHaveBeenCalledTimes(2);
  });

  it("should log an error if component template rendering fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    ejs.renderFile.mockImplementation((templatePath, data, callback) => {
      callback(new Error("Template Rendering Error"));
    });

    await renderComponent(className, properties);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error generating ${className} component:`,
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("should log an error if storybook template rendering fails", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    ejs.renderFile
      .mockImplementationOnce((templatePath, data, callback) => {
        callback(null, "<div>Component Content</div>");
      })
      .mockImplementationOnce((templatePath, data, callback) => {
        callback(new Error("Storybook Rendering Error"));
      });

    prettier.format.mockResolvedValue("<div>Formatted Component Content</div>");
    getPrettierParser.mockReturnValue("babel");

    await renderComponent(className, properties);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error generating ${className} Storybook file:`,
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
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
        settings.generatedOutputDirectory,
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

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

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

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    await renderComponent(className, properties);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error generating debug file for ${className}:`,
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
