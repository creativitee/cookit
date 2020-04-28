require('./db');

const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const passport = require('passport');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const list = [];



//mongoose
const Ingredient = mongoose.model('Ingredient');
const List = mongoose.model('List');
const Recipe = mongoose.model('Recipe');
const User = mongoose.model('User');

//temporary user store
const users = [];

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


app.get("/home", isLoggedIn, function(req, res){
  res.render('home');
})


// app.post('/', (req,res) => {
//   const obj = {ingredient : req.body.name, quantity : req.body.quantity};
//   list.push(obj);
//   res.redirect('/');
// });


//createList page


app.get('/createList', isLoggedIn
,(req, res) => {
  res.render('createlist');
});


//list page
app.post('/home', isLoggedIn, function (req, res) {
  const ingredients = [];
  // const temp = req.body.list.split(',');
  let itemNames = req.body.itemName;
  let quantities = req.body.quantity;


  if (typeof itemNames === 'string' && typeof quantities === 'string'){
    itemNames = [itemNames];
    quantites = [quantities];
  }

  for (let i = 0; i < itemNames.length; i++) {
    // const curr = temp[i].split(' ');
    // console.log(curr);
    if (quantities[i] !== "" && itemNames[i] !== ""){
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
    user : req.user._id,
    name: req.body.listName,
    nameQuery : req.body.listName.replace(/\s+/g, ''),
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
  const query = {user: req.user._id};

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


app.get('/myLists/:name', isLoggedIn, function(req, res){
  const listName = req.params.name;
  const obj = {user : req.user._id, nameQuery : listName};
  List.find(obj, (err, result) => {
      if (err){
        console.log(err);
      }
      else{
        const recipes = findRecipes(result.ingredients);
        res.render('list', { list: result[0]});
      }
  });
});


app.get('/addRecipe', isLoggedIn, function(req, res){
  res.render('addRecipe');
})


app.post('/recipes', isLoggedIn, function (req, res) {
  const ingredients = [];
  // const temp = req.body.list.split(',');
  let itemNames = req.body.itemName;
  let quantities = req.body.quantity;

  if (typeof itemNames === 'string' && typeof quantities === 'string'){
    itemNames = [itemNames];
    quantites = [quantities];
  }

  console.log(itemNames, quantities);
  for (let i = 0; i < itemNames.length; i++) {
    if (quantities[i] !== "" && itemNames[i] !== ""){
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
    _id : mongoose.Types.ObjectId(),
    name : req.body.recipeName,
    nameQuery : req.body.recipeName.replace(/\s+/g, ''),
    ingredients : ingredients,
    steps : req.body.step
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

app.get('/recipes', isLoggedIn, function (req,res){
  Recipe.find({}, (err, result) => {
    res.render('allRecipes', {recipes : result});
  })
})


app.get('/recipes/:recipeName', isLoggedIn, function(req, res){
  const recipeName = req.params.recipeName;
  const obj = {nameQuery : recipeName};
  Recipe.find(obj, (err, result) => {
      res.render('recipe', {recipe : result[0]});
  });
});


// Login, Register
app.get('/login', (req, res) => {
  res.render('login');
});

// app.post('/login', isLoggedIn, {
//   failureRedirect: '/login',
//   successRedirect: '/'
// });;

app.post("/login", passport.authenticate("local",{
  successRedirect:"/home",
  failureRedirect:"/login"
}),function(req, res){
  res.send("User is "+ req.user.id);
});

app.get('/register', (req, res) => {
  res.render('register');
})

// app.post('/register', (req, res) => {
//   User.register(new User({
//     username : req.body.username
// }),
//    req.body.password, function(err, user){
//       if(err){            
//            console.log(err);            
//            return res.render('register');        
// }

app.post("/register", function(req, res){
  User.register(new User({_id: mongoose.Types.ObjectId(), username:req.body.username}),req.body.password, function(err, user){
         if(err){
              console.log(err);
              return res.render('register');
          } //user stragety
          passport.authenticate("local")(req, res, function(){
              res.redirect("/login"); //once the user sign up
         }); 
      });
  });
  
// passport.authenticate("local")(req, res, function(){
//   res.redirect("/");       
// });     
// });
// })

app.get("/logout", function(req, res){    
  req.logout();    
  res.redirect("/login");
});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect("/login");
}

//add sample recipes
function loadRecipes() {
  fs.readFile('sample-recipes.json', function (err, data){
    if (err) {
      console.log(err);
    }
    else {
      const d = JSON.parse(data);
      for (const recipe of d){
        recipe.nameQuery = recipe.name.replace(/\s+/g, '');
        recipe._id = mongoose.Types.ObjectId();
        const newRecipe = new Recipe(recipe);
        newRecipe.save((err, newRecipe) => {
          if (err) {
            console.log(err);
          }
          else {
            addIngredients(newRecipe);
            // for (const ingredient of newRecipe.ingredients){
            //   const obj = {
            //     quantity : "1",
            //     name : ingredient.name,
            //   }
            //   Ingredient.updateOne(obj, {$push : {recipes : recipe._id}}, {upsert : true}, (err, result) => {
            //     if (err){
            //       console.log(err);
            //     }
            //   });
            // }
          }
        })
      }
    }
  })
  app.listen(3000);
};

function addIngredients(newRecipe){
  for (const ingredient of newRecipe.ingredients){
    const obj = {
      quantity : "1",
      name : ingredient.name,
    }
    Ingredient.updateOne(obj, {$push : {recipes : newRecipe._id}}, {upsert : true}, (err, result) => {
      if (err){
        console.log(err);
      }
    });
  }
}

function findRecipes(ingredient){
  Ingredient.find(ingredient, (err, result) => {
    if(err){
      console.log(err);
    }
    else{
      return result.recipes;
    }
  })
}

// };
loadRecipes();
// app.listen(process.env.PORT || 22438);