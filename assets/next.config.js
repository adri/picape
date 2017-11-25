const Raven = require('raven');
Raven.config(process.env.SENTRY_PUBLIC_DSN).install();

module.exports = {
  webpack: function (config) {
    if (process.env.ANALYZE) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8888,
            openAnalyzer: true
        }))
    }

    return config
  }
}
