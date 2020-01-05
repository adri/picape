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
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link href="/#essentials">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>Essentials</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/#order">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>Order</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/ingredients">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>All ingredients</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/recipes">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>All recipes</p>
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
            <li className="nav-item">
              <Link href="/shopping">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>In the shop</p>
                </a>
              </Link>
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
        }

        .nav-link:hover {
          opacity: 1;
          transition: opacity 0.3s;
        }

        .nav-container {
          display: flex !important;
          width: 100%;
        }

        @media screen and (max-width: 991px) {
          .navbar-collapse:before {
            background: rgba(51, 51, 51, 0.4);
          }
        }
      `}</style>
    </nav>
  );
}
