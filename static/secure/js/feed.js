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
		$scope.showPass = false;
		$scope.showProf = false;
		$scope.userObj = 0;
		$scope.userPic = "";

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
			})

		$http.get("/api/tasks")
			.then(function(response) {
				$scope.tasks = response.data;
				console.log(response.data);
			});

		$scope.selectedTestAccount = null;
    	$scope.testAccounts = [];

    	$http.get("/api/getUsers")
    		.then(function (response) {
    			var arr = [];
    			for(var i of response.data[1]){
    				console.log(i.name);
    				arr.push(i);
    			}
        		$scope.testAccounts = arr;
        		$scope.userObj = response.data[0];

        		if($scope.userObj.user_pic != null) {
        			console.log('not null picture');
        			$scope.userPic = $scope.userObj.user_pic;
        			$scope.defaultPic = false;
        		}
        		console.log("full response", response);
        		console.log("assigned val", $scope.testAccounts);
        	});

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

			var task = {
	            taskOwner : $scope.taskOwner,
	            taskName : $scope.taskName,
	            taskType : $scope.taskType,
	            taskDueDate : $scope.taskDueDate,
	            taskDescription : $scope.taskDescription,
	            amount : $scope.billAmount,
	            priority : $scope.chorePriority
        	}

        	$http.post('/api/addTask', task)
        		.then(function() {
        			scope.tasks.push(response.data);
        		})
        		.then(function() {
        			$http.get("/api/tasks")
						.then(function(response) {
							$scope.tasks = response.data;
						});
        		});
   
		}

	});
