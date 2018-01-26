import mongoose from 'mongoose';
import validator from 'validator';
import mongoErrors from 'mongoose-mongodb-errors';
import md5 from 'md5';

const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const candidateSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid Email Address'],
    required: 'Please Supply an email address'
  },
  name: {
    type: String,
    required: 'Please supply a name',
    trim: true
  },
  parties: [
    {
      type: String,
      required: 'Please supply a party',
      trim: true
    }
  ],
  image: {
    type: String
  },
  social: {
    twitter: {
      type: String
    },
    facebook: {
      type: String
    }
  }
});

candidateSchema.virtual('gravatar').get(function() {
  const hash = md5(this.email);
  return `https://gravatar.com/avatar/${hash}?s=200`;
});

export default mongoose.model('Candidate', candidateSchema);
