const getPrettierParser = (filePath) => {
  if (filePath.endsWith(".jsx")) return "babel";
  if (filePath.endsWith(".ts")) return "typescript";
  return "babel";
};

module.exports = getPrettierParser;
