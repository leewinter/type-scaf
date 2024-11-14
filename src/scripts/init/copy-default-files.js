const path = require("path");
const { resilientCopyDirectory } = require("../../utils/folder-copy");
const logger = require("../../utils/logger");

function generatePath(...segments) {
  const generatedPath = path.join(__dirname, ...segments);
  logger.debug(`Generated path: ${generatedPath}`); // Debug log for generated paths
  return generatedPath;
}

module.exports = () => {
  resilientCopyDirectory(
    generatePath("../../default-files"),
    path.join(process.cwd(), `.type-scaf`)
  );
};
