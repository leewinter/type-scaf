const path = require("path");

// Load settings from settings.json globally
const settingsPath = path.join(
  process.cwd(),
  "type-scaf",
  "config",
  "settings.json"
);

const loadSettings = () => {
  const settings = require(settingsPath);
  return settings;
};

module.exports = loadSettings;
