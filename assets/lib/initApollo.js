import {ApolloClient} from 'apollo-client'
import {InMemoryCache} from 'apollo-cache-inmemory'
import fetch from 'isomorphic-fetch'
import * as AbsintheSocket from "@absinthe/socket";
import {createAbsintheSocketLink} from "@absinthe/socket-apollo-link";
import {createHttpLink} from 'apollo-link-http';
import {Socket as PhoenixSocket} from "phoenix";

let apolloClient = null

// Polyfill fetch() on the server (used by apollo-client)
if (!process.browser) {
    global.fetch = fetch
}

function createLink() {
    if (process.browser) {
        return createAbsintheSocketLink(AbsintheSocket.create(
            new PhoenixSocket("ws://localhost:4000/socket")
        ));
    }

    return createHttpLink({
        uri: 'http://' + BACKEND_URL + '/graphql',
        credentials: 'same-origin'
    })
}

function create(initialState) {
    return new ApolloClient({
        connectToDevTools: process.browser,
        ssrMode: !process.browser, // Disables forceFetch on the server (so queries are only run once)
        link: createLink(),
        cache: new InMemoryCache().restore(initialState || {}),
    })
}

export default function initApollo(initialState) {
    // Make sure to create a new client for every server-side request so that data
    // isn't shared between connections (which would be bad)
    if (!process.browser) {
        return create(initialState)
    }

    // Reuse client on the client-side
    if (!apolloClient) {
        apolloClient = create(initialState)
    }

    return apolloClient
}
