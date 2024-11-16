const path = require("path");

module.exports = {
  settingsPath: path.join(
    process.cwd(),
    ".type-scaf",
    "config",
    "settings.json"
  ),
  typesPath: path.join(
    process.cwd(),
    ".type-scaf",
    "config",
    "package-types.ts"
  ),
};
