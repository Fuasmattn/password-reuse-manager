define(['jquery','scripts/tools/crypt', 'scripts/cryptojs/rollups/sha512'] ,function($, crypt, aes){
	return{
		// distinguish between background page and content_script request 
		// background page (managerpage) calls only provide the first argument
		trigger : function(elem, mType, mUrl, mHash, mCategory, mCallback){
			console.log("showPW : trigger");
			var ret; var entry; var unique = false;
			//call origin: background
			if(mType == null && mUrl == null){

				if(elem.attr('type') == 'unique'){
					entry = elem.attr('url');
					unique = true;
				}else{
					entry = elem.attr('cat');
					entry = entry.replace(" ", "_");
				}

				$('#modalInputMPW').on('keypress', function(e) {
					if(e.which === 13){
						e.preventDefault();
						var val = $(this).val();
						if (val.length > 0){
							getPW(val);
						}
					}
				});
				$('.confirm').on('click', function(e){
					e.preventDefault();
					var val = $('#modalInputMPW').val();
					if (val.length > 0){
						getPW(val);
					}
				});
			// call origin: content script 
		}else{
			unique = (mType=='unique');
			entry = (unique) ? mUrl : mCategory;
			getPW(mHash);
		}

		

			function getPW(passphrase){
				
				console.log("Function : getPW");

				if(unique){
					// get unique pw
					console.log("get unique pw");
					browser.storage.sync.get("entries").then(function(res){
						var e = res.entries;
						for(key in e){
							//pw entry found
							if(e[key].url == entry && e[key].category == null){
								crypt.decrypt_rsa(e[key].password, passphrase, function(result){
									if(mType == null){
										if(result!=null){
											elem.parent().parent().parent().find('.pwd-hidden').html(result.toString(CryptoJS.enc.Utf8));

											$('#modalMPW').modal('hide');
											elem.html('hide');
										}else{
											alert("Entered Masterpassword was not correct.");
										}
										
									}else{
										mCallback(result.toString(CryptoJS.enc.Utf8));
									}

								});
	
							}
						}

					});
				}else{
					//get category pw
					browser.storage.sync.get("categories").then(function(res){
						var e = res.categories
						// console.log("for category: " + entry);
						for(key in e){
							if(key == entry){
								// e[key][2]
								crypt.decrypt_rsa(e[key][2], passphrase, function(result){
									// console.log(result);
									if(mType == null){
										if(result!=null){
											elem.parent().find('.pwd-hidden').html(result.toString(CryptoJS.enc.Utf8));
											$('#modalMPW').modal('hide');
											elem.html('hide');
										}else{
											alert("Entered Masterpassword was not correct.");
										}
										
									}else{
										mCallback(result.toString(CryptoJS.enc.Utf8));
									}
								});

							}
						}
					});
				}
			}
		}
	}
	
});