'use strict';

var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

module.exports = mongoose.model('User', {
	email: {type: String, unique: "true", required: "true"},
	password: {type: String, required: "true"},
	displayName: {type: String, required: "true"},
	oAuth: Boolean,
	gravatarUrl: String
});
