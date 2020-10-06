/* eslint-disable */
// These are all the packages that we directly use in the configuration.
const Path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const CssMinimizer = require('css-minimizer-webpack-plugin');
const ImageMinPlugin = require('imagemin-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpPlugin = require('imagemin-webp-webpack-plugin');
const webpack = require('webpack');
const pkg = require('./package.json');
const fs = require('fs');

let configuration = {
  'publicPath': '',
  'proxyUri': null,
  'devServerPort': 9000,
  'fonts': { 'outputDir': 'fonts/' },
  'js': { 'outputDir': '' },
  'css': { 'outputDir': '' },
  'static': { 'outputDir': '' },
  'images': {
    'outputDir': 'images',
    'plugins': [
      ['mozjpeg', { 'quality': 70 }],
      ['gifsicle', {}],
      ['optipng', {}],
      ['svgo', {}]]
  }
};
try {
  configuration = JSON.parse(fs.readFileSync(Path.resolve(__dirname, '.simple'), 'utf8'));
} catch (e) {
  console.log(e);
  console.info('Failed to read configuration file (.simple in root dir), skipping.');
}

// All configuration that a user is intended to do themselves, that is, you
// are loaded here from env variables, or if not defined there, the package file.
// Environment variables that can be used!
const publicPath = process.env.SW_PUBLIC_PATH || configuration.publicPath;
const proxyUri = process.env.PROXY_URI || configuration.proxyUri;
const devServerPort = process.env.SW_DEV_SERVER_PORT || configuration.devServerPort;

// The following lists and objects are created here because
// they are used both in the development and production versions, but with
// different configurations.
// For example. If we use the dev-server, we don't want the assets to be
// emitted. If we run development, we don't want the dev-server to inject
// a websocket script into the index.js file.
let plugins = [];
const extraCssLoaders = [];
const extraImageLoaders = [];
const extraFontLoaders = [];
const extraJsLoaders = [];
let devServer = {};

// Due to a few plugins requiring to be in specific indexes of the array of plugins
// and for them to run both in dev and prod, they are defined here as variables
// and then included where they are needed.

// This plugin will convert all jpeg and png images into webp images
// it does not replace them, but instead creates an alternative webp image
// which is a lot more suitable for webpages.
// The quality is set to 65 to give a good quality while it still makes
// most images quite a bit smaller.
const webpH = new WebpPlugin({
  config: [{
    test: /\.(jpe?g|png)$/i,
    options: {
      quality: 65
    }
  }]
});
// You might notice here that this is almost identical to the above plugin.
// It is, while in this one, we use the lowest possible compression to make
// the image as small as possible.
// The produced image will have another file-end (name.ext.webp instead of
// name.webp) and could be used as a preload image in case the quality
// is too low for "real" usage.
const webpL = new WebpPlugin({
  config: [{
    test: /\.(jpe?g|png)$/i,
    options: {
      quality: 1
    }
  }],
  overrideExtension: false
});

if (process.env.WEBPACK_DEV_SERVER) {
  plugins.push(
    new webpack.HotModuleReplacementPlugin(),
  );

  devServer = {
    // For full options and more in depth description of the dev-server, check
    // out the following link: https://webpack.js.org/configuration/dev-server/
    contentBase: Path.join(__dirname, 'dist'),
    contentBasePublicPath: ``,
    publicPath: `${publicPath}`,
    compress: true,
    port: devServerPort,
    hot: true,
    stats: 'minimal',
    injectClient: true,
    injectHot: true,
    overlay: {
      errors: true,
      warnings: false
    },
    // You can uncomment the below line if you don't want to bother
    // with 'allowedHosts' list. But it comes with security
    // risks in case you are exposing the application to the "open net"!
    // disableHostCheck: true,
    allowedHosts: [
      '.local',
      'localhost'
    ],
    onListening: function (server) {
      const port = server.listeningApp.address().port;
      console.info('********************************************************************************');
      console.info('           @jitesoft/simple-webpack (and WebPack) presents!                     ');
      console.info(`           ${pkg.name} - ${pkg.version}                                         `);
      console.info('                                                                                ');
      console.info(`           Listening on port: ${port}                                           `);
      console.info('           To access your assets, open a browser and go to                      ');
      console.info(`           http://127.0.0.1:${port}                                             `);
      console.info('                                                                                ');
      console.info(`           Have fun!                                                            `);
      console.info('********************************************************************************');
    }
  };

  if (proxyUri !== null) {
    devServer.index = '';
    devServer.proxy = {
      context: () => true,
      target: proxyUri
    };
  }
}

plugins.push(
  // CopyWebpackPlugin basically just copies the files in the directories defined.
  // Some plugins do although pick those up, allowing us to for example optimize images!
  new CopyWebpackPlugin({
    patterns: [
      {
        from: 'assets/images/',
        to: configuration.images.outputDir,
        noErrorOnMissing: true,
        globOptions: {
          dot: false
        }
      },
      {
        from: 'assets/static/',
        to: configuration.static.outputDir,
        noErrorOnMissing: true,
        globOptions: {
          dot: false
        }
      },
      {
        from: 'assets/fonts/',
        to: configuration.fonts.outputDir,
        noErrorOnMissing: true,
        globOptions: {
          dot: false
        }
      }
    ]
  }),
  webpH,
  webpL,
  // Imagemin compresses images passed through it, yay!
  // It's important that this plugin is defined AFTER the copy webpack plugin.
  // If it is not, it will not be able to compress the images.
  new ImageMinPlugin({
    test: /\.(jpe?g|png|gif|tif|svg)$/i,
    imageminOptions: {
      // All the imagemin plugins are loaded from an array in the package.json config
      // property. You can change the plugin options from there if wanted.
      // Check out the following links for more specific information.
      // https://github.com/webpack-contrib/image-minimizer-webpack-plugin
      // https://github.com/imagemin/imagemin
      plugins: configuration.images.plugins
    },
    name: '[path][name].[ext]',
    publicPath: `${publicPath}/${configuration.images.outputDir}`,
    loader: true
  }),
  // This plugin allow us to extract the CSS from the javascript.
  // Without it the css would be included in the JS code, something some
  // people might get a bit confused by
  new MiniCssExtractPlugin({
    filename: 'index.css',
    chunkFilename: 'chunks/[id].css',
    publicPath: `${publicPath}/${configuration.css.outputDir}`
  })
);

// So... Here comes the "real" configuration. All the other stuff is only for
// plugins and such. This is the actual webpack config!
module.exports = {
  // If the environment is production, we want to use some type of
  // minifier for the JS and CSS.
  // So the minimizer option gets two minification plugins, one for js one for css.
  optimization: (process.env.NODE_ENV === 'production' ? {
    minimizer: [
      new TerserJSPlugin({}),
      new CssMinimizer({
        parallel: true, // Change to false or a set number of threads if it uses too much.
        sourceMap: true,
        minimizerOptions: {
          preset: [
            'default', {
              discardComments: { removeAll: true }
            }
          ]
        }
      })
    ]
  } : {}),
  // If the NODE_ENV is not set, we default to production.
  mode: process.env.NODE_ENV ? process.env.NODE_ENV : 'production',
  // The target for this config is WEB.
  // Due to this, the file will be slightly larger than if we just made it plain js.
  // This is because we use both babel (which includes some stuff to make features available for us,
  // AND we use WebPack which sets up some code allowing webpack to use `require` and similar
  // important functionality.
  // So... a file with just a variable assignment is actually larger than if you wrote it by hand :O
  target: 'web',
  // Entry path is the file that all of the scripts is loaded from.
  // The file in question in this case is src/index.js
  // if you take a peek in it, you will notice that it loads both the JS and SCSS
  // files in the subdirs.
  // This is because weback allow us to use `include` for basically any asset!
  entry: Path.resolve(__dirname, 'src', 'index.js'),
  output: {
    // The output will create a index.js file, this file
    // will in turn include a bunch of chunked files in the
    // case where the index file is too big.
    // This speeds up the site load as it will allow the different
    // scripts to load asynchronously instead of one big file.
    filename: 'index.js',
    // The chunkFilename is a hash of the file.
    chunkFilename: 'chunks/[chunkhash:16].js'
  },
  plugins: [
    ...plugins,
    // This (always) last plugin is a custom plugin.
    // Due to the `webp` plugin not allowing us to define a name
    // of the output file by ourselves, this little plugin is used
    // to rename the image from `[name].[ext].webp` to `[name].low.webp`.
    new (class {
      apply (compiler) {
        compiler.hooks.emit.tap('RenamePlugin', (compilation) => {
          const names = Object.keys(compilation.assets);
          const reg = /.*[.](jpe?g|png)[.]webp$/;
          let ext, name, newName;
          for (let i = names.length; i-- > 0;) {
            name = names[i];
            if (reg.test(name)) {
              ext = name.match(reg)[1];
              newName = name.replace(`.${ext}.webp`, '.low.webp');
              compilation.assets[newName] = compilation.assets[name];
              delete compilation.assets[name];
            }
          }
        });
      }
    })
  ],
  module: {
    // Rules is where the real magic happens.
    // Each rule have a test, the test should be a test against files
    // that are `import`ed in the code.
    // When one of the rules matches, the `loaders` in the `use` clause
    // will be invoked, they are invoked from bottom to top if there are more than
    // one loader.
    rules: [
      {
        // Fonts will be "moved" with the file-loader if included in JS.
        test: /\.(eot|ttf|woff|woff2|otf)$/i,
        use: [
          ...extraFontLoaders,
          {
            loader: 'file-loader',
            options: {
              outputPath: configuration.fonts.outputDir,
              name: '[name].[ext]',
              publicPath: `${publicPath}/${configuration.fonts.outputDir}`
            }
          }
        ]
      },
      {
        // JavaScript will be parsed by the babel-loader, converting the code
        // from the JS version you prefer to make it possible to run on older
        // JS engines!
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: [
          ...extraJsLoaders,
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        // Sass, Scss and Css files are all ran through multiple loaders!
        // First they go through the sass-loader to transpile the sass
        // to css. Then it goes through the css-loader to add features
        // to support more than the latest browsers.
        // After that it is passed to the extract plugin loader, which
        // moves the css into its own file/s.
        test: /\.(sass|scss|css)$/i,
        use: [
          ...extraCssLoaders,
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              outputPath: '',
              publicPath: `${publicPath}/${configuration.css.outputDir}`,
              name: '[name].[ext]',
              hmr: !!process.env.WEBPACK_DEV_SERVER
            }
          },
          'css-loader',
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass')
            }
          }
        ]
      },
      {
        // In this configuration all the images are moved with the `file-loader`.
        // I usually prefer to bake the smaller images into the javascript or css
        // but this will be more easy to manage!
        test: /\.(ico|jpe?g|png|gif|tif|webp|svg)$/i,
        use: [
          ...extraImageLoaders,
          {
            // Most image types will be replaced by compressed images (imagemin plugin).
            loader: 'file-loader',
            options: {
              outputPath: configuration.images.outputDir,
              name: '[name].[ext]',
              publicPath: `${publicPath}/${configuration.images.outputDir}`,
            }
          }
        ]
      }
    ]
  },
  devServer: devServer
};
