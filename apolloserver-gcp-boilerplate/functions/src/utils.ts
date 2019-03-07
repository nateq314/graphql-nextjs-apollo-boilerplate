import { verifyUserSessionToken, verifyIdToken } from "./firebase";
import * as express from "express";

export async function getUser(req: express.Request) {
  console.log("getUser()");
  const sessionCookie = req.cookies.session || "";
  if (sessionCookie) {
    return verifyUserSessionToken(sessionCookie);
  } else {
    const idToken = req.get("idToken");
    if (idToken && idToken !== "undefined") return verifyIdToken(idToken);
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
