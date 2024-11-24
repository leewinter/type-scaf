const { Project } = require("ts-morph");
const processNode = require("../file-processing/process-node");
const { typesPath, loadSettings } = require("../file-processing/files");
const { installDependenciesIfMissing } = require("../services/npm-service");

module.exports = {
  generateComponents: (testing = false, templateType = "reactJs") => {
    const settings = loadSettings();
    installDependenciesIfMissing(settings.dependencies);

    const project = new Project();
    const sourceFile = project.addSourceFileAtPath(typesPath);

    sourceFile.forEachChild((node) => processNode(node, testing, templateType));
  },
};
