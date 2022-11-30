const registerRouter = require('./backend/router')
module.exports = {
    css: {
        loaderOptions: {
            sass: {
                // 引入全局变量和 mixin
                additionalData: `
                    @import "@/assets/scss/variable.scss";
                    @import "@/assets/scss/mixin.scss";
                `
            }
        }
    },
    devServer: {
        before(app) {
            registerRouter(app);
        },
        port: 5105
    },
    configureWebpack: (config) => {
        if (process.env.npm_config_report) {
            const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
            config.plugins.push(new BundleAnalyzerPlugin())
        }
    },
    productionSourceMap: false,
    publicPath: process.env.NODE_ENV === 'production' ? '/music-next/' : '/'
}