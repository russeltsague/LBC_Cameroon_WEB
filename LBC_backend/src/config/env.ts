import dotenv from 'dotenv';
dotenv.config();

// Validate environment variables
const requiredEnv = ['MONGO_URI', 'PORT'];
requiredEnv.forEach(env => {
  if (!process.env[env]) {
    throw new Error(`${env} environment variable is required`);
  }
});

export const PORT = process.env.PORT || 5000;