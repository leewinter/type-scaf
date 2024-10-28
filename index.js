#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();

const packageJson = require("./package.json");

const initPackage = require("./src/scripts/init-package.js");
const copyConfig = require("./src/scripts/copy-config.js");
const copyTemplates = require("./src/scripts/copy-templates.js");
const generateComponents = require("./src/scripts/generate-components.js");

// Define the version of your package
program.version(packageJson.version);

// Define the `init` subcommand
program
  .command("init")
  .description("Initialize something")
  .action(() => {
    console.info("Running init command...");
    initPackage();
    copyConfig();
    copyTemplates();
  });

// Define the `transform` subcommand
program
  .command("transform")
  .description("Transform something")
  .action(() => {
    console.info("Running transform command...");
    generateComponents();
  });

// Parse the arguments
program.parse(process.argv);
