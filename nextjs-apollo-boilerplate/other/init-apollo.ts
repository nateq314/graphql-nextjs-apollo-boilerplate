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

export const LINK_URI =
  "https://us-central1-focus-champion-231019.cloudfunctions.net/api/graphql";

function create(initialState: any, linkOptions: HttpLink.Options) {
  const httpLink = new HttpLink({
    uri: LINK_URI,
    credentials: "include",
    ...linkOptions
  });

  return new ApolloClient({
    connectToDevTools: isBrowser,
    ssrMode: !isBrowser,
    link: httpLink,
    cache: new InMemoryCache().restore(initialState || {})
  });
}

export default function initApollo(
  initialState?: any,
  linkOptions: HttpLink.Options = {}
) {
  // Make sure to create a new client for every server-side request so that data
  // isn't shared between connections (which would be bad)
  if (!isBrowser) {
    return create(initialState, linkOptions);
  }

  // Reuse client on the client-side
  if (!apolloClient) {
    apolloClient = create(initialState, linkOptions);
  }
  return apolloClient;
}
