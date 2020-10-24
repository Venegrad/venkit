const webpack = require("webpack");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const fs = require("fs");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const WebfontPlugin = require("webfont-webpack-plugin").default;
const RemovePlugin = require("remove-files-webpack-plugin");
const TinyimgPlugin = require("tinyimg-webpack-plugin");

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
  const config = {
    splitChunks: {
      chunks: "all",
      name: "vendor",
    },
  };
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
  devtool: isDev ? "inline-source-map" : false,
  mode: isDev ? "development" : "production",
  target: "web",
  performance: {
    hints: false,
  },
  devServer: {
    contentBase: path.join(__dirname, "dist"),
    port: 9000,
    open: true,
  },
  entry: {
    main: [
      "@babel/polyfill",
      "./src/js/main.js",
      path.resolve(__dirname, "src/styl/framework/main.styl"),
    ],
  },
  optimization: optimization(),
  output: {
    chunkFilename: "js/vendor.js",
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
        test: /\.(svg|woff2)$/,
        use: "file-loader",
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
            options: { url: false },
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
      patterns: [
        { from: `${PATHS.src}/fonts`, to: `${PATHS.dist}/fonts` },
        { from: `${PATHS.src}/img/`, to: `${PATHS.dist}/img/` },
      ],
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

    new WebfontPlugin({
      files: path.resolve(__dirname, "src/svg**/*.svg"),
      fontName: "i",
      formats: ["woff2"],
      template: path.resolve(__dirname, "src/svg/template/icons.styl"),
      dest: path.resolve(__dirname, "src/fonts/"),
      destTemplate: path.resolve(__dirname, "src/styl/framework"),
    }),

    new TinyimgPlugin({
      enabled: process.env.NODE_ENV === "production",
      logged: true,
    }),

    new RemovePlugin({
      before: {
        test: [
          {
            folder: "./dist",
            method: () => true,
          },
        ],
      },
    }),
  ],
};
