const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common,{
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: { //附加压缩选项
                warnings: false //关闭显示警告
            },
            output: { //附加输出选项
                comments: false //不保留注释
            }
        })
    ]
});