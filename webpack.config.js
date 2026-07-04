const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => ({
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        assetModuleFilename: 'assets/[name].[hash][ext]',
        publicPath: './', // relative so the build works under a GitHub Pages subpath
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|jpe?g|gif|svg|ttf|woff2?|mp3|ogg|wav)$/,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'index.css', to: 'index.css' },
                { from: 'assets/images/logo.png', to: 'assets/images/logo.png' },
                { from: 'assets/generated/honey_jar.png', to: 'assets/generated/honey_jar.png' },
                { from: 'assets/fonts', to: 'assets/fonts' },
            ],
        }),
    ],
    devtool: argv.mode === 'production' ? false : 'eval-source-map',
    devServer: {
        static: path.resolve(__dirname, '.'),
        port: 8080,
        open: false,
    },
});
