import { ApolloServer } from "apollo-server-express";
import * as cors from "cors";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as fbAdmin from "firebase-admin";
import { getUser } from "./utils";
import typeDefs from "./schema";
import resolvers from "./resolvers";

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

  const server = new ApolloServer({
    typeDefs,
    resolvers,

    context: async ({ req, res }) => {
      const user = await getUser(req);
      return { req, res, user } as Context;
    },

    // TODO: look up what these flags do
    introspection: true,
    playground: true,
    debug: true
  });

  // take our newly instantiated ApolloServer and apply the
  // previously configured Express application
  server.applyMiddleware({
    app,
    cors: false
  });

  // return the application
  return app;
}

export default configureServer;
