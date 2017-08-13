import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../Loading';

class EditRecipe extends React.Component {

  componentWillReceiveProps(props) {
    console.log(props.data);
    if (!props.data) return;
    this.state = {
      id: props.data.node.id,
      title: props.data.node.title,
      ingredients: props.data.node.ingredients,
    };
  }

  render() {
    const { data: {loading, error} } = this.props;
    if (loading || this.state === null) return <Loading />;
    const {title, ingredients} = this.state;

    return (
      <div>
        <h5 className="text-white">Edit Recipe</h5>
        <div className="card">
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
                    defaultValue={title} />
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="title" className="col-sm-2 col-form-label">Ingredients</label>
                <div className="col-sm-10">
                  <ul className="list-group">
                    {ingredients.map(ingredient =>
                      <li key={ingredient.id} className="list-group-item">
                        <a href="#"><i className="now-ui-icons ui-1_simple-remove mr-2" /></a>
                        {ingredient.name}
                      </li>
                    )}
                  </ul>
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
        </div>
      </div>
    );
  }
}

const GetRecipe = gql`
    query GetRecipe($recipeId: ID!) {
        node(id: $recipeId) {
            ... on Recipe {
                id
                title
                ingredients {
                    id 
                    name
                }
            }
        }
    }
`;


const EditQuery = gql`
  mutation EditRecipe($recipeId: ID!) {
    editRecipe(recipeId: $recipeId) {
      id
    }
  }
`;

export default compose(
  graphql(GetRecipe, { options: ({ recipeId }) => ({ variables: { recipeId } }) }),
  // graphql(EditQuery, {
  //   options: {
  //     refetchQueries: ['RecipeList', 'OrderList', 'EssentialList'],
  //   },
  // }),
  // mutateable(),
)(EditRecipe);
