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

document.getElementById("mainBody").onload = function(){
	checkAccess();
    //alert("Load Called");
    //It will program the load of zip/tar files into the tool
	procUploadedConfFiles();
};

function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

$(document).ready(function() {
		
	$('#uploadInput').bind('change', function() {
		  
		  if (this.files[0].size <= 51200000)
		  {  
			  var file = $('#uploadInput').val();
			  
			  var extIndex = file.lastIndexOf(".") + 1;
			  
			  var ext = file.substr(extIndex);
			  
			  if (ext.localeCompare("zip")==0 || ext.localeCompare("tar")==0)
			  {
				  var fileNameIndex = file.lastIndexOf("\\") + 1;
			  
				  if (fileNameIndex==0)
					  fileNameIndex = file.lastIndexOf("/") + 1;	   
				  
				  var filename = file.substr(fileNameIndex);
		    
				  var sOutput = this.files[0].size + " bytes";
		     
				  $('#fileName').text(filename);
				  $('#fileSize').html(sOutput);
			  }
			  else
			  {
				  $('#uploadInput').val('');
				  alert('Not possible to upload this file. Reason: file has a different extension than zip or tar');	  
			  }	  
		  }
		  else
		  {
			  $('#uploadInput').val('');
			  alert('Not possible to upload this file. Reason: file is bigger than 50 MB');	  
		  }
	});	
	
   $('#download').click(function(){
	    var filename = ''; 
	    if ($.trim($('#query').val()) == '')
	    	filename = 'FireBotSearch-Result-'+ $.trim($('#query').val())+'.txt';
	    else
	    	filename = 'FireBotSearch-Result-'+ $.trim($('#query').val())+'-'+$.trim($('#port').val())+'.txt';
	    
		download(filename, $('#results').text());
	});	
   
   $('#setupCache').click(function(){
	   var $output = $('.output'),
	   $error = $('.error');
	   $error.hide();  	
	   $output.hide();
	   $.ajax({
           url: '/services/fw_admin/setupCache',
           type: "POST",
           data: JSON.stringify('{"cachetime" : "'+$.trim($('#cachetime').val())+'"}'),
           contentType: "application/json",
           success: function(data, textStatus, jqXHR){
           	$('#messageOut').html(data); 
           	$('#h3MessageOut').html("Output")
           	$output.show();            		
           },
           error: function(jqXHR, textStatus, errorThrown){
               //alert('addWine error: ' + errorThrown);
           	$('#messageErr').html('Setup Cache Error : '+ errorThrown+ ' - message: '+jqXHR.responseText);
           	$error.show();	
           }
         });	   
   });
	
   $('#sendfile').click(function(){
		
		var fileName = $('#fileName').text();

		if (fileName=='')
		{
			alert('File needs to be selected');
			return;
		}
		var $output = $('.output'),
		   $error = $('.error'),
		   $processing = $('.processing');
		$error.hide();  	
		$output.hide();		
		$processing.show();		  
		//alert('Button Clicked 2');
		$.ajax({
           url: '/services/fw_admin/processConfigFile',
           type: "POST",
           data: new FormData(document.getElementById("uploadForm")),
           enctype: 'multipart/form-data',
           processData: false,
           contentType: false,
           success: function(data, textStatus, jqXHR){
        	//console.log(data);
           	//$('#messageOut').html(data); can be opened for debug purposes of rest java class
        	$('#messageOut').html("");
           	$('#h3MessageOut').html("File uploaded and processed successfully...");
           	procUploadedConfFiles();
           	$processing.hide();
           	$output.show();            		
           },
           error: function(jqXHR, textStatus, errorThrown){
               //alert('addWine error: ' + errorThrown);
           	
        	$('#messageErr').html('Upload Fail Error : '+ errorThrown+ ' - message: '+jqXHR.responseText);
           	
           	$processing.hide();	
           	$error.show();
           }
         });
	});
    
  $('#firewall').bind('change', function() {  
	  var sel = document.getElementById('firewall');
	  $('#fw_description').text(fwDescriptions[sel.selectedIndex]);
  });  
});

function checkAccess(){
	$.ajax({
		url: '/services/fw_admin/checkAccessOnLoad',
        type: "GET",
        success: function(data, textStatus, jqXHR){
        	
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log(errorThrown);
        	alert("You don't have access to this page");
        	window.location = "../index.html";
        }
    });		
}

function procUploadedConfFiles(){
	var $output = $('.output'),
	   $error = $('.error');
	$error.hide();  	
	$output.hide();
	$.ajax({
           url: '/services/fw_admin/getConfigFilesProcessed',
           type: "GET",
           success: function(data, textStatus, jqXHR){
        	   var jsonData = JSON.parse(JSON.stringify(data)); 
        	   console.log(JSON.stringify(data));
           	   var sel = document.getElementById('zipFileList');
           	   cleanFWConfig(sel);
           	   var fragment = document.createDocumentFragment();
           	   var opt,obj;
           	   for(var i in jsonData.files)
      	       {
           		 obj = JSON.parse(JSON.stringify(jsonData.files[i]));
           	     opt = document.createElement('option');
           	     opt.innerHTML = obj.name;
            	 opt.value = obj.name;
            	 fragment.appendChild(opt);
      	       }	        	
      	       sel.appendChild(fragment);        		
           },
           error: function(jqXHR, textStatus, errorThrown){
           	$('#messageErr').html('Fail to load config Files : '+ errorThrown+ ' - message: '+jqXHR.responseText);
           	$error.show();	
           }
         });			
}


function cleanFWConfig(sel){
	while (sel.options.length > 0) {                
		sel.remove(0);
    }   
}



