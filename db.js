// 1ST DRAFT DATA MODEL
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

// users
//get username and pw hash
const User = new mongoose.Schema({
  // username provided by authentication plugin 
  // password hash provided by authentication plugin (add salt to this)
  _id : mongoose.Schema.Types.ObjectID,
  username: String,
  password: String,

});

// an ingredient in a recipe 
// * includes the quantity of this item (multiple of the same item does not 
//   require additional Item documents; just increase the quantity!)
// * items in a list can be crossed off
const Ingredient = new mongoose.Schema({
  quantity: {type: String, required: true},
  name: {type: String, required: true},
  checked: {type: Boolean, default: true},
  recipes: [{type: mongoose.Schema.Types.ObjectId, ref: 'Recipe'}]
});

// a inventory list
// * each list must have a related user
// * a list can have 0 or more items
const List = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  name: {type: String, required: true},
  nameQuery : String,
  items: [Ingredient]
});

const Recipe = new mongoose.Schema({
  // user: {type: mongoose.Schema.Types.ObjectId, ref:'User'},
  _id : mongoose.Schema.Types.ObjectID,
  name: {type: String, required: true},
  nameQuery : String,
  ingredients: [Ingredient],
  steps: [String]
});

// TODO: add remainder of setup for slugs, connection, registering models, etc. below

User.plugin(passportLocalMongoose);
mongoose.model('User', User);

mongoose.model('Ingredient', Ingredient);
mongoose.model('List', List);
mongoose.model('Recipe', Recipe);


// is the environment variable, NODE_ENV, set to PRODUCTION? 
let dbconf;
if (process.env.NODE_ENV === 'PRODUCTION') {
 // if we're in PRODUCTION mode, then read the configration from a file
 // use blocking file io to do this...
 const fs = require('fs');
 const path = require('path');
 const fn = path.join(__dirname, 'config.json');
 const data = fs.readFileSync(fn);

 // our configuration file will be in json, so parse it and set the
 // conenction string appropriately!
 const conf = JSON.parse(data);
 dbconf = conf.dbconf;
} else {
 // if we're not in PRODUCTION mode, then use
 dbconf = 'mongodb://localhost/final';
}

// mongoose.connect('mongodb://localhost/final', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(dbconf, {useNewUrlParser: true, useUnifiedTopology: true});  