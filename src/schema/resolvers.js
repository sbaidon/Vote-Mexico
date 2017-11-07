import mongoose from 'mongoose';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import Query from './queries';
import Mutation from './mutations';

const Candidate = mongoose.model('Candidate');
const Vote = mongoose.model('Vote');
const Election = mongoose.model('Election');

export default {
  Query,
  Mutation,
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
  Results: {
    async candidate(root) {
      await Vote.populate(root, { path: 'candidate', model: 'Candidate' });
      return root.candidate;
    },
    async election(root) {
      await Vote.populate(root, { path: 'election', model: 'Election' });
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
