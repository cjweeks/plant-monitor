
const SensorDataSet = require('mongo.js');

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const ACCUMULATION_PERIOD = SECONDS_IN_MINUTE * MINUTES_IN_HOUR * 1000;
const NUM_VALUES = 24;


function query(select, callback) {
    SensorDataSet.find({}, select, (err, entries) => {
        if (err) {
            console.log(err);
            callback([]);
        } else {
            callback(entries);
        }
    });
}

module.exports = {
    /**
     * Gets the current sensor values for all sensors.
     * @param callback The function to call with the values.
     */
    getCurrentValues: callback => {
        query('name currentValue', callback)
    },

    /**
     * Gets the time each sensor value set was last modified. Note that this
     * time applies to the graph data and NOT the current values.
     * @param callback The function to call with the results.
     */
    getTimeLastModified: callback => {
        query('name timeValuesLastModified', callback)
    },

    /**
     * Gets all sensor data.
     * @param callback Function to call with results.
     */
    getAllData: callback => {
        SensorDataSet.find({}, (err, entries) => {
            if (err) {
                console.log(err);
                callback([]);
            } else {
                callback(entries);
            }
        });
    },

    addValues: (values, callback) => {
        let status = 200;
        for (const name in values) {
            if (values.hasOwnProperty(name)) {
                // get current data to update
                SensorDataSet.findOne(
                    {name: name},
                    (err, data) => {
                        if (err) {
                            console.log(err);
                            return;
                        }

                        const currentTime = Date.now();

                        // if the entry already exists (usual case)
                        if (data) {

                            // update current values
                            data.currentValue = values[name];
                            data.timeCurrentValueLastUpdated = currentTime;

                            // update average
                            const duration = currentTime - data.timeCurrentValueLastUpdated;
                            data.accumulator = data.accumulator + duration * data.currentValue;

                            // if the accumulation period is over, store a new value
                            const totalDuration = currentTime - data.timeAccumulatorStart;
                            const values = data.values;
                            if (totalDuration >= data.accumulationPeriod) {

                                // calculate final average
                                const average = data.accumulator / totalDuration;

                                // remove oldest value if needed
                                if (values.length >= NUM_VALUES) {
                                    values.pop();
                                }

                                // add new value and reset times
                                values.push(average);
                                data.accumulator = 0;
                                data.timeValuesLastModified = currentTime;
                                data.timeAccumulatorStart = currentTime;

                                // adjust accumulation period for next cycle if we went over
                                data.accumulationPeriod = 2 * ACCUMULATION_PERIOD - totalDuration;
                            }

                            // save updated document
                            data.save(err => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        } else {
                            // create new entry
                            const sensorDataSet = new SensorDataSet({
                                name: name,
                                currentValue: values[name],
                                values: [],
                                accumulationPeriod: ACCUMULATION_PERIOD - (Date.now() % ACCUMULATION_PERIOD),
                                accumulator: 0,
                                timeAccumulatorStart: currentTime,
                                timeCurrentValueLastUpdated: currentTime,
                                timeValuesLastModified: 0
                            });

                            // save to database
                            sensorDataSet.save(err => {
                                console.log(err);
                            });
                        }
                    });
            } else {
                status = 403;
            }
        }
        callback(status);
    }
};