import React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import Loading from "../../components/Loading";
import TagSelection from "../../components/TagSelection";
import DeleteIngredientButton from "./DeleteIngredientButton";
import Router from "next/router";
import mutateable from "../../lib/mutateable";
import IngredientSupermarketSearch from "./IngredientSupermarketSearch";

class EditIngredient extends React.Component {
  componentWillReceiveProps(props) {
    if (!props.data || !props.data.node) return;
    this.setState({
      id: props.data.node.id,
      supermarketProductId: props.data.node.supermarketProductId,
      name: props.data.node.name,
      seasonalName: props.data.node.seasonalName,
      isEssential: props.data.node.isEssential,
      tagIds: props.data.node.tags.map(tag => tag.id),
      allTags: props.data.ingredients.tags,
      changed: false,
    });
  }

  onSave(event) {
    this.props
      .submit(event, {
        input: {
          ingredientId: this.state.id,
          supermarketProductId: this.state.supermarketProductId,
          name: this.state.name,
          seasonalName: this.state.seasonalName,
          isEssential: this.state.isEssential,
          tagIds: this.state.tagIds,
        },
      })
      .then(data => {
        if (data) {
          Router.back();
        }
      });
  }

  onCancel() {
    this.props.data
      .refetch()
      .then(props => this.componentWillReceiveProps(props))
      .then(() => Router.back());
  }

  render() {
    if (this.state === null) return <Loading />;
    const { submit } = this.props;
    const { id, name, seasonalName, isEssential, supermarketProductId, tagIds, allTags, changed } = this.state;

    return (
      <div>
        <div className="card edit-ingredient">
          <div className="card-block">
            <form>
              <div className="form-group row">
                <label htmlFor="name" className="col-sm-2 col-form-label">
                  Ingredient name
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    id="name"
                    className="form-control"
                    onChange={event => this.setState({ name: event.target.value, changed: true })}
                    defaultValue={name}
                  />
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="name" className="col-sm-2 col-form-label">
                  Season name
                </label>
                <div className="col-sm-10">
                  <input
                    type="text"
                    id="seasonalName"
                    className="form-control"
                    onChange={event => this.setState({ seasonalName: event.target.value, changed: true })}
                    defaultValue={seasonalName}
                  />
                  <a href={`https://groentefruit.milieucentraal.nl/?prod=&month=alle&labela=A&labelb=B&labelc=C&labeld=D&labele=E&action=searching`} target="_blank">
                    Should match an ingredient name here exactly
                  </a>
                </div>
              </div>

              <div className="form-group row">
                <label htmlFor="name" className="col-sm-2 col-form-label">
                  Supermarket product
                </label>
                <div className="col-sm-10">
                  <IngredientSupermarketSearch
                    onSelect={ingredient => this.setState({ supermarketProductId: ingredient.id, changed: true })}
                    query={supermarketProductId}
                  />
                </div>
              </div>

              <div className="form-group row">
                <label className="col-sm-2 col-form-label">Tags</label>
                <div className="col-sm-10">
                  <TagSelection
                    tags={allTags}
                    selectedTags={tagIds}
                    onChange={tag => this.setState({ tagIds: [tag], changed: true })}
                  />
                </div>
              </div>

              <div className="form-group row">
                <label className="col-sm-2 col-form-label">Essential</label>
                <div className="col-sm-10">
                  <input
                    checked={isEssential}
                    id="essential"
                    className="bootstrap-switch form-control"
                    onChange={event => this.setState({ isEssential: event.target.checked, changed: true })}
                    type="checkbox"
                  />
                </div>
              </div>

              <div className="form-group row">
                <div className="offset-sm-2 col-sm-10">
                  <input
                    type="submit"
                    className="btn btn-primary"
                    disabled={!changed && "disabled"}
                    value="Save"
                    onClick={event => this.onSave(event)}
                  />
                  <input
                    type="button"
                    className="btn btn-neutral ml-3"
                    value="Cancel"
                    onClick={event => this.onCancel(event, this.state)}
                  />
                  <DeleteIngredientButton ingredientId={id} />
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

const GetIngredient = gql`
  query GetIngredient($ingredientId: ID!) {
    node(id: $ingredientId) {
      ... on Ingredient {
        id
        name
        seasonalName
        imageUrl
        isEssential
        supermarketProductId
        tags {
          id
          name
          count
        }
      }
    }
    ingredients(first: 1000) {
      tags {
        id
        name
        count
      }
    }
  }
`;

const EditIngredientQuery = gql`
  mutation editIngredient($input: EditIngredientInput!) {
    editIngredient(input: $input) {
      id
      supermarketProductId
      name
      seasonalName
      imageUrl
      isEssential
    }
  }
`;

export default compose(
  graphql(GetIngredient, { options: ({ ingredientId }) => ({ variables: { ingredientId } }) }),
  graphql(EditIngredientQuery, {
    options: {
      refetchQueries: ["IngredientList", "EssentialList"],
    },
  }),
  mutateable(),
)(EditIngredient);
