import { gql, graphql } from 'react-apollo';
import { withState, compose } from 'recompose';
import ErrorMessage from '../components/ErrorMessage';
import Ingredient from '../components/Ingredient';
import Loading from '../components/Loading';
import TagSelection from '../components/TagSelection';

const enhance = compose(
    withState('selectedTags', 'changeTags', []),
);

function EssentialList({ data: { loading, error, essentials }, selectedTags, changeTags }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading && !essentials) return <Loading />;

  return (
    <div>
      <h5 className="text-white">Essentials</h5>
      <div className="card">
        <TagSelection allCount={essentials.totalCount} tags={essentials.tags} selectedTags={selectedTags} onChange={changeTags} />
        <div className="row no-gutters">
          {essentials && essentials.edges.map(edge =>
            <div key={edge.node.id} className="col-sm-3">
              <Ingredient {...edge.node} />
            </div>,
          )}
        </div>
      </div>
    </div>
  );
}

const recipesQuery = gql`
  query EssentialList($tagIds: [ID]) {
    essentials: ingredients(
      first: 1000,
      filter: {
        essential: true
        tagIds: $tagIds
      }
    ) {
      tags {
        id
        name
        count
      }
      totalCount
      edges {
        node {
          id
          name
          imageUrl
          isPlanned
          unitQuantity
          orderedQuantity
          plannedRecipes {
            quantity
            recipe {
                id
                title
            }
          }
        }
      }
    }
  }
`;

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (PostList)
export default enhance(graphql(recipesQuery, {
  options: ({ selectedTags }) => ({
    variables: { tagIds: selectedTags },
  }),
  props: ({ data }) => ({
    data,
  }),
})(EssentialList));
