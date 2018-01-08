define(['scripts/tools/tools', 'scripts/tools/showPW','scripts/tools/crypt','jquery', 'scripts/tools/storagemanagement', 'MVC_Controller_Managerpage', 'psl'],
	function(tools, showPW, crypt, $, SM, controller, psl) {
		var exports = {};

		var displayEntry = exports.displayEntry = function(randID, urlName, credential, hasCategory) {

			console.log("View : displayEntry");
			var entryContainer, content;
			// display as Entry inside a Reused Password
			if(credential.category != null){
				entryContainer = document.querySelector('#entryContainer');
				content = '<div class="col-lg-3 col-md-3 col-xs-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="uUrl editable col-lg-3 col-md-3 col-xs-3">'+ credential.url +'</div><div class="uUsername editable col-lg-3 col-md-3 col-xs-3">'+ credential.username +'</div><div class="col-lg-3 col-md-3 col-xs-3"><div class="row"><div class="col-lg-6 col-md-6 col-xs-6">'+ credential.creationDate +'</div><div class="entry-actions"><div class="col-lg-2 col-md-2 col-xs-2"></div><div class="col-lg-2 col-md-2 col-xs-2"><a><i id="'+ randID +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2 col-md-2 col-xs-2"><a id="open_'+credential.url+'" href="'+credential.url+'" target="_blank"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
			}else{
				// display as Unique Entry
				entryContainer = document.querySelector('#uniqueEntryContainer');
				entryContainer.style.display = '';
				// hardcoded width.. progressbar has 200px width
				pwStrength = credential.pwStrength;
				var progressBarColor;
				var pws = pwStrength * 200;
				var pwStrengthCalc = pws + "px";
				if(pws < 180){progressBarColor = "progress-bar-danger";}else{progressBarColor = "progress-bar-success";}

				// content = '<div class="col-lg-1 col-md-1 col-xs-1"><a><img class="placeholder-img" src=""></a></div><div class="uUrl editable col-lg-3 col-md-3 col-xs-3">'+ credential.url +'</div><div class="uUsername editable col-lg-3 col-md-3 col-xs-3">'+ credential.username +'</div><div class="col-lg-5 col-md-5 col-xs-5"><div class="row"><div class="col-lg-3 col-md-3 col-xs-3">'+ credential.creationDate +'</div><div class="col-lg-3"><span class="pwd-hidden">******** </span></div><div class="entry-actions"><div class="col-lg-2 col-md-2 col-xs-2"><span type="unique" url="'+credential.url+'" class="showPW">show</span></div><div class="col-lg-2 col-md-2 col-xs-2"><a><i id="'+ randID+'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="'+credential.url+'" target="_blank"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
				content = '<div class="col-lg-1 col-md-1 col-xs-1"><a><img class="placeholder-img" src=""></a></div><div class="uUrl editable col-lg-3 col-md-3 col-xs-3">'+ credential.url +'</div><div class="uUsername editable col-lg-3 col-md-3 col-xs-3">'+ credential.username +'</div><div class="col-lg-5 col-md-5 col-xs-5"><div class="row"><div class="col-lg-6 col-md-6 col-xs-6"><span class="pwd-hidden">******** </span><span class="progress-container"><div class="progress strength mp-strength unique"><div class="progress-bar '+progressBarColor+'" style="width:'+pwStrengthCalc+'"></div></div></span></div><div class="entry-actions"><div class="col-lg-2 col-md-2 col-xs-2"><span type="unique" url="'+credential.url+'" class="showPW">show</span></div><div class="col-lg-2 col-md-2 col-xs-2"><a><i id="'+ randID+'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="'+credential.url+'" target="_blank"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
			}

			var entryWrapper = document.createElement('div');
			entryWrapper.setAttribute('id', 'entryWrapper_'+randID);
			entryWrapper.setAttribute('class', 'entry-row row');
			entryContainer.appendChild(entryWrapper);

			var ew = $('#entryWrapper_'+randID);
			ew.fadeIn();
		// ew.animate({marginTop:"-=100px"},300);

		$('#entryWrapper_'+randID).hover(function() {
			/* Stuff to do when the mouse enters the element */
			$('#entryWrapper_'+randID+' .entry-actions').show();
		}, function() {
			$('#entryWrapper_'+randID+' .entry-actions').hide();
		});
		
		var requestURL = "https://icons.better-idea.org/allicons.json?url="+credential.url;
		var wrapper = $('#entryWrapper_'+randID);

		wrapper.append(content);

		
		//wrapper.append('<div class="row entry"><div class="col-lg-12"><h4>'+url+'</h4><hr><div class="row"><div class="col-lg-8"><p>'+credential.username+'</p></div><div class="col-lg-2 entry-icons"><i id="'+url+'" class="material-icons">delete</i></div><div class="col-lg-2 entry-icons"><i id="open_'+credential.id+'" class="material-icons">open_in_new</i></div></div>');
		var deleteBtn = document.getElementById(randID);
		var openBtn = document.getElementById("open_"+randID);
		
		deleteBtn.addEventListener('click',function(e){
			evtTgt = e.target;
			deleteThisEntry(evtTgt.getAttribute('id'));
			//remove from DOM
			document.querySelector('#entryWrapper_'+randID).remove();	
		});


		// var client = new HttpClient();
		httpGet(requestURL, function(response) {
			// console.log(JSON.parse(response).icons[0].url);
			
			favIcon = "http://placehold.it/50/ffffff?text="+urlName.substring(0,1);
			var res = JSON.parse(response);
			if(res != null && res.icons != null && res.icons[0] != null){
				//console.log(response);
				favIcon = JSON.parse(response).icons[0].url;
			}else{
				// fallback to placeholder
				favIcon = "http://placehold.it/50/ffffff?text="+urlName.substring(0,1);
			}

			$('#entryWrapper_'+randID+' .placeholder-img').attr('src', favIcon);
			
		});	
	};
	var displaySearchEntry = exports.displaySearchEntry = function(randID, urlName, credential) {
		// console.log("View : displayEntry (search)");
		var entryContainer, content;
		var resultContainer = $('#searchEntryContainer');
		// display Reused Password entries
		if(credential.category != null){
			entryContainer = document.querySelector('#searchResults-category');
			content = '<div class="col-lg-3 col-md-3 col-xs-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3 col-md-3 col-xs-3">'+ credential.url +'</div><div class="col-lg-2 col-md-2 col-xs-2">'+ credential.username +'</div><div class="col-lg-4 col-md-4 col-xs-4"><div class="row"><div class="col-lg-6 col-md-6 col-xs-6">'+ credential.creationDate +'</div><div class="entry-actions"><div class="col-lg-2"></div><div class="col-lg-2"><a><i id="'+ randID +'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
		}else{
			// display unique entry
			entryContainer = document.querySelector('#searchResults-unique');
			entryContainer.style.display = '';
			// hardcoded width.. progressbar has 200px width
				pwStrength = credential.pwStrength;
				var progressBarColor;
				var pws = pwStrength * 200;
				var pwStrengthCalc = pws + "px";
				if(pws < 180){progressBarColor = "progress-bar-danger";}else{progressBarColor = "progress-bar-success";}

				// content = '<div class="col-lg-1 col-md-1 col-xs-1"><a><img class="placeholder-img" src=""></a></div><div class="uUrl editable col-lg-3 col-md-3 col-xs-3">'+ credential.url +'</div><div class="uUsername editable col-lg-3 col-md-3 col-xs-3">'+ credential.username +'</div><div class="col-lg-5 col-md-5 col-xs-5"><div class="row"><div class="col-lg-3 col-md-3 col-xs-3">'+ credential.creationDate +'</div><div class="col-lg-3"><span class="pwd-hidden">******** </span></div><div class="entry-actions"><div class="col-lg-2 col-md-2 col-xs-2"><span type="unique" url="'+credential.url+'" class="showPW">show</span></div><div class="col-lg-2 col-md-2 col-xs-2"><a><i id="'+ randID+'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="'+credential.url+'" target="_blank"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
				content = '<div class="col-lg-1 col-md-1 col-xs-1"><a><img class="placeholder-img" src=""></a></div><div class="uUrl editable col-lg-3 col-md-3 col-xs-3">'+ credential.url +'</div><div class="uUsername editable col-lg-3 col-md-3 col-xs-3">'+ credential.username +'</div><div class="col-lg-5 col-md-5 col-xs-5"><div class="row"><div class="col-lg-6 col-md-6 col-xs-6"><span class="pwd-hidden">******** </span><span class="progress-container"><div class="progress strength mp-strength unique"><div class="progress-bar '+progressBarColor+'" style="width:'+pwStrengthCalc+'"></div></div></span></div><div class="entry-actions"><div class="col-lg-2 col-md-2 col-xs-2"><span type="unique" url="'+credential.url+'" class="showPW">show</span></div><div class="col-lg-2 col-md-2 col-xs-2"><a><i id="'+ randID+'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="'+credential.url+'" target="_blank"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
		
			// content = '<div class="col-lg-3 col-md-3 col-xs-3"><a><img class="placeholder-img" src=""></a>'+ urlName +'</div><div class="col-lg-3 col-md-3 col-xs-3">'+ credential.url +'</div><div class="col-lg-2 col-md-2 col-xs-2">'+ credential.username +'</div><div class="col-lg-4 col-md-4 col-xs-4"><div class="row"><div class="col-lg-3 col-md-3 col-xs-3">'+ credential.creationDate +'</div><div class="col-lg-3"><span class="pwd-hidden">******** </span></div><div class="entry-actions"><div class="col-lg-2"><span type="unique" url="'+credential.url+'" class="showPW">show</span></div><div class="col-lg-2"><a><i id="'+ randID+'" class="material-icons hastext link">delete</i></a></div><div class="col-lg-2"><a id="open_'+credential.url+'" href="#"><i class="material-icons hastext link">open_in_new</i></a></div></div></div></div>';
		}

		var entryWrapper = document.createElement('div');
		entryWrapper.setAttribute('id', 'entryWrapper_'+randID);
		entryWrapper.setAttribute('class', 'entry-row row');
		entryContainer.appendChild(entryWrapper);

		var ew = $('#entryWrapper_'+randID);
		ew.fadeIn();
		// ew.animate({marginTop:"-=100px"},300);

		$('#entryWrapper_'+randID).hover(function() {
			/* Stuff to do when the mouse enters the element */
			$('#entryWrapper_'+randID+' .entry-actions').show();
		}, function() {
			$('#entryWrapper_'+randID+' .entry-actions').hide();
		});
		
		var requestURL = "https://icons.better-idea.org/allicons.json?url="+credential.url;
		var wrapper = $('#entryWrapper_'+randID);

		wrapper.append(content);

		
		//wrapper.append('<div class="row entry"><div class="col-lg-12"><h4>'+url+'</h4><hr><div class="row"><div class="col-lg-8"><p>'+credential.username+'</p></div><div class="col-lg-2 entry-icons"><i id="'+url+'" class="material-icons">delete</i></div><div class="col-lg-2 entry-icons"><i id="open_'+credential.id+'" class="material-icons">open_in_new</i></div></div>');
		var deleteBtn = document.getElementById(randID);
		var openBtn = document.getElementById("open_"+credential.url);

		openBtn.addEventListener('click', function(e){
			var creating = browser.tabs.create({
				url: credential.url
			});
		});
		//id (== url) is saved in button
		
		deleteBtn.addEventListener('click',function(e){
			evtTgt = e.target;
			deleteThisEntry(evtTgt.getAttribute('id'));
			//remove from DOM
			document.querySelector('#entryWrapper_'+randID).remove();	
		});


		// var client = new HttpClient();
		httpGet(requestURL, function(response) {
			// console.log(JSON.parse(response).icons[0].url);
			
			favIcon = "http://placehold.it/50/ffffff?text="+urlName.substring(0,1);
			var res = JSON.parse(response);
			if(res != null && res.icons != null && res.icons[0] != null){
				//console.log(response);
				favIcon = JSON.parse(response).icons[0].url;
			}else{
				// fallback to placeholder
				favIcon = "http://placehold.it/50/ffffff?text="+urlName.substring(0,1);
			}

			$('#entryWrapper_'+randID+' .placeholder-img').attr('src', favIcon);
			
		});
	};
	var displaySearchResults = exports.displaySearchResults = function(results){
		$('#searchEntryContainer *').empty();
		$('#searchResults-category').append('<h2 class="search-result-header"><i class="material-icons">book</i> in Reused Passwords</h2>');
		$('#searchResults-unique').append('<h2 class="search-result-header"><i class="material-icons">list</i> in Unique Passwords</h2>');
		if(results!=0){
			for(key in results){
				var mUrl = results[key].url;
		      	var turl = mUrl.split("/")[2]; // Get the hostname
		      	var parsed = psl.parse(turl); // Parse the domain
		      	var urlName = parsed.domain;
		      	urlName = urlName.split(".")[0];
		      	displaySearchEntry(key, urlName, results[key]);
		      }
		  }
		};
		var createCategoryElement = exports.createCategoryElement = function(categoryName, hint, iconName, pwd, index, pwStrength){
			var delay = 500 + index * 100;
			var container = document.querySelector('#categoryContainer');
			require(['jquery', 'MVC_Controller_Managerpage'], function($, controller) {

				var hasPW = (pwd!=null);
				var icon = (hasPW) ? 'folder':'folder_open';

		//load snippet
		$('#categoryContainer').append('<div id="wrapper_'+categoryName+'"></div>');
		$('#wrapper_'+categoryName).hide().load('scripts/modules/ui/category_snippet.html',null,
		//$('#wrapper_'+categoryName).load('scripts/modules/ui/collapse_snippet.html',null,
		function() {
			//alter DOM (id, classnames)
			var catName = tools.mReplaceAll(categoryName, '_', ' ');

			$(this).children(":first").attr('id','categorywrapper_'+categoryName);
			$('#_heading_').attr('id', 'panel_'+categoryName);
			$('#_numberAccounts_').attr('id', 'numberAccounts_'+categoryName);			
			
			$('#_title_').attr('href', '#listGroup_'+categoryName)
			.attr('id', '#title_'+categoryName)
			.attr('aria-controls', 'listGroup_'+categoryName)
			.html('<div class="cat-title">'+catName+'</div>');

			$(this).find('.category-icons').html(icon);
			$(this).find('.lock-icon').addClass('hidden');
			

			$(this).click(function(event) {
				var entryContainer = $('#entryContainer');
				var panelCard = $('.panel-card');
				event.stopImmediatePropagation(); //prevents firing twice per click

				if(!$('#panel_'+categoryName).hasClass('category-focused')){

					panelCard.addClass('low-color');
					panelCard.removeClass('category-focused');
					$('#panel_'+categoryName).removeClass('low-color');

					$('#panel_'+categoryName).toggleClass('category-focused');
					entryContainer.empty();
					// console.log($(this).attr('haspw'));
					var ic = $(this).find('.category_icons').text();
					var _hasPW = (ic == 'folder') ? true : false; //ugly
					SM.getHint(catName, function(result){
						displayCategoryHeader(catName, _hasPW, result,pwStrength); //update hasPW before displaying header
						controller.loadEntries(categoryName, false);
						
					});
				}else{
					$('#panel_'+categoryName).toggleClass('category-focused');
					panelCard.addClass('low-color');
					var entryContainer = $('#entryContainer');
					var cardWrapper = entryContainer.parent();
					
					// entryContainer.fadeOut(200);

					// entryContainer.empty();
					// entryContainer.hide();
					fadeSlideDown(cardWrapper);
				}					
			});
			console.log(iconName);
			$('#cat-icon').attr('id',categoryName+'-icon').html(iconName);					
			$('#listGroup_'+categoryName).attr('aria-labelledby', 'heading_'+categoryName);

		}).fadeIn(delay);
	});

			displayNumberEntries();	


		};
		var displayCategoryHeader = exports.displayCategoryHeader = function(name, hasPW, hint, pwStrength){
			var entryContainer = $('#entryContainer');
			var cardWrapper = entryContainer.parent();


		// cardWrapper.fadeIn(300);
		entryContainer.fadeIn(400);
		fadeSlideUp(cardWrapper);
		

		if(hasPW){
			// hardcoded width.. progressbar has 200px width
			var progressBarColor;
			var pws = pwStrength * 200;
			var pwStrengthCalc = pws + "px";
			console.log(pwStrengthCalc);
			if(pws < 180){progressBarColor = "progress-bar-danger";}else{progressBarColor = "progress-bar-success";}
			entryContainer.append('<h2 class="row-header">'+name+'</h2><div><div id="pwhint_stored"><i class="material-icons hastext">lock_outline</i><span class="pwd-hidden">*******</span><span type="cat" cat="'+name+'" class="showPW">show</span><span>Password Strength: </span><span><div class="progress strength mp-strength"><div class="progress-bar '+progressBarColor+'" style="width:'+pwStrengthCalc+'"></div></div></span><br><a id="editCategory" class="btn btn-mp light" data-toggle="modal" data-target="#modalCategory" hint="'+ hint +'" oldValue="'+ name +'">Edit category</a><a id="directAddEntry" class="btn btn-mp light" data-toggle="modal" data-value="'+name+'" data-target="#modal-newEntry">Add Entry</a></div></div><hr>');
		}else{
			if(hint=="") hint=name;
			entryContainer.append('<h2 class="row-header">'+name+'</h2><div><i class="material-icons hastext">lightbulb_outline</i> Your personal hint for this password: <strong>"'+hint+'"</strong><br><a id="editCategory" class="btn btn-mp light" data-toggle="modal" data-target="#modalCategory" hint="'+ hint +'" oldValue="'+ name +'">Edit category</a><a id="directAddEntry" class="btn btn-mp light" data-toggle="modal" data-value="'+name+'" data-target="#modal-newEntry">Add Entry</a></div><hr>');
		}
			//configure modal here (event.relatedTarget is created dynamically)
			setupModalCategory(hasPW);
			setupModalEntry();
			// setupShowButton();
		};
		var displayCategories = exports.displayCategories = function(loadUniqueEntries) {
			console.log("View : displayCategories");
			setupModalCategory(false);
			$('#categoryContainer').empty();
			// setupShowButton();
			SM.getCategories(function(c){	
				var categories = c.categories;
				var index=0;
				for(c in categories){			
			// console.log(c + " password: " + categories[c]);
			createCategoryElement(c,categories[c][0],categories[c][1], categories[c][2], index, categories[c][4]);
			index++;
		}

		if(loadUniqueEntries){
			require(["MVC_Model"], function(sm){
				sm.loadEntries(null, true);
			});
		}	
	});
		};
		var fillDropdown = exports.fillDropdown = function(categories) {
			console.log("View : fillDropdown");
			$('#categoryDropdown').empty();
			for(c in categories){
				var e = document.createElement('option');
				e.textContent = c;
				document.querySelector('#categoryDropdown').append(e);
				document.querySelector('select').append(e);
				// document.querySelector().append(e);

			}
		};
		var createCategory = exports.createCategory = function(name, pw, isNew, hint, pwStrength){
			console.log("View : createCategory");
			console.log("pwStrength: " + pwStrength);
			crypt.encrypt_rsa(pw, function(data){
				var cat;
				var pw_enc = (pw=='' || pw==null) ? null : data;
				cat = (pw_enc==null) ? [hint, "folder_open" ,randID, null] : [null,"folder", pw_enc ,randID, pwStrength];
				
				var oldName;
				if($('#editCategory').attr('oldValue') != null){
					oldName = tools.mReplaceAll($('#editCategory').attr('oldValue'), " ", "_");
				}else{
					oldName = null;
				}
				var randID = guidGenerator();
				

				SM.getCategories(function(result){
					var mCat = result;
					// fill modal options
					fillDropdown(mCat.categories);
					//push new entry 
					mCat.categories[name] = cat;
					//store changes
					SM.setCategories(mCat, function(){
						//empty entry container
						if(!isNew){
							var entryContainer = document.getElementById("entryContainer");
							while (entryContainer.firstChild) {
								entryContainer.removeChild(entryContainer.firstChild);
							}
							displayCategories(false);
							if(oldName!=null){
								if(name != oldName){
									// console.log("name: " + name +" : oldName: " + oldName);
									// console.log("name != oldName");
									deleteCategory(oldName);
									reassignEntries(oldName, name, mCat);
									displayCategories(false);
								}
							}
						}else{
							// console.log("no update. was new category");
							displayCategories(false);
						}
					});
					console.log("check");
					// var icon = (pw=='' || pw==null) ? 'lightbulb_outline' : 'lock_outline';
					// $('#panel_'+name+' .lock-icon').html(icon);
					var icon = (pw=='' || pw==null) ? 'folder_open' : 'folder';
					$('#panel_'+name+' .category-icons').html(icon);
				});
				$('#modalNo').on('click', function(event){
					event.stopImmediatePropagation(); 
					toggleConfirm();
				});
			});			
			
		};
		var displayNumberEntries = exports.displayNumberEntries = function(){
			console.log("View : displayNumberEntries");
			SM.getCategories(function(catResults){
				var categories = catResults["categories"];
				SM.countEntries(categories, function(cKeys){
					console.log(cKeys);
					// cKeys[catname] = number;
					for(cKey in cKeys){
						if($('#numberAccounts_'+cKey) != null){
							$('#numberAccounts_'+cKey).html("Number Accounts: " + cKeys[cKey]);
						}
					}
				});
			});
		}
		var deleteCategory = exports.deleteCategory = function(category){
		//if category is not empty --> move entries to unsorted (todo?)
		console.log("View : deleteCategory: " +category);

		var gettingCategories = browser.storage.sync.get("categories");
		gettingCategories.then((results) => {
			var oldCategories = results.categories;					
			delete oldCategories[tools.mReplaceAll(category, ' ', '_')];	

				//save the altered version of the entry-element in storage
				var storingCategories = browser.storage.sync.set({"categories" : oldCategories});
				storingCategories.then(() => {
					//remove element from DOM 
					document.getElementById("wrapper_"+tools.mReplaceAll(category, '_', ' ')).remove();
					displayCategories(true);
				}, onError);	

			});
	};
	var changeCategoryIcon = exports.changeCategoryIcon = function(catName, iconName){
		console.log("View : changeCategoryIcon");
		var gettingEntries = browser.storage.sync.get("categories");
		gettingEntries.then((results) => {
			var id;
			var cat = results.categories;					
			for(key in cat){
				if(key == catName){
					(cat[key][1] = iconName);
				}
			}

			var newCat = {"categories" : cat};
			console.log(newCat);

			//store entries
			var storingEntry = browser.storage.sync.set(newCat);
			storingEntry.then(() => {
				console.log("store success");
				//display new entry			
				//remove from DOM
				displayCategories(true);



			//console.log()
		}, onError);
			

		});
	};
	var updatePreferences = exports.updatePreferences = function(keys, values){
		for(k in keys){
			$('#'+keys[k]).prop('checked', values[k]);
			
		}
	};
	var moveToCategory = exports.moveToCategory = function(url, newCategory){
		console.log("View : moveToCategory");
		var gettingEntries = browser.storage.sync.get("entries");
		gettingEntries.then((results) => {
			var id;
			var entries = results.entries;					
			for(key in entries){
				if(key == url){
					(entries[key].category = newCategory);
					id = entries[key].id;
				}
			}

			var newEntries = {"entries" : entries};
			console.log(newEntries);

			//store entries
			var storingEntry = browser.storage.sync.set(newEntries);
			storingEntry.then(() => {
				console.log("store success");
				//display new entry			
				//remove from DOM
				document.getElementById("entryWrapper_"+id).remove();
				require(["MVC_Model"], function(sm){
					sm.loadEntries();
				});
				displayNumberEntries();


			//console.log()
		}, onError);
			

		});
	};
	var showPWInput = exports.showPWInput = function(){
		var storePW = ($('#btnAddPWD').text() === 'set password') ? true : false;
		var txt = (storePW) ? 'remove password' : 'set password';
		var msg = (storePW) ? 'A Reused Password will be stored.' : 'Save a hint that helps to remember your password instead of storing it.';
		var icon = (storePW) ? 'lock_outline':'lightbulb_outline';
		$('#btnAddPWD').html(txt);
		$('#pw-hint span').html(msg);
		$('#pw-hint i').html(icon);
		$('#category-pwd').val('');
		$('#enter-category-pwd').toggleClass('hidden');
		$('#enter-category-hint').toggleClass('hidden');

	};
	var clearInputs = exports.clearInputs = function(){

		$('input').val('');
	}

	// private functions
	var setupModalEntry = function(){
		$('#modal-newEntry').on('show.bs.modal', function (e) {
			// pre-select category
			var activeCategory = $('#directAddEntry').attr('data-value');
			var options = $('#categoryDropdown option');
			for(var i=0;i<options.length;i++){
				if(options[i].innerText == activeCategory){
					options[i].selected = true;
				}
			}
			// empty all inputs
			$('input').val('');

		});
	};
	var setupModalCategory = function(hasPW){
		$('#modalCategory').on('hidden.bs.modal', function (e) {
			console.log("hide modal");
			$('#modalYesNo').toggleClass('hidden');
			$('#modalAction').toggleClass('hidden');
		});
		$('#modalCategory').on('show.bs.modal', function (e) {
			// empty all inputs
			$('input').val('');

			$('#modalYesNo').addClass('hidden');
			$('#modalAction').removeClass('hidden');
			var oldValue = $('#editCategory').attr('oldValue');
			var hint = $('#editCategory').attr('hint');

			if($(e.relatedTarget).hasClass('button-sub')){
				console.log("relatedTarget has button-sub");
				$('#modalCategory #modalCategoryName').val('');
				$('#modalCategory').addClass('new');
				$('#editCategory').attr('oldValue', '');
				$('#editCategory').attr('hint', '');
				//do nothing --> completely new category when triggered from FAB button
			}else{
				$('#modalCategory').removeClass('new');
				$('#modalCategory #modalCategoryName').val(oldValue);
				$('#category-hint').val(hint);

				var txt = (hasPW) ? 'remove password' : 'set password';
				var msg = (hasPW) ? 'A Reused Password will be stored.' : 'Save a hint that helps to remember your password instead of storing it.';
				var icon = (hasPW) ? 'lock_outline':'lightbulb_outline';
				var pw = (hasPW) ? '*******' : '';
				$('#btnAddPWD').html(txt);
				$('#pw-hint span').html(msg);
				$('#pw-hint i').html(icon);
				$('#category-pwd').val(pw);
				if(hasPW){			
					$('#enter-category-pwd').removeClass('hidden');
					$('#enter-category-hint').addClass('hidden');
					$('#category-pwd').on('focus', function(){
						// empty input
						$(this).val('');
					});
				}else{
					$('#enter-category-pwd').addClass('hidden');
					$('#enter-category-hint').removeClass('hidden');
				}
			}
		});
	};
	var deleteThisEntry = function(url){
		console.log("View : deleteThisEntry");
		var gettingEntries = browser.storage.sync.get("entries");
		gettingEntries.then((results) => {
			var oldEntries = results.entries;					
			delete oldEntries[url];	

				//save the altered version of the entry-element in storage
				var storingEntry = browser.storage.sync.set({"entries" : oldEntries});
				storingEntry.then(() => {
					console.log("element " + url + " deleted. Entries updated.");
					displayNumberEntries();
				}, onError);	

			});
	};
	var httpGet = function(mpURL, mpCallback) {
		var mpHttpRequest = new XMLHttpRequest();
		mpHttpRequest.onreadystatechange = function() { 
			if(mpHttpRequest.status === 404){
				mpCallback(null);
			}else if (mpHttpRequest.readyState == 4 && mpHttpRequest.status == 200)
			mpCallback(mpHttpRequest.responseText);
		}
		mpHttpRequest.open( "GET", mpURL, true );            
		mpHttpRequest.send( null );
	};
	var toggleConfirm = function(){
		console.log("View : toggleConfirm");
		$('#modalYesNo').toggleClass('hidden');
		$('#modalAction').toggleClass('hidden');
	};
	var guidGenerator = function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};
	// TODO move to storagemanager's logic
	var reassignEntries = function(oldName, name, categories){
		console.log("View : reassignEntries");
		var gettingEntries = browser.storage.sync.get("entries");
		gettingEntries.then((results) => {
			var entries = results.entries;
			for(key in entries){
				console.log("entries[key].category: " + entries[key].category);
				if(entries[key].category == oldName){
					(entries[key].category = name);
				}
				var newEntries = {"entries" : entries};
				console.log(newEntries);
			}
			//store entries
			if(newEntries != null){
				SM.setEntries(newEntries, function(){
					console.log("store success");
					displayNumberEntries();
					fillDropdown(categories.categories);

				}, onError);
			}else{
				fillDropdown(categories.categories);
			}

		});
	};
	var fadeSlideUp = function(element){
		var entryContainer = $('#entryContainer');
		element.animate({ opacity: 1 }, { duration: 200, queue: false });
		element.animate({ "margin-top": "-10px" }, { duration: 200, queue: false });
		entryContainer.animate({ opacity: 1 }, { duration: 200, queue: false });
	};
	var fadeSlideDown = function(element){
		var entryContainer = $('#entryContainer');
		setTimeout(function() {
			entryContainer.empty();
		}, 410);
		entryContainer.animate({ opacity: 0 }, { duration: 400, queue: false });
		element.animate({ opacity: 0 }, { duration: 400, queue: false });
		element.animate({ "margin-top": "10px" }, { duration: 400, queue: false });
	};
	var onError = function(e){
		console.log(e);
	}


	return exports;
});
