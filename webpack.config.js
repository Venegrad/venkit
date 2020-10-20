const isDev = process.env.NODE_ENV === "development";
const webpack = require("webpack");

module.exports = {
  devtool: isDev ? "eval-source-map" : false,
  mode: isDev ? "development" : "production",
  output: {
    filename: "main.js",
  },

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /(node_modules)/,
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      "window.jQuery": "jquery",
    }),
  ],
};
