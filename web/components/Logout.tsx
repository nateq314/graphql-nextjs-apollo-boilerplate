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
      error
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
}

export default Login;
