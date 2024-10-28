const fs = require("fs");
const path = require("path");

module.exports = {
  resilientCopy: (sourceFilePath, targetFilePath, force = false) => {
    const targetDirPath = path.dirname(targetFilePath);

    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
      console.log(`Directory created: ${targetDirPath}`);
    }

    if (!fs.existsSync(targetFilePath) || force) {
      // Copy the file from the package to the target project
      fs.copyFileSync(sourceFilePath, targetFilePath);
      console.log(`File copied to target project: ${targetFilePath}`);
    } else {
      console.log(`File already exists in target project: ${targetFilePath}`);
    }
  },

  resilientWrite: (targetFilePath, contents) => {
    const targetDirPath = path.dirname(targetFilePath);

    if (!fs.existsSync(targetDirPath)) {
      fs.mkdirSync(targetDirPath, { recursive: true });
      console.log(`Directory created: ${targetDirPath}`);
    }

    fs.writeFileSync(targetFilePath, contents);
  },
};
