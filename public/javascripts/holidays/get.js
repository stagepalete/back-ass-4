$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: `/api/get-holidays`,
        success: function (response) {
            $('#holidays').html(response[0].name);
        },
        error: function (xhr, status, error) {
            console.log(error);
        }
    });
    $('#holidays').html();
});