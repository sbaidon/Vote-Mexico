import { makeExecutableSchema } from 'graphql-tools';
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import resolvers from './resolvers';

// Construct a schema, using GraphQL schema language
const typeDefs = `
  type User {
    id: ID!
    nickname: String
    email: String
  }

  type Query {
    me: User
    hello: String!
    helloAuth: String
  }
`;

export async function buildOptions(req, res) {
  const secrets = process.env;
  const { headers } = req;
  const authorization = headers['authorization'];
  const user = await getUser(authorization, secrets);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  return {
    context: {
      user,
      secrets
    },
    schema
  };
}

async function getUser(authorization, secrets) {
  const bearerLength = 'Bearer '.length;
  if (authorization && authorization.length > bearerLength) {
    const token = authorization.slice(bearerLength);
    const verify = promisify(jwt.verify);
    const { ok, result } = await verify(token, secrets.AUTH0_SECRET)
      .then(result => Promise.resolve({ ok: true, result }))
      .catch(error => Promise.resolve({ ok: false, result: error }));
    if (ok) {
      const profileRequest = await fetch(
        `https://${secrets.AUTH0_DOMAIN}/tokeninfo`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            id_token: token
          })
        }
      );
      const profile = await profileRequest.json();
      return {
        ...profile,
        id: result.sub
      };
    } else {
      console.error(result);
    }
  }

  return null;
}
