const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base')
const webpack = require('webpack')
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;


module.exports = smp.wrap(
    merge(baseWebpackConfig, {
        mode: 'production',
        plugins: [
            new webpack.DefinePlugin({ // 定义环境变量。
                DEV: JSON.stringify('production'), //字符串
                FLAG: 'false' //FLAG 是个布尔类型
            }),
            new BundleAnalyzerPlugin(),
        ]
    })
)