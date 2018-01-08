// DON'T DEFINE MVC_MODEL HERE => circular dependency
// solution: reuqire on demand
define(['scripts/tools/tools', 'scripts/modules/Logger', 'MVC_View_Managerpage', 'scripts/tools/showPW', 'psl'],
  function(tools,Logger, view, showPW, psl){
    var exports = {};

    var changeCategoryIcon = exports.changeCategoryIcon = function(catName, iconName){
      Logger.log({event: "CategoryIcon Changed", content: {catName, iconName}});
      console.log("Controller : changeCategoryIcon");
      view.changeCategoryIcon(catName, iconName);
    };
    var deleteCategory = exports.deleteCategory = function(name){
      Logger.log({event: "Category Deleted", content : name});
      console.log("Controller : deleteCategory");
      view.deleteCategory(name);
    };
    var search = exports.search = function(value){
     require(['MVC_Model'], function(MVC_Model){
      MVC_Model.search(value);
    });
   };
   var setChallenge = exports.setChallenge = function(challengeObject){
    require(['MVC_Model'], function(MVC_Model){
      MVC_Model.setChallenge(challengeObject);
    });
  };
  var checkAccount = exports.checkAccount = function(username, mUrl){
    require(['MVC_Model'], function(MVC_Model){
      MVC_Model.checkAccount(username, mUrl);
    });
  };
  var displaySearchResults = exports.displaySearchResults = function(results){
    view.displaySearchResults(results);
  };
  var updateEntry = exports.updateEntry = function(id){

    var murl = $('#entryWrapper_'+id).find('.uUrl').text();
    var username = $('#entryWrapper_'+id).find('.uUsername').text();
    require(['MVC_Model'], function(MVC_Model){
      MVC_Model.updateEntry(id, murl, username);
    });
  };
  var displayEntry = exports.displayEntry = function(randID, credential, hasCategory){
    console.log("Controller : displayEntry");
    var mUrl = credential.url;
    console.log(credential);
      var turl = mUrl.split("/")[2]; // Get the hostname
      var parsed = psl.parse(turl); // Parse the domain
      var urlName = parsed.domain;
      urlName = urlName.split(".")[0];
      view.displayEntry(randID, urlName, credential, hasCategory);
    };
    var fillDropdown = exports.fillDropdown = function(categories){
      console.log("Controller : fillDropdown");
      view.fillDropdown(categories);
    };
    
    var displayCategories = exports.displayCategories = function(categories, loadEntries){
      console.log("Controller : displayCategories");
      view.displayCategories(categories, loadEntries);
    };
    var displayNumberEntries = exports.displayNumberEntries = function(){
      console.log("Controller : displayNumberEntries");
      view.displayNumberEntries();
    };
    var createCategory = exports.createCategory = function(){
      var value = modalCategoryName.value;
      value = tools.mReplaceAll(value, ' ', '_');
      Logger.log({event: "Category Created", content: value});
      var pw; var hint; var ecpwd = $('#enter-category-pwd');
      if(ecpwd.hasClass('hidden')){ 
        pw = null; 
        hint = $('#category-hint').val();       
      }else{
        pw = $('#category-pwd').val();
        var pwStrength = ($('#enter-category-pwd  .progress-bar').width() / $('#enter-category-pwd .progress').width());
        hint = null;
      }
      view.createCategory(value, pw, $('#modalCategory').hasClass('new'), hint, pwStrength);
    };
    var updatePreferences = exports.updatePreferences = function(results){
      var keys = []; var values = [];
      for(key in results.preferences){
        keys.push(key);
        values.push(results.preferences[key]);
      }
      view.updatePreferences(keys, values);
    };
    var addEntry = exports.addEntry = function(){
      console.log("Controller : addEntry");
      require(['MVC_Model'], function(MVC_Model){
        MVC_Model.addEntry();
      });
    };
    var loadEntries = exports.loadEntries = function(categoryName, onlyUnique){
      console.log("Controller : loadEntries");
      require(['MVC_Model'], function(MVC_Model){
        MVC_Model.loadEntries(categoryName, onlyUnique);
      });
    };
    var quickAddEntry = exports.quickAddEntry = function(murl, musername, mcat, mpw, mps){
      Logger.log({event : "QuickAddEntry", content: {murl, mcat}});
      console.log("Controller : quickAddEntry");
      require(['MVC_Model'], function(MVC_Model){
        MVC_Model.quickAddEntry(murl, musername, mcat, mpw, mps);
      });
    };
    var decrypt = exports.decrypt = function(content){
      require(['MVC_Model'], function(MVC_Model){
        MVC_Model.decrypt(content, function(result){
         var msg = {action : "fillPW", content: result};
         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {  
          chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
          }); 
        });
       });
      });
    };
    var decryptWithTarget = exports.decryptWithTarget = function(content){
      require(['MVC_Model'], function(MVC_Model){
        MVC_Model.decrypt(content, function(result){
         var msg = {action : "autofillPW", content: result};
         chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {  
          chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
          }); 
        });
       });
      });
    };
    var requestPassword = exports.requestPassword = function(mUrl, type, mHash, mCategory){
      //ATTENTION!
      //must be called from background.js TODO
      Logger.log({event : "Request Password", content : {mUrl, type, mCategory}});
      console.log("Function : requestPassword");
      showPW.trigger(null, type, mUrl, mHash, mCategory, function(result){
        var msg = {action : "requestPW", content: result};
        // does only work when backgroundpage is opened?!
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {  
          chrome.tabs.sendMessage(tabs[0].id, msg, function(response) {
            console.log(response);
          }); 
        });
      });
    };
    

    return exports;
  });


















