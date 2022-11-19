const Raven = require('raven');
Raven.config(process.env.SENTRY_PUBLIC_DSN).install();
const prod = process.env.NODE_ENV === "production";

module.exports = {
  env: {
    SECURE: prod,
    BACKEND_URL: prod ? "picape.fly.dev" : "dd93f1ac.eu.ngrok.io",
  },
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
