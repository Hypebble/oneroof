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
		$scope.confirmPass = false;
		$scope.incorrectPass = false;
		$scope.showAccount = false;
		$scope.transactionView = false;
		$scope.showTransactions = false;
		$scope.editViewIndex = false;
		$scope.numOffset = 0;
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

		$scope.showAccounts = function() {
			console.log("Show accounts");
			$scope.showAccount = true;
			$http.get("/api/accounts")
				.then(function(response) {
					$scope.accounts = response.data;
				});

		}

		$scope.showEditAccountView = function(index) {
			console.log("Show editAccount");
			$scope.editViewIndex = index;
		}

		$scope.checkShowEdit = function(index) {
			return $scope.editViewIndex === index;
		}

		$scope.editAccount = function(newId, newAccountName) {
			console.log("Entered editAccount");
			console.log("changed name = " + newAccountName);

			var newAccountInfo = {
				id : newId,
				accountName : newAccountName
			};

			if(newAccountName.length <= 50) {
				$http.post('/api/updateAccountName', newAccountInfo)
					.then(function() {
						window.alert("Account Name Changed!")
					})
					.catch(function() {
						window.alert("Something went wrong updating your account");
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
        			$http.get("/api/accounts")
						.then(function(response) {
							$scope.accounts = response.data;
						});
        		});
   
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

		$scope.hideAccounts = function() {
			console.log("Hide accounts");
			$scope.showAccount = false;
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
