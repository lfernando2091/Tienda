var createError = require('http-errors');
var express = require('express');
var bodyParser = require('body-parser');
var debug = require('debug')('app --> ');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
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

var sessionStore = new MySQLStore(options);

var app = express();

var secretKey = 'secret-key-api-change-in-production';

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
            key: 'mitienda',
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
passport.use(new LocalStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    


    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(passport.initialize());
app.use(passport.session());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

/*Call to router Controller*/
require('./lib/routes.js')(app);

app.use(function (req, res) {
  res.setHeader('Content-Type', 'text/plain')
  res.write('you posted:\n')
  res.end(JSON.stringify(req.body, null, 2))
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
