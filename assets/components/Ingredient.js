import OrderIngredient from './ingredient/OrderIngredient';

export default ({ id, name, imageUrl, isPlanned, unitQuantity, orderedQuantity }) =>
  <div className={'ingredient align-bottom br-1 ' + (isPlanned && 'highlighted')}>
    <div className="media pl-2 pt-2">
      <div className="d-flex mr-3 mt-0 ingredient-image-wrapper">
        <img src={imageUrl} className="ingredient-image rounded" alt={name} />
      </div>
      <div className="media-body mb-2">
        <div className="ingredient-name mt-0 mb-0">
          {name}
        </div>
        <div className="ingredient-unit-quantity">
          {unitQuantity}&nbsp;
        </div>
      </div>
      <div className="d-flex mr-3 mt-0 ingredient-quantity-wrapper">
        <OrderIngredient id={id} quantity={orderedQuantity} />
      </div>
    </div>
    <style jsx>{`
      .ingredient {
        height: 100%;
        box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, .1);
      }

      .ingredient:not(:first-child) {
        border-left: 1px solid #d9d5d0;
      }

      .ingredient:nth-child(n + 3) {
        border-top: 1px solid #d9d5d0;
      }

      .ingredient:hover {
        text-decoration: none;
        box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, .1);
      }

      .ingredient.highlighted {
        box-shadow: inset 0 0 25px #ffcca9, inset 0 0 0 1px rgba(0, 0, 0, .1);
      }

      .ingredient-name {
        color: #333;
      }

      .ingredient-image-wrapper {
        height: 32px;
        width: 32px;
      }

      .ingredient-quantity-wrapper {
        height: 16px;
        width: 16px;
      }

      .ingredient-image {
        object-fit: contain;
        max-height: 32px;
        max-width: 32px;
        margin: 0 auto;
      }

      .ingredient-unit-quantity {
        font-size: 80%;
        color: #bbb4af;
      }
    `}</style>
  </div>;
