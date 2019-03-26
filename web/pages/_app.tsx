import * as React from "react";
import App, { Container, AppProps } from "next/app";
import { ApolloProvider } from "react-apollo";
import withApolloClient from "../other/with-apollo-client";
import { ApolloClient, NormalizedCacheObject } from "apollo-boost";
import GlobalStyles from "../components/GlobalStyles";

export interface StoredUserData {
  email: string;
  uid: string;
  // actually a lot more than this but for now this is all we want to deal with
}

interface MyAppProps extends AppProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

class MyApp extends App<MyAppProps> {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <Container>
        <GlobalStyles />
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApolloClient(MyApp);
