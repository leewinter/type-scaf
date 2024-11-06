const processNode = require("../process-node");
const parseClassMembers = require("../parse-class-members");
const renderComponent = require("../render-component");

// Mocking the imported modules
jest.mock("../parse-class-members");
jest.mock("../render-component");

describe("processNode", () => {
  let mockNode;

  beforeEach(() => {
    jest.clearAllMocks();
    mockNode = {
      getKindName: jest.fn(),
      getName: jest.fn(),
    };
  });

  it('should skip "EndOfFileToken" nodes', () => {
    mockNode.getKindName.mockReturnValue("EndOfFileToken");

    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

    processNode(mockNode);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Skipping EndOfFileToken node."
    );
    expect(parseClassMembers).not.toHaveBeenCalled();
    expect(renderComponent).not.toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should process "ClassDeclaration" nodes with properties', () => {
    mockNode.getKindName.mockReturnValue("ClassDeclaration");
    mockNode.getName.mockReturnValue("TestClass");

    const mockProperties = [{ name: "testProperty" }];
    parseClassMembers.mockReturnValue(mockProperties);

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    processNode(mockNode);

    expect(mockNode.getKindName).toHaveBeenCalled();
    expect(mockNode.getName).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("Processing class: TestClass");
    expect(parseClassMembers).toHaveBeenCalledWith(mockNode);
    expect(renderComponent).toHaveBeenCalledWith("TestClass", mockProperties);

    consoleLogSpy.mockRestore();
  });

  it('should log a warning when "ClassDeclaration" has no properties', () => {
    mockNode.getKindName.mockReturnValue("ClassDeclaration");
    mockNode.getName.mockReturnValue("EmptyClass");

    parseClassMembers.mockReturnValue([]);

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

    processNode(mockNode);

    expect(mockNode.getKindName).toHaveBeenCalled();
    expect(mockNode.getName).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith("Processing class: EmptyClass");
    expect(parseClassMembers).toHaveBeenCalledWith(mockNode);
    expect(renderComponent).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No properties found for class EmptyClass"
    );

    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it("should handle unsupported node kinds", () => {
    mockNode.getKindName.mockReturnValue("UnsupportedKind");

    const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

    processNode(mockNode);

    expect(mockNode.getKindName).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Unhandled node kind: UnsupportedKind"
    );
    expect(parseClassMembers).not.toHaveBeenCalled();
    expect(renderComponent).not.toHaveBeenCalled();

    consoleLogSpy.mockRestore();
  });
});
