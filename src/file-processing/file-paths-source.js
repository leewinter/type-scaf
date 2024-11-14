const path = require("path");

module.exports = {
  settingsPath: (local) =>
    path.join(
      local ? "../default-files" : process.cwd(),
      "type-scaf",
      "config",
      "settings.json"
    ),
  componentTemplatePath: path.join(
    process.cwd(),
    "type-scaf",
    "templates",
    "component.ejs"
  ),
  storyTemplatePath: path.join(
    process.cwd(),
    "type-scaf",
    "templates",
    "component.stories.ejs"
  ),
  typesPath: path.join(
    process.cwd(),
    "type-scaf",
    "config",
    "package-types.ts"
  ),
};
