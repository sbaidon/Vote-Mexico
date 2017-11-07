import mongoose from 'mongoose';

const Candidate = mongoose.model('Candidate');
const Vote = mongoose.model('Vote');
const Election = mongoose.model('Election');

export default {
  user(_, data, context) {
    return context.user;
  },
  async candidates(_, data) {
    try {
      const candidates = await Candidate.find();
      return candidates;
    } catch (error) {
      throw new Error(error);
    }
  },
  async elections(_, data) {
    try {
      const elections = await Election.find();
      return elections;
    } catch (error) {
      throw new Error(error);
    }
  },
  async currentElection(_, data) {
    try {
      const latestElection = await Election.findLatest();
      return latestElection;
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
  /*
    async getUserVotes(_, data) {
      try {
        const votes = await Vote.find({ userId: data.id });
        return votes;
      } catch (error) {
        throw new Error(error);
      }
    },
    */
  async results(_, data) {
    try {
      const latestElection = await Election.findLatest();
      const votes = await Vote.groupedByElection(latestElection._id);
      return votes;
    } catch (error) {
      throw new Error(error);
    }
  }
};
