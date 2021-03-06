var records = [
    { id: 1, username: 'ceai-geral', password: 'abibe2018', role: 'user', displayName: 'ceai-geral', emails: [ { value: 'marcelo.manhaes@hotmail.com' } ] }
  , { id: 2, username: 'ceai-admin', password: 'admin2018',  role: 'admin', displayName: 'ceai-admin', emails: [ { value: 'marcelo.manhaes@hotmail.com' } ] }
];

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      //console.log("Returning record",records[idx]);
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
};

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
    	console.log("Content",record);
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
};
