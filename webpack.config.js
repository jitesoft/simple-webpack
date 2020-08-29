/* eslint-disable */
const Path = require('path');
//
// This is the initial webpack file. All the stuff that we want webpack to do
// for all environments we define here!
// Then we merge the environment specific values into the
// shared values and it will just do everything super nice!
//
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  // If the environment is production, we want to use some type of
  // minifier for the JS and CSS.
  // So the minimizer option gets two minification plugins, one for js one for css.
  optimization: (process.env.NODE_ENV === 'production' ? {
    minimizer: [new TerserJSPlugin({}), new OptimizeCSSAssetsPlugin({})]
  } : {

  }),
  // If the NODE_ENV is not set, we default to production.
  mode: process.env.NODE_ENV ?? 'production',
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
    // This plugin allow us to extract the CSS from the javascript.
    // Without it the css would be included in the JS code, something some
    // people might get a bit confused by!
    new MiniCssExtractPlugin({
      filename: 'index.css',
      chunkFilename: '[id].css'
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
        // Fonts will be "moved" with the file-loader.
        test: /\.(eot|ttf|woff|woff2|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'fonts'
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
        loader: 'babel-loader'
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
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '/dist',
              name: Path.resolve(__dirname, 'dist', 'index.css')
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
        test: /\.(ico|png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              outputPath: 'images',
              name: '[name].[ext]'
            }
          }
        ]
      }
    ]
  }
};
