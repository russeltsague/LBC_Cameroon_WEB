import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminUser from '../models/AdminUser';
import connectDB from '../config/db';

dotenv.config({ path: './LBC_backend02/.env' });

const username = 'lbcadmin';
const password = 'lbc@dmin1';

const createOrUpdateAdmin = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    let admin = await AdminUser.findOne({ username });
    if (admin) {
      admin.password = password;
      await admin.save();
      console.log('Admin user password updated.');
    } else {
      await AdminUser.create({ username, password });
      console.log('Admin user created.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err);
    process.exit(1);
  }
};

createOrUpdateAdmin(); 