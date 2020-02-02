/**
 * http://usejsdoc.org/
 */
var config = require('./config');
var vcapServices = require('vcap_services');
var Cloudant = require('cloudant');
var credentials = vcapServices.getCredentials('cloudantNoSQLDB', 'Lite', config.cloudant.instance);
var dbURL =  credentials.url || config.cloudant.url; 
var cloudant = Cloudant({url: dbURL, plugin:'retry', retryAttempts:30, retryTimeout:35000 });
const uuidv1 = require('uuid/v1');
const nano = require('nano')(dbURL);
const fs = require('fs');

function updateParticipant(fullPathFile){
	//Split to get the fileName
	var fileParts = fullPathFile.split("/");
	
	//Extract fincode from fileName
	var fincode = fileParts[fileParts.length-1].split(" ")[0];
	
	var padding = 5 - fincode.length;
	
	for(var i=0;i<padding;++i){
		fincode = "0"+fincode;
	}
	
	console.log('Searching user by fincode: '+fincode);
	
	var db = cloudant.db.use(config.database.person.name);
	var selector = config.selectors.forFinancialUpdates;
	selector.selector.fincode = fincode;
	
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
			    	var prepareResult = prepareUpdate(result.docs[0],fullPathFile);
			    	prepareResult.then(function(response) {
			    	   		db.insert(response, function(err, body, header) {
								if (err) {
									console.log('[db.update] ', err.message);
								}
								else{
									console.log('You have updated the record.');
									console.log('With Content :');
									console.log(JSON.stringify(response, null, 2));
									console.log('Requisicao Atualizada com Sucesso Para o Usuario com o ID :'+response.userID +'\n');
									console.log('Código Financeiro :'+response.fincode +'\n');
									console.log('Participante : '+ response.firstName+ " "+ response.middleName+" "+response.lastName);	
								}	
			    	   		});								    		
			    	}, function(err) {
			    		console.log('PDF failed to convert for file: '+fullPathFile);
				    });
			    }
			    else
			    {
			    	console.log('Erro na Atualizacao, Motivo: o fincode '+ fincode + ' Nao foi encontrado');
			    }	
		  }
	});	 
}


function prepareUpdate(dbSource, fullPathFile){
	
	return new Promise(function(resolve, reject){
		var attachments = JSON.parse(JSON.stringify(config.attachments.VolunteerForm));
		
		
		const pdf2base64 = require('pdf-to-base64');
		pdf2base64(fullPathFile)
		    .then(
		        (response) => {	        	
		        	console.log('Base 64 of PDF: '+response); //cGF0aC90by9maWxlLmpwZw==
		        	attachments.fichaVoluntario.data = response;
		        	
		        	dbSource._attachments = attachments;
		        	
		        	resolve(dbSource);
		        }
		    )
		    .catch(
		        (error) => {
		            console.log('Error to convert PDF to Base64: '+error); //Exepection error....
		            attachments.fichaVoluntario.data = 'N/A';
		            
		            dbSource._attachments = attachments;
		        	
		        	reject(error);
		        }
		);
	});	
}

function getAttachmentContentToFile(fincode,attachmentName,fileDestination){
	var padding = 5 - fincode.length;
	
	for(var i=0;i<padding;++i){
		fincode = "0"+fincode;
	}
	
	var db = nano.db.use(config.database.person.name);
	
	var selector = config.selectors.forFinancialUpdates;
	selector.selector.fincode = fincode;
	
	db.find(selector, function(err, result) {
		  if (err) {
		    console.log(err);
		  }
		  else{
			    console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
			    console.log('Result %s', JSON.stringify(result));
			    if (result.docs.length>0)
			    {
			    	db.attachment.getAsStream(result.docs[0]._id, attachmentName).pipe(fs.createWriteStream(fileDestination));
			    	console.log('Extracao com sucesso do conteudo atachado de id: '+ attachmentName+', no arquivo:'+fileDestination);
			    }
		    	else
			    {
			    	console.log('Na extracao do conteudo atachado de id: '+ attachmentName+', Motivo: o fincode '+ fincode + ' Nao foi encontrado');
			    }	
		 }
	});
}

function getAttachmentContent(fincode,attachmentName,callback){
	var padding = 5 - fincode.length;
	
	for(var i=0;i<padding;++i){
		fincode = "0"+fincode;
	}
	
	var db = nano.db.use(config.database.person.name);
	
	var selector = config.selectors.forFinancialUpdates;
	selector.selector.fincode = fincode;
	
	db.find(selector, function(err, result) {
		  if (err) {
			    console.log(err);
			    
			    return callback(null,err);
		  }
		  else{
			    console.log('Found %d documents with %s', result.docs.length,JSON.stringify(selector));
			    
			    console.log('Result %s', JSON.stringify(result));
			    
			    if (result.docs.length>0)			    	
			    {
			    	/*
			    	db.attachment.getAsStream(result.docs[0]._id, attachmentName).pipe(fs.createWriteStream(fincode+'.pdf',{emitClose:true}));
			    				    	
			    	const fsPromises = require('fs').promises;
			    	
			    	async function openAndClose() {
			    	  let filehandle;
			    	  
			    	  try {
			    	    filehandle = await fsPromises.open(fincode+'.pdf', 'r');
			    	  } finally {
			    	    if (filehandle !== undefined)
			    	      await filehandle.close();
			    	  }
			    	}
			    	
			    	
			    	return callback(fincode+'.pdf',null);
			    	*/
			    	
			    	return callback(db.attachment.getAsStream(result.docs[0]._id, attachmentName),null);
			    }
		    	else
			    {
			    	return callback(null,'No Document Found with fincode: '+fincode);
			    }	
		 }
	});
}

module.exports.getAttachmentContent = getAttachmentContent;

//getAttachmentContentToFile("990","fichaVoluntario","./data/990 - recovered.pdf");

//updateParticipant('./data/volunteersForm/578 cinza.pdf');