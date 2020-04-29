
//necessary imports
require('./db');

const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const help = require('./helper.js')

const helper = new help.Helper();


//mongoose
const Ingredient = mongoose.model('Ingredient');
const List = mongoose.model('List');
const Recipe = mongoose.model('Recipe');
const User = mongoose.model('User');

// enable sessions
const session = require('express-session');
const sessionOptions = {
  secret: 'superdupersecret',
  resave: true,
  saveUninitialized: true
};
app.use(session(sessionOptions));


//passport setup
app.use(passport.initialize());
app.use(passport.session());

//configure
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));




////////////////////////
/////Route Handling/////
////////////////////////


//base page
app.get('/', (req, res) => {
  res.render('startPage');
})

//home page
app.get("/home", isLoggedIn, function (req, res) {
  res.render('home');
})


//createList page
app.get('/createList', isLoggedIn
  , (req, res) => {
    res.render('createlist');
  });


//list page
app.post('/home', isLoggedIn, function (req, res) {

  //create list of ingredients
  const ingredients = [];

  let itemNames = req.body.itemName;
  let quantities = req.body.quantity;


  //turn the list into an array if it is only a string
  if (typeof itemNames === 'string' && typeof quantities === 'string') {
    itemNames = [itemNames];
    quantites = [quantities];
  }


  //get all items 
  for (let i = 0; i < itemNames.length; i++) {

    //add the ingredients to the list
    if (quantities[i] !== "" && itemNames[i] !== "") {
      const obj = {
        quantity: quantities[i],
        name: itemNames[i],
        checked: true
      }
      console.log(obj);
      const newIngredient = new Ingredient(obj);
      ingredients.push(newIngredient);
    }
  }

  //generate list object
  const listObj = {
    user: req.user._id,
    name: req.body.listName,
    nameQuery: req.body.listName.replace(/\s+/g, ''),
    items: ingredients
  }


  //save the list
  const newList = new List(listObj);
  newList.save((err, newList) => {
    console.log(newList);
    if (err) {
      console.log(err);
    }
    else {
      res.redirect('/home');
    }

  });
});


//my list page
app.get('/myLists', isLoggedIn, function (req, res) {
  //query object
  const query = { user: req.user._id };

  //check if query exists
  if (Object.prototype.hasOwnProperty.call(req.query, 'queryName')) {
    //if any of the queries have only one value
    if (req.query.queryName !== "") {
      query['name'] = req.query.queryName;
    }
  }
  //find the item with the query
  List.find(query, (err, result) => {
    res.render('myLists', { list: result });
  });

});


//get the info of your list
app.get('/myLists/:name', isLoggedIn, function (req, res) {

  //get the list info
  const listName = req.params.name;
  const obj = { user: req.user._id, nameQuery: listName };

  //query for the list
  List.find(obj, (err, result) => {
    if (err) {
      console.log(err);
    }
    else {

      //get the ingredients of the list
      let ingredients = [];
      if (!err) {

        //get them based on query
        for (const ingredient of result[0].items) {
          if (Object.prototype.hasOwnProperty.call(req.query, ingredient.name)) {
            const cur = { name: ingredient.name };
            ingredients.push(cur);
          }
        }
      }

      //if there is no query (ie no checkedboxes, add dummy query)
      if (ingredients.length === 0) {
        const temp = { name: 'NaN' };
        ingredients.push(temp);
      }

      //using the ingredients find the recipes
      Ingredient.find({ $or: ingredients }, (err, output) => {

        //dummy recipe store
        let allRecipes = [];
        if (err) {
          console.log(err);
        }
        else {

          //iterate over the ingredients to get all lists
          for (const r of output) {
            for (const id of r.recipes) {
              // const cur = { _id: id };
              allRecipes.push(id);
            }
          }

          //remove duplicates
          const filtered = allRecipes.filter((ele1, ele2) => allRecipes.indexOf(ele1) === ele2);
          const toFind = [];

          for (const id of filtered) {
            const cur = { _id: id };
            toFind.push(cur);
          }

          //if the query returned empty, make dummy obj to query
          if (toFind.length === 0) {
            const temp = { name: 'NaN' };
            toFind.push(temp);
          }

          //finally find the recipes and then render
          Recipe.find({ $or: toFind }, (err, recipes) => {
            if (err) {
              console.log(err);
            }
            else {
              res.render('list', { list: result[0], ingredients: ingredients, recipes: recipes });
            }
          })
        }
      })
    }
  });
});


//add recipe page
app.get('/addRecipe', isLoggedIn, function (req, res) {
  res.render('addRecipe');
})



//post to recipes, this is global
app.post('/recipes', isLoggedIn, function (req, res) {

  //make ingredients list
  const ingredients = [];
  let itemNames = req.body.itemName;
  let quantities = req.body.quantity;

  if (typeof itemNames === 'string' && typeof quantities === 'string') {
    itemNames = [itemNames];
    quantites = [quantities];
  }
  
  for (let i = 0; i < itemNames.length; i++) {
    if (quantities[i] !== "" && itemNames[i] !== "") {
      const obj = {
        quantity: quantities[i],
        name: itemNames[i],
        checked: true
      }
      console.log(obj);
      const newIngredient = new Ingredient(obj);
      ingredients.push(newIngredient);
    }
  }

  //make the recipe object
  const recipeObj = {
    _id: mongoose.Types.ObjectId(),
    name: req.body.recipeName,
    nameQuery: req.body.recipeName.replace(/\s+/g, ''),
    ingredients: ingredients,
    steps: req.body.step
  }


  //save the recipe
  const newRecipe = new Recipe(recipeObj);
  newRecipe.save((err, newRecipe) => {
    console.log(newRecipe);
    if (err) {
      console.log(err);
    }
    else {
      //add the recipe id to the ingredients
      helper.addIngredients(newRecipe);
      res.redirect('/home');
    }

  });
});


//get the recipes
app.get('/recipes', isLoggedIn, function (req, res) {
  Recipe.find({}, (err, result) => {
    res.render('allRecipes', { recipes: result });
  })
})



//get the recipe from the given name
app.get('/recipes/:recipeName', isLoggedIn, function (req, res) {
  const recipeName = req.params.recipeName;
  const obj = { nameQuery: recipeName };
  Recipe.find(obj, (err, result) => {
    res.render('recipe', { recipe: result[0] });
  });
});


// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login"
}), function (req, res) {
  res.send("User is " + req.user.id);
});

//Register
app.get('/register', (req, res) => {
  res.render('register');
})


app.post("/register", function (req, res) {
  //make a new user
  User.register(new User({ _id: mongoose.Types.ObjectId(), username: req.body.username }), req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render('register');
    } //user stragety
    //authenticate the user
    passport.authenticate("local")(req, res, function () {
      res.redirect("/login"); //once the user sign up
    });
  });
});


//Log Out
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});


//check if the user has authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}




//load the recipes from the sample recipe json
function loadRecipes(data) {
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
        helper.addIngredients(newRecipe);
      }
    })
  }
}


//user the helper to read a file
helper.readFile('sample-recipes.json', loadRecipes, console.log);

//Listen
app.listen(3000);
// app.listen(process.env.PORT || 22438);