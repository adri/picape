const Raven = require('raven');
Raven.config(process.env.SENTRY_PUBLIC_DSN).install();

module.exports = {
    /* config options here */
}
