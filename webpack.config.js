const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

// Global options
const isDev = process.env.NODE_ENV === "development";
const isHash = !isDev ? ".[hash]" : "";

// Framework Options
const stylusOptions = {
  use: ["nib"],
  import: ["nib"],
  includeCSS: true,
  resolveURL: true,
  hoistAtrules: true,
  compress: !isDev,
  hmr: true,
};

// Start Webpack

const optimization = function () {
  const config = {};
  if (!isDev) {
    config.minimizer = [
      new OptimizeCssAssetsPlugin({
        cssProcessor: require("cssnano"),
        cssProcessorPluginOptions: {
          preset: ["default", { discardComments: { removeAll: true } }],
        },
        canPrint: true,
      }),
      new TerserPlugin(),
    ];
  }
  return config;
};

const PATHS = {
  src: path.join(__dirname, "src"),
  dist: path.join(__dirname, "dist"),
};

const PAGES_DIR = `${PATHS.src}/pug/`;
const PAGES = fs
  .readdirSync(PAGES_DIR)
  .filter((fileName) => fileName.endsWith(".pug"));

module.exports = {
  devtool: isDev ? "eval-source-map" : false,
  mode: isDev ? "development" : "production",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
    hot: isDev,
  },
  entry: {
    main: [
      "./src/js/main.js",
      path.resolve(__dirname, "src/styl/framework/main.styl"),
    ],
  },
  optimization: optimization(),
  output: {
    filename: "js/[name]" + isHash + ".js",
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@styl": path.resolve(__dirname, "src/styl"),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: "html-loader",
          },
          {
            loader: "pug-html-loader",
            options: {
              pretty: true,
            },
          },
        ],
      },
      {
        test: /\.styl/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              hmr: true,
              reloadAll: true,
            },
          },
          {
            loader: "css-loader",
          },

          {
            loader: "stylus-loader",
            options: {
              stylusOptions: stylusOptions,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),

    new MiniCssExtractPlugin({
      filename: "./css/[name]" + isHash + ".css",
    }),

    new CopyPlugin({
      patterns: [{ from: `${PATHS.src}/fonts`, to: `${PATHS.dist}/fonts` }],
    }),

    ...PAGES.map(
      (page) =>
        new HtmlWebpackPlugin({
          template: `${PAGES_DIR}/${page}`,
          filename: `./${page.replace(/\.pug/, ".html")}`,
          cache: false,
          minify: {
            collapseWhitespace: !isDev,
          },
        })
    ),

    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: "./dist/*",
    }),
  ],
};
