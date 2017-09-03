const prod = process.env.NODE_ENV === 'production';

module.exports = {
  'BACKEND_URL': prod ? 'https://' + process.env.HOST : 'http://localhost:4000',
  'SENTRY_PUBLIC_DSN': prod ? process.env.SENTRY_PUBLIC_DSN: 'https://xxxx@sentry.io/xxxx',
};
