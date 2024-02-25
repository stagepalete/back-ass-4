$(document).ready(function (){
    $('.btn-edit').on('click', function (){
        const id = $(this).data('user-id');
        const isadmin =$(this).data('user-is-admin');
        const username = $(this).data('user-username');
        const name = $(this).data('user-name');
        const lastname = $(this).data('user-lastname');
        const email = $(this).data('user-email');
        const country = $(this).data('user-country');
        const city = $(this).data('user-city');
        const data = {
            id, isadmin, username, name, lastname, email, country, city
        }
        console.log(typeof(isadmin));
        console.log(isadmin);
        $('#editForm').prop('action', `/admin/api/users/update/${id}`)
        $('#username').val(username);
        $('#name').val(name);
        $('#lastname').val(lastname);
        $('#email').val(email);
        $('#country-field').val(country);
        $('#city-field').val(city);
        if (isadmin === true){
            console.log($('#isadmin').val())
            $('#isadmin').prop('checked', true);
        }else{
            $('#isadmin').prop('checked', false);
        }
    });
});