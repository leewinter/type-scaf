#!/usr/bin/env node

const { Command } = require("commander");
const program = new Command();
const logger = require("./src/utils/logger.js");

const packageJson = require("./package.json");
const {
  initPackage,
  copyConfig,
  copyTemplates,
} = require("./src/scripts/init");
const { generateComponents } = require("./src/scripts/generate-components.js");

// Define the version of your package
program.version(packageJson.version);

// Shared options definition
const addTestOption = (command) => {
  return command.option("-t, --test", "enable test mode");
};

// Action Handlers
const handleInit = (options) => {
  try {
    logger.info(`Running init command...${options.test ? " (Test Mode)" : ""}`);
    initPackage(options.test);
    copyConfig(options.test);
    copyTemplates(options.test);
  } catch (error) {
    logger.error("Error during init:", error.message);
    process.exit(1);
  }
};

const handleTransform = (options) => {
  try {
    logger.info(
      `Running transform command...${options.test ? " (Test Mode)" : ""}`
    );
    generateComponents(options.test);
  } catch (error) {
    logger.error("Error during transform:", error.message);
    process.exit(1);
  }
};

// Define the `init` subcommand
addTestOption(
  program.command("init").description("Initialize something").action(handleInit)
);

// Define the `transform` subcommand
addTestOption(
  program
    .command("transform")
    .description("Transform something")
    .action(handleTransform)
);

// Parse the arguments
program.parse(process.argv);
