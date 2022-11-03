const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const pckg = require("./package.json");

module.exports = {
  entry: path.resolve(__dirname, "./src/index.ts"),
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "phaser",
          enforce: true,
          chunks: "initial",
        },
      },
    },
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].[chunkhash].js",
    chunkFilename: "[name].[chunkhash].js",
    clean: true,
  },
  devServer: {
    static: path.resolve(__dirname, "./dist"),
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "img/",
          to: "img/",
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./html/index.html"),
      filename: "index.html",
      title: pckg.description,
      inject: "body",
      hot: true,
    }),
  ],
};
