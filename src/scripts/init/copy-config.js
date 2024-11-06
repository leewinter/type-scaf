const fs = require("fs");
const path = require("path");
const { resilientCopy } = require("../../utils/file-copy");

module.exports = () => {
  // Config
  const packageTypesTargetFilePath = path.join(
    process.cwd(),
    "type-scaf",
    "config",
    "package-types.ts"
  );

  const packageTypesSourceFilePath = path.join(
    __dirname,
    "..",
    "..",
    "init-files",
    "config",
    "package-types.ts"
  );

  resilientCopy(packageTypesSourceFilePath, packageTypesTargetFilePath);

  // Settings
  const packageSettingsTargetFilePath = path.join(
    process.cwd(),
    "type-scaf",
    "config",
    "settings.json"
  );

  const packageSettingsSourceFilePath = path.join(
    __dirname,
    "..",
    "..",
    "init-files",
    "config",
    "settings.json"
  );

  resilientCopy(packageSettingsSourceFilePath, packageSettingsTargetFilePath);
};
