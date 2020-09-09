#!/usr/bin/env node
const fs = require('fs').promises;
const exist = require('fs').existsSync;
const path = require('path');
const flags = require('fs').constants;


const createOrLogDir = async (p) => {
  try {
    await fs.mkdir(p,  { recursive: true });
  } catch (ex) {
    console.log(`Failed to create directory ${p}, this is probably because it already exist!`);
  }
}

const touch = async (p) => {
  const fh = await fs.open(p, flags.O_CREAT | flags.O_RDWR);
  await fh.close();
};

const run = async () => {
  if (!exist(path.resolve(process.cwd(), 'package.json'))) {
    console.log('No package file exist. Creating a base package file!');
    await fs.writeFile(path.resolve(process.cwd(), 'package.json'), JSON.stringify({
      name: '@your-org/a-package',
      main: 'dist/index.js',
      version: '1.0.0',
      dependencies: {},
      devDependencies: {},
      scripts: {}
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

  console.log('Creating directories.');

  await createOrLogDir(path.resolve(process.cwd(), 'dist'));
  await createOrLogDir(path.resolve(process.cwd(), 'src', 'js'));
  await createOrLogDir(path.resolve(process.cwd(), 'src', 'style'));
  await createOrLogDir(path.resolve(process.cwd(), 'assets', 'images'));
  await createOrLogDir(path.resolve(process.cwd(), 'assets', 'fonts'));
  await createOrLogDir(path.resolve(process.cwd(), 'assets', 'static'));


  await touch(path.resolve(process.cwd(), 'dist', '.gitkeep'));
  await touch(path.resolve(process.cwd(), 'assets', 'images', '.gitkeep'));
  await touch(path.resolve(process.cwd(), 'assets', 'fonts', '.gitkeep'));
  await touch(path.resolve(process.cwd(), 'assets', 'static', '.gitkeep'));


  console.log('Populating src and dist directories.');
  await touch(path.resolve(process.cwd(), 'src', 'style', 'index.scss'));
  await touch(path.resolve(process.cwd(), 'src', 'js', 'index.js'));

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

