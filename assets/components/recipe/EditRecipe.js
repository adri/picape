import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../Loading';
import IngredientSearch from '../ingredient/IngredientSearch';
import Router from 'next/router';

class EditRecipe extends React.Component {

  componentWillReceiveProps(props) {
    if (!props.data || !props.data.node) return;
    this.setState({
      id: props.data.node.id,
      title: props.data.node.title,
      ingredients: props.data.node.ingredients || [],
      changed: false,
    });
  }

  deleteIngredient(event, ingredientId) {
    event.preventDefault();
    this.setState({
      ingredients: this.state.ingredients.filter(ingredient => ingredient.id !== ingredientId),
      changed: true,
    })
  }

  addIngredient(ingredient) {
    this.setState({
      ingredients: [
        ...this.state.ingredients,
        ingredient,
      ],
      changed: true,
    })
  }

  onSave(event) {
    this.props.submit(event, {
        recipeId: this.state.id,
        title: this.state.title,
        ingredients: this.state.ingredients.map(ingredient => ({
          ingredientId: ingredient.id,
          quantity: ingredient.quantity || 1,
        }))
      })
      .then(() => Router.back());
  }

  onCancel() {
    this.props.data.refetch()
      .then(props => this.componentWillReceiveProps(props))
      .then(() => Router.back());
  }

  render() {
    const { data: {loading, error} } = this.props;
    if (this.state === null) return <Loading />;
    const {title, ingredients, changed} = this.state;

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
                    onChange={event => this.setState({title: event.target.value, changed: true})}
                    defaultValue={title} />
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="title" className="col-sm-2 col-form-label">Ingredients</label>
                <div className="col-sm-10">
                  <ul className="list-group">
                    {ingredients.map(ingredient =>
                      <li key={ingredient.id} className="list-group-item">
                        <a href="#" onClick={event => this.deleteIngredient(event, ingredient.id)}>
                          <i className="now-ui-icons ui-1_simple-remove mr-2" />
                        </a>
                        {ingredient.name}
                      </li>
                    )}
                    <li className="list-group-item">
                      <i className="now-ui-icons ui-1_simple-add mr-2" />
                      <div className="form-group mb-2 mr-sm-2 mb-sm-0">
                        <IngredientSearch
                          onSelect={ingredient => this.addIngredient(ingredient)}
                          excluded={ingredients.map(ingredient => ingredient.id)}
                        />
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-group row">
                <div className="offset-sm-2 col-sm-10">
                  <input
                    type="submit"
                    className="btn btn-primary"
                    disabled={!changed && "disabled"}
                    value="Save"
                    onClick={event => this.onSave(event)} />
                  <input
                    type="button"
                    className="btn btn-neutral ml-3"
                    value="Cancel"
                    onClick={event => this.onCancel(event, this.state)} />
                </div>
              </div>

            </form>
          </div>
        </div>
        <style jsx>{`
        #newIngredient {
          display: inline-block;
        }
        .card {
          overflow: visible;
        }

        .list-group-item {
          border: none
        }
        `}</style>
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
  mutation EditRecipe($recipeId: ID!, $title: String!, $ingredients: [IngredientRef]) {
    editRecipe(recipeId: $recipeId, title: $title, ingredients: $ingredients) {
      id
      title  
      ingredients {
          id
      }  
    }
  }
`;

export default compose(
  graphql(GetRecipe, { options: ({ recipeId }) => ({ variables: { recipeId } }) }),
  graphql(EditQuery),
  mutateable(),
)(EditRecipe);
