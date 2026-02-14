const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/eduresume';

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
