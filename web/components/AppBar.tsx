import React from "react";
import Link from "next/link";
import { Query } from "react-apollo";
import Logout from "./Logout";
import { FETCH_CURRENT_USER } from "../other/queries";

export default function AppBar() {
  return (
    <Query query={FETCH_CURRENT_USER}>
      {({ data }) => {
        const user = data ? data.current_user : null;
        return (
          <header className="AppBar">
            <span>Welcome{user ? `, ${user.email}` : ""}</span>
            <Link href="/about">
              <a>About Us</a>
            </Link>
            <Logout />
          </header>
        );
      }}
    </Query>
  );
}
