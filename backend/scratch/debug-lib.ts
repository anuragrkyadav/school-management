import mongoose from 'mongoose';
import { User } from '../src/models/User.js';
import { signAccessToken } from '../src/config/jwt.js';
import fetch from 'node-fetch';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/school_management_erp');
  const user = await User.findOne({ email: 'talibrary@gmail.com' });
  if (!user) {
    console.error('User not found');
    await mongoose.disconnect();
    return;
  }
  const token = signAccessToken({
    sub: user._id.toString(),
    email: user.email,
    fullName: `${user.firstName} ${user.lastName}`,
    role: user.role,
  });
  await mongoose.disconnect();

  const endpoints = [
    '/library/books',
    '/library/circulations',
    '/library/ebooks',
    '/library/reservations'
  ];

  for (const ep of endpoints) {
    const url = `http://127.0.0.1:5001/api/v1${ep}`;
    console.log(`Calling GET ${url}`);
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`Status for ${ep}:`, res.status);
    const text = await res.text();
    console.log(`Response for ${ep}:`, text.slice(0, 500));
    console.log('---');
  }
}

main().catch(console.error);
