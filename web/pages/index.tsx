import React from "react";
import styled from "styled-components";
import { Query } from "react-apollo";
import Login from "../components/Login";
import AppBar from "../components/AppBar";
import { FETCH_CURRENT_USER, LISTS_QUERY } from "../other/queries";

const StyledHome = styled.div``;

function Home() {
  return (
    <Query query={FETCH_CURRENT_USER}>
      {({ data }) => {
        const user = data ? data.current_user : null;
        return (
          <StyledHome>
            <AppBar />
            {user ? (
              <Query query={LISTS_QUERY}>
                {({ loading, error, data }) => {
                  if (loading) return "Loading...";
                  if (error) return `Error! ${error.message}`;
                  return JSON.stringify(data.lists);
                }}
              </Query>
            ) : (
              <Login />
            )}
          </StyledHome>
        );
      }}
    </Query>
  );
}

export default Home;
