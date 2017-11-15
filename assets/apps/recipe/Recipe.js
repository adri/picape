import React from 'react';
import UnplanRecipe from './UnplanRecipe';
import PlanRecipe from './PlanRecipe';
import Image from '../../components/Image';
import FlipDirectionAware from '../../components/FlipDirectionAware';
import EditRecipeButton from './EditRecipeButton';
import gql from "graphql-tag";

export default function Recipe({recipe, showEdit}) {
  return (
    <div className="card recipe">
      <FlipDirectionAware backside={
          <div>
              <span className="ingredient-list">
              {recipe.ingredients
                  .map(ref => `${ref.ingredient.name} (${ref.quantity})`)
                  .join(', ')
              }
              </span>
              <br />
              {recipe.isPlanned ?
                  <UnplanRecipe recipeId={recipe.id}/>
                  : <PlanRecipe recipeId={recipe.id}/>
              }
              <br />
              {showEdit && <EditRecipeButton recipeId={recipe.id} />}
          </div>
      }>
          <Image className="card-img-top" src={recipe.imageUrl} alt={recipe.title} />
          <div className="card-block">
            <h5 className="card-title">
              {recipe.isPlanned && <i className="check-bar fa fa-check-circle fa-lg fa-fw" />}
              {recipe.title}</h5>
          </div>
      </FlipDirectionAware>
      <style jsx>{`
      .recipe {
        flex-basis: 25%;
        margin-bottom: 0;
        position: relative;
        box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, .1);
      }
      .card-block {
        min-height: auto;
      }
      .card-title {
        margin-top: 0;
        margin-bottom: 0;
        font-size: 16px;
      }
      .check-bar {
        color: green;
      }
      .recipe:hover .card-footer {
        opacity: 1;
        transition: all 0.1s ease-in-out;
      }
      .card-footer {
        position: absolute;
        width: 100%;
        height: 53%;
        opacity: 0;
        bottom: 0;
        background: linear-gradient(rgba(255,255,255,0.0), rgba(255,255,255,1) 55%);
        border-top: 0;
      }
      .recipe .media {
        border-left: 1px solid #d9d5d0;
        border-top: 1px solid #d9d5d0;
        padding-top: 10px;
        padding-bottom: 10px;
      }

      .recipe:hover {
        text-decoration: none;
        box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, .3);
      }

      .recipe.highlighted {
        box-shadow: inset 0 0 25px #ffcca9, inset 0 0 0 1px rgba(0, 0, 0, .1);
      }
      .ingredient-list {
        font-size: 11px;
      }
      `}</style>
    </div>
  );
}

Recipe.fragments = {
    recipe: gql`
      fragment recipe on Recipe {
        id
        title
        imageUrl
        isPlanned
        ingredients {
          quantity
          ingredient {
            id
            name
          }
        }
      }
    `,
};
