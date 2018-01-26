import { makeExecutableSchema } from 'graphql-tools';
import fetch from 'node-fetch';
import resolvers from './resolvers';
import api from '../api';

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
    parties: [String]
    name: String
    image: String
  }

  type Election {
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
    arrayIndex: Int
  }

  type Results {
    candidate: Candidate
    votes: [Vote]
    election: Election
  }

  type Query {
    user: User
    getElectionById(id: ID!): Election 
    getUserVotes(id: ID!): [Vote]
    userVotes: [Vote]
    currentElection: Election!
    results: [Results]
    candidates: [Candidate]
    elections: [Election]
  }

  type Mutation {
    createCandidate(name: String!, parties: [String!]!, email: String!, image: String): Candidate
    createElection: Election 
    castVote(candidates: [ID]!): Vote
  }
`;

export async function buildOptions(req, res) {
  if (!req.user) {
    throw new Error('Unathorized');
  }
  const token = req.headers.authorization.replace('Bearer ', '');
  const user = await api.getUser(token);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  return {
    context: {
      user
    },
    schema
  };
}
