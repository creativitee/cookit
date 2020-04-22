document.addEventListener('DOMContentLoaded', main);

function main(){
    const form = document.querySelector('#addList');
    const addTo = addElement(form, 'button', 'Add Ingredient');
    addTo.addEventListener('click', handleAdd);

    function handleAdd(evt){
        evt.preventDefault();
        const li = addElement(form, 'li', '');
        addInputElement(li, 'text', 'quantity', 'Quantity');
        addInputElement(li, 'text', 'itemName', 'Ingredient');
    }
}


//function that creates and appends element
function addElement(location, type, text) {
    const element = document.createElement(type);
    element.textContent = text;
    location.appendChild(element);
    return element;
}

function addInputElement(location, inputType, name, itemName) {
    const element = document.createElement('input');
    const label = document.createElement('label');
    label.textContent = itemName;
    element.name = name;
    element.type = inputType;
    location.appendChild(label);
    location.appendChild(element);
    return element;
}