module.exports = function override(config) {
    // Add fallbacks for node modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "os": require.resolve("os-browserify/browser"),
      "path": require.resolve("path-browserify"),
      "fs": false,  // We don't need fs in the browser
      "crypto": false // We don't need crypto in the browser
    };
  
    return config;
  };