import OrderIngredient from "../apps/ingredient/OrderIngredient";
import BuyIngredient from "../apps/ingredient/BuyIngredient";
import gql from "graphql-tag";
import Dropdown from "./Dropdown";
import Link from "next/link";

export default class Ingredient extends React.Component {
  state = {
    hovered: false,
  };

  render() {
    const {
      id,
      name,
      imageUrl,
      bigImage,
      isBought,
      isPlanned,
      plannedRecipes,
      unitQuantity,
      orderedQuantity,
      showBuy,
      showEdit,
      showOrder,
      season,
    } = this.props;
    const { hovered } = this.state;

    return (
      <div
        className={
          "ingredient align-bottom br-1 " +
          (isPlanned && " highlighted ") +
          (bigImage && " big-image") +
          (showBuy && isBought && " is-bought")
        }
        onMouseEnter={event => this.setState({ hovered: true })}
        onMouseLeave={event => this.setState({ hovered: false })}
      >
        <div className="media pl-2 pt-2">
          <div className="d-flex mr-3 mt-0 ingredient-image-wrapper">
            <img src={imageUrl} className="ingredient-image rounded" alt={name} />
          </div>
          <div className="media-body mb-2">
            <div className="ingredient-name mt-0 mb-0">
              {showEdit && (
                <Link href={`/ingredient?id=${id}`}>
                  <a>
                    {name} {season && season.label}
                  </a>
                </Link>
              )}
              {!showEdit && (
                <Dropdown link={`${name} ${season ? season.label : ""}`}>
                  {isPlanned && (
                    <div>
                      <h6 className="dropdown-header">Planned recipes</h6>
                      {Array.isArray(plannedRecipes) &&
                        plannedRecipes.map(({ quantity, recipe }) => (
                          <Link key={recipe.id} href={`/recipe?id=${recipe.id}`}>
                            <a className="dropdown-item" href="#">
                              {quantity} {recipe.title}
                            </a>
                          </Link>
                        ))}
                      <div className="dropdown-divider" />
                    </div>
                  )}
                  <Link href={`/ingredient?id=${id}`}>
                    <a className="dropdown-item">Edit</a>
                  </Link>
                </Dropdown>
              )}
            </div>
            <div className="ingredient-unit-quantity">{unitQuantity}&nbsp;</div>
          </div>
          <div className="d-flex mr-3 mt-0 ingredient-quantity-wrapper">
            {typeof orderedQuantity !== "undefined" && (
              <OrderIngredient id={id} hovered={showOrder && hovered} quantity={orderedQuantity} />
            )}
          </div>
          {showBuy && <BuyIngredient isBought={isBought} id={id} />}
        </div>
        <style jsx>{`
          .ingredient {
            height: 100%;
            box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, 0.1);
          }

          .ingredient .media {
            border-left: 1px solid #d9d5d0;
            border-top: 1px solid #d9d5d0;
          }

          .ingredient:hover {
            text-decoration: none;
            box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, 0.1);
          }

          .ingredient.highlighted {
            box-shadow: inset 0 0 25px #ffcca9, inset 0 0 0 1px rgba(0, 0, 0, 0.1);
          }

          .ingredient.is-bought {
            position: relative;
            opacity: 0.7;
          }

          .ingredient.is-bought:before {
            position: absolute;
            content: "";
            left: 0;
            top: 35%;
            right: 0;
            border-top: 4px solid #d0d0d0;

            animation: animate 0.3s ease-in;
          }

          @keyframes animate {
            0% {
              left: 100%;
            }
            100% {
              left: 0;
            }
          }

          .ingredient.is-bought {
            box-shadow: inset 0 0 60px #d3d3d3, inset 0 0 0 1px rgba(0, 0, 0, 0.1);
          }

          .ingredient.is-bought img {
            filter: gray; /* IE6-9 */
            -webkit-filter: grayscale(1); /* Google Chrome, Safari 6+ & Opera 15+ */
            filter: grayscale(1); /* Microsoft Edge and Firefox 35+ */
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

          .big-image .ingredient-image {
            max-height: 160px;
            max-width: 160px;
          }
          .big-image .ingredient-image-wrapper {
            height: 160px;
            width: 160px;
          }

          .ingredient-unit-quantity {
            font-size: 80%;
            color: #bbb4af;
          }
        `}</style>
      </div>
    );
  }
}

Ingredient.defaultProps = {
  showOrder: true,
};

Ingredient.fragments = {
  ingredient: gql`
    fragment ingredient on Ingredient {
      id
      name
      imageUrl
      isBought
      isPlanned(inShoppingList: $inShoppingList)
      unitQuantity
      orderedQuantity(inShoppingList: $inShoppingList)
      plannedRecipes(inShoppingList: $inShoppingList) {
        quantity
        recipe {
          id
          title
        }
      }
      season {
        label
      }
      tags {
        id
        name
      }
    }
  `,
};
