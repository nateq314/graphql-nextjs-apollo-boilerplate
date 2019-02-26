import { verifyUserSessionToken } from "./firebase";
import * as express from "express";

export async function getUser(req: express.Request) {
  console.log("req.cookies:", JSON.stringify(req.cookies));
  const sessionCookie = req.cookies.session || "";
  if (sessionCookie) {
    console.log("sessionCookie:", sessionCookie);
    return verifyUserSessionToken(sessionCookie);
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
