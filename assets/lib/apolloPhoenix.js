import {ApolloLink} from "apollo-link";
import {cancel, send, toObservable} from "@jumpn/absinthe-phoenix-socket";
import {compose} from "flow-static-land/lib/Fun";
import {print} from "graphql/language/printer";

const getRequest = ({ query, variables }) => ({
    operation: print(query),
    variables
});

const notifierToObservable = (absintheSocket, onError, onStart) => notifier =>
    toObservable(absintheSocket, notifier, {
        onError,
        onStart,
        unsubscribe: () => { cancel(absintheSocket, notifier); }
});

/**
 * Creates a terminating ApolloLink to request operations using given
 * AbsintheSocket instance
 */
export const createAbsintheSocketLink = (absintheSocket, onError, onStart) =>
  new ApolloLink(
    compose(
      notifierToObservable(absintheSocket, onError, onStart),
      request => send(absintheSocket, request),
      getRequest
    )
);

