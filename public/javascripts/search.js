$(document).ready(function () {
    $('#search-btn').on('click', function (event) {
        event.preventDefault();
        const search = $('#search').val();
        window.location.href = `/search?search=${search}`;
    });
});