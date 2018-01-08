// adds MutationObserver to injected web page
window.addEventListener("DOMContentLoaded", observe());

function observe(){
	console.log("MutationObserver started.");
	var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

	var observer = new MutationObserver(function(mutations) {
		mutations.forEach(function(mutation) {
			console.log("mutation detected");
			// console.log(mutation);
			if(mutation.type == 'childList' && mutation.addedNodes.length > 0){
				// console.log( mutation);
				var newNodes = mutation.addedNodes;
				var inputs = newNodes[0].getElementsByTagName('input');
				if(inputs.length!=0){
					init();
					// TODO: called too many times when inputs are loaded by a script
				}
			}
		});    
	});
	// configuration of the observer:
	var config = { childList: true, subtree: true };
	observer.observe(document, config);

}