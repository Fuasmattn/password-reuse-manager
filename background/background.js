
require(['scripts/modules/Logger', 'MVC_Controller_Managerpage', 'MVC_View_Managerpage', 'scripts/tools/showPW', 'scripts/tools/storagemanagement','scripts/tools/crypt', 'scripts/cryptojs/rollups/sha512'],
	function(Logger, controller, view, showPW, SM, crypt){


		var addBtn = document.querySelector('#addEntry');
		var addPWD = document.querySelector('#btnAddPWD');
		var addCategory = document.querySelector('#addCategory');
		var modalCategory = document.querySelector('#modalCategory');

		
		browser.runtime.onMessage.addListener(handleMessage);
		browser.tabs.onActivated.addListener(handleActivated);

		/* call init on page load */
		$(document).ready(function() {
			$.material.init();
			$('#section-categories').show();
			// $('[data-toggle="tooltip"]').tooltip(); // enable hover tooltips 

			setChallenge();
			setup();
			addListeners();
			controller.displayNumberEntries();
		});



//searches for entries and displays results matching the typed letters
function search(value){
	// console.log("search: " + value);
	showSection(null, '#section-searchresults');
	$('#section-searchresults h1').html("Results for: '" + value + "'");
	controller.search(value);
}


function showSection(clicked, section){
	var activeSection = $(section);
	$('.mp-section:not('+section+')').hide();
	activeSection.fadeIn();
	$('.sidebar-row').removeClass('active');
	if(clicked) clicked.addClass('active');
}

function addListeners(){
	// close FAB when clicked anywhere else
	$('.button-floating').on('click', function(e) {
		e.stopPropagation();
	});
	$(document).on('click', function(e){
		$('#fab_wrapper').removeClass('button-floating-clicked'); // close FAB
		// if(!$(e.target).hasClass('.entry-focused')){$('.entry-row').removeClass('entry-focused');} // unfocus entry
		$('#search').val('') // clear search input
	});

	$(document).on('click', '.editable', function(e){
		var elem = $(this).parent();
		if(!elem.hasClass('entry-focused')){
			var ID = elem.attr('id').split('_')[1];	
			var backup = elem.html();
			elem.addClass('entry-focused');
			var murl = elem.find('.uUrl').text();
			var username = elem.find('.uUsername').text();
			// var elem = elem;


			elem.find('.uUrl').html('<form role="form" data-toggle="validator"><div class="form-group edit has-feedback"><input class="form-control" id="updateUrl" type="url" value="'+murl+'" required/><span class="glyphicon form-control-feedback" ></span><div class="help-block with-errors"></div></div></form>');
			elem.find('.uUsername').html('<form role="form" data-toggle="validator"><div class="form-group edit has-feedback"><input class="form-control" id="updateUsername" value="'+username+'" required/><span class="glyphicon form-control-feedback" ></span><div class="help-block with-errors"></div></div></form>');
			// show entry actions + add store action
			elem.find('.entry-actions').replaceWith('<div class="col-lg-2 col-md-2 col-xs-2"><a class="updateConfirm btn btn-mp btn-primary"><i class="material-icons">check_circle</i></a></div><div class="col-lg-2 col-md-2 col-xs-2"></div><div class="col-lg-2 col-md-2 col-xs-2"><a class="updateCancel btn btn-mp btn-primary"><i class="material-icons">cancel</i></a></div>');

			// add listeners confirm & cancel
			$('.updateCancel').on('click', function(e){
				e.preventDefault();
				console.log(backup);
				elem.removeClass('entry-focused');
				elem.html(backup);
			});
			$('.updateConfirm').on('click', function(e){
				e.preventDefault();
				// validate form
				var validate = elem.find('form').validator('validate');
				if($(validate).find('.glyphicon-remove').length > 0){
					console.log("input validate error");
				}else{
					// update this entry
					updateEntry(ID);
					elem.removeClass('entry-focused');
					backup = backup.replace(murl, $('#updateUrl').val());
					backup = backup.replace(username, $('#updateUsername').val());
					elem.html(backup);
				}

			});
			// autocorrect if protocol is missing
			$('#updateUrl').on('focusout', function(){$(this).val(correctURL($(this).val()))});
		}
	});
	// $(document).on('keypress', function(e){
	// 	if(e.which == 99){ // 'c'
	// 		$('#modalCategory').modal('show');
	// 	}else if(e.which == 101){ // 'e'
	// 		$('#modal-newEntry').modal('show');
	// 	} 
	// });

	// add https://www. if not or partly typed
	$('#enterURL').on('focusout', function(e){
		var val = $(this).val();
		$(this).val(correctURL(val));
	});

	function correctURL(val){
		if(val!=''){
			var add = 'https://www.';
			val = val.replace('www.','');
			val = val.replace('https://','');
			val = val.replace('http://', '');
			val = add+val;
			return val;
		}else{
			return '';
		}
	}

	$(document).on('click', '.showPW', function(e){
		if(e.target.innerHTML == 'show'){
			showPW.trigger(($(this)));
			$('#modalMPW').on('shown.bs.modal', function (e) {
				$('#modalInputMPW').val('');
				$('#modalInputMPW').focus();
			});
			$('#modalMPW').modal('show');

		}else if(e.target.innerHTML == 'hide'){

			$(this).parent().parent().parent().find('.pwd-hidden').html('*******');
			$(this).html('show');

			// do nothing
		}
	});


	$('#sidebar-categories').on('click', function(){showSection($(this), '#section-categories');});
	$('#sidebar-unique').on('click', function(){showSection($(this), '#section-unique'); $('#sidebar-unique > .material-icons').removeClass('blink');});
	// $('#sidebar-modifications').on('click', function(){showSection($(this), '#section-modifications');});
	$('#sidebar-preferences').on('click', function(){showSection($(this), '#section-preferences');});
	$('#sidebar-about').on('click', function(){showSection($(this), '#section-about');});
	
	setupPWMeter();
	$('#preferences :checkbox').change(function(){
		if($(this).attr('id') == 'pref_autofill_username'){
			SM.updatePreferences($(this).attr('id'), this.checked);
		}
	});

	$('#pref_autofill_password').on('click', function(e){

		if((this.checked)){
			e.preventDefault();

			// show mpw input
			$('#modalMPW').modal('show');
			$('#modalMPW').on('keypress', function(e){
				if(e.which == 13){
					e.preventDefault();
					tmpStoreMPW();
				}
			});
			$('#modalMPW').on('click', '.confirm', function(e){
				e.preventDefault();
				tmpStoreMPW();
			});

		}else{
			SM.updatePreferences('pref_autofill_password', false);
			SM.setMPW('');
		}
	});
	// store mpw for auto-decryption for autofilling option
	function tmpStoreMPW(){
		// browser.storage.sync.get("mpw").then(function(res){
		// 	if(res['mpw'] == CryptoJS.SHA512($('#modalInputMPW').val()).toString()){
		// 		SM.setMPW($('#modalInputMPW').val());
		// 		$('#modalMPW').modal('hide');
		// 		// activate checkbox
		// 		$('#pref_autofill_password').prop('checked', true);
		// 		SM.updatePreferences('pref_autofill_password', true);

		// 	}else{
		// 		alert("Entered password was not correct.");
		// 	}
		// });

		doChallenge($('#modalInputMPW').val(),
			function(){
				SM.setMPW($('#modalInputMPW').val());
				$('#modalMPW').modal('hide');
				// activate checkbox
				$('#pref_autofill_password').prop('checked', true);
				SM.updatePreferences('pref_autofill_password', true);
			},
			function(){
				alert("Entered password was not correct.");
			}
			);

	}
	$('#burger').on('click', function(){toggleNavigation();});

	 // add event listeners to buttons and inputs
	 addPWD.addEventListener('click', showPWInput);
	 addBtn.addEventListener('click', function(){
	 	// trigger form validation
	 	var validate = $(this).parent().parent().find('form').validator('validate');
	 	// check if there are errors
	 	if($('#optionsRadios1').prop('checked')){
	 		if($(validate[0]).find('.glyphicon-remove').length > 0){
	 			console.log("input validate error");
	 		}else{
	 			controller.addEntry();
	 		}
	 	}else if($('#optionsRadios2').prop('checked')){
	 		if($(validate[0]).find('.glyphicon-remove').length > 0 ||
	 			$(validate[2]).find('.glyphicon-remove').length > 0){
	 			console.log("input validate error");
	 	}else{
	 		controller.addEntry();
	 	}
	 }

	});
	 addCategory.addEventListener('click', function(){
	 	// trigger form validation
	 	var validate = $(this).parent().parent().parent().find('form').validator('validate');
	 	// check if there are errors
	 	if($('#enter-category-pwd').hasClass('hidden')){
	 		if($('#modalCategoryName').parent().find('.glyphicon-remove').length > 0){
	 			console.log("input validate error");
	 		}else{
	 			toggleConfirm();

	 		}
	 	}else{
	 		if($('#enter-category-hint').val() != '' && $(validate[0]).find('.glyphicon-remove').length > 0){
	 			console.log("input validate error");
	 		}else{
	 			toggleConfirm();
	 		}
	 	}

	 });

	 var toggleConfirm = function(){
	 	console.log("View : toggleConfirm");
	 	$('#modalYesNo').toggleClass('hidden');
	 	$('#modalAction').toggleClass('hidden');
	 };

	 $('#modalYes').on('click', function(event){
	 	controller.createCategory();
	 	$('.panel-card').removeClass('category-focused');
	 });

	 $("#radio-form :input").change(function() {
	 	$('.option-pwd').toggleClass('hidden'); 
	 	$('.option-category').toggleClass('hidden'); 
	 });

	  //listen for searchfield input
	  $('#search').on('keyup', function() {
	  	if (this.value.length > 0) search(this.value);
	  });
	}

	function setup(){
		clearInputs(); 


 	//init storage logic
 	require(["MVC_Model"], function init(MVC_Model){
 		MVC_Model.initialize();
 	});

  	// reconfigure radiogroups
  	$('#optionsRadios1').prop('checked',true); 
  }

//listen for tab changes to trigger form-detection (no reload needed)
function handleActivated(activeInfo) {
	// console.log("Tab " + activeInfo.tabId +" was activated");
	// sendMessageToContentScript("task_detect");
}
function sendMessageToContentScript(msg) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, msg);
	});
}
function toggleNavigation(){
	if($('#sidebar').hasClass('minified')){
		$('#sidebar .material-icons').animate({left: '24px'});
		$('#sidebar').animate({left: '0'}); 
		$('#sidebar').removeClass('minified');
		$('#sidebar p').animate({opacity : '1'});
	}else{
		$('#sidebar').addClass('minified');
		$('#sidebar .material-icons').animate({left: '24px'});
		$('#sidebar').animate({left: '-240px'}); 
		$('#sidebar p').animate({opacity : '0'});
	}
}
function onError(e){
	Logger.log({event: "Error", content : e});
	console.log(e);
}
function clearInputs(){
	
	view.clearInputs();
}
//receives and answers messages from content_scripts [if needed]
function handleMessage(message, sender, sendResponse) {
	console.log("Message received: " + message);
	// console.log(sender);
	if(message.task == 'test'){
		console.log(message.task);
		sendResponse("test received");
	}else if(message.task == 'store'){
		sendResponse({msg: 'ok'});
		// console.log("store msg");
		// TODO check if storing was successful and answer appropriately
		// browser.runtime.sendMessage({'msg': 'ok'},function(response){});
		require(['MVC_Controller_Managerpage'], function(controller){
			controller.quickAddEntry(message.url, message.username, message.cat, message.pw, message.pws);
		});
		
	}else if(message.task == 'showPW'){
		// var msg = {action : "requestPW", content: "hallo"};
		// sendResponse(msg);
		controller.requestPassword(message.url, message.entryType, message.hash, message.category); //passing sendresponse not working
	}else if(message.task == 'addHint'){
		console.log("check");
		changeBrowserAction(false);
	}else if(message.task =="removeHint"){
		changeBrowserAction(true);
	}else if(message.task =="log"){
		Logger.log(message.content);
	}else if(message.task == "decrypt"){
		console.log("msg task decrypt received");
		controller.decrypt(message.content, message.target);
	}else if(message.task == "requestAutofillPW"){
		console.log("received requestAutofillPW");
		browser.storage.sync.get('preferences').then((results) =>{
			if(results.preferences['pref_autofill_password']){
				controller.decryptWithTarget(message.password);
			}else{
				console.log("Password autofill disabled");
			}
		});
	}else if(message.task == "open_manager"){
		openBackground();
	}else if(message.task == "checkAccount"){
		var content = message.content;
		controller.checkAccount(content.username, content.url);
	}else if(message.task == "getCategories"){
		SM.getCategories(function(results){
			sendMessageToContentScript({action : "fillList", items : results});
		});

	}
	
}
function setChallenge(){
	console.log("setChallenge");
// store encrypted object for login challenge
// SM.getChallenge(function(result){
	browser.storage.sync.get('challenge').then((results) =>{
		if(!results['challenge']){
			var challengeObject = "4815162342";
			controller.setChallenge(challengeObject);
			console.log("new challenge stored");
		}else{
			console.log("challenge found");

		}
	});
}
//programmatically preselect options in dropdown
function setSelectedIndex(select, index){
	select.options[index-1].selected = true;
	return;
}
function showPWInput(){
	
	view.showPWInput();
}
});


function changeBrowserAction(add){
	console.log("Background : changeBrowserAction");
	console.log(add);
	var icon1 = chrome.extension.getURL("icons/icon-48.png");
	var icon2 = chrome.extension.getURL("icons/icon-48_add.png");

	if(add)
		chrome.browserAction.setIcon({path: icon1});
	else
		chrome.browserAction.setIcon({path: icon2});
}



function setupPWMeter(){
	var options = {
		common: {
			zxcvbn : true,
			zxcvbnTerms: ["123456","123456789","qwerty","qwertz","12345678","111111","1234567890","1234567","password","123123","987654321","qwertyuiop","mynoob","123321","666666","18atcskd2w","7777777","1q2w3e4r","654321","555555","3rjs1la7qe","google","1q2w3e4r5t","123qwe","zxcvbnm","1q2w3e"],
			userInputs: ['#modalCategoryName']

		}

	};

	$('input[type="password"]:not(#modalInputMPW)').on('keyup', function(event) {
		if($(this).val().length > 0){
			$('.progress').show();
			$('.password-verdict').show();
		}else{
			$('.progress').hide();
			$('.password-verdict').hide();
		}
	});
	$('input[type="password"]:not(#modalInputMPW)').pwstrength(options);
	$('.progress').addClass("strength");
	$('.progress').hide();
}


function openBackground(){
	browser.windows.create({
		"url": "/login/login.html",
		type: "panel",
		height: 600,
		width: 600
	});
}

function updateEntry(id){
	require(['MVC_Controller_Managerpage'], function(controller){
		controller.updateEntry(id);
	});
}

function doChallenge(passphrase, success, failure){
	browser.storage.sync.get('challenge').then((res) =>{
		console.log("doing challenge: " + passphrase);

		require(['scripts/tools/crypt'], function(crypt){
				// console.log(res);
				crypt.decrypt_rsa(res['challenge'], passphrase, function(result){
					// console.log(result);
					if(result){
						success();
					}else{
						failure();
					}

				});

			});
	});
	
}


