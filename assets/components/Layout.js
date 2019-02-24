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
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Picape" />

          <title>{title}</title>
          <link rel="apple-touch-icon" sizes="76x76" href="/images/apple-icon.png" />
          <link rel="icon" type="image/png" href="/images/favicon.png" />
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
