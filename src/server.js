import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import { run } from './scheduler';

import { buildOptions } from './schema';

const PORT = 3000;
const server = express();

if (typeof process.env.AUTH0_SECRET === 'undefined') {
  console.warn(
    'WARNING: process.env.AUTH0_SECRET is not defined. Check README.md for more information'
  );
}
if (typeof process.env.AUTH0_DOMAIN === 'undefined') {
  console.warn(
    'WARNING: process.env.AUTH0_DOMAIN is not defined. Check README.md for more information'
  );
}

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`
  }),
  audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`,
  issuer: `https://${process.env.AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
});

server.use(jwtCheck);

server.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));

server.use(
  '/graphiql',
  graphiqlExpress({
    endpointURL: '/graphql',
    query: `{
      me {
        id
        nickname
        email
      }
      hello
      helloAuth
    } `
  })
);

server.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      error: err,
      message: 'Not Authorized, Please Login'
    });
  }
});

server.listen(PORT, () => {
  run();
  console.log(
    `GraphQL Server is now running on http://localhost:${PORT}/graphql`
  );
  console.log(`View GraphiQL at http://localhost:${PORT}/graphiql`);
});
