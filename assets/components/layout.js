import Link from 'next/link';
import Head from 'next/head';

export default ({ children, title = 'Supermarket' }) =>
  <div>
    <Head>
      <meta charSet="utf-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      <title>
        {title}
      </title>
      <link rel="apple-touch-icon" sizes="76x76" href="/images/apple-icon.png" />
      <link rel="icon" type="image/png" href="/images/favicon.png" />
      <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700,200" rel="stylesheet" />
      <link href="/static/css/font-awesome.min.css" rel="stylesheet" />
      <link href="/static/css/bootstrap.min.css" rel="stylesheet" />
      <link href="/static/css/now-ui-kit.css" rel="stylesheet" />
    </Head>
    <header />
    <style jsx>{`
      html {
        background-color: #f9f7f5;
      }

      div.section-recipes {
        background-color: #f9f7f5;
      }
    `}</style>

    <nav className="navbar navbar-toggleable-md bg-primary fixed-top navbar-primary ">
      <div className="container">
        <div className="navbar-translate">
          <button
            className="navbar-toggler navbar-toggler-right"
            type="button"
            data-toggle="collapse"
            data-target="#navigation"
            aria-controls="navigation-index"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </button>
          <a className="navbar-brand" href="/">
            Picape
          </a>
        </div>
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navigation"
          data-nav-image="/images/blurred-image-1.jpg"
        >
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="/">
                Login
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div className="wrapper">
      <div className="section section-recipes">
        <div className="container-fluid">
          <main role="main">
            {children}
          </main>
        </div>
      </div>

      <footer className="footer footer-default">
        <div className="container">
          <nav>
            <ul>
              <li>
                <a href="http://presentation.creative-tim.com">About Us</a>
              </li>
              <li>
                <a href="http://blog.creative-tim.com">Blog</a>
              </li>
              <li>
                <a href="https://github.com/creativetimofficial/now-ui-kit/blob/master/LICENSE.md">MIT License</a>
              </li>
            </ul>
          </nav>
          <div className="copyright">&copy; Designed by </div>
        </div>
      </footer>
    </div>

    <footer>
      {'Footer'}
    </footer>
  </div>;
