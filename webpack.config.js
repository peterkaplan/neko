const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

require('dotenv').config();

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
        new webpack.DefinePlugin({
            'process.env.POSTHOG_API_KEY': JSON.stringify(process.env.POSTHOG_API_KEY || ''),
            'process.env.POSTHOG_HOST': JSON.stringify(process.env.POSTHOG_HOST || 'https://us.i.posthog.com'),
        }),
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'index.css', to: 'index.css' },
                { from: 'assets/images/logo.png', to: 'assets/images/logo.png' },
                { from: 'assets/images/fish.png', to: 'assets/images/fish.png' },
                { from: 'assets/fonts', to: 'assets/fonts' },
            ],
        }),
    ],
    devtool: argv.mode === 'production' ? false : 'eval-source-map',
    devServer: {
        static: path.resolve(__dirname, '.'),
        port: 8080,
        open: false,
        devMiddleware: {
            // output.publicPath is relative for GitHub Pages; serving in dev
            // must stay rooted or the on-disk index.html shadows the bundle
            publicPath: '/',
        },
    },
});
