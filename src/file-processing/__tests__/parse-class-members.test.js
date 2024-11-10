const { Project } = require("ts-morph");
const parseClassMembers = require("../parse-class-members");
const parseTypeFromNode = require("../parse-type-from-node");
const logger = require("../../utils/logger");

jest.mock("../parse-type-from-node");
jest.mock("../../utils/logger");

describe("parseClassMembers", () => {
  const project = new Project();

  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test to avoid test contamination
  });

  it("should log a warning if no constructor is found", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          testProp: string;
        }
      `,
      { overwrite: true }
    );

    const classDeclaration = sourceFile.getClassOrThrow("TestClass");
    const result = parseClassMembers(classDeclaration);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      `No constructor found for class: TestClass`
    );
  });

  it("should parse a property with a matching constructor parameter", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          constructor(testProp: string) {
            this.testProp = testProp;
          }
        }
      `,
      { overwrite: true }
    );

    parseTypeFromNode.mockReturnValue({ htmlType: "text", yupType: "string" });
    const classDeclaration = sourceFile.getClassOrThrow("TestClass");
    const result = parseClassMembers(classDeclaration);

    expect(result).toEqual([
      {
        name: "testProp",
        label: "TestProp",
        type: "text",
        yupType: "string",
        required: false,
        primaryKey: false,
        optionsLabel: false,
        properties: null,
      },
    ]);
  });

  it("should log a warning if no matching parameter is found for a property", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          constructor() {
            this.testProp = "";
          }
        }
      `,
      { overwrite: true }
    );

    const classDeclaration = sourceFile.getClassOrThrow("TestClass");
    const result = parseClassMembers(classDeclaration);

    expect(result).toEqual([]);
    expect(logger.warn).toHaveBeenCalledWith(
      `No matching parameter found for property "testProp" in class "TestClass"`
    );
  });

  it("should correctly identify primary key, required, and options label decorators", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          @primaryKey
          @required
          @optionsLabel
          testProp: string;

          constructor(testProp: string) {
            this.testProp = testProp;
          }
        }
      `,
      { overwrite: true }
    );

    const classDeclaration = sourceFile.getClassOrThrow("TestClass");
    const result = parseClassMembers(classDeclaration);

    expect(result).toEqual([
      {
        name: "testProp",
        label: "TestProp",
        type: "text",
        yupType: "string",
        required: true,
        primaryKey: true,
        optionsLabel: true,
        properties: null,
      },
    ]);
  });

  it("should handle errors when parsing property types and log an error", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          constructor(testProp: string) {
            this.testProp = testProp;
          }
        }
      `,
      { overwrite: true }
    );

    parseTypeFromNode.mockImplementation(() => {
      throw new Error("Type parsing failed");
    });

    const classDeclaration = sourceFile.getClassOrThrow("TestClass");
    const result = parseClassMembers(classDeclaration);

    expect(result).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith(
      `Error parsing type for property "testProp" in class "TestClass":`,
      "Type parsing failed"
    );
  });
});
