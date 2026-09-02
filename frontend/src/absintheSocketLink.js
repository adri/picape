import { ApolloLink, Observable } from '@apollo/client';
import { print } from 'graphql';
import { Socket as PhoenixSocket } from 'phoenix';

// Apollo link speaking Absinthe's Phoenix channel protocol, replacing the
// abandoned @absinthe/socket-apollo-link. That package was last published in
// 2022 and builds its link on apollo-link 1.x, which no longer survives
// Metro's bundling. The protocol itself is small and stable:
//
//   join    "__absinthe__:control"
//   push    "doc"          {query, variables}
//             -> ok  {data, errors}      for queries and mutations
//             -> ok  {subscriptionId}    for subscriptions
//   event   "subscription:data"  {subscriptionId, result}
//   push    "unsubscribe"  {subscriptionId}
//
// See absinthe_phoenix's Absinthe.Phoenix.Channel and Absinthe.Phoenix.Endpoint.
const CONTROL_TOPIC = '__absinthe__:control';
const DATA_EVENT = 'subscription:data';

function describe(payload) {
  if (!payload) return 'unknown error';
  if (typeof payload === 'string') return payload;
  if (Array.isArray(payload.errors)) return payload.errors.map((e) => e.message).join(', ');
  return payload.error || payload.reason || JSON.stringify(payload);
}

export function createAbsintheSocketLink(endpoint, socketOptions) {
  const socket = new PhoenixSocket(endpoint, socketOptions);
  // Absinthe's subscription id -> {doc, observer}. The document is kept so a
  // subscription can be re-established after a reconnect, which issues a new id.
  const subscriptions = new Map();
  let channel = null;
  let joined = null;

  // Registered once per link. Registering it inside join() would add a second
  // listener on every retry after a failed join, and phoenix invokes every
  // listener it holds, so one timed-out join would double every later result.
  //
  // Subscription results arrive tagged with the subscription's own topic
  // rather than the control channel's, so a channel-level listener never
  // matches them. Watch the socket instead, the way @absinthe/socket did.
  socket.onMessage(({ event, payload }) => {
    if (event !== DATA_EVENT || !payload) return;
    const entry = subscriptions.get(payload.subscriptionId);
    if (entry) entry.observer.next(payload.result);
  });

  // Absinthe discards a subscription when its channel process exits, and
  // phoenix rejoins the channel silently after a reconnect. Without this every
  // subscription goes quiet for good, with no error for Apollo to surface.
  // Pushes are buffered until the rejoin lands, so this can be sent right away.
  socket.onOpen(() => {
    if (!channel) return;

    for (const entry of [...subscriptions.values()]) {
      channel.push('doc', entry.doc).receive('ok', (payload) => {
        if (!payload || !payload.subscriptionId) return;
        subscriptions.delete(entry.id);
        entry.id = payload.subscriptionId;
        subscriptions.set(entry.id, entry);
      });
    }
  });

  function join() {
    if (joined) return joined;

    socket.connect();

    channel = socket.channel(CONTROL_TOPIC, {});

    joined = new Promise((resolve, reject) => {
      channel
        .join()
        .receive('ok', () => resolve(channel))
        .receive('error', (payload) => reject(new Error(describe(payload))))
        .receive('timeout', () => reject(new Error(`Timed out joining ${CONTROL_TOPIC}`)));
    }).catch((error) => {
      // Let the next operation retry instead of caching the rejection forever.
      joined = null;
      channel = null;
      throw error;
    });

    return joined;
  }

  return new ApolloLink(
    (operation) =>
      new Observable((observer) => {
        let cancelled = false;
        // Held by reference rather than by id, because a reconnect replaces the
        // id in place and the teardown below has to unsubscribe the current one.
        let entry = null;

        const doc = {
          query: print(operation.query),
          variables: operation.variables || {},
        };

        join()
          .then((control) => {
            if (cancelled) return;

            control
              .push('doc', doc)
              .receive('ok', (payload) => {
                if (cancelled) return;

                if (payload && payload.subscriptionId) {
                  entry = { id: payload.subscriptionId, doc, observer };
                  subscriptions.set(entry.id, entry);
                  return; // stays open until unsubscribed
                }

                observer.next(payload);
                observer.complete();
              })
              .receive('error', (payload) => {
                if (cancelled) return;

                // GraphQL errors belong in the result so Apollo's error link
                // sees them as graphQLErrors; anything else is a transport fault.
                if (payload && payload.errors) {
                  observer.next(payload);
                  observer.complete();
                } else {
                  observer.error(new Error(describe(payload)));
                }
              })
              .receive('timeout', () => {
                if (!cancelled) observer.error(new Error('Timed out running document'));
              });
          })
          .catch((error) => {
            if (!cancelled) observer.error(error);
          });

        return () => {
          cancelled = true;
          if (entry) {
            subscriptions.delete(entry.id);
            if (channel) channel.push('unsubscribe', { subscriptionId: entry.id });
            entry = null;
          }
        };
      })
  );
}
