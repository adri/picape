import Link from "next/link";
import LastOrderedRecipes from "../apps/LastOrderdRecipes";

export default function({ navBarOpen, onNavOpen }) {
  return (
    <nav className="navbar navbar-toggleable-md bg-primary navbar-transparent">
      <div className="container">
        <div className="navbar-translate">
          <button
            className={
              "navbar-toggler float-right " + (navBarOpen ? "toggled" : "")
            }
            type="button"
            aria-expanded="false"
            aria-label="Toggle navigation"
            onClick={onNavOpen}
          >
            <span className="navbar-toggler-bar top-bar" />
            <span className="navbar-toggler-bar middle-bar" />
            <span className="navbar-toggler-bar bottom-bar" />
          </button>

          <Link href="/">
            <a className="logo">Picape</a>
          </Link>
        </div>

        <div className={"navbar-collapse " + (navBarOpen ? "" : "collapse")}>
          <div
            className="navbar-close float-right visible-xs"
            onClick={onNavOpen}
          >
            <i className="now-ui-icons ui-1_simple-remove" />
          </div>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link href="/#essentials">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>Basics</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/#order">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>Nu op lijst</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/shopping">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>In de winkel</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/ingredients">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>Alle ingrediënten</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/recipes">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>Alle recepten</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <span className="nav-link link">
                <i className="now-ui-icons files_paper" />
                <span className="link">
                  <LastOrderedRecipes />
                </span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <style jsx>{`
        .logo {
          font-size: 25px;
          transition: all 0.4s ease;
        }

        .logo:hover {
          text-decoration: none;
          transition: all 0.4s ease;
          transform: scaleY(-1);
        }

        .nav-link {
          opacity: 0.8;
          transition: opacity 0.3s;
        }

        .link,
        .nav-link p {
          font-size: 13px;
          margin-left: 5px;
        }

        .nav-link:hover {
          opacity: 1;
          transition: opacity 0.3s;
        }

        .nav-container {
          display: flex !important;
          width: 100%;
        }

        .navbar-close {
          display: none;
          padding: 20px;
        }

        @media screen and (max-width: 991px) {
          .navbar-nav {
            display: block;
          }

          .navbar-close {
            display: block;
          }

          .navbar-collapse:before {
            background: rgba(51, 51, 51, 0.4);
          }
        }
      `}</style>
    </nav>
  );
}
