import app from './app';
import connectDB from './config/db';
import './models'; // Import all models to ensure they are registered

const PORT = process.env.PORT || 5000;

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});