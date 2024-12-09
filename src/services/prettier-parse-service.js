const prettier = require("prettier");

// Function to determine the appropriate Prettier parser based on file extension
const getPrettierParser = (filePath) => {
  // If the file path ends with ".jsx", return the "babel" parser
  if (filePath.endsWith(".jsx")) return "babel";

  // If the file path ends with ".ts", return the "typescript" parser
  if (filePath.endsWith(".ts")) return "typescript";

  // Default to the "babel" parser if no specific conditions are met
  return "babel";
};

// Function to format a string using Prettier with the provided options
const formatString = async (str, prettierOptions) => {
  // Use Prettier to format the input string asynchronously
  const formattedCode = await prettier.format(str, prettierOptions);

  // Return the formatted code as a result
  return formattedCode;
};

module.exports = { getPrettierParser, formatString };
