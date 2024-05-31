const defaultsDeep = require('lodash.defaultsdeep');
const path = require('path');
const webpack = require('webpack');

// Plugins
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const isAnalyze = process.env.ANALYZE === 'true';

// PostCss
const autoprefixer = require('autoprefixer');
const postcssVars = require('postcss-simple-vars');
const postcssImport = require('postcss-import');

const env = (process.env.WEBPACK_DEV_SERVER === 'true') ? 'development' : 'production';
const fs = require('fs');
[
    `.env.${env}.local`,
    `.env.${env}`,
    `.env`
].forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
        // eslint-disable-next-line global-require
        require('dotenv').config({
            path: dotenvFile
        });
    }
});

const STATIC_PATH = process.env.STATIC_PATH || '/static';

// node: --openssl-legacy-provider is not allowed in NODE_OPTIONS - Datainfinities https://www.datainfinities.com/69/node-openssl-legacy-provider-not-allowed-in-node-options
process.env.NODE_OPTIONS = '--openssl-legacy-provider';

const base = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: 'cheap-module-source-map',
    devServer: {
        publicPath: '/scratch_app/',
        host: '0.0.0.0',
        port: process.env.PORT || 8601
    },
    output: {
        publicPath: '/scratch_app/',
        library: 'GUI',
        filename: '[name].js',
        chunkFilename: 'chunks/[name].js'
    },
    resolve: {
        symlinks: false
    },
    module: {
        rules: [{
            test: /\.jsx?$/,
            loader: 'babel-loader',
            include: [
                path.resolve(__dirname, 'src'),
                /node_modules[\\/]scratch-[^\\/]+[\\/]src/,
                /node_modules[\\/]pify/,
                /node_modules[\\/]@vernier[\\/]godirect/
            ],
            options: {
                // Explicitly disable babelrc so we don't catch various config
                // in much lower dependencies.
                babelrc: false,
                plugins: [
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-transform-async-to-generator',
                    '@babel/plugin-proposal-object-rest-spread',
                    ['react-intl', {
                        messagesDir: './translations/messages/'
                    }]],
                presets: ['@babel/preset-env', '@babel/preset-react']
            }
        },
        {
            test: /\.css$/,
            use: [{
                loader: 'style-loader'
            }, {
                loader: 'css-loader',
                options: {
                    modules: true,
                    importLoaders: 1,
                    localIdentName: '[name]_[local]_[hash:base64:5]',
                    camelCase: true
                }
            }, {
                loader: 'postcss-loader',
                options: {
                    ident: 'postcss',
                    plugins: function () {
                        return [
                            postcssImport,
                            postcssVars,
                            autoprefixer
                        ];
                    }
                }
            }]
        },
        {
            test: /\.hex$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 16 * 1024
                }
            }]
        }]
    },
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                include: /\.min\.js$/
            })
        ]
    },
    plugins: [
        ...(isAnalyze ? [
            new BundleAnalyzerPlugin({
                openAnalyzer: true,
                // analyzerMode: 'static', // サーバーモードを使わず、静的なレポートを生成
                // reportFilename: 'bundle-report.html', // レポートの出力先
            }),
        ] : []),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: 'node_modules/scratch-blocks/media',
                    to: 'static/blocks-media/default'
                },
                {
                    from: 'node_modules/scratch-blocks/media',
                    to: 'static/blocks-media/high-contrast'
                },
                {
                    from: 'src/lib/themes/high-contrast/blocks-media',
                    to: 'static/blocks-media/high-contrast',
                    force: true
                }
            ]
        })
    ]
};

if (!process.env.CI) {
    base.plugins.push(new webpack.ProgressPlugin());
}

module.exports = [
    // to run editor examples
    defaultsDeep({}, base, {
        entry: {
            'lib.min': ['react', 'react-dom'],
            'gui': './src/playground/index-custom.jsx',
            'blocksonly': './src/playground/blocks-only.jsx',
            'compatibilitytesting': './src/playground/compatibility-testing.jsx',
            'player': './src/playground/player.jsx'
        },
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: '[name].js'
        },
        module: {
            rules: base.module.rules.concat([
                {
                    test: /\.(svg|png|wav|mp3|gif|jpg)$/,
                    loader: 'url-loader',
                    options: {
                        limit: 2048,
                        outputPath: 'static/assets/'
                    }
                }
            ])
        },
        optimization: {
            splitChunks: {
                chunks: 'all',
                name: 'lib.min',
                cacheGroups: {
                    scratchPaint: {
                        test: /[\\/]node_modules[\\/]scratch-paint[\\/]/,
                        name: 'scratch-paint',
                        chunks: 'all',
                        enforce: true
                    },
                    scratchL10n: {
                        test: /[\\/]node_modules[\\/]scratch-l10n[\\/]/,
                        name: 'scratch-l10n',
                        chunks: 'all',
                        enforce: true
                    },
                    scratchBlocks: {
                        test: /[\\/]node_modules[\\/]scratch-blocks[\\/]/,
                        name: 'scratch-blocks',
                        chunks: 'all',
                        enforce: true
                    },
                    scratchVm: {
                        test: /[\\/]node_modules[\\/]scratch-vm[\\/]/,
                        name: 'scratch-vm',
                        chunks: 'all',
                        enforce: true
                    },
                    catBlocks: {
                        test: /[\\/]node_modules[\\/]cat-blocks[\\/]/,
                        name: 'cat-blocks',
                        chunks: 'all',
                        enforce: true
                    },
                    scratchRenderFonts: {
                        test: /[\\/]node_modules[\\/]scratch-render-fonts[\\/]/,
                        name: 'scratch-render-fonts',
                        chunks: 'all',
                        enforce: true
                    },
                },
            },
            runtimeChunk: {
                name: 'lib.min'
            }
        },
        plugins: base.plugins.concat([
            new webpack.DefinePlugin({
                'process.env.PROJECT_HOST': `"${process.env.PROJECT_HOST}"`,
                'process.env.ASSET_HOST': `"${process.env.ASSET_HOST}"`,
                'process.env.NODE_ENV': `"${process.env.NODE_ENV}"`,
                'process.env.DEBUG': Boolean(process.env.DEBUG),
                'process.env.GA_ID': `"${process.env.GA_ID || 'UA-000000-01'}"`
            }),
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'scratch-paint', 'scratch-l10n', 'scratch-blocks', 'scratch-vm', 'cat-blocks', 'scratch-render-fonts', 'gui'],
                template: 'src/playground/index.ejs',
                title: 'Scratch 3.0 GUI'
            }),
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'blocksonly'],
                template: 'src/playground/index.ejs',
                filename: 'blocks-only.html',
                title: 'Scratch 3.0 GUI: Blocks Only Example'
            }),
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'compatibilitytesting'],
                template: 'src/playground/index.ejs',
                filename: 'compatibility-testing.html',
                title: 'Scratch 3.0 GUI: Compatibility Testing'
            }),
            new HtmlWebpackPlugin({
                chunks: ['lib.min', 'player'],
                template: 'src/playground/index.ejs',
                filename: 'player.html',
                title: 'Scratch 3.0 GUI: Player Example'
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'static',
                        to: 'static'
                    }
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'extensions/**',
                        to: 'static',
                        context: 'src/examples'
                    }
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'extension-worker.{js,js.map}',
                        context: 'node_modules/scratch-vm/dist/web',
                        noErrorOnMissing: true
                    }
                ]
            })
        ])
    })
].concat(
    process.env.NODE_ENV === 'production' || process.env.BUILD_MODE === 'dist' ? (
        // export as library
        defaultsDeep({}, base, {
            target: 'web',
            entry: {
                'scratch-gui': './src/index.js'
            },
            output: {
                libraryTarget: 'umd',
                path: path.resolve('dist'),
                publicPath: `${STATIC_PATH}/`
            },
            externals: {
                'react': 'react',
                'react-dom': 'react-dom'
            },
            module: {
                rules: base.module.rules.concat([
                    {
                        test: /\.(svg|png|wav|mp3|gif|jpg)$/,
                        loader: 'url-loader',
                        options: {
                            limit: 2048,
                            outputPath: 'static/assets/',
                            publicPath: `${STATIC_PATH}/assets/`
                        }
                    }
                ])
            },
            plugins: base.plugins.concat([
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: 'extension-worker.{js,js.map}',
                            context: 'node_modules/scratch-vm/dist/web',
                            noErrorOnMissing: true
                        }
                    ]
                }),
                // Include library JSON files for scratch-desktop to use for downloading
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: 'src/lib/libraries/*.json',
                            to: 'libraries',
                            flatten: true
                        }
                    ]
                })
            ])
        })) : []
);
