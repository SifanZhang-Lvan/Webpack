const os = require('os')
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { Template } = require('webpack')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const threads = os.cpus().length // cp u核数

module.exports = {
  // 入口
  entry: './src/main.js', // 相对路径
  // 输出
  output: {
    // 所有文件的输出路径
    // 开发模式没有输出
    path: undefined,
    // 入口文件打包输出文件名
    filename: 'static/js/main.js',
    // 自动清空上次打包的内容
    // 原理：在打包前，将path整个目录内容清空，再进行打包
    clean: true
  },
  // 加载器
  module: {
    rules: [
      // loader的配置
      {
        // 每个文件只能被其中一个loader配置处理
        oneOf: [
          {
            test: /\.css$/, // 只检测 .css 文件
            use: [
              // 执行顺序，从右到左（从下到上）
              'style-loader', // 将js中css通过创建style标签添加html文件中生效
              'css-loader' // 将css资源编译成commonjs的模块到js中
            ]
          },
          {
            test: /\.less$/,
            use: [
              {
                loader: 'style-loader' // creates style nodes from JS strings
              },
              {
                loader: 'css-loader' // translates CSS into CommonJS
              },
              {
                loader: 'less-loader' // compiles Less to CSS
              }
            ]
          },
          {
            test: /\.s[ac]ss$/,
            use: [
              {
                loader: 'style-loader' // creates style nodes from JS strings
              },
              {
                loader: 'css-loader' // translates CSS into CommonJS
              },
              {
                loader: 'sass-loader' // compiles Sass to CSS
              }
            ]
          },
          {
            test: /\.styl$/,
            use: [
              {
                loader: 'style-loader' // creates style nodes from JS strings
              },
              {
                loader: 'css-loader' // translates CSS into CommonJS
              },
              {
                loader: 'stylus-loader' // compiles stylus to CSS
              }
            ]
          },
          {
            test: /\.png$/,
            type: 'asset',
            parser: {
              dataUrlCondition: {
                // 小于10kb的图片转base64
                // 优点: 减少请求数量 缺点：体积会更大
                maxSize: 5 * 1024 // 10kb
              }
            },
            generator: {
              // 输出图片名称
              // [hash:10] hash值取前10位
              filename: 'static/images/[hash:10][ext][query]'
            }
          },
          {
            test: /\.js$/,
            // exclude: /node_modules/, // 排除node_modules中的js文件（这些文件不处理）
            include: path.resolve(__dirname, '../src'), // 只处理src下的文件，其他文件不处理
            use: {
              loader: 'babel-loader',
              options: {
                // presets: ['@babel/preset-env']
                cacheDirectory: true, // 开启babel缓存
                cacheCompression: false, // 关闭代码压缩
                plugins: ['@babel/plugin-transform-runtime'] // 减少代码体积
              }
            }
          }
        ]
      }
    ]
  },
  // 插件
  plugins: [
    // plugin的配置
    new ESLintPlugin({
      // 检测哪些文件
      context: path.resolve(__dirname, '../src'),
      exclude: 'node_modules'
    }),
    new HtmlWebpackPlugin({
      // 模板： 以public/index.html文件创建新的html文件
      // 新的html文件特点： 1. 结构和原来一致 2. 自动引入打包输出的资源
      template: path.resolve(__dirname, '../public/index.html')
    })
  ],
  // 开发服务器 : 不会输出资源，在内存中编译打包
  devServer: {
    host: 'localhost', // 启动服务器域名
    port: '4000', // 启动服务器端口号
    open: true, // 是否自动打开浏览器
    hot: true // 开启HMR（默认值）
  },
  // 模式
  mode: 'development',
  devtool: 'cheap-module-source-map'
}
