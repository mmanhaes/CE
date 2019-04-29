/**
 * http://usejsdoc.org/
 */
var config = require('./config');
var vcapServices = require('vcap_services');
var Cloudant = require('cloudant');
var credentials = vcapServices.getCredentials('cloudantNoSQLDB', 'Lite', config.cloudant.instance);
var dbURL =  credentials.url || config.cloudant.url; 
var cloudant = Cloudant({url: dbURL, plugin:'retry', retryAttempts:20, retryTimeout:35000 });
const uuidv1 = require('uuid/v1');
var randomstring = require("randomstring");


var selectors  ={
		"all":{
			   "selector": {
				      "_id" : {"$gt": 0}
				   },
				   "fields": [
				      "_id",
				      "_rev",
				      "bookID",
				      "isbn",
				      "author",
				      "espAuthor",
				      "category",
				      "bookName",
				      "amount",
				      "loan",
				      "available",
				      "userIDs"
				   ],
				   "sort": [
				      {
				         "_id": "asc"
				      }
				   ]
		}
}

function getBookID(){
	var currentdate = new Date(); 
	
	var padding = randomstring.generate({
		  length: 4,
		  charset: 'numeric'
	});
		
	return  currentdate.getFullYear() 
					+ "-" + (currentdate.getMonth()+1) 
					+ "-" + currentdate.getDate()					 
					+ "-" + currentdate.getHours()  
	                + "-" + currentdate.getMinutes() 
	                + "-" + currentdate.getSeconds()
	                + "-" + padding;
}

function updateBookID(){
	
	var db = cloudant.db.use(config.database.book.name);
	 
	db.find(selectors.all, function(err, result) {
		  if (err) {
		    console.log(err);
		  }
		  else{
			  for(var i=0;i<result.docs.length;++i){
				  result.docs[i].bookID = getBookID();
			  }
			  var response = updateBook(result.docs,0);
			  if(response){
				  console.log("Documents Updated");
			  }else{
				  console.log("Fail to update Documents");
			  }			  
		  }
	});	
}

function updateBook(data,pos){
	
	if (pos === data.length){
		return true;
	}

	var db = cloudant.db.use(config.database.book.name);
	db.insert(data[pos], function(err, response, header) {
		if (err) {
			console.log('[db.update] for data: '+JSON.stringify(data[pos])+' Error: '+ err.message);
			return false;
		}
		else{
			console.log('You have updated the record.');
			console.log('With Content :');
			console.log(JSON.stringify(response, null, 2));
			return updateBook(data,++pos);
		}		
	});	
}

updateBookID();
