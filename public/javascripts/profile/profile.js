// $(document).ready(function () {
//     function getUsernameFromPath() {
//         const path = window.location.pathname;
//         const parts = path.split('/');
//         return parts[parts.length - 1];
//     }

//     const username = getUsernameFromPath();
//     console.log(username);
//     $.ajax({
//         type: 'GET',
//         url: `/api/profile/${username}`,
//         success: function (response) {
//             console.log('Success: ', response);
//             if(response.redirect){
//                 window.location.href = response.redirect;
//             }
//         },
//         error: function (xhr, status, error) {
//             console.log(status, error, xhr);
//         }
//     });
// })