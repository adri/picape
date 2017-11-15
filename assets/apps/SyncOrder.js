import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import mutateable from '../lib/mutateable';

function SyncOrder({ submit, loading }) {
  return (
    <a href="#" onClick={submit} className="text-white">
      <i className={'fa fa-refresh fa-lg fa-fw ' + (loading && 'fa-spin')} />
    </a>
  );
}

const mutation = gql`
  mutation SyncOrder($refresh: Boolean) {
    syncOrder(refresh: $refresh) {
      id
      items {
        ingredient {
          id
          orderedQuantity
        }
      }
    }
  }
`;

export default compose(
  graphql(mutation, {
    options: {
      variables: { refresh: true },
      refetchQueries: ['OrderList'],
    },
  }),
  mutateable(),
)(SyncOrder);
