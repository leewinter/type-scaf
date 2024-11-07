const path = require("path");
const { resilientCopy } = require("../../utils/file-copy");
const { typesPath, settingsPath } = require("../../file-processing/files");

module.exports = () => {
  // Config
  const packageTypesTargetFilePath = typesPath;

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
  const packageSettingsTargetFilePath = settingsPath;

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
