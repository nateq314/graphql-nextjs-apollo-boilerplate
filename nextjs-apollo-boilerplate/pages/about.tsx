import React from "react";
import Link from "next/link";
import styled from "styled-components";

import Button from "../components/Button";

const StyledAbout = styled.div`
  padding-top: 30px;

  h1 {
    letter-spacing: 1px;
  }
`;

export default function About() {
  return (
    <StyledAbout className="example">
      <h1>About Us</h1>
      <h2>We're a great team of really talented folks.</h2>
      <Link href="/">
        <Button>Home</Button>
      </Link>
    </StyledAbout>
  );
}
