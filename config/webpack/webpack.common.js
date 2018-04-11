const path = require("path")
const ExtractTextPlugin = require("extract-text-webpack-plugin")

module.exports = {
    entry: path.resolve(__dirname, "../../frontend/main.js"),
    output: {
        path: path.resolve(__dirname, "../../static"),
        filename: "js/webpack.bundle.js",
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                include: [
                    path.resolve(__dirname, "../../"),
                ],
                exclude: path.resolve(__dirname, "../../static/js"),
                query: {presets: ["env"]},
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: ["css-loader", "sass-loader"],
                }),
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader",
                }),
            },
            {
                test: /\.vue$/,
                loader: "vue-loader",
                options: {
                    loaders: {
                        scss: ExtractTextPlugin.extract({
                            use: ["css-loader", "sass-loader"],
                            fallback: "vue-style-loader",
                        }),
                        js: "babel-loader",
                    },
                },
            },
        ],
    },
    plugins: [
        new ExtractTextPlugin("css/webpack.bundle.css"),
    ],
    resolve: {
        modules: [
            path.resolve(__dirname, "../../frontend"),
            path.resolve(__dirname, "../../node_modules"),
        ],
        alias: {
            "bootstrap-vue": "bootstrap-vue/dist/bootstrap-vue.esm.js",
            vue$: "vue/dist/vue.esm.js",
        },
        extensions: [".webpack.js", ".js", ".vue"],
    },
    stats: {colors: true},
}
