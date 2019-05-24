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
var parentId = '';

var searchCache = [];
var association = [];
var work = [];

function cleanSearchOutput(table){
	var length = table.rows.length;
	for (var i = length-1; i >=2 ; --i) {
		table.deleteRow(i);
	} 	
}

function handleChangeRadioButton(){
	
	var radios = document.getElementsByName("group1");
	var table = document.getElementById("tableResult");
	var pos,row,cellFullName;
    for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 pos = i;
        	 row = table.rows[i+2];
        	 cellFullName = row.cells[2];
        	 break;
         }
    }
    alert("Usuário "+cellFullName.innerHTML+" carregado para alterações.");
    populateData(searchCache.docs[pos]);
	var $userData = $('.userData');
	var $output = $('.outputGeneral');
	var $newRecordButton = $('.newRecord');
	$('#create').prop("disabled",true).css('opacity',0.5);
	$('#update').prop("disabled",false).css('opacity',1.0);
	$('#cleanFields').prop("disabled",false).css('opacity',1.0);
	$userData.show();
	$output.hide();
	$newRecordButton.hide();
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
	if ($.trim($('#fullName').val()) === '' && $.trim($('#cpf').val()) === '' )  
	{
		return 0;
	}
	else{
		if ($.trim($('#fullName').val()) != ''){
			return 1;
		}
		if  ($.trim($('#cpf').val()) != ''){
			return 2;
		}
	}
	
	return -1;
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

function populateAssociationData(association){
	$('#associationType').val(association.associationType);
	var date =association.proposeDate.split("-");
	$('#initAssociationDay').val(date[0]);
	$('#initAssociationMonth').val(date[1]);
	$('#initAssociationYear').val(date[2]);
	date = association.exitDate.split("-");
	$('#exitAssociationDay').val(date[0]);
	$('#exitAssociationMonth').val(date[1]);
	$('#exitAssociationYear').val(date[2]);			
	$('#contribution').val(association.contribution);
	$('#notesAssociation').val(association.notes);	
}

function buildAssociationRowTable(data){
	 
    var table = document.getElementById("tableResultAssociation");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML= '<input type="radio" name="group1" onchange="handleChangeRadioButtonAssociation();">';
    row.insertCell(1).innerHTML= data.associationType;
    row.insertCell(2).innerHTML= data.initDate;
    row.insertCell(3).innerHTML= data.exitDate;
    row.insertCell(4).innerHTML= data.contribution;
    row.insertCell(5).innerHTML= data.notes;
  
}

function populateData(person){
	$('#userID').val(person.userID);
	$('#fullNameInput').val(person.firstName+ " "+person.middleName+" "+person.lastName);
	$('#rg').val(person.rg);
	$('#rgExp').val(person.rgExp);
	$('#rgState').val(person.rgState);
	$('#cpfInput').val(person.cpf);
	var date = person.birthDate.split("-");
	$('#day').val(date[0]);
	$('#month').val(date[1]);
	$('#year').val(date[2]);
	$('#address').val(person.address);
	$('#number').val(person.number);
	$('#complement').val(person.complement);
	$('#neighborhood').val(person.neighborhood);
	$('#city').val(person.city);
	$('#state').val(person.state);
	var postCode = person.postCode.split("-");
	$('#postCode-1').val(postCode[0]);
	$('#postCode-2').val(postCode[1]);

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
	
	console.log(JSON.stringify(person));
	
	if (typeof(person.association)!='undefined'){
	
		for(var i=person.association.length-1;i>=0;--i){
			if (i===person.association.length-1){
				populateAssociationData(person.association[i]);
			}
			buildAssociationRowTable(person.association[i]);
		}
		var radios = document.getElementsByName("groupAssociation");
		if (radios.length > 0){
			radios[0].checked = true;
		}
	}
	if (typeof(person.work)!='undefined'){
		for(var i=person.work.length-1;i>=0;--i){
			if (i===person.work.length-1){
				populateWorkData(person.work[i]);
			}
			buildWorkRowTable(person.work[i]);
		}
		var radios = document.getElementsByName("groupWork");
		if (radios.length > 0){
			radios[0].checked = true;
		}
	}
}

function validateFieldsWork(callback){
	
	if ($('#workType').val() === "No Selection"){
		return callback(false,"Selecione um tipo de Atividade voluntária");
	}
	if ($('#weekDayWork').val() === "No Selection"){
		return callback(false,"Selecione o dia da semana da atividade voluntária");
	}
	if ($('#periodWork').val() === "No Selection"){
		return callback(false,"Selecione o período da Atividade voluntária");
	}

	if ($.trim($('#initWorkDay').val()) === '' || $.trim($('#initWorkMonth').val()) === '' || $.trim($('#initWorkYear').val())==='')  
	{
		return callback(false,"Preencha o campo data inicial corretamente dd-MM-YYYY");
	}	
	
	
	return callback(true,"");
}


function populateWorkData(work){
	   
	$('#workType').val(work.workType);
	$('#dayWeekWork').val(work.dayWeek);
	$('#periodWork').val(work.period);
	var initDate =  work.initDate.split("-");
	$('#initWorkDay').val(initDate[0]);
	$('#initWorkMonth').val(initDate[1]);
	$('#initWorkYear').val(initDate[2]);
	var finalDate =  work.finalDate.split("-");
	$('#finalWorkDay').val(finalDate[0]);
	$('#finalWorkMonth').val(finalDate[1]);
	$('#finalWorkYear').val(finalDate[2]);
	$('#notes').val(work.notes);	
}


function buildWorkRowTable(data){
	 
    var table = document.getElementById("tableResultWork");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML= '<input type="radio" name="groupWork" onchange="handleChangeRadioButtonWork();">';
    row.insertCell(1).innerHTML= data.workType;
    row.insertCell(2).innerHTML= data.weekDay;
    row.insertCell(3).innerHTML= data.period;
    row.insertCell(4).innerHTML= data.initDate;
    row.insertCell(5).innerHTML= data.finalDate;
    row.insertCell(6).innerHTML= data.notes;  
}


function handleChangeRadioButtonWork(){
	
	var radios = document.getElementsByName("groupWork");
	var table = document.getElementById("tableResultWork");
	var row;
    for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 row = table.rows[i+2];         	 
        	 break;
         }
    }

    var work = {};
    work["workType"] = row.cells[1].innerHTML;
    work["dayWeek"] = row.cells[2].innerHTML;
    work["period"] = row.cells[3].innerHTML; 
    work["initDate"] = row.cells[4].innerHTML;
    work["finalDate"] = row.cells[5].innerHTML;
    work["notes"] = row.cells[6].innerHTML;
    
    console.log(JSON.stringify(work));
    populateWorkData(work);
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



function validateFieldsForGeneral(callback){
	if ($.trim($('#fullName').val()) === '' || $.trim($('#rg').val()) === '' || $.trim($('#rgExp').val()) === '' ||
		 $.trim($('#day').val()) === '' || $.trim($('#month').val()) === '' || $.trim($('#year').val()) === '' || 
			$.trim($('#address').val()) === '' || $.trim($('#number').val()) === '' || 
			  $.trim($('#complement').val()) === '' || $.trim($('#neighborhood').val()) === '' ||
				   $.trim($('#neighborhood').val()) === '' || $.trim($('#postCode-1').val()) === ''-1 ||
				   $.trim($('#postCode-2').val()) === '')  
	{
		return callback(false,"");
	}	
	
	var res = $.trim($('#fullName')).split(" ");
	if (res.length ===1){
		return callback(false,"Nome do participante precisa estar completo");
	}
	
	var rg_state = document.getElementById("rgState");
	var state = document.getElementById("state");
	
	if (rg_state.selectedIndex === 0 || state.selectedIndex === 0 ){

		return callback(false,"");
	}

	return callback(true,"");
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

function handleChangeRadioButtonAssociation(){
	
	var radios = document.getElementsByName("groupAssociation");
	var table = document.getElementById("tableResultAssociation");
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
    association["exitDate"] = row.cells[3].innerHTML;
    association["contribution"] = row.cells[4].innerHTML;
    association["notes"] = row.cells[5].innerHTML;
    
    console.log(JSON.stringify(association));
    populateAssociationData(association);
}

function buildAssociationRowTable(data){
	 
    var table = document.getElementById("tableResultAssociation");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML= '<input type="radio" name="groupAssociation" onchange="handleChangeRadioButtonAssociation();">';
    row.insertCell(1).innerHTML= data.associationType;
    row.insertCell(2).innerHTML= data.initDate;
    row.insertCell(3).innerHTML= data.exitDate;
    row.insertCell(4).innerHTML= data.contribution;
    row.insertCell(5).innerHTML= data.notes;  
}


function validateFieldsForAssociation(callback){

	var associationType = $('#associationType').val();
	if (associationType == "No Selection"){
		return callback(false,"Insira um tipo de associação ao CEAI");
	}
	
	if ($.trim($('#initAssociationDay').val()) === '' || $.trim($('#initAssociationMonth').val()) === '' || $.trim($('#initAssociationYear').val())==='')  
	{
		return callback(false,"Preencha o campo de início da associação corretamente no formato dia/mes/ano");
	}
	
	if (associationType == "Efetivo" || associationType == "Colaborador" ){
		if ($('#contribution').val() == ""){
			return callback(false,"Insira por favor o valor de sua contribuicão mensal");
		}	
	}
	
	return callback(true,"");
}

function updateAssociation(){
	var $output = $('.outputAssociation'),
	$process = $('.processingAssociation');	
	validateFieldsForAssociation(function(valid,response){
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
			var radios = document.getElementsByName("groupAssociation");
			var table = document.getElementById("tableResultAssociation");
			var row;
			var index=-1;
		    for (var i = 0, len = radios.length; i < len; i++) {
		         if (radios[i].checked) {
		        	 row = table.rows[i+2];         	 
		        	 index = i;
		        	 break;
		         }
		    }
		    if (index != -1){
			    var associationItem = association[index];
				var associationType = document.getElementById("associationType");
			    row.cells[1].innerHTML = associationType.options[associationType.selectedIndex].value;
			    associationItem["associationType"] = associationType.options[associationType.selectedIndex].value;
			    row.cells[2].innerHTML = $.trim($('#initAssociationDay').val()) + '-' + $.trim($('#initAssociationMonth').val()) + '-' + $.trim($('#initAssociationYear').val());
			    associationItem["initDate"] = $.trim($('#initAssociationDay').val()) + '-' + $.trim($('#initAssociationMonth').val()) + '-' + $.trim($('#initAssociationYear').val());
			    if ($.trim($('#exitAssociationDay').val())!==''){
			    	row.cells[3].innerHTML = $.trim($('#exitAssociationDay').val()) + '-' + $.trim($('#exitAssociationMonth').val()) + '-' + $.trim($('#exitAssociationYear').val());
			    	associationItem["exitDate"] = $.trim($('#exitAssociationDay').val()) + '-' + $.trim($('#exitAssociationMonth').val()) + '-' + $.trim($('#exitAssociationYear').val());
			    }
			    else{
			    	row.cells[3].innerHTML = '';
			    	associationItem["exitDate"] = '';
			    }
			    row.cells[4].innerHTML = $.trim($('#contribution').val());
			    associationItem["contribution"] = $.trim($('#contribution').val());
			    row.cells[5].innerHTML = $.trim($('#notes').val());
			    associationItem["notes"] = $('#notesAssociation').val();
			    association[index] = associationItem;
		    }
			$process.hide();
			$output.show();
		}	
	}); 	
}

function insertAssociation(){
	var $output = $('.outputAssociation'),
	$process = $('.processingAssociation');		
	validateFieldsForAssociation(function(valid,response){
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
			var associationItem = {};
			associationItem["associationType"] = associationType.options[associationType.selectedIndex].value;
			associationItem["initDate"] = $.trim($('#initAssociationDay').val()) + '-' + $.trim($('#initAssociationMonth').val()) + '-' + $.trim($('#initAssociationYear').val());
		    if ($.trim($('#exitAssociationDay').val())!==''){
		    	associationItem["exitDate"] = $.trim($('#exitAssociationDay').val()) + '-' + $.trim($('#exitAssociationMonth').val()) + '-' + $.trim($('#exitAssociationYear').val());
		    }
		    else{
		    	associationItem["exitDate"] = "";
		    }
		    associationItem["contribution"] = $.trim($('#contribution').val());
		    associationItem["notes"] = $('#notesAssociation').val();
		    association.push(associationItem);
		    buildAssociationRowTable(associationItem);
			var radios = document.getElementsByName("groupAssociation");
			radios[radios.length-1].checked = "true";
			$process.hide();
			$output.show();
		}	
	});	
}

function cleanUpAssociationFields(){
	var associationType = document.getElementById("associationType");
	associationType.selectedIndex = 0;
	$('#initAssociationDay').val('');
	$('#initAssociationMonth').val('');
	$('#initAssociationYear').val('');
    $('#exitAssociationDay').val('');
    $('#exitAssociationMonth').val('');
    $('#exitAssociationYear').val('')
    $('#contribution').val('');
    $('#notesAssociation').val('');
}

function cleanUpWorkFields(){
	
	var workType = document.getElementById("workType");
	var weekDay = document.getElementById("weekDayWork");
	var period = document.getElementById("periodWork");
	workType.selectedIndex = 0;
	weekDay.selectedIndex = 0;
	period.selectedIndex = 0;
	$('#initWorkDay').val('');
	$('#initWorkMonth').val('');
	$('#initWorkYear').val('');
    $('#finalWorkDay').val('');
    $('#finalWorkDay').val('');
    $('#finalWorkMonth').val('');
    $('#finalWorkYear').val('');
    $('#notesWork').val('');
}

function cleanUpGeneralFields(){
	$('#userID').val('');
	$('#fullNameInput').val('');
	$('#rg').val('');
	$('#rgExp').val('');
	$('#rgState').val('');
	$('#cpfInput').val('');
	$('#day').val('');
	$('#month').val('');
	$('#year').val('');
	$('#address').val('');
	$('#number').val('');
	$('#complement').val('');
	$('#neighborhood').val('');
	$('#city').val('');
	$('#state').val('');
	$('#postCode-1').val('');
	$('#postCode-2').val('');
}

function removeAssociation(){
	
	var $output = $('.outputAssociation'),
	$process = $('.processingAssociation');	
	
	$process.show();
	$output.hide();
	
	var radios = document.getElementsByName("groupAssociation");
	var table = document.getElementById("tableResultAssociation");
	var rowIndex=-1;
    for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 rowIndex = i+2;
         }
    }
    
    if (rowIndex != -1){
    
	    table.deleteRow(rowIndex);
	    association.splice(rowIndex-2, 1);
	    
	    if (table.rows.length > 2){
	    	radios[0].checked = "true";
	    }	

    }
    $process.hide();
	$output.show();
}

function cleanupAllFields(){
	cleanUpGeneralFields();
	cleanUpAssociationFields();
	cleanUpWorkFields();
	cleanSearchOutput(document.getElementById("tableResultAssociation"));
	cleanSearchOutput(document.getElementById("tableResultWork"));
	cleanSearchOutput(document.getElementById("tableResultStudy"));
}

function removeWork(){
	
	var $output = $('.outputWork'),
	$process = $('.processingWork');
	
	$process.show();
	$output.hide();
	
	var radios = document.getElementsByName("groupWork");
	var table = document.getElementById("tableResultWork");
	var rowIndex=-1;
    for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 rowIndex = i+2;
         }
    }
    if (rowIndex != -1){
	    table.deleteRow(rowIndex);
	    work.splice(rowIndex-2, 1);
	           
	    if (table.rows.length > 2){
	    	radios[0].checked = "true";
	    }

    }
    
    $process.hide();
	$output.show()
}



function updateWork(){
	//alert('Insert Button'); 
	var $output = $('.outputWork'),
	$process = $('.processingWork');	
	validateFieldsWork(function(valid,response){
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
			var radios = document.getElementsByName("groupWork");
			var table = document.getElementById("tableResultWork");
			var row;
			var index=-1;
		    for (var i = 0, len = radios.length; i < len; i++) {
		         if (radios[i].checked) {
		        	 row = table.rows[i+2];         	 
		        	 index = i;
		        	 break;
		         }
		    }
		    if (index != -1){
			    var workType = document.getElementById("workType");
				var weekDay = document.getElementById("weekDayWork");
				var period = document.getElementById("periodWork");
				var workItem = {};
				row.cells[1].innerHTML = workType.options[workType.selectedIndex].value;
			    workItem.workType = workType.options[workType.selectedIndex].value;
			    row.cells[2].innerHTML = weekDay.options[weekDay.selectedIndex].value;
			    workItem.weekDay = weekDay.options[weekDay.selectedIndex].value
			    row.cells[3].innerHTML = period.options[period.selectedIndex].value;
			    workItem.period = period.options[period.selectedIndex].value;
			    row.cells[4].innerHTML = $.trim($('#initWorkDay').val()) + '-' + $.trim($('#initWorkMonth').val()) + '-' + $.trim($('#initWorkYear').val());
			    workItem.initDate = $.trim($('#initWorkDay').val()) + '-' + $.trim($('#initWorkMonth').val()) + '-' + $.trim($('#initWorkYear').val());
			    if ($.trim($('#finalWorkDay').val())!==''){
			    	row.cells[5].innerHTML = $.trim($('#finalWorkDay').val()) + '-' + $.trim($('#finalWorkMonth').val()) + '-' + $.trim($('#finalWorkYear').val());
			    	workItem.finalDate =  $.trim($('#finalWorkDay').val()) + '-' + $.trim($('#finalWorkMonth').val()) + '-' + $.trim($('#finalWorkYear').val());
			    }
			    else{
			    	row.cells[5].innerHTML = '';
			    	workItem.finalDate =  '';
			    }
			    row.cells[6].innerHTML = $.trim($('#notesWork').val());
			    workItem.notes = $.trim($('#notesWork').val());
			    work[index] = workItem;
		    }
			    
		    $process.hide();
			$output.show();	
		}	
	}); 	
}

function insertWork(){
	
	//alert('Insert Button'); 
	var $output = $('.outputWork'),
	$process = $('.processingWork');	
	validateFieldsWork(function(valid,response){
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
			var workType = document.getElementById("workType");
			var weekDay = document.getElementById("weekDayWork");
			var period = document.getElementById("periodWork");
			var workItem = {};
			workItem.workType = workType.options[workType.selectedIndex].value;
			workItem.weekDay = weekDay.options[weekDay.selectedIndex].value
			workItem.period = period.options[period.selectedIndex].value;
			workItem.initDate = $.trim($('#initWorkDay').val()) + '-' + $.trim($('#initWorkMonth').val()) + '-' + $.trim($('#initWorkYear').val());
		    if ($.trim($('#finalWorkDay').val())!==''){
		    	workItem.finalDate = $.trim($('#finalWorkDay').val()) + '-' + $.trim($('#finalWorkMonth').val()) + '-' + $.trim($('#finalWorkYear').val());
		    }
		    else{
		    	workItem.finalDate = "";
		    }
		    workItem.notes = $.trim($('#notesWork').val());
			work.push(workItem)
		    buildWorkRowTable(workItem);
			var radios = document.getElementsByName("groupWork");
			radios[radios.length-1].checked = "true";
			$process.hide();
			$output.show();
		}	
	}); 	
	
}

function newRecord(){
	$('#create').prop("disabled",false).css('opacity',1.0);
	$('#update').prop("disabled",true).css('opacity',0.5);
	var $userData = $('.userData');
	var $output = $('.outputGeneral');
	var $message = $('.messageSearchPanel')
	cleanupAllFields();
	$userData.show();
	$output.hide();
	$message.hide();	
}

$(document).ready(function() {
	  $('#newRegister').click(function(){
		  newRecord();
	  });	
	  $('#search').click(function(){
		//alert('Search Button'); 
		var $output = $('.outputGeneral'),
		$message = $('.messageSearchPanel'),
		$process = $('.processingSearch'),	
		$userData = $('.userData');
		var validate = validateFields();
		if (validate==0){	
			alert('Favor preencher um nome para pesquisar, pode ser o primeiro nome ou nome completo ou coloque o CPF');
			return;
		}	
		$process.show();
		$userData.hide();
		cleanSearchOutput(document.getElementById("tableResult"));
		cleanupAllFields();
	  	$output.hide();
	  	$message.hide();
	  	if (validate == 1){
	  	
		  	var respNames = "";		
		  	splitFullName($.trim($('#fullName').val()),function(response){
				respNames = response;
			});
		  	
		  	var inputSearch = '{'
		  		+'"type" : "register",'
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
		        	data = JSON.parse(data);
		            $process.hide();
		        	if (typeof(data.message)=='undefined'){
		            	buildSearhOutput(data);
		            	searchCache = data;
		            	$output.show(); 
		        	}
		        	else{
		        		$('#messageSearch').text('Pesquisa por participante '+$.trim($('#fullName').val())+' não econtrou dados');
		        		$message.show(); 
		        		var $newRecordButton = $('.newRecord');
		         		$newRecordButton.show();
		        	}        
		        },
		        error: function(jqXHR, textStatus, errorThrown){
		        	$('#messageSearch').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
		        	//alert('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
		        	 $process.hide();
		        	 $message.show(); 
		        }
		      });
	  	}
	  	else{
			var input = '{'
				+'"cpf" : "'+$.trim($('#cpf').val())+'"}';

			console.log(JSON.stringify(input));

			$.ajax({
				url: '/services/ceai/searchCPF',
				type: 'POST',
				data: input,
				contentType: "application/json",
				success: function(response, textStatus, jqXHR){
						$process.hide();
						if (response.message == 'NOT FOUND'){
			        		$('#messageSearch').text('Pesquisa por participante '+$.trim($('#cpf').val())+' não econtrou dados');
			        		$message.show(); 
			        		var $newRecordButton = $('.newRecord');
			         		$newRecordButton.show();
						}
						else{
			            	buildSearhOutput(response.data);
			            	searchCache = response.data;
			            	$output.show(); 
						}
				},
				error: function(jqXHR, textStatus, errorThrown){
					$('#messageSearch').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
					//alert('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
					$process.hide();
					$output.show(); 
				}
			});
	  	}
	});
	$("#parentCpf").focusout(function(){
		var val = $.trim($('#cpf').val());
		if (val!==''){
			var isnum = /^\d+$/.test(val);
			if (!isnum){
				alert("Coloque somente números sem separadores");
				$('#cpf').val("");
			}
		}
	});
	$( "#parentCpf" ).keypress(function() {
		var val = $.trim($('#cpf').val());
		if (val!==''){
			var isnum = /^\d+$/.test(val);
			if (!isnum){
				alert("Coloque somente números sem separadores");
				$('#cpf').val("");
			}
		}
	});	
	$("#cpf").focusout(function(){
		var val = $.trim($('#cpf').val());
		if (val!==''){
			var isnum = /^\d+$/.test(val);
			if (!isnum){
				alert("Coloque somente números sem separadores");
				$('#cpf').val("");
			}
		}
	});
	$( "#cpf" ).keypress(function() {
		var val = $.trim($('#cpf').val());
		if (val!==''){
			var isnum = /^\d+$/.test(val);
			if (!isnum){
				alert("Coloque somente números sem separadores");
				$('#cpf').val("");
			}
		}
	});	
	$('#previous').click(function(){
		window.location = "/home";
	});
	$('#next').click(function(){
		window.location = "/Contact";
	});
	$('#update').click(function(){
		//alert('Insert Button'); 
		var $output = $('.output'),
		$process = $('.processing');	
		validateFieldsForGeneral(function(valid,response){
			if (valid === false){
				if (response !== "")
					alert(response);
				else
					alert('Preencha todos os campos !');				
			}
			else{
				$process.show();
				$output.hide();
				var rg_state = document.getElementById("rgState");
				var state = document.getElementById("state");
				var respNames = "";
				splitFullName($.trim($('#fullName').val()),function(response){
					respNames = response;
				});
				
				//+'"confidential" : "'+confidential.options[confidential.selectedIndex].value+'",'
				var updateGeneral = '{'
					+'"type" : "general",'
					+'"userID" : "'+$.trim($('#userID').val())+'",'
					+'"firstName" : "'+$.trim(respNames.firstName)+'",'
					+'"middleName" : "'+$.trim(respNames.middleName)+'",'
					+'"lastName" : "'+$.trim(respNames.lastName)+'",'
					+'"cpf" : "'+$.trim($('#cpf').val())+'",'
					+'"rg" : "'+$.trim($('#rg').val())+'",'
					+'"rgExp" : "'+$.trim($('#rgExp').val())+'",'
					+'"rgState" : "'+rg_state.options[rg_state.selectedIndex].value+'",'
					+'"birthDate" : "'+$.trim($('#day').val())+'-'+$.trim($('#month').val())+'-'+$.trim($('#year').val())+'",'
					+'"address" : "'+$.trim($('#address').val())+'",'
					+'"number" : "'+$.trim($('#number').val())+'",'
					+'"complement" : "'+$.trim($('#complement').val())+'",'
					+'"neighborhood" : "'+$.trim($('#neighborhood').val())+'",'
					+'"city" : "'+$.trim($('#city').val())+'",'
					+'"state" : "'+state.options[state.selectedIndex].value+'",'
					+'"postCode" : "'+$.trim($('#postCode-1').val())+'-'+$.trim($('#postCode-2').val())+'"}';

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
	});		
	$('#insert').click(function(){
		//alert('Insert Button'); 
		var $output = $('.output'),
		$process = $('.processing');	
		validateFieldsForGeneral(function(valid,response){
			if (valid === false){
				if (response !== "")
					alert(response);
				else
					alert('Preencha todos os campos !');				
			}
			else{
				$process.show();
				$output.hide();
				var rg_state = document.getElementById("rgState");
				var state = document.getElementById("state");
				var respNames = "";
				splitFullName($.trim($('#fullName').val()),function(response){
					respNames = response;
				});
				
				//+'"confidential" : "'+confidential.options[confidential.selectedIndex].value+'",'
				var inputGeneral = '{'
					+'"userID" : "'+getCustomerID()+'",'
					+'"firstName" : "'+$.trim(respNames.firstName)+'",'
					+'"middleName" : "'+$.trim(respNames.middleName)+'",'
					+'"lastName" : "'+$.trim(respNames.lastName)+'",'
					+'"cpf" : "'+$.trim($('#cpf').val())+'",'
					+'"rg" : "'+$.trim($('#rg').val())+'",'
					+'"rgExp" : "'+$.trim($('#rgExp').val())+'",'
					+'"rgState" : "'+rg_state.options[rg_state.selectedIndex].value+'",'
					+'"birthDate" : "'+$.trim($('#day').val())+'-'+$.trim($('#month').val())+'-'+$.trim($('#year').val())+'",'
					+'"address" : "'+$.trim($('#address').val())+'",'
					+'"number" : "'+$.trim($('#number').val())+'",'
					+'"complement" : "'+$.trim($('#complement').val())+'",'
					+'"neighborhood" : "'+$.trim($('#neighborhood').val())+'",'
					+'"city" : "'+$.trim($('#city').val())+'",'
					+'"state" : "'+state.options[state.selectedIndex].value+'",'
					+'"parentId" : "'+parentId+'",'
					+'"postCode" : "'+$.trim($('#postCode-1').val())+'-'+$.trim($('#postCode-2').val())+'"}';

				console.log(JSON.stringify(inputGeneral));

				$.ajax({
					url: '/services/ceai/inputGeneral',
					type: 'POST',
					data: inputGeneral,
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
	});	
	$('#cleanFields').click(function(){
		newRecord();
	});
	$('#searchParent').click(function(){
		//alert('Insert Button'); 
		var $output = $('.output'),
		$process = $('.processing');	
		if ($.trim($('#parentCpf').val()) === ''){
			alert('Preencha o campo Parentesco CPF com o CPF do pai ou da Mãe antes de pesquisar! Esta pesquisa é somente necessária quando o participante é menor');
		}		
		else{
			$process.show();
			$output.hide();
			var inputParent = '{'
				+'"cpf" : "'+$.trim($('#parentCpf').val())+'"}';

			console.log(JSON.stringify(inputParent));

			$.ajax({
				url: '/services/ceai/searchCPF',
				type: 'POST',
				data: inputParent,
				contentType: "application/json",
				success: function(response, textStatus, jqXHR){
						console.log(response);
						if (response.message =='NOT FOUND'){
							$('#results').text("Responsável com o CPF: "+$.trim($('#parentCpf').val())+" não foi encontrado");
						}
						else{
							response.data = response.data.docs[0];
							$('#parentName').val(response.data.firstName+" "+response.data.middleName+" "+response.data.lastName);
							$('#results').text("Responsável Encontrado !");
						}
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
	$('#updateAssociation').click(function(){
		updateAssociation();
	});		
	$('#insertAssociation').click(function(){
		insertAssociation();
	});	
	$('#deleteAssociation').click(function(){
		removeAssociation();
	});	
	$('#associationType').change(function(){
		
		var associationType = $('#associationType').val();
		if (associationType == "Assistido" || associationType == "Participante" || associationType == "Inativo" ){
			$('#contribution').val('ISENTO');
			$('#contribution').prop("disabled",true);
		}
		else{
			$('#contribution').val('');
			$('#contribution').prop("disabled",false);
		}
	});
	$('#updateWork').click(function(){
		updateWork();
	});		
	$('#insertWork').click(function(){
		insertWork();
	});	
	$('#deleteWork').click(function(){
		removeWork();
	});	
});
