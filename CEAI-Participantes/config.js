
exports.cloudant = {
		  instance: "CloudantCEs",
		  username: "5ed24b63-560a-49da-9f7b-08d641077e1f-bluemix",
		  password: "dad79337e9ac8bb06f0802b0a1be0eec31824a4a32755ec57ed0ef8caf986f82",
		  host: "5ed24b63-560a-49da-9f7b-08d641077e1f-bluemix.cloudant.com",
		  port: 443,
		  url: "https://5ed24b63-560a-49da-9f7b-08d641077e1f-bluemix:dad79337e9ac8bb06f0802b0a1be0eec31824a4a32755ec57ed0ef8caf986f82@5ed24b63-560a-49da-9f7b-08d641077e1f-bluemix.cloudant.com"
};

exports.database = {
		person : {name: "ceai"},
		lgpd: {name:"lgpd"},
		users: {name: "ceai-users"}
};

exports.lgpd = {
	   "selector": {
		      "email": "",
		      "tool":""
		   },
		   "fields": [
			   "consent"
		   ]
}

exports.selectors={};

exports.selectors={
		"forDump":{
			"selector": {
			    "_id" : {"$gt" : 0}
			  },
			  "fields": [
			    "firstName",
			    "middleName",
			    "lastName",
			    "userID",
			    "fincode",
			    "cpf",
			    "rg",
			    "rgExp",
			    "rgState",
			    "birthDate",
			    "address",
			    "number",
			    "complement",
			    "neighborhood",
			    "city",
			    "state",
			    "postCode",
			    "parentCpf",
			    "parentName",
			    "phone1",
			    "whatsup1",
			    "phone2",
			    "whatsup2",
			    "email1",
			    "email2",
			    "habilities",
			    "habilitesNotes"
			  ]
		},
		"byUserIDSystem":{
			"selector": {
			      "userID": "id"
			   },
			   "fields": [
			      "_id",
			      "_rev",
			      "username",
			      "password",
			      "role",
			      "displayName",
			      "userID"
			   ],
			   "sort": [
			      {
			         "_id": "asc"
			      }
			   ]
		},
		"byUserId":{
			"selector": {
			      "_id": "id"
			   },
			   "fields": [
			      "_id",
			      "_rev",
			      "username",
			      "password",
			      "role",
			      "displayName",
			      "userID"
			   ],
			   "sort": [
			      {
			         "_id": "asc"
			      }
			   ]
		},
		"byUserName":{
			   "selector": {
				      "username": "clovis"
				   },
				   "fields": [
				      "_id",
				      "_rev",
				      "username",
				      "password",
				      "role",
				      "displayName",
				      "userID"
				   ],
				   "sort": [
				      {
				         "_id": "asc"
				      }
				   ]
		},
		"coordinators":{
			   "selector": {
				      "work": {
				         "$elemMatch": {
				            "workType": {
				               "$regex": "Coordenador de EIDE I"
				            },
				            "weekDay": {
				               "$regex": "Segunda"
				            },
				            "period": {
				               "$regex": "Tarde"
				            },
				            "classNumber": {
				               "$regex": "1"
				            },
				            "finalDate": {
				                "$eq": ""
				            }
				         }
				      }
				   },
				   "fields": [
				      "_id",
				      "_rev",
				      "firstName",
				      "middleName",
				      "lastName",
				      "userID",
				      "work"
				   ],
				   "sort": [
				      {
				         "_id": "asc"
				      }
				   ]
		},	
		"coordinatorsNoClass":{
			   "selector": {
				      "work": {
				         "$elemMatch": {
				            "workType": {
				               "$regex": "Coordenador de EIDE I"
				            },
				            "weekDay": {
				               "$regex": "Segunda"
				            },
				            "period": {
				               "$regex": "Tarde"
				            },
				            "classNumber": {
				            	"$exists": false
				            },
				            "finalDate": {
				                "$eq": ""
				            }
				         }
				      }
				   },
				   "fields": [
				      "_id",
				      "_rev",
				      "firstName",
				      "middleName",
				      "lastName",
				      "userID",
				      "work"
				   ],
				   "sort": [
				      {
				         "_id": "asc"
				      }
				   ]
		},
		"forUpdates":{
			"selector": {
			    "userID" : ""
			  },
			  "fields": [
				"_id",
			    "_rev",
			    "firstName",
			    "middleName",
			    "lastName",
			    "userID",
			    "cpf",
			    "rg",
			    "rgExp",
			    "rgState",
			    "birthDate",
			    "address",
			    "number",
			    "complement",
			    "neighborhood",
			    "city",
			    "state",
			    "postCode",
			    "parentCpf",
			    "parentName",
			    "phone1",
			    "whatsup1",
			    "phone2",
			    "whatsup2",
			    "email1",
			    "email2",
			    "association",
			    "habilities",
			    "habilitesNotes",
			    "work",
			    "study",
			    "book",
			    "finance"
			  ]
		},
		"forFinancialUpdates":{
			"selector": {
			    "fincode" : ""
			  },
			  "fields": [
				"_id",
			    "_rev",
			    "firstName",
			    "middleName",
			    "lastName",
			    "userID",
			    "fincode",
			    "cpf",
			    "rg",
			    "rgExp",
			    "rgState",
			    "birthDate",
			    "address",
			    "number",
			    "complement",
			    "neighborhood",
			    "city",
			    "state",
			    "postCode",
			    "parentCpf",
			    "parentName",
			    "phone1",
			    "whatsup1",
			    "phone2",
			    "whatsup2",
			    "email1",
			    "email2",
			    "association",
			    "habilities",
			    "habilitesNotes",
			    "work",
			    "study",
			    "book",
			    "finance"
			  ]
		},
		"general":{
		  "selector": {
			    "userID" : ""
			  },
			  "fields": [
				"firstName",
			    "middleName",
			    "lastName",
			    "userID",
			    "fincode",
			    "cpf",
			    "rg",
			    "rgExp",
			    "rgState",
			    "birthDate",
			    "address",
			    "number",
			    "complement",
			    "neighborhood",
			    "city",
			    "state",
			    "postCode",
			    "parentCpf",
			    "parentName",
			  ],
			  "sort": [
			    {
			      "firstName": "asc"
			    }
			  ]
		},
		"contact":{
			  "selector": {
				    "userID" : "",
				  },
				  "fields": [
				    "firstName",
				    "middleName",
				    "lastName",
				    "userID",
				    "phone1",
				    "whatsup1",
				    "phone2",
				    "whatsup2",
				    "email1",
				    "email2",
				  ],
				  "sort": [
				    {
				      "firstName": "asc"
				    }
				  ]
		},
		"association":{
			  "selector": {
				    "userID" : ""
				  },
				  "fields": [
					"firstName",
				    "middleName",
				    "lastName",
				    "userID",
				    "association"				    
				  ],
				  "sort": [
				    {
				      "firstName": "asc"
				    }
				  ]
			},
		"study":{
			  "selector": {
				    "userID" : ""
				  },
				  "fields": [
					"firstName",
				    "middleName",
				    "lastName",
				    "userID",
				    "study"				    
				  ],
				  "sort": [
				    {
				      "firstName": "asc"
				    }
				  ]
			},
		"work":{
				 "selector": {
					    "userID" : ""
					  },
					  "fields": [
						"firstName",
					    "middleName",
					    "lastName",
					    "userID",
					    "work"				    
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
			},
		"book":{
				 "selector": {
					    "userID" : ""
					  },
					  "fields": [
						"firstName",
					    "middleName",
					    "lastName",
					    "userID",
					    "book"				    
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
			},
		"cpf":{
				 "selector": {
					    "cpf" : ""
					  },
					  "fields": [
							"_id",
						    "_rev",
						    "firstName",
						    "middleName",
						    "lastName",
						    "userID",
						    "cpf",
						    "rg",
						    "rgExp",
						    "rgState",
						    "birthDate",
						    "address",
						    "number",
						    "complement",
						    "neighborhood",
						    "city",
						    "state",
						    "postCode",
						    "parentCpf",
						    "parentName",
						    "phone1",
						    "whatsup1",
						    "phone2",
						    "whatsup2",
						    "email1",
						    "email2",
						    "association",
						    "habilities",
						    "habilitesNotes",
						    "work",
						    "study",
						    "book",
						    "finance"
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
			}
}

exports.participant = {
		  "firstName": "",
		  "middleName": "",
		  "lastName": "",
		  "userID": "2018-4-5-19-40-30-85",
		  "fincode":"",
		  "cpf":"",
		  "rg": "",
		  "rgExp": "",
		  "rgState": "",
		  "birthDate": "",
		  "address": "",
		  "number": "",
		  "complement": "",
		  "neighborhood": "",
		  "city": "",
		  "state": "",
		  "postCode": "",
		  "parentCpf":"",
		  "parentName":"",
		  "phone1": "",
		  "whatsup1": "",
		  "phone2": "",
		  "whatsup2": "",
		  "email1": "",
		  "email2": "",
		  "parent":"",
		  "habilities":"",
		  "habilitiesNotes":"",
		  "association": [],
		  "work": [],
		  "study": [],
		  "notes":""
}

exports.association = {
	      "associationType": "",
	      "proposeDate": "",
	      "approved": "Sim",
	      "exitDate": "",
	      "contribution": "",
	      "notes": ""
}

exports.searchError = {
		"error":""
};

exports.searchPerson = [
	{
		type:"finance",
		fincode_selector : {
				  "selector": {
					  	  "fincode": ""
					  },
					  "fields": [
						  "_id",
						    "_rev",
						    "firstName",
						    "middleName",
						    "lastName",
						    "userID",
						    "fincode",
						    "cpf",
						    "rg",
						    "rgExp",
						    "rgState",
						    "birthDate",
						    "address",
						    "number",
						    "complement",
						    "neighborhood",
						    "city",
						    "state",
						    "postCode",
						    "parentCpf",
						    "parentName",
						    "phone1",
						    "whatsup1",
						    "phone2",
						    "whatsup2",
						    "email1",
						    "email2",
						    "finance"
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		}
	},
	{
		type:"register",
		fullName_selector : {
				  "selector": {
					  	  "firstName": {
					         "$regex": "(?i)marcelo"
					      },
					      "middleName": {
					         "$regex": "(?i)mota"
					      },
					      "lastName": {
					         "$regex": "(?i)manhães"
					      }
					  },
					  "fields": [
						  "_id",
						    "_rev",
						    "firstName",
						    "middleName",
						    "lastName",
						    "userID",
						    "fincode",
						    "cpf",
						    "rg",
						    "rgExp",
						    "rgState",
						    "birthDate",
						    "address",
						    "number",
						    "complement",
						    "neighborhood",
						    "city",
						    "state",
						    "postCode",
						    "parentCpf",
						    "parentName",
						    "phone1",
						    "whatsup1",
						    "phone2",
						    "whatsup2",
						    "email1",
						    "email2",
						    "association",
						    "habilities",
						    "habilitesNotes",
						    "work",
						    "study",
						    "book",
						    "finance"
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		},
		firstName_selector : {
				  "selector": {
					  	"firstName": {
					         "$regex": "(?i)marcelo"
					      }
				  	    },
					  "fields": [
						  "_id",
						    "_rev",
						    "firstName",
						    "middleName",
						    "lastName",
						    "userID",
						    "fincode",
						    "cpf",						    
						    "rg",
						    "rgExp",
						    "rgState",
						    "birthDate",
						    "address",
						    "number",
						    "complement",
						    "neighborhood",
						    "city",
						    "state",
						    "postCode",
						    "parentCpf",
						    "parentName",
						    "phone1",
						    "whatsup1",
						    "phone2",
						    "whatsup2",
						    "email1",
						    "email2",
						    "association",
						    "habilities",
						    "habilitesNotes",
						    "work",
						    "study",
						    "book",
						    "finance"
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		},
		firstAndlastName_selector : {
				  "selector": {
					  	  "firstName": {
					         "$regex": "(?i)marcelo"
					      },			      
					      "lastName": {
					         "$regex": "(?i)manhães"
					      }
					  },
					  "fields": [
						  "_id",
						    "_rev",
						    "firstName",
						    "middleName",
						    "lastName",
						    "userID",
						    "fincode",
						    "cpf",
						    "rg",
						    "rgExp",
						    "rgState",
						    "birthDate",
						    "address",
						    "number",
						    "complement",
						    "neighborhood",
						    "city",
						    "state",
						    "postCode",
						    "parentCpf",
						    "parentName",
						    "phone1",
						    "whatsup1",
						    "phone2",
						    "whatsup2",
						    "email1",
						    "email2",
						    "association",
						    "habilities",
						    "habilitesNotes",
						    "work",
						    "study",
						    "book",
						    "finance"
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		},
		firstAndMiddleName_selector : {
				  "selector": {
					  	  "firstName": {
					         "$regex": "(?i)marcelo"
					      },			      
					      "middleName": {
					         "$regex": "(?i)mota"
					      }
					  },
					  "fields": [
						  "_id",
						    "_rev",
						    "firstName",
						    "middleName",
						    "lastName",
						    "userID",
						    "fincode",
						    "cpf",
						    "rg",
						    "rgExp",
						    "rgState",
						    "birthDate",
						    "address",
						    "number",
						    "complement",
						    "neighborhood",
						    "city",
						    "state",
						    "postCode",
						    "parentCpf",
						    "parentName",
						    "phone1",
						    "whatsup1",
						    "phone2",
						    "whatsup2",
						    "email1",
						    "email2",
						    "association",
						    "habilities",
						    "habilitesNotes",
						    "work",
						    "study",
						    "book",
						    "finance"
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		}
	},
	{
		type:"regular",
		fullName_selector : {
				  "selector": {
					  	  "firstName": {
					         "$regex": "(?i)marcelo"
					      },
					      "middleName": {
					         "$regex": "(?i)mota"
					      },
					      "lastName": {
					         "$regex": "(?i)manhães"
					      }
					  },
					  "fields": [
						  "firstName",
						  "middleName",
						  "lastName",
						  "userID",
						  "phone1",
						  "email1",
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		},
		firstName_selector : {
				  "selector": {
					  	"firstName": {
					         "$regex": "(?i)marcelo"
					      }
				  	    },
					  "fields": [
						  "firstName",
						  "middleName",
						  "lastName",
						  "userID",
						  "phone1",
						  "email1",
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		},
		firstAndlastName_selector : {
				  "selector": {
					  	  "firstName": {
					         "$regex": "(?i)marcelo"
					      },			      
					      "lastName": {
					         "$regex": "(?i)manhães"
					      }
					  },
					  "fields": [
						  "firstName",
						  "middleName",
						  "lastName",
						  "userID",
						  "phone1",
						  "email1",
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		},
		firstAndMiddleName_selector : {
				  "selector": {
					  	  "firstName": {
					         "$regex": "(?i)marcelo"
					      },			      
					      "middleName": {
					         "$regex": "(?i)mota"
					      }
					  },
					  "fields": [
						  "firstName",
						  "middleName",
						  "lastName",
						  "userID",
						  "phone1",
						  "email1",
					  ],
					  "sort": [
					    {
					      "firstName": "asc"
					    }
					  ]
		}
	}
]
