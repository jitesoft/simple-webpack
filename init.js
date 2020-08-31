#!/usr/bin/env node
const fs = require('fs').promises;
const exist = require('fs').existsSync;
const path = require('path');
const flags = require('fs').constands;

const run = async () => {

  if (!exist(path.resolve(process.cwd(), 'package.json'))) {
    console.log('No package file exist. Creating a base package file!');
    await fs.writeFile(path.resolve(process.cwd(), 'package.json'), JSON.stringify({
      dependencies: {},
      devDependencies: {},
      scripts: {},
      main: 'dist/index.js'
    }));
  }

  const pkg = JSON.parse(await fs.readFile(path.resolve(process.cwd(), 'package.json')));

  const intPkg = JSON.parse(await fs.readFile(path.resolve(__dirname, 'package.json')));

  console.log('Checking dependencies if there are any required dependencies missing...');
  for (const key of Object.keys(intPkg.dependencies)) {
    if (!(key in pkg.dependencies)) {
      console.log(`Adding dependency ${key}`);
      pkg.dependencies[key] = intPkg.dependencies[key];
    }
  }

  console.log('Checking dev dependencies if there are any required dev dependencies missing...');
  for (const key of Object.keys(intPkg.devDependencies)) {
    if (!(key in pkg.devDependencies)) {
      console.log(`Adding devDependency ${key}`);
      pkg.devDependencies[key] = intPkg.devDependencies[key];
    }
  }

  console.log('Updating scripts...');
  for (const key of Object.keys(intPkg.scripts)) {
    if (!(key in pkg.scripts)) {
      console.log(`Adding new script ${key}`);
      pkg.scripts[key] = intPkg.scripts[key];
    }
  }

  console.log('Creating source and dist directories.');
  await fs.mkdir(path.resolve(process.cwd(), 'dist'));
  await fs.mkdir(path.resolve(process.cwd(), 'src', 'js'), { recursive: true });
  await fs.mkdir(path.resolve(process.cwd(), 'src', 'style'), { recursive: true });

  await fs.open(path.resolve(process.cwd(), 'src', 'style', 'index.scss'), flags.O_CREAT | flags.O_RDWR);
  await fs.open(path.resolve(process.cwd(), 'src', 'js', 'index.js'), flags.O_CREAT | flags.O_RDWR);

  console.log('Copying configuration files...');
  await fs.copyFile(path.resolve(__dirname, 'src', 'js', '.babelrc'), path.resolve(process.cwd(), 'src', 'js', '.babelrc'));

  console.log('Creating webpack file...');
  await fs.copyFile(path.resolve(__dirname, 'webpack.config.js'), path.resolve(process.cwd(), 'webpack.config.js'));
};

run().then(() => {
  console.log('All done! Have fun!');
}).catch(error => console.error(error));
