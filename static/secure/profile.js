'use strict';

//loads profile info for user
//allows user to update display name
//allows user to update password

//var uuid = require('node-uuid');

var app = angular.module('users', [])
	.controller('UserController', function($scope, $http) {
		$scope.newUser = {};
		$scope.newTask = {};
		//$scope.editAccount = {};

		$scope.showPass = false;
		$scope.showProf = false;
		$scope.confirmPass = false;
		$scope.incorrectPass = false;
		$scope.showTask = false;
		$scope.transactionView = false;
		$scope.showTransactions = false;
		$scope.editViewIndex = false;
		$scope.numOffset = 0;

		$http.get('/api/profile')
			.then(function(response) {
				$scope.email = response.data.email;
				$scope.displayName = response.data.displayName;
				$scope.gravatarUrl = response.data.gravatarUrl;
				if(!response.data.oAuth) {
					$scope.showPass = true;
				} 
			})
			.catch(function(err) {
				console.log("ruh roh");
			})

		$scope.profile = function() {
			console.log("made it to the profile view");
			$scope.showProf = true;
		}

		$scope.hideProfile = function() {
			console.log("hide profile");
			$scope.showProf = false;
		}

		$scope.submit2 = function() {

			var newData = {
				displayName : $scope.changeDisplayName
			}

			$http.put('/api/updateDispl', newData)
				.then(function(response) {
					$scope.displayName = $scope.changeDisplayName;
					window.alert("Display name changed!");
					$scope.changeDisplayName = "";
				})
				.catch(function(err) {
					console.log("newDispl fail");
					console.log(err);
				})
		}

		$scope.submit3 = function() {

			var data = {
				oldPass : $scope.curPass,
				newPass : $scope.newPassword,
				confirmPass : $scope.confirmNewPassword
			}

			if($scope.newPassword == $scope.confirmNewPassword) {
				$scope.confirmPass = false;
				$http.put('/api/updatePass', data)
				.then(function(response) {
					$scope.incorrectPass = false;
					window.alert("Password changed!");
					$scope.curPass = "";
					$scope.newPassword = "";
					$scope.confirmNewPassword = "";
				})
				.catch(function(response) {
					$scope.incorrectPass = true;
				})
			} else {
				$scope.confirmPass = true;
				console.log("passwords don't match up");
			}


		}

		$scope.showTasks = function() {
			console.log("Show tasks");
			$scope.showTasks = true;
			//$http.get("/api/accounts")
            $http.get("/api/tasks")
				.then(function(response) {
					$scope.tasks = response.data;
				});

		}

		$scope.addTasks = function() {
			console.log("Start add task");

			//$http.post("/api/accounts", $scope.newAccount)
            $http.post("/api/tasks", $scope.newTask)
				.then(function(response) {
					$scope.tasks.push(response.data);
					$scope.newTasks = {};
					return $scope.newTask;
				})
				.then(function() {
					//$http.get("/api/accounts")
                    $http.get("/api/tasks")
						.then(function(response) {
							$scope.tasks = response.data;
						});
				});
			
		}

		$scope.deleteTask = function(taskID, index) {
			console.log("Start delete account");
			console.log(index);
			console.log(taskID);

			var task = {
				taskId : taskID
				//indexNew : index
			}

			$http.post('/api/delete', task)
				.then(function() {
					//$scope.accounts.splice(index, 1);
                    $scope.tasks.splice(index, 1);
				})
				.then(function() {
					//$http.get("/api/accounts")
					$http.get("api/tasks")
                    	.then(function(response) {
							$scope.tasks = response.data;
						});
				});
		}

		$scope.showEditTaskView = function(index) {
			console.log("Show editTask");
			$scope.editViewIndex = index;
		}

		$scope.checkShowEdit = function(index) {
			return $scope.editViewIndex === index;
		}

		$scope.editTask = function(newId, newTaskName) {
			console.log("Entered editTask");
			console.log("changed name = " + newTaskName);

			var newTaskInfo = {
				id : newId,
				TaskName : newTaskName
			};

			if(newTaskName.length <= 50) {
				$http.post('/api/updateTaskName', newTaskInfo)
					.then(function() {
						window.alert("Task Name Changed!")
					})
					.catch(function() {
						window.alert("Something went wrong updating your task");
					});
			} else {
				window.alert("New name is too long");
			}

		} 

		$scope.addTransaction = function() {
			console.log("Start adding transaction");

			var transaction = {
	            sourceAccountID : $scope.sourceAccountID,
	            destAccountID : $scope.destAccountID,
	            transactionAmt : $scope.transactionAmt,
	            transDescription : $scope.transDescription
        	}

        	$http.post('/api/addTransaction', transaction)
        		.then(function() {
        			scope.transactions.push(response.data);
        		})
        		.then(function() {
        			$http.get("/api/tasks")
						.then(function(response) {
							$scope.tasks = response.data;
						});
        		});
   
		}

		$scope.hideTasks = function() {
			console.log("Hide tasks");
			$scope.showTasks = false;
		}

		$scope.showTransactionView = function() {
			console.log("Show the transaction stuff");
			$scope.transactionView = true;
		}

		$scope.startTransaction = function() {
			console.log("Start a transaction");

		}

		$scope.showTransactionList = function() {
			$scope.showTransactions = true;
			
			$http.get('/api/transactions')
				.then(function(response) {
					console.log(response.data);
					$scope.transactions = response.data;
				});
		}

		$scope.hideTransactionView = function() {
			console.log("Hide transaction stuff");
			$scope.transactionView = false;
		}

	});
