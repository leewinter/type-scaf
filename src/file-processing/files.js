const path = require("path");

module.exports = {
  settingsPath: path.join(
    process.cwd(),
    ".type-scaf",
    "config",
    "settings.json"
  ),
  listComponentTemplatePath: (templateType) =>
    path.join(
      process.cwd(),
      ".type-scaf",
      "templates",
      templateType,
      "list-component.ejs"
    ),
  formComponentTemplatePath: (templateType) =>
    path.join(
      process.cwd(),
      ".type-scaf",
      "templates",
      templateType,
      "form-component.ejs"
    ),
  storyFormTemplatePath: (templateType) =>
    path.join(
      process.cwd(),
      ".type-scaf",
      "templates",
      templateType,
      "form-component.stories.ejs"
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
