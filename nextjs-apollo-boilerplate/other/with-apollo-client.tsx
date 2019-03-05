import React from "react";
import initApollo from "./init-apollo";
import { NextAppContext } from "next/app";
import Head from "next/head";
import { getDataFromTree } from "react-apollo";
import { ApolloClient, NormalizedCacheObject } from "apollo-boost";

interface ApolloProps {
  apolloState: NormalizedCacheObject;
}

// TODO: type 'App' below
export default (App: any) => {
  return class Apollo extends React.Component<ApolloProps> {
    private apolloClient: ApolloClient<NormalizedCacheObject>;

    static displayName = "withApollo(App)";

    static async getInitialProps(ctx: NextAppContext) {
      console.log("<App /> getInitialProps()");
      const { Component, router } = ctx;
      let appProps = {};
      if (App.getInitialProps) {
        appProps = await App.getInitialProps(ctx);
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      const apollo = initApollo();
      // If server-side, not in browser
      if (typeof window === "undefined") {
        try {
          console.log("about to call getDataFromTree()");
          // Run all GraphQL queries
          await getDataFromTree(
            <App
              {...appProps}
              Component={Component}
              router={router}
              apolloClient={apollo}
            />
          );
          console.log("finished calling it");
        } catch (error) {
          // Prevent Apollo Client GraphQL errors from crashing SSR.
          // Handle them in components via the data.error prop:
          // https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-query-data-error
          console.error("Error while running `getDataFromTree`", error);
        }

        // getDataFromTree does not call componentWillUnmount
        // head side effect therefore need to be cleared manually
        // TODO: what does this do?
        Head.rewind();
      }

      // Extract query data from the Apollo store
      const apolloState = apollo.cache.extract();

      return {
        ...appProps,
        apolloState
      };
    }

    constructor(props: ApolloProps) {
      super(props);
      this.apolloClient = initApollo(props.apolloState);
    }

    render() {
      return <App {...this.props} apolloClient={this.apolloClient} />;
    }
  };
};
