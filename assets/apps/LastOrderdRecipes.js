import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "../components/ErrorMessage";
import Loading from "../components/Loading";
import Dropdown from "../components/Dropdown";
import Link from "next/link";

function LastOrderedRecipes({ data: { loading, error, recipes } }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <Loading />;

  return (
    <Dropdown link={"Last ordered recipes"}>
      {Array.isArray(recipes) &&
        recipes.map(recipe => (
          <Link key={recipe.id} href={`/recipe?id=${recipe.id}`}>
            <a className="dropdown-item" href="#">
              {recipe.title}
            </a>
          </Link>
        ))}
      <style jsx>{`
        .card-group {
          margin-bottom: 15px;
        }
      `}</style>
    </Dropdown>
  );
}

const recipesQuery = gql`
  query LastOrderedRecipes {
    recipes: lastOrderedRecipes {
      id
      title
    }
  }
`;

export default graphql(recipesQuery)(LastOrderedRecipes);
