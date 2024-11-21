const fs = require("fs");
const { execSync } = require("child_process");
const logger = require("../../utils/logger");
const path = require("path");

function getPackageJsonPath() {
  // Get the path to package.json in the current working directory
  const packageJsonPath = path.join(process.cwd(), "package.json");

  // Check if package.json exists, if not, throw an error
  if (!fs.existsSync(packageJsonPath)) {
    logger.error("Error: package.json not found.");
    throw new Error("package.json not found");
  }

  return packageJsonPath;
}

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

function installDependenciesIfMissing(dependencies) {
  const packageJsonPath = getPackageJsonPath();

  // Read and parse package.json to check if the dependency is present
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  const dependencyKeys = Object.keys(dependencies);

  dependencyKeys.forEach((packageName) => {
    const isDependencyInstalled =
      packageJson.dependencies &&
      Object.keys(packageJson.dependencies).some(
        (installedDependency) => installedDependency === packageName
      );

    if (!isDependencyInstalled)
      installDependencies([`${packageName}@${dependencies[packageName]}`]);
    else logger.info(`Package ${packageName} already installed`);
  });
}

module.exports = {
  getPackageJsonPath,
  installDependencies,
  installDevDependencyIfMissing,
  installDependenciesIfMissing,
};
