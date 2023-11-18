const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
  } catch (err) {
    console.error(err.message);
    process.exit(1); // Exit the process with a failure code
  }
};

module.exports = connectDB;