'use strict';

//loads profile info for user
//allows user to update display name
//allows user to update password

//var uuid = require('node-uuid');

var app = angular.module('users', [])
	.controller('UserController', function($scope, $http) {
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
        
        
        // http get the house code with api/house
        // store the house code, and kick off virginity
        $http.get("/api/house")
            .then(function(response) {
                console.log("API HOUSE ANGULAR " , response);
                console.log(response.data.houseID);
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
                    });      
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
            

		$http.get("/api/tasks")
			.then(function(response) {
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

	});
