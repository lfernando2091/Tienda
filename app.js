var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var debug = require('debug')('app --> ');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs');
/*Call Mappers Controller*/
const mappers = require('./lib/mappers.js');
mappers.loadMapper('login');
mappers.setNameSpace('login');
/**
 * Express bcrypt for sometext
 */
const bcrypt = require('bcrypt-nodejs');
/**
 * Express Passport Controller
 */
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
/**
 * Express UUID creator
 */
var uuid = require('uuid/v4');
/**
 * Express Session Controller
 */
var session = require('express-session');
/**
 * Express Grant Middleware Controller
 */
var grant = require('grant-express');
/**
 * Express MySql Middleware Session saver
 */
var MySQLStore = require('express-mysql-session')(session);
/**
 * Express MySql
 */
var MySql = require('mysql');
/**
 * Express MySql Middleware
 */
var MySqlConnection = require('express-myconnection');

/**
 * Express Validator Middleware for Form Validation
 */ 
/********************************************
 * Express-validator module
  
 req.body.comment = 'a <span>comment</span>';
 req.body.username = '   a user    ';

 req.sanitize('comment').escape(); // returns 'a &lt;span&gt;comment&lt;/span&gt;'
 req.sanitize('username').trim(); // returns 'a user'
 ********************************************/
var expressValidator = require('express-validator');

/**
 * This module shows flash messages
 * generally used to show success or error messages
 * 
 * Flash messages are stored in session
 * So, we also have to install and use 
 * cookie-parser & session modules
 */ 
var flash = require('express-flash');

/*Config Options For Grant*/
var config = require('./config-grant.json');

/*Config Options For MySql Connection*/
var options = require('./config-db-options.json');
options.ssl = {
  ca: fs.readFileSync(__dirname + '/certs/server-ca.pem'),
  key: fs.readFileSync(__dirname + '/certs/client-key.pem'),
  cert: fs.readFileSync(__dirname + '/certs/client-cert.pem')
};


var sessionStore = new MySQLStore(options);

var app = express();

var secretKey = '{Luis}*[Fernando2091]/@/';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(secretKey));
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1) // trust first proxy

app.use(flash());

app.use(expressValidator());

/*Set middleware for Mysql Connection*/
app.use(MySqlConnection(MySql, options, 'single'));

// REQUIRED: any session store - see /examples/express-session-stores
app.use(
    session(
        {
            store: sessionStore,
            key: 'My[Protectional*xPW2j}4Pass0/',
            secret: secretKey, 
            genid: (req) => {
              return uuid() // use UUIDs for session IDs
            },
            saveUninitialized: true, 
            resave: true
        }
    ));
// mount grant
app.use(grant(config));
/**
 * Express Passport Settings
 */ 
var users = new Array();

passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    // Load hash from your password DB.
    //bcrypt.compare("bacon", hash, function(err, res) {
        // res == true
    //});
    // SQL Parameters
    var param = {
        usuario : username
    } 
    // create the connection to database
    MySql.createConnection(options).query(mappers.onQuery('authenticate',param), function (error, results, fields) {
        if (error) return done(err); 
        users = results;      
        if (results.length==0)
          return done(null, false, { message: 'Usuario no registrado.' }); 
        if(!bcrypt.compareSync(password, results[0].Token)) 
          return done(null, false, { message: 'Usuario y contraseña incorrectos.' }); 
        return done(null, results[0]);             
    });    
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.Id);
});


passport.deserializeUser(function(id, done) {
  // SQL Parameters
  var user;
  if(users.length>0)
    user = users[0].Id === id ? users[0] : false; 
  else 
    user = false;
  done(null, user);
  //User.findById(id, function(err, user) {
  //  done(err, user);
  //});

});

app.use(passport.initialize());
app.use(passport.session());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

/*Call to router Controller*/
require('./lib/routes.js')(app, passport);

app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('Sorry that page not exist:\n')
  res.end(JSON.stringify("Error 404", null, 2))
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(8080);

module.exports = app;
