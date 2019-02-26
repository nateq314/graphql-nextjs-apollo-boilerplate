import React, { useState } from "react";
import Link from "next/link";
import styled from "styled-components";

import { useCorrectURL } from "../other/effects";
import Button from "../components/Button";
import GlobalStyles from "../components/GlobalStyles";

const StyledAbout = styled.div`
  padding-top: 30px;

  h1 {
    letter-spacing: 1px;
  }
`;

export default function About() {
  useCorrectURL();
  const [loading, setLoading] = useState(false);

  return (
    <StyledAbout className="example">
      <GlobalStyles />
      <h1>About Us</h1>
      <h2>We're a great team of really talented folks.</h2>
      <Link href="/">
        <Button
          onClick={() => {
            setLoading(true);
          }}
        >
          Home
        </Button>
      </Link>
      {loading && <div>Loading Home Page...</div>}
    </StyledAbout>
  );
}
