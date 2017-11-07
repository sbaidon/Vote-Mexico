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
    party: String
    name: String
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
    createCandidate(name: String!, party: String!, email: String!): Candidate
    createElection(system: String!): Election 
    castVote(candidates: [ID]!): Vote
  }
`;

export async function buildOptions(req, res) {
  if (!req.user) {
    throw new Error('Unathorized');
  }
  const userId = req.user.sub;
  const user = await api.getUser(userId);
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  return {
    context: {
      user
    },
    schema
  };
}
