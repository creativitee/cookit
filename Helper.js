//necessary requires
require('./db');
const mongoose = require('mongoose');
const fs = require('fs');

const Ingredient = mongoose.model('Ingredient');


//Helper Class
class Helper {

  constructor() {

  }
  //add ingredients
  addIngredients(newRecipe) {
    for (const ingredient of newRecipe.ingredients) {
      const obj = {
        quantity: "1",
        name: ingredient.name,
      }
      Ingredient.updateOne(obj, { $push: { recipes: newRecipe._id } }, { upsert: true }, (err, result) => {
        if (err) {
          console.log(err);
        }
      });
    }
  }


  //readFile HoF
  readFile(fileName, successFn, errorFn){
    fs.readFile(fileName, function(err, data){
        if (err){
            errorFn(err);
        }
        else{
            successFn(data);
        }
    });
  }
}

//export the helper
module.exports = {
  Helper,
}