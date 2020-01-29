const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {

  entry: {
    app: './src/main.js',
  },

  module: {
    rules: [
      {
        test: /\.(scss|css|sass)$/,
        use: ['style-loader', 'css-loader', 'sass-loader'] // loaders are resolved as functions: from right to left
      },

      {
        test: /\.vue$/,
        use:  'vue-loader',
      },

      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },

      {
        test: /\.(png|jpe?g|gif|svg|ico)$/i,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]', // so it uses real name instead of hash
            esModule: false // file loader v5.0.0 breaking change: switch to ES modules by default (the option esModule is true by default).
                            // due to this the esModule has to be set to false as I am still using require for src tags
          }
        }
      },

      // { // font loading
      //   test: /\.woff2?$/,
      //   loader: 'url-loader',
      //   options: {
      //     limit: 10000,
      //     name: '[name].[ext]'
      //   }
      // }
    ]
  },

  plugins: [
    new VueLoaderPlugin(),
  ],
};
