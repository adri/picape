import Head from 'next/head';
import Nav from './Nav';

export default ({ children, title = 'Supermarket' }) =>
  <div className="page-wrapper">
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
      <link href="/static/css/global.css" rel="stylesheet" />
    </Head>

    <style jsx>{`
      .page {
        background-color: #333;
        background: url(/static/images/eat-bg.jpg) no-repeat center center fixed;
        -webkit-background-size: cover;
        -moz-background-size: cover;
        -o-background-size: cover;
        background-size: cover;
        min-height: 100%;
        /* equal to footer height */
        margin-bottom: -70px;
      }
      .page:after {
        content: "";
        display: block;
      }
      .footer, .page:after {
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
    `}</style>

    <div className="page">
      <Nav />

      <main role="main">
        <div className="container">
            {children}
        </div>
      </main>
    </div>

    <footer className="footer">
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
  </div>;
