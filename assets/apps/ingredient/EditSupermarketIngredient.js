import React from "react";

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.ingredient.name,
      supermarketProductId: props.ingredient.id,
      isEssential: false,
    };
  }

  render() {
    const { name, isEssential } = this.state;

    return (
      <div className="card edit-ingredient">
        <div className="card-block">
          <form>
            <div className="form-group row">
              <label htmlFor="name" className="col-sm-2 col-form-label">
                Ingredient name
              </label>
              <div className="col-sm-10">
                <input
                  type="name"
                  id="name"
                  className="form-control"
                  onChange={event => this.setState({ name: event.target.value })}
                  defaultValue={name}
                />
              </div>
            </div>

            <div className="form-group row">
              <label className="col-sm-2 col-form-label">Essential</label>
              <input
                checked={isEssential}
                id="essential"
                className="bootstrap-switch form-control"
                onChange={event => this.setState({ isEssential: event.target.checked })}
                type="checkbox"
              />
              Essential
            </div>

            <input
              type="submit"
              className="btn btn-primary"
              value="Save"
              onClick={event => this.props.onSave(event, this.state)}
            />
            <input
              type="button"
              className="btn btn-secondary ml-3"
              value="Cancel"
              onClick={event => this.props.onCancel(event, this.state)}
            />
          </form>
        </div>
        <style jsx>{`
          .edit-ingredient {
            max-width: 550px;
          }
        `}</style>
      </div>
    );
  }
}
