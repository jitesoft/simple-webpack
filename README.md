# Simple webpack

[![DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE](https://raw.githubusercontent.com/jitesoft/simple-webpack/master/wtfpl-badge-4.png)](http://www.wtfpl.net)

Why make it hard? It's quite simple!

---

This repository contains a small init script which generates a simple webpack setup for web application development.  
Other than the configuration, it updates your package.json file to include the required dependencies, devDependencies
and scripts.

The directory structure it creates looks like this:

```
// pwd
webpack.config.js
/assets
  /fonts
    /.gitkeep
  /images
    /.gitkeep
  /static
    /.gitkeep
/dist
  /.gitkeep
/src
  /.babelrc
  /index.js
  /js
    /index.js
  /style
    /index.scss
```

If no package file is found, a default package file will be created.

The intention is that the script should allow you to keep all your files intact (exception with the webpack and package files).
If there are any issues with this, please let me know via github issues.

**Usage**  

Initialize your simple-webpack project!

```
// From NPM
npx @jitesoft/simple-webpack
// Or from repo
npx github:@jitesoft/simple-webpack
```

Start building!

````
npm i && npm run build      // depends on your node_env
npm i && npm run build:prod // prod either way!
npm i && npm run build:dev  // dev either way!
npm i && npm run watch      // watches your files and compiles them (dev only)
````

## More details

If you wish to know what everything in the webpack file does, check the file itself, as it is quite
well commented!  
But, either way, feel free to read here if you can't figure out what webpack is doing even then!

E## Compression and such

#### JS and Css

All the JavaScript files which are included through the `src/index.js` file will be ran by the babel loader and 
then minified with terser, the base file will be placed in `dist/index.js` and all chunks (in case the application is large)
will be placed in the same directory but using chunk-hash as the name.

SCSS files in the `src/styles` directory that are included in the `index.scss` file will be ran by the sass loader and
after being converted to standard css they will be extracted and minified.  
The output file will be `dist/index.css`. Any CSS included in the JavaScript code will as well be parsed and emitted to the dist dir.

#### Static files

Any files that you wish to have emitted into the dist directory should be placed in the `static` directory.  
Subdirectories will be created, not flattened.

#### Images

This configuration uses the imagemin-webpack plugin to compress images. The following image formats
are compressed with losless compression:

    * jpe?g 
    * png
    * gif 
    * tif 
    * webp 
    * svg

Other images (or any files) in the `assets/images` directory will be copied to the `dist/images` directory, while these will
be compressed and then placed in the same directory.  
The filenames will be kept intact.

#### Fonts

Fonts are not tampered with, while they are moved to the `dist/fonts` directory in case they are placed in the `assets/fonts` dir 
or included in JavaScript or in SCSS.

---

License: WTFPL


```
             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                     Version 2, December 2004
 
  Copyright (C) 2020 Jitesoft
 
  Everyone is permitted to copy and distribute verbatim or modified
  copies of this license document, and changing it is allowed as long
  as the name is changed.
 
             DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
    TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION
 
   0. You just DO WHAT THE FUCK YOU WANT TO.
```
