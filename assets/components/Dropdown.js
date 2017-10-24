import {withState, compose} from 'recompose';

const enhance = compose(
  withState('opened', 'toggle', false),
);

export default enhance(({ opened, toggle, link, children }) =>
  <aside className={"dropdown " + (opened && "show")}>
    <a className="dropdown-toggle " onClick={() => toggle(opened => !opened)} aria-haspopup="true" aria-expanded={opened}>
      {link}
    </a>
    <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
      {children}
    </div>
    <style jsx>{`
    aside {
      display: inline-block;
    }
    .dropdown-toggle {
      cursor: pointer;
    }
    .dropdown-toggle::after {
      border-top-color: #c3c3c3;
    }
    `}</style>
  </aside>);
