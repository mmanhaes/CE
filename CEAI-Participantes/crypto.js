/**
 * http://usejsdoc.org/
 */
const crypto = require('crypto');

const algorithm = 'aes-192-cbc';
const password = 'Abibe Isfer de todos nos';
// Key length is dependent on the algorithm. In this case for aes192, it is
// 24 bytes (192 bits).
// Use the async `crypto.scrypt()` instead.
const key = crypto.scryptSync(password, 'salt', 24);
// The IV is usually passed along with the ciphertext.
const iv = Buffer.alloc(16, 0); // Initialization vector.

function encrypt(clearText,cb){

	try{		
		var cipher = crypto.createCipheriv(algorithm, key, iv);
		
		let encrypted = '';
		cipher.on('readable', () => {
		  let chunk;
		  while (null !== (chunk = cipher.read())) {
		    encrypted += chunk.toString('hex');
		  }
		});
		cipher.on('end', () => {
		  return cb(encrypted);
		  // Prints: e5f79c5915c02171eec6b212d5520d44480993d7d622a7c4c2da32f6efda0ffa
		});
		
		cipher.write(clearText);
		cipher.end();
	}
	catch(err) {
		console.log("Error in Encrypt password Error:",err);
	}
}

function decrypt(encrypted,cb){
	var decipher = crypto.createDecipheriv(algorithm, key, iv);
	
	let decrypted = '';
	decipher.on('readable', () => {
	  while (null !== (chunk = decipher.read())) {
	    decrypted += chunk.toString('utf8');
	  }
	});
	decipher.on('end', () => {
	  return cb(decrypted);
	  // Prints: some clear text data
	});

	decipher.write(encrypted, 'hex');
	decipher.end();
}

//DANGEROUS TO HAVE THIS ON THE CLOUD
if (require.main === module) {
	var args = process.argv.slice(2);
	encrypt(args[0],function(encrypted){
		console.log("Password Encrypted:",encrypted);
		decrypt(encrypted,function(decrypted){
			console.log("Password Decrypted:",decrypted);
		});
	});
}


module.exports.encrypt = encrypt;
