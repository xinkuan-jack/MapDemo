const path = require('path');

const HtmlPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {

    resolve: {
        extensions: ['.js', '.less']
    },

    entry: {
        index: './src/index.js'
    },

    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].[hash:5].js',
        chunkFilename: '[name]-[hash:5].js'
    },

    externals: {
        $: 'jquery'
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: ['babel-loader']
            },
            {
                test: /\.html$/,
                exclude: /index.html$/,
                use: [ 'file-loader?name=[path][name].[ext]!extract-loader!html-loader']
            },
            {
                test: /\.(css|less)$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        'postcss-loader',
                        'less-loader'
                    ]
                })
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: ['url-loader?limit=10000&name=imgs/[name].[hash:5].[ext]']
            },
            {
                test: /\.(woff|woff2|svg|eot|ttf)\??.*$/,
                use: ['file-loader?name=fonts/[name].[hash:5].[ext]']
            }
        ]
    },

    plugins: [
        new ExtractTextPlugin('style.[hash:5].css'),
        new HtmlPlugin({
            template: path.join(__dirname, 'src/index.html')
        }),
        new CopyPlugin([
            {from: __dirname + '/src/copy'}
        ]),
    ]
};