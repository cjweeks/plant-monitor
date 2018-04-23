

var REFRESH_TIME = 1000;

function refresh() {
    $.get('/api/current-values', function (data) {
        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                $('#' + name + '-reading').text(data[name]);
            }
        }
    });
}

$(document).ready(function () {

    refresh();
    setInterval(REFRESH_TIME, refresh);






    // var context = document.getElementById('temperature-chart').getContext('2d');
    // var chart = new Chart(context, {
    //     // The type of chart we want to create
    //     type: 'line',
    //
    //     // The data for our dataset
    //     data: {
    //         labels: [
    //             '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
    //             '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
    //         ],
    //         datasets: [{
    //             label: 'Temperature',
    //             fill: false,
    //             borderColor: 'rgb(61, 219, 147)',
    //             data: [
    //                 65, 66, 65, 64, 65, 66, 66, 68, 69, 70, 72, 74,
    //                 74, 76, 76, 77, 75, 74, 73, 72, 70, 68, 68, 67
    //             ]
    //         }]
    //     },
    //
    //     // Configuration options go here
    //     options: {
    //         legend: {
    //             display: false
    //         }
    //     }
    // });
    //
    // var context2 = document.getElementById('light-chart').getContext('2d');
    // var chart2 = new Chart(context2, {
    //     // The type of chart we want to create
    //     type: 'line',
    //
    //     // The data for our dataset
    //     data: {
    //         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //         datasets: [{
    //             label: 'My First dataset',
    //             fill: false,
    //             borderColor: 'rgb(61, 219, 147)',
    //             data: [0, 10, 5, 2, 20, 30, 45]
    //         }]
    //     },
    //
    //     // Configuration options go here
    //     options: {
    //         legend: {
    //             display: false
    //         }
    //     }
    // });
    //
    // var context3 = document.getElementById('moisture-chart').getContext('2d');
    // var chart3 = new Chart(context3, {
    //     // The type of chart we want to create
    //     type: 'line',
    //
    //     // The data for our dataset
    //     data: {
    //         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //         datasets: [{
    //             label: 'My First dataset',
    //             fill: false,
    //             borderColor: 'rgb(61, 219, 147)',
    //             data: [0, 10, 5, 2, 20, 30, 45]
    //         }]
    //     },
    //
    //     // Configuration options go here
    //     options: {
    //         legend: {
    //             display: false
    //         }
    //     }
    // });
});