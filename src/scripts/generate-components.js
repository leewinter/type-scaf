const { Project } = require("ts-morph");
const path = require("path");
const processNode = require("../file-processing/process-node");
const { typesPath } = require("../file-processing/files");

module.exports = {
  generateComponents: () => {
    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(typesPath);

    sourceFile.forEachChild(processNode);
  },
};
