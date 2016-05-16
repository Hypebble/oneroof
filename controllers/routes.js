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
        console.log(req);
        req.logout();
        res.redirect('/'); 
    });
    
    router.get('/api/settings', function(req, res) {
        console.log("passed into settings");
        bankData.getHouse(req.user.user_id)
            .then(function(rows) {
                console.log(rows[0]);
                console.log(req.user);
                if(typeof rows[0] !== "undefined") { 
                    bankData.getHouseCode(rows[0].house_id)
                    .then(function(rs) {
                        console.log(rs[0]);
                        req.user.houseID = rs[0].house_id;
                        res.json([req.user, rs[0]]);
                    })
                } else {
                    res.json(req.user);
                }
            })
    })

    //loads the main information for each user
    router.get('/api/feed', function(req, res) {
        console.log("feed user", req.user);
        res.json(req.user);
    });

    router.get('/api/profile/:id', function(req,res){
        res.json(req.user);
    });

    router.get('/api/getUsers', function(req, res) {
        console.log("middleWare, getting users");
        console.log("user house id", req.user.houseID);
        if(typeof req.user.houseID !== "undefined") {
        bankData.getUsersInHouse(req.user.houseID)
            .then(function(rows) {
                console.log("hella stuff", rows);
                var array = [];
                for(var i of rows) {
                    console.log("", i);
                }
                res.json([req.user, rows]);
            })
        }
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
        //console.log(req.body);
        bankData.getUser(req.user.email)
            .then(function(rows) {
                console.log(rows);
                if(rows.length != 0) {
                    console.log("", req.body.name);
                    console.log("", req.user.user_id);
                    bankData.updateUserDisplayName(req.body.displayName, req.user.user_id);
                    console.log("", req.user);
                    req.user.displayName = req.body.displayName;
                    res.json(req.user);
                } else {
                    res.status("403").send("You're not authorized to do that");
                }
            })
            .catch(function() {
                res.status("404").send("User not found");
            });
    });

    //create a user house
    router.put('/api/createHouse', function(req, res) {
        console.log("", req.body);
        console.log("The button was clicked!");
        //console.log("req", req);
        //console.log("req", req);
        //console.log("res", res);
        var code = houseCode();
        console.log("", code);
        bankData.createHouse(req.body.setHouseName, 100, code)
            .then(function(rows) {
                console.log(rows.insertId);
                bankData.addUserToHouse(rows.insertId, req.user.user_id);
            })
            .catch(function(){
                res.status("404").send("You done broke the machien");
            });
    });

    router.put('/api/createGroup', function(req, res) {
        bankData.createGroup(req.body.groupN, req.body.groupD)
        .then(function(rows){
            bankData.addUserToGroup(rows.insertId, req.user.user_id);
        })
    });

    router.put('/api/joinHouse', function(req, res) {
        console.log(req.body);
        bankData.getHouseWithCode(req.body.enterHouseCode)
            .then(function(rows) {
                console.log(rows[0]);
                if(rows[0] !== undefined) {
                    console.log('success house exists');
                    bankData.addUserToHouse(rows[0].house_id, req.user.user_id);
                    req.user.houseID = rows[0].house_id;
                    console.log('user added to house!');
                }else {
                    console.log('house doesnt exist');
                    return res.status("403").send("Hey Man, that house doesn't exist. Maybe create a new house or double check your code!");
                }
            })
            .catch(function(err) {
                console.log("", err);
            });
        console.log(req.user);
    });

    router.get('/api/getGroups', function(req, res) {
        bankData.getHouseGroups(req.user.houseID)
        .then(function(response) {
            console.log("", response);
            res.json(response)
        });
    });

    //updates a user's password
    router.put('/api/updatePass', function(req, res) {
        bankData.getUser(req.user.email)
            .then(function(rows) {
                if(rows.length != 0) {
                    console.log("req body", req.body);
                    console.log("user data", rows);
                    console.log("old pass", req.body.oldPass);
                    console.log("what is row at 0", rows[0]);
                    console.log("the hash pass of rows[0]: ", rows[0].hash_pass);

                    if(isValidPassword(rows[0], req.body.oldPass)) {
                        console.log("Updating password");
                        bankData.updateUserPass(req.body.newPass, req.user.user_id);
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
            bankData.getUser(req.user.email)
            .then(function(rows){
                console.log("data!");
                console.log(rows[0]);
                req.user.user_id = rows[0].user_id;
                console.log(req.user);
                res.json(req.user);
            })
            console.log("sign up user", req.user);
            
        });

    //get all tasks for user
    router.get('/api/tasks', function(req, res, next) {
        console.log("Entered get tasks");
        console.log("EMAIL " + req.user.email);
        bankData.getTasksForUser(req.user.email)
            .then(function(rows) {
                console.log("ROWS " + rows);
                res.json(rows);
            })
            .catch(function() {
                res.status("404").send("Tasks query failed");
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
            .catch(function(err) {
                res.status("404").send("Can't find user");
            });
    });

    router.post('/api/leaveHouse', function(req, res) {
        bankData.removeUserHouse(req.user)
        .then(function(rows) {
            console.log("before removing house", req.user);
            delete req.user.houseID;
            console.log("after removing house", req.user);
            res.json(req.user);
        })
    })

    /*router.post('/api/leaveGroup', function(req, res) {
        .then(function(rows) {
            // find the id of the group
            // delete the record that ties users to a particular group
        })
        .catch(function(err) {
            console.log("", );
        });
    })*/

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

    //grab all tasks for all accounts
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
        var taskCreatorHouseID;
        var taskOwnerHouseID;

        //go ahead and use req.user.varName = whatever to plant it in redis, I think?

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
            //grabs task creator's house id- could perhaps be put in a different area
            /*
            .then(function() {
                console.log("Grabbing task creator House ID")
                taskCreatorHouseID = bankData.getUserHouse(taskCreatorID);
            })
            //grabs task owner house id
            .then(function() {
                console.log("Grabbing task owner House ID");
                taskOwnerHouseID = bankData.getUserHouse(taskOwnerID);
            })*/
            //creates the task in the database
            .then(function() {
                //if(taskOwnerHouseID == taskCreatorHouseID) {
                    var creationTime = new Date();
                    generatedTaskID = guid();

                    var task = {
                        //may not be same as redis id
                        //taskCreator : req.user.id,
                        taskName : req.body.taskName,
                        taskID : generatedTaskID,
                        taskType : req.body.taskType,
                        taskDueDate : req.body.taskDueDate,
                        taskDescription : req.body.taskDescription,
                        taskStatus : "incomplete",
                        taskTime : creationTime
                    };

                    return bankData.createTask(task);
                /*} else {
                    console.log("House ID's do not match");
                    res.status("400").send("Not in your house");
                }*/
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

    // upload a reference to profile image
    router.post('/api/uploadProfile', function(req, res) {
        // take file form angular form
        // generate a folder on server for file to be put
        // place file at location
        // insert location of image file into tblUSER
        //      - make sure to change the database so that it can handle another field, (it can be null)
        //      - don't forget to add to the maria.js file so that querying can happen.
    });
    //compares the given password and user's set pass
    var isValidPassword = function(user, password){
        console.log("user object", user);
      return bCrypt.compareSync(password, user.hash_pass);
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

    var houseCode = function() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }

        return s4()+s4();
    }

    return router;
}



