import * as Sentry from "sentry-expo";

Sentry.init({
  dsn:
    "https://e7e18afb7c904845a6d96da76e27edc5@o88725.ingest.sentry.io/5304839",

  enableInExpoDevelopment: true,
  debug: true,
});

export { Sentry };
