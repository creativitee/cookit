document.addEventListener('DOMContentLoaded', main);

function main(){
    const ingredient = document.querySelector('#addIngredients');
    const addToIngredients = addElement(ingredient, 'button', 'Add Ingredient');
    addToIngredients.addEventListener('click', handleIngredientAdd);

    const steps = document.querySelector('#addSteps');
    const addToSteps = addElement(steps, 'button', 'Add Step');
    addToSteps.addEventListener('click', handleStepAdd);

    function handleIngredientAdd(evt){
        evt.preventDefault();
        const li = addElement(ingredient, 'li', '');
        addInputElement(li, 'text', 'quantity', 'Quantity');
        addInputElement(li, 'text', 'itemName', 'Ingredient');
    }

    function handleStepAdd(evt){
        let i = 1;
        evt.preventDefault();
        const li = addElement(steps, 'li', '');
        addInputElement(li, 'text', 'step', '');
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