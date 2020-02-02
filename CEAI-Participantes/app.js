console.log("Iniciando CEAI Cadastro de Participantes Server...");
var express = require('express');
var config = require('./config');
var app = express();
var bodyParser = require("body-parser");
var vcapServices = require('vcap_services');
const uuidv1 = require('uuid/v1');
const case_ins = "(?i)"; 
//Variables used for authentication
var passport = require('passport');
var CustomStrategy = require('passport-local').Strategy;
var auth = require('./auth');
//Variables for Cloudant
var Cloudant = require('cloudant');
var credentials = vcapServices.getCredentials('cloudantNoSQLDB', 'Lite', config.cloudant.instance);
var dbURL =  credentials.url || config.cloudant.url; 
var cloudant = Cloudant(dbURL);
//Control Session data
var session = require('express-session');
//var RedisStore = require('connect-redis')(session);
//Variables for port
var port = (process.env.PORT || process.env.VCAP_APP_PORT || 3000);
var lgpd = require('./lgpd');
var users = require('./users');
const TOOL_NAME = "CEAI Participantes";
var crypto = require('./crypto');
const STANDARD_PASSWORD = '2b126db6d57d0d1763b1a77f3d89ea9e';
const APIKEY = '0f96c163c5bce56648eb83ff1566be8d';

function getCustomerID(){
	var currentdate = new Date(); 
	
	var min=1000; 
    var max=9999;  
    var padding = Math.floor(Math.random() * (+max - +min) + +min); 
	
	return  currentdate.getFullYear() 
					+ "-" + (currentdate.getMonth()+1) 
					+ "-" + currentdate.getDate()					 
					+ "-" + currentdate.getHours()  
	                + "-" + currentdate.getMinutes() 
	                + "-" + currentdate.getSeconds()
	                + "-" + padding;
}

passport.use('custom',new CustomStrategy(
		//IF I BY PASS TO OTHER CLASS AND OTHER THREAD WILL CAUSE Error [ERR_STREAM_WRITE_AFTER_END]
		function(username, password, cb) {
			  var db = cloudant.db.use(config.database.users.name);
			  var sel = config.selectors.byUserName;
			  sel.selector.username = username;
			  
			  db.find(sel, function(err, result) {
				  if (err) {
				     console.log("Error in findByUsername",err);
				     return cb(err);
				  }
				  else{
					 if (result.docs.length > 0){
						 //console.log("Returned user name "+result.docs[0].username+" to authenticate");
						 crypto.encrypt(password,function(encryptedPwd){
							 if (result.docs[0].username == username && result.docs[0].password == encryptedPwd){
								 console.log("User and Password OK for user:",username);
								 session.user = result.docs[0];								 
								 if (result.docs[0].password == STANDARD_PASSWORD){
									 session.changePassword = true;
								 }
								 else{
									 session.changePassword = false;
								 }
								 result.docs[0].lastAccessed = new Date();
								 if (typeof(result.docs[0].access)=='undefined'){
									 result.docs[0].access = [];
								 }
								 result.docs[0].access.push(result.docs[0].lastAccessed);
								 var input = result.docs[0];
								 users.updateUser(input,function(err,result){
									   if (err){
										   console.log('Error to update user',err);
									   }
									   else{
										   console.log('User '+ input.username+' updated with success with standard password');
									   }
								 });								 
								 return cb(null, result.docs[0]);								 
							 }
							 else{
								 console.log("User or Password NOK for user:",username);
								 return cb(null, false); 
							 }	
						 });
					 }
					 else{
						 return cb(null, false);
					 }
				  }
			  });
}));

passport.serializeUser(function(user, cb) {
	//console.log("Serializing User With Value:",user._id);
	cb(null, user._id);
});

passport.deserializeUser(function(id, cb) {
	 console.log("Calling deserializeUser",id);
	 //console.log("findById called");	  
	 if (session.user._id==id){
		 console.log("User "+session.user.displayName+" is valid");				 
		 return cb(null, session.user);
	 }
	 else{
		  var db = cloudant.db.use(config.database.users.name);
		  var sel = config.selectors.byUserId;
		  sel.selector._id = id;
		  
		  db.find(sel, function(err, result) {
			  if (err) {
			     console.log("Error in findByUserByID",err);
			     return cb(new Error("Error in findByUserByID"+err));
			  }
			  else{
				 if (result.docs.length > 0){
					 session.user = result.docs[0];	
					 return cb(null, session.user);
				 }
				 else{
					 return cb(new Error('User ' + id + ' does not exist'));
				 }
			  }
		  });
	 }
});

//Configure view engine to render EJS templates.
app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');

//Use application-level middleware for common functionality, including
//logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(session({ 
		secret: 'keyboard cat', 
		/*
		store: new RedisStore({
			  host:'127.0.0.1',
			  port:6380,
			  prefix:'sess'
			}),*/
			resave: false, 
			saveUninitialized: false
		}));

//Initialize Passport and restore authentication state, if any, from the
//session.
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static("public"));
app.use(express.static("node_modules/bootstrap/dist"));
app.use(bodyParser.urlencoded({ extended: false }));

//parse application/json
app.use(bodyParser.json());


var buildSelectorSearchPerson = function(type,data,callback){
	console.log('Checking contiguration by type',type);
	
	var configFound = config.searchPerson.filter(function(item) {
		  return item.type == type;
	});
	
	if (type != 'finance')
	{
	
		console.log('Configuration Found',JSON.stringify(configFound[0]));
		
		if (data.lastName!=="" && data.firstName!=="" && data.middleName!=="")
		{
			configFound[0].fullName_selector.selector.firstName.$regex = case_ins+data.firstName;
			configFound[0].fullName_selector.selector.middleName.$regex  = case_ins+data.middleName;
			configFound[0].fullName_selector.selector.lastName.$regex  = case_ins+data.lastName;
			
			return callback(false,configFound[0].fullName_selector);
		}	
		else{
			if (data.lastName!=="" && data.firstName!=="")
			{
				configFound[0].firstAndlastName_selector.selector.firstName.$regex  = case_ins+data.firstName;
				configFound[0].firstAndlastName_selector.selector.lastName.$regex  = case_ins+data.lastName;
				
				return callback(false,configFound[0].firstAndlastName_selector);
			}
			else
			{
				if (data.middleName!=="" && data.firstName!=="")
				{
					configFound[0].firstAndlastName_selector.selector.firstName.$regex  = case_ins+data.firstName;
					configFound[0].fullName_selector.selector.middleName.$regex  = case_ins+data.middleName;
					
					return callback(false,configFound[0].firstAndMiddleName_selector);
				}
				else
				{	
					if (data.firstName!=="")
					{				
						configFound[0].firstName_selector.selector.firstName.$regex  = case_ins+data.firstName;
						
						return callback(false,configFound[0].firstName_selector);
					}
				}	
			}			
		}
	}
	else{
		configFound[0].fincode_selector.selector.fincode = data.fincode;
		return callback(false,configFound[0].fincode_selector);		
	}
	
	return callback("No Selector Found",null);
};

app.get('/services/ceai/verifyChangePwd',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'application/json');
	var data = {};
	if (session.changePassword){
		data.message = "CHANGE";		
	}
	else{
		data.message = "DO NOT CHANGE";
	}
	res.end(JSON.stringify(data));
});

app.get('/services/ceai/lgpd', 
		require('connect-ensure-login').ensureLoggedIn(),
        function(req, res){		
	res.setHeader('Content-Type', 'application/json');
	console.log("Reading GDPR for User",req.user.username);
	//I'll set only focusID variable to define what request will show on screen by default.
	//As on requests.html load all headers by requests, on requests.js i'll get more info about the request
	lgpd.findLgpdRecord(req.user.username,TOOL_NAME, function(result,err) {
		if (err){
			var data = {};
			data.message = "NOT ACCEPTED";
			res.end(JSON.stringify(data));
		}
		else{
			var data = {};
			if (result===true){
				data.message = "ACCEPTED";
			}
			else{
				data.message = "NOT ACCEPTED";
			}
			console.log('Response consult GPD record: '+JSON.stringify(data));
			res.end(JSON.stringify(data));
		}
	});	
}); 

app.post('/services/ceai/saveNewPassword', 
		require('connect-ensure-login').ensureLoggedIn(),
        function(req, res){	
	res.setHeader('Content-Type', 'application/json');
	console.log("Saving Password for User",req.user.username);
	var db = cloudant.db.use(config.database.users.name);
	var sel = config.selectors.byUserName;
	sel.selector.username = req.user.username;
	  
	db.find(sel, function(err, result) {
	
		var input = result.docs[0];
		crypto.encrypt(req.body.password,function(encryptedPwd){
			input.password = encryptedPwd;	
			var db = cloudant.db.use(config.database.users.name);
			console.log('updating document for new password',JSON.stringify(input));
			db.insert(input,function(err, body, header) {
				  var data = {};
			      if (err) {
				        console.log('[db.update] saveNewPassword Error', err.message);
						data.message = "NOK";
						res.end(JSON.stringify(data));
				      }
			      else{
						data.message = "OK";
						res.end(JSON.stringify(data));
			      }
			});
		});
	});
}); 

app.post('/services/ceai/resetPassword', 
		require('connect-ensure-login').ensureLoggedIn(),
        function(req, res){	
	res.setHeader('Content-Type', 'application/json');
	
	console.log("Reseting Password for User ID ",req.body.userID);

	var db = cloudant.db.use(config.database.users.name);
	var sel = config.selectors.byUserIDSystem;
	sel.selector.userID = req.body.userID;
	  
	db.find(sel, function(err, result) {
		if (err) {
			console.log('Error in seach byUserIDSystem',JSON.stringify(result));
		 	data.message = "NOK";
			res.end(JSON.stringify(data));
		}
		else{
			 var data = {};
			 if (result.docs.length > 0){
				var input =  result.docs[0];
			 	input.password = STANDARD_PASSWORD;	
				db.insert(input,function(err, body, header) {
					  
				      if (err) {
					        console.log('[db.update] Reset Password Error', err.message);
							data.message = "NOK";
							res.end(JSON.stringify(data));
					      }
				      else{
				    	    console.log('[db.update] Reset Password OK');
							data.message = "OK";
							res.end(JSON.stringify(data));
				      }
				});
			 }
			 else{
				 	console.log('User not FOUND, Check with Administrator');
				 	data.message = "NOK";
					res.end(JSON.stringify(data));
			 }
		}
	});
}); 

app.post('/services/ceai/lgpd', 
		require('connect-ensure-login').ensureLoggedIn(),
        function(req, res){	
	res.setHeader('Content-Type', 'application/json');
	console.log("Saving LGPD for User",req.user.username);
	var input = req.body;
	input.email = req.user.username;
	input.tool = TOOL_NAME;
	lgpd.saveLgpdRecord(input, function(result,err) {
		var data = {};
		if (err){
			data.message = "NOT ACCEPTED";
			res.end(JSON.stringify(data));
		}
		else{
			data.message = result;
			console.log('Response save GPD record: '+JSON.stringify(data));
			res.end(JSON.stringify(data));
		}
	});	
}); 

app.get('/services/ceai/userInfo',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'application/json');
	var data= {};
	data.displayName = req.user.displayName;
	res.end(JSON.stringify(data));	
});

app.get('/services/ceai/checkUserAccess',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'application/json');
	console.log("Session Object : "+JSON.stringify(session.user));
	res.end(JSON.stringify(session.user));	
});

app.post('/services/ceai/loadSessionData', 
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	//TODO with searchKey , example '{"searchKey" : "general"}' define what selector to search and execute the db.find
		
	if (typeof session.user.userID !== 'undefined')
	{
		var sel = config.selectors[req.body.searchKey];
		sel.selector.userID = session.user.userID;
		var db = null;
		
		if (req.body.searchKey === "general" || req.body.searchKey === "contact" 
			|| req.body.searchKey === "association" || req.body.searchKey === "work" 
				|| req.body.searchKey === "study" || req.body.searchKey ==="forUpdates"){
			db = cloudant.db.use(config.database.person.name);
		}		
		
		if (db !== null){
			db.find(sel, function(err, result) {
				  if (err) {
				    console.log(err);
				    res.end(err);
				  }
				  else{
					  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(sel));
					  for (var i = 0; i < result.docs.length; i++) {
						  console.log('  Doc userIDs: %s', result.docs[i].userID);
					  }
					  console.log(JSON.stringify(result));
					  res.end(JSON.stringify(result));
				  }	  
			});	 
		}
		else{
			 res.end("Nenhum banco de dados encontrado para a operação, contacte o administrador");
		}
	}
});

app.post('/services/ceai/searchCPF', 
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'application/json');
	
	var db = cloudant.db.use(config.database.person.name);
	
	var sel = config.selectors.cpf;
	
	sel.selector.cpf = req.body.cpf;
	
	//Search with FirstName and LastName or FullName
	db.find(sel, function(err, result) {
			if (err) {
			    console.log(err);
			    config.config.searchError.error = err;
			    res.end(config.searchError);
			}
			else{
				  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(sel));
    			  var response = {};
				  if (result.docs.length>0)
				  {
					  response.data = result;
					  res.end(JSON.stringify(response));
				  }
				  else {
					  response.message = 'NOT FOUND';
					  res.end(JSON.stringify(response));		
				 }
			}
	});
});

app.post('/services/ceai/updatePersonAPI', 
		function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	
	if (req.get('apiKey') != APIKEY)
	{
		console.log("API Key passed",req.get('apiKey'));
		res.status(403);
		console.log('Headers',req.headers);
		res.end('{"message":"Not Authorized"}');
	}
	else{
		var db = cloudant.db.use(config.database.person.name);
		var selector = config.selectors.forFinancialUpdates;
		selector.selector.fincode = req.body.fincode;
		db.find(selector, function(err, result) {
			  if (err) {
			    console.log(err);
			    config.config.searchError.error = err;
			    res.end(config.searchError);
			  }
			  else{
				    console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
				    console.log('Result %s', JSON.stringify(result));
				    if (result.docs.length>0)
				    {					  	
				    	prepareUpdate(result.docs[0],req.body,function(response){
				    		db.insert(response, function(err, body, header) {
								if (err) {
									console.log('[db.update] ', err.message);
									res.end('[db.update] ', err.message);
								}
								else{
									console.log('You have updated the record.');
									console.log(body);
									console.log('With Content :');
									console.log(JSON.stringify(req.body, null, 2));
									res.write('Requisicão Atualizada com Sucesso Para o Usuário com o ID :'+response.userID +'\n');
									res.write('Código Financeiro :'+response.fincode +'\n');
									res.end('Participante : '+ response.firstName+ " "+ response.middleName+" "+response.lastName);	
								}	
							});								    		
				    	});
				    }
				    else
				    {
				    	res.end('Erro na Atualização, Motivo: o fincode '+ req.body.fincode + ' Não foi encontrado');
				    }	
			  }
		});	 
	}
});

app.post('/services/ceai/searchPersonAPI', 
		function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	
	if (req.get('apiKey') != APIKEY)
	{
		console.log("API Key passed",req.get('apiKey'));
		res.status(403);
		console.log('Headers',req.headers);
		res.end('{"message":"Not Authorized"}');
	}
	else{
		var db = cloudant.db.use(config.database.person.name);
		
		var selector = "";
		var type = JSON.parse(JSON.stringify(req.body.type));
		delete req.body.type;
		console.log("Searching Person by type",type);
		buildSelectorSearchPerson(type,req.body,function(err,response){
			if (err){
				console.log(err);
				config.searchError.error = err;
			    res.end(config.searchError);
			}
			else
			{	
				//Search with FirstName and LastName or FullName
				selector = response;
				console.log("Using selector "+JSON.stringify(selector)+ " to find into database");
				db.find(selector, function(err, result) {
					  if (err) {
					    console.log(err);
					    config.searchError.error = err;
					    res.end(config.searchError);
					  }
					  else{
						  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
						  if (result.docs.length>0)
						  {
						  	  for (var i = 0; i < result.docs.length; i++) {
						  		  console.log('  Doc userIDs: %s', result.docs[i].userID);
						  	  }
						  	  //console.log('Final response from searchPerson',JSON.stringify(result));
						  	  res.end(JSON.stringify(result));
						  }
						  else {
							  //If not success in FullName or First/Last Name it goes to First and MiddleName 
							  if (req.body.firstName !=="" && req.body.lastName !==""){
								  req.body.middleName = "";
								  buildSelectorSearchPerson(type,req.body,function(err,response){
									  selector = response;
										db.find(selector, function(err, result) {
											 if (result.docs.length>0)
											 {
												  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
											  	  for (var i = 0; i < result.docs.length; i++) {
											  		  console.log('  Doc userIDs: %s', result.docs[i].userID);
											  	  }
											  	  //console.log('Final response from searchPerson',JSON.stringify(result));
											  	  res.end(JSON.stringify(result));		
											 }
											 else{
											  	//If not success in FullName or First/Last Name it goes to First and MiddleName 
												req.body.middleName = "";
												req.body.lastName = "";
												buildSelectorSearchPerson(type,req.body,function(err,response){
												  selector = response;
													db.find(selector, function(err, result) {
														console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
													  	for (var i = 0; i < result.docs.length; i++) {
													  		  console.log('  Doc userIDs: %s', result.docs[i].userID);
													  	}
													  	if (result.docs.length>0){
													  		  	//console.log('Final response from searchPerson',JSON.stringify(result));
													  		  	res.end(JSON.stringify(result));
													  	}
													  	else{
															  var result = {};
															  result.message = "Not Found";								   
															  console.log("Not Found for query",req.body);
															  res.end(JSON.stringify(result));
														}
													});
	   											});  
											 }	  
										});
								  });
							  }
							  else{
								  var result = {};
								  result.message = "Not Found";								   
								  console.log("Not Found for query",req.body);
								  res.end(JSON.stringify(result));
							  }
						  }						  
					  }	  
				});	 
			}	
		});
	}
});

app.post('/services/ceai/searchPerson', 
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	
	var db = cloudant.db.use(config.database.person.name);
	
	var selector = "";
	var type = JSON.parse(JSON.stringify(req.body.type));
	delete req.body.type;
	console.log("Searching Person by type",type);
	buildSelectorSearchPerson(type,req.body,function(err,response){
		if (err){
			console.log(err);
			config.searchError.error = err;
		    res.end(config.searchError);
		}
		else
		{	
			//Search with FirstName and LastName or FullName
			selector = response;
			console.log("Using selector "+JSON.stringify(selector)+ " to find into database");
			db.find(selector, function(err, result) {
				  if (err) {
				    console.log(err);
				    config.searchError.error = err;
				    res.end(config.searchError);
				  }
				  else{
					  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
					  if (result.docs.length>0)
					  {
					  	  for (var i = 0; i < result.docs.length; i++) {
					  		  console.log('  Doc userIDs: %s', result.docs[i].userID);
					  	  }
					  	  //console.log('Final response from searchPerson',JSON.stringify(result));
					  	  res.end(JSON.stringify(result));
					  }
					  else {
						  //If not success in FullName or First/Last Name it goes to First and MiddleName 
						  if (req.body.firstName !=="" && req.body.lastName !==""){
							  req.body.middleName = "";
							  buildSelectorSearchPerson(type,req.body,function(err,response){
								  selector = response;
									db.find(selector, function(err, result) {
										 if (result.docs.length>0)
										 {
											  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
										  	  for (var i = 0; i < result.docs.length; i++) {
										  		  console.log('  Doc userIDs: %s', result.docs[i].userID);
										  	  }
										  	  //console.log('Final response from searchPerson',JSON.stringify(result));
										  	  res.end(JSON.stringify(result));		
										 }
										 else{
										  	//If not success in FullName or First/Last Name it goes to First and MiddleName 
											req.body.middleName = "";
											req.body.lastName = "";
											buildSelectorSearchPerson(type,req.body,function(err,response){
											  selector = response;
												db.find(selector, function(err, result) {
													console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
												  	for (var i = 0; i < result.docs.length; i++) {
												  		  console.log('  Doc userIDs: %s', result.docs[i].userID);
												  	}
												  	if (result.docs.length>0){
												  		  	//console.log('Final response from searchPerson',JSON.stringify(result));
												  		  	res.end(JSON.stringify(result));
												  	}
												  	else{
														  var result = {};
														  result.message = "Not Found";								   
														  console.log("Not Found for query",req.body);
														  res.end(JSON.stringify(result));
													}
												});
   											});  
										 }	  
									});
							  });
						  }
						  else{
							  var result = {};
							  result.message = "Not Found";								   
							  console.log("Not Found for query",req.body);
							  res.end(JSON.stringify(result));
						  }
					  }						  
				  }	  
			});	 
		}	
	});
});

function prepareUpdate(dbSource,request,callback){
	
	switch (request.type){
		case  "finance":
			if (typeof(request.association)!='undefined'){
				dbSource.association.push(request.association);
			}
			for (var i=0;i<request.finance.length;++i){
				dbSource.finance.push(request.finance[i]);
			}						
			break;
		case  "finance_insert":	
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.fincode = request.fincode;
			dbSource.cpf = request.cpf;
			dbSource.rg = request.rg;
			dbSource.rgExp = request.rgExp;
			dbSource.rgState = request.rgState;
			dbSource.birthDate = request.birthDate;
			dbSource.address = request.address;
			dbSource.number = request.number;
			dbSource.complement = request.complement;
			dbSource.neighborhood = request.neighborhood;
			dbSource.city = request.city;
			dbSource.state = request.state;
			dbSource.postCode = request.postCode;
			dbSource.parentCpf = request.parentCpf;
			dbSource.parentName = request.parentName;
			dbSource.phone1 = request.phone1;
			dbSource.whatsup1 = request.whatsup1;
			dbSource.phone2 = request.phone2;
			dbSource.whatsup2 = request.whatsup2;
			dbSource.email1 = request.email1;
			dbSource.email2 = request.email2;
			dbSource.habilities= request.habilities;
			dbSource.habilitesNotes= request.habilitesNotes;
			if (typeof(request.association)!='undefined'){
				dbSource.association= request.association;
			}
			dbSource.association= request.association;
			if (typeof(request.finance)!='undefined'){
				for (var i=0;i<request.finance.length;++i){
					dbSource.finance.push(request.finance[i]);
				}
			}
			break;
		case  "all":	
			dbSource.userID= request.userID;
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.cpf = request.cpf;
			dbSource.rg = request.rg;
			dbSource.rgExp = request.rgExp;
			dbSource.rgState = request.rgState;
			dbSource.birthDate = request.birthDate;
			dbSource.address = request.address;
			dbSource.number = request.number;
			dbSource.complement = request.complement;
			dbSource.neighborhood = request.neighborhood;
			dbSource.city = request.city;
			dbSource.state = request.state;
			dbSource.postCode = request.postCode;
			dbSource.parentCpf = request.parentCpf;
			dbSource.parentName = request.parentName;
			dbSource.phone1 = request.phone1;
			dbSource.whatsup1 = request.whatsup1;
			dbSource.phone2 = request.phone2;
			dbSource.whatsup2 = request.whatsup2;
			dbSource.email1 = request.email1;
			dbSource.email2 = request.email2;
			dbSource.habilities= request.habilities;
			dbSource.habilitesNotes= request.habilitesNotes;
			dbSource.association= request.association;
			dbSource.work = request.work;
			dbSource.study = request.study;
			break;
		case  "public":	
			dbSource.userID= request.userID;
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.cpf = request.cpf;
			dbSource.rg = request.rg;
			dbSource.rgExp = request.rgExp;
			dbSource.rgState = request.rgState;
			dbSource.birthDate = request.birthDate;
			dbSource.address = request.address;
			dbSource.number = request.number;
			dbSource.complement = request.complement;
			dbSource.neighborhood = request.neighborhood;
			dbSource.city = request.city;
			dbSource.state = request.state;
			dbSource.postCode = request.postCode;
			dbSource.parentCpf = request.parentCpf;
			dbSource.parentName = request.parentName;
			dbSource.phone1 = request.phone1;
			dbSource.whatsup1 = request.whatsup1;
			dbSource.phone2 = request.phone2;
			dbSource.whatsup2 = request.whatsup2;
			dbSource.email1 = request.email1;
			dbSource.email2 = request.email2;
			dbSource.habilities= request.habilities;
			dbSource.habilitesNotes= request.habilitesNotes;
			break;
		case  "general":
			dbSource.userID= request.userID;
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.cpf = request.cpf;
			dbSource.rg = request.rg;
			dbSource.rgExp = request.rgExp;
			dbSource.rgState = request.rgState;
			dbSource.birthDate = request.birthDate;
			dbSource.address = request.address;
			dbSource.number = request.number;
			dbSource.complement = request.complement;
			dbSource.neighborhood = request.neighborhood;
			dbSource.city = request.city;
			dbSource.state = request.state;
			dbSource.postCode = request.postCode;
			break;
		case "contact":
			dbSource.userID= request.userID;
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.phone1 = request.phone1;
			dbSource.whatsup1 = request.whatsup1;
			dbSource.phone2 = request.phone2;
			dbSource.whatsup2 = request.whatsup2;
			dbSource.email1 = request.email1;
			dbSource.email2 = request.email2;
			break;
		case "association":
			dbSource.userID= request.userID;
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.association = request.association;
			break;
		case "study":
			dbSource.userID= request.userID;
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.study = request.study;
			break;
		case "work":
			dbSource.userID= request.userID;
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.work = request.work;
			break;
	}
	
	return callback(dbSource);
}

app.post('/services/ceai/update', 
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'text/plain');

	var db = cloudant.db.use(config.database.person.name);
	var selector = config.selectors.forUpdates;
	selector.selector.userID = req.body.userID;
	db.find(selector, function(err, result) {
		  if (err) {
		    console.log(err);
		    config.config.searchError.error = err;
		    res.end(config.searchError);
		  }
		  else{
			    console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
			    console.log('Result %s', JSON.stringify(result));
			    if (result.docs.length>0)
			    {					  	
			    	prepareUpdate(result.docs[0],req.body,function(response){
			    		db.insert(response, function(err, body, header) {
							if (err) {
								console.log('[db.update] ', err.message);
								res.end('[db.update] ', err.message);
							}
							else{
								console.log('You have updated the record.');
								console.log(body);
								console.log('With Content :');
								console.log(JSON.stringify(req.body, null, 2));
								res.write('Requisicão Atualizada com Sucesso com o ID :'+req.body.userID +'\n');
								res.end('para o participante : '+ req.body.firstName+ " "+ req.body.middleName+" "+req.body.lastName);	
							}	
						});								    		
			    	});
			    }
			    else
			    {
			    	res.end('Erro na Atualização para o participante : '+ req.body.firstName+ " "+ req.body.middleName+" "+req.body.lastName);
			    }	
		  }
	});	 
});


app.post('/services/ceai/inputGeneral', 
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	cloudant.db.list(function(err, allDbs) {
		console.log('All my databases: %s', allDbs.join(', '));
	});
	console.log(JSON.stringify(req.body, null, 2));

	var db = cloudant.db.use(config.database.person.name);
	var id =  uuidv1();

	db.insert(req.body, id, function(err, body, header) {
		if (err) {
			return console.log('[db.insert] ', err.message);
		}

		console.log('You have inserted the record.');
		console.log(body);
		console.log('With Content :');
		console.log(JSON.stringify(req.body, null, 2));
	});
	res.write('Requisicão Salva com Sucesso com o ID :'+req.body.userID +'\n');
	res.end('para o participante : '+ req.body.firstName+ " "+ req.body.middleName+" "+req.body.lastName);	 
});

app.post('/services/ceai/registerPersonAPI',function(req, res){
	res.setHeader('Content-Type', 'text/plain');

	console.log("registerPersonAPI input: "+JSON.stringify(req.body, null, 2));
	
	if (req.get('apiKey') != APIKEY)
	{
		console.log("API Key passed",req.get('apiKey'));
		res.status(403);
		console.log('Headers',req.headers);
		res.end('{"message":"Not Authorized"}');
	}
	else{
		var input = {};
		input.username = req.body.email1;
		input.password = STANDARD_PASSWORD;
		input.role = "user";	
		input.displayName =  req.body.firstName+ ' '+ req.body.middleName+' '+ req.body.lastName;
		input.userID  = req.body.userID;
		users.createUser(input,function(err,result){
			   if (err){
				   res.write('Erro para criar um novo usuário',err);
			   }
			   else{
				   res.write('Usuário '+ input.username+' criado com sucesso com a senha padrão \n');
			   }
			   
			   var db = cloudant.db.use(config.database.person.name);		
				var id =  uuidv1();
				var participant = JSON.parse(JSON.stringify(config.participant));
				participant.userID = getCustomerID();
				prepareUpdate(participant,req.body,function(response){
		    		db.insert(response,id,function(err, body, header) {
						if (err) {
							res.end('[db.insert from public Register Error] ', err.message);
						}
						else{
							console.log('You have inserted the record.');
							console.log(body);
							console.log('With Content :');
							console.log(JSON.stringify(req.body, null, 2));
							
							res.write('Dados Cadastrados com Sucesso Para o Usuário com o ID :'+response.userID +'\n');
							res.write('Código Financeiro :'+response.fincode +'\n');
							res.end('Participante : '+ response.firstName+ " "+ response.middleName+" "+response.lastName);
						}
					});
				});		
		});
	}
});


app.post('/services/ceai/register', 
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'text/plain');

	console.log('Data to be register an user',JSON.stringify(req.body, null, 2));
	
	users.findByUserName(req.body.email1, function(err,result){
		console.log("findByUserName result",JSON.stringify(result));
		//if user was not found create a new user into the system with initial password
		var input = {};
		if (result.docs.length > 0){
		   input = result.docs[0];
		}
		else{			
			input.password = STANDARD_PASSWORD;
		}
		input.username = req.body.email1;
		var role = [];
		var roleItem = {};		
		if (req.body.work.length==0){
		   roleItem = {};
		   roleItem.department = 'Any';
		   roleItem.section = 'Any';
		   roleItem['function'] = 'User';
		   role.push(roleItem);
		}
		else{
			   for (var i=0;i<req.body.work.length;++i){
				  if (req.body.work[i]['function'] === 'Diretor' || req.body.work[i]['function'] === 'Coordenador'){
					  roleItem = {};
					  roleItem.department = req.body.work[i].department;
					  roleItem.section = req.body.work[i].section;
					  roleItem['function'] = req.body.work[i]['function'];

					  if (typeof(req.body.work[i].weekDay)!='undefined'){
						  roleItem.weekDay = req.body.work[i].weekDay;
					  }
					  if (typeof(req.body.work[i].period)!='undefined'){
						  roleItem.period = req.body.work[i].period;
					  }
					  
					  role.push(roleItem);
				  }							  
			   }
			   if (role.length==0){
					  roleItem = {};
					  roleItem.department = 'Any';
				      roleItem.section = 'Any';
					  roleItem['function'] = 'Worker';
					  role.push(roleItem);
			   }
		}			   
		input.role = role;
		input.displayName =  req.body.firstName+ ' '+ req.body.middleName+' '+ req.body.lastName;
		if (result.docs.length == 0){
			input.userID  = req.body.userID;
			input.createdOn = new Date();
			users.createUser(input,function(err,result){
			   if (err){
				   console.log('Error to create new user',err);
			   }
			   else{
				   console.log('User '+ input.username+' created with success with standard password');
			   }
		   });			
		}
		else{
			  input.userID  = req.body.userID;
			  input.createdOn = new Date();
			  users.updateUser(input,function(err,result){
				   if (err){
					   console.log('Error to update user',err);
				   }
				   else{
					   console.log('User '+ input.username+' updated with success with standard password');
				   }
			   });	
		}

		if (input.userID == session.user.userID){
			console.log('Session updated with new user profile data',JSON.stringify(input));
			session.user = input;
		}
		
		var db = cloudant.db.use(config.database.person.name);
		
		if (req.body.operation == "insert"){
			var id =  uuidv1();
			delete req.body._id;
			delete req.body._rev;
			db.insert(req.body, id, function(err, body, header) {
				if (err) {
					return console.log('[db.insert from public Register Error] ', err.message);
				}
		
				console.log('You have inserted the record.');
				console.log(body);
				console.log('With Content :');
				console.log(JSON.stringify(req.body, null, 2));
				
				res.end('Dados Cadastrados com Sucesso com o participante :'+req.body.firstName+' '+req.body.middleName+' '+ req.body.lastName+'\n');
			});
		}
		else{

			var db = cloudant.db.use(config.database.person.name);
			var selector = config.selectors.forUpdates;
			selector.selector.userID = req.body.userID;
			db.find(selector, function(err, result) {
				  if (err) {
				    console.log(err);
				    config.config.searchError.error = err;
				    res.end(config.searchError);
				  }
				  else{
					    console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
					    console.log('Result %s', JSON.stringify(result));
					    if (result.docs.length>0)
					    {					  	
					    	prepareUpdate(result.docs[0],req.body,function(response){
					    		db.insert(response, function(err, body, header) {
									if (err) {
										console.log('[db.update] ', err.message);
										res.end('[db.update] ', err.message);
									}
									else{
										console.log('You have updated the record.');
										console.log(body);
										console.log('With Content :');
										console.log(JSON.stringify(req.body, null, 2));
										res.end('Dados Cadastrados com Sucesso para o participante: '+req.body.firstName+' '+req.body.middleName+' '+ req.body.lastName+'\n');								}	
								});								    		
					    	});
					    }
					    else
					    {
					    	res.end('Erro na Atualização para o participante : '+ req.body.firstName+ " "+ req.body.middleName+" "+req.body.lastName);
					    }	
				  }
			});	 
		}
	});
});

app.get('/services/ceai/showVolunteerForm',require('connect-ensure-login').ensureLoggedIn(),function(req,res){
	 res.setHeader('Content-Type', 'application/json');
	 const fs = require('fs');
	 
	 var fincode = req.query.fincode;
	 
	 var bdm = require('./BinaryDataManager');
	 
	 bdm.getAttachmentContent(fincode,"fichaVoluntario",function(stream,error){
	 //bdm.getAttachmentContent(fincode,"fichaVoluntario",function(filename,error){
		 if (error){
			 console.log('Error in showVolunteerForm form Function : '+err);
			 res.status(500); 
			 res.end(JSON.stringify(err));
		 }
		 else{
			 console.log("Sending File "+ fincode+'.pdf'+ " to the Client");
			 
			 /* WORKED */
			 res.setHeader('Content-Type', 'application/pdf');			 
			 res.setHeader('Content-Disposition', 'attachment; filename='+ fincode+'.pdf');			 
			 //res.send(stream)
			 stream.pipe(res);
					 
			 /*
			 var data =fs.readFileSync(filename);
			 var stat = fs.statSync(filename);
			 console.log('Reading File with size:'+stat.size);
			 res.contentType("application/pdf");
			 res.send(data);
			 */
			 
			 /*
			 
			 var file = fs.createReadStream(filename);
			 var stat = fs.statSync(filename);
			 
			 console.log("File size: "+stat.size);
			 res.setHeader('Content-Length', stat.size);
			 res.setHeader('Content-Type', 'application/pdf');			 
			 res.setHeader('Content-Disposition', 'attachment; filename='+filename);			 
			 file.pipe(res);
			 
			 */
			 
			 /* 
			 res.set('Content-Type','application/pdf');
			 res.attachment("Volunteer-"+ fincode +".pdf");
			 fs.readFile(filename, (err, dados) => {
				    if (err) 
				    	throw err
				    console.log('Data with attachment sent with success!');
				    res.send(dados);
			 });
			 */
		 }
	 });
});

app.get('/',
		function(req, res){
		if (typeof(session.user) == 'undefined'){
			res.redirect('/login');
		}else{
			for (var i=0;i<session.user.role.length;++i){
				if (session.user.role[i]['function'] === 'User'){
					res.redirect('/publico');
				}
			}
			try{
				res.redirect('/cadastro');
			}
			catch(e){				
				res.sendFile(__dirname + "/public/register.html");
			}
		}
});

app.get('/home',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/home.html");
});

app.get('/login',
		function(req, res){
	res.render('login');
});

app.post('/login',
		passport.authenticate('custom', { successRedirect: '/', failureRedirect: '/login' }),
		function(req, res) {
	res.redirect('/');
});

app.get('/logout',
		function(req, res){
	req.logout();
	res.redirect('/');
});

app.get('/General',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/general.html");
});

app.get('/Contact',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/contact.html");
});

app.get('/Work',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/work.html");
});

app.get('/Book',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/book.html");
});

app.get('/Admin',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/admin.html");
});

app.get('/Study',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/study.html");
});

app.get('/Association',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/association.html");
});

app.get('/cadastro',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	
	console.log("Access Rule: "+session.user.role);
	for (var i=0;i<session.user.role.length;++i){
		if (session.user.role[i]['function']=='User'){
			console.log("O usuario: "+session.username +" nao tem acesso a esta funcionalidade");
			res.sendFile(__dirname + "/public/noaccess.html");
		}		
	}
	res.sendFile(__dirname + "/public/register.html");	
});

app.get('/publico',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/public.html");
});

app.listen(port,function(){
	console.log('CEAI Cadastro de Participantes Server running on port:',port);
});

