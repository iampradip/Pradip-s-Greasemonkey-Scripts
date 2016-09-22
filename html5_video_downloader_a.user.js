// ==UserScript==
// @name           HTML5 Video Downloader and Blocker
// @namespace      iampradip@github
// @description    Download videos embedded with HTML5
// @include        *
// @version        1.0.3
// @grant          GM_addStyle
// ==/UserScript==

// @run-at         document-start

HTML5VideoDownloader={
	cssAdded: false,
	DOM: {
		addClassName: function(strCurrentClassName, strNewClassName){
			if(!strCurrentClassName)
				strCurrentClassName="";
			var strClasses=strCurrentClassName.split(" ");
			if(strClasses.length==0){
				return strNewClassName;
			} else {
				var blMatch=false;
				for(var i=0;i<strClasses.length;i++){
					if(strClasses[i]==strNewClassName){
						blMatch=true;
						break;
					}
				}
				if(blMatch)
					return strCurrentClassName;
				else
					return (strCurrentClassName+" "+strNewClassName).trim();
			}
		},
		removeClassName: function(strCurrentClassName, strRemoveClassName){
			if(!strCurrentClassName)
				strCurrentClassName="";
			var strClasses=strCurrentClassName.split(" ");
			if(strClasses.length==0){
				return strCurrentClassName;
			} else {
				var strReturnClassName="";
				for(var i=0;i<strClasses.length;i++){
					if(strClasses[i]!=strRemoveClassName){
						strReturnClassName+=" "+strClasses[i];
					}
				}
				if(strReturnClassName.length>0)
					return strReturnClassName.trim();
				else
					return "";
			}
		},
		addCSS:function (css){
			if (typeof GM_addStyle != "undefined") {
				GM_addStyle(css);
				return true;
			} else if (typeof PRO_addStyle != "undefined") {
				PRO_addStyle(css);
				return true;
			} else if (typeof addStyle != "undefined") {
				addStyle(css);
				return true;
			} else {
				var heads = document.getElementsByTagName("head");
				if (heads.length > 0) {
					var node = document.createElement("style");
					node.type = "text/css";
					try{
						node.appendChild(document.createTextNode(css));
					}catch(e){
						return false;
					}
					heads[0].appendChild(node);
					return true;
				}
			}
			return false;
		}
	},
	runScript: function (){
		/*document.addEventListener("DOMNodeInserted", function (){
			setTimeout(function (){
				HTML5VideoDownloader.contentInserted();
			}, 0);
		}, false);
		window.addEventListener("load", HTML5VideoDownloader.contentInserted, false);*/
		HTML5VideoDownloader.contentInserted();
	},
	addDownloaderAndBlocker: function (video, src){
		var divDBContainer=document.createElement("div");
		divDBContainer.className="html5-downloader-blocker-container";
		if(video==video.parentNode.lastChild)
			video.parentNode.appendChild(divDBContainer);
		else
			video.parentNode.insertBefore(divDBContainer, video.nextSibling);
			
		var aDownloader=document.createElement("a");
		aDownloader.className="html5-downloader";
		aDownloader.href=src;
		aDownloader.innerHTML="Download";
		divDBContainer.appendChild(aDownloader);
		
		divDBContainer.appendChild(document.createTextNode(" | "));
		
		var aBlocker=document.createElement("a");
		aBlocker.className="html5-blocker";
		aBlocker.href="javascript:void(0);";
		aBlocker.innerHTML="lock";
		aBlocker.addEventListener("click", function (){
			HTML5VideoDownloader.toggleBlockVideo(this.parentNode.previousSibling, src);
		}, false);
		HTML5VideoDownloader.toggleBlockVideo(video, src);
		divDBContainer.appendChild(aBlocker);
		divDBContainer.style.left=video.offsetLeft+(video.offsetWidth-divDBContainer.offsetWidth)/2+"px";
		divDBContainer.style.top=video.offsetTop+(video.offsetHeight-divDBContainer.offsetHeight)/2+"px";
		
		video.addEventListener("mouseover", function (){
			if(video.nextSibling.className=="html5-downloader-blocker-container"){
				var intTargetLeft=video.offsetLeft+(video.offsetWidth-video.nextSibling.offsetWidth)/2+"px";
				var intTargetTop=video.offsetTop+(video.offsetHeight-video.nextSibling.offsetHeight)/2+"px";
				if(intTargetLeft!=video.nextSibling.style.left) video.nextSibling.style.left=intTargetLeft;
				if(intTargetTop!=video.nextSibling.style.top) video.nextSibling.style.top=intTargetTop;
			}
		}, false);
	},
	toggleBlockVideo: function (vid, src){
		if(vid.nodeName.toLowerCase()=="video"){
			if(src && vid.src!="blocked:"){
				vid.setAttribute("blocked-src", src);
				vid.currentSrc="blocked:";
				vid.src="blocked:";
				vid.className=HTML5VideoDownloader.DOM.addClassName(vid.className,"blocked");
			} else if(vid.getAttribute("blocked-src") && vid.getAttribute("blocked-src").length!=0) {
				vid.currentSrc=vid.getAttribute("blocked-src");
				vid.src=vid.getAttribute("blocked-src");
				vid.removeAttribute("blocked-src");
				vid.className=HTML5VideoDownloader.DOM.removeClassName(vid.className,"blocked");
			}
		}
	},
	contentInserted: function (){
		if(document.getElementsByTagName){
			var videos=document.getElementsByTagName("video");
			if(videos.length>0 && !HTML5VideoDownloader.cssAdded){
				HTML5VideoDownloader.cssAdded=HTML5VideoDownloader.DOM.addCSS(""+
					".html5-downloader-blocker-container{color:black;background:white;padding:2px 7px 4px 7px;border-radius:3px;border:1px solid #808080;position:absolute;font-family:Segoe UI, Trebuchet MS, Ubuntu, sans-serif, serif;font-size:10pt;display:block;opacity:0;transition: opacity 500ms;-moz-transition: opacity 500ms;-webkit-transition: opacity 500ms;-o-transition: opacity 500ms;z-index:2147483648}"+
					".html5-downloader-blocker-container:hover, video:hover+.html5-downloader-blocker-container, video.blocked+.html5-downloader-blocker-container{opacity:1}"+
					"video+.html5-downloader-blocker-container .html5-blocker:before{content: \"B\"}"+
					"video.blocked+.html5-downloader-blocker-container .html5-blocker:before{content: \"Unb\"}"+
				"");
			}
			for(var i=0;i<videos.length;i++){
				if(videos[i].nextSibling && videos[i].nextSibling.className && videos[i].nextSibling.className=="html5-downloader-blocker-container")
						continue;
				
				if(videos[i].currentSrc && videos[i].currentSrc.length!=0){
					HTML5VideoDownloader.addDownloaderAndBlocker(videos[i], videos[i].currentSrc);
				} else {
					var sources = videos[i].getElementsByTagName("source");
					if(sources.length > 0 && sources[i].src){
						HTML5VideoDownloader.addDownloaderAndBlocker(videos[i], sources[i].src);
					}
				}
			}
		}
	}	
}

HTML5VideoDownloader.runScript();