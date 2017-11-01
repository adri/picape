import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import mutateable from '../../lib/mutateable';
import Loading from '../../components/Loading';
import IngredientSearch from '../ingredient/IngredientSearch';
import Router from 'next/router';
import TextareaAutosize from 'react-autosize-textarea';


class EditRecipe extends React.Component {

  componentWillReceiveProps(props) {
    if (!props.data || !props.data.node) return;
    this.setState({
      id: props.data.node.id,
      title: props.data.node.title,
      description: props.data.node.description,
      imageUrl: props.data.node.imageUrl,
      ingredients: props.data.node.ingredients || [],
      changed: false,
    });
  }

  deleteIngredient(event, ingredientId) {
    event.preventDefault();
    this.setState({
      ingredients: this.state.ingredients.filter(ref => ref.ingredient.id !== ingredientId),
      changed: true,
    })
  }

  setIngredientQuantity(event, ingredientId, quantity) {
    event.preventDefault();
    this.setState({
      ingredients: this.state.ingredients.map(ref => {
        if (ref.ingredient.id === ingredientId) {
          return {
            ...ref,
            quantity: parseInt(quantity, 10) || 1
          };
        }

        return ref;
      }),
      changed: true,
    })
  }

  addIngredient(ingredient) {
    this.setState({
      ingredients: [
        ...this.state.ingredients,
        { quantity: 1,
          ingredient },
      ],
      changed: true,
    })
  }

  onSave(event) {
    this.props.submit(event, {
        recipeId: this.state.id,
        title: this.state.title,
        description: this.state.description,
        imageUrl: this.state.imageUrl,
        ingredients: this.state.ingredients.map(ref => ({
          ingredientId: ref.ingredient.id,
          quantity: ref.quantity || 1,
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
    const {title, imageUrl, ingredients, description, changed} = this.state;

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
                <label htmlFor="description" className="col-sm-2 col-form-label">Description</label>
                <div className="col-sm-10">
                    <TextareaAutosize
                      type="description"
                      id="description"
                      className="form-control instruction"
                      rows={3}
                      onChange={event => this.setState({description: event.target.value, changed: true})}
                      defaultValue={description} />
                </div>
            </div>

              <div className="form-group row">
                <label htmlFor="imageUrl" className="col-sm-2 col-form-label">Image URL</label>
                <div className="col-sm-10">
                  <input
                    type="imageUrl"
                    id="imageUrl"
                    className="form-control"
                    onChange={event => this.setState({imageUrl: event.target.value, changed: true})}
                    defaultValue={imageUrl} />
                  <a href={`https://www.google.com/search?tbm=isch&q=${encodeURI(title)}`} target="_blank">Open Google Images</a>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="title" className="col-sm-2 col-form-label">Ingredients</label>
                <div className="col-sm-10">
                  <ul className="list-group">
                    {ingredients.map(ref =>
                      <li key={ref.ingredient.id} className="list-group-item">
                        <div className="form-inline">
                            <a href="#" onClick={event => this.deleteIngredient(event, ref.ingredient.id)}>
                              <i className="now-ui-icons ui-1_simple-remove mr-2" />
                            </a>
                            <input
                              type="number"
                              className="form-control mr-3"
                              style={{width: 70}}
                              onChange={event => this.setIngredientQuantity(event, ref.ingredient.id, event.target.value)}
                              defaultValue={ref.quantity} />
                            <span>
                            {ref.ingredient.name}
                            </span>
                        </div>
                      </li>
                    )}
                    <li className="list-group-item">
                      <i className="now-ui-icons ui-1_simple-add mr-2" />
                      <div className="form-group mb-2 mr-sm-2 mb-sm-0">
                        <IngredientSearch
                          onSelect={ingredient => this.addIngredient(ingredient)}
                          excluded={ingredients.map(ref => ref.ingredient.id)}
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
          border: none;
        }

        .card .instruction {
          color: #2c2c2c;
          border: 1px solid #E3E3E3;
          border-radius: 20px;
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
                description
                imageUrl
                ingredients {
                    quantity
                    ingredient {
                        id
                        name
                    }
                }
            }
        }
    }
`;


const EditQuery = gql`
  mutation EditRecipe($recipeId: ID!, $title: String!, $imageUrl: String, $ingredients: [IngredientRef]!, $description: String) {
    editRecipe(recipeId: $recipeId, title: $title, imageUrl: $imageUrl, ingredients: $ingredients, description: $description) {
      id
      title  
      imageUrl  
      description
      ingredients {
        quantity
        ingredient {
            id
            name
        }
      }  
    }
  }
`;

export default compose(
  graphql(GetRecipe, { options: ({ recipeId }) => ({ variables: { recipeId } }) }),
  graphql(EditQuery),
  mutateable(),
)(EditRecipe);
