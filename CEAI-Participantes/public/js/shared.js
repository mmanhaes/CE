var lgpdMessage = "Observado os parâmetros da Lei 13.709/2018 (Lei Geral de Proteção de Dados – LGPD):  Você concorda que iremos armazenar informações pessoais como Endereço, Telefone, RG, CPF e CONTRIBUIÇÃO se houver no nosso sistema e que estas informações SOMENTE serão utilizadas para FINS exclusivos de cadastro de participantes em termos de ATIVIDADES DE ESTUDO, VOLUNTARIADO e ASSOCIAÇÃO AO CENTRO ESPIRÍTA ABIBE ISFER? As informações coletadas não serão de nenhuma forma compartilhadas para qualquer outra finalidade. As informações podem ser alteradas e solicitadas a exclusão pelo participante a qualquer momento.";
var inputPassword = "<table style=\"width: 80%\"><tr><th scope=\"col\" colspan=\"1\" style=\"width: 25%\"><h5 class=\"base--h5\" style=\"width: 180px;\">Insira sua nova Senha:</h5></th><th scope=\"col\" colspan=\"6\" style=\"width: 75%\"><input	id=\"changePwd1\" type=\"password\" minlength=\"6\" maxlength=\"8\" class=\"input--question--manual--reduced base--a\" style=\"width: 90px;\"></th></tr><tr><td scope=\"col\" colspan=\"1\" style=\"width: 25%\"><h5 class=\"base--h5\" style=\"width: 180px;\">Repita a nova Senha:</h5></td><td scope=\"col\" colspan=\"6\" style=\"width: 75%\"><table border=\"\" style=\"width: 100%\"><tr><td><input id=\"changePwd2\" type=\"password\" minlength=\"6\" maxlength=\"8\" class=\"input--question--manual--reduced base--a\" style=\"width: 90px;\"></td></tr></table></td></tr></table>";

function loadSessionData(){
	
	var loadData = '{"searchKey" : "forUpdates"}';
    
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
        		$('#insert').prop("disabled",true).css('opacity',0.5);
        		populateData(data.docs[0]);       		
        	}
        	else
        	{
        		$('#insert').prop("disabled",false).css('opacity',1.0);
        	}	
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log("Saving Session Data Failed "+errorThrown);
        }
      });
}

function getFormattedDate(){
    var date = new Date(),
        dia  = date.getDate().toString(),
        diaF = (dia.length == 1) ? '0'+dia : dia,
        mes  = (date.getMonth()+1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = (mes.length == 1) ? '0'+mes : mes,
        anoF = date.getFullYear();
    return diaF+"/"+mesF+"/"+anoF+ ' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
}

function saveLGPD_Record(){
	
	var data = {};
	data.gdpr = lgpdMessage;
	data.consent = "Y";
	data.date = getFormattedDate();
	
	$.ajax({
		url: '/services/ceai/lgpd',
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
        	console.log('GDPR acceptance saved with success for user ');
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log('GDPR acceptance failed to save ');
        }
    });	
}

function showChangePasswordDialog(){
	$.ajax({
		url: '/services/ceai/verifyChangePwd',
        type: "GET",
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
            console.log('Response from lgpd function',data);
        	if (data.message === "CHANGE"){
	        	bootbox.dialog({
	        		title: "Mudança de Senha (Mínimo 6 caracteres - Máximo 8 caracteres)",
	                message: inputPassword,
	                size: "small",
	                closeButton:false,
	                backdrop: true,
	                onEscape: false,
	                locale : "pt",
	                buttons: {
	                	confirm: {
	                        label: 'Mudar Senha',
	                        className: 'btn btn-primary',
	                        callback: function(){
	                        	saveChangePassword();
	                        }
	                    }
	                },
	                callback: function (result) {
	                    // ...
	                }
	            });
        	} 
        	else{
        		loadSessionData();
        	}       	
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log('Error calling GDPR validation: '+errorThrown);
        }
    });	
}

function saveChangePassword(){
	if ($('#changePwd1').val() !== $('#changePwd2').val()){
		alert('Os campos senha e repetir senha precisam estar com o mesmo valor');
		showChangePasswordDialog();
	}
	else{
		if (($('#changePwd1').val()).length < 6 || ($('#changePwd1').val()).length > 8){
			alert('A senha precisa conter no mínimo 6 e no máximo 8 caracteres');
			showChangePasswordDialog();
		}
		else{
				var data = {};
				data.password = $('#changePwd1').val();
			
				$.ajax({
					url: '/services/ceai/saveNewPassword',
			        type: "POST",
			        data: JSON.stringify(data),
			        contentType: "application/json",
			        success: function(data, textStatus, jqXHR){
			        	if (data.message=="OK"){
			        		alert("Senha Alterada com Sucesso");
			        		loadSessionData();
			        	}
			        	else{
			        		alert("Problemas na troca de senha, Contate o Administrador");
			        	}
			        },
			        error: function(jqXHR, textStatus, errorThrown){
			        	console.log('GDPR acceptance failed to save ');
			        }
			    });	
		}
	} 	
}

function showLGPD_Dialog(){
	
	$.ajax({
		url: '/services/ceai/lgpd',
        type: "GET",
        contentType: "application/json",
        success: function(data, textStatus, jqXHR){
            console.log('Response from lgpd function',data);
        	if (data.message === "NOT ACCEPTED"){
	        	bootbox.dialog({
	        		title: "LGPD - Lei Geral de Proteção a dados",
	                message: lgpdMessage,
	                size: "extra-large",
	                closeButton:false,
	                backdrop: true,
	                onEscape: false,
	                locale : "pt",
	                buttons: {
	                	cancel: {
	                        label: 'Discordo',
	                        className: 'btn btn-danger mr-auto',
	                        callback: function(){
	                        	console.log("Logout called");
	                        	window.location.href = "/logout";
	                        }
	                    },
	                    confirm: {
	                        label: 'Concordo',
	                        className: 'btn btn-primary',
	                        callback: function(){
	                        	saveLGPD_Record();
	                        	showChangePasswordDialog();
	                        }
	                    }
	                },
	                callback: function (result) {
	                    // ...
	                }
	            });
        	}
        	else{
        		showChangePasswordDialog();
        	}
        },
        error: function(jqXHR, textStatus, errorThrown){
        	console.log('Error calling GDPR validation: '+errorThrown);
        }
    });	
}