import mongoose from 'mongoose';
import validator from 'validator';
import mongoErrors from 'mongoose-mongodb-errors';

const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const electionSchema = new Schema({
  started: {
    type: Date,
    default: Date.now
  },
  finished: {
    type: Date
  },
  system: {
    type: String,
    required: 'Please supply a system',
    enum: ['FPTP', 'AV']
  },
  possibleVotes: {
    type: Number,
    required: 'Please provide the number of possible votes'
  }
});

electionSchema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'recordId'
});

function autopopulate(next) {
  this.populate('votes');
  next();
}

electionSchema.statics.findLatest = function() {
  return this.find()
    .sort({ started: -1 })
    .limit(1);
};

electionSchema.pre('find', autopopulate);
electionSchema.pre('findOne', autopopulate);

export default mongoose.model('Election', electionSchema);
