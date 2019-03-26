import React from "react";
import initApollo from "./init-apollo";
import { NextAppContext } from "next/app";
import { NextContext } from "next";
import Head from "next/head";
import { getDataFromTree } from "react-apollo";
import { ApolloClient, NormalizedCacheObject } from "apollo-boost";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import * as api from "./api";
import { LOGIN } from "../components/Login";
import * as http from "http";
import { FETCH_CURRENT_USER } from "./queries";
import { StoredUserData } from "../pages/_app";

interface ApolloProps {
  apolloState: NormalizedCacheObject;
}

async function autoLogin(ctx: NextContext) {
  // check for the temporary cookie. If present, extract idToken, delete cookie,
  // and set a new httpOnly one.
  const { session, tempToken } = parseCookies(ctx);
  // no need to delete the cookie since it only had a lifespan of 1 sec.
  if (tempToken) {
    // User just logged in via email/password and page reloaded. Temporary token received.
    // TODO: try to reproduce this. If unable to, remove.
    if (tempToken === "undefined") {
      destroyCookie(ctx, "tempToken", {});
      return {};
    }
    // fetch user data from API using the idToken (`login` mutation)
    const response = await api.post({
      query: LOGIN.replace(/\s+/, " "),
      variables: { idToken: tempToken }
    });
    const { session } = response;
    const { error, user } = response.data.login;
    if (error) {
      console.error(error);
      return {};
    }
    // Set an httpOnly cookie. From now on (at least while the cookie is valid) this will
    // be sent by the client on all requests for pages. Using this cookie, we can perform
    // auto-login per below.
    setCookie(ctx, "session", session, {
      maxAge: 14 * 24 * 60 * 60,
      httpOnly: true,
      // TODO: set 'secure' to true
      secure: false
    });
    // return user data as props
    return { user, session };
  } else if (session) {
    // User is re-visiting the site. Get the user info. No need to set cookie as it already exists.
    // fetch user data from API using the session (`login` mutation)
    const response = await api.post({
      query: LOGIN.replace(/\s+/, " "),
      variables: { session }
    });
    const { user, error } = response.data.login;
    if (error) {
      console.error(error);
      destroyCookie(ctx, "session", {});
      return {};
    } else return { user, session };
  }
  return {};
}

// TODO: type 'App' below
export default (App: any) => {
  return class Apollo extends React.Component<ApolloProps> {
    private apolloClient: ApolloClient<NormalizedCacheObject>;

    static displayName = "withApollo(App)";

    static async getInitialProps(appCtx: NextAppContext) {
      const { Component, router, ctx } = appCtx;
      let appProps = {};
      if (App.getInitialProps) {
        appProps = await App.getInitialProps(appCtx);
      }

      // Run all GraphQL queries in the component tree
      // and extract the resulting data
      let apollo: ApolloClient<NormalizedCacheObject> | undefined;
      let user: StoredUserData | undefined;
      if (typeof window === "undefined") {
        // SERVER SIDE
        if (ctx.query.logout === "true") {
          // logout. Instead of sending an invalid idToken to the backend
          // only to have it return an error, just remove the cookie now
          // and forego the whole 'attempt to auto-login' process.
          destroyCookie(ctx, "session", {});
          const response = (ctx as NextContext<
            Record<string, string | string[] | undefined>
          >).res as http.ServerResponse;
          response.writeHead(302, {
            Location: ctx.pathname
          });
          response.end();
        } else {
          const autoLoginResponse = await autoLogin(ctx);
          user = autoLoginResponse.user;
          const { session } = autoLoginResponse;
          // for the purposes of running getDataFromTree, send token as a header
          apollo = initApollo({}, { headers: { session } });
          try {
            // Run all GraphQL queries
            await getDataFromTree(
              <App
                {...appProps}
                Component={Component}
                router={router}
                apolloClient={apollo}
              />
            );
            apollo.writeQuery({
              query: FETCH_CURRENT_USER,
              data: {
                current_user: user
                  ? {
                      ...user,
                      id: user.uid,
                      __typename: "User"
                    }
                  : null
              }
            });
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
      }

      // Extract query data from the Apollo store
      // On the client side, initApollo() below will return the SAME Apollo
      // Client object over repeated calls, to preserve state.
      if (!apollo) apollo = initApollo();
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
