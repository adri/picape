// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. A deployed update is picked up on the next resume:
// the page asks for a new worker whenever it becomes visible, and reloads once
// that worker takes control.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

// webpack injected PUBLIC_URL into the bundle; Metro does not. The build is
// served from the site root, so this is the empty string. Without it the
// worker URL would be the literal string "undefined/service-worker.js".
const PUBLIC_URL = '';

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config) {
  const isEnvProduction = process.env.NODE_ENV === 'production';
  if (isEnvProduction && 'serviceWorker' in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(PUBLIC_URL || '/', window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://cra.link/PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

// An installed PWA is suspended when you leave it and resumed when you come
// back, so it can run for weeks without ever loading the page again. Nothing
// would go looking for a new worker in that time. Ask on every resume, and the
// check costs one conditional request against a worker that answers 304.
//
// pageshow as well as visibilitychange: iOS has not been dependable about
// firing visibilitychange when a home-screen app is resumed, and a resume that
// never asks is the whole failure this is here to prevent.
//
// update() rejects whenever the network is down, which for a shopping app in a
// supermarket is an ordinary Tuesday. Sentry captures unhandled rejections, so
// swallowing it is what keeps every offline resume out of the issue list.
function checkForUpdateOnResume(registration) {
  const ask = () => registration.update().catch(() => {});

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') ask();
  });
  window.addEventListener('pageshow', ask);
}

// The worker skips waiting, so a new one takes control while the page is still
// showing the build the old one served. Reloading is what puts the new build on
// screen.
//
// It waits for the page to be hidden first. Navigation state is not restored
// (App.js keeps setInitialNavigationState off), so a reload drops you on the
// default tab at the top. Doing that under someone halfway down their cart is
// worse than being a version behind for one more resume.
//
// A page that loaded with no worker is claimed by the one it just installed.
// That first claim is not an update, so it is swallowed. Every later one is a
// new build, and the listener has to be attached either way: a freshly
// installed home-screen app always loads uncontrolled the first time, and that
// is precisely the page that then stays open for weeks.
function reloadWhenTheNewWorkerTakesOver() {
  let controlled = Boolean(navigator.serviceWorker.controller);
  let pending = false;

  const reloadWhenHidden = () => {
    if (!pending || document.visibilityState !== 'hidden') return;
    document.removeEventListener('visibilitychange', reloadWhenHidden);
    window.location.reload();
  };

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!controlled) {
      controlled = true;
      return;
    }
    if (pending) return;
    pending = true;
    document.addEventListener('visibilitychange', reloadWhenHidden);
    reloadWhenHidden();
  });
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      reloadWhenTheNewWorkerTakesOver();
      checkForUpdateOnResume(registration);

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // The new worker activates itself from here, and the
              // controllerchange listener above reloads the page onto it.
              console.log('New content is available; reloading.');

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log('Content is cached for offline use.');

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('Error during service worker registration:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('No internet connection found. App is running in offline mode.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
