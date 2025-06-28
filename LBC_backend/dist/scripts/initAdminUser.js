"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const AdminUser_1 = __importDefault(require("../models/AdminUser"));
const db_1 = __importDefault(require("../config/db"));
dotenv_1.default.config({ path: './LBC_backend02/.env' });
const username = 'lbcadmin';
const password = 'lbc@dmin1';
const createOrUpdateAdmin = async () => {
    try {
        await (0, db_1.default)();
        console.log('Connected to MongoDB');
        let admin = await AdminUser_1.default.findOne({ username });
        if (admin) {
            admin.password = password;
            await admin.save();
            console.log('Admin user password updated.');
        }
        else {
            await AdminUser_1.default.create({ username, password });
            console.log('Admin user created.');
        }
        process.exit(0);
    }
    catch (err) {
        console.error('Error creating admin user:', err);
        process.exit(1);
    }
};
createOrUpdateAdmin();
