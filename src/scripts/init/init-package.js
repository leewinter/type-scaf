const { execSync } = require("child_process"); // Import execSync to execute shell commands synchronously
const fs = require("fs"); // Import the fs module to interact with the file system
const path = require("path"); // Import the path module to work with file paths
const logger = require("../../utils/logger");

// Function to run a shell command
function runCommand(command) {
  logger.info(`Running: ${command}`); // Log the command being run
  try {
    execSync(command, { stdio: "inherit" }); // Execute the command and inherit stdio to display output in real-time
  } catch (error) {
    logger.error(`Error executing command: ${command}`); // Log the command that failed
    logger.error(error.message); // Log the error message for better debugging
    throw new Error(`Command failed: ${command}`); // Throw an error instead of exiting the process
  }
}

// Function to install a list of dependencies
function installDependencies(dependencies) {
  dependencies.forEach((dependency) => runCommand(`npm install ${dependency}`)); // Iterate over each dependency and run the install command
}

// Function to extract the package name from a GitHub dependency string
function extractPackageNameFromGithubSource(dependency) {
  if (dependency.startsWith("github:")) {
    return dependency.split("/")[1]; // Extract package name after the "/"
  }
  return dependency.split("@")[0]; // Handle standard npm packages or scoped packages
}

// Function to install a development dependency if it's not already in package.json
function installDevDependencyIfMissing(
  packageJsonPath,
  packageName,
  dependency
) {
  // Read and parse package.json to check if the dependency is present
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  const isDependencyInstalled =
    packageJson.devDependencies &&
    Object.keys(packageJson.devDependencies).some(
      (installedDependency) => installedDependency === packageName
    );

  if (!isDependencyInstalled) {
    runCommand(`npm install --save-dev ${dependency}`); // Install the missing development dependency
  } else {
    logger.info(`${packageName} is already installed as a dev dependency.`); // Log that the dependency is already installed
  }
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
  // Get the path to package.json in the current working directory
  const packageJsonPath = path.join(process.cwd(), "package.json");

  // Check if package.json exists, if not, throw an error
  if (!fs.existsSync(packageJsonPath)) {
    logger.error("Error: package.json not found.");
    throw new Error("package.json not found");
  }

  // If not in testing mode, install dependencies and update package.json
  if (!testing) {
    // Define the GitHub dependency for 'type-scaf'
    const githubDependency = "github:leewinter/type-scaf";

    // Extract the package name from the GitHub dependency
    const packageName = extractPackageNameFromGithubSource(githubDependency);

    // Install 'type-scaf' as a dev dependency if it's not already installed
    installDevDependencyIfMissing(
      packageJsonPath,
      packageName,
      githubDependency
    );

    // Define the list of dependencies to install
    const dependencies = [
      "yup", // Schema validation library
      "@mui/material", // Material UI core library
      "@emotion/react", // Emotion library for styling
      "@emotion/styled", // Emotion styled components
      "@mui/x-date-pickers",
      "date-fns@2.28.0",
    ];

    // Install the necessary dependencies
    installDependencies(dependencies);

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
