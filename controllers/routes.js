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

    //loads the profile information for each user
    router.get('/api/profile', function(req, res) {
        res.json(req.user);
    });

    //logs a user in
    router.post('/api/login', passport.authenticate('local-login'),
        function(req, res) {
            res.json(req.user);
        });

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
    //router.get('/api/accounts', function(req, res, next) {
        router.get('/api/tasks', function(req, res, next) {
        console.log("Entered get tasks");
        bankData.getAllTasksForUser(req.user.id)
            .then(function(rows) {
                res.json(rows);
            })
            .catch(function() {
                res.status("404").send("Tasks query failed");
            });
    });

    //create a new account for the user
    //router.post('/api/accounts', function(req, res, next) {
    router.post('/api/tasks', function(req, res, next) {    
        var taskInfo = {
            userID : req.user.id,
            taskName : req.body.taskName
        };

        bankData.getAllTasksForUser(req.user.id)
            .then(function(rows) {
                if(rows.length <= 4) {
                    return bankData.createTask(taskInfo, false);
                } else {
                    res.status("400").send("Too many tasks");
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

    //update the name of a user's individual task
    router.post('/api/updateTaskName', function(req, res, next) {
        console.log("Entered update task route");
        bankData.updateTaskName(req.body.id, req.body.taskName)
            .then(function(rows) {
                console.log("Successfully changed name");
                res.json(rows);
            })
            .catch(function() {
                res.status("400").send("update failed");
            });
    });

    //grab all transactions for all tasks
    router.get('/api/transactions', function(req, res, next) {

        var rowsArray;
        var resultsArray = [];
        bankData.getAllTasksForUser(req.user.id)
            .then(function(rows) {
                console.log("Succesfully grabbed tasks");
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

    //create a transaction between two accounts
    //checks that user owns first account, and that destination 
    router.post('/api/addTransaction', function(req, res, next) {
        console.log("Entered addTransaction route");

        var transaction = {
            sendingUserID : req.user.id,
            sourceAccountID : req.body.sourceAccountID,
            destAccountID : req.body.destAccountID,
            transactionAmt : req.body.transactionAmt,
            transDescription : req.body.transDescription
        };
        
        var sourceAccount;
        bankData.getTransactionAccount(transaction.sourceAccountID)
            .then(function(sourceRows) {
                sourceAccount = sourceRows;
                if(sourceRows[0].userID == req.user.id) {
                    if(sourceRows[0].currBalance >= transaction.transactionAmt) {
                        return bankData.getTransactionAccount(transaction.destAccountID)
                    } else {
                        res.status("405").send("Insufficient funds");
                    }
                } else {
                    res.status("403").send("Unauthorized to send money from that account");
                }
            })
            .then(function(destRows) {
                if(destRows.length != 0) {
                    return bankData.updateAccount(destRows[0].currBalance + Number(transaction.transactionAmt), transaction.destAccountID);
                } else {
                    res.status("404").send("Account not found");
                }
            })
            .then(function() {
                return bankData.updateAccount(sourceAccount[0].currBalance - transaction.transactionAmt, transaction.sourceAccountID);
            })
            .then(function() {
                return bankData.createTransaction(transaction);
            })
            .catch(function() {
                res.status("404").send("Some transaction failed");
            });
    });

    //compares the given password and user's set pass
    var isValidPassword = function(user, password){
      return bCrypt.compareSync(password, user.password);
    }

    return router;
}



