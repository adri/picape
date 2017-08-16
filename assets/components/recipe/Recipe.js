import React from 'react';
import UnplanRecipe from './UnplanRecipe';
import PlanRecipe from './PlanRecipe';
import EditRecipeButton from './EditRecipeButton';

export default function Recipe({recipe}) {
  return (
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
          <EditRecipeButton recipeId={recipe.id} />
        </div>
        {recipe.isPlanned ?
          <UnplanRecipe recipeId={recipe.id} /> :
          <PlanRecipe recipeId={recipe.id} />}
      </div>
    </div>
  );
}

