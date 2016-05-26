'use strict';

//signup a new user, confirm proper credentials in real time
angular.module('signup', [])
	.controller('SignUpController', function($scope, $http, $window) {

		//show username repeat use error
		$scope.show = false;
		//show not matching passwords error
		$scope.showPassError = false;
		//show loading wheel
		$scope.loading = false;

		$scope.submit = function() {
			console.log("entered signup angular");
			var newUser = {
				email : $scope.email,
				password : $scope.password,
				confirmPass : $scope.confirmPass,
				displayName : $scope.displayName
			};
			
			if ($scope.paymentUsername != "undefined") {
				newUser.paymentMethod =  $scope.paymentMethod;
				newUser.paymentUsername = $scope.paymentUsername;
			}
			
			if ($scope.mobile != "undefined") {
				newUser.mobile = $scope.mobile;
			}

			//double check passwords match
			if($scope.password == $scope.confirmPass) {
				$scope.showPassError = false;
				$scope.loading = true;
				console.log("posting new user ", newUser)
				$http.post('/api/signup', newUser)
					.then(function(response){
						console.log("Made it through sign up, redirecting the page")
						$scope.loading = false;
						$window.location.href = '/app.html#/feed';
					})
					.catch(function(err) {
						$scope.loading = false;
						$scope.show = true;
						console.log("ruh roh signup");
					});
			} else {
				$scope.showPassError = true;
			}
		}

	}); 