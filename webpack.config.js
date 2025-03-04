const { ProvidePlugin } = require('webpack');

module.exports = {
  resolve: {
    fallback: {
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify")
    }
  },
  plugins: [
    new ProvidePlugin({
      process: 'process/browser',
    }),
  ]
};