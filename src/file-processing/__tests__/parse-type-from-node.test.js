const { Project } = require("ts-morph");
const parseTypeFromNode = require("../parse-type-from-node");
const logger = require("../../utils/logger");
const { parseSubProperties } = require("../parse-helpers");

jest.mock("../../utils/logger");
jest.mock("../parse-helpers");

const project = new Project();

describe("parseTypeFromNode", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should match a directly mapped type from typeMappings", () => {
    const typeNode = project
      .createSourceFile("temp.ts", "let test: string;", { overwrite: true })
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();

    const result = parseTypeFromNode(typeNode);

    expect(result).toEqual({ htmlType: "text", yupType: "string" });
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining(
        'Matched type found in typeMappings for "string": {"htmlType":"text","yupType":"string"}'
      )
    );
  });

  it("should handle class or object types", () => {
    const typeNode = project
      .createSourceFile(
        "temp.ts",
        `
        class Customer {
          customerId: number;
          name: string;
        }
        let customer: Customer;
      `,
        { overwrite: true }
      )
      .getVariableDeclarationOrThrow("customer")
      .getTypeNodeOrThrow();

    const mockSubProperties = [
      {
        name: "customerId",
        label: "CustomerId",
        htmlType: "number",
        yupType: "number",
      },
      { name: "name", label: "Name", htmlType: "text", yupType: "string" },
    ];
    parseSubProperties.mockReturnValue(mockSubProperties);

    const result = parseTypeFromNode(typeNode);

    expect(result).toEqual({
      htmlType: "select",
      yupType: "object",
      subProperties: mockSubProperties,
    });
    expect(logger.info).toHaveBeenCalledWith(
      "Parsing type from node: Customer"
    );
    expect(logger.info).toHaveBeenCalledWith(
      'Type "Customer" is identified as a class or object.'
    );
  });

  it("should handle enum types as select dropdowns", () => {
    const typeNode = project
      .createSourceFile(
        "temp.ts",
        `
        enum Status {
          Active = "ACTIVE",
          Inactive = "INACTIVE"
        }
        let status: Status;
      `,
        { overwrite: true }
      )
      .getVariableDeclarationOrThrow("status")
      .getTypeNodeOrThrow();

    const result = parseTypeFromNode(typeNode);

    expect(result).toEqual({ htmlType: "select", yupType: "string" });
    expect(logger.info).toHaveBeenCalledWith("Parsing type from node: Status");
    expect(logger.info).toHaveBeenCalledWith(
      'Type "Status" is identified as an enum.'
    );
  });

  it("should log an error and rethrow when failing to get type", () => {
    const typeNode = {
      getText: jest.fn().mockReturnValue("InvalidType"),
      getType: jest.fn(() => {
        throw new Error("Failed to get type");
      }),
    };

    expect(() => parseTypeFromNode(typeNode)).toThrow("Failed to get type");
    expect(logger.error).toHaveBeenCalledWith(
      'Error in parseTypeFromNode for type node "InvalidType":',
      "Failed to get type",
      expect.any(String)
    );
  });

  it("should log an error when failing to parse array element type", () => {
    const typeNode = project
      .createSourceFile("temp.ts", "let items: SomeClass[];", {
        overwrite: true,
      })
      .getVariableDeclarationOrThrow("items")
      .getTypeNodeOrThrow();

    const type = typeNode.getType();
    jest.spyOn(type, "isArray").mockReturnValue(true);
    jest.spyOn(type, "getArrayElementType").mockImplementation(() => {
      throw new Error("Failed to get array element type");
    });

    expect(() => parseTypeFromNode(typeNode)).toThrow(
      "Failed to get array element type"
    );
  });

  it("should log an error when failing to parse sub-properties", () => {
    const typeNode = project
      .createSourceFile("temp.ts", `class SomeType {}; let test: SomeType[];`, {
        overwrite: true,
      })
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();

    // Mock parseSubProperties to throw an error
    jest
      .spyOn(require("../parse-helpers"), "parseSubProperties")
      .mockImplementation(() => {
        throw new Error("Failed to parse sub-properties");
      });

    // Execute parseTypeFromNode inside a wrapper function to allow expect().toThrow() to work properly
    expect(() => parseTypeFromNode(typeNode, jest.fn())).toThrow(
      "Failed to parse sub-properties"
    );

    // Ensure the error is logged correctly
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining(
        "Failed to parse sub-properties for array element"
      ),
      expect.any(String)
    );
  });
});
