# Simple webpack

<a href="http://www.wtfpl.net/"><img src="http://www.wtfpl.net/wp-content/uploads/2012/12/wtfpl-badge-4.png" width="80" height="15" alt="WTFPL" /></a>

Why make it hard? It's quite simple!

---

This repository contains a small init script which generates a simple webpack setup for web application development.  
Other than the configuration, it updates your package.json file to include the required dependencies, devDependencies
and scripts.

The directory structure it creates looks like this:

```
// pwd
webpack.config.js
/dist
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
