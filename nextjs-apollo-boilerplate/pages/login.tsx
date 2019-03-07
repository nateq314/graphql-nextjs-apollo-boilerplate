import { ApolloClient, NormalizedCacheObject } from "apollo-boost";
import React, { useRef } from "react";
import styled from "styled-components";
import firebase from "../other/firebase";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import * as Cookies from "cookies-js";

interface LoginProps {
  client: ApolloClient<NormalizedCacheObject>;
  user?: firebase.User;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: firebase.User;
}

const StyledLogin = styled.div``;

export const LOGIN = `
  mutation Login($idToken: String) {
    login(idToken: $idToken) {
      success
      message
      user {
        email
        uid
      }
    }
  }
`;

const LOGOUT = `
  mutation {
    logout {
      success
      message
    }
  }
`;

const HELLO = `
  {
    hello
  }
`;

function Login({ user }: LoginProps) {
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  return (
    <Mutation mutation={gql(LOGIN)}>
      {(login) => {
        return (
          <StyledLogin>
            <h1>Login</h1>
            {user ? (
              <Mutation mutation={gql(LOGOUT)}>
                {(logout) => (
                  <>
                    <h2>Welcome, {user.email}</h2>
                    <h3>
                      <Query query={gql(HELLO)}>
                        {({ loading, error, data }) => {
                          if (loading) return "Loading...";
                          if (error) return `Error! ${error.message}`;
                          return data.hello;
                        }}
                      </Query>
                    </h3>
                    <button
                      onClick={async () => {
                        await firebase.auth().signOut();
                        await logout();
                        location.assign(`${location.href}?logout=true`);
                      }}
                    >
                      Log Out
                    </button>
                  </>
                )}
              </Mutation>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const {
                    user
                  } = await firebase
                    .auth()
                    .signInWithEmailAndPassword(
                      (email.current as HTMLInputElement).value,
                      (password.current as HTMLInputElement).value
                    );
                  if (user) {
                    const idToken = await user.getIdToken();
                    // Only purpose of this call is to set the session cookie, not to get the user object
                    const response = await login({
                      variables: { idToken }
                    });
                    if (response) {
                      const { success } = response.data.login as LoginResponse;
                      if (success) {
                        // Then we know the API cookie has been set.
                        // Set a temporary cookie (expires in 1 sec), just enough for sth to be received by the server
                        // and used for login.
                        // TODO: look into other options ('secure', 'domain', etc.), see if any are applicable
                        Cookies.set("tempToken", idToken, { expires: 1 });
                        // * Redirect to this page (login) with said cookie
                        location.assign("/");
                      }
                    }
                  }
                }}
              >
                <div>
                  <input id="email" ref={email} />
                </div>
                <div>
                  <input type="password" id="password" ref={password} />
                </div>
                <button type="submit">Log In</button>
              </form>
            )}
          </StyledLogin>
        );
      }}
    </Mutation>
  );
}

export default Login;
