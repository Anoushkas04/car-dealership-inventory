import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { initDatabase } from './db/database';
import { seedDatabase } from './db/seed';

const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    initDatabase();
    await seedDatabase();

    const app = createApp();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚗 Car Dealership Inventory API is running!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🛡️  Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔑 Demo Admin: admin / admin123`);
      console.log(`👤 Demo User:  customer / customer123`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
