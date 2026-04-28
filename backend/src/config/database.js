const mongoose = require('mongoose');
const { dbQueryDurationSeconds } = require('../metrics');

const connectDB = async () => {
    try {
        mongoose.plugin((schema) => {
            const ops = ['find', 'findOne', 'findOneAndUpdate', 'update', 'updateOne', 'updateMany', 'deleteOne', 'deleteMany', 'aggregate', 'countDocuments'];
            ops.forEach(op => {
                schema.pre(op, function() {
                    this._startTime = Date.now();
                });
                schema.post(op, function() {
                    if (this._startTime) {
                        const durationSeconds = (Date.now() - this._startTime) / 1000;
                        dbQueryDurationSeconds.observe(
                            { operation: op, model: this.model ? this.model.modelName : 'unknown' },
                            durationSeconds
                        );
                    }
                });
            });
            
            schema.pre('save', function(next) {
                this._startTime = Date.now();
                next();
            });
            schema.post('save', function(doc, next) {
                if (this._startTime) {
                    const durationSeconds = (Date.now() - this._startTime) / 1000;
                    dbQueryDurationSeconds.observe(
                        { operation: 'save', model: this.constructor.modelName },
                        durationSeconds
                    );
                }
                next();
            });
        });

        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${connection.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
