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
var userIDs = [];

function cleanupLoad(){
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
	
		    var cell = row.insertCell(0);
		    cell.innerHTML= userIDs[i].loanID;
		    cell.align="center";
		    cell = row.insertCell(1);
		    cell.innerHTML= userIDs[i].userID;
		    cell.align="center";
		    cell = row.insertCell(2);
		   	cell.innerHTML= userIDs[i].firstName+" "+userIDs[i].middleName+" "+userIDs[i].lastName;	    
		    cell.colSpan = 3;
		    cell.align="center";
		    cell = row.insertCell(3);
		    cell.innerHTML= userIDs[i].loanDate;
		    cell.align="center";
		    cell = row.insertCell(4);
		    cell.innerHTML= userIDs[i].limitDate;
		    cell.align="center";
		    cell = row.insertCell(5);
		    cell.innerHTML= userIDs[i].notes;
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
	cleanupLoad();
	populateLoan();	
}

function checkRestrictedAccess(){
    
    $.ajax({
  		url: '/checkRestrictedAccess',
        type: 'GET',
        contentType: "application/json",
        error: function(jqXHR, textStatus, errorThrown){
        	//window.location = "noaccess.html";
        },
        success: function(data, textStatus, jqXHR){
        	
        }        
      });
}


function loadSessionData(){
	console.log("Loading Session Data ...");
	var loadData = '{"searchKey" : "stockBook"}';
    
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
        		$('#insert').prop("disabled",true).css('opacity',0.5);
        		$('#delete').prop("disabled",false).css('opacity',1.0);
        		populateData(data.docs[0]);        		
        	}
        	else
        	{
        		$('#insert').prop("disabled",false).css('opacity',1.0);
        		$('#delete').prop("disabled",true).css('opacity',0.5);
        	}	
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log("Loading Session Data Failed "+errorThrown);
        }
      });
}

function validateFields(callback){
	if ($.trim($('#author').val()) === '' || $.trim($('#bookName').val()) === '' || $.trim($('#amount').val()) === '')  
	{
		return callback(false,"Os campos Autor, Nome do Livro, Categoria do Livro e Quantidade são Requeridos");
	}	
	var category = document.getElementById("category");
	
	if (category.selectedIndex === 0){

		return callback(false,"Os campos Autor, Nome do Livro, Categoria do Livro e Quantidade são Requeridos");
	}

	return callback(true,"");
}

function getBookID(){
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

function enableDisableActions(action){
	if (action === 'delete'){
		 $('#insert').prop("disabled",true).css('opacity',0.5);
		 $('#delete').prop("disabled",true).css('opacity',0.5);
		 $('#update').prop("disabled",true).css('opacity',0.5);
	}
	if (action === 'insert'){
		 $('#insert').prop("disabled",false).css('opacity',1.0);
		 $('#delete').prop("disabled",false).css('opacity',1.0);
		 $('#update').prop("disabled",false).css('opacity',1.0);
	}
	if (action === 'update'){
		 $('#insert').prop("disabled",false).css('opacity',1.0);
		 $('#delete').prop("disabled",false).css('opacity',1.0);
		 $('#update').prop("disabled",false).css('opacity',1.0);
	}	
}

$(document).ready(function() {
	$('#previous').click(function(){
		window.location = "/home";
	});	
	$('#next').click(function(){
		window.location = "/Loan";
	});
	$('#delete').click(function(){
		var $output = $('.output'),
		$process = $('.processing');
		$process.show();
		$output.hide();
		
		var deleteBook = '{'
			+'"isbn" : "'+$.trim($('#isbn').val())+'",'
			+'"bookName" : "'+$.trim($('#bookName').val())+'",'
			+'"bookID" : "'+$.trim($('#bookID').val())+'"}';
		
		$.ajax({
			url: '/services/ceai/deleteBook',
			type: 'POST',
			data: deleteBook,
			contentType: "application/json",
			success: function(data, textStatus, jqXHR){
					console.log(data);
					$('#results').html(data);
					$process.hide();
					$output.show(); 	
					enableDisableActions('delete');
			},
			error: function(jqXHR, textStatus, errorThrown){
				$('#results').html('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
				//alert('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
				$process.hide();
				$output.show(); 
			}
		});
		
	});
	$('#update').click(function(){
		//alert('Insert Button'); 
		var $output = $('.output'),
		$process = $('.processing');	
		validateFields(function(valid,response){
			if (valid === false){
				if (response !== "")
					alert(response);
				return;
			}
		}); 
		$process.show();
		$output.hide();
		var category = document.getElementById("category");
		var available;
		if (parseInt($('#loan').val())>0)
			available = (parseInt($('#amount').val()) - parseInt($('#loan').val()));
		else
			available = parseInt($('#amount').val());
		var updateBook = '{'
			+'"type" : "book",'
			+'"bookID" : "'+$.trim($('#bookID').val())+'",'
			+'"isbn" : "'+$.trim($('#isbn').val())+'",'
			+'"author" : "'+$.trim($('#author').val())+'",'
			+'"espAuthor" : "'+$.trim($('#espAuthor').val())+'",'
			+'"category" : "'+category.options[category.selectedIndex].value+'",'
			+'"bookName" : "'+$.trim($('#bookName').val())+'",'
			+'"available" : "'+available+'",'
			+'"amount" : "'+$.trim($('#amount').val())+'"}';

		console.log(JSON.stringify(updateBook));
		$.ajax({
			url: '/services/ceai/updateBook',
			type: 'POST',
			data: updateBook,
			contentType: "application/json",
			success: function(data, textStatus, jqXHR){
					console.log(data);
					$('#results').html(data);
					$('#available').val(available);
					$process.hide();
					$output.show(); 	
					enableDisableActions('update');
			},
			error: function(jqXHR, textStatus, errorThrown){
				$('#results').html('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
				//alert('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
				$process.hide();
				$output.show(); 
			}
		});
	});		
	$('#insert').click(function(){
		//alert('Insert Button'); 
		var $output = $('.output'),
		$process = $('.processing');	
		validateFields(function(valid,response){
			if (valid === false){
				if (response !== "")
					alert(response);
				return;
			}
			else{
				$process.show();
				$output.hide();
				var category = document.getElementById("category");
				var inputBook = '{'
					+'"bookID" : "'+getBookID()+'",'
					+'"isbn" : "'+$.trim($('#isbn').val())+'",'
					+'"author" : "'+$.trim($('#author').val())+'",'
					+'"espAuthor" : "'+$.trim($('#espAuthor').val())+'",'
					+'"category" : "'+category.options[category.selectedIndex].value+'",'
					+'"bookName" : "'+$.trim($('#bookName').val())+'",'
					+'"available" : "'+$.trim($('#amount').val())+'",'
					+'"amount" : "'+$.trim($('#amount').val())+'",'
					+'"userIDs" : []}';

				console.log(JSON.stringify(inputBook));

				$.ajax({
					url: '/services/ceai/inputBook',
					type: 'POST',
					data: inputBook,
					contentType: "application/json",
					success: function(data, textStatus, jqXHR){
							console.log(data);
							data = JSON.parse(data);
							$('#results').html(data.message);
							$('#bookID').val(data.bookID);
							$process.hide();
							$output.show();
							enableDisableActions('insert');
					},
					error: function(jqXHR, textStatus, errorThrown){
						$('#results').html('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
						//alert('Error on Process: '+ jqXHR.responseText+' status: '+jqXHR.statusText);
						$process.hide();
						$output.show(); 
					}
				});
			}
		}); 
		
	});	
});
