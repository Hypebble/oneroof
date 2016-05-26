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

		$scope.houseUsers = [];

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
				$http.get('/api/getGroups')
				.then(function(response){
					console.log('getgroups response', response);
					$scope.groups = response.data;
				});

				$http.get('/api/getUsers')
				.then(function(response){
					console.log('getUsers in house', response.data);
					$scope.houseUsers = response.data[1];
					console.log('users', $scope.houseUsers);
				});
			})
			.catch(function(err) {
				console.log("ruh roh");
			});


		/*var arr = [];

        		$scope.groups = arr;*/
        $scope.loadProf = function(arg) {
			var email = {
				loadEmail : arg
			}

			console.log('this should have a value', email);
			$http.post("/api/loadProfile", email);
		}

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
			var groupInfo = {
				groupN : $scope.groupName,
				groupD : $scope.groupDescr
				//groupD : $scope.groupDescr
			}
			console.log("", groupInfo);

			$http.put('/api/createGroup', groupInfo);
			console.log("created a group");
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
		
		// reveal the submit button for profile picture



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

		$scope.uploadFile = function(){
 
 	$scope.fileSelected = function(files) {
     if (files && files.length) {
        $scope.file = files[0];
     }
 
     $upload.upload({
       url: '/api/upload',
       file: $scope.file
     })
     .success(function(data) {
       console.log(data, 'uploaded');
      });
 
    };
};

	});
