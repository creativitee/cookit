document.addEventListener('DOMContentLoaded', main);

function main(){
    const form = document.querySelector('#addList');
    const addTo = addElement(form, 'button', 'Add Ingredient');
    addTo.addEventListener('click', handleAdd);

    function handleAdd(evt){
        evt.preventDefault();
        const li = addElement(form, 'li', 'Ingredient ');
        addInputElement(li, 'text', 'quantity');
        addInputElement(li, 'text', 'itemName');
    }
}


//function that creates and appends element
function addElement(location, type, text) {
    const element = document.createElement(type);
    element.textContent = text;
    location.appendChild(element);
    return element;
}

function addInputElement(location, inputType, name) {
    const element = document.createElement('input');
    element.name = name;
    element.type = inputType;
    location.appendChild(element);
    return element;
}