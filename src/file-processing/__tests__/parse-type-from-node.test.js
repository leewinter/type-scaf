const parseTypeFromNode = require("../parse-type-from-node");
const { Project } = require("ts-morph");

describe("parseTypeFromNode", () => {
  const project = new Project();

  it("should return text for string type", () => {
    const typeNode = project
      .createSourceFile("temp.ts", "let test: string;", { overwrite: true })
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();
    const result = parseTypeFromNode(typeNode);
    expect(result).toEqual({ htmlType: "text", yupType: "string" });
  });

  it("should return number for number type", () => {
    const typeNode = project
      .createSourceFile("temp.ts", "let test: number;", { overwrite: true })
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();
    const result = parseTypeFromNode(typeNode);
    expect(result).toEqual({ htmlType: "number", yupType: "number" });
  });

  it("should return multi-select for array types", () => {
    const typeNode = project
      .createSourceFile("temp.ts", "let x: SomeType[];", { overwrite: true })
      .getVariableDeclarationOrThrow("x")
      .getTypeNodeOrThrow();
    const result = parseTypeFromNode(typeNode);
    expect(result).toEqual({
      htmlType: "multi-select",
      yupType: "array",
      subProperties: null,
    });
  });

  it("should return select and object for custom classes with properties", () => {
    const typeNode = project
      .createSourceFile(
        "temp.ts",
        `
        class Customer {
          customerId: number;
          name: string;

          constructor(customerId: number, name: string){
          
          }
        }
        let test: Customer;
        `,
        { overwrite: true }
      )
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();
    const result = parseTypeFromNode(typeNode);
    expect(result).toEqual({
      htmlType: "select",
      yupType: "object",
      subProperties: [],
    });
  });

  it("should return select and string for enums", () => {
    const typeNode = project
      .createSourceFile(
        "temp.ts",
        `
        enum Status {
          Active = "ACTIVE",
          Inactive = "INACTIVE"
        }
        let test: Status;
        `,
        { overwrite: true }
      )
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();
    const result = parseTypeFromNode(typeNode);
    expect(result).toEqual({ htmlType: "select", yupType: "string" });
  });

  it("should default to object for unknown types without properties", () => {
    const typeNode = project
      .createSourceFile("temp.ts", "let test: UnknownType;", {
        overwrite: true,
      })
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();
    const result = parseTypeFromNode(typeNode);
    expect(result).toEqual({ htmlType: "select", yupType: "object" });
  });
});
