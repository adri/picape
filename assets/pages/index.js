import React from 'react';
import Link from 'next/link';
import Home from './home';
import 'isomorphic-fetch';

export default class IndexPage extends React.Component {
  render() {
    return <Home data={this.props.data} />;
  }
}
