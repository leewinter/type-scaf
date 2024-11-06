const { Project } = require("ts-morph");
const path = require("path");
const processNode = require("../file-processing/process-node");

module.exports = {
  generateComponents: () => {
    const packageJsonPath = path.join(
      process.cwd(),
      "type-scaf",
      "config",
      "package-types.ts"
    );
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(packageJsonPath);

    sourceFile.forEachChild(processNode);
  },
};
