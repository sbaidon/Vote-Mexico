import mongoose from 'mongoose';
import api from '../api';

const Candidate = mongoose.model('Candidate');
const Vote = mongoose.model('Vote');
const Election = mongoose.model('Election');

export default {
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
      data.possibleVotes = await api.getTotalUsers();
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
      data.election = election;
      const newVote = await new Vote(data).save();
      return newVote;
    } catch (error) {
      throw new Error(error);
    }
  }
};
