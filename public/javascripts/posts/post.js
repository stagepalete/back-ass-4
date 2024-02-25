$(document).ready(function () {
    $('#leave-comment-btn').on('click', (event) => {
        const post_id = $('#leave-comment-btn').data('post-id');
        const comment = $('#comment').val();
        const data = {
            comment : comment
        }
        $.ajax({
            type: 'POST',
            url: `/api/posts/${post_id}/comment/add`,
            data: data,
            success: function (response) {
                const user = response.comments.length - 1;
                $('#commentCounter').html(response.comments.length);
                $('#comments').prepend(`
                    <div class="comment">
                        <strong><a href="/profile/${response.comments[user].user.username}" class="text-dark text-decoration-none">
                            ${response.comments[user].user.username}
                        </a>: ${response.comments[user].comment}<br></strong>
                        ${new Date(response.comments[user].createdAt).toLocaleString()}
                    </div>
                `);
            },
            error: function (xhr, status, error) {
                const response = JSON.parse(xhr.responseText);
                const messages = $('#messages');
                messages.html(response.message);
            }
        });
    });

    $('#upvote-btn').on('click', () => {
        const post_id = $('#upvote-btn').data('post-id');
        let isLiked = $('#upvote-btn').data('is-liked');
    
        if (!isLiked) {
            $.ajax({
                type: 'POST',
                url: `/api/posts/${post_id}/upvote/add`,
                success: function (response) {
                    $('#likeImage').prop('src', '/images/icons/liked.png');
                    $('#upvote-btn').data('is-liked', 1); // Update is-liked using data()
                    isLiked = 1;
                    $('#upvoteCounter').html(response.upvotes.length);
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
                    $('#likeImage').prop('src', '/images/icons/likes.png');
                    $('#upvote-btn').data('is-liked', 0); // Update is-liked using data()
                    isLiked = 0;
                    $('#upvoteCounter').html(response.upvotes.length);
                },
                error: function (xhr, status, error) {
                    const response = JSON.parse(xhr.responseText);
                    const messages = $('#messages');
                    messages.html(response.message);
                }
            });
        }
    });


    $('#downvote-btn').on('click', () => {
        const post_id = $('#downvote-btn').data('post-id');
        let isDisliked = $('#downvote-btn').data('is-disliked');
    
        if (!isDisliked) {
            $.ajax({
                type: 'POST',
                url: `/api/posts/${post_id}/downvote/add`,
                success: function (response) {
                    $('#dislikeImage').prop('src', '/images/icons/disliked.png');
                    $('#downvote-btn').data('is-disliked', 1); // Update is-liked using data()
                    isDisliked = 1;
                    $('#downvoteCounter').html(response.downvotes.length);
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
                    $('#dislikeImage').prop('src', '/images/icons/dislikes.png');
                    $('#downvote-btn').data('is-disliked', 0); // Update is-liked using data()
                    isDisliked = 0;
                    $('#downvoteCounter').html(response.downvotes.length);
                },
                error: function (xhr, status, error) {
                    const response = JSON.parse(xhr.responseText);
                    const messages = $('#messages');
                    messages.html(response.message);
                }
            });
        }
    })
    
    
});