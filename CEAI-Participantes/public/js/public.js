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
var cachedPosition;
var association = [];
var work = [];
var study = [];

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
    cachedPosition = pos;
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

function validateFieldsSearch(){
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
	var date = '';
	if (typeof(association.initDate)!=='undefined'){
		var date =association.initDate.split("-");
		$('#initAssociationDay').val(date[0]);
		$('#initAssociationMonth').val(date[1]);
		$('#initAssociationYear').val(date[2]);
	}
	date = association.exitDate.split("-");
	if (typeof(association.initDate)!=='undefined'){
		$('#exitAssociationDay').val(date[0]);
		$('#exitAssociationMonth').val(date[1]);
		$('#exitAssociationYear').val(date[2]);			
		$('#contribution').val(association.contribution);
		$('#notesAssociation').val(association.notes);
	}
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
	if (typeof(person.postCode)!=='undefined'){
		var postCode = person.postCode.split("-");
		$('#postCode-1').val(postCode[0]);
		$('#postCode-2').val(postCode[1]);
	}
	$('#parentCpf').val(person.parentCpf);
	$('#parentName').val(person.parentName);
	$('#habilities').val(person.habilities);
	$('#notesHabilities').val(person.habilitiesNotes);
		
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
	if (person.whatsup2 !== ""){
		$('#whatsup2').val(person.whatsup2);
	}
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
	if (typeof(person.study)!='undefined'){	
		for(var i=person.study.length-1;i>=0;--i){
			if (i===person.study.length-1){
				populateStudyData(person.study[i]);
			}
			buildStudyRowTable(person.study[i]);
		}
		var radios = document.getElementsByName("groupStudy");
		if (radios.length > 0){
			radios[0].checked = true;
		}
	}
}


function populateWorkData(work){
	   
	$('#workType').val(work.workType);
	$('#weekDayWork').val(work.weekDay);
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
	if ($.trim($('#fullName').val()) === ''){
		return callback(false,"Insira o nome completo do participante");
	}  
	
	var res = $.trim($('#fullName')).split(" ");
	if (res.length ===1){
		return callback(false,"Nome do participante precisa estar completo");
	}
	
	if ($.trim($('#day').val()) === '' || $.trim($('#month').val()) === '' || $.trim($('#year').val()) === ''){
		return callback(false,"Preencha a data de nascimento completa");
	} 
	
	if ($.trim($('#address').val()) === ''){
		return callback(false,"Preencha o endereço, colocando o número, bairro e cidade nos campos específicos");
	}
	if ($.trim($('#number').val()) === ''){
		return callback(false,"Preencha o número do seu endereço");
	}
	if ($.trim($('#neighborhood').val()) === ''){
		return callback(false,"Preencha o bairro onde mora");
	} 
	if ($.trim($('#city').val()) === ''){
		return callback(false,"Preencha a cidade onde mora");
	} 
	var state = document.getElementById("state");
	
	if (state.selectedIndex === 0 ){

		return callback(false,"Preencha a cidade onde mora");
	}
	
	var rg_state = document.getElementById("rgState");
	
	if ($.trim($('#postCode-1').val()) === '' || $.trim($('#postCode-2').val()) === '')  
	{
		return callback(false,"Coloque a caixa postal nos campos específicos exemplo CEP: 82315-340 (campo 1:82315) (campo 2:340)");
	}	
	
	if (($.trim($('#rg').val()) === '' || $.trim($('#rgExp').val()) === '' || rg_state.selectedIndex === 0) && $.trim($('#cpfInput').val()) === '' && $.trim($('#parentCpf').val()) === ''){
		return callback(false,"Se for maior de idade coloque CPF ou RG (Numero, Orgão Expeditor, Estado do RG), se for menor colocar o CPF do pai ou da mãe e o nome, pode-se usar o botão pesquisar para prenchar automaticamente");
	}
	
	return callback(true,"");
}

function validateFieldsContact(callback){
	if ($.trim($('#phone1').val()) === '')  
	{
		return callback(false,"Pelo menos o campo telefone 1 precisa ser preenchido");
	}	
	
	var whatsup1 = document.getElementById("whatsup1");
	
	if (whatsup1.selectedIndex === 0){

		return callback(false,"Selecione se o telefone 1 tem whatsup ou não");
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
	
	var min=1000; 
    var max=9999;  
    var padding = Math.floor(Math.random() * (+max - +min) + +min); 
	
	return  currentdate.getFullYear() 
					+ "-" + (currentdate.getMonth()+1) 
					+ "-" + currentdate.getDate()					 
					+ "-" + currentdate.getHours()  
	                + "-" + currentdate.getMinutes() 
	                + "-" + currentdate.getSeconds()
	                + "-" + padding;
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
    $('#finalWorkMonth').val('');
    $('#finalWorkYear').val('');
    $('#notesWork').val('');
}

function cleanUpStudyFields(){
	
	var workType = document.getElementById("studyType");
	var weekDay = document.getElementById("weekDayStudy");
	var period = document.getElementById("periodStudy");
	workType.selectedIndex = 0;
	weekDay.selectedIndex = 0;
	period.selectedIndex = 0;
	$('#initStudyDay').val('');
	$('#initStudyMonth').val('');
	$('#initStudyYear').val('');
    $('#finalStudyDay').val('');
    $('#finalStudyMonth').val('');
    $('#finalStudyYear').val('');
    $('#notesStudy').val('');
}

function cleanUpContactFields(){
	$('#ddd1').val('');
	$('#phone1').val('');
	$('#whatsup1').val("No Selection");
	$('#ddd2').val('');
	$('#phone2').val('');
	$('#whatsup2').val("No Selection");
	$('#email1').val('');
	$('#email2').val('');
}

function cleanUpHabilitiesFields(){
	$('#habilities').val('');
	$('#habilitiesNotes').val('');
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

function cleanupAllFields(){
	cleanUpGeneralFields();
	cleanUpAssociationFields();
	cleanUpWorkFields();
	cleanUpStudyFields();
	cleanUpContactFields();
	cleanUpHabilitiesFields();
	cleanSearchOutput(document.getElementById("tableResultAssociation"));
	cleanSearchOutput(document.getElementById("tableResultWork"));
	cleanSearchOutput(document.getElementById("tableResultStudy"));
}

function populateStudyData(study){
	   
	$('#studyType').val(study.studyType);
	$('#weekDayStudy').val(study.weekDay);
	$('#periodStudy').val(study.period);
	var initDate =  study.initDate.split("-");
	$('#initStudyDay').val(initDate[0]);
	$('#initStudyMonth').val(initDate[1]);
	$('#initStudyYear').val(initDate[2]);
	var finalDate =  study.finalDate.split("-");
	$('#finalStudyDay').val(finalDate[0]);
	$('#finalStudyMonth').val(finalDate[1]);
	$('#finalStudyYear').val(finalDate[2]);
	$('#notesStudy').val(study.notes);	
}

function handleChangeRadioButtonStudy(){
	
	var radios = document.getElementsByName("groupStudy");
	var table = document.getElementById("tableResultStudy");
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
	 
    var table = document.getElementById("tableResultStudy");

    var rowCount = table.rows.length;
    var row = table.insertRow(rowCount);

    row.insertCell(0).innerHTML= '<input type="radio" name="groupStudy" onchange="handleChangeRadioButtonStudy();">';
    row.insertCell(1).innerHTML= data.studyType;
    row.insertCell(2).innerHTML= data.weekDay;
    row.insertCell(3).innerHTML= data.period;
    row.insertCell(4).innerHTML= data.initDate;
    row.insertCell(5).innerHTML= data.finalDate;
    row.insertCell(6).innerHTML= data.notes;  
}

function createOrUpdate(type){
	//alert('Insert Button'); 
	var $output = $('.outputCreateOrUpdate'),
	$process = $('.outputCreateOrUpdate');	
	validateFieldsForGeneral(function(validGeneral,response){
		if (validGeneral === false){
			if (response !== "")
				alert(response);
			else
				alert('Preencha os campos requiridos para os dados pessoais !');				
		}
		else{
			validateFieldsContact(function(validContact,response){
				
				if (validContact === false){
					if (response !== "")
						alert(response);
					else
						alert('Preencha os campos requiridos para os dados de contato !');				
				}
				else{					
					$process.show();
					$output.hide();
					var state = document.getElementById("state");
					var respNames = "";
					splitFullName($.trim($('#fullNameInput').val()),function(response){
						respNames = response;
						console.log("Full Name to be updated",JSON.stringify(respNames));
					});
					var userId,_id,_rev;
					if (type === "insert"){
						userId = getCustomerID();
						_id = '';
						_rev = '';
					}
					else{
						userId = $.trim($('#userID').val());
						_id = searchCache.docs[cachedPosition]._id;
						_rev = searchCache.docs[cachedPosition]._rev;
					}
					
					var input = '{'
						+'"operation" : "'+type+'",'
						+'"type" : "public",'
						+'"_id" : "'+_id+'",'
						+'"_rev" : "'+_rev+'",'
						+'"userID" : "'+userId+'",'
						+'"firstName" : "'+$.trim(respNames.firstName)+'",'
						+'"middleName" : "'+$.trim(respNames.middleName)+'",'
						+'"lastName" : "'+$.trim(respNames.lastName)+'",'
						+'"cpf" : "'+$.trim($('#cpfInput').val())+'",'
						+'"rg" : "'+$.trim($('#rg').val())+'",'
						+'"rgExp" : "'+$.trim($('#rgExp').val())+'",'
						+'"rgState" : "'+$.trim($('#rgState').val())+'",'
						+'"birthDate" : "'+$.trim($('#day').val())+'-'+$.trim($('#month').val())+'-'+$.trim($('#year').val())+'",'
						+'"address" : "'+$.trim($('#address').val())+'",'
						+'"number" : "'+$.trim($('#number').val())+'",'
						+'"complement" : "'+$.trim($('#complement').val())+'",'
						+'"neighborhood" : "'+$.trim($('#neighborhood').val())+'",'
						+'"city" : "'+$.trim($('#city').val())+'",'
						+'"state" : "'+state.options[state.selectedIndex].value+'",'
						+'"postCode" : "'+$.trim($('#postCode-1').val())+'-'+$.trim($('#postCode-2').val())+'",'
						+'"parentCpf" : "'+$.trim($('#parentCpf').val())+'",'
						+'"parentName" : "'+$.trim($('#parentName').val())+'",'
						+'"lastName" : "'+$.trim(respNames.lastName)+'",'
						+'"phone1" : "'+$.trim($('#ddd1').val())+"-"+$.trim($('#phone1').val())+'",'
						+'"whatsup1" : "'+whatsup1.options[whatsup1.selectedIndex].value+'",'
						+'"phone2" : "'+($.trim($('#phone2').val())!==""? $.trim($('#ddd2').val())+"-"+$.trim($('#phone2').val()):'')+'",'
						+'"whatsup2" : "'+(whatsup2.selectedIndex >=0 ?  whatsup2.options[whatsup2.selectedIndex].value : '')+'",'
						+'"email1" : "'+$.trim($('#email1').val())+'",'
						+'"email2" : "'+$.trim($('#email2').val())+'",'
						+'"habilities" : "'+$.trim($('#habilities').val())+'",'
						+'"habilitiesNotes" : "'+$.trim($('#notesHabilities').val())+'"}';
									
					console.log(JSON.stringify(input));
	
					$.ajax({
						url: '/services/ceai/register',
						type: 'POST',
						data: input,
						contentType: "application/json",
						success: function(data, textStatus, jqXHR){
								console.log(data);
								$('#resultsCreateOrUpdate').text(data);
								$process.hide();
								$output.show(); 
						},
						error: function(jqXHR, textStatus, errorThrown){
							$('#resultsCreateOrUpdate').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
							$process.hide();
							$output.show(); 
						}
					});
				}
			});
		}
	}); 
}

$(document).ready(function() {
	  $('#search').click(function(){
		//alert('Search Button'); 
		var $output = $('.outputGeneral'),
		$message = $('.messageSearchPanel'),
		$process = $('.processingSearch'),	
		$userData = $('.userData');
		var validate = validateFieldsSearch();
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
		createOrUpdate("update");
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
});
