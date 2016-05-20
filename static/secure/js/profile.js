'use strict';

var app = angular.module('profiles', [])
	.controller('ProfileController', function($scope, $http) {
		$http.get('/api/profile')
		.then(function(response){
			console.log(response);
			$scope.name = response.data[1].displayName;
			console.log('display name', response.data[1]);
			$scope.email = response.data[1].email;
			if(response.data[1].user_pic == null) {
				$scope.profilePic = 'img/icon/miner.png';
			} else {
				$scope.profilePic = response.data[1].user_pic;
			}
			// these are here so that the routes are able to load data correctly
			$http.get('/api/viewUserGroups')
			.then(function(response){
				$scope.groups = response.data;
			})

			$http.get("/api/viewTasks")
			.then(function(response) {
				$scope.tasks = response.data;
			});
		})
	});