// Global styles go in this file. The component exported from this file should
// be placed at the top of every page in the pages/ directory.

import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @import url("https://fonts.googleapis.com/css?family=Open+Sans");
  
  body {
    background-color: #21273b;
    color: #eee;
    text-align: center;
    font-family: "Open Sans", sans-serif;
    margin: 0;
  }

  h1 {
    margin-top: 0px;
    color: #eee;
  }

  h2 {
    color: #b0b0b0;
  }
`;

export default GlobalStyle;
