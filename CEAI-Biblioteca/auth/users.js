var records = [
    { id: 1, username: 'XXXXXX', password: 'XXXXXX', role: 'user', displayName: 'ceai-geral', emails: [ { value: 'XXXXXX' } ] }
  , { id: 2, username: 'XXXXXX', password: 'XXXXXX',  role: 'admin', displayName: 'ceai-admin', emails: [ { value: 'XXXXXX' } ] }
];

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      console.log("Returning record",records[idx]);
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
