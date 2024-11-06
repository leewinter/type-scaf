const { Project } = require("ts-morph");

jest.mock("../parse-type-from-node", () => jest.fn());

const parseClassMembers = require("../parse-class-members");
const parseTypeFromNode = require("../parse-type-from-node");

describe("parseClassMembers", () => {
  const project = new Project();

  it("should parse a single class member with default string type", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          testProp: string;
          
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

  it("should parse a required property with the `required` decorator", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          @required
          testProp: string;
          
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
        required: true,
        primaryKey: false,
        optionsLabel: false,
        properties: null,
      },
    ]);
  });

  it("should parse a property marked as primary key with the `primaryKey` decorator", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          @primaryKey
          id: number;
          
          constructor(id: number) {
            this.id = id;
          }
        }
        `,
      { overwrite: true }
    );

    parseTypeFromNode.mockReturnValue({
      htmlType: "number",
      yupType: "number",
    });
    const classDeclaration = sourceFile.getClassOrThrow("TestClass");
    const result = parseClassMembers(classDeclaration);

    expect(result).toEqual([
      {
        name: "id",
        label: "Id",
        type: "number",
        yupType: "number",
        required: false,
        primaryKey: true,
        optionsLabel: false,
        properties: null,
      },
    ]);
  });

  it("should parse an array property as multi-select type", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          items: string[];
          
          constructor(items: string[]) {
            this.items = items;
          }
        }
        `,
      { overwrite: true }
    );

    parseTypeFromNode.mockReturnValue({
      htmlType: "multi-select",
      yupType: "array",
      subProperties: null,
    });
    const classDeclaration = sourceFile.getClassOrThrow("TestClass");
    const result = parseClassMembers(classDeclaration);

    expect(result).toEqual([
      {
        name: "items",
        label: "Items",
        type: "multi-select",
        yupType: "array",
        required: false,
        primaryKey: false,
        optionsLabel: false,
        properties: null,
      },
    ]);
  });

  it("should parse a nested class type property", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class Address {
          street: string;
          city: string;

          constructor(street: string, city: string){
            this.street = street;
            this.city = city;
          }
        }
        
        class TestClass {
          address: Address;
          
          constructor(address: Address) {
            this.address = address;
          }
        }
        `,
      { overwrite: true }
    );

    parseTypeFromNode.mockImplementation((typeNode) => {
      const typeText = typeNode.getText();
      if (typeText.includes("Address")) {
        return {
          htmlType: "select",
          yupType: "object",
          subProperties: [
            {
              name: "street",
              label: "Street",
              type: "text",
              yupType: "string",
            },
            {
              name: "city",
              label: "City",
              type: "text",
              yupType: "string",
            },
          ],
        };
      }
      return { htmlType: "text", yupType: "string" };
    });
    const classDeclaration = sourceFile.getClassOrThrow("TestClass");
    const result = parseClassMembers(classDeclaration);

    expect(result).toEqual([
      {
        name: "address",
        label: "Address",
        type: "select",
        yupType: "object",
        required: false,
        primaryKey: false,
        optionsLabel: false,
        properties: [
          {
            name: "street",
            label: "Street",
            type: "text",
            yupType: "string",
            optionsLabel: false,
            primaryKey: false,
            properties: null,
            required: false,
          },
          {
            name: "city",
            label: "City",
            type: "text",
            yupType: "string",
            optionsLabel: false,
            primaryKey: false,
            properties: null,
            required: false,
          },
        ],
      },
    ]);
  });

  it("should parse an options label decorator", () => {
    const sourceFile = project.createSourceFile(
      "tempClass.ts",
      `
        class TestClass {
          @optionsLabel
          name: string;
          
          constructor(name: string) {
            this.name = name;
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
        name: "name",
        label: "Name",
        type: "text",
        yupType: "string",
        required: false,
        primaryKey: false,
        optionsLabel: true,
        properties: null,
      },
    ]);
  });
});
