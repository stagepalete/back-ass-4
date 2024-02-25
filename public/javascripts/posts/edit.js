$(document).ready(function () {
    $('.btn-edit').on('click', function (event) {
        event.preventDefault();
        const postId = $(this).data('post-id');
        const communityId = $(this).data('community-id');
        const topicId = $(this).data('topic-id');
        const postTitle = $(this).data('post-title');
        const postContent = $(this).data('post-content');
        console.log(communityId, topicId, postTitle, postContent);

        $('#edittitle').val(postTitle);
        $('#edittopic').val(topicId); // Set the value of the select dropdown
        $('#editcontent').val(postContent);
        $('#editcommunity').val(communityId); // Set the value of the select dropdown
        $('#btn-edit-save').attr('data-post-id', postId);
        // Trigger change event for select dropdowns
        $('#edittopic').trigger('change');
        $('#editcommunity').trigger('change');
    });

    $('#btn-edit-save').on('click', function (event) {
        event.preventDefault();
        const postId = $(this).data('post-id');
        const data = {
            title: $('#edittitle').val(),
            content: $('#editcontent').val(),
            topic: $('#edittopic').val(),
            community: $('#editcommunity').val()
        };

        $.ajax({
            type: 'POST',
            url: `/admin/api/posts/edit/${postId}`,
            data: data,
            success: function (response) {
                window.location.href = window.location.href;
            },
            error: function (xhr, status, error) {
                console.log(error);
            }
        });
    });
});
