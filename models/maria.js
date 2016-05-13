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
		if (user.hasOwnProperty("facebook_id") ) {
			console.log("creating facebook user!!!");
			var sql = 'insert into tblUSER (facebook_email, name, facebook_token, facebook_id) values (?, ?, ?, ?)';
			var params = [user.facebook_email, user.displayName, user.facebook_token, user.facebook_id];
		} else {
			console.log("creating local user!!!");
			var sql = 'insert into tblUSER (email, displayName, hash_pass) values (?, ?, ?)';
			var params = [user.email, user.displayName, user.hashPass];
			
		}
		console.log("SQL " + sql);
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
	
	getHouse(userId) {
		console.log(TAG + "getting house info");
		var sql = 'select * from tblHOUSE_USER where user_id=?';
		var params = [userId];
		return connPool.queryAsync(sql, params);
	},

	getHouseWithCode(houseCode) {
		console.log("", houseCode);
		var sql = 'select * from tblHOUSE where house_code=?';
		var params = [houseCode];
		return connPool.queryAsync(sql, params);
	}, 

	getUserHouse(id) {
		console.log(TAG + "grabbing house for user");
		var sql = 'select tblHOUSE_USER.house_id from tblUSER join tblHOUSE_USER on tblUSER.user_id = tblHOUSE_USER.user_id where tblUSER.user_id = ?';
		return connPool.queryAsync(sql, id)
	},

	getUsersInHouse(houseID) {
		console.log(TAG, "grabbing all users present in a house");
		var sql = 'SELECT * FROM tblUSER u join tblHOUSE_USER hu on u.user_id = hu.user_id WHERE hu.house_id = ?';
		return connPool.queryAsync(sql, houseID);
	},
	
	createHouse(houseName, rentAmount, houseCode) {
		console.log(TAG + "creating house");
		var sql = 'insert into tblHOUSE (house_name, rent_total, house_code) values (?, ?, ?)';
		var params = [houseName, rentAmount, houseCode];
		console.log(connPool);
		return connPool.queryAsync(sql, params);
	},
	
	// do we want to get the house code by user or by house?
	getHouseCode(houseId) {
		console.log(TAG + "getting house code");
		var sql = 'select * FROM tblHOUSE WHERE house_id=?'
		var params = [houseId];
		return connPool.queryAsync(sql, params);
	},
	
	/*TO DO: edit house stuff needs to go here*/
	
	addUserToHouse(houseId, userId) {
		console.log(TAG + "adding user to house");
		console.log("", houseId);
		console.log("", userId);
		var sql = 'insert into tblHOUSE_USER (house_id, user_id) values (?, ?)';
		var params = [houseId, userId];
		return connPool.queryAsync(sql, params);
	},
	
	getTasksForUser(email) {
		console.log(TAG + "getting tasks for user");
		var sql = 'select * from tblUSER u join tblUSER_TASK ut on u.user_id = ut.task_owner_id join tblTASK t on t.task_id = ut.task_id where u.email = ?';
		return connPool.queryAsync(sql, email);
	},
	
	getTasksforHouse() {
		console.log(TAG + "getting tasks for entire house");
	},
	
	createTask(task) {
		console.log(TAG + "creating a task");
		console.log(task);
		var sql = 'insert into tblTASK (task_id, task_name, task_time, task_type, task_status, task_due_date) values (?, ?, ?, ?, ?, ?)';
		var params = [task.taskID, task.taskName, task.taskTime, task.taskType, task.taskStatus, task.taskDueDate];
		return connPool.queryAsync(sql, params)	
	},

	updateUserTaskTable(info) {
		console.log(TAG + "adding a task into USERTASK");
		console.log(info);
		var sql = 'insert into tblUSER_TASK (task_id, task_owner_id, task_creator_id) values (?, ?, ?)';
		var params = [info.taskID, info.taskOwnerIDInfo, info.taskCreatorIDInfo];
		return connPool.queryAsync(sql, params);
	},

	updateBillTable(info) {
		console.log(TAG + "adding information to tblBILL");
		var convertedAmount = parseInt(info.amount);
		var sql = 'insert into tblBILL (task_id, bill_amount) values (?, ?)';
		var params = [info.taskID, convertedAmount];
		return connPool.queryAsync(sql, params);
	},

	updateChoreTable(info) {
		console.log(TAG + "adding information of tblCHORE");
		var sql = 'insert into tblCHORE (task_id, priority) values (?, ?)';
		var params = [info.taskID, info.priority];
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



