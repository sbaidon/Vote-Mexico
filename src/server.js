import dotenv from 'dotenv';
import express from 'express';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import bodyParser from 'body-parser';

import { buildOptions } from './schema';

dotenv.config();
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

server.listen(PORT, () => {
  console.log(
    `GraphQL Server is now running on http://localhost:${PORT}/graphql`
  );
  console.log(`View GraphiQL at http://localhost:${PORT}/graphiql`);
});
