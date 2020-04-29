document.addEventListener('DOMContentLoaded', main);


function main(){
    const form = document.getElementById('form');
    const password = document.getElementById('password');
    const password2 = document.getElementById('password2');
    form.addEventListener('submit', validatePassword);

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


