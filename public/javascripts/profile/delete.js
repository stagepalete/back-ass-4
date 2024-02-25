$(document).ready(function () {
    
    $('.btn-delete').on('click', function () {
        const username = $(this).data('username');

        $.ajax({
            type: 'POST',
            url: `/admin/api/users/delete/${username}`,
            success: function (response) {
                window.location.href = window.location.href;
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    });
});