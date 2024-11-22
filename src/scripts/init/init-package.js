const fs = require("fs"); // Import the fs module to interact with the file system
const logger = require("../../utils/logger");
const {
  installGithubDependencyIfMissing,
  getPackageJsonPath,
} = require("../../services/npm-service");

// Function to extract the package name from a GitHub dependency string
function extractPackageNameFromGithubSource(dependency) {
  if (dependency.startsWith("github:")) {
    return dependency.split("/")[1]; // Extract package name after the "/"
  }
  return dependency.split("@")[0]; // Handle standard npm packages or scoped packages
}

// Function to update package.json with additional scripts
function updatePackageScripts(packageJsonPath, scriptsToAdd) {
  // Read and parse package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  // Add new scripts to the existing scripts in package.json, handling potential conflicts
  packageJson.scripts = packageJson.scripts || {};
  for (const [key, value] of Object.entries(scriptsToAdd)) {
    if (packageJson.scripts[key]) {
      logger.warn(
        `Script "${key}" already exists in package.json and will be overwritten.`
      );
    }
    packageJson.scripts[key] = value;
  }
  // Write the updated package.json back to the file system
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

// Main module function to handle installation and package.json modification
module.exports = (testing = false) => {
  // If not in testing mode, install dependencies and update package.json
  if (!testing) {
    const packageJsonPath = getPackageJsonPath();
    // Define the GitHub dependency for 'type-scaf'
    const githubDependency = "github:leewinter/type-scaf";

    // Extract the package name from the GitHub dependency
    const packageName = extractPackageNameFromGithubSource(githubDependency);

    // Install 'type-scaf' as a dev dependency if it's not already installed
    installGithubDependencyIfMissing(packageName, githubDependency);

    // Add custom scripts to package.json
    updatePackageScripts(packageJsonPath, {
      "scaf-init": "type-scaf init", // Script to initialize scaffolding
      "scaf-transform": "type-scaf transform", // Script to transform types
    });
  }

  // Log completion messages
  logger.info("Scaf scripts added to package.json.");
  logger.info("Installation complete.");
};
