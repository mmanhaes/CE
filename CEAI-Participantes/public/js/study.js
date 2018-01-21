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

function populateStudyData(study){
	   
	$('#studyType').val(study.studyType);
	$('#dayWeek').val(study.dayWeek);
	$('#period').val(study.period);
	var initDate =  study.initDate.split("-");
	$('#initDay').val(initDate[0]);
	$('#initMonth').val(initDate[1]);
	$('#initYear').val(initDate[2]);
	var finalDate =  study.finalDate.split("-");
	$('#finalDay').val(finalDate[0]);
	$('#finalMonth').val(finalDate[1]);
	$('#finalYear').val(finalDate[2]);
	$('#notes').val(study.notes);	
}

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
    var study = {};
    study["studyType"] = row.cells[1].innerHTML;
    study["dayWeek"] = row.cells[2].innerHTML;
    study["period"] = row.cells[3].innerHTML; 
    study["initDate"] = row.cells[4].innerHTML;
    study["finalDate"] = row.cells[5].innerHTML;
    study["notes"] = row.cells[6].innerHTML;
    
    console.log(JSON.stringify(study));
    populateStudyData(study);
}

function buildStudyRowTable(data){
	 
    var table = document.getElementById("tableResult");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML= '<input type="radio" name="group1" onchange="handleChangeRadioButton();">';
    row.insertCell(1).innerHTML= data.studyType;
    row.insertCell(2).innerHTML= data.weekDay;
    row.insertCell(3).innerHTML= data.period;
    row.insertCell(4).innerHTML= data.initDate;
    row.insertCell(5).innerHTML= data.finalDate;
    row.insertCell(6).innerHTML= data.notes;  
}

function populateData(person){
	console.log(JSON.stringify(person));
	$('#userID').val(person.userID);
	$('#fullName').val(person.firstName+ " "+person.middleName+" "+person.lastName);
	console.log(JSON.stringify(person));
	for(var i=person.study.length-1;i>=0;--i){
		if (i===person.study.length-1){
			populateStudyData(person.study[i]);
		}
		buildStudyRowTable(person.study[i]);
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
	
	var loadData = '{"searchKey" : "study"}';
    
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

	if ($.trim($('#initDay').val()) === '' || $.trim($('#initMonth').val()) === '' || $.trim($('#initYear').val())==='')  
	{
		return callback(false,"Preencha o campo data inicial corretamente dd-MM-YYYY");
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
	
	var studyArray = [];
	
	var radios = document.getElementsByName("group1");
	var table = document.getElementById("tableResult");
	var row;
    for (var i = 0, len = radios.length; i < len; i++) {
		//It is important to keep association variable here to guarantee that each array element on associationArray
		//will not have the same element
		var study = {};
        row = table.rows[i+2];		         
        study["studyType"] = row.cells[1].innerHTML;
        study["weekDay"] = row.cells[2].innerHTML;
        study["period"] = row.cells[3].innerHTML;
        study["initDate"] = row.cells[4].innerHTML;
        study["finalDate"] = row.cells[5].innerHTML;
        study["notes"] = row.cells[6].innerHTML;
        studyArray.push(study);
    }
	var updateStudy = '{'
		+'"type" : "study",'
		+'"userID" : "'+$.trim($('#userID').val())+'",'
		+'"firstName" : "'+$.trim(respNames.firstName)+'",'
		+'"middleName" : "'+$.trim(respNames.middleName)+'",'
		+'"lastName" : "'+$.trim(respNames.lastName)+'",'
		+'"study" : '+JSON.stringify(studyArray)+'}';

	console.log(JSON.stringify(updateStudy));

	$.ajax({
		url: '/services/ceai/update',
		type: 'POST',
		data: updateStudy,
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
			var studyType = document.getElementById("studyType");
			var weekDay = document.getElementById("weekDay");
			var period = document.getElementById("period");
		    
		    row.cells[1].innerHTML = studyType.options[studyType.selectedIndex].value;
		    row.cells[2].innerHTML = weekDay.options[weekDay.selectedIndex].value;
		    row.cells[3].innerHTML = period.options[period.selectedIndex].value;
		    row.cells[4].innerHTML = $.trim($('#initDay').val()) + '-' + $.trim($('#initMonth').val()) + '-' + $.trim($('#initYear').val());
		    if ($.trim($('#finalDay').val())!==''){
		    	row.cells[5].innerHTML = $.trim($('#finalDay').val()) + '-' + $.trim($('#finalMonth').val()) + '-' + $.trim($('#finalYear').val());
		    }
		    else{
		    	row.cells[5].innerHTML = '';
		    }
		    row.cells[6].innerHTML = $.trim($('#notes').val());
			
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
			var studyType = document.getElementById("studyType");
			var weekDay = document.getElementById("weekDay");
			var period = document.getElementById("period");
			var study = {};
		    study.studyType = studyType.options[studyType.selectedIndex].value;
		    study.weekDay = weekDay.options[weekDay.selectedIndex].value
		    study.period = period.options[period.selectedIndex].value;
		    study.initDate = $.trim($('#initDay').val()) + '-' + $.trim($('#initMonth').val()) + '-' + $.trim($('#initYear').val());
		    if ($.trim($('#finalDay').val())!==''){
		    	study.finalDate = $.trim($('#finalDay').val()) + '-' + $.trim($('#finalMonth').val()) + '-' + $.trim($('#finalYear').val());
		    }
		    else{
		    	study.finalDate = "";
		    }
		    study.notes = $.trim($('#notes').val());
			
		    buildStudyRowTable(study);
			updateDB();	
			var radios = document.getElementsByName("group1");
			radios[radios.length-1].checked = "true";
		}	
	}); 	
	
}

$(document).ready(function() {
	$('#previous').click(function(){
		window.location = "/Association";
	});
	$('#next').click(function(){
		window.location = "/Work";
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
