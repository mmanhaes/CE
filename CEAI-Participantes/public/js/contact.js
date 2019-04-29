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

function populateData(person){
	$('#userID').val(person.userID);
	$('#fullName').val(person.firstName+ " "+person.middleName+" "+person.lastName);
	var phone = [];
	if (typeof(person.phone1) !== 'undefined')
	{
		phone = person.phone1.split("-");
		$('#ddd1').val(phone[0]);
		$('#phone1').val(phone[1]);
	}
	$('#whatsup1').val(person.whatsup1);	
	if (typeof(person.phone2) !== 'undefined')
	{
		phone = person.phone2.split("-");
		$('#ddd2').val(phone[0]);
		$('#phone2').val(phone[1]);
	}
	$('#whatsup2').val(person.whatsup2);
	$('#email1').val(person.email1);
	$('#email2').val(person.email2);	
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
	
	var loadData = '{"searchKey" : "contact"}';
    
    $.ajax({
  		url: '/services/ceai/loadSessionData',
        type: 'POST',
        data: loadData,
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
        	//TODO Work on logic to load HTML Fields if session is set with previous search on home.html also disable insert 
        	//alert(data);
        	//{"warning":"no matching index found, create an index to optimize query time","docs":[{"firstName":"Marcelo","middleName":"Mota","lastName":"Manhães","userID":"2017-10-6-21-35-36-580","rg":"09614131-2","rgExp":"SSP-RJ","rgState":"RJ","birthDate":"21-08-1972","address":"Rua Angelo Massignan","number":"955","complement":"Casa","neighborhood":"São Braz","city":"Curitiba","state":"PR","postCode":"82315-000"}]}
        	data = JSON.parse(data);
        	if (data.docs.length>0)
        	{
        		var person = data.docs[0];
        		if (typeof(person.phone1) === 'undefined' || person.phone1 ==="")
        			$('#insert').prop("disabled",false).css('opacity',1.0);
        		else
        			$('#insert').prop("disabled",true).css('opacity',0.5);
        		populateData(data.docs[0]);        		
        	}
        	else
        	{
        		$('#insert').prop("disabled",true).css('opacity',0.5);
        		$('#update').prop("disabled",true).css('opacity',0.5);
        	}	
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log("Saving Session Data Failed "+errorThrown);
        }
      });
}


function validateFields(callback){
	if ($.trim($('#phone1').val()) === '')  
	{
		return callback(false,"Pelo menos o campo telefone precisa ser preenchido");
	}	
	var whatsup1 = document.getElementById("whatsup1");
	
	if (whatsup1.selectedIndex < 0){

		return callback(false,"Selecione de o telefone 1 tem whatsup ou não");
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


function updateAndInsert(){
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
			var whatsup1 = document.getElementById("whatsup1");
			var whatsup2 = document.getElementById("whatsup2");
			var respNames = "";
			splitFullName($.trim($('#fullName').val()),function(response){
				respNames = response;
			});
			
			var updateGeneral = '{'
				+'"type" : "contact",'
				+'"userID" : "'+$.trim($('#userID').val())+'",'
				+'"firstName" : "'+$.trim(respNames.firstName)+'",'
				+'"middleName" : "'+$.trim(respNames.middleName)+'",'
				+'"lastName" : "'+$.trim(respNames.lastName)+'",'
				+'"phone1" : "'+$.trim($('#ddd1').val())+"-"+$.trim($('#phone1').val())+'",'
				+'"whatsup1" : "'+whatsup1.options[whatsup1.selectedIndex].value+'",'
				+'"phone2" : "'+($.trim($('#phone2').val())!==""? $.trim($('#ddd2').val())+"-"+$.trim($('#phone2').val()):'')+'",'
				+'"whatsup2" : "'+(whatsup2.selectedIndex >=0 ?  whatsup2.options[whatsup2.selectedIndex].value : '')+'",'
				+'"email1" : "'+$.trim($('#email1').val())+'",'
				+'"email2" : "'+$.trim($('#email2').val())+'"}';

			console.log(JSON.stringify(updateGeneral));

			$.ajax({
				url: '/services/ceai/update',
				type: 'POST',
				data: updateGeneral,
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
	}); 	
}

$(document).ready(function() {
	$('#previous').click(function(){
		window.location = "/General";
	});
	$('#next').click(function(){
		window.location = "/Association";
	});
	$('#update').click(function(){
		updateAndInsert();
	});		
	$('#insert').click(function(){
		updateAndInsert();
	});	
});
