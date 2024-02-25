$(document).ready(function () {
    $('.upvote-btn').on('click', function() {
        const post_id = $(this).data('post-id');
        let isLiked = $(this).data('is-liked');

        if (!isLiked) {
            $.ajax({
                type: 'POST',
                url: `/api/posts/${post_id}/upvote/add`,
                success: function (response) {
                    $('#likeImage'+post_id).prop('src', '/images/icons/liked.png');
                    $(this).data('is-liked', 1); // Update is-liked using data()
                    isLiked = 1;
                    $('#upvoteCounter'+post_id).html(response.upvotes.length);
                },
                error: function (xhr, status, error) {
                    const response = JSON.parse(xhr.responseText);
                    const messages = $('#messages');
                    messages.html(response.message);
                }
            });
        } else {
            $.ajax({
                type: 'POST',
                url: `/api/posts/${post_id}/upvote/delete`,
                success: function (response) {
                    $('#likeImage'+post_id).prop('src', '/images/icons/likes.png');
                    $(this).data('is-liked', 0); // Update is-liked using data()
                    isLiked = 0;
                    $('#upvoteCounter'+post_id).html(response.upvotes.length);
                },
                error: function (xhr, status, error) {
                    const response = JSON.parse(xhr.responseText);
                    const messages = $('#messages');
                    messages.html(response.message);
                }
            });
        }
    });

    $('.downvote-btn').on('click', function() {
        const post_id = $(this).data('post-id');
        let isDisliked = $(this).data('is-disliked');
    
        if (!isDisliked) {
            $.ajax({
                type: 'POST',
                url: `/api/posts/${post_id}/downvote/add`,
                success: function (response) {
                    $('#dislikeImage'+post_id).prop('src', '/images/icons/disliked.png');
                    $(this).data('is-disliked', 1); // Update is-liked using data()
                    isDisliked = 1;
                    $('#downvoteCounter'+post_id).html(response.downvotes.length);
                },
                error: function (xhr, status, error) {
                    const response = JSON.parse(xhr.responseText);
                    const messages = $('#messages');
                    messages.html(response.message);
                }
            });
        } else {
            $.ajax({
                type: 'POST',
                url: `/api/posts/${post_id}/downvote/delete`,
                success: function (response) {
                    $('#dislikeImage'+post_id).prop('src', '/images/icons/dislikes.png');
                    $(this).data('is-disliked', 0); // Update is-liked using data()
                    isDisliked = 0;
                    $('#downvoteCounter'+post_id).html(response.downvotes.length);
                },
                error: function (xhr, status, error) {
                    const response = JSON.parse(xhr.responseText);
                    const messages = $('#messages');
                    messages.html(response.message);
                }
            });
        }
    });
});