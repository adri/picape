const prod = process.env.NODE_ENV === "production";

module.exports = {
  // 'BACKEND_URL': prod ? 'ws://' + process.env.HOST : 'ws://localhost:4000',
  SECURE: prod,
  BACKEND_URL: prod ? process.env.HOST : "dd93f1ac.eu.ngrok.io",
  // 'BACKEND_URL': prod ? process.env.HOST : 'localhost:4000',
  SENTRY_PUBLIC_DSN: prod ? process.env.SENTRY_PUBLIC_DSN : "https://xxxx@sentry.io/xxxx",
};
