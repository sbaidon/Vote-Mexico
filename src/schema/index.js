import { makeExecutableSchema } from 'graphql-tools';
import fetch from 'node-fetch';
import resolvers from './resolvers';

// Construct a schema, using GraphQL schema language
const typeDefs = `
  type User {
    id: ID!
    nickname: String
    email: String
    age: String
  }

  type Query {
    me: User
    hello: String!
    helloAuth: String
  }
`;

export async function buildOptions(req, res) {
  if (!req.user) {
    throw new Error('Unathorized');
  }
  const token = getToken(req.headers['authorization']);
  const userId = req.user.sub;
  const user = await getUser(token, userId);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  return {
    context: {
      user
    },
    schema
  };
}

function getToken(authorization) {
  const bearerLength = 'bearer '.length;
  if (authorization.length > bearerLength) {
    return authorization.slice(bearerLength);
  }
}

async function getUser(token, userId) {
  try {
    const profileRequest = await fetch(
      `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${encodeURIComponent(
        userId
      )}?include_fields=false`,
      {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    const profile = await profileRequest.json();
    console.log(profile);
    return {
      ...profile,
      id: profile.user_id,
      age: profile.user_metadata.age
    };
  } catch (error) {
    console.error(error);
  }
  return null;
}
