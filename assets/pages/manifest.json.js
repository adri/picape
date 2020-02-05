import React, { Component } from "react";

export default class Manifest extends Component {
  static getInitialProps({ res }) {
    res.setHeader("Content-Type", "application/json");
    res.write(`{
      "name": "Picape",
      "short_name": "Picape",
      "lang": "en-US",
      "start_url": "/",
      "display": "standalone",
      "theme_color": "#B07762",
      "icons": [
        {
          "src": "/static/images/apple-touch-icon.png",
          "sizes": "180x180"
        }
      ]
    }`);
    res.end();
  }
}
