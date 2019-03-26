import React, { useContext } from "react";
import Link from "next/link";
import Logout from "./Logout";
import { UserContext } from "../pages/_app";

export default function AppBar() {
  const user = useContext(UserContext);
  return (
    <header className="AppBar">
      <span>Welcome{user ? `, ${user.email}` : ""}</span>
      <Link href="/about">
        <a>About Us</a>
      </Link>
      <Logout />
    </header>
  );
}
