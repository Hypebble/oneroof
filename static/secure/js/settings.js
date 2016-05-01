'use strict';

// handles settings and group creation

var app = angular.module('settings', [])
	.controller('SettingController', function($scope, $http) {

		// for displaying house information
		$scope.houseCreated = false;
		$scope.houseJoined = false;
		$scope.house = false;

		// for displaying groups
		$scope.groupJoined = false;
		$scope.groupCreated = false;

		// for displaying group members
		$scope.defaultGroup = false;
		$scope.otherGroup = false;
		$scope.createdGroup = false;

		$scope.joinHouse = function() {
			$scope.houseJoined = true;
			$scope.house = true;
		};

		$scope.createHouse = function() {
			$scope.houseCreated = true;
			$scope.house = true;
		};

		$scope.leaveHouse = function() {
			$scope.houseCreated = false;
			$scope.houseJoined = false;
			$scope.house = false;
			
			// for displaying groups
			$scope.groupJoined = false;
			$scope.groupCreated = false;

			// for displaying group members
			$scope.defaultGroup = false;
			$scope.otherGroup = false;
			$scope.createdGroup = false;
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


	});
