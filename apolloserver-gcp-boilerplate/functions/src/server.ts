import { ApolloServer, gql, ApolloError } from "apollo-server-express";
import * as cors from "cors";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as fbAdmin from "firebase-admin";
import { getUser } from "./utils";
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

  // Simple graphql schema
  const typeDefs = gql`
    type List {
      name: String!
      order: Int!
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
      currentUser: User
      lists: [List!]!
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
      async currentUser(parent: any, args: any, ctx: Context, info: any) {
        console.log("resolvers.Query.currentUser()");
        return ctx.user;
      },
      async lists(parent: any, args: any, ctx: Context, info: any) {
        console.log("resolvers.Query.lists()");
        authorize(ctx);
        const { uid } = ctx.user as fbAdmin.auth.DecodedIdToken;
        try {
          console.log(`about to query for documents with uid == ${uid}`);
          const querySnapshot = await fbAdmin
            .firestore()
            .collection("lists")
            .where("uid", "==", uid)
            .get();
          const data = querySnapshot.docs.map((doc) => doc.data());
          console.log("Retrieved lists:", data);
          return data;
        } catch (error) {
          console.error("Error retrieving lists:", error);
          throw new ApolloError(`Error getting document: ${error}`);
        }
      }
    },
    Mutation: {
      async login(parent: any, args: ILogin, ctx: Context, info: any) {
        console.log("resolvers.Mutation.login()");
        if (args.idToken && args.idToken !== "undefined") {
          const decodedIdToken = await verifyIdToken(args.idToken);
          const { uid } = decodedIdToken;
          if (!uid) {
            console.error("User is not registered");
            return {
              success: false,
              message: "User is not registered"
            };
          }

          const user = await getUserRecord(uid);
          const [sessionCookie, expiresIn] = await createUserSessionToken(
            args,
            decodedIdToken
          );
          const options: express.CookieOptions = {
            maxAge: expiresIn,
            httpOnly: true,
            secure: false // TODO: set secure: true in production
          };
          ctx.res.cookie("session", sessionCookie, options);
          return { success: true, user };
        } else {
          const sessionCookie = ctx.req.cookies.session || "";
          if (sessionCookie) {
            const decodedClaims = await verifyUserSessionToken(sessionCookie);
            const user = await getUserRecord(decodedClaims.uid);
            // TODO: check claims to ensure it's still valid / not revoked / etc.?
            return { success: true, user };
          }
        }
        return {
          success: false,
          message: "Invalid login request"
        };
      },

      async logout(parent: any, args: any, ctx: Context, info: any) {
        console.log("resolvers.Mutation.logout()");
        const sessionCookie = ctx.req.cookies.session || "";
        if (sessionCookie) {
          ctx.res.clearCookie("session");
          if (ctx.user) {
            try {
              await fbAdmin.auth().revokeRefreshTokens(ctx.user.sub);
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
      console.log("server.context()");
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

function authorize(ctx: Context) {
  if (!ctx.user) ctx.res.status(401).send("UNAUTHORIZED REQUEST");
}

export default configureServer;
