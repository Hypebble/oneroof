'use strict';

// handles settings and group creation

var app = angular.module('settings', [])
	.controller('SettingController', function($scope, $http) {

		// for displaying house information
		$scope.houseCreated = false;
		$scope.houseJoined = false;
		$scope.inHouse = false;

		// for displaying groups
		$scope.groupJoined = false;
		$scope.groupCreated = false;

		// for displaying group members
		$scope.defaultGroup = false;
		$scope.otherGroup = false;
		$scope.createdGroup = false;


		$http.get('/api/settings')
			.then(function(response) {
				console.log(response);
				console.log(response.data[0]);
				if(response.data.length <= 2) {
					$scope.email = response.data[0].email;
					$scope.displayName = response.data[0].displayName;
					$scope.gravatarUrl = response.data[0].gravatarUrl;
				
					if(response.data[1] !== null) {
						$scope.houseID = response.data[1].house_id;
						$scope.houseNAME = response.data[1].house_name;
						$scope.houseCODE = response.data[1].house_code;
						$scope.inHouse = true;
					}
				} else {
					$scope.email = response.data.email;
					$scope.displayName = response.data.displayName;
				}

				if(!response.data.oAuth) {
					$scope.showPass = true;
				} 
				console.log(response);
			})
			.catch(function(err) {
				console.log("ruh roh");
			})

		$scope.joinHouse = function() {
			var enteredCode = {
				enterHouseCode : $scope.joinAHouse
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


		$scope.leaveHouse = function() {
			console.log("clicking leave house");
			$http.post('/api/leaveHouse')
			.then(function(response) {
				console.log("leaving success!", response);
			})
			.catch(function(err) {
				console.log("not good, this is a problem: ", err);
			})
		};

		$scope.joinGroup = function (){
			console.log("joined a group");
			$scope.groupJoined = true;
		};

		$scope.createGroup = function(){
			console.log("created a group");
			$scope.groupCreated = true;
		};

		$scope.selectOtherG = function(){
			console.log("Default Group Selected");
			$scope.otherGroup = true;
			if($scope.defaultGroup){
				$scope.defaultGroup = false;
			}
			if($scope.createdGroup){
				$scope.createdGroup = false;
			}
		};


		$scope.selectDefaultG = function(){
			console.log("Default Group Selected");
			$scope.defaultGroup = true;
			if($scope.otherGroup){
				$scope.otherGroup = false;
			}
			if($scope.createdGroup){
				$scope.createdGroup = false;
			}
		};

		$scope.selectCreateG = function(){
			$scope.createdGroup = true;
			if($scope.otherGroup){
				$scope.otherGroup = false;
			}
			if($scope.defaultGroup){
				$scope.defaultGroup = false;
			}
		};

		$scope.leaveOther = function(){
			$scope.otherGroup = false;
			$scope.groupJoined = false;
			
		};

		$scope.leaveCreated = function(){
			$scope.createdGroup = false;
			$scope.groupCreated = false;
		};

		// create house for user

		$scope.createHouse = function() {
			var houseName ={
				setHouseName : $scope.createNewHouse
			}

			console.log('', houseName);

			$http.put('/api/createHouse', houseName)
				.then(function(response) {
					console.log('', response);
				})
				.catch(function(err) {
					console.log("something's wrong: ", response);
				})
		};


		// update user display name
		$scope.updateName = function() {

			var newData = {
				displayName : $scope.changeDisplayName
			}

			$http.put('/api/updateDispl', newData)
				.then(function(response) {
					$scope.displayName = $scope.changeDisplayName;
					window.alert("Display name changed!");
					$scope.changeDisplayName = "";
					// $http.get('/api/settings')
					// 	.then(function(response) {
					// 		console.log("response ", response);
					// 		$scope.displayName = response.data.name;
					// 	})
					// 	.catch(function(){});
				})
				.catch(function(err) {
					console.log("newDispl fail");
					console.log(err);
				})
		}

		// update user password
		$scope.updatePassword = function() {

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


	});
