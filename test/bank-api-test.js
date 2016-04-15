'use strict';

var should = require('should');
var request = require('request-promise');
request.defaults({jar: true});

var host = process.env.HOST || '127.0.0.1';
var baseUrl = "http://" + host + "/api/";

var signupEmail = "test@test.com";
var signupPassword = "test";
var signupConfirmPass = "test";
var signupDisplayName = "test";

var existingAccountEmail = "test2@test2.com";
var existingAccountPass = "test2";
var existingAccountDisplName = "test2";
var existingDefaultAccount = "1ff61260-e59b-11e5-af09-c94d95045a1f";
var existingBrokeAccount = "359a1490-e59b-11e5-af09-c94d95045a1f";
var existingRichAccount = "6f95ad80-e59b-11e5-af09-c94d95045a1f";

var otherUserAccount = "2a417560-e59c-11e5-af09-c94d95045a1f";
var fakeAccount = "testNope";

describe('urls API', function() {
    
    before(function() {
        console.log('Start the before chain');
        
        var options = {
            method: 'POST',
            uri: baseUrl + '/login',
            body: {
                email: existingAccountEmail,
                password: existingAccountPass
            },
            resolveWithFullResponse: true
        };
        
        //grab the cookies we need
        function handleCookies(res) {
            cookie = res.headers['set-cookie'];
            cookie = cookie.pop().split(";")[0];
          	console.log("Cookie successfully saved");
        }
        
        return request(options)
            .then(function(body) {
                return handleCookies(body);
            })
            .catch(function(err) {
            	throw new Error(err);
              // // A 302 status code actually isn't an error,\
              // // even though request promise thinks it is\
              // if(err.statusCode === 302) {
              //    return handleRes(err.response);
              // } else {
              //     throw new Error(err);
              // }
            })
    })


    // it('should update the display name for user' , function() {
    //     var options = {
    //         method: 'PUT',
    //         uri: baseUrl + 'updateDispl',
    //         body : {

    //         }, 
    //         json: true
    //     };
        
    //     return request(options)
    //         .then(function(body) {
               
    //         });
    // });
    
    // it('should update the password', function() {
    //     var options = {
    //         method: 'PUT',
    //         uri: baseUrl + 'updatePass',
    //         json: true
    //     };
        
    //     return request(options)
    //         .then(function(body) {
               
    //         });
    // });
    

    it('should add an account for existing user with under 5 accounts' + existingAccountEmail, function() {
        var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'accounts',
            body: {
            	accountName : "YourNewAccount"
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
            .then(function(body) {
            	console.log("Success!");
            })
            .catch(function(err) {
            	body.statusCode.should.not.be.above(399);
            });
    });

    it('should show accounts for existing user ' + existingAccountEmail, function() {
    	var options = {
            method: 'GET',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'accounts',
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		body.statusCode.should.be.below(400);
        		console.log("Success!");
        	})
        	.catch(function(body) {
        		body.statusCode.should.not.be.equal(404);
        	});
    });

    it('should update account name of non primary account with id ' + existingRichAccount, function() {
        var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'updateAccountName',
            body: {
            	id : existingRichAccount,
            	accountName : "newRichName" 
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		body.statusCode.should.be.below(400);
        		console.log("Success!");
        	})
        	.catch(function(body) {
        		body.statusCode.should.not.be.equal(400);
        	});
    });

    t('should not update account name of non primary account with id ' + existingDefaultAccount, function() {
        var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'updateAccountName',
            body: {
            	id : existingDefaultAccount,
            	accountName : "newDefaultName" 
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		body.statusCode.should.be.equal(400);
        		console.log("Failure!");
        	})
        	.catch(function(body) {
        		body.statusCode.should.be.equal(400);
        	});
    });


    it('should delete an account with no balance and not primary with id ' + existingBrokeAccount, function() {
        var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'delete',
            body: {
            	accountId : existingBrokeAccount
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		body.statusCode.should.be.below(400);
        		console.log("Success!");
        	})
        	.catch(function(body) {
        		body.statusCode.should.not.be.above(399);
        	});
    });

    it('should not delete an account with an outstanding balance and not primary with id ' + existingRichAccount, function() {
        var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'delete',
            body: {
            	accountId : existingRichAccount
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		console.log("Failure!");
        	})
        	.catch(function(body) {
        		body.statusCode.should.be.equal(405);
        	});
    });

    it('should not delete an account that is primary with id ' + existingDefaultAccount, function() {
        var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'delete',
            body: {
            	accountId : existingDefaultAccount
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		console.log("Failure!");
        	})
        	.catch(function(body) {
        		body.statusCode.should.be.equal(405);
        	});
    });


    it('should create a transaction with sourceAccount owned by user with sufficient funds, and destAccount that exists', function() {
    	var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'addTransaction',
            body: {
	            sourceAccountID : existingRichAccount,
	            destAccountID : otherUserAccount,
	            transactionAmt : "10",
	            transDescription : "testDescr"
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		body.statusCode.should.be.below(400);
        		console.log("Success!");
        	})
        	.catch(function(body) {
        		body.statusCode.should.not.be.above(399);
        	});
    });

    it('should not create a transaction with sourceAccount not owned by user', function() {
    	var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'addTransaction',
            body: {
	            sourceAccountID : otherUserAccount,
	            destAccountID : existingBrokeAccount,
	            transactionAmt : "10",
	            transDescription : "testDescr"
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		console.log("Failure!");
        		body.statusCode.should.be.equal(403);
        	})
        	.catch(function(body) {
        		body.statusCode.should.be.equal(403);
        	});
    });

    it('should not create a transaction with sourceAccount owned by user, and destAccount that doesnt exist', function() {
    	var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'addTransaction',
            body: {
	            sourceAccountID : existingRichAccount,
	            destAccountID : fakeAccount,
	            transactionAmt : "10",
	            transDescription : "testDescr"
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		console.log("Failure!");
        		body.statusCode.should.be.equal(404);
        	})
        	.catch(function(body) {
        		body.statusCode.should.be.equal(404);
        	});
    });

    it('should not create a transaction with insufficient funds', function() {
    	var options = {
            method: 'POST',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'addTransaction',
            body: {
	            sourceAccountID : existingBrokeAccount,
	            destAccountID : existingDefaultAccount,
	            transactionAmt : "100",
	            transDescription : "testDescr"
            },
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		console.log("Failure!");
        		body.statusCode.should.be.equal(405);
        	})
        	.catch(function(body) {
        		body.statusCode.should.be.equal(405);
        	});
    });

    it('should show transactions', function() {
    	var options = {
            method: 'GET',
            headers: {"Cookie" : cookie},
            uri: baseUrl + 'transactions',
            resolveWithFullResponse: true,
            json: true
        };

        return request(options)
        	.then(function(body) {
        		console.log("Success!");
        		body.statusCode.should.be.below(400);
        	})
        	.catch(function(body) {
        		body.statusCode.should.be.equal(404);
        	});
    });

});

describe('signup API', function() {
	it('should create a new user and sign in', function() {
	        var options = {
	            method: 'POST',
	            uri: baseUrl + 'signup',
	            body: {email : signupEmail,
					   password : signupPassword,
					   confirmPass : signupConfirmPass,
					   displayName : signupDisplayName},
	            resolveWithFullResponse: true,
            	json: true
	        };
	        
	        return request(options)
	            .then(function(user) {
	               body.statusCode.should.be.below(400);
	            })
	            .catch(function() {
	            	body.statusCode.should.be.below(400);
	            });
	    });
});











