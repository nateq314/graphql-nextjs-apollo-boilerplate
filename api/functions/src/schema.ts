import { gql } from "apollo-server-express";

export interface List {
  id: string;
  name: string;
  order: number;
}

export interface Todo {
  id: string;
  completed: boolean;
  content: string;
  deadline?: number;
  important: boolean;
  order: number;
}

const schema = gql`
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

export default schema;
