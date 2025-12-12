const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define minimal schemas to read data
const TeamSchema = new Schema({
    name: String,
    category: String,
    poule: String
}, { strict: false });

const CalendarSchema = new Schema({
    category: String,
    poules: [{
        name: String,
        teams: [String]
    }]
}, { strict: false });

const Team = mongoose.model('Team', TeamSchema);
const Calendar = mongoose.model('Calendar', CalendarSchema);

async function inspectData() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://russeltsague3:tZylvRuRn745zyUU@cluster0.evxhanf.mongodb.net/LBC_2025_2026?retryWrites=true&w=majority&appName=Cluster0');
        console.log('Connected to MongoDB');

        const category = 'U18 GARCONS';

        console.log(`\n--- Checking Calendar for ${category} ---`);
        const calendar = await Calendar.findOne({ category });
        if (calendar) {
            console.log('Calendar found.');
            if (calendar.poules) {
                calendar.poules.forEach(p => {
                    console.log(`Poule ${p.name} teams:`, p.teams);
                });
            } else {
                console.log('No poules in calendar.');
            }
        } else {
            console.log('Calendar NOT found.');
        }

        console.log(`\n--- Checking Teams for ${category} ---`);
        const teams = await Team.find({ category });
        console.log(`Found ${teams.length} teams with category '${category}':`);
        teams.forEach(t => console.log(`- Name: '${t.name}', Poule: '${t.poule}'`));

        console.log(`\n--- Checking Category for ${category} ---`);
        const CategorySchema = new Schema({ name: String, poules: [String] }, { strict: false });
        const Category = mongoose.model('Category', CategorySchema);
        const catData = await Category.findOne({ name: category });
        if (catData) {
            console.log('Category found:', catData.name);
            console.log('Poules:', catData.poules);
        } else {
            console.log('Category NOT found.');
        }

        console.log(`\n--- Checking All Teams (first 20) ---`);
        const allTeams = await Team.find().limit(20);
        allTeams.forEach(t => console.log(`- Name: '${t.name}', Category: '${t.category}'`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

inspectData();
