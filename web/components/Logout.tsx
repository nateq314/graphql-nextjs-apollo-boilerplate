import React from "react";
import styled from "styled-components";
import firebase from "../other/firebase";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import { FETCH_CURRENT_USER } from "../other/queries";

const StyledLogout = styled.span``;

const LOGOUT = `
  mutation {
    logout {
      error
    }
  }
`;

function Login() {
  return (
    <Query query={FETCH_CURRENT_USER}>
      {({ data }) => {
        const user = data ? data.current_user : null;
        return (
          <StyledLogout>
            {user ? (
              <Mutation mutation={gql(LOGOUT)}>
                {(logout) => (
                  <button
                    onClick={async () => {
                      await firebase.auth().signOut();
                      const response = await logout();
                      console.log("logout response:", response);
                      location.assign(`${location.href}?logout=true`);
                    }}
                  >
                    Log Out
                  </button>
                )}
              </Mutation>
            ) : null}
          </StyledLogout>
        );
      }}
    </Query>
  );
}

export default Login;
