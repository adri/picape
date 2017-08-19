import React from 'react';
import UnplanRecipe from './UnplanRecipe';
import PlanRecipe from './PlanRecipe';
import Image from '../Image';
import EditRecipeButton from './EditRecipeButton';

export default function Recipe({recipe, showEdit}) {
  return (
    <div className="card recipe">
      <Image className="card-img-top" src={recipe.imageUrl} alt={recipe.title} />
      <div className="card-block">
        <h5 className="card-title">{recipe.title}</h5>
        {showEdit && <EditRecipeButton recipeId={recipe.id} />}
        {/*<p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This card has even longer content than the first to show that equal height action.</p>*/}
      </div>
      <div className="card-footer text-center">
        {recipe.isPlanned ?
          <UnplanRecipe recipeId={recipe.id} /> :
          <PlanRecipe recipeId={recipe.id} />}
      </div>

      <style jsx>{`
      .recipe {
        margin-bottom: 0;
        box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, .1);
      }
      .card-block {
        min-height: auto;
      }
      .card-title {
        margin-top: 0;
        font-size: 16px;
      }
      .card-footer {
        background-color: transparent;
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

