import Agenda from 'agenda';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';

export async function run() {
  const Election = mongoose.model('Election');

  const db = await MongoClient.connect(process.env.DATABASE);

  const agenda = new Agenda().mongo(db, 'jobs');

  agenda.define('finishElection', async () => {
    const latestElection = await Election.findLatest();
    await Election.update(
      { _id: latestElection._id },
      { $set: { finished: Date.now() } }
    ).exec();
  });

  await new Promise(resolve => agenda.once('ready', resolve()));

  agenda.every('6 hours', 'finishElection');
  agenda.start();
}
