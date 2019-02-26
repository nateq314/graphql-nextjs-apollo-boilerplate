import * as React from "react";
import App, { Container, AppProps } from "next/app";
import { ApolloProvider } from "react-apollo";
import withApolloClient from "../other/with-apollo-client";
import { ApolloClient, NormalizedCacheObject } from "apollo-boost";

interface MyAppProps extends AppProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
}

class MyApp extends App<MyAppProps> {
  render() {
    const { Component, pageProps, apolloClient } = this.props;
    return (
      <Container>
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApolloClient(MyApp);
