const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common,{
    devtool: 'inline-source-map',

    devServer: {
        historyApiFallback: true,
        inline: true,
        hot:true,
        port: '3012',
        host: '127.0.0.1',
        proxy: {
            '/api': {
                target: 'http://restapi.amap.com/v3',
                pathRewrite: {"^/api" : ""},
                secure: false
            },
        }
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
});