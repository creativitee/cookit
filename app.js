require('./db');

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const list = [];

// enable sessions
const session = require('express-session');
const sessionOptions = {
    secret: 'secret cookie thang (store this elsewhere!)',
    resave: true,
      saveUninitialized: true
};
app.use(session(sessionOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
  res.render('home', {list : list});
});

app.post('/', (req,res) => {
  const obj = {ingredient : req.body.name, quantity : req.body.quantity};
  list.push(obj);
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.render('login');
});


// app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     // If this function gets called, authentication was successful.
//     // `req.user` contains the authenticated user.
//     res.redirect('/users/' + req.user.username);
//   });

app.listen(3000);