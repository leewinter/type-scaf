const { Project } = require("ts-morph");
const path = require("path");
const processNode = require("../file-processing/process-node");
const parseClassMembers = require("../file-processing/parse-class-members");
const parseTypeFromNode = require("../file-processing/parse-type-from-node");
const { typesPath } = require("../file-processing/files");

module.exports = {
  generateComponents: (testing = false) => {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(typesPath);

    // Pass both functions to processNode to avoid circular dependency
    sourceFile.forEachChild((node) =>
      processNode(node, parseClassMembers, parseTypeFromNode)
    );
  },
};
