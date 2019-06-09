
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
		book : {name: "ceai-books"}
};

exports.selectors={};

exports.selectors={
		"category":{
			   "selector": {
				      "category": "Romance"
				   },
				   "fields": [
				      "_id",
				      "_rev",
				      "bookID",
				      "isbn",
				      "author",
				      "espAuthor",
				      "category",
				      "bookName",
				      "amount",
				      "loan",
				      "available",
				      "userIDs"
				   ],
				   "sort": [
				      {
				         "isbn": "asc"
				      }
				   ]
		},
		"bookID":{
			   "selector": {
				      "bookID": "1234568"
				   },
				   "fields": [
				      "_id",
				      "_rev",
				      "bookID",
				      "isbn",
				      "author",
				      "espAuthor",
				      "category",
				      "bookName",
				      "amount",
				      "loan",
				      "available",
				      "userIDs"
				   ],
				   "sort": [
					      {
					         "_id": "asc"
					      }
				]
		},
		"isbn":{
			   "selector": {
				      "isbn": "1234568"
				   },
				   "fields": [
				      "_id",
				      "bookID",
				      "isbn",
				      "author",
				      "espAuthor",
				      "category",
				      "bookName",
				      "amount",
				      "loan",
				      "available",
				      "userIDs"
				   ],
				   "sort": [
				      {
				         "isbn": "asc"
				      }
				   ]
		},
		"bookName":{
			   "selector": {
				      "$or": [
				         {
				            "bookName": {
				               "$regex": ".*(?i)(<ENTRY>).*"
				            }
				         },
				         {
				            "bookName": {
				               "$regex": "(?i)(<ENTRY>).*"
				            }
				         }
				      ]
				   },
				   "fields": [
					   "_id",
					   "_rev",
					   "bookID",
					   "isbn",
					   "author",
					   "espAuthor",
					   "category",
					   "bookName",
					   "amount",
					   "loan",
					   "available",
					   "userIDs"
				   ],
				   "sort": [
				      {
				         "_id": "asc"
				      }
				   ]
		},
		"author":{
			   "selector": {
				      "$or": [
				         {
				            "author": {
				               "$regex": ".*(?i)(<ENTRY>).*"
				            }
				         },
				         {
				            "author": {
				               "$regex": "(?i)(<ENTRY>).*"
				            }
				         }
				      ]
				   },
				   "fields": [
					   "_id",
					   "bookID",
					   "isbn",
					   "author",
					   "espAuthor",
					   "category",
					   "bookName",
					   "amount",
					   "loan",
					   "available",
					   "userIDs"
				   ],
				   "sort": [
				      {
				         "_id": "asc"
				      }
				   ]
		},
		"espAuthor":{
			   "selector": {
				      "$or": [
				         {
				            "espAuthor": {
				               "$regex": ".*(?i)(<ENTRY>).*"
				            }
				         },
				         {
				            "espAuthor": {
				               "$regex": "(?i)(<ENTRY>).*"
				            }
				         }
				      ]
				   },
				   "fields": [
					   "_id",
					   "bookID",
					   "isbn",
					   "author",
					   "espAuthor",
					   "category",
					   "bookName",
					   "amount",
					   "loan",
					   "available",
					   "userIDs"
				   ],
				   "sort": [
				      {
				         "_id": "asc"
				      }
				   ]
		},
		"stockBook":{
		  "selector": {
			    "bookID" : ""
			  },
			  "fields": [
				"bookID",
				"_id",
			    "_rev",
			    "isbn",
			    "author",
			    "espAuthor",
			    "bookName",
			    "category",
			    "amount",
			    "loan",
			    "available",
			    "userIDs"
			  ]
		},
		"loan":{
		  "selector": {
			    "bookID" : ""
			  },
			  "fields": [
				"bookID",
				"_id",
			    "_rev",
			    "isbn",
			    "author",
			    "espAuthor",
			    "bookName",
			    "category",
			    "amount",
			    "loan",
			    "available",
			    "userIDs"
			  ]
		},
		"userID":{
			   "selector": {
				      "book": {
				         "$elemMatch": {
				            "bookID": "2017-12-12-18-27-29-741"
				         }
				      },
				      "userID": "2017-10-6-21-35-36-580"
				   },
				   "fields": [
				      "userID",				      
				      "firstName",
				      "middleName",
				      "lastName",
				      "book"
				   ],
				   "sort": [
				      {
				         "userID": "asc"
				      }
				   ]
		},
		"loanID":{
			   "selector": {
				      "book": {
				         "$elemMatch": {
				            "loanID": "2017-12-12-18-27-29-741"
				         }
				      },
				      "userID": "2017-10-6-21-35-36-580"
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
				   ],
				   "sort": [
				      {
				         "userID": "asc"
				      }
				   ]
		},		
		"newLoan":{
			   "selector": {
				        "userID": "2017-10-6-21-35-36-580"
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
				   ],
				   "sort": [
				      {
				         "userID": "asc"
				      }
				   ]
		},
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
				    "book"
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
				    "book"
			  ],
			  "sort": [
			    {
			      "firstName": "asc"
			    }
			  ]
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
				  "book"
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
			    "book"
			  ],
			  "sort": [
			    {
			      "firstName": "asc"
			    }
			  ]
};

exports.book = {
		 "bookID": "2018-11-0-10-46-51-541",
		 "isbn": "",
		 "author": "FRANCISCO CÂNDIDO XAVIER",
		 "espAuthor": "",
		 "category": "Crônicas",
		 "bookName": "CRÔNICAS DE ALÉM-TÚMULO",
		 "available": "",
		 "amount": "",
		 "userIDs": []
}

exports.searchError = {
		"error":""
};
