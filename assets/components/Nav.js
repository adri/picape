import Link from 'next/link'
import LastOrderedRecipes from '../apps/LastOrderdRecipes'

export default () => {
  return (
    <nav className="navbar navbar-toggleable-md bg-primary navbar-transparent">
      <div className="container">
        <div className="navbar-translate">
          <Link href="/"><a className="logo">Picape</a></Link>
        </div>
      <div className=" nav-container justify-content-end">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link href="/ingredients">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>Ingredients</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/recipes">
                <a className="nav-link link">
                  <i className="now-ui-icons files_paper" />
                  <p>Recipes</p>
                </a>
              </Link>
            </li>
            <li className="nav-item">
              <span className="nav-link link">
                <i className="now-ui-icons files_paper" />
                <span className="link"><LastOrderedRecipes /></span>
              </span>
            </li>
          </ul>
        </div>
      </div>
      <style jsx>{`
    .logo{
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
        opacity: 1.0;
        transition: opacity 0.3s;
    }

    .nav-container {
        display: flex!important;
        width: 100%;
    }
    `}</style>
    </nav>
  )
}
