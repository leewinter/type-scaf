const fs = require("fs");
const path = require("path");

module.exports = {
  resilientCopyDirectory: (sourceDirPath, targetDirPath, force = false) => {
    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
      console.log(`Directory created: ${targetDirPath}`);
    }

    const items = fs.readdirSync(sourceDirPath);
    items.forEach((item) => {
      const sourceItemPath = path.join(sourceDirPath, item);
      const targetItemPath = path.join(targetDirPath, item);
      const stats = fs.statSync(sourceItemPath);

      if (stats.isDirectory()) {
        // Recursively copy the directory
        module.exports.resilientCopyDirectory(
          sourceItemPath,
          targetItemPath,
          force
        );
      } else if (stats.isFile()) {
        // Copy the file
        if (!fs.existsSync(targetItemPath) || force) {
          fs.copyFileSync(sourceItemPath, targetItemPath);
          console.log(`File copied to target project: ${targetItemPath}`);
        } else {
          console.log(
            `File already exists in target project: ${targetItemPath}`
          );
        }
      }
    });
  },
};
