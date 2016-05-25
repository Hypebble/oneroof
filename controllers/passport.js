'use strict';

/*
    This handles the passport functionality of this app. This means that it handles the session authentication 
    with each route a user can take- facebook authentication, local sign in and local sign up.
    See each passport use to see their individual functionality.
*/


//set up basic requirements and dependencies
var bCrypt = require('bcrypt');
var crypto = require('crypto');
var FacebookStrategy = require('passport-facebook').Strategy;
var LocalStrategy   = require('passport-local').Strategy;
var fbConfig = require('../secret/config-facebook.json');
var dbConfig = require('../secret/config-maria.json');
var bluebird = require('bluebird');
var mysql = require('mysql');
var connPool = bluebird.promisifyAll(mysql.createPool(dbConfig));
var bankUser = require('../models/maria.js').Model(connPool);
var uuid = require('uuid');
//var fbConfig = require('../secret/oauth.json');

module.exports = function(passport) {

    //creates a new user account in the system, based off of the user's preferences
    passport.use('local-signup', new LocalStrategy({
         usernameField: 'email',
         passReqToCallback : true 
     }, function(req, username, password, done) {
        console.log('entered local strategy callback');
        //makes sure that no passwords with typos end up in the database
        if(req.body.confirmPass == req.body.password) {
            console.log("Passed password check");

            bankUser.getUser(username)
                .then(function(rows) {
                    console.log("got here!");
                    if(rows.length == 0) {

                        var hashPassNew = createHash(password);
                        //var gravHashNew = crypto.createHash('md5').update(username).digest('hex');
                        //var gravatarUrlNew = "http://www.gravatar.com/avatar/" + gravHashNew;
                        var displayNameNew = req.body.displayName;
                        console.log("COLLECTED DISPLAY NAME " + req.body.displayName);
                        //var userIDNew = uuid.v1();
                        var newUser = {
                          //  id : userIDNew,
                            email : username, 
                            displayName : displayNameNew, 
                           // gravatarUrl : gravatarUrlNew, 
                            hashPass : hashPassNew
                        };
                        console.log("HERERERERERE");
                        var newAccount = {
                          //  userID : userIDNew,
                            accountName : "Default"
                        };

                        bankUser.createUser(newUser)
                            .then(function() {
                                console.log("user created");
                                return done(null, newUser);
                            })
                            .catch(function() {
                                return done(null, false);
                            });


                    } else {
                        console.log("Account already exists");
                        return done(null, false);
                    }
                })
        } else {
            console.log("passwords need to match");
            return done(null, false);
        }
     }));
    
    //logs user in
     passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passReqToCallback : true
        }, function(req, username, password, done) {
            console.log('made it into local login');
            console.log("" + req);
            console.log(username);
            bankUser.getUser(username)
                .then(function(rows) {
                    console.log(rows);
                    if(rows.length == 0) {
                        console.log("rows.length = 0");
                        return done(null, false);
                    } else {
                        console.log("password: " , password);
                        console.log("hashed: " , createHash(password));
                        console.log("rows hashpass: " , rows[0].hash_pass);
                        if(!bCrypt.compareSync(password, rows[0].hash_pass)) {
                            console.log('Invalid Password');
                            return done(null, false);
                        } else {
                            return done(null, rows[0]);
                        }
                    }
                });
        }));
        
        // logs user in via facebook
        passport.use('facebook-login', new FacebookStrategy(fbConfig,
            function(token, refreshToken, profile, done) {
                process.nextTick(function() {
                    //console.log("we out here!");
                    //console.log(profile);
                    // console.log(refreshToken);
                    // console.log(token);
                    console.log("logging profile!!!@!@~~!~!!!@!@#@@!#@!#!#!@#");
                    console.log(profile);
                    bankUser.getUserFB(profile.id)
                        .then(function(rows) {
                            console.log(rows);
                            if(rows.length == 0) {
                               // console.log("token: " + token);
                               // console.log("refreshToken: " + refreshToken);
                               // console.log("profile: " , profile);
                               // console.log("done: " , done);
                                //var gravatarUrlNew = "http://www.gravatar.com/avatar/" + gravHashNew;

                                //var userIDNew = uuid.v1();
                                var name;
                                if(profile.displayName == undefined) {
                                    name = profile.name.givenName + " " + profile.name.familyName;
                                } else {
                                    console.log("Kept display name");
                                    name = profile.displayName;
                                }
                                var newUser = {
                                //  id : userIDNew,
                                    facebook_email: profile.emails[0].value, 
                                    displayName : name,
                                    facebook_token : token,
                                    facebook_id : profile.id
                                // gravatarUrl : gravatarUrlNew, 
                                };
                                //console.log("HERERERERERE round 2");
                                
                                var newAccount = {
                                //  userID : userIDNew,
                                    accountName : "Default"
                                };

                                bankUser.createUser(newUser)
                                    .then(function(response) {
                                        console.log("^*$#*$!#^DW!GR facebook user created");
                                        console.log("newUser");
                                        console.log(newUser);
                                        console.log("response");
                                        console.log(response.insertId);
                                        
                                        newUser.user_id = response.insertId;
                                        console.log("newUser ", newUser);
                                        return done(null, newUser);
                                    })
                                    .catch(function(error) {
                                        console.log(error);
                                        return done(null, false);
                                    });
                                } else {
                                    console.log("user exists!!!")
                                    console.log(rows[0]);
                                }
                            });
                        });
                    }));
                
    
    //creates hashes
    var createHash = function(password){
        console.log(password)
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10));
    }

}
