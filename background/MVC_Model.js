define(["scripts/modules/Logger", "jquery","psl","scripts/tools/tools","scripts/cryptojs/rollups/aes","MVC_Controller_Managerpage","scripts/tools/crypt", "scripts/tools/storagemanagement"], 
	function(Logger, $,psl,tools,aes,controller,crypt, SL) {
		var exports = {};

		var initialize = exports.initialize = function() {
			console.log("Model : initialize");
			SL.createExtensionIdentifier(); 
			SL.initPreferences(function(results){controller.updatePreferences(results);});
			SL.getCategories(function(results){
				SL.getOnboardingMode(function(mode){
					var categories = results["categories"];
					if(categories == null || categories.length == 0){
						var cat;
				// create first categories depending on what user chose in onboarding
				console.log(mode['mode']);
				Logger.log({event : "Onboarding Option", content: mode['mode']});
				
				switch(mode['mode']){
					case 'mode_topic':
					cat = {"categories" : {
						Private : ["private", "folder_open"],
						Work : ["work", "folder_open"],
						Banking : ["banking", "folder_open"]
					}};
					break;
					case 'mode_importance':
					cat = {"categories" : {
						Very_Important : ["very important", "folder_open"],
						Important : ["important", "folder_open"],
						Less_Important : ["less important", "folder_open"]
					}};
					break;
					case 'mode_frequency':
					cat = {"categories" : {
						Daily : ["daily", "folder_open"],
						Weekly : ["weekly", "folder_open"],
						Less_Frequent : ["less frequent", "folder_open"]
					}};
					break;
					case 'mode_hints':
					cat = {"categories" : {
						Create_Your_Categories : ["none set", "folder_open"]
					}};
					break;
				}


				var setting = browser.storage.sync.set(cat);
				setting.then(function(){
					controller.fillDropdown(cat.categories);
					controller.displayCategories(cat.categories, true); //calls loadEntries on callback
				});	

			}else{
					//display options in dropdown #categoryDropdown
					controller.fillDropdown(categories);
					controller.displayCategories(categories, true); //calls loadEntries on callback
				}
			});

			});
		};
		var loadEntries = exports.loadEntries = function(categoryName, showOnlyUnique){
			console.log("Model : loadEntries");
			SL.getEntries(function(results){
				var res = results["entries"];
				console.log(results);
				//create empty entries-storage if empty
				if(res == null){
					browser.storage.sync.set({"entries" : {}});
				}

				
				if(showOnlyUnique && !jQuery.isEmptyObject(res)){
					$('#uniqueEntryContainer').empty();
				}
				for(key in res){	
					if(showOnlyUnique){
						if(categoryName == null && res[key].category == null){
							controller.displayEntry(key, res[key], false); //hasCategory==false
						}

					}else{
						if(res[key].category == categoryName){
							controller.displayEntry(key,res[key], true);
						}
					}
				}
			});
		};
		var storeEntry = exports.storeEntry = function(randID, mCredential, toggleModal) {
			console.log("Model : storeEntry");	
			crypt.encrypt_rsa(mCredential.password, function(data){	
				mCredential.creationDate = tools.getDate();
				if(mCredential.password != null && data !=null) mCredential.password = data;
				console.log(mCredential);
				//first get current storage
				// SL.getEntries(function(results){
					// var entries = results;
					//check if there is an entry with the same url
					// if(entries.entries != null && entries.entries[mUrl] != null){
					// 	// TODO allow multiple entries with same url
					// 	alert("You have already stored an entry for "+ mUrl +". It's assigned to category " + entries.entries[mUrl].category);

					// }else{
						//push new entry
						// entries.entries[randID] = mCredential;
						//store changes
						SL.saveEntry(randID, mCredential, function(res){
						// SL.setEntries(entries, function(){
							//update display entries immediately that do not have a category
							//or if the chosen category is focused
							var focusedCategory = document.querySelector('.category-focused');
							if(focusedCategory!=null) var focusedCategoryName = focusedCategory.getAttribute('id').split('_')[1];
							if(mCredential.category == null ){
								controller.displayEntry(randID, mCredential, false);
								// activate blinking
								$('#sidebar-unique > .material-icons').addClass('blink');
							}else if(focusedCategoryName != null && mCredential.category == focusedCategoryName){
								controller.displayEntry(randID, mCredential, true);
							}
							controller.displayNumberEntries();
							
						});
						// }, onError);
						//close modal
						if(toggleModal) $('#modal-newEntry').modal('toggle');
					// }

			// });		
		});
		};
		var addEntry = exports.addEntry = function() {
			console.log("Model : addEntry");
			/* initialise variables */
		//check radio buttons
		var useUniquePWD = false;
		var selectedRadio = document.querySelector('.radio-option:not(.hidden)');
		var selectedOption = selectedRadio.getAttribute("value");
		
		if(selectedOption == "option-category"){
			var inputCategoryDropdown = document.querySelectorAll('option:checked');
			var entryCategory = inputCategoryDropdown[0].value;
			
		}else{ //option-pwd
			var pwd = document.querySelector('#enterPWD').value;
			useUniquePWD = true;
		}
		
		var randID = tools.guidGenerator();
		var iurl = document.querySelector('.url');
		//extract location.origin from URL
		var pathArray = iurl.value.split( '/' );
		var protocol = pathArray[0];
		var host = pathArray[2];
		var entryURL = protocol + '//' + host;

		var inputUsername = document.querySelector('.username');

		var entryUsername = inputUsername.value;
		
		//dirty! 
		//added for testing purpose
		//google uses 2 steps for logins
		var mUrl;
		if(entryURL.indexOf('google')>0){
			mUrl = "https://accounts.google.com";
		}
		else{
			mUrl = entryURL;
		}
		if(useUniquePWD){
			var pwStrengthValue = ($('#modal-newEntry .progress-bar').width() / $('#modal-newEntry .progress').width());
			console.log("strength: " + pwStrengthValue);
			var credential = {username: entryUsername, url: mUrl, password: pwd, pwStrength: pwStrengthValue};
			Logger.log({event: 'Add Entry', content: {mUrl}});
			storeEntry(randID, credential, true);

		}else{
				// if(objTest.length < 1 && mUrl !== '' && entryUsername !== '') {
					mUrl.value = ''; entryUsername.value = ''; entryCategory.value ='';
					var credential = {category: entryCategory, username: entryUsername, url: mUrl};
					Logger.log({event: 'Add Entry', content: {entryCategory, mUrl}});
				// }
				storeEntry(randID, credential, true);
			}
		// }, onError);	
	};
	var updateEntry = exports.updateEntry = function(id, murl, username){
		SL.updateEntry(id, murl, username, function(entry){
			console.log(entry);
			// controller.displayEntry(id, entry, entry.category!=null);
		});
	};
	var quickAddEntry = exports.quickAddEntry = function(murl, musername, mcat, mpw, mps) {
		console.log("Model : addEntry (quick)");
		/* initialise variables */
		//check radio buttons
		var useUniquePWD = (mpw != null);
		
		var entryCategory = mcat;			
		var randID = tools.guidGenerator();

		//extract location.origin from URL
		var pathArray = murl.split( '/' );
		var protocol = pathArray[0];
		var host = pathArray[2];
		var entryURL = protocol + '//' + host;

		var entryUsername = musername;

		// var gettingItem = browser.storage.sync.get(entryURL);
		// gettingItem.then((result) => {
		// 	var objTest = Object.keys(result);

		if(useUniquePWD){
			var credential = {username: entryUsername, url: entryURL, password: mpw, pwStrength: mps};
			storeEntry(randID, credential, false);
		}else{
				// if(objTest.length < 1 && entryURL !== '' && entryUsername !== '') {
					// entryURL.value = ''; entryUsername.value = ''; entryCategory.value ='';
					var credential = {category: entryCategory, username: entryUsername, url: entryURL};
				// }
				storeEntry(randID, credential, false);
			}
		// }, onError);
	};
	var search = exports.search = function(value){
		SL.findEntries(value, function(results){
			controller.displaySearchResults(results);
		});
	};
	var setChallenge = exports.setChallenge = function(challengeObject){
		crypt.encrypt_rsa(challengeObject, function(data){	
			SL.setChallenge(data);
		});
	};
	var decrypt = exports.decrypt = function(content, callback){
		crypt.auto_decrypt_rsa(content, function(dec){
			// console.log(dec);
			callback(dec);
		});
	};
	var checkAccount = exports.checkAccount = function(username, mUrl){
		SL.findEntryByURL(mUrl, function(result){
			var found = false;
			for(key in result){
				if(username == result[key].username){
					found = true;
				}
			}
			// in case there was no entry found for this url with this specific username
			// show a hint in browser-action icon and prefill username when clicked on it
			if(!found){
				SL.setUsernameQuickAdd(username); 
				browser.runtime.sendMessage({task : 'addHint'});
			}
		});
	};

	//private functions
	var initCategories = function(){
		console.log("Model : initCategories");
		browser.storage.sync.set({"categories" : {}});
	};
	var onError = function(e){
		
		console.log(e);
	};

	return exports;
	
});