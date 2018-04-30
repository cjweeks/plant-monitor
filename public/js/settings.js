

$(document).ready(function () {
    // get initial values
    $.get('/api/preferred-values', function (data) {
        for (var i = 0; i < NAMES.length; i++) {
            var name = NAMES[i];
            if (data.hasOwnProperty(name)) {
                $('#' + name).val(data[name]);
            }
        }
    });

    // add listeners to set new values
    $('.form-control').change(function () {
        var name = $(this).attr('id');
        var newValue = $(this).val();
        var data = {};
        data[name] = newValue;
        $.post('/api/set-preferred-values', data, function (data) {
            console.log(data);
        });
    })
});