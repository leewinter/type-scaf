const processNode = require("../process-node");
const logger = require("../../utils/logger");
const parseClassMembers = require("../parse-class-members");
const renderComponent = require("../render-component");

// Mock the dependencies
jest.mock("../../utils/logger");
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

  it("should log a warning when the node is EndOfFileToken", () => {
    mockNode.getKindName.mockReturnValue("EndOfFileToken");

    processNode(mockNode, parseClassMembers, jest.fn());

    expect(logger.warn).toHaveBeenCalledWith("Skipping EndOfFileToken node.");
    expect(parseClassMembers).not.toHaveBeenCalled();
    expect(renderComponent).not.toHaveBeenCalled();
  });

  it("should log a warning if ClassDeclaration has no properties", () => {
    mockNode.getKindName.mockReturnValue("ClassDeclaration");
    mockNode.getName.mockReturnValue("EmptyClass");

    parseClassMembers.mockReturnValue([]);

    processNode(mockNode, parseClassMembers, jest.fn());

    expect(mockNode.getKindName).toHaveBeenCalled();
    expect(mockNode.getName).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Processing class: EmptyClass");
    expect(parseClassMembers).toHaveBeenCalledWith(mockNode);
    expect(renderComponent).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith(
      "No properties found for class EmptyClass"
    );
  });

  it("should log info for unhandled node kinds", () => {
    mockNode.getKindName.mockReturnValue("UnsupportedKind");

    processNode(mockNode, parseClassMembers, jest.fn());

    expect(mockNode.getKindName).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith(
      "Unhandled node kind: UnsupportedKind"
    );
    expect(parseClassMembers).not.toHaveBeenCalled();
    expect(renderComponent).not.toHaveBeenCalled();
  });
});
