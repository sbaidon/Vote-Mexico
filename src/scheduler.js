import Agenda from 'agenda';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import api from './api';

export async function run() {
  const Election = mongoose.model('Election');
  const Vote = mongoose.model('Vote');

  const db = await MongoClient.connect(process.env.DATABASE);
  const agenda = new Agenda().mongo(db, 'jobs');
  const systems = ['FPTP', 'AV'];

  agenda.define('finishElection', async () => {
    const latestElection = await Election.findLatest();
    // Finish election
    await Election.update(
      { _id: latestElection._id },
      { $set: { finished: Date.now() } }
    ).exec();
    // GET THE VOTES OF THE LATEST ELECTION
    const votes = await Vote.groupedByElection(latestElection._id);
    // Figure out which is the next system's election
    const index = systems.findIndex(system => latestElection.system === system);
    const nextSystem = systems[(index + 1) % 2];
    const possibleVotes = await api.getTotalUsers();
    // Start a new election
    await new Election({ system: nextSystem, possibleVotes }).save();
  });

  await new Promise(resolve => agenda.once('ready', resolve()));

  agenda.every('6 hours', 'finishElection');
  agenda.start();
}
