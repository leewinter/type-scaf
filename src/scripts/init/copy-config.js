const path = require("path");
const { resilientCopy } = require("../../utils/file-copy");
const { typesPath, settingsPath } = require("../../file-processing/files");
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

// Function to handle copying multiple files based on a given list
function copyConfigurationFiles(filesToCopy) {
  logger.info(`Starting to copy configuration files...`); // Log before copying files
  filesToCopy.forEach(({ source, target }) => {
    logger.debug(`Copying file: source=${source}, target=${target}`); // Debug log for each file being copied
    copyFile(source, target);
  });
  logger.info(`Finished copying configuration files.`); // Log after copying all files
}

module.exports = (testing = false) => {
  logger.info(`Module invoked with testing=${testing}`); // Log whether testing mode is enabled

  if (testing) {
    logger.info(`Testing mode enabled, no files will be copied.`); // Log when in testing mode
    return;
  }

  // Define the source and target file paths for configuration files
  const filesToCopy = [
    {
      source: generatePath(
        "..",
        "..",
        "init-files",
        "config",
        "package-types.ts"
      ),
      target: typesPath,
    },
    {
      source: generatePath("..", "..", "init-files", "config", "settings.json"),
      target: settingsPath,
    },
  ];

  // Perform the copying of configuration files
  copyConfigurationFiles(filesToCopy);
};
