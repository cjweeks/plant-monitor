
const mongoose = require('mongoose');
const dbUrl = require('./credentials.json').url;

function currentDate() {
    return Date.now();
}

// set up default mongoose connection
mongoose.connect(dbUrl);

// set mongoose promise to global promise
mongoose.Promise = global.Promise;

// get default connection
const db = mongoose.connection;

// bind connection to error event
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// define the schema for a set of data related to one sensor.
const SensorDataSetSchema = new mongoose.Schema({
    name: String,
    currentValue: Number,
    values: [Number],
    accumulationPeriod: Number,
    accumulator: {type: Number, default: 0},
    timeAccumulatorStart: {type: Number, default: currentDate},
    timeCurrentValueLastUpdated: Number,
    timeValuesLastModified: {type: Number, default: 0}
});

// compile model from schema
module.exports = mongoose.model('sensor_data_set', SensorDataSetSchema);
