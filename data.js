
const SensorDataSet = require('./mongo');

const SECONDS_IN_MINUTE = 60;
const MINUTES_IN_HOUR = 60;
const ACCUMULATION_PERIOD = 5000; //SECONDS_IN_MINUTE * MINUTES_IN_HOUR * 1000;
const NUM_VALUES = 24;

function calculateAccumulationPeriod() {
    return ACCUMULATION_PERIOD - (Date.now() % ACCUMULATION_PERIOD);
}

module.exports = {
    /**
     * Gets the current sensor values for all sensors.
     * @param callback The function to call with the values.
     */
    getCurrentValues: callback => {
        SensorDataSet.find({}, 'name currentValue', (err, entries) => {
            if (err) {
                console.log(err);
            }
            const data = {};
            for (let i = 0; i < entries.length; i++) {
                data[entries[i].name] = entries[i].currentValue;
            }
            callback(data);
        });
    },

    /**
     * Gets the time each sensor value set was last modified. Note that this
     * time applies to the graph data and NOT the current values.
     * @param callback The function to call with the results.
     */
    getTimeLastModified: callback => {
        SensorDataSet.find({}, 'name timeValuesLastModified', (err, entries) => {
            if (err) {
                console.log(err);
            }
            let max = 0;
            for (let i = 0; i < entries.length; i++) {
                max = Math.max(max, entries[i].timeValuesLastModified);
            }
            callback({lastModified: max});
        });
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

                const newValue = parseFloat(values[name]);
                if (!isNaN(newValue)) {
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
                                // update average
                                const duration = currentTime - data.timeCurrentValueLastUpdated;
                                data.accumulator = data.accumulator + duration * data.currentValue;

                                // update current values
                                data.currentValue = newValue;
                                data.timeCurrentValueLastUpdated = currentTime;

                                // if the accumulation period is over, store a new value
                                const totalDuration = currentTime - data.timeAccumulatorStart;
                                if (totalDuration >= data.accumulationPeriod) {

                                    console.log('Seconds since last update: ---------------------' +
                                        '' + totalDuration / 1000);


                                    // correct for missed intervals (so we don't misplace a time label)
                                    for (let i = 1; i < Math.floor(totalDuration / ACCUMULATION_PERIOD); i++) {
                                        data.values.push(null);
                                    }


                                    // calculate final average and add
                                    const average = Math.round(data.accumulator / totalDuration);
                                    data.values.push(average);

                                    // remove oldest value if needed
                                    while (data.values.length > NUM_VALUES) {
                                        data.values.shift();
                                    }


                                    // reset times
                                    data.accumulator = 0;
                                    data.timeValuesLastModified = currentTime;
                                    data.timeAccumulatorStart = currentTime;

                                    // adjust accumulation period for next cycle if we went over
                                    data.accumulationPeriod = calculateAccumulationPeriod();
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
                                    ranges: [45, 60, 75, 90],
                                    values: [],
                                    accumulationPeriod: calculateAccumulationPeriod(),
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
                    console.log('Got malformed value ' + values[name]);
                }
            } else {
                status = 403;
            }
        }
        callback(status);
    }
};