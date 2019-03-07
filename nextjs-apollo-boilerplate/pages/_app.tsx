import * as React from "react";
import App, { Container, AppProps } from "next/app";
import { ApolloProvider } from "react-apollo";
import withApolloClient from "../other/with-apollo-client";
import { ApolloClient, NormalizedCacheObject } from "apollo-boost";
import GlobalStyles from "../components/GlobalStyles";

interface MyAppProps extends AppProps {
  apolloClient: ApolloClient<NormalizedCacheObject>;
  user?: firebase.User;
}

class MyApp extends App<MyAppProps> {
  render() {
    const { Component, pageProps, apolloClient, user } = this.props;
    return (
      <Container>
        <GlobalStyles />
        <ApolloProvider client={apolloClient}>
          <Component {...pageProps} user={user} />
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApolloClient(MyApp);
