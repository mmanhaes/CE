var config = require('./config');
var Cloudant = require('cloudant');
var vcapServices = require('vcap_services');
var credentials = vcapServices.getCredentials('cloudantNoSQLDB', 'Lite', config.cloudant.instance);
var dbURL =  credentials.url || config.cloudant.url; 
var cloudant = Cloudant({url: dbURL, plugin:'retry', retryAttempts:10, retryTimeout:10000 });
const uuidv1 = require('uuid/v1');


var updateUser = function(data,callback){
	
	  var db = cloudant.db.use(config.database.users.name);	
  
	  db.insert(data,function(err, body, header) {
	      if (err) {
		        console.log('[db.Update] User', err.message);
		        return callback(err,null);
		      }
		 
		      console.log('You have Updated a record for an User.');
		      console.log(body);
		      return callback(null,"OK");
	  });
};

var createUser = function(data,callback){
	
	  var db = cloudant.db.use(config.database.users.name);	
	  var id =  uuidv1();
	  
	  db.insert(data,id,function(err, body, header) {
	      if (err) {
		        console.log('[db.insert] User', err.message);
		        return callback(err,null);
		      }
		 
		      console.log('You have inserted a record for an User.');
		      console.log(body);
		      return callback(null,"OK");
	  });
};

var findByUserName = function(username,callback){
	
	  var db = cloudant.db.use(config.database.users.name);
	  var sel = config.selectors.byUserName;
	  sel.selector.username = username;
	  
	  db.find(sel, function(err, result) {
		  if (err) {
		     console.log("Error in findByUsername",err);
		     return callback(err,null);
		  }	  
	  	  return callback(null,result);
	  });	
};

module.exports.findByUserName = findByUserName;
module.exports.createUser = createUser;
module.exports.updateUser = updateUser;