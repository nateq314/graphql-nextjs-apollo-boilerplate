import { verifyUserSessionToken } from "./firebase";
import * as express from "express";

export async function getUser(req: express.Request) {
  const sessionCookie = req.cookies.session || "";
  if (sessionCookie) {
    // This is the API <-> CLIENT cookie. Client is hitting the API.
    return verifyUserSessionToken(sessionCookie);
  } else {
    // This is the SSR <-> CLIENT cookie, passed on to the API as a header.
    const session = req.get("session");
    if (session && session !== "undefined")
      return verifyUserSessionToken(session);
  }
  return null;
}

export class AuthError extends Error {
  constructor(
    error: { message: string; stack?: any } = { message: "Not authorized" }
  ) {
    super(error.message);
  }
}
