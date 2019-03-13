import * as cors from "cors";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as fbAdmin from "firebase-admin";
import apolloServer from "./apolloServer";

export interface Context {
  req: express.Request;
  res: express.Response;
  user: fbAdmin.auth.DecodedIdToken | null;
}

function configureServer() {
  const app = express();
  app.use(
    cors({
      origin: ["https://nateq314.now.sh", "http://localhost:3000"],
      credentials: true
    })
  );
  app.use(cookieParser());

  // take our newly instantiated ApolloServer and apply the
  // previously configured Express application
  apolloServer.applyMiddleware({
    app,
    cors: false
  });

  // return the application
  return app;
}

export default configureServer;
