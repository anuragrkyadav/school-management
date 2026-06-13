import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { hashPassword } from '../src/utils/password.js';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_management_erp');
  console.log('Connected to DB');
  
  const user = await User.findOne({ email: 'talibrary@gmail.com' });
  if (!user) {
    console.error('User not found');
    await mongoose.disconnect();
    return;
  }

  const hash = await hashPassword('123');
  user.passwordHash = hash;
  await user.save();
  
  console.log('Password updated successfully for talibrary@gmail.com to "123"');
  await mongoose.disconnect();
}

main().catch(console.error);
