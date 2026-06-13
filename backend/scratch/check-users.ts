import mongoose from 'mongoose';
import { User } from '../src/models/User.js';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_management_erp');
  console.log('Connected to DB');
  const users = await User.find({}).select('email role isActive firstName lastName');
  console.log('Users in DB:');
  console.log(JSON.stringify(users, null, 2));
  await mongoose.disconnect();
}

main().catch(console.error);
