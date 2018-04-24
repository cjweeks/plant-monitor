
function refresh() {
    refreshCurrentValues();
    refreshAverageFields();
}

$(document).ready(function () {
    refresh();
    setInterval(refresh, REFRESH_TIME);
});