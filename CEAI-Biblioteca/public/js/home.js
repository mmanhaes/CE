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
    var searchSession = '{"bookID" : "'+cell.innerHTML+'"}';
    
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

function removeCategory(){
	
	var table = document.getElementById("searchTable");
	if (table.rows.length>2){
		table.deleteRow(table.rows.length-1);
	}
}

function buildCategory(){
	var table = document.getElementById("searchTable");
	
    var row = table.insertRow(table.rows.length);
	
    row.insertCell(0).innerHTML = '<td style="width: 320px;"><h5 class="base--h5">Categorias:</h5></td>';
    row.insertCell(1).innerHTML= '<td style="width: 402px;"><select id="category" style="color: #a53725";width: 105px"><option value="Romance">Romance</option><option value="Científico">Científico</option><option value="Mensagem">Mensagem</option><option value="Obras Básicas">Obras Básicas</option><option value="Biografia">Biografia</option><option value="Psicologia">Psicologia</option></select></td>';	
}

function buildSearhOutput(data){
	 
	    var table = document.getElementById("tableResult");

	    for (var i = 0; i < data.docs.length; i++) {
		    var rowCount = table.rows.length;
		    var row = table.insertRow(rowCount);
	
		    row.insertCell(0).innerHTML= '<input type="radio" name="group1" onchange="handleChangeRadioButton();">';
		    row.insertCell(1).innerHTML= data.docs[i].bookID;
		    row.insertCell(2).innerHTML= data.docs[i].isbn || "";
		    var cell = row.insertCell(3);
		   	cell.innerHTML= data.docs[i].bookName;	    
		    cell.colSpan = 2;
		    row.insertCell(4).innerHTML= data.docs[i].author || "";
		    row.insertCell(5).innerHTML= data.docs[i].amount || "";
		    row.insertCell(6).innerHTML= data.docs[i].available || "";
	    }
}

function validateFields(){
	if ($.trim($('#entry').val()) === '')  
	{
		return false;
	}	
	
	return true;
}

$(document).ready(function() {	
  $('#stockBookLink').click(function(){
	  $.ajax({
	  		url: '/StockBook',
	        type: 'GET',
	        success: function(data, textStatus, jqXHR){
	        	
	        },
	        error: function(jqXHR, textStatus, errorThrown){
	        	alert(jqXHR.responseText);
	        	window.location = "/home";
	        }
	   });
  });	
  $('#searchType').change(function(){
		 if ($('#searchType').val()==='category'){
			 $('#entry').prop("disabled",true);
			 buildCategory();
		 }
		 else{
			 $('#entry').prop("disabled",false);
			 removeCategory();
		 }	 
   });	
	
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
	if ($('#searchType').val()!=='category' && validateFields()===false){	
		alert('Favor preencher um nome para pesquisar, pode ser o primeiro nome ou nome completo');
		return;
	}	
	$process.show();
	cleanSearchOutput();
  	$output.hide();
  	$error.hide();
  	
  	var searchType = document.getElementById("searchType");
  	var entry;
  	
  	if ($('#searchType').val()!=='category'){
		 entry = $.trim($('#entry').val());
	}
	else{
		 entry = $('#category').val();
	}	 
  	
  	
  	var inputSearch = '{'
  		+'"type" : "'+searchType.options[searchType.selectedIndex].value+'",'
  		+'"entry" : "'+entry+'"}';
  	
 	  console.log(JSON.stringify(inputSearch));
  	  
  	  $.ajax({
  		url: '/services/ceai/searchBook',
        type: 'POST',
        data: inputSearch,
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
        	//alert(data);
        	data = JSON.parse(data);
        	$process.hide();
        	if (data.docs.length > 0){
        		buildSearhOutput(data);        		
                $output.show();
        	}
        	else
        	{
        		$('#results').text('Nenhum resultado encontrado !');
        		$error.show();
        	}                  
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