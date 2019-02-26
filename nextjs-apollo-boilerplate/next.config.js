const withTypescript = require("@zeit/next-typescript");
const UI_SERVICE_NAME = process.env.UI_SERVICE_NAME || "";

module.exports = withTypescript({
  assetPrefix: `/${UI_SERVICE_NAME}`,
  // customize build directory
  distDir: "build",

  // customize webpack config
  // Important: return the modified config
  webpack(config, { buildId, dev, isServer, defaultLoaders }) {
    // require it here (versus at top of file) since this function is only run when building,
    // not in production. And we can't count on devDependencies being present in production.
    const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
    // Do not run type checking twice:
    if (isServer) config.plugins.push(new ForkTsCheckerWebpackPlugin());

    // Perform any other customizations to webpack config here.

    //=========================================================================
    // Uncomment the below lines to output client and server webpack
    // configuration information into 2 files, for your viewing pleasure:
    //    1) log/webpack.config.client.json
    //    2) log/webpack.config.server.json
    //=========================================================================
    // Object.defineProperty(RegExp.prototype, "toJSON", {
    //   value: RegExp.prototype.toString
    // });
    // const fs = require("fs-extra");
    // const path = require("path");
    // const os = require("os");
    // fs.outputFile(
    //   path.join(__dirname, "log", `webpack.config.${config.name}.json`),
    //   JSON.stringify(config, null, 2) + os.EOL,
    //   (err) => console.error
    // );
    //=========================================================================

    return config;
  },

  // customize webpack dev middleware config
  // Important: return the modified config
  webpackDevMiddleware(config) {
    return config;
  }
});
