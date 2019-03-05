const withTypescript = require("@zeit/next-typescript");

module.exports = withTypescript({
  target: "serverless",
  // customize webpack config
  // Important: return the modified config
  webpack(config, { buildId, dev, isServer, defaultLoaders }) {
    // require it here (versus at top of file) since this function is only run when building,
    // not in production. And we can't count on devDependencies being present in production.
    const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
    // Do not run type checking twice:
    if (isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin());

    // Perform any other customizations to webpack config here.
    return config;
  },

  // customize webpack dev middleware config
  // Important: return the modified config
  webpackDevMiddleware(config) {
    return config;
  }
});
