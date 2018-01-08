// For any third party dependencies, like jQuery, place them in the lib folder.

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.

requirejs.config({
	
	paths: {
		SM: 'storagemanagement',
		aes: '../background/scripts/cryptojs/rollups/aes',
		pbkdf2: '../background/scripts/cryptojs/rollups/pbkdf2',
		rsa: '../background/scripts/cryptico/rsa',
		cryptico: '../background/scripts/cryptico/cryptico'

	}
});

requirejs(['login.js']);