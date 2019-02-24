import Head from "next/head";
import Nav from "./Nav";
import NProgress from "nprogress";
import Router from "next/router";
import Raven from "raven-js";

Raven.config(SENTRY_PUBLIC_DSN).install();

Router.onRouteChangeStart = url => {
  console.log(`Loading: ${url}`);
  NProgress.start();
};
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

export default class Layout extends React.Component {
  constructor() {
    super();
    this.state = {
      mounted: false,
      navBarOpen: false,
    };
  }

  componentDidMount() {
    // trick to make the animation work is to call the set state next run
    setTimeout(() => {
      this.setState({ mounted: true });
    }, 1);
  }

  componentDidCatch(error, errorInfo) {
    Raven.captureException(error, { extra: errorInfo });
  }

  // export default ({ children, title = 'Supermarket' }) =>

  render() {
    const { children, title = "Supermarket" } = this.props;
    const { navBarOpen } = this.state;
    return (
      <div className={"page-wrapper " + (navBarOpen ? "nav-open" : "")}>
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="viewport" content="initial-scale=1.0, width=device-width, viewport-fit=cover" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Picape" />

          <title>{title}</title>

          <link rel="apple-touch-icon" sizes="180x180" href="/static/images/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/static/images/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/static/images/favicon-16x16.png" />
          <link
            href="/static/images/iphone5_splash.png"
            media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/iphone6_splash.png"
            media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/iphoneplus_splash.png"
            media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/iphonex_splash.png"
            media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/iphonexr_splash.png"
            media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/iphonexsmax_splash.png"
            media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/ipad_splash.png"
            media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/ipadpro1_splash.png"
            media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/ipadpro3_splash.png"
            media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />
          <link
            href="/static/images/ipadpro2_splash.png"
            media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
            rel="apple-touch-startup-image"
          />

          <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700,200" rel="stylesheet" />
          <link href="/static/css/font-awesome.min.css" rel="stylesheet" />
          <link href="/static/css/bootstrap.min.css" rel="stylesheet" />
          <link href="/static/css/now-ui-kit.css" rel="stylesheet" />
          <link href="/static/css/nprogress.css" rel="stylesheet" />
          <link
            rel="prefetch"
            href="https://res.cloudinary.com/picape/image/upload/f_auto,fl_immutable_cache.progressive/v1503141378/eat-bg_kigvfj.jpg"
          />
        </Head>
        <style jsx global>
          {`
            html {
              background-color: #333;
            }

            body {
              background-color: transparent !important;
            }

            @media (min-width: 320px) and (max-width: 480px) {
              body {
                padding-top: 30px;
              }
            }

            body > div:first-child,
            #__next,
            #__next > div {
              height: 100%;
            }

            .background {
              position: fixed;
              height: 100vh;
              width: 100vw;
              top: 0;
              left: 0;
              z-index: -1;
              background: url("https://res.cloudinary.com/picape/image/upload/f_auto,fl_immutable_cache.progressive/v1503141378/eat-bg_kigvfj.jpg")
                no-repeat center center;
              -webkit-background-size: cover;
              -moz-background-size: cover;
              -o-background-size: cover;
              background-size: cover;
              background-color: #333;
            }

            .page-wrapper {
              background-color: transparent !important;
            }

            .page {
              background-color: transparent !important;
            }

            .card {
              transform: "translateZ(0)";
            }

            .page:after {
              content: "";
              display: block;
            }
            .footer,
            .page:after {
              /* .push must be the same height as footer */
              height: 70px;
            }

            .footer {
              background-color: #333;
              color: white;
            }

            .page-wrapper {
              background-color: #333;
              height: 100%;
            }
            .animated {
              opacity: 0;
              visibility: hidden;
              transition: opacity 0.1s ease-in;
            }
            .animated.mounted {
              opacity: 1;
              visibility: visible;
            }
          `}
        </style>

        <div className="background" />
        <div className="page">
          <Nav
            navBarOpen={this.state.navBarOpen}
            onNavOpen={() => this.setState({ navBarOpen: !this.state.navBarOpen })}
          />

          <main role="main">
            <div className={"container animated " + (this.state.mounted ? "mounted" : "")}>{children}</div>
          </main>
        </div>
      </div>
    );
  }
}
