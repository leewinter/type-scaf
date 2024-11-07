const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = () => {
  const packageJsonPath = path.join(process.cwd(), "package.json");
  let packageJson;

  if (fs.existsSync(packageJsonPath)) {
    packageJson = require(packageJsonPath);
  } else {
    console.error("Error: package.json not found.");
    process.exit(1);
  }

  // Install the package as a dev dependency only if not already installed
  if (
    !packageJson.devDependencies ||
    !packageJson.devDependencies["type-scaf"]
  ) {
    const installCommand = "npm install --save-dev github:leewinter/type-scaf";
    console.log(`Running: ${installCommand}`);
    execSync(installCommand, { stdio: "inherit" });
  } else {
    console.log("type-scaf is already installed as a dev dependency.");
  }

  const installYupCommand = "npm install yup";
  console.log(`Running: ${installYupCommand}`);
  execSync(installYupCommand, { stdio: "inherit" });

  const installMaterialUiCommand =
    "npm install @mui/material @emotion/react @emotion/styled";
  console.log(`Running: ${installMaterialUiCommand}`);
  execSync(installMaterialUiCommand, { stdio: "inherit" });

  // Re-read package.json to get any modifications made by npm install
  packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  // Update package.json to include a new script
  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts["scaf-init"] = "type-scaf init";
  packageJson.scripts["scaf-transform"] = "type-scaf transform";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("Scaf scripts added to package.json.");
  console.log("Installation complete.");
};
