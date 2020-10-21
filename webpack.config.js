const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const fs = require("fs");

const PATHS = {
  src: path.join(__dirname, "src"),
  dist: path.join(__dirname, "dist"),
  assets: "pug/",
};

const PAGES_DIR = `${PATHS.src}/${PATHS.assets}`;
const PAGES = fs
  .readdirSync(PAGES_DIR)
  .filter((fileName) => fileName.endsWith(".pug"));

const isDev = process.env.NODE_ENV === "development";

const stylusOptions = {
  use: ["nib"],
  import: ["nib"],
  includeCSS: true,
  resolveURL: true,
  hoistAtrules: true,
  compress: true,
};

module.exports = {
  devtool: isDev ? "eval-source-map" : false,
  mode: isDev ? "development" : "production",
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
  },
  entry: {
    main: [
      "./src/js/main.js",
      path.resolve(__dirname, "src/styl/framework/main.styl"),
    ],
  },
  output: {
    filename: "js/[name].js",
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
          },
          "css-loader",
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
      filename: "./css/[name].css",
      chunkFilename: "./css/[id].css",
    }),

    ...PAGES.map(
      (page) =>
        new HtmlWebpackPlugin({
          template: `${PAGES_DIR}/${page}`,
          filename: `./${page.replace(/\.pug/, ".html")}`,
        })
    ),
  ],
};
