import mongoose from 'mongoose';
import validator from 'validator';
import mongoErrors from 'mongoose-mongodb-errors';

const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const voteSchema = new Schema({
  userId: {
    type: String,
    required: 'Vote should be associated with a user'
  },
  candidates: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Candidate',
    required: 'Please give a candidate id'
  }],
  election: {
    type: mongoose.Schema.ObjectId,
    ref: 'Election',
    required: 'Please give a Election Record Id'
  }
});

export default mongoose.model('Vote', voteSchema);
