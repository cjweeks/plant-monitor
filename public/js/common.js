/**
 * Time in milliseconds between data refreshes.
 * @type {number}
 */
var REFRESH_TIME = 1000;

/**
 * The names associated to sensor data.
 * @type {string[]}
 */
var NAMES = ['temperature', 'light', 'moisture'];

var CLASSES = ['reading-bad', 'reading-slightly', 'reading-good', 'reading-slightly', 'reading-bad'];

var TEMPERATURE_COMMON_TEXT = [
    'The average daily temperature around your plant is {0}°F.',
    'The minimum and maximum temperatures in the past 24 hours were {1}°F and {2}°F, respectively.'
];

var LIGHT_COMMON_TEXT = [
    'The average daily amount of light around your plant is {0}%. Here, 0% indicates ' +
    'total darkness, and 100% indicates very direct light.',
    'The minimum and maximum amounts of light in the past 24 hours were {1}% and {2}%, respectively.'
];

var MOISTURE_COMMON_TEXT = [
    'The average daily moisture of your plant\'s soil is {0}%. Here, 0% indicates ' +
    'totally dry soil, and 100% indicates completely saturated soil.',
    'The minimum and maximum moisture values in the past 24 hours were {1}% and {2}%, respectively.'
];

var LABELS = ['Low', 'Slightly Low', 'Good', 'Slightly High'];
var TEXT = {
    temperature: [
        TEMPERATURE_COMMON_TEXT[0] +
        ' This amount is low, and you should consider moving your plant to a ' +
        'location with a higher average temperature. ' +
        TEMPERATURE_COMMON_TEXT[1],

        TEMPERATURE_COMMON_TEXT[0] +
        ' This amount acceptable but low. You may want to consider moving your plant to a ' +
        'location with a higher average temperature. ' +
        TEMPERATURE_COMMON_TEXT[1],

        TEMPERATURE_COMMON_TEXT[0] +
        ' This temperature is considered healthy. ' +
        TEMPERATURE_COMMON_TEXT[1],

        TEMPERATURE_COMMON_TEXT[0] +
        ' This amount acceptable but high. You may want to consider moving your plant to a ' +
        'location with a lower average temperature. ' +
        TEMPERATURE_COMMON_TEXT[1],

        TEMPERATURE_COMMON_TEXT[0] +
        ' This amount is high, and you should consider moving your plant to a ' +
        'location a lower average temperature. ' +
        TEMPERATURE_COMMON_TEXT[1],
    ],
    light: [
        LIGHT_COMMON_TEXT[0] +
        ' This amount is low, and you should consider moving your plant to a location with more light. ' +
        LIGHT_COMMON_TEXT[1],

        LIGHT_COMMON_TEXT[0] +
        ' This amount acceptable but low. You may want to consider moving your plant to a location with more light. ' +
        LIGHT_COMMON_TEXT[1],

        LIGHT_COMMON_TEXT[0] +
        ' This amount is considered healthy. ' +
        LIGHT_COMMON_TEXT[1],

        LIGHT_COMMON_TEXT[0] +
        ' This amount acceptable but high. You may want to consider moving your plant to a location with less light. ' +
        LIGHT_COMMON_TEXT[1],

        LIGHT_COMMON_TEXT[0] +
        ' This amount is high, and you should consider moving your plant to a location with less light. ' +
        LIGHT_COMMON_TEXT[1]
    ],
    moisture: [
        MOISTURE_COMMON_TEXT[0] +
        ' This amount is low, and you should consider watering your plant more often. ' +
        MOISTURE_COMMON_TEXT[1],

        MOISTURE_COMMON_TEXT[0] +
        ' This amount acceptable but low. You may want to consider watering your plant more often. ' +
        MOISTURE_COMMON_TEXT[1],

        MOISTURE_COMMON_TEXT[0] +
        ' This amount is considered healthy.' +
        MOISTURE_COMMON_TEXT[1],

        MOISTURE_COMMON_TEXT[0] +
        ' This amount acceptable but high. You may want to consider watering your plant less often. ' +
        MOISTURE_COMMON_TEXT[1],

        MOISTURE_COMMON_TEXT[0] +
        ' This amount is high, and you should consider watering your plant less often. ' +
        MOISTURE_COMMON_TEXT[1]
    ]
};

var averagesLastModified = 0;



/**
 * Calculates the average of the given array.
 * @param array The array to average.
 * @returns {number} The average of the array, or 0 if the array has length 0.
 */
function average(array) {
    if (array.length === 0) {
        return 0;
    }
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        sum += array[i];
    }
    return sum / array.length;
}

function getRangeIndex(range, value) {
    for (var i = 0; i < range.length; i++) {
        if (value < range[i]) {
            return i;
        }
    }
    return i + 1;
}

/**
 * Updates text fields and colors accounting for average values.
 * @param data
 */
function updateText(data) {
    for (var i = 0; i < data.length; i++) {
        var name = data[i].name;
        var averageValue = average(data[i].values);
        var min = data[i].values.min();
        var max = data[i].values.max();
        var index = getRangeIndex(data[i].ranges, averageValue);

        $('#' + name + '-heading').text(LABELS[index]);
        $('#' + name + '-info').text(TEXT[name][index].format(averageValue.toFixed(), min.toFixed(), max.toFixed()));
    }
}

/**
 * Refreshes the current sensor values by pulling from the server.
 */
function refreshCurrentValues() {
    $.get('/api/current-values', function (data) {
        for (var i = 0; i < NAMES.length; i++) {
            var name = NAMES[i];
            var reading = '---';
            if (data.hasOwnProperty(name)) {
                reading = data[name].toFixed(1);
            }
            $('#' + name + '-reading').text(reading);
        }
    });
}

/**
 * Refreshes objects that depend on average sensor values: charts, colors, and text.
 */
function refreshAverageFields(refreshFunction) {
    // first check if a change has occurred
    $.get('/api/time-last-modified', function (data) {
        if (data.lastModified > averagesLastModified) {
            // update charts and text
            console.log('Updating');
            averagesLastModified = Date.now();
            $.get('/api/all-data', function (data) {
                if (refreshFunction) {
                    refreshFunction(data);
                }
                updateText(data);
            });
        }
    });
}

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] !== 'undefined'
                ? args[number]
                : match
                ;
        });
    };
}

Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};