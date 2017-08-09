import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../lib/mutateable';

function SyncOrder({ submit, loading }) {
  return (
    <a href="#" onClick={submit} className="">
      <i className={'fa fa-refresh fa-lg fa-fw ' + (loading && 'fa-spin')} />
    </a>
  );
}

const mutation = gql`
  mutation SyncOrder {
    syncOrder {
      id
    }
  }
`;

export default compose(
  graphql(mutation, {
    options: {
      refetchQueries: ['OrderList', 'RecipeList', 'EssentialList'],
    },
  }),
  mutateable(),
)(SyncOrder);
