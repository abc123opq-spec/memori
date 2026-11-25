const path = require("path");
const {
  DefinePlugin,
  sources,
  Compilation,
  NormalModuleReplacementPlugin,
} = require("webpack");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// Marketing images the app never loads; the personal build leaves them out.
const personalImagesIgnore = [
  "backgroundfill.jpg",
  "subscriptionhero.png",
  "backgroundhero.jpg",
  "choose-a-program2.png",
  "desktop-wave-footer.svg",
  "desktop-wave-hero.svg",
  "dinosunglasses.svg",
  "docs-video2.mp4",
  "dyno-smile.png",
  "edit-day2.png",
  "edit-program-script2.png",
  "googleplay.png",
  "graphs2.png",
  "handdrawn-arrow.svg",
  "hero-video2.mp4",
  "history2.png",
  "icon-barbell.svg",
  "icon-muscles.svg",
  "iphoneframe.png",
  "logo-discord.svg",
  "logo-instagram.svg",
  "logo-twitter.svg",
  "mainaccordeon1.png",
  "mainaccordeon2.png",
  "mainaccordeon3.png",
  "mainaccordeon4.png",
  "mainaccordeon5.png",
  "mainaccordeon6.png",
  "mainaccordeonbg.jpg",
  "maincloudstorage.png",
  "maincontenteditorarrow.svg",
  "maincontenteditordownarrow.svg",
  "maingraphs.png",
  "mainmeasurements.jpeg",
  "mainmusclestats.png",
  "mainprogram.png",
  "mainundulationgraphs.jpeg",
  "mainvideo-poster.jpg",
  "mainvideo.mp4",
  "mainwebeditor.png",
  "mainworkouthistory.png",
  "mainworkouttracking.png",
  "mcp-walkthrough.mp4",
  "muscles_subs.png",
  "onboarding-1-choose-program.mp4",
  "onboarding-2-record-sets.mp4",
  "onboarding-3-update-vars.mp4",
  "onboarding-4-edit-exercise.mp4",
  "onboarding-4-edit-exercise2.mp4",
  "onboarding-5-liftoscript.mp4",
  "onboarding-5-liftoscript2.mp4",
  "onboarding-choose-program.mov",
  "onboarding-choose-program.mp4",
  "phone-frame.svg",
  "premiumwatch.png",
  "programexercisetourprogress.png",
  "programexercisetourrepeat.png",
  "programexercisetourreuse.png",
  "programexercisetoursets.png",
  "programexercisetoursummary.png",
  "programexercisetourwarmups.png",
  "settings2.png",
  "store-qr-code.png",
  "web-editor.png",
  "webeditor2.png",
  "workout-planner.png",
  "features/account/**",
  "features/api/**",
  "features/apple-watch/**",
  "features/built-in-programs/**",
  "features/changing-a-workout/**",
  "features/chatgpt-claude-and-ai/**",
  "features/custom-exercises/**",
  "features/equipment-and-gyms/**",
  "features/exercise-library/**",
  "features/first-run-and-settings/**",
  "features/graphs/**",
  "features/health-sync/**",
  "features/import-export/**",
  "features/liftoscript/**",
  "features/lock-screen-and-notifications/**",
  "features/measurements/**",
  "features/playground/**",
  "features/premium/**",
  "features/program-editor/**",
  "features/progressions/**",
  "features/set-types/**",
  "features/sharing-programs/**",
  "features/sharing-workouts/**",
  "features/supersets/**",
  "features/sync-and-offline/**",
  "features/timed-sets/**",
  "features/workout-history/**",
  "features/workout-screen/**",
  "docs/**",
  "dinounit.png",
  "dinoequipment.png",
  "dinoplates.png",
  "dinoprogramselect.png",
  "dino-scope.png",
  "dino-warning.png",
  "dinohappy.svg",
  "slide-1-bg.jpg",
  "slide-2-image.png",
  "slide-3-image.png",
  "slide-4-image.png",
  "slide-5-image.png",
];

let commitHash, fullCommitHash;
try {
  commitHash = require("child_process").execSync("git rev-parse --short HEAD").toString().trim();
  fullCommitHash = require("child_process").execSync("git rev-parse HEAD").toString().trim();
} catch {
  fullCommitHash = process.env.CODEBUILD_RESOLVED_SOURCE_VERSION || "unknown";
  commitHash = fullCommitHash.substring(0, 7);
}
const bundleVersionWatchIos = 1;
const bundleVersionWatchAndroid = 1;

const isDev = process.env.NODE_ENV !== "production";

const uniwindRnRewrite = new NormalModuleReplacementPlugin(/^react-native$/, (resource) => {
  const issuer = (resource.contextInfo && resource.contextInfo.issuer) || resource.context || "";
  if (issuer.includes(`${require("path").sep}uniwind${require("path").sep}`)) {
    resource.request = "react-native-web";
  } else {
    resource.request = "uniwind/components";
  }
});

const uniwindStyleSheetRewrite = new NormalModuleReplacementPlugin(
  /createOrderedCSSStyleSheet$/,
  (resource) => {
    const issuer = (resource.contextInfo && resource.contextInfo.issuer) || resource.context || "";
    if (issuer.includes(`${require("path").sep}react-native-web${require("path").sep}dist${require("path").sep}exports${require("path").sep}StyleSheet${require("path").sep}`)) {
      resource.request = require("path").resolve(__dirname, "node_modules/uniwind/dist/module/components/web/createOrderedCSSStyleSheet.js");
    }
  }
);

const lftMarkerPlugin = {
  apply(compiler) {
    compiler.hooks.compilation.tap("LftMarkerPlugin", (compilation) => {
      compilation.hooks.processAssets.tap(
        { name: "LftMarkerPlugin", stage: Compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING - 1 },
        (assets) => {
          for (const [name, source] of Object.entries(assets)) {
            if (/\.(js|css)$/.test(name) && !name.includes(".map")) {
              compilation.updateAsset(
                name,
                new sources.ConcatSource("/* LFTSTART */\n", source, "\n/* LFTEND */")
              );
            }
          }
        }
      );
    });
  },
};

const watchConfig = {
  name: "watch",
  entry: "./src/watch/index.ts",
  target: "node",
  output: {
    filename: "watch-bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    splitChunks: false,
  },
  externals: {
    module: "var { createRequire: function() { return function() { return {} } } }",
    stream: "var {}",
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "esbuild-loader",
          options: {
            target: "es2020",
            jsx: "automatic",
          },
        },
      },
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
    alias: {
      "uniwind/components$": path.resolve(__dirname, "node_modules/uniwind/dist/module/components/web/index.js"),
    },
  },
  plugins: [
    uniwindRnRewrite,
    uniwindStyleSheetRewrite,
    lftMarkerPlugin,
    new DefinePlugin({
      window: "globalThis",
      __BUNDLE_VERSION_WATCH_IOS__: bundleVersionWatchIos,
      __BUNDLE_VERSION_WATCH_ANDROID__: bundleVersionWatchAndroid,
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __FULL_COMMIT_HASH__: JSON.stringify(fullCommitHash),
      __HOST__: JSON.stringify("."),
      __ENV__: JSON.stringify(process.env.NODE_ENV === "production" ? "production" : "development"),
    }),
  ],
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
};

const mainConfig = {
  name: "main",
  ignoreWarnings: [
    {
      module: /@legendapp\/list/,
      message: /unstable_batchedUpdates/,
    },
  ],
  entry: {
    app: ["./src/index.tsx", "./src/index.css"],
    "webpushr-sw": "./src/webpushr-sw.ts",
  },
  output: {
    filename: "[name].js",
    chunkFilename: "chunks/[name].[contenthash].js",
    publicPath: "auto",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: false,
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: "css-loader", options: { url: false } },
          "postcss-loader",
        ],
      },
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        options: {
          sourceMaps: true,
          compact: false,
          presets: [
            ["@babel/preset-typescript", { isTSX: true, allExtensions: true }],
            ["@babel/preset-react", { runtime: "automatic" }],
          ],
        },
      },
      {
        test: /\.m?js$/,
        include: /node_modules/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(png|jpe?g|gif|webp)$/,
        type: "asset/resource",
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: (chunk) => chunk.name === "app",
        },
      },
    },
  },
  resolve: {
    extensions: [".web.tsx", ".web.ts", ".web.js", ".tsx", ".ts", ".js", ".css"],
    alias: {
      "uniwind/components$": path.resolve(__dirname, "node_modules/uniwind/dist/module/components/web/index.js"),
    },
  },
  plugins: [
    uniwindRnRewrite,
    uniwindStyleSheetRewrite,
    lftMarkerPlugin,
    new MiniCssExtractPlugin({ filename: "[name].css" }),
    new DefinePlugin({
      "process.env.JEST_WORKER_ID": "undefined",
      __DEV__: JSON.stringify(process.env.NODE_ENV !== "production"),
      __COMMIT_HASH__: JSON.stringify(commitHash),
      __FULL_COMMIT_HASH__: JSON.stringify(fullCommitHash),
      __API_HOST__: JSON.stringify("https://invalid.invalid"),
      __ENV__: JSON.stringify(process.env.NODE_ENV === "production" ? "production" : "development"),
      __HOST__: JSON.stringify("."),
    }),
    new CopyPlugin([
      {
        from: `src/index.html`,
        to: `index.html`,
        transform: (content) => {
          return content
            .toString()
            .replace(/\?version=xxxxxxxx/g, `?version=${commitHash}`)
            .replace(/\?vendor=xxxxxxxx/g, `?vendor=${commitHash}`);
        },
      },
      { from: `src/licenses.html`, to: `licenses.html` },
      { from: `src/rollbar-stub.js`, to: `rollbar-stub.js` },
      { from: `src/liftosaur_example_csv.zip`, to: `liftosaur_example_csv.zip` },
      { from: `src/notification.m4r`, to: `notification.m4r` },
      { from: `src/set-timer-end.m4r`, to: `set-timer-end.m4r` },
      { from: `src/get-ready-end.m4r`, to: `get-ready-end.m4r` },
      { from: "icons", to: "icons" },
      { from: "fonts", to: "fonts" },
      { from: "images", to: "images", ignore: personalImagesIgnore },
      { from: "programdata", to: "programdata" },
      { from: "exercisedata", to: "exercisedata" },
      { from: "manifest.webmanifest", to: "manifest.webmanifest" },
    ]),
  ],
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  watchOptions: {
    ignored: [
      "**/worktrees/**",
      "**/perfdata/**",
      "**/.work/**",
      "**/node_modules/**",
    ],
  },
  devServer: {
    setupMiddlewares: (middlewares, devServer) => {
      middlewares.unshift({
        name: "static-rewrite",
        middleware: (req, res, next) => {
          if (req.url.startsWith("/static/")) {
            req.url = req.url.replace(/^\/static/, "");
          }
          next();
        },
      });
      return middlewares;
    },
    static: path.join(__dirname, "dist"),
    compress: true,
    hot: false,
    allowedHosts: "all",
    liveReload: false,
    host: "localhost",
    port: 8080,
  },
};

module.exports = [mainConfig, watchConfig];
