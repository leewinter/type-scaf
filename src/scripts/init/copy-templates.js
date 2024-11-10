const fs = require("fs");
const path = require("path");
const { resilientCopy } = require("../../utils/file-copy");
const {
  componentTemplatePath,
  storyTemplatePath,
} = require("../../file-processing/files");
const logger = require("../../utils/logger");

// Utility function to generate file paths relative to the current directory
function generatePath(...segments) {
  const generatedPath = path.join(__dirname, ...segments);
  logger.debug(`Generated path: ${generatedPath}`); // Debug log for generated paths
  return generatedPath;
}

// Function to copy source files to target paths
function copyFile(sourcePath, targetPath) {
  logger.info(`Attempting to copy from ${sourcePath} to ${targetPath}`); // Log before attempting to copy
  try {
    resilientCopy(sourcePath, targetPath); // Use resilientCopy utility to perform the file copy
    logger.info(`Successfully copied from ${sourcePath} to ${targetPath}`); // Log success message
  } catch (error) {
    logger.error(
      `Failed to copy file from ${sourcePath} to ${targetPath}:`,
      error.message
    ); // Provide meaningful feedback if the copy fails
  }
}

module.exports = (testing = false) => {
  logger.info(
    `Module invoked to copy component and story templates. Testing mode: ${testing}`
  ); // Log module invocation with testing mode

  if (testing) {
    logger.info(`Testing mode enabled, no files will be copied.`); // Log when in testing mode
    return;
  }

  // Component
  const componentTemplateTargetFilePath = componentTemplatePath;
  const componentTemplateSourceFilePath = generatePath(
    "..",
    "..",
    "init-files",
    "templates",
    "react",
    "component.ejs"
  );
  logger.debug(
    `Copying component template: source=${componentTemplateSourceFilePath}, target=${componentTemplateTargetFilePath}`
  ); // Debug log for component template
  copyFile(componentTemplateSourceFilePath, componentTemplateTargetFilePath);

  // Stories
  const componentStoriesTargetFilePath = storyTemplatePath;
  const componentStoriesSourceFilePath = generatePath(
    "..",
    "..",
    "init-files",
    "templates",
    "react",
    "component.stories.ejs"
  );
  logger.debug(
    `Copying component stories: source=${componentStoriesSourceFilePath}, target=${componentStoriesTargetFilePath}`
  ); // Debug log for component stories
  copyFile(componentStoriesSourceFilePath, componentStoriesTargetFilePath);

  logger.info(`Finished copying component and story templates.`); // Log after all copies are done
};
