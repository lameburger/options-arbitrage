// webpack.config.js
const path = require('path');

module.exports = {
  resolve: {
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "assert": require.resolve("assert"),
      "util": require.resolve("util/"),
      "url": require.resolve("url/")
    }
  },
};