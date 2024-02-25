$(document).ready(function () {
    $('.btn-delete').on('click', function () {
        const id = $(this).data('post-id');

        $.ajax({
            type: 'POST',
            url: `/admin/api/posts/delete/${id}`,
            success: function (response) {
                window.location.href = window.location.href;
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    });
}); 