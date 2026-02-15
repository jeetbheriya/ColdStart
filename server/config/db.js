require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = async () => {
  // Check if the URL exists before trying to connect
  if (!process.env.DB_URL) {
    console.error("❌ Error: DB_URL is not defined in .env file");
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.DB_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;