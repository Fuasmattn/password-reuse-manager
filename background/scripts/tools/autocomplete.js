document.addEventListener("DOMContentLoaded", setup);
var datalist = $('#historyList');
function setup(){
	console.log("autocomplete");
	require(["scripts/tools/history"], function searchHistory(e){
		e.searchHistory();
	});
}