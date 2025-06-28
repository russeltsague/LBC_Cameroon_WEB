"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './LBC_backend02/.env' });
const uri = process.env.MONGO_URI;
const run = async () => {
    if (!uri) {
        console.error('MONGO_URI not set in environment.');
        process.exit(1);
    }
    await mongoose_1.default.connect(uri);
    try {
        const db = mongoose_1.default.connection.db;
        if (!db)
            throw new Error('No DB connection');
        const result = await db.collection('teams').dropIndex('name_1');
        console.log('Drop index result:', result);
    }
    catch (e) {
        const err = e;
        console.error('Error dropping index:', err.message || err);
    }
    finally {
        process.exit(0);
    }
};
run();
