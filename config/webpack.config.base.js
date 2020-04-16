const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'
const htmlConfig = require('../public/config')[isDev ? "dev" : "build"]
const path = require('path')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssPlugin = require('optimize-css-assets-webpack-plugin');
const apiMocker = require('mocker-api');
const Happypack = require('happypack'); // 多核构建 提升速度
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
    mode: isDev ? "development" : "production",
    entry: {
        index: path.resolve(__dirname, "../src/index.js"),
        login: path.resolve(__dirname, "../src/login.js"),
    }, //webpack的默认配置 多入口为数组
    output: {
        path: path.resolve(__dirname, '../dist'),
        filename: "js/[name].[hash:6].js",
        publicPath: '/' // 通常是cdn地址
    },
    resolve: {
        modules: ['../src/components', 'node_modules'], // 从左到右依次查找
        extensions: ['web.js', '.js'], // 还可以配置 .json, .css
        mainFields: ['style', 'main'], // import 'bootsrap' 默认去找 css 文件 找不到找package.json 的 main 字段指定的文件
        alias: { // 别名
            '@': path.resolve('../src'),
            '~': path.resolve('../src/containers'),
            'static': path.resolve('../static'),
        }
    },
    externals: {
        //jquery通过script引入之后，全局中即有了 jQuery 变量
        'jquery': 'jQuery'
    },
    module: {
        noParse: /jquery|lodash/,
        rules: [
            // thread-loader 和 Happypack 我对比了一下，构建时间基本没什么差别。
            // 使用 Happypack 必须要在项目中创建 postcss.config.js
            // {
            //     test: /\.js[x]?$/,
            //     use: 'Happypack/loader?id=js',
            //     include: [path.resolve(__dirname, '../src')]
            // },
            // {
            //     test: /\.css$/,
            //     use: 'Happypack/loader?id=css',
            //     include: [
            //         path.resolve(__dirname, '../src'), 
            //     ]
            // },
            {
                test: /\.js|jsx?$/,
                use: [
                    "thread-loader",
                    "cache-loader",
                    {
                        loader: "babel-loader",
                        options: {
                            presets: ["@babel/preset-env"],
                            plugins: [
                                [
                                    "@babel/plugin-transform-runtime",
                                    {
                                        "corejs": 3
                                    }
                                ]
                            ]
                        }
                    },
                ],
                include: [path.resolve(__dirname, '../src')],
                exclude: /node_modules/ // 排除node_modules 目录                
            },
            {
                test: /\.(le|c)ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            hmr: isDev,
                            reloadAll: true,
                            plugins: [
                                function () {
                                    return [
                                        require('autoprefixer')()
                                    ]
                                }
                            ]
                        }
                    },
                    'less-loader'
                ],
            },
            {
                test: /\.(png|jpg|gif|jpeg|webp|svg|eot|ttf|woff|woff2)$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10240, // 资源大小小于 10K 时，将资源转换为 base64，超过 10K，将图片拷贝到 dist 目录
                            esModule: false,
                            name: '[name]_[hash:6].[ext]',
                            outpath: 'assets'
                        }
                    }
                ]
            },
            /*
                用于在html中加载图片 但是不用使用html-webpack-plugin 语法 
                可以使用此方式引入 src="<%= require('./thor.jpeg') %>" 而不用使用此插件
            */
            // {
            //     test: /\.html$/,
            //     use: 'html-withimg-loader' 
            // },
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/index.html'),
            filename: 'index.html',
            minify: {
                removeAttributeQuotes: false, // 是否删除双引号
                collapseWitespace: false, // 是否折叠空白
            },
            hash: true, //是否加上hash，默认是 false
            config: htmlConfig.template,
            chunks: ['index']
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../public/login.html'),
            filename: 'login.html',
            minify: {
                removeAttributeQuotes: false, // 是否删除双引号
                collapseWitespace: false, // 是否折叠空白
            },
            hash: true, //是否加上hash，默认是 false
            config: htmlConfig.template,
            chunks: ['login']
        }),
        new CleanWebpackPlugin({
            cleanOnceBeforeBuildPatterns: ['**/*', '!dll', '!dll/**'] //不删除dll目录下的文件
        }),
        new CopyWebpackPlugin([
            {
                from: "public/js/*.js",
                to: path.resolve(__dirname, '../dist', 'js'),
                flatten: true,
            },
            {
                from: path.resolve(__dirname, '../static'),
                to: path.resolve(__dirname, '../dist', 'static'),
            }
            //还可以继续配置其它要拷贝的文件
        ], {
            ignore: ['other.js']
        }),
        // 全局变量 不可过多配置
        new webpack.ProvidePlugin({
            React: 'react',
            Component: ['react', 'Component'],
            Vue: ['vue/dist/vue.esm.js', 'default'],
            $: 'jquery',
            _map: ['lodash', 'map']
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css',
        }),
        new OptimizeCssPlugin(),
        new webpack.HotModuleReplacementPlugin(), //热更新插件
        // new Happypack({ // 使用 Happypack 必须要在项目中创建 postcss.config.js
        //     id: 'js', //和rule中的id=js对应
        //     //将之前 rule 中的 loader 在此配置
        //     use: ['babel-loader'] //必须是数组
        // }),
        // new Happypack({
        //     id: 'css',//和rule中的id=css对应
        //     use: ['style-loader', 'css-loader', 'postcss-loader', 'less-loader'],
        // })
        new HardSourceWebpackPlugin(),
        new webpack.DllReferencePlugin({
            manifest: path.resolve(__dirname, '../dist', 'dll', 'manifest.json')
        }),

    ],
    // 抽离公共代码
    optimization: {
        concatenateModules: false,
        splitChunks: {// 分割代码块
            maxInitialRequests: 6, //默认是5
            cacheGroups: {
                vendor: {
                    // 第三方依赖
                    priority: 1, // 优先级
                    name: 'vendor',
                    test: /node_modules/,
                    chunks: 'initial',
                    minSize: 100,
                    minChunks: 1, // 最少引入次数
                },
                'lottie-web': {
                    name: "lottie-web", // 单独将 react-lottie 拆包
                    priority: 5, // 权重需大于`vendor`
                    test: /[\/]node_modules[\/]lottie-web[\/]/,
                    chunks: 'initial',
                    minSize: 100,
                    minChunks: 1 //重复引入了几次 
                },
                // 缓存组
                // common: {
                //     // 公共模块
                //     chunks: 'initial',
                //     name: 'common',
                //     minSize: 100, // 大小超过100字节
                //     minChunks: 3, // 最少引入次数
                // }
            }
        },
        // 将包含 chunk 映射关系的列表从 main.js 中抽离出来
        // 在配置了 splitChunk 时，记得配置 runtimeChunk.
        runtimeChunk: {
            name: 'manifest'
        }, 
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
            }),
        ], 
    },
    devServer: {
        port: 3001,
        quiet: false, // 默认不启用
        inline: true, // 默认开启inline模式，如果设置为false，开启iframe模式
        stats: "errors-only", // 终端打印error
        overlay: false, // 默认不启用
        clientLogLevel: "silent", // 日志等级
        compress: true, // 是否开启gzip 压缩
        hot: true,
        proxy: { // 代理 
            "/api": {
                target: "http://localhost:4000",
                pathRewrite: {
                    '/api': ''
                }
            }
        },
        before(app) {
            apiMocker(app, path.resolve(__dirname, '../mock/mocker.js'))
            // app.get('/test', (req, res) => {
            //     res.json({name: '这是测试数据'})
            // })
        }
    },
    devtool: isDev ? 'cheap-module-eval-source-map' : 'source-map' //开发环境下使用 cheap-module-eval-source-map

}