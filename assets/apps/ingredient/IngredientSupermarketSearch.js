import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Loading from '../../components/Loading';
import Ingredient from '../../components/Ingredient';
import Autocomplete from 'react-autocomplete';

class IngredientSupermarketSearch extends React.Component {
  state = {
    value: '',
  };

  render() {
    const {refetch, loading, ingredients} = this.props.data || {};
    const {onSelect} = this.props;

    return (
      <div style={{position: "relative"}}>
        <Autocomplete
          getItemValue={(ingredient) => this.state.value}
          items={ingredients || []}
          inputProps={{
            className: "form-control supermarket-autocomplete",
            placeholder: "Supermarket product (Nederlands)",
            size: 90,
            style: {
              backgroundColor: "white",
            }
          }}
          menuStyle={{
              position: "absolute",
              top: 37,
              left: 0,
              zIndex: 9,
          }}
          renderItem={(ingredient, isHighlighted) =>
            <div key={ingredient.id} style={{ cursor: 'pointer', background: isHighlighted ? '#e4e4e4' : 'white' }}>
              <Ingredient {...ingredient} />
            </div>
          }
          value={this.state.value}
          onChange={(e) => {
            const value = e.target.value;
            this.setState({ value });
            clearTimeout(this.debounced);
            this.debounced = setTimeout(() => {
              refetch({query: value})
            }, 300)

          }}
          onSelect={(val, ingredient) => {
            this.setState({value: val});
            onSelect && onSelect(ingredient);
          }}
        />
      </div>
    )
  }
}

const query = gql`
  query searchSupermarket($query: String!) {
    ingredients: searchSupermarket(query: $query) {
      id
      name
      price
      imageUrl
      unitQuantity
    }
  }
`;

export default compose(
  graphql(query, {
    skip: ({query}) => query === '',
    options: {
      variables: { query: '' }
    }
  }),
)(IngredientSupermarketSearch);
