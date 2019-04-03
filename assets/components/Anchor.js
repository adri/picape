import React from "react";

export default ({ icon, target }) => (
  <a href={`#${target}`} className="text-white float-right">
    <i className={`fa ${icon} fa-lg fa-fw`} />
  </a>
);
