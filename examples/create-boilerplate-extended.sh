#!/bin/bash

# primary arg passed as project name
project_name=$1

# create a default react vite site
npm create vite@latest $project_name -- --template react

# jump inside the new project created
cd $project_name
# CI=true

# install default dependencies
npm i

# initialise the type-scaf project, installing dependencies, config, and templates
yes '' | npx github:leewinter/type-scaf init

# update the types with our extended version
cp "../types/extended-package-types.ts" "./.type-scaf/config/package-types.ts"

# run the transform script turning the local config and templates into components
npm run scaf-transform

# initialise storybook
yes '' | npx storybook@latest init --no-dev

# remove storybook example stories
rm -rf ./src/stories

# launch storybook
npm run storybook

exit 0