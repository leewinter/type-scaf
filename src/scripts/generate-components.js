const { Project } = require("ts-morph");
const processNode = require("../file-processing/process-node");

const { typesPath } = require("../file-processing/files");

module.exports = {
  generateComponents: (testing = false, templateType = "reactJs") => {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(typesPath);

    sourceFile.forEachChild((node) => processNode(node, testing, templateType));
  },
};
