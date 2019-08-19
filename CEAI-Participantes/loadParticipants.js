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
const case_ins = "(?i)"; 
var nInserts = 0;
var randomstring = require("randomstring");

function getParticipantID(){
	var currentdate = new Date(); 
	
	var padding = randomstring.generate({
		  length: 4,
		  charset: 'numeric'
	});
	
	return  currentdate.getFullYear() 
					+ "-" + (currentdate.getMonth()+1) 
					+ "-" + currentdate.getDay()					 
					+ "-" + currentdate.getHours()  
	                + "-" + currentdate.getMinutes() 
	                + "-" + currentdate.getSeconds()
	                + "-" + padding;
}

function insertParticipant(data,callback){

	var id =  uuidv1(); 
	var db = cloudant.db.use(config.database.person.name);
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

function updateParticipant(data,callback){

	var db = cloudant.db.use(config.database.person.name);
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
			dbSource.userID= request.userID;
			dbSource.firstName = request.firstName;
			dbSource.middleName = request.middleName;
			dbSource.lastName = request.lastName;
			dbSource.association = request.association;
			dbSource.study = request.study;
			dbSource.work = request.work;

	
	return callback(dbSource);
}

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

function insertParticipantControl(data,index){
	return new Promise(function (resolve, reject) {
		if (index == data.length){
			resolve(false);
		}
		else{
			var db = cloudant.db.use(config.database.person.name);
			buildSelectorSearchPerson(data[index],function(err,sel){
				console.log("Search Existing Participant with selector: "+JSON.stringify(sel));
				db.find(sel, function(err, result) {
					  if (err) {
					    console.log(err);
					    reject(err);
					  }
					  else{
						  if (result.docs.length===0){
							  console.log("No docs found preparing for insert data:",data[index]);
							  insertParticipant(data[index],function(result,error){
									if (error){
										reject(error);
									}else{
										console.log('Insert worked for the Name '+ data[index].firstName+' '+ data[index].middleName + ' ' + data[index].lastName);
										var insert = insertParticipantControl(data,++index);
										insert.then(function(response){		
											if (response)
												nInserts++;
											resolve(true);
										},function(err){
											console.log("Error in insertParticipantControl",err);
										});
									}
							  });
						  }
						  else{
							  console.log('insert not done ! Reason: participant with Name '+ data[index].firstName+' '+ data[index].middleName + ' ' + data[index].lastName + ' already exists in database');
							  var insert = insertParticipantControl(data,++index);
							  insert.then(function(response){		
									if (response)
										nInserts++;
									resolve(false);
								},function(err){
									console.log("Error in insertParticipantControl",err);
							  });
						  }
					  }
				});		
			});
		}
	});
}

function splitFullName(name,callback){
	var res = name.split(" ");
	var response = {
			firstName: "",
			lastName: "",
			middleName: ""
	};
	if (res.length ===1 )
	{
		response.firstName = name;
		return callback(response);
	}
	response.firstName = res[0];
	response.lastName = res[res.length-1];
	var middleName = "";
	for (var i=1; i<res.length-1;++i){
		middleName += " "+res[i];
	}
	response.middleName = middleName;
	return callback(response);
}


function transformData(data){
	var particpants = [];
	
	for(var i=0;i<data.length;++i){
		var participant = JSON.parse(JSON.stringify(config.participant));
		participant.userID = getParticipantID();
		splitFullName(data[i]['NOME'],function(respNames){
			participant.firstName = respNames.firstName;
			participant.middleName = respNames.middleName;
			participant.lastName = respNames.lastName;
			participant.address = data[i]['ENDERECO'];
			participant.neighborhood = data[i]['BAIRRO'];
			participant.city = data[i].CIDADE;
			participant.state = data[i]['ESTADO'];
			participant.postCode = data[i]['CEP'];
			participant.phone1 = data[i]['FONE_1'];
			participant.phone2 = data[i]['FONE_2'];
			var association = JSON.parse(JSON.stringify(config.association));
			if (data[i].SITUA === 'INATIVO' || data[i].SITUA === 'inativa'){
				association.associationType = "INATIVO";
			}
			else{
				if (data[i].SITUA === 'ISENTO' || data[i].SITUA === 'ISENTA'){
					association.contribution = "ISENTO";
				}				
				if (data[i].TIPO === 'C'){
					association.associationType = "Colaborador";
				}
				if (data[i].TIPO === 'E'){
					association.associationType = "Efetivo";
				}
			}
			participant.association.push(association);
			participant.email1 = data[i].EMAIL;
			particpants.push(participant);
		});
	}
	
	return particpants;
}
		
function loadParticipantsFromFile(fileName){
	var XLSX = require('xlsx');

	var workbook = XLSX.readFile(fileName);
	var worksheet = workbook.Sheets['CADGERAL'];
	var headers = {};
	var data = [];
	for(z in worksheet) {
		//console.log(z);
	    if(z[0] === '!') continue;
	    //parse out the column, row, and value
	    var col = z.substring(0,1);
	    var row = parseInt(z.substring(1));
	    var value = worksheet[z].v;
	    //console.log('Row Number',row);
	    //console.log('Row values',value);
	    
	    //store header names
	    if(row === 1) {
	        headers[col] = value;
	        //console.log('Headers',headers);
	        continue;
	    }
	
	    if(!data[row]) data[row]={};
	    data[row][headers[col]] = value;
	}

	//Deal with empty values
	var filtered = data.filter(Boolean);
	
	return filtered;
}

function loadParticipants(){
	var data = loadParticipantsFromFile('./data/CADGERAL.xlsx');
	var participants = transformData(data);
	//console.log(participants);
	var promises = [];
	var nCheck=0;	
	var insert = insertParticipantControl(participants,nCheck);
	insert.then(function(response){		
		if (response)
			nInserts++;
		console.log('Number of Participants Inserted',nInserts);
	},function(err){
		console.log("Error in loadParticipants",err);
	});		
}

function dumpParticipants(outputFile){
	var xlsx = require('node-xlsx').default;
	
	const fs = require("fs");
	
	var db = cloudant.db.use(config.database.person.name);
	var sel = config.selectors.forDump;
	
	var fields = JSON.parse(JSON.stringify(config.selectors.forDump.fields));
 
    var data = [fields];
    
	db.find(sel, function(err, result) {
		if (err) {
		 	data.message = "NOK";
			res.end(JSON.stringify(data));
		}
		else{
			 if (result.docs.length>0){
				   console.log('Number of participantes found',result.docs.length);
				   for(var i=0;i<result.docs.length;++i){
					   var item = [];
					   for (var j=0;j<fields.length;++j){
						   item.push(result.docs[i][fields[j]])
					   }
					   data.push(item);
				   }				 
				   const buffer = xlsx.build([{ name: "participants", data: data }]);
				   
				   fs.writeFile(outputFile, buffer, (err) => {
					    if (err) throw err
					    console.log('Dump of participantes executed with success on file',outputFile);					    
				   })
			 }
		}
	});
	
}

//var args = process.argv.splice(2);
//loadParticipants();
dumpParticipants('./data/participantsCloud.xlsx');
