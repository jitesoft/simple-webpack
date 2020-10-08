#!/usr/bin/env node
const fs = require('fs').promises;
const exist = require('fs').existsSync;
const path = require('path');
const flags = require('fs').constants;
const semver = require('./semver');

const createOrLogDir = async (p) => {
  try {
    await fs.mkdir(p, { recursive: true });
  } catch (ex) {
    process.stdout.write(`Failed to create directory ${p}, this is probably because it already exist!\n`);
  }
};

const touch = async (p) => {
  const fh = await fs.open(p, flags.O_CREAT | flags.O_RDWR);
  await fh.close();
};

const run = async () => {
  if (!exist(path.resolve(process.cwd(), 'package.json'))) {
    process.stdout.write('No package file exist. Creating a base package file!\n');
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

  process.stdout.write('Checking dependencies and devDependencies to see if there are any required dependencies missing...\n');
  const add = 'Adding dependency';
  const upd = 'Updating version of';

  ['dependencies', 'devDependencies'].forEach((depType) => {
    for (const key of Object.keys(intPkg[depType])) {
      if (!(key in pkg[depType]) || semver.diff(pkg[depType][key], intPkg[depType][key]) < 0) {
        process.stdout.write(`${key in pkg[depType] ? upd : add} ${key} (${depType})\n`);
        pkg[depType][key] = intPkg[depType][key];
      }
    }
  });

  process.stdout.write('Checking dependencies if there are deprecated packages to remove (replaced by new packages)...\n')
  for (const key of intPkg.remove) {
    if (key.name in pkg.dependencies) {
      process.stdout.write(`Removing ${key.name} from dependencies.\n`);
      process.stdout.write(`\tReason: ${key.reason}\n`);
      delete pkg.dependencies[key.name];
    }
    if (key.name in pkg.devDependencies) {
      process.stdout.write(`Removing ${key.name} from devDependencies.\n`);
      process.stdout.write(`\tReason: ${key.reason}\n`);
      delete pkg.devDependencies[key.name];
    }
  }

  process.stdout.write('Updating scripts...\n');
  for (const key of Object.keys(intPkg.scripts)) {
    if (!(key in pkg.scripts)) {
      process.stdout.write(`Adding new script ${key}\n`);
      pkg.scripts[key] = intPkg.scripts[key];
    } else if (pkg.scripts[key] !== intPkg.scripts[key]) {
      process.stdout.write(`Replacing script ${key} with updated script.\n`);
      process.stdout.write(`\tCreating backup script as ${key}:backup in case you wish to revert.\n`);
      pkg.scripts[`${key}:backup`] = pkg.scripts[key];
      pkg.scripts[key] = intPkg.scripts[key];
    }
  }

  process.stdout.write('Creating directories...\n');

  await createOrLogDir(path.resolve(process.cwd(), 'dist'));
  await createOrLogDir(path.resolve(process.cwd(), 'src', 'js'));
  await createOrLogDir(path.resolve(process.cwd(), 'src', 'style'));
  await createOrLogDir(path.resolve(process.cwd(), 'assets', 'images'));
  await createOrLogDir(path.resolve(process.cwd(), 'assets', 'fonts'));
  await createOrLogDir(path.resolve(process.cwd(), 'assets', 'static'));

  await touch(path.resolve(process.cwd(), 'dist', '.gitkeep'));
  await touch(path.resolve(process.cwd(), 'assets', 'images', '.gitkeep'));
  await touch(path.resolve(process.cwd(), 'assets', 'fonts', '.gitkeep'));
  if (!exist(path.resolve(process.cwd(), 'assets', 'static', 'index.html'))) {
    await fs.copyFile(path.resolve(__dirname, 'templates', 'index.html'), path.resolve(process.cwd(), 'assets', 'static', 'index.html'));
  }
  await touch(path.resolve(process.cwd(), 'assets', 'static', 'index.html'));

  process.stdout.write('Populating src and dist directories...\n');
  await touch(path.resolve(process.cwd(), 'src', 'style', 'index.scss'));
  await touch(path.resolve(process.cwd(), 'src', 'js', 'index.js'));

  if (exist(path.resolve(process.cwd(), 'src', 'index.js'))) {
    process.stdout.write(`Index.js file already exist. Not re-creating.\n`);
  } else {
    await fs.copyFile(path.resolve(__dirname, 'templates', 'index.js'), path.resolve(process.cwd(), 'src', 'index.js'));
  }

  if (!exist(path.resolve(process.cwd(), '.simple'))) {
    await fs.copyFile(path.resolve(__dirname, 'templates', '.simple'), path.resolve(process.cwd(), '.simple'));
  }

  process.stdout.write('Copying configuration files...\n');
  await fs.copyFile(path.resolve(__dirname, 'templates', '.babelrc'), path.resolve(process.cwd(), 'src', '.babelrc'));

  process.stdout.write('Creating webpack file...\n');
  await fs.copyFile(path.resolve(__dirname, 'templates', 'webpack.config.js'), path.resolve(process.cwd(), 'webpack.config.js'));

  process.stdout.write('Writing new package file...\n');
  await fs.writeFile(path.resolve(process.cwd(), 'package.json'), JSON.stringify(pkg, null, 4));
};

run().then(() => {
  process.stdout.write('All done! Have fun!\n\n');
  process.stdout.write('To start using the new scripts, run `npm i && npm run build` and check the other scripts in the package file!\n');
}).catch(error => console.error(error));

