import * as express from "express";
import { createServer } from "https";
import { ApolloServer } from "apollo-server-express";
import * as path from "path";
import * as fs from "fs";

import typeDefs from "./schema";
import resolvers from "./resolvers";

const PORT = process.env.PORT || 3000;

const app = express();

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
});

apolloServer.applyMiddleware({ app });

const httpsServer = createServer(
  {
    // key: fs.readFileSync(`../certs/localhost.key`),
    key: fs.readFileSync(path.join(process.cwd(), "certs", "localhost.key")),
    // cert: fs.readFileSync(`../certs/localhost.crt`)
    cert: fs.readFileSync(path.join(process.cwd(), "certs", "localhost.crt"))
  },
  app
);
apolloServer.installSubscriptionHandlers(httpsServer);

httpsServer.listen({ port: PORT }, () => {
  console.log(
    `🚀 Subscriptions ready at ws://localhost:${PORT}${
      apolloServer.subscriptionsPath
    }`
  );
});
