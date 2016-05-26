'use strict';

/*
    All of the routes used for the http requests in this app
*/

var express = require('express');
var bluebird = require('bluebird');
var bCrypt = require('bcrypt-nodejs');
var router = express.Router();
//image uploading
var multer  = require('multer');
var upload = multer({ dest: './uploads/'});
var fs = require('fs');
var url = require('url');
var TAG = "ROUTES "

module.exports = function(passport, bankData) {

    //router.post('/api/upload', function (req, res) {
        router.post('/api/upload', upload.single('image'), function(req, res){
            console.log('image perhaps?', req.files);
            console.log(req.body) // form fields
            console.log(req.file) // form files
            req.user.user_pic = './uploads/' + (req.file.filename + '.png')
            fs.renameSync('./uploads/' + req.file.filename, req.user.user_pic);
            bankData.updateProfPic(req.user.user_id, req.user.user_pic);
            res.json(req.user);
            
            // assign the file name when created, to the user table, so alter user table to have an image file link
            // also get defualt user image
            // look into how to do this with android, which is going to be different
        });
    //});

    //signs the user out, and redirects them to home
    router.get('/api/signout', function(req, res) {
        console.log(req);
        req.logout();
        res.redirect('/'); 
    });

    router.get('/uploads/:id', function(req, res) {
        console.log('', req.params.id);
        var request = url.parse(req.url, true);
        var action = request.pathname;
        console.log('file path request?', request.pathname);
        var img = fs.readFileSync('.' + request.pathname);
        res.end(img);
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
                        console.log("user is in a house");
                        console.log(rs[0]);
                        req.user.houseID = rs[0].house_id;
                        res.json([req.user, rs[0]]);
                    })
                } else {
                    // needs to create house
                    console.log("user is not in a house");
                    res.json(req.user);
                }
            })
    })

    //loads the main information for each user
    router.get('/api/feed', function(req, res) {
        console.log("feed user", req.user);
        res.json(req.user);
    });
    
    // returns the code of the house the user is in
    router.get('/api/house', function(req, res) {
        console.log("HOUSE API grabbing house");
        bankData.getHouse(req.user.user_id)
            .then(function(response) {
               console.log("HOUSE API RESPONSE ")
               console.log(response);
               if(typeof response[0] == 'undefined') {
                   console.log("HOUSE API UNDEFINED")
               } else {
                   console.log("AYYY LMAO")
                  req.user.houseID = response[0].house_id;
               }
               res.json(req.user);
            })
    });
    
    router.get('/api/houseDetails', function(req, res) {
        console.log("~!~!~!H13213OUSE API GRABBING ALL DETAILS OF HOUSE");
        console.log(req.user);
        bankData.getHouseWithID(req.user.houseID)
            .then(function(response) {
              console.log("response!!!!");
              console.log(response);
              res.json([response[0]])
            })
        
    })

    router.get('/api/profile', function(req, res){
        bankData.getUser(req.user.requestedProfile)
        .then(function(response) {
            console.log('requestedProfile', response);
            res.json([req.user, response[0]]);
        });
    });

    router.post('/api/loadProfile', function(req, res) {
        req.user.requestedProfile = req.body.loadEmail;
        res.json(req.user);
    });

    router.get('/api/getUsers', function(req, res) {
        console.log("routes: getting users");
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
        } else {
            //in house
            console.log("user is not in a house");
            console.log(req.user.houseID);
        }
    });

    router.post('/api/joinGroup', function(req, res) {
        bankData.addUserToGroup(req.body.groupId, req.user.user_id)
    });

    //logs a user in
    router.post('/api/login', passport.authenticate('local-login'),
        function(req, res) {
            console.log('in login route!!!!! bitch3z');
            res.json(req.newUser);
        });
        
    router.get('/api/facebook', passport.authenticate('facebook-login', { scope:'email'}));
    
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
                res.json(code);
            })
            .catch(function(){
                res.status("404").send("You done broke the machien");
            });
    });

    router.put('/api/createGroup', function(req, res) {
        console.log("1732tyu4g92374ty4iu5whe58495y3486374895r");
        console.log(TAG + " and req.body ", req.body);
     
        bankData.createGroup(req.body.group_name, req.body.group_descr)
        .then(function(rows){
            console.log("ROWSSWWEWEOWEOWOEOEWOEWOWEOEW 21383172313");
            console.log(rows);
             for (var i = 0; i < req.body.group_members.length; i++) {
                 console.log(rows.insertId + " " + req.body.group_members[i].user_id);
                bankData.addUserToGroup(rows.insertId, req.body.group_members[i].user_id);
            } 
            
            
            
        })
    });

    router.put('/api/joinHouse', function(req, res) {
        console.log(req.body);
        console.log("~$!#@!#~@~!@~!@ joining house");
        bankData.getHouseWithCode(req.body.enterHouseCode)
            .then(function(rows) {
                console.log(rows[0]);
                if(rows[0] !== undefined) {
                    console.log('success house exists');
                    console.log(req.user);
                    bankData.addUserToHouse(rows[0].house_id, req.user.user_id);
                    req.user.houseID = rows[0].house_id;
                    console.log('user added to house!');
                }else {
                    console.log('house doesnt exist');
                    res.status("403").send("Hey Man, that house doesn't exist. Maybe create a new house or double check your code!");
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
            console.log("get groups", response);
            res.json(response)
        });
    });

    router.get('/api/viewUserGroups', function(req, res) {
        bankData.getUser(req.user.requestedProfile)
        .then(function(response){
            bankData.getUserGroups(response[0].user_id)
            .then(function(response) {
                res.json(response);
            });
        })
    });

    router.get('/api/getUserGroups', function(req, res) {
        bankData.getUser(req.user.email)
        .then(function(response){
            bankData.getUserGroups(req.user.user_id)
            .then(function(response) {
                res.json(response);
            });
        })
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
    
     router.put('/api/updatePaymentMethod', function(req, res) {
        bankData.getUser(req.user.email)
            .then(function(rows) {
                if(rows.length != 0) {
                    bankData.updateUserPaymentMethod(req.body.newMethod, req.user.user_id)
                } else {
                    res.status("403").send("You're not authorized to do that");
                }
            })
            .catch(function() {
                res.status("400").send("Error grabbing user information");
            });
    });
    
    router.put('/api/updatePaymentUser', function(req, res) {
        bankData.getUser(req.user.email)
            .then(function(rows) {
                if(rows.length != 0) {
                    bankData.updateUserPaymentUsername(req.body.newUsername, req.user.user_id)
                } else {
                    res.status("403").send("You're not authorized to do that");
                }
            })
            .catch(function() {
                res.status("400").send("Error grabbing user information");
            });
    });
    
    router.put('/api/updateMobile', function(req, res) {
        bankData.getUser(req.user.email)
            .then(function(rows) {
                if(rows.length != 0) {
                    console.log("updating mobile!!!!!!");
                    console.log(req.body.newMethod);
                    bankData.updateMobile(req.body.newMobile, req.user.user_id)
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

    //get all tasks for user, when you are the current user
    router.post('/api/tasks', function(req, res, next) {
        console.log("Entered get tasks");
        console.log("EMAIL " + req.user.email);
        console.log("SELECTED TASK TYPE: " , req.body.status);
        bankData.getTasksForUser(req.user.email, req.body.status)
            .then(function(rows) {
                console.log("ROWS " + rows);
                res.json(rows);
            })
            .catch(function() {
                res.status("404").send("Tasks query failed");
            });
    });

    //get all tasks for user, when its a different user
    router.get('/api/viewTasks', function(req, res, next) {
        console.log("Entered get tasks");
        console.log("EMAIL " + req.user.email);
        bankData.getTasksForUser(req.user.requestedProfile)
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
        console.log(req.body);
        var taskOwners = req.body.taskOwner;
        console.log(TAG + " TASK OWNERS LIST ", req.body.taskOwner);
        var creationTime = new Date();
        var generatedTaskID = guid();

        var task = {
            taskName : req.body.taskName,
            taskID : generatedTaskID,
            taskType : req.body.taskType,
            taskDueDate : req.body.taskDueDate,
            taskDescription : req.body.taskDescription,
            taskStatus : "incomplete",
            taskTime : creationTime
        };

      bankData.createTask(task)
        .then(function() {
            console.log( TAG + "created task, now creating usertasks");
            for (var i = 0; i < taskOwners.length; i++) {
                console.log(TAG + "ENTERED FOR EACH")
                console.log(TAG + "", taskOwners[i]);
                var info = {
                    taskOwnerID : taskOwners[i].user_id,
                    taskCreatorID : req.user.user_id,
                    taskID : generatedTaskID
                }
                console.log(TAG + "INFO FOR CREATE USER TASK")
                bankData.updateUserTaskTable(info);
            } 
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
    
    router.post('/api/getComment', function(req, res) {
       console.log(TAG + "Entered getComments");
       console.log(TAG + " req.body is ", req.body);
       bankData.getComment(req.body)
          .then(function(response) {
              res.json(response);
          });
    });
    
    router.post('/api/addComment', function(req, res) {
       console.log(TAG + " add comment" + req.body);
       req.body.creatorID = req.user.user_id;
       bankData.addComment(req.body)
          .then(function(response) {
              res.json(response);
          });
       
    });
    
    router.put('/api/deleteComment', function(req, res) {
       console.log(TAG + " delete comment");
       bankData.deleteComment(req.body.comment_id)
          .then(function(response) {
              res.json(response);
          }) 
    });
    
    router.post('/api/deleteTask', function(req, res) {
        var completedTime = new Date();
        req.body.completedDate = completedTime;
        console.log(TAG , req.body)
        bankData.removeTask(req.body);
    })

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



