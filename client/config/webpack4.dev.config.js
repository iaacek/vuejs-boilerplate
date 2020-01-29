const merge = require('webpack-merge');
const path = require('path');

const common = require('./webpack4.common.config.js'); // Pay attention to the invocation.

module.exports = merge(common, {
  mode: 'development',

  // mandatory: where to save the result
  output: {
    path: path.resolve(__dirname, './dist'),   // where to build
    publicPath: '/dist/',                      // where to serve from
    filename: '[name].js'                     // names of chunks - based on entry points
  },

  devServer: {
    historyApiFallback: true,   // middleware to fix the SPA problem with only one real html page, google connect-history-api-fallback
    noInfo: true,               // hide the bundle info while starting the dev server
    overlay: true,              // will overlay errors on the page - easier to spot
  },

});
