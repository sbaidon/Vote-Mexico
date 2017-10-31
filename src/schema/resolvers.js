import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';

dotenv.config();

mongoose.connect(process.env.DATABASE, {
  useMongoClient: true
});

mongoose.Promise = global.Promise;
mongoose.connection.on('error', err => {
  console.error(`There was an error: ${err.message}`);
});

import '../models/Candidate';
import '../models/Election';
import '../models/Vote';

const Candidate = mongoose.model('Candidate');
const Vote = mongoose.model('Vote');
const Election = mongoose.model('Election');

export default {
  Query: {
    user(_, data, context) {
      return context.user;
    },
    async currentElection(_, data) {
      try {
        const latestElection = await Election.findLatest();
        return latestElection[0];
      } catch (error) {
        throw new Error(error);
      }
    },
    async getElectionById(_, data) {
      try {
        const election = await Election.findOne({ _id: data.id });
        return election;
      } catch (error) {
        throw new Error(error);
      }
    },
    async userVotes(_, data, context) {
      try {
        const votes = await Vote.find({ userId: context.user.id });
        return votes;
      } catch (error) {
        throw new Error(error);
      }
    },
    async getUserVotes(_, data) {
      try {
        const votes = await Vote.find({ userId: data.id });
        return votes;
      } catch (error) {
        throw new Error(error);
      }
    }
  },
  Mutation: {
    async createCandidate(_, data) {
      try {
        const newCandidate = await new Candidate(data).save();
        return newCandidate;
      } catch (error) {
        throw new Error(error);
      }
    },
    async createElection(_, data) {
      try {
        data.possibleVotes = 30; // TODO Hit Auth0 API to know possible users at the moment of new election
        const newElection = await new Election(data).save();
        return newElection;
      } catch (error) {
        throw new Error(error);
      }
    },
    async castVote(_, data, context) {
      try {
        const election = await Election.findLatest();
        data.userId = context.user.id;
        data.election = election[0];
        const newVote = await new Vote(data).save();
        return newVote;
      } catch (error) {
        throw new Error(error);
      }
    }
  },
  Candidate: {
    id: root => root._id || root.id
  },
  Election: {
    id: root => root._id || root.id
  },
  Vote: {
    async candidates(root) {
      await root.populate('candidates').execPopulate();
      return root.candidates;
    },
    async election(root) {
      await root.populate('election').execPopulate();
      return root.election;
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value);
    },
    serialize(value) {
      return value.getTime();
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      }
      return null;
    }
  })
};
