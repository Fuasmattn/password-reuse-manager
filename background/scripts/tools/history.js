define(["jquery"], function($){
	return{
		searchHistory : function(){
			var historyList = $('#historyList');
			var searching = browser.history.search({text: ""});
			searching.then(onGot);

			function onGot(historyItems) {
				for (item of historyItems) {
					historyList.append('<option>'+item.url+'</option>');
				}
			}

		}
		
	}
});
