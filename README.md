# Simple webpack

[![DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE](https://raw.githubusercontent.com/jitesoft/simple-webpack/master/wtfpl-badge-4.png)](http://www.wtfpl.net)

Why make it hard? It's quite simple!

---

This repository contains a small init script which generates a simple webpack setup for web application development.  
Other than the configuration, it updates your package.json file to include the required dependencies, devDependencies
and scripts.

The directory structure it creates looks like this:

```
your-package/
├─ assets/
│  ├─ fonts/
│  │  ├─ .gitkeep
│  ├─ images/
│  │  ├─ .gitkeep
│  ├─ static/
│  │  ├─ index.html
├─ dist/
│  ├─ .gitkeep
├─ src/
│  ├─ style/
│  │  ├─ index.scss
│  ├─ js/
│  │  ├─ index.js
│  ├─ index.js
├─ webpack.config.json
├─ .simple
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
npm i && npm run serve      // Serve a http client on 0.0.0.0:9000 
````

By default, an index.html file exists in the `assets/static` directory, it includes the js and css files by default
and can be changed as wanted to fit your use case.

## More details

If you wish to know what everything in the webpack file does, check the file itself, as it is quite
well commented!  
But, either way, feel free to read here if you can't figure out what webpack is doing even then!

### Public Path

When webpack compiles your assets, it will change all asset paths to fit the new location of the files.  
The default public path used is `/`, that is, it expects the content of `dist` to be placed in the root web directory.  

To change this, you can either use an environment variable (`SW_PUBLIC_PATH`) or change the `SW_PUBLIC_PATH` variable in the
`webpack.config.js` file. Remember, the public path is the path _from_ the web-root.

### Configuration

There are two ways to configure the behaviour. You can use the pre-created `.simple` configuration (json) to
change any of the variables inside it or you can use `ENV` variables.

#### .simple

This is a simple config!  
Defaults looks like the following:

```
{
    "publicPath": "",
    "proxyUri": null,
    "devServerPort": 9000,
    "fonts": { "outputDir": "fonts/" },
    "js": { "outputDir": "" },
    "css": { "outputDir": "" },
    "static": { "outputDir": "" },
    "images": {
        "outputDir": "images",
        "plugins": [
            ["mozjpeg", { "quality": 70 }],
            [ "gifsicle", {} ],
            [ "optipng", {} ],
            [ "svgo", {} ]
        ]
    }
}
```

All json and will be loaded at the start of the webpack config in case it exists.

#### Environment variables

Environment variables overrides the configuration file and are defined as `SW_CONFIG_SEPERATED_WITH_UNDERSCORE`, sub-objects
are separated with __ (double underscore). arrays are not currently supported (making for example the `images.plugins` configuration 
not possible to change via env variables yet).

Examples:
 
```dotenv
SW_PUBLIC_PATH     
SW_PROXY_URI       
SW_IMAGES__OUTPUT_DIR 
```

### Compression and such

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
are compressed:

    * jpe?g 
    * png
    * gif 
    * tif 
    * svg

Other images (or any files) in the `assets/images` directory will be copied to the `dist/images` directory, while these will
be compressed and then placed in the same directory.  
The filenames will be kept intact.

Webp images will be left as is (and copied to the images dist dir), while all PNG and JPG
images will get two webp siblings in the directory (`[name].webp` and `[name].low.webp`).  

The `[name].low.webp` image is compressed with lowest quality and (if not good enough for you) a good choice to use
as a pre-load image in case the other images are large, the `[name].webp` uses a higher quality which should be
enough for most cases.

##### Defaults?

The image compression plugins (which uses imagemin) are mostly using the default values, with exception to jpeg and 
webp.  
To change the defaults for all (but webp), change the plugin configuration in the `imgminPlugins` array. Although, the defaults
are decent for most cases.

Quality for webp can be changed in the `ImageminWebpWebpackPlugin` config definition.

#### Fonts

Fonts are not tampered with, but they are moved to the `dist/fonts` directory in case they are placed in the `assets/fonts` dir 
or included in JavaScript or in SCSS.

### Serve

You can allow webpack to serve your content as a http server (uses nodejs express), the current settings allow you
to access the assets on localhost port 9000. The `localhost` and `*.local` domains are set to be accepted,
but read the comments in the webpack file if you wish to enable more or turn off blocking over all.

The server is set to inject a hot module swap client inside the index.js file, so if enabled, it will allow for hot swapping.

When using the dev server, the public path will have to be used.

Including the assets is done by adding script tags pointing to the specific file you need:

```text
<script src="localhost:9000/index.js"></script>
```

You can also enable the proxy of the webpack server to allow another page to be proxied through it.
This is done by setting the `SW_PROXY_URI` to the uri of the proxied page.  
When doing this, you will have the pages on the same uri and any request not going to one of the
webpack assets will be proxied to the other service.

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
