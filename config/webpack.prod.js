const os = require('os')
const path = require('path')
const ESLintPlugin = require('eslint-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const { Template } = require('webpack')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const { extendDefaultPlugins } = require('svgo')

const threads = os.cpus().length // cpu核数

function getStyleLoader(pre) {
  return [
    // 执行顺序，从右到左（从下到上）
    MiniCssExtractPlugin.loader, // 提取css成单独文件
    'css-loader', // 将css资源编译成commonjs的模块到js中
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: [['postcss-preset-env']]
        }
      }
    },
    pre
  ].filter(Boolean)
}

module.exports = {
  // 入口
  entry: './src/main.js', // 相对路径
  // 输出
  output: {
    // 所有文件的输出路径
    // __dirname nodejs的变量，代表当前文件的文件夹目录
    path: path.resolve(__dirname, '../dist'), // 绝对路径,表示在当前文件夹下输出名为dist的文件夹
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
        oneOf: [
          {
            test: /\.css$/, // 只检测 .css 文件
            use: getStyleLoader()
          },
          {
            test: /\.less$/,
            use: getStyleLoader('less-loader')
          },
          {
            test: /\.s[ac]ss$/,
            use: getStyleLoader('sass-loader')
          },
          {
            test: /\.styl$/,
            use: getStyleLoader('stylus-loader')
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
            use: [
              {
                loader: 'thread-loader', // 开启多进程
                options: {
                  works: threads // 进程数量
                }
              },
              {
                loader: 'babel-loader',
                options: {
                  // presets: ['@babel/preset-env']
                  cacheDirectory: true, // 开启babel缓存
                  cacheCompression: false // 关闭代码压缩
                }
              }
            ]
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
      exclude: 'node_modules',
      cache: true,
      cacheLocation: path.resolve(__dirname, '../node_modules/.cache/eslintcache'),
      threads // 开启多线程
    }),
    new HtmlWebpackPlugin({
      // 模板： 以public/index.html文件创建新的html文件
      // 新的html文件特点： 1. 结构和原来一致 2. 自动引入打包输出的资源
      template: path.resolve(__dirname, '../public/index.html')
    }),
    new MiniCssExtractPlugin({
      filename: 'static/css/main.css'
    })
    // new CssMinimizerPlugin(),
    // new TerserWebpackPlugin({
    //   parallel: threads // 开启多进程和设置进程数量
    // })
  ],
  optimization: {
    // 压缩的操作
    minimizer: [
      // 压缩css
      new CssMinimizerPlugin(),
      // 压缩js
      new TerserWebpackPlugin({
        parallel: threads // 开启多进程和设置进程数量
      }),
      // new ImageMinimizerPlugin({
      //   plugins: [
      //     ['gifsicle', { interlaced: true }],
      //     ['jpegtran', { progressive: true }],
      //     ['optipng', { optimizationLevel: 5 }],
      //     // Svgo configuration here https://github.com/svg/svgo#configuration
      //     [
      //       'svgo',
      //       {
      //         plugins: extendDefaultPlugins([
      //           {
      //             name: 'removeViewBox',
      //             active: false
      //           },
      //           {
      //             name: 'addAttributesToSVGElement',
      //             params: {
      //               attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }]
      //             }
      //           }
      //         ])
      //       }
      //     ]
      //   ]
      // })
    ]
  },
  // 模式
  mode: 'production',
  devtool: 'source-map'
}
