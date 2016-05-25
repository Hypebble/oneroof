'use strict';

//loads profile info for user
//allows user to update display name
//allows user to update password

//var uuid = require('node-uuid');

$(function() {
    function reposition() {
        var modal = $(this),
            dialog = modal.find('.modal-dialog');
        modal.css('display', 'block');
        
        // Dividing by two centers the modal exactly, but dividing by three 
        // or four works better for larger screens.
        dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
    }
    // Reposition when a modal is shown
    $('.modal').on('show.bs.modal', reposition);
    // Reposition when the window is resized
    $(window).on('resize', function() {
        $('.modal:visible').each(reposition);
    });
});

var oneApp = angular.module('users', ['ngRoute', "AppController"]);

var AppController = angular.module('AppController',[])
    .controller('UserController', function($scope, $http, $location) {
        $scope.newUser = {};
        $scope.newAccount = {};
        //$scope.editAccount = {};
        $scope.defaultPic = true;
        $scope.housemates = [];
        $scope.showPass = false;
        $scope.showProf = false;
        $scope.userObj = 0;
        $scope.userPic = "";
        $scope.showChoreForm = false;
        $scope.showBillForm = false;
        $scope.showModal = false;
        $scope.assignees = [];
        $scope.statusType = 'incomplete'
        $scope.selectedTask = "";
        $scope.currResponsibilityGroup = [];
        $scope.responsibilityGroups = [];
        
        /* page title stuff*/
        $scope.activePage = "My Feed";

        // http get the house code with api/house
        // store the house code, and kick off virginity
        $http.get("/api/house")
            .then(function(response) {
                console.log("API HOUSE ANGULAR " , response);
                console.log(response.data.houseID);
                $http.get("/api/houseDetails")
                    .then(function(response) {
                        console.log("FEEDJS printing house details")
                        console.log(response.data[0]);
                        $scope.houseName = response.data[0].house_name;
                        $scope.rentTotal = response.data[0].rent_total;
                        $scope.houseCode = response.data[0].house_code
                    })
               var ifHouseID = (response.data.houseID !== undefined);
               if(!ifHouseID) {
                   //run first time stuff
                   console.log("AMI I IN HERE?")
                   $("#instructionModal").modal('show');
                   $scope.showFirstHouseQuestion = true;
               }
               console.log("HOUSE ", ifHouseID)
               $http.get("/api/getUsers")
                    .then(function (response) {
                    console.log("housemates: ", $scope.housemates)
                        for(var i of response.data[1]){
                            console.log(i.name);
                            $scope.housemates.push(i);
                        }
                        console.log("new housemates: ", $scope.housemates)
                        $scope.userObj = response.data[0];

                        if($scope.userObj.user_pic != null) {
                            console.log('not null picture');
                            $scope.userPic = $scope.userObj.user_pic;
                            $scope.defaultPic = false;
                        }
                        console.log("full response", response);
                        console.log("assigned val", $scope.testAccounts);
                    })
                    .then(function() {
                        $http.get("/api/getGroups")
                            .then(function(response) {
                                console.log("1241341213123 ", response);
                                $scope.responsibilityGroups = response;
                            })  
                    })
   
            });
            
        

        $http.get('/api/feed')
            .then(function(response) {
                console.log(response)
                $scope.email = response.data.email;
                $scope.displayName = response.data.name;
                $scope.gravatarUrl = response.data.gravatarUrl;
                if(!response.data.oAuth) {
                    $scope.showPass = true;
                } 
            })
            .catch(function(err) {
                console.log("ruh roh");
            });
            
        //update this so that it gets the value of current or 
        // past button when thats added to UI
        
        $http.post("/api/tasks", {
            status: $scope.statusType
        })
            .then(function(response) {
                $scope.taskSelect(response.data[0]);
                $scope.tasks = response.data;
                console.log(response.data);
            });

        $scope.selectedTestAccount = null;
        $scope.testAccounts = [];

        
        $scope.feed = function() {
            console.log("made it to the feed view");
            $scope.showProf = true;
        }

        $scope.hideFeed = function() {
            console.log("hide feed");
            $scope.showProf = false;
        }

        $scope.loadProf = function() {
            var email = {
                loadEmail : $scope.userObj.email
            }

            $http.post("/api/loadProfile", email);
        }

        $scope.addTask = function() {
            console.log("Start adding task");
                console.log("assignees in feed ", $scope.assignees);
            var task = {
                taskOwner : $scope.assignees,
                taskName : $scope.taskName,
                taskType : $scope.taskType,
                taskDueDate : $scope.taskDueDate,
                taskDescription : $scope.taskDescription,
                amount : $scope.billAmount,
                priority : $scope.chorePriority
            }
            console.log("tasky task: " , task);

            $http.post('/api/addTask', task)
                .then(function(response) {
                    $scope.tasks.push(response.data);
                })
                .then(function() {
                    $http.get("/api/tasks")
                        .then(function(response) {
                            $scope.tasks = response.data;
                        });
                });
   
        }

        $scope.backBtn = function() {
            window.history.back();
        }


        $scope.imageClick = function(img){
            console.log("clicked an image", img);
            //$location.path(img);
            if(img === '/feed') {
                $location.path(img)
                $scope.activePage = "My Feed";
            }
            else if(img === '/roommates') {
                $location.path(img);
                $scope.activePage = "Roommates";
            }
            else if(img === '/house') {
                $location.path(img);
                $scope.activePage = "House Info";
            }
            else if(img === '/settings') {
                $location.path(img);
                $scope.activePage = "Account";
            }
        }


        $scope.imageChange = function(img){
            console.log("hovered an image", img);
            //img.setAttribute('src', 'http://dummyimage.com/100x100/eb00eb/fff');
        }
        //currently only works for our binary set up
        $scope.chooseTaskType = function() {
            console.log($scope.selectedTaskType)
            console.log("entered change task type")
            $scope.taskType = $scope.selectedTaskType;
            if($scope.selectedTaskType == "Chore") {
                $scope.showChoreForm = true;
                $scope.showBillForm = false;
                console.log("Switched to chore view")
            } else {
                $scope.showBillForm = true;
                $scope.showChoreForm = false;
                console.log("Switched to bill view")
            }
        }
        
        $scope.confirmExistingHouse = function() {
            console.log("Chose exisiting house");
            $scope.showFirstHouseQuestion = false;
            $scope.showCreateHouse= false;
            $scope.showHouseCodeEntry = true;
        }
        
        $scope.noHouse = function() {
            console.log("Creating new house on first run");
            $scope.showFirstHouseQuestion = false;
            $scope.showCreateHouse= true;
            $scope.showHouseCodeEntry = false;
            
        }
        
        $scope.createHouse = function() {
            var houseName ={
                setHouseName : $scope.modalHouseName
            }

            console.log('', houseName);

            $http.put('/api/createHouse', houseName)
                .then(function(response) {
                    console.log("should respond with house code here!");
                    console.log('', response.data);
                    $scope.generatedHouseCode = response.data;
                    $scope.showCreateHouse= false;
                    $scope.showCode= true;
                })
                .catch(function(err) {
                    console.log("something's wrong: ", err);
                })
        };
        
        $scope.joinHouse = function() {
            var enteredCode = {
                enterHouseCode : $scope.modalHouseCode
            }

            console.log(enteredCode);

            $http.put('/api/joinHouse', enteredCode)
                .then(function(response){
                    console.log("success", response);
                })
                .catch(function(err) {
                    console.log('not good this is a problem: ', err);
                })
        };
        
        $scope.removeAssignee = function(value) {
            console.log("remove assignee", value)
            console.log("ASSIGNEES:", $scope.assignees)
            $scope.assignees.splice($scope.assignees.indexOf(value), 1);
            $scope.housemates.push(value);
            console.log("ASSIGNEES AFTER:", $scope.assignees)
            console.log("HOUSEMATES", $scope.housemates)
            //$("#" + id).style("display", "none");
        }
        
        $scope.addAssignee = function() {
            console.log("add assignee ", $scope.currentHousemate)
            console.log("housemates: ", $scope.housemates);
            console.log("assignees: " , $scope.assignees);
            console.log(JSON.parse($scope.currentHousemate));
            var temp = JSON.parse($scope.currentHousemate);
            var index = -1;
            for (var i = 0; i < $scope.housemates.length; i++){
                if ($scope.housemates[i].email == temp.email) {
                    index = i;
                }
            }
            console.log("index: " + index);
            console.log("INDEX", $scope.housemates.indexOf(temp))
            if(index != -1) {
               $scope.housemates.splice(index, 1);
               $scope.assignees.push(temp); 
            }
            console.log("assignees after: " , $scope.assignees);
        }
        
        $scope.completeTask = function(id) {
            console.log(id);
            var data = {
                id: id
            }
            $http.post('/api/deleteTask', data) 
                .then(function(response) {
                    console.log(response);
                })
            
        }
        
        $scope.changeStatus = function() {
            if ($scope.statusType == 'incomplete') {
                $scope.statusType = 'complete';
            } else {
                $scope.statusType = 'incomplete';
            }
            $http.post("/api/tasks", {
                status: $scope.statusType
            })
            .then(function(response) {
                $scope.tasks = response.data;
                console.log(response.data);
            });

        }
        
        $scope.taskSelect = function(task) {
            $scope.selectedTask = task;
            console.log("Entered task select, task = ", task)
            $http.post('/api/getComment', $scope.selectedTask)
                .then(function(response) {
                    console.log("SETTING COMMENTS, RESPONSE =", response);
                    $scope.comments = response.data;
                })
                .catch(function(err) {
                    console.log(err);
                });
           
        }

        $scope.roommateSelect = function(housemate) {
            $scope.selectedHousemate = housemate;
            console.log("from feed.js", $scope.selectedHousemate.phone_num);
        }
        
        $scope.submitComment = function() {
            console.log("Submitting comment ", $scope.commentDescription);
            var data = {
                taskID: $scope.selectedTask.task_id,
                commentDescr:$scope.commentDescription
            }
            $http.post('/api/addComment', data)
                .then(function(response) {
                    console.log("SUBMIT COMMENT made it");
                    $scope.comments.push(response);
                    //show them the comment made it
                    //update to show their comment 
                });
        }
        
        $scope.deleteComment = function(comment) {
            console.log("FEED, deleting comment", comment);
            $http.put('/api/deleteComment', comment)
                .then(function(response) {
                    //splice shit
                })
        }
        
        $scope.createGroup = function() {
            console.log("in create group 12241322`3");
            var data = {
                group_members: $scope.currResponsibilityGroup,
                group_name: $scope.groupName,
                group_descr: $scope.groupDescr
            }
            console.log(data);
            $http.put('/api/createGroup', data)
                .then(function(response) {
                   console.log(response); 
                })
        }
        
        $scope.addAssigneeToGroup = function(housemate) {
            var temp = JSON.parse(housemate);
            console.log("add assignee ", $scope.currentHousemate)
            console.log("housemates: ", $scope.housemates);
            console.log("assignees: " , $scope.assignees);
            var index = -1;
            for (var i = 0; i < $scope.housemates.length; i++){
                if ($scope.housemates[i].email == temp.email) {
                    index = i;
                }
            }
            console.log("index: " + index);
            console.log("INDEX", $scope.housemates.indexOf(temp))
            if(index != -1) {
               $scope.currResponsibilityGroup.push(temp);
            }
            console.log("assignees after: " , $scope.assignees);
        }

        $scope.prettifyDates = function(date) {
            console.log("prettifying date!!!!!!");
            console.log(date);
            var prettyDate = moment(date);
            var dayDiff = prettyDate.diff(moment(), 'days');
            var hourDiff = prettyDate.diff(moment(), 'hours');
            var minuteDiff = prettyDate.diff(moment(), 'minutes');
            var secondDiff = prettyDate.diff(moment(), 'seconds');
            console.log(dayDiff);
            console.log(hourDiff);
            console.log(minuteDiff);
            console.log(secondDiff);
            if (dayDiff <= 0) {
                if (hourDiff <= 0) {
                    if(minuteDiff <= 0) {
                        return (secondDiff + " seconds ago");
                    }
                    return (minuteDiff + " minutes ago");
                }
                return (hourDiff + " hours ago");
            }            
            if (dayDiff = 1) {
                return("yesterday");
            } else {
                return(dayDiff + " days ago");
            }
            
            //var prettyDate = moment(date).format('ddd, MMM Do');
        }
        
        $scope.prettifyDue = function(dueDate) {
            console.log("pretititititi due ddaatetee");
            var now = moment(new Date()); //todays date
            var due = moment(dueDate);
            var daysDiff = due.diff(now, 'days');
            var hoursDiff = due.diff(now, 'hours');
            hoursDiff = hoursDiff - (daysDiff * 24);
            console.log(daysDiff + "d " + hoursDiff + "h")
            return(daysDiff + "d " + hoursDiff + "h");
        }
        
        $scope.determineDisplayName = function(assignee) {
            if(assignee.hasOwnProperty("group_name")) {
                 return assignee.group_name;   
            } else {
                 return assignee.displayName;
            } 
        };
        
    });

/* Routes for the app, yeah the ability to view history */
oneApp.config(['$routeProvider', function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/feed', {
            templateUrl: './templates/feed.html',
            controller: 'UserController'
    })
    .when('/roommates', {
        templateUrl: './templates/roommates.html',
        controller: 'UserController'
    })
    .when('/house', {
        templateUrl: './templates/house.html',
        controller: 'UserController'

    })
    .when('/settings', {
        templateUrl: './templates/settings.html',
        controller: 'UserController'
    });
}]);