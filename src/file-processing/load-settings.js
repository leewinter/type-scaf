const path = require("path");

// Load settings from settings.json globally
const { settingsPath } = require("./files");

const loadSettings = () => {
  const settings = require(settingsPath);
  return settings;
};

module.exports = loadSettings;
