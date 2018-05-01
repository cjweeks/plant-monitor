
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

var FORMATS = {
    temperature: {
        precision: 1,
        percent: false
    },
    light: {
        precision: 0,
        percent: true
    },
    moisture: {
        precision: 0,
        percent: true
    }
};

var CLASS_PREFIXES = ['bad', 'slightly', 'good', 'slightly', 'bad'];

var TEMPERATURE_COMMON_TEXT = [
    'The average daily temperature around your plant is <b>{0}°F</b>.',
    'The minimum and maximum temperatures in the past 24 hours were <b>{1}°F</b> and <b>{2}°F</b>, respectively.'
];

var LIGHT_COMMON_TEXT = [
    'The average daily amount of light around your plant is <b>{0}</b>%. Here, 0% indicates ' +
    'total darkness, and 100% indicates very direct light.',
    'The minimum and maximum amounts of light in the past 24 hours were <b>{1}%</b> and <b>{2}%</b>, respectively.'
];

var MOISTURE_COMMON_TEXT = [
    'The average daily moisture of your plant\'s soil is <b>{0}</b>%. Here, 0% indicates ' +
    'totally dry soil, and 100% indicates completely saturated soil.',
    'The minimum and maximum moisture values in the past 24 hours were <b>{1}%</b> and <b>{2}%</b>, respectively.'
];

var LABELS = ['Low', 'Slightly Low', 'Good', 'Slightly High', 'High'];

var TEXT = {
    temperature: [
        TEMPERATURE_COMMON_TEXT[0] +
        ' This amount is low, and you should <b>consider moving your plant to a ' +
        'location with a higher average temperature.</b> ' +
        TEMPERATURE_COMMON_TEXT[1],

        TEMPERATURE_COMMON_TEXT[0] +
        ' This amount acceptable but low. You may want to <b>consider moving your plant to a ' +
        'location with a higher average temperature.</b> ' +
        TEMPERATURE_COMMON_TEXT[1],

        TEMPERATURE_COMMON_TEXT[0] +
        ' This temperature is considered healthy. ' +
        TEMPERATURE_COMMON_TEXT[1],

        TEMPERATURE_COMMON_TEXT[0] +
        ' This amount acceptable but high. You may want to <b>consider moving your plant to a ' +
        'location with a lower average temperature.</b> ' +
        TEMPERATURE_COMMON_TEXT[1],

        TEMPERATURE_COMMON_TEXT[0] +
        ' This amount is high, and you should <b>consider moving your plant to a ' +
        'location a lower average temperature.</b> ' +
        TEMPERATURE_COMMON_TEXT[1],
    ],
    light: [
        LIGHT_COMMON_TEXT[0] +
        ' This amount is low, and you should <b>consider moving your plant to a location with more light.</b> ' +
        LIGHT_COMMON_TEXT[1],

        LIGHT_COMMON_TEXT[0] +
        ' This amount acceptable but low. You may want to <b>consider moving your plant ' +
        'to a location with more light.</b> ' +
        LIGHT_COMMON_TEXT[1],

        LIGHT_COMMON_TEXT[0] +
        ' This amount is considered healthy. ' +
        LIGHT_COMMON_TEXT[1],

        LIGHT_COMMON_TEXT[0] +
        ' This amount acceptable but high. You may want to <b>consider moving your plant ' +
        'to a location with less light.</b> ' +
        LIGHT_COMMON_TEXT[1],

        LIGHT_COMMON_TEXT[0] +
        ' This amount is high, and you should <b>consider moving your plant to a location with less light.</b> ' +
        LIGHT_COMMON_TEXT[1]
    ],
    moisture: [
        MOISTURE_COMMON_TEXT[0] +
        ' This amount is low, and you should <b>consider watering your plant more often.</b> ' +
        MOISTURE_COMMON_TEXT[1],

        MOISTURE_COMMON_TEXT[0] +
        ' This amount acceptable but low. You may want to <b>consider watering your plant more often.</b> ' +
        MOISTURE_COMMON_TEXT[1],

        MOISTURE_COMMON_TEXT[0] +
        ' This amount is considered healthy.' +
        MOISTURE_COMMON_TEXT[1],

        MOISTURE_COMMON_TEXT[0] +
        ' This amount acceptable but high. You may want to <b>consider watering your plant less often.</b> ' +
        MOISTURE_COMMON_TEXT[1],

        MOISTURE_COMMON_TEXT[0] +
        ' This amount is high, and you should <b>consider watering your plant less often.</b> ' +
        MOISTURE_COMMON_TEXT[1]
    ]
};

var averagesLastModified = 0;

/**
 * Creates an array of ranges to use when ranking a reading.
 * @param preferredValue The preferred average value to center the range around.
 * @return The generated array.
 */
function createRanges(preferredValue) {
    return [
        preferredValue - 10,
        preferredValue - 5,
        preferredValue + 5,
        preferredValue + 10
    ];
}
/**
 * Calculates the average of the given array.
 * @param array The array to average.
 * @returns {number} The average of the array, or 0 if the array has length 0.
 */
function average(array) {
    var numElements = 0;
    var sum = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i] !== null) {
            numElements++;
            sum += array[i];
        }
    }
    return numElements === 0 ? 0 : sum / numElements;
}

// TODO fix this for actual times
function getRangeIndex(ranges, value) {
    console.log(ranges);
    for (var i = 0; i < ranges.length; i++) {
        if (value < ranges[i]) {
            return i;
        }
    }
    return ranges.length;
}

function formatCurrentValue(name, currentValue) {
    var format = FORMATS[name];
    if (!format) {
        return currentValue;
    }

    var formatted = currentValue.toFixed(format.precision).toString();
    if (format.percent) {
        formatted += '%';
    }

    return formatted;

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
        var index = getRangeIndex(createRanges(data[i].preferredValue), averageValue);

        $('#' + name + '-heading').text(LABELS[index])[0].className = CLASS_PREFIXES[index];
        $('#' + name + '-info').html(TEXT[name][index].format(averageValue.toFixed(), min.toFixed(), max.toFixed()));
        $('#' + name + '-reading')[0].className = 'element reading ' + CLASS_PREFIXES[index] + '-bg';
        $('#' + name + '-label')[0].className = 'element reading-label ' + CLASS_PREFIXES[index];
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
                reading = formatCurrentValue(name, data[name]);
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

// add a simple format function for strings
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

// add max and min functions for arrays
Array.prototype.max = function() {
    return Math.max.apply(null, this);
};
Array.prototype.min = function() {
    return Math.min.apply(null, this);
};