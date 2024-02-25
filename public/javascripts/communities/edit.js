$(document).ready(function() {
    $('.edit-community-button').on('click', function () {
        const communityName = $(this).data('community-name');
        const communityDescription = $(this).data('community-description');
        const communityRules = $(this).data('community-rules');
        $('#communityName').val(communityName);
        $('#communityDescription').val(communityDescription);
        $('#communityRules').val(communityRules);
        $('#editCommunityModal').modal('show');
        $('#editCommunityForm').attr('action', `/admin/api/communities/edit/${communityName}`)
    });

    $('.delete-community-button').on('click', function () {
        const communityName = $(this).data('community-name');
        $('#deleteCommunityModal').modal('show');
        console.log(communityName);
    });
});
