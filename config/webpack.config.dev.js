const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base')
const webpack = require('webpack')


module.exports = merge(baseWebpackConfig, {
    mode: 'development',
    plugins: [
        new webpack.DefinePlugin({ // 定义环境变量。
            DEV: JSON.stringify('dev'), //字符串
            FLAG: 'true' //FLAG 是个布尔类型
        })
    ]
})