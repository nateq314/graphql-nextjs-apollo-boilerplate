import React from "react";
import styled from "styled-components";

import GlobalStyles from "../components/GlobalStyles";

// Component styling goes here. Supports all of CSS, plus nesting.
// Documentation link: https://www.styled-components.com/docs
//
// Global styling (for all pages) goes in GlobalStyles.tsx.
//
// Decided on Styled Components as a default due to popularity, but could easily
// be replaced by any other CSS-in-JS solution, or traditional CSS/SASS imports.
// See Next.js documentation for how to implement CSS/SASS imports. Note that it
// is highly recommended to use CSS-in-JS over direct imports, if for no other
// reason, due to the fact that at time of writing, there is a bug in 'next-css'
// and 'next-sass' packages that breaks Next's <Link></Link> tag for routing
// between pages. (See https://github.com/zeit/next-plugins/issues/282). Any
// CSS-in-JS solution gets around this.
const StyledApp = styled.div`
  padding-top: 30px;

  .svgContainer {
    margin: 0 auto;
    width: 200px;
    height: 200px;
  }
`;

interface AppProps {
  title: string;
}

function App() {
  return (
    <StyledApp>
      <GlobalStyles />
      <h1>Welcome</h1>
    </StyledApp>
  );
}

App.getInitialProps = async (): Promise<Partial<AppProps>> => {
  // Do server-side initial data fetching from here. Return a JS object
  // in the shape of props. Must be a plain object, not Date, Map, Set, etc.
  // Only PAGES can have this method. Cannot be used in children components.
  // This would be the place to do initial population of Redux store, etc.

  // getInitialProps() receives a context object with several useful properties.
  // Can also define `getInitialProps` on stateless functional components (SFCs).
  // See https://nextjs.org/docs/#fetching-data-and-component-lifecycle
  await new Promise((resolve) => setTimeout(resolve, 0)); // simulate network delay
  return {
    title: "Congratulations, you have an app!"
  };
};

export default App;
