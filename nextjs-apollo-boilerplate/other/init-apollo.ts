import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  NormalizedCacheObject
  // ApolloLink,
  // NextLink,
  // concat
} from "apollo-boost";
import fetch from "isomorphic-unfetch";

let apolloClient: ApolloClient<NormalizedCacheObject>;
const isBrowser = typeof window !== "undefined";

// Polyfill fetch() on the server (used by apollo-client)
if (!isBrowser) {
  (global as any).fetch = fetch;
}

const httpLink = new HttpLink({
  uri:
    "https://us-central1-focus-champion-231019.cloudfunctions.net/api/graphql",
  credentials: "include"
});

function create(initialState: any) {
  return new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser,
    link: httpLink,
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApollo(initialState?: any) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!isBrowser) {
    return create(initialState);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState);
  }
  return apolloClient;
}
