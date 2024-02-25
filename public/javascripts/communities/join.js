$(document).ready(function () {
    $('#join-btn').on('click', function () {
        const community_name = $(this).data('community-name');
        $.ajax({
            type: 'POST',
            url: `/api/community/${community_name}/join`,
            success: function (response) {
                $('#join-btn').remove();
                $('#memberCounter').html(response.members.length);
                $('#add-post-button').show();
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    });
});