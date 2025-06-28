"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const AdminUser_1 = __importDefault(require("../models/AdminUser"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const createAdminUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lbc');
        console.log('Connected to MongoDB');
        // Check if admin user already exists
        const existingAdmin = await AdminUser_1.default.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }
        // Create new admin user
        const adminUser = new AdminUser_1.default({
            username: 'admin',
            password: 'admin123' // This will be hashed automatically
        });
        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Please change the password after first login!');
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
    finally {
        await mongoose_1.default.disconnect();
        process.exit(0);
    }
};
createAdminUser();
