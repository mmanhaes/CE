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

/*
 * $.getScript("my_lovely_script.js", function() {

   alert("Script loaded but not necessarily executed.");

});
 */

var fwDescriptions=[];

function handleChangeRadioButton(){
	
	var radios = document.getElementsByName("group1");
	var table = document.getElementById("tableResult");
	var row;
    for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 row = table.rows[i+2];         	 
        	 break;
         }
    }
    console.log(row.cells[1]);
    var association = {};
    association["associationType"] = row.cells[1].innerHTML;
    association["proposeDate"] = row.cells[2].innerHTML;
    association["analysisDate"] = row.cells[3].innerHTML;
    association["approved"] = row.cells[4].innerHTML;
    association["exitDate"] = row.cells[5].innerHTML;
    association["contribution"] = row.cells[6].innerHTML;
    association["notes"] = row.cells[7].innerHTML;
    
    console.log(JSON.stringify(association));
    populateAssociationData(association);
}

function buildAssociationRowTable(data){
	 
    var table = document.getElementById("tableResult");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML= '<input type="radio" name="group1" onchange="handleChangeRadioButton();">';
    row.insertCell(1).innerHTML= data.associationType;
    row.insertCell(2).innerHTML= data.proposeDate;
    row.insertCell(3).innerHTML= data.analysisDate;
    row.insertCell(4).innerHTML= data.approved;
    row.insertCell(5).innerHTML= data.exitDate;
    row.insertCell(6).innerHTML= data.contribution;
    row.insertCell(7).innerHTML= data.notes;
  
}

function populateAssociationData(association){
	$('#associationType').val(association.associationType);
	var date =association.proposeDate.split("-");
	$('#propDay').val(date[0]);
	$('#propMonth').val(date[1]);
	$('#propYear').val(date[2]);
	date = association.analysisDate.split("-");
	$('#anDay').val(date[0]);
	$('#anMonth').val(date[1]);
	$('#anYear').val(date[2]);
	$('#approved').val(association.approved);
	date = association.exitDate.split("-");
	$('#exitDay').val(date[0]);
	$('#exitMonth').val(date[1]);
	$('#exitYear').val(date[2]);			
	$('#contribution').val(association.contribution);
	$('#notes').val(association.notes);	
}

function populateData(person){
	console.log(JSON.stringify(person));
	$('#userID').val(person.userID);
	$('#fullName').val(person.firstName+ " "+person.middleName+" "+person.lastName);
	for(var i=person.association.length-1;i>=0;--i){
		if (i===person.association.length-1){
			populateAssociationData(person.association[i]);
		}
		buildAssociationRowTable(person.association[i]);
	}
	var radios = document.getElementsByName("group1");
	if (radios.length > 0){
		radios[0].checked = true;
	}
}

function checkUserAccess(){
	
	$.ajax({
  		url: '/services/ceai/checkUserAccess',
        type: 'GET',
        contentType: "text/plain",
        success: function(data, textStatus, jqXHR){
        	if (data !== 'admin'){
        		$('#insert').prop("disabled",true).css('opacity',0.5);
        		$('#update').prop("disabled",true).css('opacity',0.5);
        		$('#delete').prop("disabled",true).css('opacity',0.5);
        	}
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log("Saving Session Data Failed "+errorThrown);
        }
      });	
}

function loadSessionData(){
	
	var loadData = '{"searchKey" : "association"}';
    
    $.ajax({
  		url: '/services/ceai/loadSessionData',
        type: 'POST',
        data: loadData,
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
        	//TODO Work on logic to load HTML Fields if session is set with previous search on home.html also disable insert 
        	data = JSON.parse(data);
        	//{"warning":"no matching index found, create an index to optimize query time","docs":[{"firstName":"Marcelo","middleName":"Mota","lastName":"Manhães","userID":"2017-10-6-21-35-36-580","rg":"09614131-2","rgExp":"SSP-RJ","rgState":"RJ","birthDate":"21-08-1972","address":"Rua Angelo Massignan","number":"955","complement":"Casa","neighborhood":"São Braz","city":"Curitiba","state":"PR","postCode":"82315-000"}]}        		
        	populateData(data.docs[0]);        		
        	$('#insert').prop("disabled",false).css('opacity',1.0);
        	$('#update').prop("disabled",false).css('opacity',1.0);        		
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log("Saving Session Data Failed "+errorThrown);
        }
      });
}


function validateFields(callback){

	if ($.trim($('#propDay').val()) === '' || $.trim($('#propMonth').val()) === '' || $.trim($('#propYear').val())==='')  
	{
		return callback(false,"Preencha o campo data da proposta corretamente dd-MM-YYYY");
	}	
	
	if ($.trim($('#anDay').val()) === '' || $.trim($('#anMonth').val()) === '' || $.trim($('#anYear').val())==='')  
	{
		return callback(false,"Preencha o campo data da análise corretamente dd-MM-YYYY");
	}
	
	
	return callback(true,"");
}

function getCustomerID(){
	var currentdate = new Date(); 
	return  currentdate.getFullYear() 
					+ "-" + (currentdate.getMonth()+1) 
					+ "-" + currentdate.getDay()					 
					+ "-" + currentdate.getHours()  
	                + "-" + currentdate.getMinutes() 
	                + "-" + currentdate.getSeconds()
	                + "-" + currentdate.getMilliseconds();
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

function updateDB(){
	var $output = $('.output'),
	$process = $('.processing');
	var respNames = "";
	splitFullName($.trim($('#fullName').val()),function(response){
		respNames = response;
	});
	
	var associationArray = [];
	
	var radios = document.getElementsByName("group1");
	var table = document.getElementById("tableResult");
	var row;
    for (var i = 0, len = radios.length; i < len; i++) {
		//It is important to keep association variable here to guarantee that each array element on associationArray
		//will not have the same element
		var association = {};
        row = table.rows[i+2];		         
	    association["associationType"] = row.cells[1].innerHTML;
	    association["proposeDate"] = row.cells[2].innerHTML;
	    association["analysisDate"] = row.cells[3].innerHTML;
	    association["approved"] = row.cells[4].innerHTML;
	    association["exitDate"] = row.cells[5].innerHTML;
	    association["contribution"] = row.cells[6].innerHTML;
	    association["notes"] = row.cells[7].innerHTML;
	    associationArray.push(association);
    }
	var updateAssociation = '{'
		+'"type" : "association",'
		+'"userID" : "'+$.trim($('#userID').val())+'",'
		+'"firstName" : "'+$.trim(respNames.firstName)+'",'
		+'"middleName" : "'+$.trim(respNames.middleName)+'",'
		+'"lastName" : "'+$.trim(respNames.lastName)+'",'
		+'"association" : '+JSON.stringify(associationArray)+'}';

	console.log(JSON.stringify(updateAssociation));

	$.ajax({
		url: '/services/ceai/update',
		type: 'POST',
		data: updateAssociation,
		contentType: "application/json",
		success: function(data, textStatus, jqXHR){
				console.log(data);
				$('#results').text(data);
				$process.hide();
				$output.show(); 				      	           
		},
		error: function(jqXHR, textStatus, errorThrown){
			$('#results').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
			//alert('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
			$process.hide();
			$output.show(); 
		}
	});			
}

function remove(){
	
	var $output = $('.output'),
	$process = $('.processing');
	
	$process.show();
	$output.hide();
	
	var radios = document.getElementsByName("group1");
	var table = document.getElementById("tableResult");
	var rowIndex;
    for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 rowIndex = i+2;
         }
    }
    
    table.deleteRow(rowIndex);
           
    if (table.rows.length > 2){
    	radios[0].checked = "true";
    }	
    
    updateDB();
}



function update(){
	//alert('Insert Button'); 
	var $output = $('.output'),
	$process = $('.processing');	
	validateFields(function(valid,response){
		if (valid === false){
			if (response !== "")
				alert(response);
			else
				alert('Preencha todos os campos !');
			return;
		}
		else
		{
			$process.show();
			$output.hide();
			var radios = document.getElementsByName("group1");
			var table = document.getElementById("tableResult");
			var row;
		    for (var i = 0, len = radios.length; i < len; i++) {
		         if (radios[i].checked) {
		        	 row = table.rows[i+2];         	 
		        	 break;
		         }
		    }
			var associationType = document.getElementById("associationType");
			var approved = document.getElementById("approved");
		    
		    row.cells[1].innerHTML = associationType.options[associationType.selectedIndex].value;
		    row.cells[2].innerHTML = $.trim($('#propDay').val()) + '-' + $.trim($('#propMonth').val()) + '-' + $.trim($('#propYear').val());
		    row.cells[3].innerHTML = $.trim($('#anDay').val()) + '-' + $.trim($('#anMonth').val()) + '-' + $.trim($('#anYear').val());
		    row.cells[4].innerHTML = approved.options[approved.selectedIndex].value;
		    if ($.trim($('#exitDay').val())!==''){
		    	row.cells[5].innerHTML = $.trim($('#exitDay').val()) + '-' + $.trim($('#exitMonth').val()) + '-' + $.trim($('#exitYear').val());
		    }
		    else{
		    	row.cells[5].innerHTML = '';
		    }
		    row.cells[6].innerHTML = $.trim($('#contribution').val());
		    row.cells[7].innerHTML = $.trim($('#notes').val());
			
			updateDB();		
		}	
	}); 	
}

function insert(){
	
	//alert('Insert Button'); 
	var $output = $('.output'),
	$process = $('.processing');	
	validateFields(function(valid,response){
		if (valid === false){
			if (response !== "")
				alert(response);
			else
				alert('Preencha todos os campos !');
			return;
		}
		else
		{
			$process.show();
			$output.hide();
			var associationType = document.getElementById("associationType");
			var approved = document.getElementById("approved");
			var association = {};
		    association["associationType"] = associationType.options[associationType.selectedIndex].value;
		    association["proposeDate"] = $.trim($('#propDay').val()) + '-' + $.trim($('#propMonth').val()) + '-' + $.trim($('#propYear').val());
		    if ($.trim($('#exitDay').val())!==''){
		    	association["exitDate"] = $.trim($('#exitDay').val()) + '-' + $.trim($('#exitMonth').val()) + '-' + $.trim($('#exitYear').val());
		    }
		    else{
		    	association["exitDate"] = "";
		    }
		    association["contribution"] = $.trim($('#contribution').val());
		    association["habilities"] = $.trim($('#habilities').val());
		    association["notes"] = $.trim($('#notes').val());
			
		    buildAssociationRowTable(association);
			updateDB();	
			var radios = document.getElementsByName("group1");
			radios[radios.length-1].checked = "true";
		}	
	}); 	
	
}

$(document).ready(function() {
	$('#associationType').change(function(){
		//alert("Changed");
	});
	$('#previous').click(function(){
		window.location = "/Contact";
	});
	$('#next').click(function(){
		window.location = "/Study";
	});
	$('#update').click(function(){
		update();
	});		
	$('#insert').click(function(){
		insert();
	});	
	$('#delete').click(function(){
		remove();
	});	
});
