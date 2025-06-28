"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../config/db"));
const Team_1 = __importDefault(require("../models/Team"));
const run = async () => {
    await (0, db_1.default)();
    const teams = await Team_1.default.find().select('name');
    for (const t of teams) {
        console.log(t.name);
    }
    process.exit(0);
};
run();
