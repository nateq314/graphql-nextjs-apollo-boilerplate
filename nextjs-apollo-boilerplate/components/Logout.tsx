import React from "react";
import styled from "styled-components";
import firebase from "../other/firebase";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";

interface LogoutProps {
  user?: firebase.User;
}

const StyledLogout = styled.div``;

const LOGOUT = `
  mutation {
    logout {
      success
      message
    }
  }
`;

function Login({ user }: LogoutProps) {
  return (
    <StyledLogout>
      {user ? (
        <Mutation mutation={gql(LOGOUT)}>
          {(logout) => (
            <button
              onClick={async () => {
                await firebase.auth().signOut();
                await logout();
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
}

export default Login;
