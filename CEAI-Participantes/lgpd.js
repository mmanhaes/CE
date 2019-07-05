var config = require('./config');
var Cloudant = require('cloudant');
var vcapServices = require('vcap_services');
var credentials = vcapServices.getCredentials('cloudantNoSQLDB', 'Lite', config.cloudant.instance);
var dbURL =  credentials.url || config.cloudant.url; 
var cloudant = Cloudant({url: dbURL, plugin:'retry', retryAttempts:10, retryTimeout:10000 });
const uuidv1 = require('uuid/v1');

var saveLgpdRecord = function(data,callback){
	
	  var db = cloudant.db.use(config.database.lgpd.name);	
	  var id =  uuidv1();
	  
	  db.insert(data,id,function(err, body, header) {
	      if (err) {
		        console.log('[db.insert] ', err.message);
		        return callback(null,err);
		      }
		 
		      console.log('You have inserted a record for GDPR.');
		      console.log(body);
		      return callback("OK",null);
	  });
};

var findLgpdRecord = function(email,tool,callback){
	
	  var db = cloudant.db.use(config.database.lgpd.name);	
	  var sel = config.lgpd;
	  sel.selector.email = email;
	  sel.selector.tool = tool;
	  console.log('Finding rules by selector ', JSON.stringify(sel));
	  
	  db.find(sel,function(err,result){					  
		  if (err) {
			    return callback(null,err);
		  }
		  if (result.docs.length>0){
			  if (result.docs[0].consent === "Y"){
				  return callback(true,null);
			  }
			  else{
				  return callback(false,null);
			  }
		  }	
		  else{
			  return callback(false,null);
		  }
	  });	
};

module.exports.findLgpdRecord = findLgpdRecord;
module.exports.saveLgpdRecord = saveLgpdRecord;