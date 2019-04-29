/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global $ */
'use strict';

var fwDescriptions=[];

function cleanSearchOutput(){
	var table = document.getElementById("tableResult");
	var length = table.rows.length;
	for (var i = length-1; i >=2 ; --i) {
		table.deleteRow(i);
	} 	
}

function handleChangeRadioButton(){
	
	var radios = document.getElementsByName("group1");
	var table = document.getElementById("tableResult");
	var row,cell;
    for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 row = table.rows[i+2];
        	 cell = row.cells[1];
        	 break;
         }
    }
    var searchSession = '{"userID" : "'+cell.innerHTML+'"}';
    
    $.ajax({
  		url: '/services/ceai/saveSearchSession',
        type: 'POST',
        data: searchSession,
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
        	console.log("Saving Session Data "+cell.innerHTML+" "+data);    
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log("Saving Session Data Failed "+errorThrown);
        }
      });
}

function buildSearhOutput(data){
	 
	    var table = document.getElementById("tableResult");

	    for (var i = 0; i < data.docs.length; i++) {
		    var rowCount = table.rows.length;
		    var row = table.insertRow(rowCount);
	
		    var cell = row.insertCell(0);
		    cell.innerHTML= '<input type="radio" name="group1" onchange="handleChangeRadioButton();">';		    
		    cell.style="border: 1px solid grey";
		    cell.align="center";
		    cell  = row.insertCell(1);
		    cell.innerHTML= data.docs[i].userID;
		    cell.style="border: 1px solid grey";
		    cell.align="center";
		    cell = row.insertCell(2);
		    if (data.docs[i].middleName !== "")
		    	cell.innerHTML= data.docs[i].firstName+" "+data.docs[i].middleName+" "+data.docs[i].lastName;
		    else
		    	cell.innerHTML= data.docs[i].firstName+" "+data.docs[i].lastName;
		    cell.colSpan = 2;
		    cell.style="border: 1px solid grey";
		    cell.align="center";
		    cell = row.insertCell(3);
		    cell.innerHTML= data.docs[i].phone1 || "";
		    cell.style="border: 1px solid grey";
		    cell.align="center";
		    cell = row.insertCell(4);
		    cell.innerHTML= data.docs[i].email1 || "";
		    cell.style="border: 1px solid grey";
		    cell.align="center";
	    }
}

function validateFields(){
	if ($.trim($('#fullName').val()) === '')  
	{
		return false;
	}	
	
	return true;
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

$(document).ready(function() {
	
  $('#reset').click(function(){
	  $.ajax({
	  		url: '/services/ceai/resetSession',
	        type: 'GET',
	        contentType: "application/json",
	        success: function(data, textStatus, jqXHR){
	        	if (data === "OK")
	        		console.log("Session Reset with success");
	        	else
	        		console.log("Session Reset with fail");
	        },
	        error: function(jqXHR, textStatus, errorThrown){
	        	console.log("Saving Session Data Failed "+errorThrown);
	        }
	   });
  });	
   
   $('#download').click(function(){
	    var filename = ''; 
	    if ($.trim($('#query').val()) == '')
	    	filename = 'FireBotSearch-Result-'+ $.trim($('#query').val())+'.txt';
	    else
	    	filename = 'FireBotSearch-Result-'+ $.trim($('#query').val())+'-'+$.trim($('#port').val())+'.txt';
	    
		download(filename, $('#results').text());
  });	
	
  $('#search').click(function(){
	//alert('Search Button'); 
	var $output = $('.output'),
	$error = $('.error'),
	$process = $('.processing');	
	if (validateFields()===false){	
		alert('Favor preencher um nome para pesquisar, pode ser o primeiro nome ou nome completo');
		return;
	}	
	$process.show();
	cleanSearchOutput();
  	$output.hide();
  	$error.hide();
  	var respNames = "";
	splitFullName($.trim($('#fullName').val()),function(response){
		respNames = response;
	});
  	  		
  	var inputSearch = '{'
  		+'"firstName" : "'+$.trim(respNames.firstName)+'",'
		+'"middleName" : "'+$.trim(respNames.middleName)+'",'
		+'"lastName" : "'+$.trim(respNames.lastName)+'"}';
  	  
  	  console.log(JSON.stringify(inputSearch));
  	  
  	  $.ajax({
  		url: '/services/ceai/searchPerson',
        type: 'POST',
        data: inputSearch,
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
        	//alert(data);
        	buildSearhOutput(JSON.parse(data));
            $process.hide();
            $output.show();        
        },
        error: function(jqXHR, textStatus, errorThrown){
        	$('#results').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
        	//alert('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
        	 $process.hide();
             $error.show(); 
        }
      });
    });
});