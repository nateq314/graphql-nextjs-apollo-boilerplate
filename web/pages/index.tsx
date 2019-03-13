import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { Query } from "react-apollo";
import gql from "graphql-tag";
import Login from "../components/Login";
import Logout from "../components/Logout";

const StyledHome = styled.div``;

const LISTS_QUERY = gql`
  query {
    lists {
      id
      name
      order
      todos {
        id
        content
      }
    }
  }
`;

interface HomeProps {
  user?: firebase.User;
}

function Home(props: HomeProps) {
  return (
    <StyledHome>
      <h1>Welcome{props.user ? `, ${props.user.email}` : ""}</h1>
      <h2>
        <Link href="/about">
          <a>About Us</a>
        </Link>
      </h2>
      {props.user ? (
        <>
          <Query query={LISTS_QUERY}>
            {({ loading, error, data }) => {
              if (loading) return "Loading...";
              if (error) return `Error! ${error.message}`;
              return JSON.stringify(data.lists);
            }}
          </Query>
          <Logout user={props.user} />
        </>
      ) : (
        <Login user={props.user} />
      )}
    </StyledHome>
  );
}

export default Home;
