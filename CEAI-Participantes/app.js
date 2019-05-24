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
var Strategy = require('passport-local').Strategy;
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

passport.use(new Strategy(
		function(username, password, cb) {
			auth.users.findByUsername(username, function(err, user) {
				if (err) { return cb(err); }
				if (!user) { return cb(null, false); }
				if (user.password !== password) { return cb(null, false); }
				session.role = user.role;
				return cb(null, user);
			});
		}));

passport.serializeUser(function(user, cb) {
	cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	auth.users.findById(id, function (err, user) {
		if (err) { return cb(err); }
		cb(null, user);
	});
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
	return callback("No Selector Found",null);
};

app.get('/services/ceai/checkUserAccess',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	console.log("Access Rule : "+session.role);
	res.end(session.role);	
});

app.get('/services/ceai/resetSession',function(req,res){
	res.setHeader('Content-Type', 'text/plain');
	req.session.userID = "";
	res.end('OK');
});

app.post('/services/ceai/saveSearchSession', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	req.session.userID = req.body.userID;
	console.log("Session ID Saved "+req.session.userID);
	res.end('OK');	
});

app.post('/services/ceai/loadSessionData', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	//TODO with searchKey , example '{"searchKey" : "general"}' define what selector to search and execute the db.find
	
	
	
	if (typeof req.session.userID !== 'undefined')
	{
		var sel = config.userID.selectors[req.body.searchKey];
		sel.selector.userID = req.session.userID;
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

app.post('/services/ceai/searchCPF', function(req, res){
	res.setHeader('Content-Type', 'application/json');
	
	var db = cloudant.db.use(config.database.person.name);
	
	var sel = config.userID.selectors.cpf;
	
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


app.post('/services/ceai/searchPerson', function(req, res){
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
					  	  console.log('Final response from searchPerson',JSON.stringify(result));
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
										  	  console.log('Final response from searchPerson',JSON.stringify(result));
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
												  		  	console.log('Final response from searchPerson',JSON.stringify(result));
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

app.post('/services/ceai/update', function(req, res){
	res.setHeader('Content-Type', 'text/plain');

	var db = cloudant.db.use(config.database.person.name);
	var selector = config.userID.selectors.forUpdates;
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


app.post('/services/ceai/inputGeneral', function(req, res){
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

app.post('/services/ceai/register', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	cloudant.db.list(function(err, allDbs) {
		console.log('All my databases: %s', allDbs.join(', '));
	});
	console.log(JSON.stringify(req.body, null, 2));
	var db = cloudant.db.use(config.database.person.name);
	
	if (req.body.type == "insert"){
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
		});
	}
	else{
		db.insert(req.body, function(err, body, header) {
			
			if (err) {
				return console.log('[db.update from public Register Error] ', err.message);
			}
	
			console.log('You have updated the record.');
			console.log(body);
			console.log('With Content :');
			console.log(JSON.stringify(req.body, null, 2));
		});
	}
	res.end('Dados Cadastrados com Sucesso com o participante :'+req.body.firstName+' '+req.body.middleName+' '+ req.body.lastName+'\n');
});

app.get('/',
		function(req, res){
	res.redirect('/home');
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
		passport.authenticate('local', { failureRedirect: '/login' }),
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
		function(req, res){
	res.sendFile(__dirname + "/public/register.html");
});

app.listen(port,function(){
	console.log('CEAI Cadastro de Participantes Server running on port:'+port);
});

