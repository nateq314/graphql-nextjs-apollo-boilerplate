import React, { useContext } from "react";
import styled from "styled-components";
import { Query } from "react-apollo";
import Login from "../components/Login";
import AppBar from "../components/AppBar";
import { LISTS_QUERY } from "../other/queries";
import { UserContext } from "./_app";

const StyledHome = styled.div``;

function Home() {
  const user = useContext(UserContext);
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
}

export default Home;
