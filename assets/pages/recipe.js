import Layout from "../components/Layout";
import EditRecipe from "../apps/recipe/EditRecipe";
import withData from "../lib/withData";

export default withData(({ data, url: { query: { id } } }) => (
  <Layout title="Edit recipe">
    <EditRecipe recipeId={id} />
  </Layout>
));
