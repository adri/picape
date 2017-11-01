import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import mutateable from '../../lib/mutateable';
import Router from 'next/router'

class AddRecipe extends React.Component {
  state = {
    title: ''
  };

  onAdd(event) {
    this.props
      .submit(event, { title: this.state.title, })
      .then(res => {
        if (addRecipe) {
          Router.push(`/recipe?id=${res.data.addRecipe.id}`)
        }
      });

    return false;
  }

  render() {
    return (
      <div>
        <h4 className="text-white">New</h4>
        <div className="text-white">
          <p>Name your new recipe.</p>
        </div>
        <form onSubmit={event => this.onAdd(event)}>
          <input
            type="title"
            id="title"
            className="form-control text-input"
            placeholder="Title"
            onChange={event => this.setState({title: event.target.value})}
            defaultValue={this.state.title} />
        </form>
        <style jsx>
        {`
        .text-input {
            background-color: white;
            width: 300px;
        }
        `}</style>
      </div>
    )
  }
}

const addRecipe = gql`
    mutation AddRecipe($title: String!) {
        addRecipe(title: $title ) {
            id
        }
    }
`;

export default compose(
  graphql(addRecipe, {
    options: {
      refetchQueries: ['RecipeList']
    }
  }),
  mutateable(),
)(AddRecipe);
