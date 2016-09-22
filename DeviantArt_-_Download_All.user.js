// ==UserScript==
// @name        DeviantArt - Download All
// @namespace   iampradip@github
// @include     http://www.deviantart.com/browse/*
// @include     http://*.deviantart.com/art/*
// @version     1
// @grant       GM_registerMenuCommand
// @grant       GM_openInTab
// ==/UserScript==

if(location.pathname.indexOf("/browse/") == 0){
	GM_registerMenuCommand("Download All Art", function (){
		var links = document.querySelectorAll(".details .t");
		for(var i = 0; i < links.length; i++){
			var link = links[i];
			var id = btoa(link.href);
			
			var iframe = document.getElementById(id);
			if(iframe == null){
				iframe = document.createElement("iframe");
				iframe.id = id;
				iframe.style.display = "none";
				iframe.src = link.href + "#download";
				document.body.appendChild(iframe);
			}
		}
	});
} else if(location.pathname.indexOf("/art/") == 0){
	if(location.hash == "#download"){
		var links = document.getElementsByClassName("dev-page-download");
		for(var i = 0; i < links.length; i++){
			GM_openInTab(links[i].href);
		}
		location.replace("about:blank");
	}
}