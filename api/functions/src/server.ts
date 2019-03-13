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
  session?: string;
}

export interface Context {
  req: express.Request;
  res: express.Response;
  user: fbAdmin.auth.DecodedIdToken | null;
}

interface List {
  id: string;
  name: string;
  order: number;
}

interface Todo {
  id: string;
  completed: boolean;
  content: string;
  deadline?: number;
  important: boolean;
  order: number;
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
      id: ID!
      name: String!
      order: Int!
      todos: [Todo]!
    }

    type Mutation {
      login(idToken: String, session: String): LoginResult!
      logout: LoginResult!
    }

    type LoginResult {
      error: String
      user: User
    }

    type Query {
      currentUser: User
      lists: [List!]!
    }

    type Todo {
      id: ID!
      completed: Boolean!
      content: String!
      deadline: Int
      important: Boolean!
      order: Int!
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
        return ctx.user;
      },
      async lists(parent: any, args: any, ctx: Context, info: any) {
        authorize(ctx);
        const { uid } = ctx.user as fbAdmin.auth.DecodedIdToken;
        try {
          const querySnapshot = await fbAdmin
            .firestore()
            .collection("lists")
            .where("uid", "==", uid)
            .get();
          return querySnapshot.docs.map(
            // (doc) =>
            //   ({
            //     ...doc.data(),
            //     id: doc.id
            //   } as List)
            (doc) => {
              const data = {
                ...doc.data(),
                id: doc.id
              } as List;
              return data;
            }
          );
        } catch (error) {
          console.error("Error retrieving lists:", error);
          throw new ApolloError(`Error getting document: ${error}`);
        }
      }
    },
    List: {
      async todos(list: List) {
        const querySnapshot = await fbAdmin
          .firestore()
          .collection("lists")
          .doc(list.id)
          .collection("todos")
          .get();
        return querySnapshot.docs.map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id
            } as Todo)
        );
      }
    },
    Mutation: {
      async login(parent: any, args: ILogin, ctx: Context, info: any) {
        if (args.idToken && args.idToken !== "undefined") {
          // User just logged in via email/password and either
          // 1: client is calling this in order to set a session cookie, API <-> CLIENT, or
          // 2: SSR backend is calling this in order to fetch the user object
          //    and set the session cookie, SSR <-> CLIENT
          const decodedIdToken = await verifyIdToken(args.idToken);
          const { uid } = decodedIdToken;
          if (!uid) {
            console.error("User is not registered");
            return {
              error: "User is not registered"
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
          return { user };
        } else {
          // User is re-visiting the site and automatically reauthenticating using the
          // existing session cookie (SSR <-> CLIENT).
          const sessionCookie = args.session || "";
          if (sessionCookie) {
            try {
              const decodedClaims = await verifyUserSessionToken(sessionCookie);
              const user = await getUserRecord(decodedClaims.uid);
              return { user };
            } catch (error) {
              // verifyUserSessionToken() will throw if the session cookie
              // is invalid or revoked.
              return {
                error: `Invalid login request: ${error}`
              };
            }
          }
        }
        return {
          error: "Invalid login request"
        };
      },

      async logout(parent: any, args: any, ctx: Context, info: any) {
        const sessionCookie = ctx.req.cookies.session || "";
        if (sessionCookie) {
          ctx.res.clearCookie("session");
          if (ctx.user) {
            try {
              await fbAdmin.auth().revokeRefreshTokens(ctx.user.sub);
              return {};
            } catch (error) {
              return {
                error
              };
            }
          }
        }
        return {
          error: "Session cookie is invalid, or no session to log out of"
        };
      }
    }
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,

    context: async ({ req, res }) => {
      // console.log("req.body:", req.body);
      // console.log("req.headers:", req.headers);
      // console.log("req.cookies:", req.cookies);
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
