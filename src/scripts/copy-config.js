const fs = require("fs");
const path = require("path");
const { resilientCopy } = require("../utils/file");

module.exports = () => {
  // Config
  const packageTypesTargetFilePath = path.join(
    process.cwd(),
    "type-scaf/config/package-types.ts"
  );

  const packageTypesSourceFilePath = path.join(
    __dirname,
    "..",
    "config",
    "package-types.ts"
  );

  resilientCopy(packageTypesSourceFilePath, packageTypesTargetFilePath);

  // Config
  const packageSettingsTargetFilePath = path.join(
    process.cwd(),
    "type-scaf/config/settings.json"
  );

  const packageSettingsSourceFilePath = path.join(
    __dirname,
    "..",
    "config",
    "settings.json"
  );

  resilientCopy(packageSettingsSourceFilePath, packageSettingsTargetFilePath);
};
