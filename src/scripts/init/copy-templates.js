const fs = require("fs");
const path = require("path");
const { resilientCopy } = require("../../utils/file-copy");
const {
  componentTemplatePath,
  storyTemplatePath,
} = require("../../file-processing/files");

module.exports = () => {
  // Component
  const componentTemplateTargetFilePath = componentTemplatePath;

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
  const componentStoriesTargetFilePath = storyTemplatePath;

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
