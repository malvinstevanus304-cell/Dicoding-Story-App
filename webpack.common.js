const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    app: path.resolve(__dirname, 'src/scripts/index.js'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
    }),

    new CopyWebpackPlugin({
      patterns: [
        // semua file di public (favicon, manifest, images, dll)
        { from: 'src/public', to: '.' },

        // offline page
        { from: 'src/offline.html', to: 'offline.html' },

        // service worker register
        { from: 'src/sw-register.js', to: 'sw-register.js' },

        // service worker utama
        { from: 'src/sw.js', to: 'sw.js' },
      ],
    }),
  ],
};
