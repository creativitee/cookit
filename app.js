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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));


//add sample recipes
app.use(function (req, res, next) {
  fs.readFile('./public/recipes/sample-recipes.json', function (err, data){
    if (err) {
      console.log(err);
    }
    // else {
    //   const d = JSON.parse(data);
    //   const recipe = new Recipe(d);
    //   recipe.save((err, newList) => {
    //     if (err) {
    //       console.log(err);
    //     }
    //     else {
    //       console.log(recipe);
    //     }
    //   });
    // }
  });
  next();
});


////////////////////////
/////Route Handling/////
////////////////////////


//home page
app.get('/', (req, res) => {
  res.render('home');
});

// app.post('/', (req,res) => {
//   const obj = {ingredient : req.body.name, quantity : req.body.quantity};
//   list.push(obj);
//   res.redirect('/');
// });

//createList page
app.get('/createList', (req, res) => {
  res.render('createlist');
});


//list page
app.post('/', function (req, res) {
  const ingredients = [];
  // const temp = req.body.list.split(',');
  const itemNames = req.body.itemName;
  const quantities = req.body.quantity;
  for (let i = 0; i < itemNames.length; i++) {
    // const curr = temp[i].split(' ');
    // console.log(curr);
    const obj = {
      quantity: quantities[i],
      name: itemNames[i],
      checked: true
    }
    console.log(obj);
    const newIngredient = new Ingredient(obj);
    ingredients.push(newIngredient);
  }
  const listObj = {
    name: req.body.listName,
    items: ingredients
  }

  const newList = new List(listObj);
  newList.save((err, newList) => {
    console.log(newList);
    if (err) {
      console.log(err);
    }
    else {
      res.redirect('/');
    }

  });
});

app.get('/myLists', function (req, res) {
  //query object
  const query = {};

  //check if query exists
  if (Object.prototype.hasOwnProperty.call(req.query, 'queryName')) {
    //if any of the queries have only one value
    if (req.query.queryName !== "") {
      query['name'] = req.query.queryName;
    }
  }

  //find the item with the query
  List.find(query, (err, result) => {
    res.render('list', { list: result });
  });

});







//Login, Register
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local'), {
  failureRedirect: '/login',
  successRedirect: '/'
});;

app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/register', (req, res) => {
  User.register(new User({
    username : req.body.username
}),
   req.body.password, function(err, user){
      if(err){            
           console.log(err);            
           return res.render('register');        
}
passport.authenticate("local")(req, res, function(){
  res.redirect("/");       
});     
});
})

app.get("/logout", function(req, res){    
  req.logout();    
  res.redirect("/login");
});



//handle passport
// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function (err, user) {
//       if (err) { return done(err); }
//       if (!user) { return done(null, false); }
//       if (!user.verifyPassword(password)) { return done(null, false); }
//       return done(null, user);
//     });
//   }
// ));


//configure
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// passport.serializeUser((user, done) => {
//   done(null, user.username);
// });

// passport.deserializeUser((username, done) => {
//   done(null, {username: username});
// }); 


// passport.use(new LocalStrategy(
//   (username, password, done) => {
//       if(username === 'test@gmail.com' && password === '1234') {
//           return done(null, {username: 'test@gmail.com'});
//       } else {
//           return done(null, false);
//       }
//    }
// ));

// function isLoggedIn(req, res, next){
//   if(req.isAuthenticated()){
//     return next;   
//   }
//   else{
//     return res.redirect('/login');
//   }
// }


// app.configure(function() {
//   app.use(express.static('public'));
//   app.use(express.cookieParser());
//   app.use(express.bodyParser());
//   app.use(express.session({ secret: 'keyboard cat' }));
//   app.use(passport.initialize());
//   app.use(passport.session());
//   app.use(app.router);
// });

// const passport = require('passport')
//   , LocalStrategy = require('passport-local').Strategy;

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

// app.post('/login',
//   passport.authenticate('local', { successRedirect: '/',
//                                    failureRedirect: '/login',
//                                    failureFlash: true })
// );

// app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/users/' + req.user.username);
//   });

// app.listen(3000);
app.listen(process.env.PORT || 22438);