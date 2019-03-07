import React from "react";
import styled from "styled-components";
import Link from "next/link";

const StyledHome = styled.div``;

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
      {props.user && <div />}
    </StyledHome>
  );
}

export default Home;
