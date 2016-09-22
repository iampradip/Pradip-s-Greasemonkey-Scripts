// ==UserScript==
// @name        YouTube Real Thumbnails
// @namespace   iampradip@github
// @include     https://www.youtube.com/*
// @include     http://www.youtube.com/*
// @include     https://youtube.com/*
// @include     http://youtube.com/*
// @version     1
// @grant       none
// ==/UserScript==

(function (){
	var attributes = ["src", "data-thumb"];
	var defaultNames = ["/default.jpg", "/mqdefault.jpg", "/hqdefault.jpg"].map(function (x){ return new RegExp(x + "(\\?.*)?"); });
	var replaceWith = "/2.jpg";
	
	for(var i = 0; i < document.images.length; i++){
		for(var j = 0; j < attributes.length; j++){
			var value = document.images[i].getAttribute(attributes[j]);
			if(value != null){
				var oldValue = value;
				for(var k = 0; k < defaultNames.length; k++){
					value = value.replace(defaultNames[k], replaceWith);
				}
				if(oldValue != value){
					document.images[i].setAttribute(attributes[j], value);
				}
			}
		}
	}
})();