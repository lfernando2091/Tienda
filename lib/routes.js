var indexRouter = require('../routes/index');
var usersRouter = require('../routes/users');

module.exports = function (app) {
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
        console.log('checkAuth ' + req.url);

        // don't serve /secure to those not logged in
        // you should add to this list, for each and every secure url
        if (req.url === '/welcome' && (!req.session || !req.session.authenticated)) {
            res.render('./login/unauthorised', { status: 403 });
            return;
        }

        next();
    });
    
	app.get('/welcome', function (req, res, next) {
		res.render('./login/welcome');
	});

	app.get('/login', function (req, res, next) {
		res.render('./login/login', { flash: req.flash()});
	});

	app.post('/login', function (req, res, next) {
		passport.authenticate('local', (err, user, info) => {
		    console.log('Inside passport.authenticate() callback');
		    console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
		    console.log(`req.user: ${JSON.stringify(req.user)}`)
			    req.login(user, (err) => {
			      console.log('Inside req.login() callback')
			      console.log(`req.session.passport: ${JSON.stringify(req.session.passport)}`)
			      console.log(`req.user: ${JSON.stringify(req.user)}`)
			      return res.send('You were authenticated & logged in!\n');
			    })
		  	},
			{ 
				successRedirect: '/welcome',
                failureRedirect: '/login',
                failureFlash: true 
            });

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
		res.redirect('/');
	});

};