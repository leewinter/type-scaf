const { parseTypeFromNode } = require("../generate-components");
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
      .createSourceFile("temp.ts", "let test: number[];", { overwrite: true })
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();
    const result = parseTypeFromNode(typeNode);
    expect(result).toEqual({ htmlType: "multi-select", yupType: "array" });
  });

  it("should default to object for custom types", () => {
    const typeNode = project
      .createSourceFile("temp.ts", "let test: Customer;", { overwrite: true })
      .getVariableDeclarationOrThrow("test")
      .getTypeNodeOrThrow();
    const result = parseTypeFromNode(typeNode);
    expect(result).toEqual({ htmlType: "select", yupType: "object" });
  });
});
