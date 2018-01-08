/* login.js */
$(document).ready(function() {
	$.material.init();
	//if no rsa key pair was set in local storage: init onboarding
	// var getting = browser.storage.sync.get("rsa_enc");
	var getting = browser.storage.sync.get("challenge");
	getting.then((results) => {
		if(results["challenge"] == null){
			initOnboarding();
		}else{
			initLogin();
		}
	});

});

// show onboarding ui elements
function initOnboarding(){
	// set default webexID for Logging
	browser.storage.sync.set({"webexID" : "123456789"});
	
	var slide = 0;
	console.log("Function : initOnboarding");
	$('.onboarding').removeClass("hidden");
	//TODO check options
	var options = {
		common: {
			zxcvbn : true,
			zxcvbnTerms: ["123456","123456789","qwerty","qwertz","12345678","111111","1234567890","1234567","password","123123","987654321","qwertyuiop","mynoob","123321","666666","18atcskd2w","7777777","1q2w3e4r","654321","555555","3rjs1la7qe","google","1q2w3e4r5t","123qwe","zxcvbnm","1q2w3e"]	
		}	
	};
	$('#inputCreateMPW').on('keyup', function(event) {
		if($(this).val().length > 0){
			$('.progress').show();
			$('.password-verdict').show();
			$('.onboarding a.btn-mp').show();
		}else{
			$('.progress').hide();
			$('.password-verdict').hide();
			$('.onboarding a.btn-mp').hide();
		}
	});
	$('#inputCreateMPW').pwstrength(options);
	$('.progress').addClass("strength");
	$('.onboarding a.btn-mp').hide();
	$('.progress').hide();
	$('.password-verdict').hide();
	$('#next .material-icons').on('click', function(){	
		if(++slide == $('.slide').length-1){
			$('.slide').animate({"left": "-=600"}, 500);
			$('#next').fadeOut();
		}else{
			$('.slide').animate({"left": "-=600"}, 500);
		}
	});
	$('#btnOpenManager').on('click', function(){
		var mode = $('input:radio:checked').val();
		// console.log(mode);
		browser.storage.sync.set({'mode' : mode});
		openManager();
	});
	
}
function openManager(){
	var gettingAllWindows = browser.windows.getAll();
	gettingAllWindows.then(function(aRes){
		var gettingCurrent = browser.windows.getCurrent();
		gettingCurrent.then(function(cRes){

			var createTab = chrome.tabs.create({
						"url": chrome.extension.getURL("background/background.html")
			});
			for (var i = 0; i < aRes.length; i++) {
				if(aRes.length == 1){
					// console.log("length: 1");
					var removing = browser.windows.remove(cRes.id);
					var creatingWindow = browser.windows.create({
						"url": chrome.extension.getURL("background/background.html"),
						"state": "maximized"
					});
					
				}else{
					if(aRes[i].id != cRes.id && aRes[i].type == "normal"){
					//no other window is opened -> open in new window

					//close self and open in any other opened window as a tab
					var removing = browser.windows.remove(cRes.id);
					var createTab = chrome.tabs.create({
						"url": chrome.extension.getURL("background/background.html"),
						"windowId": aRes[i].id
					});
					createTab.then(function(){
						browser.windows.update(aRes[i].id,{"focused":true})
					});
					

				}else{
					chrome.tabs.create({
						"url": chrome.extension.getURL("background/background.html")
					});

				}
			}
		}		
	});
	});
}
$(document).keypress(function(e) {
	// ENTER KEY PRESSED
	if(e.which == 13) {
		e.preventDefault();
		// case: enter MPW for login challenge
		if(!$('.login').hasClass('hidden')){
			var mpw = $('#inputMPW_login').val();
			doChallenge(mpw,		
				function(){ openManager();},
			 	function(){ alert('Your Masterpassword was not correct.');} // failure
			 	);
		}else{
			// case: enter new MPW
			if(!$('.onboarding').hasClass('hidden')){
				var mpw = $('#inputCreateMPW').val();
				//store mpw (deleted after check)
				// console.log(CryptoJS.SHA512(mpw).toString());
				browser.storage.sync.set({"mpw" : CryptoJS.SHA512(mpw).toString()});
				$('.onboarding').fadeOut().addClass('hidden');
				$('.onboarding_2').removeClass('hidden').fadeIn();
			// case: confirm MPW
		}else if(!$('.onboarding_2').hasClass('hidden')){
			var mpwr = CryptoJS.SHA512($('#inputConfirmMPW').val()).toString();
			var mpw = $('#inputConfirmMPW').val();
			doubleCheckMPW(mpwr,
				function(){
					$('.onboarding_2').fadeOut().addClass('hidden');
					$('.onboarding_3').removeClass('hidden').fadeIn();
					createRSAKeys(mpw);
					browser.storage.sync.remove('mpw');
				},
				function(){
					// $('#inputCreateMPW').addClass("");
					alert("Passwords do not match!");
				});
		}
	}
}
});

function doChallenge(passphrase, success, failure){
	browser.storage.sync.get('challenge').then((results) =>{
		require(['../background/scripts/tools/storagemanagement', 'logincrypt', 
			], function(SM, crypt){
			SM.getChallenge(function(res){
				// console.log(res);
				console.log(res);
				crypt.decrypt_rsa(res, passphrase, function(result){
					// console.log(result);
					if(result){
						success();
					}else{
						failure();
					}
				});
			});
		});
	});
}
$('#restart').click(function(){
	browser.storage.sync.set({"mpw" : {}});
	// empty input
	$('#inputCreateMPW').val('');
	// hide pwmeter
	$('.progress').hide();
	$('.password-verdict').hide();
	// hide btn
	$('.onboarding a.btn-mp').hide();
	// show first slide
	$('.onboarding_2').fadeOut().addClass('hidden');
	$('.onboarding').removeClass('hidden').fadeIn();
});
$('.onboarding a.btn-mp').click(function(){
	var mpw = $('#inputCreateMPW').val();
	
	browser.storage.sync.set({"mpw" : CryptoJS.SHA512(mpw).toString()});
	$('.onboarding').fadeOut().addClass('hidden');
	$('.onboarding_2').removeClass('hidden').fadeIn();
});
$('.onboarding_2 a.btn-mp').click(function(){
	var mpwr = CryptoJS.SHA512($('#inputConfirmMPW').val()).toString();
	var mpw = $('#inputConfirmMPW').val();
	// console.log(mpwr);
	doubleCheckMPW(mpwr,
		function(){
			$('.onboarding_2').fadeOut().addClass('hidden');
			$('.onboarding_3').removeClass('hidden').fadeIn();
			createRSAKeys(mpw);
			browser.storage.sync.remove('mpw');
		},
		function(){
			// $('#inputCreateMPW').addClass("");
			alert("Passwords do not match!");
		});
});
function createRSAKeys(mpw){
	var passphrase = mpw;
	// console.log(passphrase);
	var bits = 2048;

	// create RSA Key pair
	var mRSAkey = cryptico.generateRSAKey(passphrase, bits);
	// create encryption key based on mpw
	var salt = CryptoJS.lib.WordArray.random(128/8);
	var key = CryptoJS.PBKDF2(mpw, salt, {
		keySize: 256/32, 
		iterations: 100
	});

	browser.storage.sync.set({'enc-key' : key});
	// extract public key and store it [rsa_public]
	var mPublicKeyString = cryptico.publicKeyString(mRSAkey); 
	browser.storage.sync.set({'public_rsa' : mPublicKeyString});  

    // serialize rsa object for encryption
    var RSAKeyString = JSON.stringify(mRSAkey);
	// encrypt rsa object using encryption key and store it [rsa_enc]
	var iv = CryptoJS.lib.WordArray.random(128/8);
	var enc = CryptoJS.AES.encrypt(RSAKeyString,key, {
		iv : iv,
		padding: CryptoJS.pad.Pkcs7,
		mode: CryptoJS.mode.CBC
	});

	var encrypted_rsa = salt.toString() + iv.toString() + enc.toString();
	browser.storage.sync.set({'rsa_enc' : encrypted_rsa});
	
}
function doubleCheckMPW(a, doNext, showError){
	console.log("Function : doubleCheckMPW");
	// console.log(a);
	var callback = function(res){
		if(a==res.mpw){
			doNext();
			// delete mpw from local storage
			// browser.storage.sync.set({"mpw" : {}});
		}else{
			showError();
		}
	}
	getMPW(callback);
}
function getMPW(callback){
	browser.storage.sync.get("mpw").then(function(res){callback(res);
	});
}
// show and setup login ui elements
function initLogin(){
	console.log("Function : initLogin");
	$('#inputMPW_login').get(0).focus();

	$('#submitlogin').on('click', function(e){
		e.preventDefault();
		var mpw = $('#inputMPW_login').val();
		doChallenge(mpw,		
			function(){ openManager();},
			 	function(){ alert('Your Masterpassword was not correct.');} // failure
		);
	});

	var gettingCurrent = browser.windows.getCurrent();
	gettingCurrent.then(function(cRes){
		browser.windows.update(cRes.id,{"height":300});
	});
	$('.login').removeClass("hidden");

}
