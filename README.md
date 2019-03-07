# graphql-nextjs-apollo-boilerplate

Everything I love all in one full-stack boilerplate!

**Data Layer**

- Firebase / Cloud Firestore

**API**

- Typescript
- GraphQL (Apollo Server)
- Deployed on a Firebase Function (same as GCP Function)

**Frontend**

- Typescript
- Next.js SSR
- GraphQL (Apollo Client)
- Secure, cookie-based authentication
  - almost all work done server-side with current user object set in Apollo cache, so that login status is maintained across pages (lambdas), and persisted over site visits.
- Styled Components
- Serverless deployment (Next.js 8's 'serverless' mode - each page a lambda) with Zeit Now 2.0
