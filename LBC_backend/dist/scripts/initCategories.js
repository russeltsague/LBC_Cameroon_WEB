"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Category_1 = __importDefault(require("../models/Category"));
const db_1 = __importDefault(require("../config/db"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: './LBC_backend02/.env' });
const defaultCategories = [
    {
        name: 'L1 MESSIEUR',
        description: 'Ligue 1 Messieurs - Division principale',
        hasPoules: false,
        poules: [],
        isActive: true
    },
    {
        name: 'L1 DAME',
        description: 'Ligue 1 Dames - Division principale',
        hasPoules: false,
        poules: [],
        isActive: true
    },
    {
        name: 'L2A MESSIEUR',
        description: 'Ligue 2A Messieurs - Division secondaire',
        hasPoules: true,
        poules: ['A', 'B'],
        isActive: true
    },
    {
        name: 'L2B MESSIEUR',
        description: 'Ligue 2B Messieurs - Division secondaire',
        hasPoules: false,
        poules: [],
        isActive: true
    },
    {
        name: 'U18 GARCONS',
        description: 'U18 Garçons - Catégorie jeunes',
        hasPoules: true,
        poules: ['A', 'B', 'C'],
        isActive: true
    },
    {
        name: 'U18 FILLES',
        description: 'U18 Filles - Catégorie jeunes',
        hasPoules: false,
        poules: [],
        isActive: true
    },
    {
        name: 'VETERANS',
        description: 'Vétérans - Catégorie senior',
        hasPoules: false,
        poules: [],
        isActive: true
    },
    {
        name: 'CORPORATES',
        description: 'Corporate - Compétition entreprise',
        hasPoules: false,
        poules: [],
        isActive: true
    }
];
const initCategories = async () => {
    try {
        await (0, db_1.default)();
        console.log('Connected to MongoDB');
        // Clear existing categories
        await Category_1.default.deleteMany({});
        console.log('Cleared existing categories');
        // Insert default categories
        const categories = await Category_1.default.insertMany(defaultCategories);
        console.log(`Inserted ${categories.length} default categories`);
        console.log('Categories initialization completed successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error initializing categories:', error);
        process.exit(1);
    }
};
initCategories();
