import { graphql, buildSchema } from 'graphql';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

// Construct a schema, using GraphQL schema language
export const schema = buildSchema(`
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
`);

// The root provides a resolver function for each API endpoint
export const rootValue = {
  me: (args, context) => {
    return context.user;
  },
  hello: () => {
    return 'Hello anyone!';
  },
  helloAuth: async (args, context) => {
    console.log(context);
    const user = context.user;
    if (user) {
      return `Hello, ${user.nickname}!`;
    } else {
      throw new Error('Unauthorized!');
    }
  }
};

export async function buildOptions(req, res) {
  const secrets = process.env;
  const { headers } = req;
  const authorization = headers['authorization'];
  const user = await getUser(authorization, secrets);
  return {
    context: {
      user,
      secrets
    },
    schema,
    rootValue
  };
}

async function getUser(authorization, secrets) {
  const bearerLength = 'Bearer '.length;
  if (authorization && authorization.length > bearerLength) {
    const token = authorization.slice(bearerLength);
    const { ok, result } = await new Promise(resolve =>
      jwt.verify(token, secrets.AUTH0_SECRET, (err, result) => {
        if (err) {
          resolve({
            ok: false,
            result: err
          });
        } else {
          resolve({
            ok: true,
            result
          });
        }
      })
    );
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
