const path = require("path");

const settingsPath = path.join(
  process.cwd(),
  ".type-scaf",
  "config",
  "settings.json"
);

const typesPath = path.join(
  process.cwd(),
  ".type-scaf",
  "config",
  "package-types.ts"
);

const loadSettings = () => {
  const settings = require(settingsPath);
  return settings;
};

module.exports = {
  settingsPath,
  typesPath,
  loadSettings,
};
