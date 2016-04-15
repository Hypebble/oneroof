'use strict';

//signin functionality to allow response without refresh

angular.module('signin', [])
	.controller('SignInController', function($scope, $http, $window) {

		//shows error about user credentials being wrong
		$scope.show = false;
		//shows loading wheel once sign in has been started
		$scope.loading = false;

		//active when user pushes sign in button
		$scope.submit = function() {
			var newUser = {
				email : $scope.email,
				password : $scope.password
			};

			$scope.loading = true;
			$http.post('/api/login', newUser)
				.then(function(response){
					$scope.loading = false;
					$window.location.href = '/profile.html';
				})
				.catch(function(err) {
					$scope.loading = false;
					$scope.show = "true";
					console.log("Auth failed");
				});
		}

	}); 