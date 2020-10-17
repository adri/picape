import * as React from "react";
import { useMutation } from "@apollo/react-hooks";
import { PlusIcon, CheckIcon } from "../Icon";
import {
  PLAN_RECIPE,
  UNPLAN_RECIPE,
  optimisticResponse,
} from "../../operations/planRecipe";

export const PlanRecipe = React.memo(function ({ id, isPlanned }) {
  const [planRecipe] = useMutation(PLAN_RECIPE, { ignoreResults: true });
  const [unplanRecipe] = useMutation(UNPLAN_RECIPE, { ignoreResults: true });

  if (isPlanned) {
    return (
      <CheckIcon
        style={{ margin: 5 }}
        onPress={(e) => {
          e.preventDefault();
          unplanRecipe({
            variables: { recipeId: id },
            optimisticResponse: optimisticResponse("unplanRecipe", id, false),
          });
        }}
      />
    );
  }

  return (
    <PlusIcon
      style={{ margin: 5 }}
      onPress={(e) => {
        e.preventDefault();
        planRecipe({
          variables: { recipeId: id },
          optimisticResponse: optimisticResponse("planRecipe", id, true),
        });
      }}
    />
  );
});
