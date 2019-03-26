import { ApolloServer } from "apollo-server-express";
import * as express from "express";
import * as fbAdmin from "firebase-admin";
import { getUser } from "./utils";
import typeDefs from "./schema";
import resolvers from "./resolvers";

export interface Context {
  req: express.Request;
  res: express.Response;
  user: fbAdmin.auth.DecodedIdToken | null;
}

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,

  context: async ({ req, res }) => {
    let user = await getUser(req);
    if (user) {
      user = {
        ...user,
        id: user.uid
      };
    }
    return { req, res, user } as Context;
  },

  // TODO: look up what these flags do
  introspection: true,
  playground: true,
  debug: true
});

export default apolloServer;
