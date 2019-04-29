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
const REPLACEMENT_KEY = '<ENTRY>';

function getBookID(){
	var currentdate = new Date(); 
	return  currentdate.getFullYear() 
					+ "-" + (currentdate.getMonth()+1) 
					+ "-" + currentdate.getDate()					 
					+ "-" + currentdate.getHours()  
	                + "-" + currentdate.getMinutes() 
	                + "-" + currentdate.getSeconds()
	                + "-" + currentdate.getMilliseconds();
}

function insertBook(data,id,callback){

	var db = cloudant.db.use(config.database.book.name);
	db.insert(data, id, function(err, response, header) {
		if (err) {
			console.log('[db.insert] ', err.message);
			return callback(null,err);
		}

		console.log('You have inserted the record.');
		console.log('With Content :');
		console.log(JSON.stringify(response, null, 2));

		return callback(true,null);
	});	
}

function updateBook(data,callback){

	var db = cloudant.db.use(config.database.book.name);
	db.insert(data, function(err, response, header) {
		if (err) {
			console.log('[db.update] for data: '+JSON.stringify(data)+' Error: '+ err.message);
			return callback(null,err);
		}

		console.log('You have updated the record.');
		console.log('With Content :');
		console.log(JSON.stringify(response, null, 2));

		return callback(true,null);
	});	
}

function prepareUpdate(dbSource,request,callback){
	
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
	
	return callback(dbSource);
}


function insertBookControl(data){
	return new Promise(function (resolve, reject) {
		var db = cloudant.db.use(config.database.book.name);
		var id =  uuidv1();
		
		if (data.isbn.trim()===""){
			var sel = JSON.parse(JSON.stringify(config.selectors.bookName));
			sel.selector.$or[0].bookName.$regex = sel.selector.$or[0].bookName.$regex.replace(REPLACEMENT_KEY,data.bookName);
			sel.selector.$or[1].bookName.$regex = sel.selector.$or[1].bookName.$regex.replace(REPLACEMENT_KEY,data.bookName);
			console.log("Search Existing book with selector: "+JSON.stringify(sel));
			db.find(sel, function(err, result) {
				  if (err) {
				    console.log(err);
				    reject(err);
				  }
				  else{
					  if (result.docs.length===0){
						  insertBook(data,function(result,error){
								if (error){
									reject(error);
								}else{
									resolve(result)
								}
							});
					  }
					  else{
						  prepareUpdate(result.docs[0],data,function(response){
							  updateBook(response,function(result,error){
									if (error){
										reject(error);
									}else{
										resolve(result)
									}
							  });
							  /*
							  var response = {};
							  response.message = 'Inclusão não realizada ! Motivo: Livro com com o Nome '+ data.bookName+' e sem ISBN Já existe na base de dados, por gentileza pesquisar primeiro na página principal';
							  resolve(response);
							  */
						  });
					  }
				  }
			});		
		}
		else{
			var sel = config.selectors.isbn;
			sel.selector.isbn = data.isbn;
			db.find(sel, function(err, result) {
				  if (err) {
				    console.log(err);
				    res.end(err);
				  }
				  else{
					  if (result.docs.length===0){
						  insertBook(data,function(result,error){
								if (error){
									reject(error);
								}else{
									resolve(result)
								}
						  });
					  }
					  else{
						  prepareUpdate(result.docs[0],data,function(response){
							  updateBook(result.docs[0],function(result,error){
									if (error){
										reject(error);
									}else{
										resolve(result)
									}
							  });
							  /*
							  var response = {};
							  response.message = 'Inclusão não realizada ! Motivo: Livro com com o Nome '+ data.bookName+' e sem ISBN Já existe na base de dados, por gentileza pesquisar primeiro na página principal';
							  resolve(response);
							  */
						  });
					  }
				  }
			});	
		}
	});
}

function transformData(data){
	var books = [];
	
	for(var i=0;i<data.length;++i){
		var book = JSON.parse(JSON.stringify(config.book));
		book.bookID = getBookID();
		book.bookName = data[i]['TÍTULO'];
		book.author = data[i]['AUTOR '];
		book.espAuthor = data[i]['AUTOR ESPIRITUAL'];
		book.category = data[i].CATEGORIA;
		book.amount = data[i]['QT.'];
		book.available = data[i]['QT.'];
		books.push(book);
	}
	
	return books;
}
		
function loadBooksFromFile(fileName){
	var XLSX = require('xlsx');

	var workbook = XLSX.readFile(fileName);
	var worksheet = workbook.Sheets['Plan1'];
	var headers = {};
	var data = [];
	for(z in worksheet) {
	    if(z[0] === '!') continue;
	    //parse out the column, row, and value
	    var col = z.substring(0,1);
	    var row = parseInt(z.substring(1));
	    var value = worksheet[z].v;
	
	    if (row == 1){
	    	continue;
	    }
	    
	    //store header names
	    if(row == 2) {
	        headers[col] = value;
	        continue;
	    }
	
	    if(!data[row]) data[row]={};
	    data[row][headers[col]] = value;
	}

	//Deal with empty values
	var filtered = data.filter(Boolean);
	
	return filtered;
}

function loadBooks(){
	var data = loadBooksFromFile('./data/LIVROS BIBLIOTECA.xlsx');
	var books = transformData(data);
	console.log(books);
	var promises = [];
	var nInsert=0;
	for(var i=0;i<books.length;++i){
		var insertBook = insertBookControl(books[i]);
		insertBook.then(function(response){			
			nInsert++;
			console.log('Number of Books Inserted',nInsert);
						
		},function(err){
			console.log("Error in insertBookControl",err);
		})
	}	
	/*
	for(var i=0;i<books.length;++i){
		promises.push(insertBookControl(books[i]));		
	}	
	Promise.all(promises).then(function(values) {
		var nInsert;
		for(var j=0;j<values.length;++j){
			if (typeof(values[i].message)!=='undefined'){
				console.log(values[i].message);
			}
			else{
				nInsert++;
			}
		}
		console.log("Number of books inserted",nInsert);
	},function(err){
		console.log("Error in insertBookControl",err);
	});
	*/
}

//var args = process.argv.splice(2);
loadBooks();

/*
var XLSX = require('xlsx');
var workbook = XLSX.readFile('./data/LIVROS BIBLIOTECA.xlsx');
var sheet_name_list = workbook.SheetNames;
console.log(XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]],{raw: true}))
*/