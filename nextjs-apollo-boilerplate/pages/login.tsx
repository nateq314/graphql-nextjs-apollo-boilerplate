import { ApolloClient, NormalizedCacheObject } from "apollo-boost";
import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import firebase from "../other/firebase";
import { Mutation, Query, withApollo } from "react-apollo";
import gql from "graphql-tag";

import GlobalStyles from "../components/GlobalStyles";

interface LoginProps {
  client: ApolloClient<NormalizedCacheObject>;
}

interface LoginResponse {
  success: boolean;
  message?: string;
  user?: firebase.User;
}

const StyledLogin = styled.div``;

const LOGIN = gql`
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

const LOGOUT = gql`
  mutation {
    logout {
      success
      message
    }
  }
`;

const HELLO = gql`
  {
    hello
  }
`;

function useAuthentication(
  client: ApolloClient<NormalizedCacheObject>,
  setUser: React.Dispatch<React.SetStateAction<firebase.User | null>>
) {
  useEffect(() => {
    client
      .mutate({
        mutation: LOGIN
      })
      .then(({ data: { login: { user } } }) => {
        if (user) {
          setUser(user);
        }
      });
  }, []);
}

function Login({ client }: LoginProps) {
  const [user, setUser] = useState<firebase.User | null>(
    firebase.auth().currentUser
  );
  useAuthentication(client, setUser);
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);

  return (
    <Mutation mutation={LOGIN}>
      {(login) => (
        <StyledLogin>
          <GlobalStyles />
          <h1>Login</h1>
          {user ? (
            <Mutation mutation={LOGOUT}>
              {(logout) => (
                <>
                  <h2>Welcome, {user.email}</h2>
                  <h3>
                    <Query query={HELLO}>
                      {({ loading, error, data }) => {
                        if (loading) return "Loading...";
                        if (error) return `Error! ${error.message}`;
                        return data.hello;
                      }}
                    </Query>
                  </h3>
                  <button
                    onClick={async () => {
                      setUser(null);
                      await firebase.auth().signOut();
                      await logout();
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
                  const response = await login({
                    variables: { idToken }
                  });
                  if (response) {
                    const { success } = response.data.login as LoginResponse;
                    if (success) {
                      setUser(user);
                      console.log("Login success, cookie is now set.");
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
      )}
    </Mutation>
  );
}

export default withApollo(Login);
