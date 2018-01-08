	
define(function() {
	var exports = {};
	
	var guidGenerator = exports.guidGenerator = function() {
		var S4 = function() {
			return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
	};
	var getDate = exports.getDate = function(){
		return new Date(Date.now()).toLocaleDateString({ year: 'numeric', month : 'numeric', day : 'numeric' });
	};

	// http://www.mustbebuilt.co.uk/2012/04/20/replaceall-function-for-javascript-and-actionscript/
	var mReplaceAll = exports.mReplaceAll = function(oldStr, removeStr, replaceStr, caseSenitivity){
		var newStr;
    if(caseSenitivity == 1){
        cs = "g";
        }else{
        cs = "gi";  
    }
    var myPattern=new RegExp(removeStr,cs);
    newStr = oldStr.replace(myPattern,replaceStr);
    return newStr;
	};



	return exports;
	});


