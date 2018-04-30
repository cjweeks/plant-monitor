
/**
 * Chart colors to use at various states.
 * @type {string[]}
 */
var COLORS = ['#db4482', '#f2963a', '#3ddb93', '#f2963a', '#db4482'];

/**
 * Collection of charts indexed by sensor name.
 * @type {Chart[]}
 */
var charts = {};

/**
 * Creates all charts from the given list of names.
 */
function createCharts() {
    for (var i = 0; i < NAMES.length; i++) {
        var name = NAMES[i];
        charts[name] = new Chart(document.getElementById(name + '-chart').getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: name.replace(/^\w/, function (chr) {
                        return chr.toUpperCase();
                    }),
                    fill: false,
                    borderColor: 'rgb(61, 219, 147)',
                    data: []
                }]
            },
            options: {
                legend: {
                    display: false
                }
            }
        });
    }
}

function setChartData(chart, data, label, color) {
    chart.data.labels = label;
    chart.data.datasets[0].data = data;
    chart.data.datasets[0].borderColor = color;
    chart.update();
}

function createDataLabel(values) {
    var labels = [];
    for (var i = 0; i < values.length; i++) {
        labels.push(i);
    }
    return labels;
}

/**
 * Updates each chart based on the given input data.
 * @param data Array of sensor data.
 */
function updateCharts(data) {
    for (var i = 0; i < data.length; i++) {
        var name = data[i].name;
        var values = data[i].values;

        setChartData(
            charts[name],
            values,
            createDataLabel(values),
            COLORS[getRangeIndex(createRanges(data[i].preferredValue), average(values))]
        );
    }
}

/**
 * Periodic function to refresh all aspects of the display.
 */
function refresh() {
    refreshCurrentValues();
    refreshAverageFields(updateCharts);
}


$(document).ready(function () {
    createCharts();
    refresh();
    setInterval(refresh, REFRESH_TIME);
});