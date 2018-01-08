// Logger
define(['jquery', 'scripts/tools/storagemanagement'], function($, SM){
	var exports = {};

	var log = exports.log = function(value){
		browser.storage.sync.get('identifier').then(function(result){
		var file = "Log_"+result["identifier"];



		$.post("http://fuasmattn.de/pwm_logserver/logger.php",
		{
			filename: file,
			log: value
		},
		function(data, status){
			// alert("Data: " + data + "\nStatus: " + status);
		});
			
		});
	};

	return exports;

});