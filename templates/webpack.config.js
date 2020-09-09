/* eslint-disable */
// If you wish to have the root directory of all the assets built
// with a given path, say for example, you wish to put all the assets
// in a `my-assets/lalala` public url path and reach them from somewhere else,
// change the following variable to that path!
const PUBLIC_PATH = process.env.PUBLIC_PATH || ''; // Deprecated.

// Environment variables that can be used!
const SW_PUBLIC_PATH = process.env.SW_PUBLIC_PATH || PUBLIC_PATH;
const SW_PROXY_URI = process.env.PROXY_URI || null;
const SW_DEV_SERVER_PORT = process.env.SW_DEV_SERVER_PORT || 9000;

const Path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const ImageMinPlugin = require('imagemin-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminWebpWebpackPlugin= require("imagemin-webp-webpack-plugin");
const webpack = require('webpack');
const pkg = require('./package.json')

// These 'plugins' are specific for imagemin, which we use both as a plugin
// and as a loader. So instead of writing them twice, they are declared here.
// Observe: the plugins used here are all using lossless optimization,
// the optimization have to be specified more if you want to get more or
// less optimized imaged, check out:
// https://github.com/webpack-contrib/image-minimizer-webpack-plugin
// https://github.com/imagemin/imagemin
const imgminPlugins = [
  'gifsicle',
  'mozjpeg',
  'optipng',
  'svgo'
];

const plugins = [];
const extraCssLoaders = [];
const extraImageLoaders = [];
const extraFontLoaders = [];
const extraJsLoaders = [];
let devServer = {};
if (process.env.NODE_ENV === 'development') {
  plugins.push(
    new webpack.HotModuleReplacementPlugin()
  );

  devServer = {
    // For full options and more in depth description of the devserver, check
    // out the following link: https://webpack.js.org/configuration/dev-server/
    contentBase: Path.resolve(__dirname, 'dist'),
    contentBasePublicPath: `${SW_PUBLIC_PATH}/`,
    publicPath: `${SW_PUBLIC_PATH}/`,
    compress: true,
    writeToDisk: true,
    port: SW_DEV_SERVER_PORT,
    hot: true,
    stats: 'none', //'minimal',
    injectClient: true,
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
    onListening: function(server) {
      console.info('STARTING!');
      const port = server.listeningApp.address().port;
      console.info('********************************************************************************');
      console.info('*          @jitesoft/simple-webpack (and WebPack) presents!                    *');
      console.info(`*          ${pkg.name} - ${pkg.version}                                        *`);
      console.info('*                                                                              *');
      console.info(`*          Listening on port: ${port}                                          *`);
      console.info('*          To access your assets, open a browser and go to                     *');
      console.info(`*          http://127.0.0.1:${port}                                            *`);
      console.info('*                                                                              *');
      console.info(`*          Have fun!                                                           *`);
      console.info('********************************************************************************');
    }
  };

  if (SW_PROXY_URI !== null) {
    devServer.index = '';
    devServer.proxy = {
      context: () => true,
      target: SW_PROXY_URI
    }
  }

}
if (!process.env.WEBPACK_DEV_SERVER) {
  extraCssLoaders.push({
    loader: MiniCssExtractPlugin.loader,
    options: {
      outputPath: '',
      publicPath: `${SW_PUBLIC_PATH}/`,
      name: '[name].[ext]',
      hmr: devServer.hot || false
    }
  });

  plugins.push(
    // CopyWebpackPlugin basically just copies the files in the directories defined.
    // Some plugins do although pick those up, allowing us to for example optimize images!
    new CopyWebpackPlugin({
      patterns: [
        {
          from: 'assets/images/',
          to: 'images/',
          noErrorOnMissing: true,
          globOptions: {
            dot: false
          }
        },
        {
          from: 'assets/static/',
          to: '',
          noErrorOnMissing: true,
          globOptions: {
            dot: false
          }
        },
        {
          from: 'assets/fonts/',
          to: 'fonts/',
          noErrorOnMissing: true,
          globOptions: {
            dot: false
          }
        }
      ]
    }),
    new ImageminWebpWebpackPlugin({
      config: [{
        test: /\.(jpe?g|png)$/i,
        options: {
          quality: 100,
          method: 0,
          sns: 100,
          filter: 0,
          lossless: true,
          nearLossless: 100,
          alphaQuality: 100
        }
      }]
    }),
    // Imagemin compresses images passed through it, yay!
    // It's important that this plugin is defined AFTER the copy webpack plugin.
    // If it is not, it will not be able to compress the images.
    new ImageMinPlugin({
      test: /\.(jpe?g|png|gif|tif|svg)$/i,
      imageminOptions: {
        plugins: imgminPlugins
      },
      name: '[path][name].[ext]',
      publicPath: `${SW_PUBLIC_PATH}/images`,
      loader: true,
      emit: true
    }),
    // This plugin allow us to extract the CSS from the javascript.
    // Without it the css would be included in the JS code, something some
    // people might get a bit confused by!
    new MiniCssExtractPlugin({
      filename: 'index.css',
      chunkFilename: 'css/[id].css',
      publicPath: `${SW_PUBLIC_PATH}/`
    }));
}

module.exports = {
  // If the environment is production, we want to use some type of
  // minifier for the JS and CSS.
  // So the minimizer option gets two minification plugins, one for js one for css.
  optimization: (process.env.NODE_ENV === 'production' ? {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  } : { }),
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
    chunkFilename: 'js/[chunkhash:16].js'
  },
  plugins: [
    ...plugins
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
              outputPath: 'fonts',
              name: '[name].[ext]',
              publicPath: `${SW_PUBLIC_PATH}/fonts`
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
              outputPath: 'images',
              name: '[name].[ext]',
              publicPath: `${SW_PUBLIC_PATH}/images`,
            }
          }
        ]
      }
    ]
  },
  devServer: devServer
};
