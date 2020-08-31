#!/usr/bin/env node
const fs = require('fs').promises;
const exist = require('fs').existsSync;
const path = require('path');
const flags = require('fs').constants;


const createOrLogDir = async (path) => {
  try {
    await fs.mkdir(path,  { recursive: true });
  } catch (ex) {
    console.log(`Failed to create directory ${path}, this is probably because it already exist!`);
  }
}

const run = async () => {

  if (!exist(path.resolve(process.cwd(), 'package.json'))) {
    console.log('No package file exist. Creating a base package file!');
    await fs.writeFile(path.resolve(process.cwd(), 'package.json'), JSON.stringify({
      name: '@your-org/a-package',
      dependencies: {},
      devDependencies: {},
      scripts: {},
      main: 'dist/index.js'
    }));
  }

  const pkg = JSON.parse(await fs.readFile(path.resolve(process.cwd(), 'package.json')));
  const intPkg = JSON.parse(await fs.readFile(path.resolve(__dirname, 'templates', 'package.json')));

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

  await createOrLogDir(path.resolve(process.cwd(), 'dist'));
  await createOrLogDir(path.resolve(process.cwd(), 'src', 'js'));
  await createOrLogDir(path.resolve(process.cwd(), 'src', 'style'));

  console.log('Populating src and dist directories.');
  await fs.open(path.resolve(process.cwd(), 'src', 'style', 'index.scss'), flags.O_CREAT | flags.O_RDWR);
  await fs.open(path.resolve(process.cwd(), 'src', 'js', 'index.js'), flags.O_CREAT | flags.O_RDWR);

  if (exist(path.resolve(process.cwd(), 'src', 'index.js'))) {
    console.log(`Failed to create ${path.resolve(process.cwd(), 'src', 'index.js')}, file already exist.`);
  } else {
    await fs.copyFile(path.resolve(__dirname, 'templates', 'index.js'), path.resolve(process.cwd(), 'src', 'index.js'));
  }

  console.log('Copying configuration files...');
  await fs.copyFile(path.resolve(__dirname, 'templates', '.babelrc'), path.resolve(process.cwd(), 'src', '.babelrc'));

  console.log('Creating webpack file...');
  await fs.copyFile(path.resolve(__dirname, 'templates', 'webpack.config.js'), path.resolve(process.cwd(), 'webpack.config.js'));

  console.log('Writing new package file...');
  await fs.writeFile(path.resolve(process.cwd(), 'package.json'), JSON.stringify(pkg, null, 4));
};

run().then(() => {
  console.log('All done! Have fun!');
  console.info('To start using the new scripts, run `npm i && npm run build` and check the other scripts in the package file!');
}).catch(error => console.error(error));

