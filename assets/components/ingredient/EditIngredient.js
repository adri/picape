import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import Loading from '../Loading';
import DeleteIngredientButton from './DeleteIngredientButton';
import Router from 'next/router';
import mutateable from '../../lib/mutateable';

class EditIngredient extends React.Component {
  componentWillReceiveProps(props) {
    if (!props.data || !props.data.node) return;
    console.log(props.data.node);
    this.setState({
      id: props.data.node.id,
      name: props.data.node.name,
      isEssential: props.data.node.isEssential,
      changed: false,
    });
  }

  onSave(event) {
    this.props.submit(event, {
        ingredientId: this.state.id,
        name: this.state.name,
        isEssential: this.state.isEssential,
      })
      .then(data => {
        if (data) {
          Router.back()
        }
      });
  }

  onCancel() {
    this.props.data.refetch()
      .then(props => this.componentWillReceiveProps(props))
      .then(() => Router.back());
  }

  render() {
    if (this.state === null) return <Loading />;
    const {submit} = this.props;
    const {id, name, isEssential, changed} = this.state;

    return (
      <div>
        <div className="card edit-ingredient">
          <div className="card-block">
            <form>
              {/*<div className="form-group row">*/}
                {/*<label htmlFor="name" className="col-sm-2 col-form-label">Supermarket product</label>*/}
                {/*<div className="col-sm-10">*/}
                  {/*<IngredientSupermarketSearch*/}
                    {/*onSelect={ingredient => this.setState({ingredient})}*/}
                  {/*/>*/}
                {/*</div>*/}
              {/*</div>*/}

              <div className="form-group row">
                <label htmlFor="name" className="col-sm-2 col-form-label">Ingredient name</label>
                <div className="col-sm-10">
                  <input
                    type="name"
                    id="name"
                    className="form-control"
                    onChange={event => this.setState({name: event.target.value, changed: true})}
                    defaultValue={name} />
                </div>
              </div>

              <div className="form-group row">
                <label className="col-sm-2 col-form-label">
                  Essential
                </label>
                <div className="col-sm-10">
                <input
                  checked={isEssential}
                  id="essential"
                  className="bootstrap-switch form-control"
                  onChange={event => this.setState({isEssential: event.target.checked, changed: true})}
                  type="checkbox" />
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
                  <DeleteIngredientButton ingredientId={id} />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

const GetIngredient = gql`
    query GetIngredient($ingredientId: ID!) {
        node(id: $ingredientId) {
            ... on Ingredient {
                id
                name
                imageUrl
                isEssential
            }
        }
    }
`;

const AddIngredient = gql`
    mutation editIngredient($ingredientId: ID!, $name: String!, $isEssential: Boolean!) {
        editIngredient(ingredientId: $ingredientId, name: $name, isEssential: $isEssential) {
            id
            name
            imageUrl
            isEssential
        }
    }
`;

export default compose(
  graphql(GetIngredient, { options: ({ ingredientId }) => ({ variables: {ingredientId} }) }),
  graphql(AddIngredient, { options: {
    refetchQueries: ['IngredientList'],
  }}),
  mutateable(),
)(EditIngredient);