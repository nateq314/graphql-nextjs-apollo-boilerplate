import { ApolloServer, gql } from "apollo-server-express";
import * as cors from "cors";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as firebaseAdmin from "firebase-admin";
import { getUser, AuthError } from "./utils";
import {
  getUserRecord,
  verifyIdToken,
  createUserSessionToken,
  verifyUserSessionToken
} from "./firebase";

interface ILogin {
  idToken?: string;
}

export interface Context {
  req: express.Request;
  res: express.Response;
  user: firebaseAdmin.auth.DecodedIdToken | null;
}

function configureServer() {
  const app = express();
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true
    })
  );
  app.use(cookieParser());

  // Simple graphql schema
  const typeDefs = gql`
    type List {
      name: String!
      order: Int!
      uid: ID!
    }

    type Mutation {
      login(idToken: String): LoginResult!
      logout: LoginResult!
    }

    type LoginResult {
      success: Boolean!
      message: String
      user: User
    }

    type Query {
      "A simple type for getting started!"
      hello: String
    }

    type User {
      uid: ID!
      email: String!
      emailVerified: Boolean!
      displayName: String
      phoneNumber: String
      photoURL: String
      disabled: Boolean!
      passwordHash: String
      passwordSalt: String
      tokensValidAfterTime: String
    }
  `;

  // Very simple resolver that returns "world" for the hello query
  const resolvers = {
    Query: {
      // hello: () => "world"
      hello(parent: any, args: any, ctx: Context, info: any) {
        if (!ctx.user) ctx.res.status(401).send("UNAUTHORIZED REQUEST");
        return "world";
      }
    },
    Mutation: {
      async login(parent: any, args: ILogin, ctx: Context, info: any) {
        if (args.idToken) {
          const decodedIdToken = await verifyIdToken(args.idToken);
          const { uid } = decodedIdToken;
          // Let's see what the hell is really in this thing anyways
          console.log("decodedIdToken:", JSON.stringify(decodedIdToken));
          if (!uid) throw new AuthError({ message: "User is not registered" });
          const [sessionCookie, expiresIn] = await createUserSessionToken(
            args,
            decodedIdToken
          );
          const options: express.CookieOptions = {
            maxAge: expiresIn,
            httpOnly: true,
            // TODO: set `secure: true` in production
            secure: false
          };
          ctx.res.cookie("session", sessionCookie, options);
          return {
            success: true
          };
        } else {
          const sessionCookie = ctx.req.cookies.session || "";
          if (sessionCookie) {
            const decodedClaims = await verifyUserSessionToken(sessionCookie);
            const user = await getUserRecord(decodedClaims.uid);
            // TODO: check claims to ensure it's still valid / not revoked / etc.?
            return {
              success: true,
              user
            };
          } else {
            throw new AuthError({ message: "Invalid login request" });
          }
        }
      },

      async logout(parent: any, args: any, ctx: Context, info: any) {
        const sessionCookie = ctx.req.cookies.session || "";
        if (sessionCookie) {
          ctx.res.clearCookie("session");
          if (ctx.user) {
            try {
              await firebaseAdmin.auth().revokeRefreshTokens(ctx.user.sub);
              return {
                success: true
              };
            } catch (error) {
              return {
                success: false,
                message: error
              };
            }
          }
        }
        return {
          success: false,
          message: "Session cookie is invalid, or no session to log out of"
        };
      }
    }
  };

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

  // now we take our newly instantiated ApolloServer and apply the
  // previously configured express application
  server.applyMiddleware({
    app,
    cors: false
  });

  // finally return the application
  return app;
}

export default configureServer;
