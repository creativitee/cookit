require('./db');
const mongoose = require('mongoose');
const fs = require('fs');

const Ingredient = mongoose.model('Ingredient');
const Recipe = mongoose.model('Recipe');


class Helper {

  constructor() {

  }
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

  //add sample recipes
  loadRecipes() {
    () => {
    fs.readFile('sample-recipes.json', function (err, data) {
      if (err) {
        console.log(err);
      }
      else {
        const d = JSON.parse(data);
        for (const recipe of d) {
          recipe.nameQuery = recipe.name.replace(/\s+/g, '');
          recipe._id = mongoose.Types.ObjectId();
          const newRecipe = new Recipe(recipe);
          newRecipe.save((err, newRecipe) => {
            if (err) {
              console.log(err);
            }
            else {
              this.addIngredients(newRecipe);
            }
          })
        }
      }
    })
  }
  };

}

module.exports = {
  Helper,
}