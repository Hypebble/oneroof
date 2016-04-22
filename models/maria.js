'use strict'

var connPool;
var uuid = require('uuid');
var bCrypt = require('bcrypt-nodejs');

var TAG = "MARIA ";

var bankData = {

	getUser(email) {
		console.log("Begin getting user");
		var sql = 'select * from tblUSER where email=?';
		console.log(connPool.queryAsync(sql, email));
		return connPool.queryAsync(sql, email);
	},

	createUser(user) {
		console.log("Begin create user");
		var sql = 'insert into tblUSER (email, name, hash_pass) values (?, ?, ?)';
		var params = [user.email, user.displayName, user.hashPass];
		return connPool.queryAsync(sql, params);
	},

	updateUserDisplayName(displayName, id) {
		var sql = 'update tblUSER set name=? where id=?'
		return connPool.queryAsync(sql, [displayName, id]);
	}, 

	updateUserPass(pass, id) {
		console.log("Making it in, but not past hash")
		var newPassword = createHash(pass);
		var sql = 'update tblUSER set password=? where id=?';
		return connPool.queryAsync(sql, [newPassword, id]);
	}, 
	
	getHouse() {
		console.log(TAG + "getting house info");
		
	}, 
	
	createHouse(houseName, rentAmount) {
		console.log(TAG + "creating house");
		var sql = 'insert into tblHOUSE (house_name, rent_total) values (?, ?)';
		var params = [houseName, rentAmount];
		return connPool.queryAsync(sql, params)	
	},
	
	getHouseCode() {
		console.log(TAG + "getting house code");
	},
	
	/*TO DO: edit house stuff needs to go here*/
	
	addUserToHouse() {
		console.log(TAG + "adding user to house");
	},
	
	getTasksForUser() {
		console.log(TAG + "getting tasks for user");
		var sql = 'select * from tblTASK where '
		var params = [username];
	},
	
	getTasksforHouse() {
		console.log(TAG + "getting tasks for entire house");
	},
	
	createTask() {
		console.log(TAG + "creating a task");
		var sql = 'insert into tblTASK (house_name, rent_total) values (?, ?)';
		var params = [houseName, rentAmount];
		return connPool.queryAsync(sql, params)	
	},
	
	removeTask() {
		console.log(TAG + "removing a task");
	},
	
	/*TO DO: edit task stuff needs to get added*/
	
	addTaskComment() {
		console.log(TAG + "adding a comment to task");
	},
	
	removeTaskComment() {
		console.log(TAG + "removing comment from task");
	}
	
	/*TO DO: edit task stuff here*/
	
	
	
	
	
	
	

};

//creates a hash on entered pass
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports.Model = function(connectionPool) {
	connPool = connectionPool;
	return bankData;
}



