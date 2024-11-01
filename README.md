# Getting Started

### Create a new react project (optional)

Package only supports javascript for now so don't create with Typescript

```Bash
npm create vite@latest
```

#### Install Storybook

```Bash
npx storybook init
```

### Initialise the package

#### Clear pending changes (optional)

```Bash
git init

git add .

git commit -m "Ground zero"
```

#### Init the package

```Bash
npx github:leewinter/type-scaf init
```

All going well this will add dependencies and scripts for the project.

In the root of the project it should make a type-scaf/config folder and a package-types.ts file with some example classes that can be changed as required.

Run some test transforms against the example types

```Bash
npm run scaf-transform
```

Hopefully this will generate some components and stories in your src directory that can now be viewed.

```Bash
npm run storybook
```
