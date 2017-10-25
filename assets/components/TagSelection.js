import {withState, compose} from 'recompose';

export default ({tags, selectedTags, onChange, allCount}) =>
  <ul className="nav nav-tabs" role="tablist">
    {allCount && <li className="nav-item">
        <a onClick={(e) => {e.preventDefault(); onChange([])}}
            className={"nav-link " + (selectedTags.length === 0 && "active")}
            href="#">
            <span className="badge badge-default">{allCount}</span> All
        </a>
    </li>}
    {tags && tags.map((tag) =>
      <li key={tag.name} className="nav-item">
          <a onClick={(e) => {e.preventDefault(); onChange(tag.id)}}
            href="#"
            className={"nav-link " + (selectedTags.includes(tag.id)  && "active")}>
            <span className="badge badge-default">{tag.count}</span> {tag.name}
          </a>
      </li>
    )}
    <style jsx>{`
    .nav-tabs {
      padding: 10px 0.7rem;
    }

    .nav-tabs > .nav-item > .nav-link {
      padding: 3px 14px;
      padding-left: 4px;
    }

    .nav-tabs > .nav-item > .nav-link.active {
      background-color: rgba(0,0,0,0.3);
      border: 1px solid transparent;
      color: white;
    }

    .nav-link.active .badge {
      background-color: white;
      border: 1px solid transparent;
    }

    .badge {
      margin-bottom: 1px;
    }
    `}</style>
  </ul>
