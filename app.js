require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;

const app = express();
const list = [];

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



////////////////////////
/////Route Handling/////
////////////////////////

app.get('/', (req, res) => {
  res.render('home', {list : list});
});

app.post('/', (req,res) => {
  const obj = {ingredient : req.body.name, quantity : req.body.quantity};
  list.push(obj);
  res.redirect('/');
});




//Login, Register
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  successRedirect: '/'
}));;

app.get('/register', (req, res) => {
  res.render('register');
})

app.post('/register', (req,res) => {
})


passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser((username, done) => {
  done(null, {username: username});
}); 


passport.use(new LocalStrategy(
  (username, password, done) => {
      if(username === 'test@gmail.com' && password === '1234') {
          return done(null, {username: 'test@gmail.com'});
      } else {
          return done(null, false);
      }
   }
));

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next;
  }
  else{
    return res.redirect('/login');
  }
}


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

app.listen(3000);