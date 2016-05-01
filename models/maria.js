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
	
	getUserFB(profileId) {
		console.log("getting user by Facebook!");
		var sql = 'select * from tblUSER where facebook_id=?';
		console.log(connPool.queryAsync(sql, profileId));
		return connPool.queryAsync(sql, profileId);	
	},

	createUser(user) {
		console.log("Begin create user");
		console.log(user);
		if (user.hasOwnProperty() ) {
			console.log("creating facebook user!!!");
			var sql = 'insert into tblUSER (facebook_email, name, facebook_token, facebook_id) values (?, ?, ?, ?)';
			var params = [user.facebook_email, user.displayName, user.facebook_token, user.facebook_id];
		} else {
			console.log("creating local user!!!");
			var sql = 'insert into tblUSER (email, name, hash_pass) values (?, ?, ?)';
			var params = [user.email, user.displayName, user.hashPass];
			
		}
		return connPool.queryAsync(sql, params);

	},

	updateUserDisplayName(displayName, id) {
		console.log("", displayName);
		console.log("", id);
		var sql = 'update tblUSER set name=? where user_id=?'
		return connPool.queryAsync(sql, [displayName, id]);
	}, 

	updateUserPass(pass, id) {
		console.log("Making it in, but not past hash")
		var newPassword = createHash(pass);
		var sql = 'update tblUSER set hash_pass=? where user_id=?';
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
	
	createTask(task) {
		console.log(TAG + "creating a task");
		console.log(task.taskName);
		var sql = 'insert into tblTASK (task_name, task_time, task_type, task_status, task_due_date) values (?, ?, ?, ?, ?)';
		var params = [task.taskName, task.taskTime, task.taskType, task.taskStatus, task.taskDueDate];
		return connPool.queryAsync(sql, params)	
	},

	updateUserTaskTable(info) {
		console.log(TAG + "adding a task into USERTASK");
		console.log(info);
		var sql = 'insert into tblUSER_TASK (task_id, task_owner_id, task_creator_id) values (?, ?, ?)';
		var params = [info.taskID, info.taskOwnerIDInfo, info.taskCreatorIDInfo];
		return connPool.queryAsync(sql, params);
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



