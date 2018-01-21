console.log("Iniciando CEAI Biblioteca Server...");
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
var Sync = require('sync');
var port = (process.env.PORT || process.env.VCAP_APP_PORT || 3000);
const NOT_FOUND = '{"docs":[]}';

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

var buildSelectorSearchPerson = function(data,callback){
	if (data.lastName!=="" && data.firstName!=="" && data.middleName!=="")
	{
		config.fullName_selector.selector.firstName.$regex = case_ins+data.firstName;
		config.fullName_selector.selector.middleName.$regex  = case_ins+data.middleName;
		config.fullName_selector.selector.lastName.$regex  = case_ins+data.lastName;
		
		return callback(false,config.fullName_selector);
	}	
	else{
		if (data.lastName!=="" && data.firstName!=="")
		{
			config.firstAndlastName_selector.selector.firstName.$regex  = case_ins+data.firstName;
			config.firstAndlastName_selector.selector.lastName.$regex  = case_ins+data.lastName;
			
			return callback(false,config.firstAndlastName_selector);
		}
		else
		{
			if (data.middleName!=="" && data.firstName!=="")
			{
				config.firstAndlastName_selector.selector.firstName.$regex  = case_ins+data.firstName;
				config.fullName_selector.selector.middleName.$regex  = case_ins+data.middleName;
				
				return callback(false,config.firstAndMiddleName_selector);
			}
			else
			{	
				if (data.firstName!=="")
				{				
					config.firstName_selector.selector.firstName.$regex  = case_ins+data.firstName;
					
					return callback(false,config.firstName_selector);
				}
			}	
		}			
	}
	return callback("No Selector Found",null);
};

var buildSelector = function(data,callback){
	if (data.type === "isbn"){
		config.selectors.isbn.selector.isbn = data.entry;
		return callback(false,config.selectors.isbn);
	}
	if (data.type === "category"){
		config.selectors.category.selector.category = data.entry;
		return callback(false,config.selectors.category);
	}
	
	var selector = null;
	var query = null;
	
	if (data.type === "espAuthor"){
		//cloning an object
		selector = JSON.parse(JSON.stringify(config.selectors.espAuthor));
		console.log(selector);
		query = selector.selector.$or[0].espAuthor.$regex;
		selector.selector.$or[0].espAuthor.$regex= query.replace('<ENTRY>',data.entry);
		query = selector.selector.$or[1].espAuthor.$regex;
		selector.selector.$or[1].espAuthor.$regex= query.replace('<ENTRY>',data.entry);
		return callback(false,selector);
	}
	
	if (data.type === "author"){
		//cloning an object
		selector = JSON.parse(JSON.stringify(config.selectors.author));
		console.log(selector);
		query = selector.selector.$or[0].author.$regex;
		selector.selector.$or[0].author.$regex= query.replace('<ENTRY>',data.entry);
		query = selector.selector.$or[1].author.$regex;
		selector.selector.$or[1].author.$regex= query.replace('<ENTRY>',data.entry);
		return callback(false,selector);
	}
	
	if (data.type === "bookName"){
		//cloning an object
		selector = JSON.parse(JSON.stringify(config.selectors.bookName));
		console.log(selector);
		query = selector.selector.$or[0].bookName.$regex;
		selector.selector.$or[0].bookName.$regex= query.replace('<ENTRY>',data.entry);
		query = selector.selector.$or[1].bookName.$regex;
		selector.selector.$or[1].bookName.$regex= query.replace('<ENTRY>',data.entry);
		return callback(false,selector);
	}
	
	return callback("No Selector Found",null);
};

app.get('/services/ceai/resetSession',function(req,res){
	res.setHeader('Content-Type', 'text/plain');
	req.session.bookID = "";
	res.end('OK');
});

app.post('/services/ceai/saveSearchSession', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	req.session.bookID = req.body.bookID;
	console.log("Session ID Saved "+req.session.bookID);
	res.end('OK');	
});

var searchUsersByBook = function(sel, callback){
	var db2 = cloudant.db.use(config.database.person.name);
	
	console.log("Searching by UserID : "+sel.selector.userID+" and BookID: "+sel.selector.book.$elemMatch.bookID);
	
	db2.find(sel,function(err,result){
		  if (err) {
			    console.log(err);
		  }else{
			  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(sel));
			  return callback(null,result);									 
		 }
	 });		
};

app.post('/services/ceai/loadSessionData', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	//TODO with searchKey , example '{"searchKey" : "general"}' define what selector to search and execute the db.find
	var sel = config.selectors[req.body.searchKey];
	console.log("Loading data from bookID : "+req.session.bookID);
	if (typeof req.session.bookID !== 'undefined'){
			
		sel.selector.bookID = req.session.bookID;
		
		var db = null;
				
		if (req.body.searchKey === "stockBook" || req.body.searchKey === "loan"){
			db = cloudant.db.use(config.database.book.name); 			
			
			if (db !== null){
				db.find(sel, function(err, result) {
					  if (err) {
					    console.log(err);
					    res.end(err);
					  }
					  else{
						  Sync(function(){
							  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(sel));
							  if (result.docs.length>0)
							  {	  
							  	  if (result.docs[0].userIDs.length>0)
								  {
							  		  selectors = [];						  		  
							  		  result.docs[0].userIDs.forEach(function(listItem, index){	
							  			  selectors[index] = config.selectors.userID;
							  			  selectors[index].selector.book.$elemMatch.bookID = req.session.bookID;
							  			  selectors[index].selector.userID = listItem.userID;						  			
										  var results2 = searchUsersByBook.sync(null,selectors[index]);
										  if (results2.docs.length>0){		
											  for(var i=0;i<results2.docs[0].book.length;++i){
												  // If is a loan opened put the relationship with user
												  if (results2.docs[0].book[i].returnDate === '')
												  {
													  result.docs[0].userIDs[index].firstName = results2.docs[0].firstName;
												      result.docs[0].userIDs[index].middleName = results2.docs[0].middleName;
												      result.docs[0].userIDs[index].lastName = results2.docs[0].lastName;
												      result.docs[0].userIDs[index].loanID = results2.docs[0].book[i].loanID;
												      result.docs[0].userIDs[index].returnDate = results2.docs[0].book[i].returnDate;
												      result.docs[0].userIDs[index].loanDate = results2.docs[0].book[i].loanDate;
												      result.docs[0].userIDs[index].limitDate = results2.docs[0].book[i].limitDate;	
												      result.docs[0].userIDs[index].notes = results2.docs[0].book[i].notes;
												      result.docs[0].userIDs[index].renovationNr = results2.docs[0].book[i].renovationNr;
												  }
											  }
										  }											  
							  		  });						  		  
								  }							  	  
							  }
							  console.log("Function return: "+JSON.stringify(result));
							  res.end(JSON.stringify(result));					  
						  });
					  }	  
				});	 
			}
			else{
				 res.end("Nenhum banco de dados encontrado para a operação, contacte o administrador");
			}	
		}
	}
	else{
		var result = NOT_FOUND;
		res.end(JSON.stringify(result));
	}
});

app.post('/services/ceai/searchBook', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	
	var db = cloudant.db.use(config.database.book.name);
	
	var selector = "";
	buildSelector(req.body,function(err,response){
		if (err){
			console.log(err);
			config.searchError.error = err;
		    res.end(config.searchError);
		}
		else
		{	
			selector = response;
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
					  		  console.log('  Doc bookIDs: %s', result.docs[i].bookID);
					  	  }
					  	  console.log('Function return :'+JSON.stringify(result));
					  	  res.end(JSON.stringify(result));
					  }
					  else {
						  res.end(NOT_FOUND);
					  }						  
				  }	  
			});	 
		}	
	});
});

function prepareUpdate(dbSource,request,callback){
	
	switch (request.type){
		case  "book":
			dbSource.bookID= request.bookID;
			dbSource.isbn = request.isbn;
			dbSource.author = request.author;
			dbSource.espAuthor = request.espAuthor;
			dbSource.category = request.category;
			dbSource.bookName = request.bookName;
			if (typeof(request.loan) !== 'undefined'){
				dbSource.loan = request.loan;
			}	
			dbSource.amount = request.amount;
			dbSource.available = request.available;
			break;
		case "user":
			dbSource.bookID= request.bookID;
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
	}
	
	return callback(dbSource);
}

app.post('/services/ceai/updateBook', function(req, res){
	res.setHeader('Content-Type', 'text/plain');

	var db = cloudant.db.use(config.database.book.name);
	var selector = config.selectors.bookID;
	selector.selector.bookID = req.body.bookID;
	console.log("Update Selector : "+JSON.stringify(selector));
	db.find(selector, function(err, result) {
		  if (err) {
		    console.log(err);
		    config.searchError.error = err;
		    res.end(config.searchError);
		  }
		  else{
			    console.log('Update document : Found %d documents with %s', result.docs.length,JSON.stringify(selector));
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
								res.write('Requisicão Atualizada com Sucesso com o ID :'+req.body.bookID +'\n');
								res.end('para o Livro ID : '+ req.body.bookID+ " ISBN: "+ req.body.isbn+" Nome do Livro: "+req.body.bookName);	
							}	
						});								    		
			    	});
			    }
			    else
			    {
			    	res.end('Erro na Atualização do Livro : '+ req.body.bookID+ " ISBN: "+ req.body.isbn+" Nome do Livro: "+req.body.bookName);
			    }	
		  }
	});	 
});

app.post('/services/ceai/deleteBook', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	console.log(JSON.stringify(req.body, null, 2));

	var db = cloudant.db.use(config.database.book.name);
	
	var sel = config.selectors.bookID;
	sel.selector.bookID = req.body.bookID;
	
	db.find(sel, function(err, result) {
		 	if (err) {
			    console.log(err);
			    config.searchError.error = err;
			    res.end(config.searchError);
			 }
			 else{
				    console.log('Found %d documents with %s', result.docs.length,JSON.stringify(sel));
				    console.log('Result %s', JSON.stringify(result));
				    if (result.docs.length>0){
				    	console.log('Removing document with ID: '+result.docs[0]._id+' Rev: '+result.docs[0]._rev);
				    	 db.destroy(result.docs[0]._id, result.docs[0]._rev, function(err) {
								if (err) {
									return console.log('[db.destroy] ', err.message);
								}
								else{
									console.log('You have delete the record.');
									console.log('With Content :');
									console.log(JSON.stringify(req.body, null, 2));
								}
					  });
				      res.write('Requisicão Excluída com Sucesso com o ID :'+req.body.bookID +'<br>');
					  res.write(' para o Livro ISBN: '+ req.body.isbn);	 
					  res.end(' Nome: '+ req.body.bookName);				    	
				    }
				    else{
				    	res.write('Exclusão não realizada !');
				    	res.end(' Motivo: Livro com com o ID '+ req.body.bookID+' Não existe na base de dados, contate o Administrador');
				    }
		    }
	});	
});

app.post('/services/ceai/searchPerson', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	
	var db = cloudant.db.use(config.database.person.name);
	
	var selector = "";
	buildSelectorSearchPerson(req.body,function(err,response){
		if (err){
			console.log(err);
			config.searchError.error = err;
		    res.end(config.searchError);
		}
		else
		{	
			//Search with FirstName and LastName or FullName
			selector = response;
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
					  	  console.log(JSON.stringify(result));
					  	  res.end(JSON.stringify(result));
					  }
					  else {
						 //If not success in FullName or First/Last Name it goes to First and MiddleName 
						  if (req.body.firstName !=="" && req.body.middleName === "" && req.body.lastName !==""){
							  req.body.middleName = req.body.lastName;
							  req.body.lastName = "";
							  buildSelectorSearchPerson(req.body,function(err,response){
								  selector = response;
									db.find(selector, function(err, result) {
										console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
										  	  for (var i = 0; i < result.docs.length; i++) {
										  		  console.log('  Doc userIDs: %s', result.docs[i].userID);
										  	  }
										  	  console.log(JSON.stringify(result));
										  	  res.end(JSON.stringify(result));										
									});
							  });
						  }
					  }						  
				  }	  
			});	 
		}	
	});
});

app.post('/services/ceai/inputBook', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	console.log(JSON.stringify(req.body, null, 2));

	var db = cloudant.db.use(config.database.book.name);
	var id =  uuidv1();
	var sel = config.selectors.isbn;
	sel.selector.isbn = req.body.isbn;
	
	db.find(sel, function(err, result) {
		  if (err) {
		    console.log(err);
		    res.end(err);
		  }
		  else{
			  if (result.docs.length===0){
				  db.insert(req.body, id, function(err, body, header) {
						if (err) {
							return console.log('[db.insert] ', err.message);
						}

						console.log('You have inserted the record.');
						console.log(body);
						console.log('With Content :');
						console.log(JSON.stringify(req.body, null, 2));
					});
					res.write('Requisicão Salva com Sucesso com o ID :'+req.body.bookID +'<br>');
					res.write(' para o Livro ISBN: '+ req.body.isbn);	 
					res.end(' Nome: '+ req.body.bookName);	 
			  }
			  else{
				  res.write('Inclusão não realizada !');
				  res.end(' Motivo: Livro com com o ISBN '+ req.body.isbn+' Já existe na base de dados, por gentileza pesquisar primeiro na página principal');	
			  }
		  }
	});	
});

app.post('/services/ceai/loan', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	
	var db = cloudant.db.use(config.database.person.name);
	
	var sel = config.selectors.newLoan;
	sel.selector.userID = req.body.userID;
	
	db.find(sel, function(err, result) {
		  if (err) {
		    console.log(err);
		    res.end(err);
		  }
		  else{
			  if (result.docs.length>0){	
				  var bookElement = {};
				  bookElement.loanID = req.body.loanID;
				  bookElement.bookID = req.body.bookID;
				  bookElement.loanDate = req.body.loanDate;
				  bookElement.returnDate = req.body.returnDate;
				  bookElement.limitDate = req.body.limitDate;
				  bookElement.renovationNr = req.body.renovationNr;
				  bookElement.notes = req.body.notes;
				  result.docs[0].book.push(bookElement);
				  db.insert(result.docs[0],result.docs[0]._id, function(err, body, header) {
					if (err) {
						return console.log('[db.update] ', err.message);
					}
	
					console.log('You have updated the record.');
					console.log(body);
					console.log('With Content :');
					console.log(JSON.stringify(req.body, null, 2));
					
					var db2 = cloudant.db.use(config.database.book.name);
					sel = config.selectors.bookID;
					sel.selector.bookID = req.body.bookID;
					
					db2.find(sel, function(err, result2){
						if (err) {
							return console.log('[db2.search] ', err.message);
						}
						result2.docs[0].loan = ""+(parseInt(result2.docs[0].loan) + 1);
						result2.docs[0].available = ""+(parseInt(result2.docs[0].available) - 1);
						var userID = {};
						userID.userID = req.body.userID;
						result2.docs[0].userIDs.push(userID);
						db2.insert(result2.docs[0],result2.docs[0]._id, function(err, body, header) {
							if (err) {
								return console.log('[db2.update] ', err.message);
							}
						
							res.write('Empréstimo efetuado com Sucesso com o ID :'+req.body.loanID);
							res.write(' do Livro : '+ req.body.bookName);	 
							res.end(' para o participante : '+ req.body.fullName);
						});
					});	
				  });
			  }
		  }
	});	
});

app.post('/services/ceai/renewLoan', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	
	var db = cloudant.db.use(config.database.person.name);
	
	var sel = config.selectors.loanID;
	sel.selector.book.$elemMatch.loanID = req.body.loanID;
	sel.selector.userID = req.body.userID;
	
	db.find(sel, function(err, result) {
		  if (err) {
		    console.log(err);
		    res.end(err);
		  }
		  else{
			  if (result.docs.length>0){	
			  	  result.docs[0].book[0].limitDate = req.body.limitDate;
			  	  result.docs[0].book[0].notes = req.body.notes;
			  	  result.docs[0].book[0].renovationNr = req.body.renovationNr;
				  db.insert(result.docs[0],result.docs[0]._id, function(err, body, header) {
					if (err) {
						return console.log('[db.update] ', err.message);
					}
	
					console.log('You have updated the record.');
					console.log(body);
					console.log('With Content :');
					console.log(JSON.stringify(req.body, null, 2));
					
					res.write('Renovação efetuada com Sucesso com o ID :'+req.body.loanID);
					res.write(' do Livro : '+ req.body.bookName);	 
					res.end(' para o participante : '+ req.body.fullName);
				  });
			  }
		  }
	});	
});

app.post('/services/ceai/return', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	
	var db = cloudant.db.use(config.database.person.name);
	
	var sel = config.selectors.loanID;
	sel.selector.book.$elemMatch.loanID = req.body.loanID;
	sel.selector.userID = req.body.userID;
	
	console.log("Searching by selector "+JSON.stringify(sel));
	
	db.find(sel, function(err, result) {
		  if (err) {
		    console.log(err);
		    res.end(err);
		  }
		  else{
			  if (result.docs.length>0){
				  for(var i=0;i<result.docs[0].book.length;++i){
					  if(result.docs[0].book[i].returnDate===''){
						  result.docs[0].book[i].loanDate = req.body.loanDate;
					  	  result.docs[0].book[i].returnDate = req.body.returnDate;
					  	  result.docs[0].book[i].limitDate = req.body.limitDate;
					  	  result.docs[0].book[i].notes = req.body.notes;
					  }
				  }
				  db.insert(result.docs[0],result.docs[0]._id, function(err, body, header) {
						if (err) {
							return console.log('[db.update] ', err.message);
						}

						console.log('You have updated the record.');
						console.log(body);
						console.log('With Content :');
						console.log(JSON.stringify(req.body, null, 2));						
						
					});
				    var db2 = cloudant.db.use(config.database.book.name);
				    sel = config.selectors.loan;
				    sel.selector.bookID = req.body.bookID;
				    db2.find(sel, function(err, result) {
						  if (err) {
						    console.log(err);
						    res.end(err);
						  }
						  else{
							  if (result.docs.length>0){
								  var userIDs = result.docs[0].userIDs;
								  for(var i=0;i<userIDs.length;++i) {
									   if (userIDs[i].userID ===  req.body.userID){
										   userIDs.splice(i, 1);
									   }		   
								  }
								  result.docs[0].userIDs = userIDs;
								  result.docs[0].loan = req.body.loan;
								  result.docs[0].available = req.body.available;
								  db2.insert(result.docs[0],result.docs[0]._id, function(err, body, header) {
										if (err) {
											return console.log('[db.update] ', err.message);
										}
										else{
											res.write('Emprestimo Delvolvido com Sucesso com o ID :'+req.body.loanID);
											res.write(' do Livro : '+ req.body.bookName);	 
											res.end(' para o participante : '+ req.body.fullName);
										}
								  });
							  }
						  }
				    });							 
			  }
			  else{
				  console.log('Alteração não realizada !');
				  res.write('Alteração não realizada !');
				  res.end(' Motivo: Usuário '+req.body.fullName+' e livro '+req.body.bookName+' não foram encontrados empréstimos');	
			  }
		  }
	});	
});

app.get('/',
		function(req, res){
	res.redirect('/home');
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

app.get('/home',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/home.html");
});

app.get('/Loan',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/loan.html");
});

app.get('/StockBook',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	console.log("Access Rule"+session.role);
	if (session.role === 'admin'){
		res.sendFile(__dirname + "/public/stockBook.html");
	}
	else{
		res.status(403);
		res.end("O usuario nao tem acesso a esta funcionalidade");
	}
});

app.get('/Admin',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	res.sendFile(__dirname + "/public/admin.html");
});

app.listen(port,function(){
	console.log('CEAI Biblioteca Server running on port:'+port);
});

