import mongoose from 'mongoose';
import { connectDB } from './config/database';
import Vote from './models/Vote';
import User from './models/User';
import dotenv from 'dotenv';

dotenv.config();

const clearVotes = async () => {
  try {
    await connectDB();
    
    console.log('Clearing all votes...');
    await Vote.deleteMany({});
    console.log('All votes deleted');
    
    // Reset hasVoted flag for all users
    await User.updateMany({}, { hasVoted: false, votedAt: null });
    console.log('Reset all users voting status');
    
    console.log('\nDepartment Breakdown cleared! Users can vote again.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearVotes();