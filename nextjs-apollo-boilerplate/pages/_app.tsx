import * as React from "react";
import App, { Container, AppProps } from "next/app";
import { ApolloProvider, Query } from "react-apollo";
import withApolloClient from "../other/with-apollo-client";
import { ApolloClient, NormalizedCacheObject } from "apollo-boost";
import GlobalStyles from "../components/GlobalStyles";
import gql from "graphql-tag";

interface MyAppProps extends AppProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

const CURRENT_USER_QUERY = gql`
  query {
    currentUser {
      uid
      email
    }
  }
`;

interface CurrentUserData {
  data?: {
    currentUser: firebase.User;
  };
}

class MyApp extends App<MyAppProps> {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <Container>
        <GlobalStyles />
        <ApolloProvider client={apolloClient}>
          {/* Below query will pull from cache, which should already be populated
          with the current user on page load (or reload). So this should never
          result in a query from the client. In reality the currentUser() query
          is only ever called server-side. */}
          <Query query={CURRENT_USER_QUERY}>
            {({ data }: CurrentUserData) => {
              return (
                <Component {...pageProps} user={data && data.currentUser} />
              );
            }}
          </Query>
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApolloClient(MyApp);
