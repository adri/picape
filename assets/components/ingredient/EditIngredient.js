import React from 'react';

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
    const {name, isEssential} = this.state;

    return (
      <div className="card">
        <div className="card-block">
          <form>
            <div className="form-group row">
              <label htmlFor="lgFormGroupInput" className="col-sm-2 col-form-label">Ingredient name</label>
              <div className="col-sm-10">
                <input
                  type="email"
                  className="form-control"
                  onChange={event => this.setState({name: event.target.value})}
                  defaultValue={name} />
              </div>
            </div>

            <div className="form-group row">
            <div className="form-check">
                <label className="form-check-label">
                  <input
                    checked={isEssential}
                    className="form-check-input"
                    onChange={event => this.setState({isEssential: event.target.checked})}
                    type="checkbox" />
                  Essential
                </label>
            </div>
            </div>

            <input
                type="submit"
                className="btn btn-primary"
                value="Save"
                onClick={event => this.props.onSave(event, this.state)} />
          </form>
        </div>
      </div>
    )
  }
}

