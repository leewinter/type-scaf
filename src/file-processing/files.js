const path = require("path");

module.exports = {
  settingsPath: path.join(
    process.cwd(),
    ".type-scaf",
    "config",
    "settings.json"
  ),
  componentTemplatePath: (templateType) =>
    path.join(
      process.cwd(),
      ".type-scaf",
      "templates",
      templateType,
      "component.ejs"
    ),
  storyTemplatePath: (templateType) =>
    path.join(
      process.cwd(),
      ".type-scaf",
      "templates",
      templateType,
      "component.stories.ejs"
    ),
  hookRestTemplatePath: (templateType) =>
    path.join(
      process.cwd(),
      ".type-scaf",
      "templates",
      templateType,
      "use-hook-rest.ejs"
    ),
  hookLocalTemplatePath: (templateType) =>
    path.join(
      process.cwd(),
      ".type-scaf",
      "templates",
      templateType,
      "use-hook-local.ejs"
    ),
  typesPath: path.join(
    process.cwd(),
    ".type-scaf",
    "config",
    "package-types.ts"
  ),
};
