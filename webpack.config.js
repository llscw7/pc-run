const webpack = require("webpack");
const path = require('path')
const logUtil = require('./util-log')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const global = require('./global')
const cwd = process.cwd()

const finalWebpackConfig = {
  mode: "development",
  target: "node",
  context: path.join(__dirname, "src"),
  entry: {
    index: [
      './index.ts'
    ],
    preload: [
      './preload.ts'
    ],
    toast: [
      './module/toast/index.ts'
    ],
    capture: [
      './module/capture/index.ts'
    ],
    'preload.capture': [
      './module/capture/preload.capture.ts'
    ],
  },
  externals: { electron: 'commonjs electron'},
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/', // 服务器脚本会用到
    filename: (chunkData) => {
      const entryName = chunkData.chunk.name;
      const entryPath = chunkData.chunk.entryModule.resource;
      const entryDir = path.dirname(entryPath);
      const outputPath = path.join(entryDir, entryName, '[name].bundle.js');
      console.log(entryName,'???--', entryDir)
      if(entryDir.includes('module')) {
        const dir = entryDir.split('module')[1]
        console.log(dir,'???>>mm')
        return `${dir}/[name].js`;
      }
      return '[name].js'
    }
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.jsx?$/,
        use: [
          {
              loader: 'babel-loader',
              options: {
                  cacheDirectory: true,
              }
          }
        ],
        exclude: /node_modules/,
      },
      { 
        test: /\.tsx?$/, 
        use: [
          {
            loader: "ts-loader",
            options: {
              configFile: path.join(cwd, 'tsconfig.json'),
              transpileOnly: true,
            }
          }
        ]
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: ['**/*', '!database/**', '!view/**'],
    }),
    new CopyPlugin({
      patterns: [
        { from: "module/capture/iconfont", to: "capture/iconfont" },
      ],
    }),
    new HtmlWebpackPlugin({
      template: 'module/toast/toast.html',  // 指定 HTML 模板文件路径
      filename: 'toast/toast.html',  // 输出的 HTML 文件名
      chunks: []
    }),
    new HtmlWebpackPlugin({
      template: 'module/capture/capture.html',  // 指定 HTML 模板文件路径
      filename: 'capture/capture.html',  // 输出的 HTML 文件名
      chunks: []
    }),
    new ForkTsCheckerWebpackPlugin({
      typescript: {configFile: path.join(cwd, 'tsconfig.json')}
    }),
    new webpack.DefinePlugin({
      ...global
    }),
  ]
}

webpack(finalWebpackConfig, async (err, stats) => {
  if (err) {
      logUtil.error("Compilication failed.")
      console.error(err.stack || err);
      if (err.details) {
          console.error(err.details);
      }
      process.exit(1);
      return;
  }
  const info = stats.toJson();
  if (stats.hasErrors()) {
      let hasBuildError = false;

      // 只要有一个不是来自 uglify 的问题
      for (let i = 0, len = info.errors.length; i < len; i++) {
          if (!/from\s*UglifyJs/i.test(info.errors[i])) {
              hasBuildError = true;
              break;
          }
      }
      if (hasBuildError) {
          logUtil.error("Compilication failed.")
          console.log(info.errors);

          process.exit(1);
      }
  }
  if (stats.hasWarnings()) {
      // logUtil.warn(info.warnings)
  }

  logUtil.pass("Compilication done.")
})
