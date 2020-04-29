require('./db');

const express = require('express');
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


//home page

app.get('/', (req, res) => {
  res.render('startPage');
})


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
  const listObj = {
    user: req.user._id,
    name: req.body.listName,
    nameQuery: req.body.listName.replace(/\s+/g, ''),
    items: ingredients
  }

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


app.get('/myLists/:name', isLoggedIn, function (req, res) {
  // console.log(req.query);

  const listName = req.params.name;
  const obj = { user: req.user._id, nameQuery: listName };
  List.find(obj, (err, result) => {
    if (err) {
      console.log(err);
    }
    else {

      let ingredients = [];
      if (!err) {
        for (const ingredient of result[0].items) {
          if (Object.prototype.hasOwnProperty.call(req.query, ingredient.name)){
              const cur = { name: ingredient.name };
              ingredients.push(cur);
          }
        }
      }

      if (ingredients.length === 0){
        const temp = { name: 'NaN'};
        ingredients.push(temp);
      }
      Ingredient.find({$or: ingredients}, (err, output) => {
        let allRecipes = [];
        if (err) {
          console.log(err);
        }
        else {
          for (const r of output){
            for (const id of r.recipes){
              const cur = {_id : id};
              allRecipes.push(cur);
            }
          }
          if (allRecipes.length === 0){
            const temp = { name: 'NaN'};
            allRecipes.push(temp);
          }

          Recipe.find({$or : allRecipes}, (err, recipes) => {
            if (err){
              console.log(err);
            }
            else{
              res.render('list', { list: result[0], ingredients: ingredients, recipes: recipes});
            }
          })
        }
      })
    }
  });
});


app.get('/addRecipe', isLoggedIn, function (req, res) {
  res.render('addRecipe');
})


app.post('/recipes', isLoggedIn, function (req, res) {
  const ingredients = [];
  let itemNames = req.body.itemName;
  let quantities = req.body.quantity;

  if (typeof itemNames === 'string' && typeof quantities === 'string') {
    itemNames = [itemNames];
    quantites = [quantities];
  }

  console.log(itemNames, quantities);
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
  const recipeObj = {
    _id: mongoose.Types.ObjectId(),
    name: req.body.recipeName,
    nameQuery: req.body.recipeName.replace(/\s+/g, ''),
    ingredients: ingredients,
    steps: req.body.step
  }

  const newRecipe = new Recipe(recipeObj);
  newRecipe.save((err, newRecipe) => {
    console.log(newRecipe);
    if (err) {
      console.log(err);
    }
    else {
      addIngredients(newRecipe);
      res.redirect('/home');
    }

  });
});

app.get('/recipes', isLoggedIn, function (req, res) {
  Recipe.find({}, (err, result) => {
    res.render('allRecipes', { recipes: result });
  })
})


app.get('/recipes/:recipeName', isLoggedIn, function (req, res) {
  const recipeName = req.params.recipeName;
  const obj = { nameQuery: recipeName };
  Recipe.find(obj, (err, result) => {
    res.render('recipe', { recipe: result[0] });
  });
});


// Login, Register
app.get('/login', (req, res) => {
  res.render('login');
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login"
}), function (req, res) {
  res.send("User is " + req.user.id);
});

app.get('/register', (req, res) => {
  res.render('register');
})


app.post("/register", function (req, res) {
  User.register(new User({ _id: mongoose.Types.ObjectId(), username: req.body.username }), req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      return res.render('register');
    } //user stragety
    passport.authenticate("local")(req, res, function () {
      res.redirect("/login"); //once the user sign up
    });
  });
});

app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/login");
});


function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}




helper.loadRecipes();
app.listen(3000);
// app.listen(process.env.PORT || 22438);