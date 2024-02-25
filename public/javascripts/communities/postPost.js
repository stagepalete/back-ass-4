$(document).ready(function () {
    $('#post-add-btn').on('click', function() {
        const title = $('#post-title').val();
        const topic = $('#topic_name').val();
        const community_name = $('#post-add-btn').data('community-name');
        
        const content = $('#post-content').val();

        const data = {
            title: `${title}`, 
            content: content, 
            topic: topic, 
            community : community_name
        }

        if(!community_name){
            data.community = $('#community_name').val();
        }
        $.ajax({
            type: 'POST',
            url: `/api/posts/add`,
            data: data,
            success: function (response) {
                $('#addPostModal').hide();
                location.reload();
            },
            error: function (xhr, status, error) {
                const response = JSON.parse(xhr.responseText);
                const messages = $('#messages');
                messages.html(response.message);
            }
        });
    });
});