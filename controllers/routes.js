'use strict';

/*
    All of the routes used for the http requests in this app
*/

var express = require('express');
var bluebird = require('bluebird');
var bCrypt = require('bcrypt-nodejs');
var router = express.Router();

module.exports = function(passport, bankData) {

    //signs the user out, and redirects them to home
    router.get('/api/signout', function(req, res) {
        req.logout();
        res.redirect('/'); 
    });
    
    router.get('/api/settings', function(req, res) {
        console.log("passed into settings")
        res.redirect('/settings.html')
    })

    //loads the main information for each user
    router.get('/api/feed', function(req, res) {
        res.json(req.user);
    });

    //logs a user in
    router.post('/api/login', passport.authenticate('local-login'),
        function(req, res) {
            console.log('in login route!!!!! bitch3z');
            res.json(req.newUser);
        });
        
    router.get('/api/facebook', passport.authenticate('facebook-login', { scope: 'email'}));
    
    router.get('/api/facebook/callback', passport.authenticate('facebook-login', {
            successRedirect: '/feed.html',
            failureRedirect: '/'
    }));

    //updates a user's display name
    router.put('/api/updateDispl', function(req, res) {
        bankData.getUser(req.user.email)
            .then(function(rows) {
                if(rows.length != 0) {
                    bankData.updateUserDisplayName(req.body.displayName, req.user.id)
                    res.json(req.user);
                } else {
                    res.status("403").send("You're not authorized to do that");
                }
            })
            .catch(function() {
                res.status("404").send("User not found");
            });
    });

    //updates a user's password
    router.put('/api/updatePass', function(req, res) {
        bankData.getUser(req.user.email)
            .then(function(rows) {
                if(rows.length != 0) {
                    if(isValidPassword(rows[0], req.body.oldPass)) {
                        console.log("Updating password");
                        bankData.updateUserPass(req.body.newPass, req.user.id);
                        res.json(req.user);
                    } else {
                        res.status("401").send("Wrong password");
                    }
                } else {
                    res.status("403").send("You're not authorized to do that");
                }
            })
            .catch(function() {
                res.status("400").send("Error grabbing user information");
            });

    });

    //signs a new user up
    router.post('/api/signup', passport.authenticate('local-signup'),
         function(req, res, next) {
            console.log("Creating user");
            res.json(req.user);
        });

    //get all accounts for user
    router.get('/api/accounts', function(req, res, next) {
        console.log("Entered get accounts");
        bankData.getAllAccountsForUser(req.user.id)
            .then(function(rows) {
                res.json(rows);
            })
            .catch(function() {
                res.status("404").send("Accounts query failed");
            });
    });

    //create a new account for the user
    router.post('/api/accounts', function(req, res, next) {
        
        var accountInfo = {
            userID : req.user.id,
            accountName : req.body.accountName
        };

        bankData.getAllAccountsForUser(req.user.id)
            .then(function(rows) {
                if(rows.length <= 4) {
                    return bankData.createAccount(accountInfo, false);
                } else {
                    res.status("400").send("Too many accounts");
                }
            })
            .then(function(rows) {
                res.json(rows[0]);
            }) 
            .catch(function() {
                res.status("404").send("Can't find user");
            });
    });

    //delete an account
    router.post('/api/delete', function(req, res, next) {
        console.log("Entering delete");
        bankData.getTransactionAccount(req.body.accountId)
            .then(function(rows) {
                if(rows.length != 0) {
                    if(rows[0].currBalance == 0) {
                        if(!rows[0].defaultAccount) {
                            return bankData.deleteAccount(req.body.accountId)
                        } else {
                            res.status("405").send("Cannot delete default account");
                        }
                    } else {
                        res.status("405").send("Cannot delete account with outstanding balance");
                    }
                } else {
                    res.status("403").send("No account to delete");
                }
            })
            .then(function(rows) {
                res.json(rows[0]);
            })
            .catch(function() {
                res.status("404").send("Data resources not found");
            });
    });

    //update the name of a user's individual account
    router.post('/api/updateAccountName', function(req, res, next) {
        console.log("Entered update account route");
        bankData.updateAccountName(req.body.id, req.body.accountName)
            .then(function(rows) {
                console.log("Successfully changed name");
                res.json(rows);
            })
            .catch(function() {
                res.status("400").send("update failed");
            });
    });

    //grab all transactions for all accounts
    router.get('/api/transactions', function(req, res, next) {

        var rowsArray;
        var resultsArray = [];
        bankData.getAllAccountsForUser(req.user.id)
            .then(function(rows) {
                console.log("Succesfully grabbed accounts");
                rowsArray = rows;
                return rows;
            })
            .then(function() {
                for(var i = 0; i < rowsArray.length; i++) {
                    bankData.getRecentTransactions(rowsArray[i].id)
                        .then(function(rows) {
                            for(var i = 0; i < rows.length; i++) {
                                resultsArray.push(rows[i]);
                            }
                            return resultsArray;
                        })
                        .then(function() {
                            console.log("Successfully grabbed transactions");
                            res.json(resultsArray);
                        })
                        .catch(function() {
                            res.status("404").send("Get transactions");
                        })
                }
                
            })
    });

    //create a task between two accounts
    //checks that user owns first account, and that destination 
    router.post('/api/addTask', function(req, res, next) {
        console.log("Entered addTask route");
        
        var taskCreatorID;
        var taskOwnerID;
        var generatedTaskID;

        //if redis has the same user id as our system, this will want to change
        //also, may want to check if they're in the same house in the future

        //grab current user id
        bankData.getUser(req.user.email)
            .then(function(currUserResponse) {
                console.log("Grabbing curr userID");
                taskCreatorID = currUserResponse[0].user_id;
                console.log("task creator id is " + taskCreatorID);
            })
            //check desired email
            .then(function() {
                console.log("grabbing other user")
                return bankData.getUser(req.body.taskOwner);
            })
            //grab other user id
            .then(function(otherUserResponse) {
                taskOwnerID = otherUserResponse[0].user_id;
                console.log("task OWNER id is " + taskOwnerID);
            })
            //creates the task in the database
            .then(function() {
                var creationTime = new Date();
                generatedTaskID = guid();

                var task = {
                    //may not be same as redis id
                    //taskCreator : req.user.id,
                    taskName : req.body.taskName,
                    taskID : generatedTaskID,
                    //TODO: MAKE TASKTYPE NOT TOTALLY ARBITRARY
                    taskType : req.body.taskType,
                    taskDueDate : req.body.taskDueDate,
                    taskDescription : req.body.taskDescription,
                    taskStatus : "incomplete",
                    taskTime : creationTime
                };

                return bankData.createTask(task);
            })
            .then(function() {
                console.log("made it to usertask update")
                var info = {
                    taskOwnerIDInfo : taskOwnerID,
                    taskCreatorIDInfo : taskCreatorID,
                    taskID : generatedTaskID
                }

                return bankData.updateUserTaskTable(info);
            })
            .then(function() {
                var info = {
                    taskID : generatedTaskID,
                    amount : req.body.amount,
                    priority : req.body.priority
                }

                if(req.body.taskType == "Chore") {
                    return bankData.updateChoreTable(info);
                } else {
                    return bankData.updateBillTable(info);
                }
            })
            .catch(function() {
                res.status("404").send("Something's fucky");
            });
    });

    //compares the given password and user's set pass
    var isValidPassword = function(user, password){
      return bCrypt.compareSync(password, user.password);
    }

    var guid = function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    }

    return router;
}



