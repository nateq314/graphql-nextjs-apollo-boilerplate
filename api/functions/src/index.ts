import * as functions from "firebase-functions";
import configureServer from "./server";

const server = configureServer();
export const api = functions.https.onRequest(server);
