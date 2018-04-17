import mongoose from 'mongoose';
import validator from 'validator';
import mongoErrors from 'mongoose-mongodb-errors';

const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const voteSchema = new Schema({
  userId: {
    type: String,
    required: 'Vote should be associated with a user',
  },
  candidates: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Candidate',
      required: 'Please give a candidate id',
    },
  ],
  election: {
    type: mongoose.Schema.ObjectId,
    ref: 'Election',
    required: 'Please give a Election Record Id',
  },
});

voteSchema.statics.groupedByCandidate = function(electionId) {
  return this.aggregate([
    { $match: { election: electionId } },
    { $unwind: { path: '$candidates', includeArrayIndex: 'arrayIndex' } },
    {
      $group: {
        _id: '$candidates',
        votes: { $push: '$$ROOT' },
      },
    },
    {
      $project: {
        candidate: '$_id',
        votes: '$$ROOT.votes',
        election: electionId,
      },
    },
  ]);
};

voteSchema.index({ userId: 1, election: 1 }, { unique: true });
export default mongoose.model('Vote', voteSchema);
