import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import IngredientSupermarketSearch from './IngredientSupermarketSearch';
import EditSupermarketIngredient from './EditSupermarketIngredient';
import mutateable from '../../lib/mutateable';

class AddIngredient extends React.Component {
  state = {
    ingredient: null
  };

  render() {
    const {submit} = this.props;

    return (
      <div>
        <IngredientSupermarketSearch
          onSelect={ingredient => this.setState({ingredient})}
        />
        {this.state.ingredient &&
          <EditSupermarketIngredient
            ingredient={this.state.ingredient}
            onSave={(event, ingredient) => {
              submit(event, ingredient)
                .then(() => this.setState({ingredient: null}));
            }}
            />
        }
      </div>
    )
  }
}

const addIngredient = gql`
    mutation AddIngredient($name: String!, $isEssential: Boolean!, $supermarketProductId: Int!) {
        addIngredient(name: $name, isEssential: $isEssential, supermarketProductId: $supermarketProductId) {
            id
            name
            imageUrl
            isPlanned
            unitQuantity
            orderedQuantity
        }
    }
`;

export default compose(
  graphql(addIngredient, { options: {
    refetchQueries: ['IngredientList'],
  }}),
  mutateable(),
)(AddIngredient);
