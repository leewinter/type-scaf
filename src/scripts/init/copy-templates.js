const fs = require("fs");
const path = require("path");
const { resilientCopy } = require("../../utils/file-copy");

module.exports = () => {
  // Templates
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
};
