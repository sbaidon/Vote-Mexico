import { makeExecutableSchema } from 'graphql-tools';
import fetch from 'node-fetch';
import resolvers from './resolvers';

const typeDefs = `
  scalar Date

  type User {
    id: ID!
    nickname: String
    email: String
    age: String
    picture: String
  }

  type Candidate {
    email: String
    id: ID!
    party: String
  }

  type Election {
    system: String!
    possibleVotes: Int!
    id: ID!
    votes: [Vote]
    started: Date
    finished: Date
  }

  type Vote {
    userId: ID!
    candidates: [Candidate]!
    election: Election! 
  }

  type Query {
    user: User
    getElectionById(id: ID!): Election 
    getUserVotes(id: ID!): [Vote]
    userVotes: [Vote]
    currentElection: Election!
  }


  type Mutation {
    createCandidate(name: String!, party: String!, email: String!): Candidate
    createElection(system: String!): Election 
    castVote(candidates: [ID]!): Vote
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
