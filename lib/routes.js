const indexRouter = require('../routes/index');
const usersRouter = require('../routes/users');
/*Call Mappers Controller*/
const mappers = require('./mappers.js');
mappers.loadMapper('login');
mappers.setNameSpace('login');
/**
 * Express bcrypt for sometext
 */
const bcrypt = require('bcrypt-nodejs');
/*Config Options For Routes*/
const routes = require('../config-routes.json');

module.exports = function (app, passport) {
/*
	app.get('/', function (req, res, next) {
        app.use('/', indexRouter);
	}); 
    
    app.get('/users', function (req, res, next) {		
        app.use('/users', usersRouter);
	}); 
*/
    app.use('/', indexRouter);
    
    app.use('/users', usersRouter);
    
    /*Check Authentications*/
    app.use(function(req, res, next) {
    	//res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
	    // don't serve /secure to those not logged in
        // you should add to this list, for each and every secure url
        routes.auth.forEach(function(element) {
		  	if (req.url === element && (!req.session || !req.session.authenticated || !req.isAuthenticated())) {
            	res.render('./login/unauthorised', { status: 403, title: 'No autorizado' });
            	return;
        	}
        	next();
		});               
    });
    
	app.get('/welcome', function (req, res, next) {
		//res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
		res.render('./login/welcome', {title: 'Bienvenido'});
	});

	app.get('/signup', function (req, res, next) {
		//res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
		var user = req.flash("user");
		res.render('./login/signup', {flash: req.flash(), title: 'Signup', username: user[0]});
	});

	app.post('/signup', (req, res, next) => {  
		var param = {
	        nickname : req.body.username,
	        usuario : req.body.username,
	        pass: req.body.password,
	        token : ''
	    } 
	    if(req.body.password != req.body.repassword){
	    	req.flash('error', 'El password no coincide');
	    	req.flash('user', req.body.username);
			return res.redirect('/signup');		    
	    }
		req.getConnection(function(err, connection) {
	      if (err) return next(err);
	      param.token = bcrypt.hashSync(param.pass);
	      connection.query(mappers.onQuery('insertUser',param), [], function(err, results) {
	        if (err) return next(err);	 
	        return res.redirect('/login'); 
	      });
	      
	    });
	});

	app.get('/login', function (req, res, next) {
		//res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
		res.render('./login/login', {flash: req.flash(), title: 'Login'});
	});

/*
usr - root
pass - admin
hash - $2a$10$Z4lMjOGbutYsCE79qrnluun1ibs7fcxen.p7843qdhKS78NZEr/x6
*/

	app.post('/login', (req, res, next) => {  
		passport.authenticate('local', (err, user, info) => {
			if (err) { return next(err); }
    		if (!user) { 
    			req.flash('error', info.message);
    			return res.redirect('/login'); 
    		}
			    req.login(user, (err) => {
			      	//console.log('req.session.passport:'+ JSON.stringify(req.session.passport))
		    		//console.log('req.user:'+JSON.stringify(req.user))
			      	if (err) 
			      		return next(err);
			      	req.session.authenticated = true;
      				return res.redirect('/welcome');
			    });
		  	})(req, res, next);

/*Old Code
		// you might like to do a database look-up or something more scalable here
		if (req.body.username && req.body.username === 'user' && req.body.password && req.body.password === 'pass') {
			req.session.authenticated = true;
			res.redirect('/welcome');
		} else {
			req.flash('error', 'Username and password are incorrect');
			res.redirect('/login');
		}
*/
	});


	app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
		req.logout();
		res.redirect('/');
	});

};