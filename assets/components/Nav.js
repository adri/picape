import Link from 'next/link'

export default () => (
  <nav className="navbar navbar-toggleable-md bg-primary navbar-transparent">
    <div className="container">
      <div className="navbar-translate">
        <button className="navbar-toggler navbar-toggler-right" type="button" data-toggle="collapse" data-target="#navigation" aria-controls="navigation-index" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-bar bar1"/>
          <span className="navbar-toggler-bar bar2"/>
          <span className="navbar-toggler-bar bar3"/>
        </button>
        <Link className="navbar-brand" href="/"><a>Picape</a></Link>
      </div>
      <div className="collapse navbar-collapse justify-content-end" id="navigation" data-nav-image="./assets/img/blurred-image-1.jpg">
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link href="/ingredients">
              <a className="nav-link">
                <i className="now-ui-icons files_paper" />
                <p>Ingredients</p>
              </a>
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/recipes">
              <a className="nav-link">
                <i className="now-ui-icons files_paper" />
                <p>Recipes</p>
              </a>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
)
