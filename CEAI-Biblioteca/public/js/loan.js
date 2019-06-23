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
var userIDs = [];

function cleanSearchOutput(){
	var table = document.getElementById("tableResultPerson");
	var length = table.rows.length;
	for (var i = length-1; i >=2 ; --i) {
		table.deleteRow(i);
	} 	
}

function validateFieldsPerson(){
	if ($.trim($('#fullName').val()) === '') {
		return false;
	}	
	
	return true;
}

function buildSearhOutput(data){
	 
    var table = document.getElementById("tableResultPerson");

    for (var i = 0; i < data.docs.length; i++) {
	    var rowCount = table.rows.length;
	    var row = table.insertRow(rowCount);

	    row.insertCell(0).innerHTML= '<input type="radio" name="group2" onchange="handleChangeRadioButtonPerson();">';
	    row.insertCell(1).innerHTML= data.docs[i].userID;
	    var cell = row.insertCell(2);
	    if (data.docs[i].middleName !== "")
	    	cell.innerHTML= data.docs[i].firstName+" "+data.docs[i].middleName+" "+data.docs[i].lastName;
	    else
	    	cell.innerHTML= data.docs[i].firstName+" "+data.docs[i].lastName;
	    cell.colSpan = 2;
	    cell.align = "center";
	    row.insertCell(3).innerHTML= data.docs[i].phone1 || "";
	    row.insertCell(4).innerHTML= data.docs[i].email1 || "";
	    var loans = 0;
	    if (typeof(data.docs[i].book)!=='undefined'){
		    for (var j =0;j<data.docs[i].book.length;++j){
		    	if (data.docs[i].book[j].returnDate ===''){
		    		loans++;
		    	}
		    }
		    row.insertCell(5).innerHTML= loans;
	    }
	    else{
	    	row.insertCell(5).innerHTML= 0;
	    }
    }
}

function formatCurrentDate(){
	var response = [];
	var today = new Date();
	response[0] = today.getDate();
	response[1] = today.getMonth()+1; //January is 0!
	response[2] = today.getFullYear();

	if(response[0]<10) {
		response[0] = '0'+response[0];
	} 

	if(response[1]<10) {
		response[1] = '0'+response[1];
	} 

	return response;	
}

function splitDate(input){
	var response = input.split("-");
	
	return response;	
}

function handleChangeRadioButtonPerson(){
	var radios = document.getElementsByName("group2");
	var table = document.getElementById("tableResultPerson");
	var row;
    for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 row = table.rows[i+2];         	 
        	 break;
         }
    }
    console.log(row.cells[1]);
    $('#userID').val(row.cells[1].innerHTML);
    $('#fullName').val(row.cells[2].innerHTML);
    $('#loanNumber').val(row.cells[5].innerHTML);
	$('#loanBook').prop("disabled",false).css('opacity',1.0);
	$('#return').prop("disabled",true).css('opacity',0.5);
	$('#renewLoanBook').prop("disabled",true).css('opacity',0.5);
}

function changeRenovationNumberInTable(){
	var radios = document.getElementsByName("group1");
	var table = document.getElementById("tableResult");
	var row;
	var i;
	var len;
    for (i = 0,len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 row = table.rows[i+2];         	 
        	 break;
         }
    }
    
    row.cells[6].innerHTML = $('#renovationNr').val();
}

function handleChangeRadioButtonLoan(){
	
	var radios = document.getElementsByName("group1");
	var table = document.getElementById("tableResult");
	var row;
	var i;
	var len;
    for (i = 0,len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 row = table.rows[i+2];         	 
        	 break;
         }
    }
    console.log(row.cells[1]);
    $('#loanID').val(row.cells[1].innerHTML);
    $('#userID').val(row.cells[2].innerHTML);
    $('#fullName').val(row.cells[3].innerHTML);
    //$('#loanNumber').prop("disabled","true");
    var date = splitDate(row.cells[4].innerHTML);
    $('#loanDay').val(date[0]);
    $('#loanMonth').val(date[1]);
    $('#loanYear').val(date[2]);
    date = splitDate(row.cells[5].innerHTML);
    $('#limitDay').val(date[0]);
    $('#limitMonth').val(date[1]);
    $('#limitYear').val(date[2]);
    date = formatCurrentDate();
    $('#returnDay').val(date[0]);
    $('#returnMonth').val(date[1]);
    $('#returnYear').val(date[2]);
    $('#renovationNr').val(row.cells[6].innerHTML);
    $('#notes').val(userIDs[i].notes);
	$('#loanBook').prop("disabled",true).css('opacity',0.5);
	$('#return').prop("disabled",false).css('opacity',1.0);
	$('#renewLoanBook').prop("disabled",false).css('opacity',1.0);
	var $output = $('.output2');
	$output.hide();
}

function cleanupLoanFields(option){
	if (option === 'ALL'){
		$('#fullName').val('');
	}	
	$('#userID').val('');
	$('#loanNumber').val('');
	$('#loanID').val('');
	$('#renovationNr').val('');
	$('#loanDay').val('');
	$('#loanMonth').val('');
	$('#loanYear').val('');
	$('#limitDay').val('');
	$('#limitMonth').val('');
	$('#limitYear').val('');
	$('#returnDay').val('');
	$('#returnMonth').val('');
	$('#returnYear').val('');
	$('#notes').val('');
}

function addLoanToTable(){
	 var table = document.getElementById("tableResult");
    var row = table.insertRow(table.rows.length);
    row.insertCell(0).innerHTML= '<input type="radio" name="group1" onchange="handleChangeRadioButtonLoan();">';
    var cell = row.insertCell(1);
    cell.innerHTML= $('#loanID').val();
	cell.align="center";
	cell = row.insertCell(2);
	cell.innerHTML= $('#userID').val();
	cell.align="center";
	cell = row.insertCell(3);
	cell.innerHTML= $('#fullName').val();	    
	cell.colSpan = 3;
	cell.align="center";
    cell = row.insertCell(4);
    cell.innerHTML= $.trim($('#loantDay').val())+'-'+$.trim($('#loanMonth').val())+'-'+$.trim($('#loanYear').val())+'",'
    cell.align="center";
    cell = row.insertCell(5);
    cell.innerHTML= $.trim($('#limitDay').val())+'-'+$.trim($('#limitMonth').val())+'-'+$.trim($('#limitYear').val())+'",'
    cell.align="center";
    cell = row.insertCell(6);
    cell.innerHTML= $('#renovationNr').val();
    cell.align="center";
}

function removeLoanFromTable(){
	var i;
	var radios = document.getElementsByName("group1");
	for (i=0; i < radios.length; i++) {
        if (radios[i].checked) {       	  
       	 break;
        }
    }
	var table = document.getElementById("tableResult");
	table.deleteRow(i+2);
}

function cleanupLoan(){
    var table = document.getElementById("tableResult");

    for (var i = 2; i <table.rows.length; i++) {
    	table.deleteRow(i);
    }
}

function populateLoan(){
	 
    var table = document.getElementById("tableResult");

    for (var i = 0; i < userIDs.length; i++) {
    	if (userIDs[i].returnDate === ''){
	        var rowCount = table.rows.length;
		    var row = table.insertRow(rowCount);
	
		    row.insertCell(0).innerHTML= '<input type="radio" name="group1" onchange="handleChangeRadioButtonLoan();">';
		    var cell = row.insertCell(1);
		    cell.innerHTML= userIDs[i].loanID;
		    cell.align="center";
		    cell = row.insertCell(2);
		    cell.innerHTML= userIDs[i].userID;
		    cell.align="center";
		    cell = row.insertCell(3);
		   	cell.innerHTML= userIDs[i].firstName+" "+userIDs[i].middleName+" "+userIDs[i].lastName;	    
		    cell.colSpan = 3;
		    cell.align="center";
		    cell = row.insertCell(4);
		    cell.innerHTML= userIDs[i].loanDate;
		    cell.align="center";
		    cell = row.insertCell(5);
		    cell.innerHTML= userIDs[i].limitDate;
		    cell.align="center";
		    cell = row.insertCell(6);
		    cell.innerHTML= userIDs[i].renovationNr;
		    cell.align="center";
    	}
    }
}


function populateData(book){
	$('#bookID').val(book.bookID);
	$('#isbn').val(book.isbn);
	$('#author').val(book.author);
	$('#espAuthor').val(book.espAuthor);
	$('#bookName').val(book.bookName);
	$('#category').val(book.category);
	$('#amount').val(book.amount);
	$('#loan').val(book.loan);
	$('#available').val(book.available);
	userIDs = book.userIDs;	
	cleanupLoan();
	populateLoan();	
}

function loadSessionData(){

	var loadData = '{"searchKey" : "loan"}';
    
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
        	if (typeof (data.docs) !== 'undefined' && data.docs.length>0)
        	{
        		populateData(data.docs[0]);        		
        	}        	
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log("Loading Session Data Failed "+errorThrown);
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
	if (res.length ===1 ){
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
    	radios[0].checked = true;
    }	
}

function getLoanID(){
	var currentdate = new Date(); 
	return  currentdate.getFullYear() 
					+ "-" + (currentdate.getMonth()+1) 
					+ "-" + currentdate.getDay()					 
					+ "-" + currentdate.getHours()  
	                + "-" + currentdate.getMinutes() 
	                + "-" + currentdate.getSeconds()
	                + "-" + currentdate.getMilliseconds();
}

function loan(){
	
	//alert('Insert Button'); 
	var $output = $('.output'),
	$output2 = $('.output2'), 
	$message = $('.message'),
	$process = $('.processing');
	
	var loanNumber = parseInt($('#loanNumber').val());
	if (loanNumber === 3){
		alert('Não é possível emprestar este livro, o limite (3) para o número de livros emprestados para o participante '+$('#fullName').val()+' foi alcançado!');
		return;
	}
	
	var loanID = getLoanID();
	var now = formatCurrentDate();
	
	var loan = parseInt($('#loan').val()) +1;
	var amount = parseInt($('#amount').val());
	if (loan > amount){
		alert('Não é possível emprestar este livro, estoque disponível esgotado !');
		return;
	}
	
	if (validateFieldsLoan()===false){
		return;
	}
	
	$process.show();
	$output.hide();
	$output2.hide();
	$message.hide();
	
	
	var available = amount - loan;
	var input = '{'
		+'"userID" : "'+$.trim($('#userID').val())+'",'	
  		+'"bookName" : "'+$.trim($('#bookName').val())+'",'	
  		+'"fullName" : "'+$.trim($('#fullName').val())+'",'
  		+'"bookID" : "'+$.trim($('#bookID').val())+'",'	
  		+'"loanID" : "'+loanID+'",'	
  		+'"limitDate" : "'+$.trim($('#limitDay').val())+'-'+$.trim($('#limitMonth').val())+'-'+$.trim($('#limitYear').val())+'",'
  		+'"loanDate" : "'+now[0]+'-'+now[1]+'-'+now[2]+'",'
  		+'"returnDate" : "",'
  		+'"notes" : "'+$.trim($('#notes').val())+'",'
		+'"renovationNr" : "0"}';

	$.ajax({
  		url: '/services/ceai/loan',
        	type: 'POST',
        	data: input,
        	contentType: "application/json",
        	success: function(data, textStatus, jqXHR){
        			loadSessionData();
        			$('#renovationNr').val('0');
        			$('#loanID').val(loanID);
        			$('#loanDay').val(now[0]);
        			$('#loanMonth').val(now[1]);
        			$('#loanYear').val(now[2]);
        			$('#loan').val(loan);
        			$('#available').val(available);
            		$process.hide();
            		$output.show(); 
            		$('#message').text(data);
            		$message.show();
        	},
        	error: function(jqXHR, textStatus, errorThrown){
        		$('#message').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
        	 	$process.hide();
        	 	$message.show();
        	}	        
  	  });
	
}

function validateFieldsLoan(){
	if ($('#bookID').val()===''){
		alert('Um livro precisa ser carregado antes de realizar um empréstimo. Pesquise e carregue o livro na opção Pesquisa de Livros');
		return false;
	}
	
	if ($('#limitDay').val()==='' || $('#limitMonth').val()==='' || $('#limitYear').val()===''){
		alert('Especifique uma data de entrega do livro para Empréstimo ou Renovação válida e após a data de hoje !');
		return false;
	}
	
	var limitDate = new Date($('#limitYear').val()+'-'+$('#limitMonth').val()+'-'+$('#limitDay').val());
	var today = new Date();
	
	if (limitDate <= today){
		alert('Data para entrega do Livro é menor ou igual a data atual, corrija a data de entrega e tente novamente !');
		return false;
	}
	
	return true;
}

function validateFieldsReturn(){
	var radios = document.getElementsByName("group1");
	for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 return true;
         }
    }
	
	return false;
}

function clearLoadSelection(){
	var radios = document.getElementsByName("group1");
	for (var i = 0, len = radios.length; i < len; i++) {
         if (radios[i].checked) {
        	 console.log("Uncheck the radio");
        	 radios[i].checked = false;        	 
        	 break;
         }
    }
}

$(document).ready(function() {
	 $('#stockBookLink').click(function(){
		  $.ajax({
		  		url: '/StockBook',
		        type: 'GET',
		        success: function(data, textStatus, jqXHR){
		        	
		        },
		        error: function(jqXHR, textStatus, errorThrown){
		        	//alert(jqXHR.responseText);
		        	//window.location = "/Loan";
		        }
		   });
	});	
	$('#search').click(function(){
		//alert('Search Button'); 
		var $output = $('.output2'),
		$error = $('.error'),
		$process = $('.processing');	
		if (validateFieldsPerson()===false){	
			alert('Favor preencher um nome para pesquisar, pode ser o primeiro nome ou nome completo');
			return;
		}	
		$process.show();
		cleanSearchOutput();
		cleanupLoanFields('Search');
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
	        	data = JSON.parse(data);
	        	$process.hide();
	            $output.show(); 
	            console.log(data);
	        	if (data.docs.length>0){
	        		buildSearhOutput(data);
	        		$('#loanBook').prop("disabled",false).css('opacity',1.0);
	        		$('#renewLoanBook').prop("disabled",false).css('opacity',1.0);
	        		$('#return').prop("disabled",false).css('opacity',1.0);
	        	}
	        	else{
	        		alert("Participante "+$.trim($('#fullName').val())+" não foi encontrado");
	        		$('#loanBook').prop("disabled",true).css('opacity',0.5);
	        		$('#renewLoanBook').prop("disabled",true).css('opacity',0.5);
	        		$('#return').prop("disabled",true).css('opacity',0.5);
	        	}
	            clearLoadSelection();
	    		
	        },
	        error: function(jqXHR, textStatus, errorThrown){
	        	$('#results').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
	        	//alert('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
	        	 $process.hide();
	             $error.show(); 
	        }
	      });
	});
	$('#previous').click(function(){
		window.location = "/StockBook";
	});
	$('#createUser').click(function(){
		window.open(
		  'https://ceai-participantes.mybluemix.net/cadastro',
		  '_blank' // <- This is what makes it open in a new window.
		);
	});	
	$('#loanBook').click(function(){
		loan();
	});	
	$('#renewLoanBook').click(function(){		
		var $output = $('.output'),
		$message = $('.message'),
		$process = $('.processing');
		
		if (validateFieldsLoan()===false){
			return;
		}
		
		$process.show();
	  	$output.hide();
	  	$message.hide();
		
		var renovationNr = parseInt($('#renovationNr').val())+1;
		
		var input = '{'
	  		+'"bookID" : "'+$.trim($('#bookID').val())+'",'	
	  		+'"bookName" : "'+$.trim($('#bookName').val())+'",'	
	  		+'"fullName" : "'+$.trim($('#fullName').val())+'",'
	  		+'"loanID" : "'+$.trim($('#loanID').val())+'",'	
	  		+'"limitDate" : "'+$.trim($('#limitDay').val())+'-'+$.trim($('#limitMonth').val())+'-'+$.trim($('#limitYear').val())+'",'
	  		+'"notes" : "'+$.trim($('#notes').val())+'",'
			+'"renovationNr" : "'+renovationNr+'"}';
		
		$.ajax({
	  		url: '/services/ceai/renewLoan',
	        	type: 'POST',
	        	data: input,
	        	contentType: "application/json",
	        	success: function(data, textStatus, jqXHR){
	        			$('#renovationNr').val(renovationNr);
	        			changeRenovationNumberInTable();
	        			$('#message').text(data);
	            		$process.hide();
	            		$output.show(); 
	            		$message.show();
	        	},
	        	error: function(jqXHR, textStatus, errorThrown){
	        		$('#message').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
	        	 	$process.hide();
	        	 	$message.show();
	        	}	        
	  	  });
		
	});
	$('#cleanLoanSelection').click(function(){
		clearLoadSelection();
		cleanupLoanFields('ALL');
		$('#loanBook').prop("disabled",false).css('opacity',1.0);
	});	
	
	$('#return').click(function(){
		var $output = $('.output'),
		$message = $('.message'),
		$process = $('.processing');	
		if (validateFieldsReturn()===false){	
			alert('Favor selecionar um empréstimo, antes de devolver um livro');
			return;
		}	
		$process.show();
	  	$output.hide();
	  	$message.hide();

	  	var loan = parseInt($('#loan').val()) -1;
		var available = (parseInt($('#amount').val()) - loan);
		var now = formatCurrentDate();
	  	
	  	var input = '{'
	  		+'"bookID" : "'+$.trim($('#bookID').val())+'",'	
	  		+'"bookName" : "'+$.trim($('#bookName').val())+'",'	
	  		+'"fullName" : "'+$.trim($('#fullName').val())+'",'	
	  		+'"loanID" : "'+$.trim($('#loanID').val())+'",'	  				
			+'"userID" : "'+$.trim($('#userID').val())+'",'
			+'"loanDate" : "'+$.trim($('#loanDay').val())+'-'+$.trim($('#loanMonth').val())+'-'+$.trim($('#loanYear').val())+'",'
			+'"returnDate" : "'+now[0]+'-'+now[1]+'-'+now[2]+'",'
			+'"limitDate" : "'+$.trim($('#limitDay').val())+'-'+$.trim($('#limitMonth').val())+'-'+$.trim($('#limitYear').val())+'",'
			+'"available" : "'+available+'",'
			+'"loan" : "'+loan+'",'
			+'"notes" : "'+$.trim($('#notes').val())+'"}';
	  	  
	  	//alert(input);
	  	  
	  	$.ajax({
	  		url: '/services/ceai/return',
	        	type: 'POST',
	        	data: input,
	        	contentType: "application/json",
	        	success: function(data, textStatus, jqXHR){
	        			removeLoanFromTable();
	        			cleanupLoanFields();
	        			$('#loan').val(loan);
	        			$('#available').val(available);
	        			$('#message').text(data);
	            		$process.hide();
	            		$output.show(); 
	            		$message.show();
	        	},
	        	error: function(jqXHR, textStatus, errorThrown){
	        		$('#message').text('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
	        	 	$process.hide();
	        	 	$message.show();
	        	}	        
	  	  });
	});		
});
