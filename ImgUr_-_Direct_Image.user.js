// ==UserScript==
// @name        ImgUr, QuickMeme, Gyazo - Direct Image
// @namespace   iampradip@github
// @include     http://imgur.com/*
// @include     https://imgur.com/*
// @exclude     http://imgur.com/a/*
// @exclude     https://imgur.com/a/*
// @exclude     http://imgur.com/gallery/*
// @exclude     https://imgur.com/gallery/*
// @exclude     http://imgur.com/*,*
// @exclude     https://imgur.com/*,*
// @include     http://www.quickmeme.com/meme/*
// @include     https://gyazo.com/*
// @version     1
// @run-at      document-start
// @grant       none
// ==/UserScript==

var interval;
var found = false;
function urlFound(x){
	found = true;
	clearInterval(interval);
	
	document.title = "Redirecting to " + x;
	location.replace(x);
}

function findAndRedirectToImage(){
	if(found){
		return;
	}

	if(document.getElementsByClassName){
		var imgMainImageContainer = document.getElementsByClassName("zoom");
		if(imgMainImageContainer.length == 0){
			imgMainImageContainer = document.getElementsByClassName("post-image");
		}
		if(imgMainImageContainer.length == 0){
			imgMainImageContainer = document.getElementsByClassName("image-box");
		}
		if(imgMainImageContainer.length > 0){
			var aMainImage = imgMainImageContainer[0].getElementsByTagName("a");
			if(aMainImage.length > 0 && aMainImage[0].href){
				urlFound(aMainImage[0].href);
				return;
			}
			var imgMainImage = imgMainImageContainer[0].getElementsByTagName("img");
			if(imgMainImage.length > 0 && imgMainImage[0].src){
				urlFound(imgMainImage[0].src);
				return;
			}
		}
	}
	if(document.getElementById){
		var imgImg = document.getElementById("img");
		if(imgImg && imgImg.src){
			urlFound(imgImg.src);
			return;
		}
	}
}

interval = setInterval(findAndRedirectToImage, 100);
document.addEventListener("DOMNodeInserted", findAndRedirectToImage, false);