const fs = require("fs");
const path = require("path");
const { resilientCopy } = require("../../utils/file-copy");

module.exports = () => {
  // Component
  const componentTemplateTargetFilePath = path.join(
    process.cwd(),
    "type-scaf",
    "templates",
    "component.ejs"
  );

  const componentTemplateSourceFilePath = path.join(
    __dirname,
    "..",
    "..",
    "init-files",
    "templates",
    "react",
    "component.ejs"
  );

  resilientCopy(
    componentTemplateSourceFilePath,
    componentTemplateTargetFilePath
  );

  // Stories
  const componentStoriesTargetFilePath = path.join(
    process.cwd(),
    "type-scaf",
    "templates",
    "component.stories.ejs"
  );

  const componentStoriesSourceFilePath = path.join(
    __dirname,
    "..",
    "..",
    "init-files",
    "templates",
    "react",
    "component.stories.ejs"
  );

  resilientCopy(componentStoriesSourceFilePath, componentStoriesTargetFilePath);
};
