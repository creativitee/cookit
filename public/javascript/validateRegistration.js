//defer content
document.addEventListener('DOMContentLoaded', main);


//main function
function main(){
    //get the registration form
    const form = document.getElementById('form');
    const password = document.getElementById('password');
    const password2 = document.getElementById('password2');

    //add event listneer
    form.addEventListener('submit', validatePassword);


    //validate the password
    function validatePassword(evt){
        if (password.value !== password2.value) {
            password.setCustomValidity('Passwords must match.');
            evt.preventDefault();
        if (password.length < 8){
            password.setCustomValidity('Password length must be at least eight characters.')
            evt.preventDefault();
        }
        } else {
            password.setCustomValidity('');
        }
    }
}


