 
define(['aes','SM', 'pbkdf2', 'rsa', 'cryptico'],
	function(aes, sl, pbk, rsa){
		console.log("Crypt called");
		return{
			encrypt_rsa:  function(msg, callback){
				if(msg==null){
					callback(null);
				}else{
					sl.getPublicKey(function(publicKey){
						var encryptionResult = cryptico.encrypt(msg, publicKey);
						// console.log(encryptionResult.cipher);
						callback(encryptionResult);
					}); 
				}
			},

			decrypt_rsa:  function(encryptedObject, passphrase, callback){
				// recreate rsa key
				var mRSAkey = cryptico.generateRSAKey(passphrase, 2048);
				// decrypt message using RSA Key
				var decryptionResult = cryptico.decrypt(encryptedObject.cipher, mRSAkey);

				callback(decryptionResult.plaintext);
			},

			auto_decrypt_rsa:  function(encryptedObject, callback){
			// working version where rsa key is recreated with stored mpw
			sl.getMPW(function(result){
				// recreate rsa key
				var mRSAkey = cryptico.generateRSAKey(result, 2048);
				// decrypt message using RSA Key
				var decryptionResult = cryptico.decrypt(encryptedObject.cipher, mRSAkey);

				callback(decryptionResult.plaintext);
			});

			// version 2 (better but not working yet) where PK is stored encrypted, here loaded and decrypted via stored Key Deviration (no mpw has to be stored)
			// sl.getRSAKeys(function(result){
			// 	var enc_RSAkey = result;
			// 	// decrypt rsakey using stored key
				
			// 	var salt = CryptoJS.enc.Hex.parse(enc_RSAkey.substr(0,32)); 
			// 	var iv = CryptoJS.enc.Hex.parse(enc_RSAkey.substr(32,32)); 
			// 	var encrypted = enc_RSAkey.substring(64);
			// 	console.log(encrypted);
			// 	sl.getEncryptionKey(function(res){
			// 		console.log(res);
			// 		var dec_RSAkey = CryptoJS.AES.decrypt(encrypted, res,{ 
			// 			iv: iv, 
			// 			padding: CryptoJS.pad.Pkcs7, 
			// 			mode: CryptoJS.mode.CBC 
			// 		});
			// 		console.log(dec_RSAkey);
			// 		var decryptionResult = cryptico.decrypt(encryptedObject.cipher, dec_RSAkey);
			// 		callback(decryptionResult.plaintext);
			// 		});
			// 	});

			}	

		}
	});



