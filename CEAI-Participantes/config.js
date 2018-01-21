
exports.cloudant = {
		  instance: "CloudantCEs",
		  username: "5ed24b63-560a-49da-9f7b-08d641077e1f-bluemix",
		  password: "dad79337e9ac8bb06f0802b0a1be0eec31824a4a32755ec57ed0ef8caf986f82",
		  host: "5ed24b63-560a-49da-9f7b-08d641077e1f-bluemix.cloudant.com",
		  port: 443,
		  url: "https://5ed24b63-560a-49da-9f7b-08d641077e1f-bluemix:dad79337e9ac8bb06f0802b0a1be0eec31824a4a32755ec57ed0ef8caf986f82@5ed24b63-560a-49da-9f7b-08d641077e1f-bluemix.cloudant.com"
};

exports.database = {
		person : {name: "ceai"}
};

exports.fullName_selector ={
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
};

exports.firstName_selector ={
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
};

exports.userID ={};

exports.userID.selectors = { 
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
			    "phone1",
			    "whatsup1",
			    "phone2",
			    "whatsup2",
			    "email1",
			    "email2",
			    "association",
			    "work",
			    "study",
			    "book"
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
			    "postCode"
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
			}
};

exports.firstAndlastName_selector ={
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
};

exports.firstAndMiddleName_selector ={
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
};

exports.searchError = {
		"error":""
};
