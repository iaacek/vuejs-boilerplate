const merge = require('webpack-merge');
const path = require('path');
const CompressionPlugin = require("compression-webpack-plugin");

const common = require('./webpack4.common.config.js'); // Pay attention to the invocation.

module.exports = merge(common, {
  mode: 'production',

  // mandatory: where to save the result
  output: {
    path: path.resolve(__dirname, '<path_to>/vuejs-boilerplate/client/dist'), // where to put the files, what dir
    publicPath: '../dist/', // where to look for the files on webserver, ie. https://server/dist/
    filename: '[name].js'
  },

  plugins: [
    new CompressionPlugin({
      filename: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.scss$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
});
