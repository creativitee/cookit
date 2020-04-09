// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');

// users
//get username and pw hash
const User = new mongoose.Schema({
  // username provided by authentication plugin 
  // password hash provided by authentication plugin (add salt to this)
  lists:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
  recipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }]
});

// an ingredient in a recipe 
// * includes the quantity of this item (multiple of the same item does not 
//   require additional Item documents; just increase the quantity!)
// * items in a list can be crossed off
const Ingredient = new mongoose.Schema({
  name: {type: String, required: true},
  quantity: {type: Number, min: 1, required: true},
  checked: {type: Boolean, default: false, required: true},
  recipe: [{type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'}]
}, {
  _id: true
});

// a inventory list
// * each list must have a related user
// * a list can have 0 or more items
const List = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  createdAt: {type: Date, required: true},
  items: [Ingredient]
});

const Recipe = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  createdAt: {type: Date, required: true},
  ingredients: [Ingredient],
  steps: [String]
});

// TODO: add remainder of setup for slugs, connection, registering models, etc. below

mongoose.model('User', User);
mongoose.model('Ingredient', Ingredient);

mongoose.model('List', List);
mongoose.model('Recipe', Recipe);

mongoose.connect('mongodb://localhost/db', {useNewUrlParser: true, useUnifiedTopology: true});