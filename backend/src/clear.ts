import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nacos-voting';
    await mongoose.connect(mongoURI);
    
    console.log('Dropping entire database...');
    await mongoose.connection.dropDatabase();
    console.log('Database completely cleared!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

clearDatabase();