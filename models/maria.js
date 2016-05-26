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

	updateProfPic(user_id, filename) {
		var sql = 'update tblUSER SET user_pic=? where user_id=?';
		var params = [filename, user_id];
		return connPool.queryAsync(sql, params);
	},

	createUser(user) {
		console.log("Begin create user");
		console.log(user);
		if (user.hasOwnProperty("facebook_id") ) {
			console.log("12`2313 creating facebook user!!!");
			var sql = 'insert into tblUSER (facebook_email, displayName, facebook_name, facebook_token, facebook_id) values (?, ?, ?, ?, ?)';
			var params = [user.facebook_email, user.displayName, user.displayName, user.facebook_token, user.facebook_id];
		} else {
			console.log("creating local user!!!");
			var sql = 'insert into tblUSER (email, displayName, hash_pass, payment_method, payment_username, phone_num) values (?, ?, ?, ?, ?, ?)';
			var params = [user.email, user.displayName, user.hashPass, user.paymentMethod, user.paymentUsername, user.mobile];
			
		}
		console.log("SQL " + sql);
		console.log("params " + params);
		return connPool.queryAsync(sql, params);

	},

	updateUserDisplayName(displayName, id) {
		console.log("9123287482373 displayName", displayName);
		console.log("", id);
		var sql = 'update tblUSER set displayName=? where user_id=?'
		
		var params = [displayName, id];
		console.log(params);
		return connPool.queryAsync(sql, params);
	}, 

	updateUserPass(pass, id) {
		console.log("Making it in, but not past hash")
		var newPassword = createHash(pass);
		var sql = 'update tblUSER set hash_pass=? where user_id=?';
		return connPool.queryAsync(sql, [newPassword, id]);
	}, 
	
	updateUserPaymentMethod(meth, id) {
		console.log("updating payment mehtod!!!!@!@!@");
		console.log(meth);
		console.log(id);
		var sql = 'update tblUSER set payment_method=? where user_id=?';
		return connPool.queryAsync(sql, [meth, id]);
	}, 
	
	updateUserPaymentUsername(username, id) {
		console.log("Making it in, but not past hash")
		var sql = 'update tblUSER set payment_username=? where user_id=?';
		return connPool.queryAsync(sql, [username, id]);
	}, 
	
	updateMobile(mobile, id) {	
		var sql = 'update tblUSER set phone_num=? where user_id=?';
		console.log(mobile);
		var params = [mobile, id];
		console.log(sql);
		console.log(params)
		return connPool.queryAsync(sql, params);
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
	
	getHouseWithID(houseID) {
		console.log(TAG + "getting all ~~~!~!!~!~~!~~!~!!~~! house info");
		console.log("", houseID);
		var sql = 'select * from tblHOUSE where house_id=?';
		var params = [houseID];
		return connPool.queryAsync(sql, params);
	},

	getUserHouse(id) {
		console.log(TAG + "grabbing house for user");
		var sql = 'select tblHOUSE_USER.house_id from tblUSER join tblHOUSE_USER on tblUSER.user_id = tblHOUSE_USER.user_id where tblUSER.user_id = ?';
		return connPool.queryAsync(sql, id)
	},

	getUserGroups(id) {
		var sql = 'select * from tblUSER_GROUPS ug join tblGROUP g on ug.group_id = g.group_id where ug.user_id=?';
		var params = [id];
		return connPool.queryAsync(sql, params);
	},

	getUsersInHouse(houseID) {
		console.log(TAG, "grabbing all users present in a house");
		var sql = 'SELECT DISTINCT u.user_id, u.displayName, u.facebook_id, u.facebook_name, u.facebook_email, u.facebook_token, u.hash_pass, u.phone_num, u.email, u.user_pic, u.payment_method, u.payment_username FROM tblUSER u join tblHOUSE_USER hu on u.user_id = hu.user_id WHERE hu.house_id = ?';
		return connPool.queryAsync(sql, houseID);
	},
	
	createHouse(houseName, rentAmount, houseCode) {
		console.log(TAG + "creating house");
		var sql = 'insert into tblHOUSE (house_name, rent_total, house_code) values (?, ?, ?)';
		var params = [houseName, rentAmount, houseCode];
		console.log(connPool);
		return connPool.queryAsync(sql, params);
	},
	
	createGroup(groupName, groupDescr) {
		var sql = "insert into tblGROUP (group_name, group_descr) values (?, ?)";
		var params = [groupName, groupDescr];
		return connPool.queryAsync(sql, params);
	},

	getHouseGroups(houseID) {
		var sql = "select * from tblUSER_GROUPS ug join tblUSER u on u.user_id = ug.user_id join tblHOUSE_USER hu on hu.user_id = u.user_id join tblGROUP g on g.group_id= ug.group_id WHERE hu.house_id=?"
		var params = [houseID];
		return connPool.queryAsync(sql,params);
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
	
	addUserToGroup(group, user) {
		var sql = 'insert into tblUSER_GROUPS (group_id, user_id) values (?, ?)';
		var params = [group, user];
		return connPool.queryAsync(sql, params);
	},

	getTasksForUser(email, status) {
		console.log(TAG + "getting tasks for user");
		var sql = 'select * from tblUSER u join tblUSER_TASK ut on u.user_id = ut.task_owner_id or u.user_id = ut.task_creator_id join tblTASK t on t.task_id = ut.task_id where u.email = ? AND t.task_status=?';
		return connPool.queryAsync(sql, [email, status]);
	},
	
	getTasksforHouse() {
		console.log(TAG + "getting tasks for entire house");
	},
	
	createTask(task) {
		console.log(TAG + "creating a task");
		console.log(task);
		var sql = 'insert into tblTASK (task_id, task_name, task_time, task_type, task_status, task_due_date, task_descr) values (?, ?, ?, ?, ?, ?, ?)';
		var params = [task.taskID, task.taskName, task.taskTime, task.taskType, task.taskStatus, task.taskDueDate, task.taskDescription];
		return connPool.queryAsync(sql, params)	
	},

	updateUserTaskTable(info) {
		console.log(TAG + "adding a task into USERTASK");
		console.log(info);
		var sql = 'insert into tblUSER_TASK (task_id, task_owner_id, task_creator_id) values (?, ?, ?)';
		var params = [info.taskID, info.taskOwnerID, info.taskCreatorID];
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
	
	removeUserHouse(user) {
		var sql = "delete FROM tblHOUSE_USER WHERE house_id=? and user_id=?";
		var params = [user.houseID, user.user_id];
		return connPool.queryAsync(sql, params);
	},

	removeTask(data) {
		console.log(TAG + "removing a task and task id " + data.id);
        console.log("and the date is " + data.completedDate);
        // updateUserDisplayName(displayName, id) {
		// console.log("", displayName);
		// console.log("", id);
		// var sql = 'update tblUSER set name=? where user_id=?'
        var sql = 'update tblTASK set task_archived_date=?, task_status=? where task_id=?'
		var params = [data.completedDate, 'complete', data.id];
        return connPool.queryAsync(sql, params);
        
	},
	
	/*TO DO: edit task stuff needs to get added*/
	
	addComment(data) {
		console.log(TAG + "adding a comment to task");
        var sql = 'insert into tblCOMMENT (comment_descr, comment_owner_id, task_id) values(?, ?, ?)';
        var params = [data.commentDescr, data.creatorID, data.taskID];
        return connPool.queryAsync(sql, params);
	},
	
	getComment(data) {
		console.log(TAG + "getting comment for task ", data.task_id);
        var sql = 'select * from tblCOMMENT where task_id=?';
        return connPool.queryAsync(sql, data.task_id);
        
	},
    
    deleteComment(id) {
        console.log(TAG + " removing comment from task");
        var sql = 'delete from tblCOMMENT where comment_id=?';
        return connPool.queryAsync(sql, id);
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



