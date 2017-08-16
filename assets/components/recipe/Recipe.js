import React from 'react';
import UnplanRecipe from './UnplanRecipe';
import PlanRecipe from './PlanRecipe';
import EditRecipeButton from './EditRecipeButton';

export default function Recipe({recipe, showEdit}) {
  return (
    <div className="recipe">
      <div className="media w-100">
        <div className="d-flex mr-3">
          <img src="" className="rounded" alt="" />
        </div>
        <div className="media-body mb-2">
          <div className="mt-0 mb-0">
            <h5>{recipe.title}</h5>
          </div>
        </div>
        <div className="d-flex mr-3 align-self-center">
          <div className="mr-2">
            {showEdit && <EditRecipeButton recipeId={recipe.id} />}
          </div>
          {recipe.isPlanned ?
            <UnplanRecipe recipeId={recipe.id} /> :
            <PlanRecipe recipeId={recipe.id} />}
        </div>
      </div>
      <style jsx>{`
      .recipe {
        box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, .1);
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
      `}</style>
    </div>
  );
}

