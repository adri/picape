import Layout from '../components/layout';
import EditRecipe from '../components/recipe/EditRecipe'

export default ({ url: { query: { id } } }) => (
  <Layout title="Edit recipe">
    <div className="container">
      <EditRecipe id={id} />
    </div>
  </Layout>
)
