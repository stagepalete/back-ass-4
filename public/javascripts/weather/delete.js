$(document).ready(function () {
    $('.btn-delete').on('click', function () {
        const weatherId = $(this).data('weather-id');

        $.ajax({
            type: 'POST',
            url: `/admin/api/weather/delete/${weatherId}`,
            success: function (response) {
                window.location.href = window.location.href;
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    });
});