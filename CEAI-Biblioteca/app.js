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
var Promise = require('promise');
var port = (process.env.PORT || process.env.VCAP_APP_PORT || 3000);
const NOT_FOUND = '{"docs":[]}';
const REPLACEMENT_KEY = '<ENTRY>';

passport.use(new Strategy(
		function(username, password, cb) {
			auth.users.findByUsername(username, function(err, user) {
				if (err) { return cb(err); }
				if (!user) { return cb(null, false); }
				if (user.password !== password) { return cb(null, false); }
				session.username = user.username;
				session.role = user.role;
				return cb(null, user);
			});
		}));

passport.serializeUser(function(user, cb) {
	console.log("Serializing User With Value:",user.id);
	cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	auth.users.findById(id, function (err, user) {
		if (err) { return cb(err); }
		console.log("Deserializing User With Value:",id);
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
		var sel = JSON.parse(JSON.stringify(config.fullName_selector));
		sel.selector.firstName.$regex = case_ins+data.firstName;
		sel.selector.middleName.$regex  = case_ins+data.middleName;
		sel.selector.lastName.$regex  = case_ins+data.lastName;
		
		return callback(false,sel);
	}	
	else{
		if (data.lastName!=="" && data.firstName!=="")
		{
			var sel = JSON.parse(JSON.stringify(config.firstAndlastName_selector));
			sel.selector.firstName.$regex  = case_ins+data.firstName;
			sel.selector.lastName.$regex  = case_ins+data.lastName;
			
			return callback(false,sel);
		}
		else
		{
			if (data.middleName!=="" && data.firstName!=="")
			{
				var sel = JSON.parse(JSON.stringify(config.firstAndMiddleName_selector));
				sel.selector.firstName.$regex  = case_ins+data.firstName;
				sel.selector.middleName.$regex  = case_ins+data.middleName;
				
				return callback(false,sel);
			}
			else
			{	
				if (data.firstName!=="")
				{	
					var sel = JSON.parse(JSON.stringify(config.firstName_selector));
					sel.selector.firstName.$regex  = case_ins+data.firstName;
					
					return callback(false,sel);
				}
			}	
		}			
	}
	return callback("No Selector Found",null);
};

function formatSearchEntry(entry){
	
	entry = entry.replace(/Á/g,".*");
	entry = entry.replace(/á/g,".*");
	entry = entry.replace(/é/g,".*");
	entry = entry.replace(/É/g,".*");
	entry = entry.replace(/í/g,".*");
	entry = entry.replace(/Í/g,".*");
	entry = entry.replace("/ó/g",".*");
	entry = entry.replace("/Ó/g",".*");
	entry = entry.replace("/ú/g",".*");
	entry = entry.replace("/Ú/g",".*");
	
	return entry;
}

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
		selector.selector.$or[0].espAuthor.$regex= query.replace(REPLACEMENT_KEY,formatSearchEntry(data.entry));
		query = selector.selector.$or[1].espAuthor.$regex;
		selector.selector.$or[1].espAuthor.$regex= query.replace(REPLACEMENT_KEY,formatSearchEntry(data.entry));
		return callback(false,selector);
	}
	
	if (data.type === "author"){
		//cloning an object
		selector = JSON.parse(JSON.stringify(config.selectors.author));
		console.log(selector);
		query = selector.selector.$or[0].author.$regex;
		selector.selector.$or[0].author.$regex= query.replace(REPLACEMENT_KEY,formatSearchEntry(data.entry));
		query = selector.selector.$or[1].author.$regex;
		selector.selector.$or[1].author.$regex= query.replace(REPLACEMENT_KEY,formatSearchEntry(data.entry));
		return callback(false,selector);
	}
	
	if (data.type === "bookName"){
		//cloning an object
		selector = JSON.parse(JSON.stringify(config.selectors.bookName));
		console.log(selector);
		query = selector.selector.$or[0].bookName.$regex;
		selector.selector.$or[0].bookName.$regex= query.replace(REPLACEMENT_KEY,formatSearchEntry(data.entry));
		query = selector.selector.$or[1].bookName.$regex;
		selector.selector.$or[1].bookName.$regex= query.replace(REPLACEMENT_KEY,formatSearchEntry(data.entry));
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

var searchUsersByBook = function(sel){
	return new Promise(function (resolve, reject) {
		var db2 = cloudant.db.use(config.database.person.name);
		
		console.log("Searching by UserID : "+sel.selector.userID+" and BookID: "+sel.selector.book.$elemMatch.bookID);
		console.log("Using Selector",sel);
		
		db2.find(sel,function(err,result){
			  if (err) {
				    console.log('Error in searchUsersByBook',err);
				    reject(err);
			  }else{
				  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(sel));
				  resolve(result);									 
			 }
		 });	
	});
};
var populateBookWithLoan = function(result,req,callback){
		var selectors = [];
		var usersOk = [];
		var index=0;
		var promises = [];
		while (index< result.docs[0].userIDs.length){
			console.log("Validating if user was already searched: "+result.docs[0].userIDs[index].userID);
			if (usersOk.indexOf(result.docs[0].userIDs[index].userID)===-1){
				  usersOk.push(result.docs[0].userIDs[index].userID);
				  selectors[index] = config.selectors.userID;
				  selectors[index].selector.book.$elemMatch.bookID = req.session.bookID;
				  selectors[index].selector.userID = result.docs[0].userIDs[index].userID;	
				  console.log("Gather users by Book");
				  var searchBookPromise = searchUsersByBook(selectors[index]);
				  promises.push(searchBookPromise);				  
			}
			++index;					  
		}
		return Promise.all(promises).then(function(values) {
			  console.log('Values Returned (searchUsersByBook):',JSON.stringify(values));
			  console.log('Checking if loans are consistent');
			  if (values.length > 0 && values[0].docs.length > 0){
				  console.log('Agregating Loans');
				  var loansOK = [];
				  for (index=0;index<values.length;++index){	
					//Each index is an user data
					  for(var i=0;i<values[index].docs[0].book.length;++i){
						  // If is a loan opened put the relationship with user info
						  if (values[index].docs[0].book[i].returnDate === '')
						  {
							  for (var j=0;j<result.docs[0].userIDs.length;++j)
							  {
								 console.log('Changing user data inside book for index '+j);
								 if (result.docs[0].userIDs[j].userID === values[index].docs[0].userID && typeof(result.docs[0].userIDs[j].loanID)==='undefined' && loansOK.indexOf(values[index].docs[0].book[i].loanID)===-1)
								 {						  
									  console.log("Putting loan ID "+values[index].docs[0].book[i].loanID+" with user details of "+values[index].docs[0].userID);
									  result.docs[0].userIDs[j].firstName = values[index].docs[0].firstName;
									  result.docs[0].userIDs[j].middleName = values[index].docs[0].middleName;
									  result.docs[0].userIDs[j].lastName = values[index].docs[0].lastName;
									  result.docs[0].userIDs[j].loanID = values[index].docs[0].book[i].loanID;
									  result.docs[0].userIDs[j].returnDate = values[index].docs[0].book[i].returnDate;
									  result.docs[0].userIDs[j].loanDate = values[index].docs[0].book[i].loanDate;
									  result.docs[0].userIDs[j].limitDate = values[index].docs[0].book[i].limitDate;	
									  result.docs[0].userIDs[j].notes = values[index].docs[0].book[i].notes;
									  result.docs[0].userIDs[j].renovationNr = values[index].docs[0].book[i].renovationNr;
									  loansOK.push(values[index].docs[0].book[i].loanID);
								 }
							  }
						  }	
					  }
				  }
			  }	  
			  console.log("Function return (populateBookWithLoan) : "+JSON.stringify(result));
			  return callback(result);
		},function(err){
			 console.log("Function return (populateBookWithLoan) - With ERROR: "+JSON.stringify(result));
			 return callback(result);
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
							  console.log('Found %d documents with %s', result.docs.length,JSON.stringify(sel));
							  if (result.docs.length>0)
							  {	  
							  	  console.log("Checking content :"+JSON.stringify(result.docs[0]));
								  if (result.docs[0].userIDs.length>0)
								  {
							  		console.log("Populating Book with all loans");
							  		populateBookWithLoan(result,req,function(resultFinal) {
							  			console.log("Function return (With Loans) : "+JSON.stringify(resultFinal));
							  			res.end(JSON.stringify(resultFinal)); 	
							  		});						  						  		  
								  }	
								  else{
									  console.log("Function return Book (No Loans) : "+JSON.stringify(result));
									  res.end(JSON.stringify(result));
								  }
							  }else{
								  console.log("Function return (No Book Found) : "+JSON.stringify(result));
								  res.end(JSON.stringify(result));
							  }
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
								res.end('para o Livro ID : '+ req.body.bookID+ " ISBN: "+ (req.body.isbn===""?'Sem ISBN':req.body.isbn)+" e Nome do Livro: "+req.body.bookName);	
							}	
						});								    		
			    	});
			    }
			    else
			    {
			    	res.end('Erro na Atualização do Livro : '+ req.body.bookID+ " ISBN: "+ (req.body.isbn===""?'Sem ISBN':req.body.isbn)+" e Nome do Livro: "+req.body.bookName);
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
				      res.write('Requisicão Excluída com Sucesso com o ID :<b> '+req.body.bookID +'</b>');
					  res.write(' para o Livro ISBN: '+ (req.body.isbn===""?'Sem ISBN':req.body.isbn));	 
					  res.end(' e Nome: '+ req.body.bookName);				    	
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

function insertBook(body,id,callback){
	var db = cloudant.db.use(config.database.book.name);
	db.insert(body, id, function(err, response, header) {
		if (err) {
			console.log('[db.insert] ', err.message);
			return callback(null,'Erro ao inserir o livro: ');
		}

		console.log('You have inserted the record.');
		console.log('With Content :');
		console.log(JSON.stringify(response, null, 2));
		var result = {};
		result.message = 'Livro Inserido com Sucesso com o ID :<b>'+body.bookID +'</b>';
		result.message = result.message+ " ISBN: "+ (body.isbn===""?'Sem ISBN':body.isbn)+" e Nome do Livro:<b> "+body.bookName+'</b>';
		result.bookID = body.bookID;		
		return callback(result,null);
	});
}

app.post('/services/ceai/inputBook', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	console.log(JSON.stringify(req.body, null, 2));

	var db = cloudant.db.use(config.database.book.name);
	var id =  uuidv1();
	
	if (req.body.isbn.trim()===""){
		var sel = JSON.parse(JSON.stringify(config.selectors.bookName));
		sel.selector.$or[0].bookName.$regex = sel.selector.$or[0].bookName.$regex.replace(REPLACEMENT_KEY,req.body.bookName);
		sel.selector.$or[1].bookName.$regex = sel.selector.$or[1].bookName.$regex.replace(REPLACEMENT_KEY,req.body.bookName);
		console.log("Search Existing book with selector: "+JSON.stringify(sel));
		db.find(sel, function(err, result) {
			  if (err) {
			    console.log(err);
			    res.end(err);
			  }
			  else{
				  if (result.docs.length===0){
					  insertBook(req.body,id,function(result,error){
							if (error){
								console.log('Error in insert Book');
								res.end(JSON.stringify(error));
							}else{
								res.end(JSON.stringify(result));
							}
						});
				  }
				  else{
					  var response = {};
					  response.message = 'Inclusão não realizada ! Motivo: Livro com com o Nome '+ req.body.bookName+' e sem ISBN Já existe na base de dados, por gentileza pesquisar primeiro na página principal';
					  res.end(JSON.stringify(response));	
				  }
			  }
		});		
	}
	else{
		var sel = config.selectors.isbn;
		sel.selector.isbn = req.body.isbn;
		db.find(sel, function(err, result) {
			  if (err) {
			    console.log(err);
			    res.end(err);
			  }
			  else{
				  if (result.docs.length===0){
					  insertBook(req.body,id,function(result,error){
							if (error){
								console.log('Error in insert Book');
								res.end(JSON.stringify(error));
							}else{
								res.end(JSON.stringify(result));
							}
					  });
				  }
				  else{
					  var response = {};
					  response.message = 'Inclusão não realizada ! Motivo: Livro com com o ISBN '+ req.body.isbn+' Já existe na base de dados, por gentileza pesquisar primeiro na página principal';
					  res.end(JSON.stringify(response));	
				  }
			  }
		});	
	}
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
				  if (typeof(result.docs[0].book)=='undefined'){
					  result.docs[0].book = [];
				  }
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
						if (typeof (result2.docs[0].loan)=='undefined'){
							result2.docs[0].loan = 0;
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
				  for(var i=0;i<result.docs[0].book.length;++i){
					  if(result.docs[0].book[i].returnDate==='' && result.docs[0].book[i].bookID == req.body.bookID){				   
						  result.docs[0].book[i].limitDate = req.body.limitDate;
						  result.docs[0].book[i].notes = req.body.notes;
						  result.docs[0].book[i].renovationNr = req.body.renovationNr;
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
	
	console.log("Searching by selector (Return Loan):",JSON.stringify(sel));
	
	db.find(sel, function(err, result) {
		  if (err) {
		    console.log(err);
		    res.end(err);
		  }
		  else{
			  //console.log("Results to update loan",JSON.stringify(result.docs));
			  if (result.docs.length>0){
				  for(var i=0;i<result.docs[0].book.length;++i){
					  if(result.docs[0].book[i].returnDate==='' && result.docs[0].book[i].bookID == req.body.bookID){
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
						console.log(JSON.stringify(result.docs[0], null, 2));						
						
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

app.get('/checkRestrictedAccess',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){
	
	console.log("Access Rule: "+session.role);
	if (session.role != 'admin'){
		console.log("O usuario: "+session.username +" nao tem acesso a esta funcionalidade");
		res.status(403);
		res.end();
	}
});

app.get('/StockBook',
		require('connect-ensure-login').ensureLoggedIn(),
		function(req, res){	
	
	if (session.role != 'admin'){
		console.log("O usuario: "+session.username +" nao tem acesso a esta funcionalidade");
		res.sendFile(__dirname + "/public/noaccess.html");
	}
	else{
		res.sendFile(__dirname + "/public/stockBook.html");
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

