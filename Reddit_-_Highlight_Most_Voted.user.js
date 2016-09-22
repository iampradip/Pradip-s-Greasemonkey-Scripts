// ==UserScript==
// @name        Reddit - Highlight Based on Votes
// @namespace   iampradip@github
// @include     http://*.reddit.com/*
// @include     https://*.reddit.com/*
// @version     1
// @grant       none
// ==/UserScript==

(function (){

	// document.getElementById
	var $ = function (id, success, failure){
		var element = document.getElementById(id);
		var failure = failure || function (){
			//console.warn("Element with id '" + id + "' not found.");
		};

		if(element){
			success(element)
		} else {
			failure();
		}
	};

	// document.getElementsByClassName
	var $$ = function (className, success, failure){
		$$$(document, className, success, failure);
	};

	// parent.getElementsByClassName
	var $$$ = function (parent, className, success, failure){
		var elements = parent.getElementsByClassName(className);
		var failure = failure || function (){
			//console.warn("Element with class '" + className + "' not found under this parent:", parent);
		}

		if(elements.length > 0){
			for(var i = 0; i < elements.length; ++i){
				success(elements[i]);
			}
		} else {
			failure();
		}
	};
	
	var scores = new Array();
	
	$$("comment", function (comment){
		$$$(comment, "entry", function (entry){
			$$$(entry, "unvoted", function (unvoted){
				var score = parseInt(unvoted.textContent);
				if(!isNaN(score)){
					scores.push(score);
				}
			});
		});
	});
	
	scores.sort(function (a, b){
		return b - a;
	});
	
	var max = Math.max(1, scores[0]);
	var min = scores[scores.length - 1];
	
	$$("comment", function (comment){
		$$$(comment, "entry", function (entry){
			$$$(entry, "unvoted", function (unvoted){				
				var score = parseInt(unvoted.textContent);
				if(isNaN(score)){
					score = 1;
				}
					
				if(score > 0){
					var color = 255 - Math.floor(
						Math.min(255, Math.max(0, (score * 255) / max))
					);
					
					color = color.toString(16);
					if(color.length == 1)
						color = "0" + color;
					entry.style.background = "#ffff" + color;
				} else {
					var color = 255 - Math.floor(
						Math.min(255, Math.max(0, ((score - 1) * 255) / (min - 1)))
					);
					
					color = color.toString(16);
					if(color.length == 1)
						color = "0" + color;
				
					entry.style.background = "#ff" + color + "ff";
				}
			});
		});
	});
})();