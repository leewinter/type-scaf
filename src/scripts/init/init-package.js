const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = () => {
  // Install the package as a dev dependency
  // const installCommand = "npm install --save-dev ../type-scaf";
  // console.log(`Running: ${installCommand}`);
  // execSync(installCommand, { stdio: "inherit" });

  // const installEjsCommand = "npm install --save-dev ejs";
  // console.log(`Running: ${installEjsCommand}`);
  // execSync(installEjsCommand, { stdio: "inherit" });

  const installYupCommand = "npm install yup";
  console.log(`Running: ${installYupCommand}`);
  execSync(installYupCommand, { stdio: "inherit" });

  const installMaterialUiCommand = "npm install @mui/material";
  console.log(`Running: ${installMaterialUiCommand}`);
  execSync(installMaterialUiCommand, { stdio: "inherit" });

  // Update package.json to include a new script
  const packageJsonPath = path.join(process.cwd(), "package.json");
  const packageJson = require(packageJsonPath);

  packageJson.scripts = packageJson.scripts || {};
  packageJson.scripts["scaf-init"] = "type-scaf init";
  packageJson.scripts["scaf-transform"] = "type-scaf transform";

  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log("Scaf scripts added to package.json.");
  console.log("Installation complete.");
};
