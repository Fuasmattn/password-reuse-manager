/* get storage items */
// copy of original
define(function(){
	return{
		getChallenge: function(callback){
			browser.storage.sync.get('challenge').then((results) =>{
				callback(results['challenge']);
			});
		},
		setChallenge: function(value){
			var val = {'challenge' : value};
			browser.storage.sync.set(val);
		},
		getMPWHash: function(callback){
			browser.storage.sync.get('mpw').then((results) =>{
				callback(results);
			});
		},
		//
		
		getMPW: function(callback){
			browser.storage.sync.get('mpw-tmp').then((results) =>{
				callback(results['mpw-tmp']);
			});
		},
		setMPW: function(value){
			var val = {"mpw-tmp" : value};
			browser.storage.sync.set(val);
		},
		setMPWHash: function(value){
			var val = {"mpw" : CryptoJS.SHA512(value)};
			browser.storage.sync.set(val);
		},

		//
		getPublicKey: function(callback){
			browser.storage.sync.get('public_rsa').then((results) =>{
				callback(results['public_rsa']);
			});
		},
		getRSAKeys: function(callback){
			browser.storage.sync.get('rsa_enc').then((results) =>{
				callback(results['rsa_enc']);
			});
		},
		getOnboardingMode: function(callback){
			browser.storage.sync.get('mode').then((results) => {
				callback(results);
			});
		},
		getEntries: function(callback){
			console.log("SM : getEntries");
			var gettingEntries = browser.storage.sync.get("entries");
			gettingEntries.then((results) => {
				console.log(results);
				callback(results);
			});
		},
		initPreferences : function(callback){
			console.log("SM : initPreferences");
			browser.storage.sync.get("preferences").then((results) => {
				if(results == null || results["preferences"] == null){
					browser.storage.sync.set({preferences : {}});
				}else{
					callback(results);
				}
			});
		},
		updatePreferences : function(key, value){
			browser.storage.sync.get("preferences").then((results) => {
				results.preferences[key] = value;
				console.log(results);
				browser.storage.sync.set(results);
				browser.storage.sync.get("preferences").then((results) => { console.log(results);});
			});
		},
		getCategories: function(callback){
			var gettingCategories = browser.storage.sync.get("categories");
			gettingCategories.then((results) => {
				callback(results);
			});
		},
		setEntries: function(value, callback){
			console.log("SM : setEntries");
			var storingEntry = browser.storage.sync.set(value);
			storingEntry.then(() => {
				callback();
			});
		},
		setCategories: function(value, callback){
			var storingCategory = browser.storage.sync.set(value);
			storingCategory.then(()=> {
				callback();
			});
		},
		getHint : function(catName, callback){
			var gettingCategories = browser.storage.sync.get("categories");
			gettingCategories.then((results) => {
				var res = results["categories"];
				var name = catName.replace(' ', '_');
				var def = name;
				for(key in res){
					if(key == name){
						def = res[key][0];
						console.log("hint found");
					}
				}

				callback(def);
			});
		},
		findEntries : function(value, callback){
			this.getEntries(function(results){
				var foundEntries = [];
				var entries = results["entries"];
				for(key in entries){
					var u = entries[key].url;
				 	 // filter actual website's name to prevent searching protocols or domains
				 	 var murl = (new URL(u).hostname).split(".")[0]; 
				 	 console.log(murl);
				 	 var mname = entries[key].username;
					// check if any entry contains the searched value as username/url
					if(murl.indexOf(value) !== -1 || mname.indexOf(value) !== -1){
						foundEntries.push(entries[key]);
					}
				}
				callback(foundEntries);
			});
		},
		findEntryByURL: function(mUrl, callback){
			this.getEntries(function(results){
				console.log(results);
				var entries = results["entries"];
				var results = [];
				for(key in entries){
					if(entries[key].url == mUrl){
						results.push(entries[key]);
					}
				}
				callback(results);
			});
		},
		updateEntry : function(id,  murl, name, callback){
			this.getEntries(function(results){
				var entries = results["entries"];
				var entry;

				for(key in entries){
					if(key == id){
						entries[key].url = murl;
						entries[key].username = name;
						entry = entries[key];
					}
				}
				var storingEntries = browser.storage.sync.set({"entries" : entries});
				storingEntries.then(() => {
					callback(entry);
				});
			});
			
		},
		setUsernameQuickAdd: function(username){
			var entry = {'username' : username};
			browser.storage.sync.set(entry);
		},
		getUsernameQuickAdd : function(callback){
			browser.storage.sync.get('username').then((results) => {
				callback(results['username']);
			});
		},
		findEntryByUsername: function(name, callback){
			this.getEntries(function(results){
				console.log(results);
				var entries = results["entries"];
				for(key in entries){
					if(entries[key].username == name){
						callback(entries[key]);
					}
				}
			});
		},
		// key (randID => pseudo unique!) -> credentials[url, name, ...]
		saveEntry: function(randID, credentials, callback){
			console.log("SM : saveEntry");
			var gettingEntries = browser.storage.sync.get("entries");
			gettingEntries.then((results) => {
				var entries = results["entries"];
				entries[randID] = credentials;
				console.log(entries);
				var storingEntry = browser.storage.sync.set({"entries" : entries});
				storingEntry.then(() => {
					callback();
				});

			});
		},
		// TOOD
		countEntries : function(categories, callback){
			var gettingEntries = browser.storage.sync.get("entries");
			gettingEntries.then((eResults) => {
				var entries = eResults["entries"];
				var values = {};
				for(cKey in categories){
					var number = 0;
					for(key in entries){
						if(entries[key].category == cKey) number++;
					}
					values[cKey] = number;

				}

				callback(values);
			});
		},
		createExtensionIdentifier : function(){
			require(['scripts/modules/Logger'], function(Logger){
				browser.storage.sync.get('identifier').then((id) =>{
					var webexID;
					if(!id['identifier']){
						var rand = (""+Date.now()).substring(5);
						webexID = 'PWM-'+rand;
						browser.storage.sync.set({'identifier' : webexID});
						Logger.log({event: "Manager Installed", content: {'PWM-ID' : webexID}});
					}else{
						webexID = id['identifier'];
					}
				// display extensionIdentifier (fieldstudy mapping)
				$('#webexID').html(webexID);
				
				Logger.log({event: "Manager Opened", content: navigator.userAgent});
			});
			});
		},
		getExtensionIdentifier : function(callback){
			browser.storage.sync.get('identifier').then((id) =>{
				callback(id['identifier']);

			});
		}

	}
});