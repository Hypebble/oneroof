var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var mysql = require('mysql');
var bluebird = require('bluebird');


var cookieSigSecret = process.env.COOKIE_SIG_SECRET;
if (!cookieSigSecret) {
    console.error('Please set COOKIE_SIG_SECRET');
    process.exit(1);
}


var dbConfig = require('./secret/config-maria.json');
var connPool = bluebird.promisifyAll(mysql.createConnection(dbConfig));
var bankData = require('./models/maria.js').Model(connPool);

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());

var passport = require('passport');

var passportStrats = require('./controllers/passport.js');
passportStrats(passport);

app.use(session({
    secret: cookieSigSecret,
    resave: false,
    saveUninitialized: false,
    store: new RedisStore()
}));

passport.serializeUser(function(user, done) {
    console.log('serializing user: ');
    console.log(user);
    done(null, user); 
});

passport.deserializeUser(function(user, done) {
    done(null, user); 
});

app.use(passport.initialize());
app.use(passport.session()); 

var routes = require('./controllers/routes.js')(passport, bankData);
app.use('/', routes);

//tell express to serve static files from the /static/public
//subdirectory (any user can see these)
app.use(express.static(__dirname + '/static/public'));

//add a middleware function to verify that the user is
//authenticated: if so, continue processing; if not,
//redirect back to the home page
app.use(function(req, res, next) {
    if(!req.isAuthenticated()) {
        res.redirect('/'); 
        console.log("got caught up in the middleware function");
    } else {
        next();
    }    
});

//tell express to serve static files from the /static/secure
//subdirectory as well, but since this middleware function
//is added after the check above, express will never call it
//if the function above doesn't call next()
app.use(express.static(__dirname + '/static/secure'));

app.listen(80, function() {
    console.log('server is listening...');
});

module.exports = app;














