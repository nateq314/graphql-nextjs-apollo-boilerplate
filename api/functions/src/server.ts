import * as cors from "cors";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import apolloServer from "./apolloServer";

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
