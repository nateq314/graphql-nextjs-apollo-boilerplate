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
    foo: Result
    login(idToken: String, session: String): LoginResult!
    logout: LoginResult!
  }

  type LoginResult {
    error: String
    user: User
  }

  type Query {
    current_user: User
    lists: [List!]!
  }

  type Result {
    message: String
  }

  type Subscription {
    somethingChanged: Result
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
    id: ID!
    uid: String!
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
