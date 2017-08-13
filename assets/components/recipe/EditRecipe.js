import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../Loading';

class EditRecipe extends React.Component {
  render() {
    const {title, description, ingredients} = this.state;

    return (
      <div className="card-block">
        <form>
          <div className="form-group row">
            <label htmlFor="title" className="col-sm-2 col-form-label">Title</label>
            <div className="col-sm-10">
              <input
                type="title"
                id="title"
                className="form-control"
                onChange={event => this.setState({title: event.target.value})}
                defaultValue={name} />
            </div>
          </div>

          <div className="form-group row">
            <label htmlFor="name" className="col-sm-2 col-form-label">Name</label>
            <div className="col-sm-10">
              <input
                type="name"
                id="name"
                className="form-control"
                onChange={event => this.setState({name: event.target.value})}
                defaultValue={name} />
            </div>
          </div>


          <input
            type="submit"
            className="btn btn-primary"
            value="Save"
            onClick={event => this.props.onSave(event, this.state)} />
          <input
            type="button"
            className="btn btn-secondary ml-3"
            value="Cancel"
            onClick={event => this.props.onCancel(event, this.state)} />
        </form>
      </div>
    );
  }
}

const query = gql`
  mutation editRecipe($recipeId: ID!) {
    editRecipe(recipeId: $recipeId) {
      id
    }
  }
`;

export default compose(
  graphql(query, {
    options: {
      refetchQueries: ['RecipeList', 'OrderList', 'EssentialList'],
    },
  }),
  mutateable(),
)(EditRecipe);
