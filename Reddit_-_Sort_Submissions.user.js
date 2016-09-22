// ==UserScript==
// @name        Reddit - Sort Submissions
// @namespace   iampradip@github
// @include     https://*.reddit.com/*
// @version     1
// @grant       GM_addStyle
// ==/UserScript==

var parseVotes = function (thing){
	var votes = thing.querySelector(".score.unvoted");
	if(votes){
		var result = parseInt(votes.textContent);
        return isNaN(result) ? 1 : result;
	}
	return 1;
};

var parseHotness = function (thing){
	var timespan = Math.min(1000 * 60 * 60 * 24 * 30, new Date() - parseTime(thing)); // anything older than x days is considered as exactly x days old
	var total = parseVotes(thing) + parseComments(thing);
	
	return total * 100000 / timespan;
};

var parseDrama = function (thing){
	var votesOfThis = parseVotes(thing);

	var type = thing.getAttribute("data-type");
	if(type == "link"){
		var commentsOfThis = parseComments(thing);
		return commentsOfThis - votesOfThis;
	}
	
	var selector = ".id-" + thing.getAttribute("data-fullname") + " > .child > .sitetable > .thing";
	var children = thing.querySelectorAll(selector);
	if(children.length == 0){
		return -votesOfThis;
	}
	
	var maxVotesOfChildren = parseVotes(children[0]);
	var maxDramaOfChildren = parseDrama(children[0]);
	for(var i = 1; i < children.length; i++){
		maxVotesOfChildren = Math.max(maxVotesOfChildren, parseVotes(children[i]));
		maxDramaOfChildren= Math.max(maxDramaOfChildren, parseDrama(children[i]));
	}
	
	var dramaOfThis = maxVotesOfChildren - votesOfThis;
	var dramaOfChildren = maxDramaOfChildren;
	
	return Math.max(dramaOfChildren, dramaOfThis);
};

var parseComments = function (thing){
	var comments = thing.querySelector(".comments");
	if(comments){
		return parseInt(comments.textContent);
	} else {
		return thing.getElementsByClassName("thing").length;
	}
};

var parseDepth = function (thing){
	var selector = ".id-" + thing.getAttribute("data-fullname") + " > .child > .sitetable > .thing";
	var children = thing.querySelectorAll(selector);
	if(children.length == 0){
		var selector = ".id-" + thing.getAttribute("data-fullname") + " > .deepthread > a";
		var children = thing.querySelectorAll(selector);
		if(children.length != 0){
			return 10;
		}
	
		return 1;
	}
	
	var maxDepthOfChildren = parseDepth(children[0]);
	for(var i = 1; i < children.length; i++){
		maxDepthOfChildren = Math.max(maxDepthOfChildren, parseDepth(children[i]));
	}
	
	return maxDepthOfChildren + 1;
};

var parseTime = function (thing){
	var liveTimestamp = thing.querySelector(".live-timestamp");
	if(liveTimestamp){
		var datetime = liveTimestamp.getAttribute("datetime");
		if(datetime){
			return new Date(datetime);
		}
	}
	return -1;
};

var parseTimeChildren = function (thing){
	var selector = ".id-" + thing.getAttribute("data-fullname") + " > .child > .sitetable > .thing";
	var children = thing.querySelectorAll(selector);
	if(children.length == 0){
		return parseTime(thing);
	}
	
	var oldest = parseTimeChildren(children[0]);
	for(var i = 1; i < children.length; i++){
		var time = parseTimeChildren(children[i]);
		oldest = oldest > time ? oldest : time;
	}
	
	if(oldest == -1){
		return parseTime(thing);
	}
	
	return oldest;
};

var parseType = function (thing){
	var domain = thing.getElementsByClassName("domain");
	if(domain.length > 0){
		var text = domain[0].textContent;
		if(text.charAt(0) == '('){
			text = text.substring(1);
		}
		if(text.charAt(text.length - 1) == ')'){
			text = text.substring(0, text.length - 1);
		}
		
		if(text.indexOf("self.") == 0){
			return "self";
		} else if(text == "i.imgur.com" || text == "m.imgur.com" || text == "imgur.com"){
			return "link.image";
		} else if(text == "youtube.com" || text == "www.youtube.com" || text == "youtu.be" || text == "m.youtube.com"){
			return "link.video";
		} else {
			return "link.general";
		}
	}
	return null;
};

var compareThings = function (thing1, thing2, parseFunc, order){
	var thing1Score = parseFunc(thing1);
	var thing2Score = parseFunc(thing2);
	
	var result = -1;
	
	if(typeof thing1Score == "string" && typeof thing2Score == "string"){
		result = thing2Score.localeCompare(thing1Score);
	} else {
		result = thing2Score - thing1Score;
	}
	
	if(!order){
		result = -result;
	}
	
	if(!isNaN(result)){
		return result;
	}
	
	if(!isNaN(thing1Score)){
		return -thing1Score;
	} else {
		return thing2Score;
	}
};

var sortThingsInside = function (parseFunc, order, sitetable){
	// find posts inside current node only, not recursive
	var things = [];
	var thingsFromQuerySelector = sitetable.getElementsByClassName("thing");
	for(var i = 0; i < thingsFromQuerySelector.length; i++){
		if(thingsFromQuerySelector[i].parentNode == sitetable){
			things.push(thingsFromQuerySelector[i]);
		}
	}
	
	var length = things.length;
	do {
		var newLength = 0;
		for(var i = 1; i < length; i++){
			var compareResult = compareThings(things[i - 1], things[i], parseFunc, order);
			if(compareResult != 0){
				if(compareResult > 0){
					try {
						things[i].parentNode.insertBefore(things[i], things[i - 1]);
						var tmp = things[i];
						things[i] = things[i - 1];
						things[i - 1] = tmp;
					} catch(e){}
					newLength = i;
				}
			}
		}
		length = newLength;
	} while(length != 0);
};

var sortThings = function (parseFunc, order){
	var sitetables = document.getElementsByClassName("sitetable"); // this is nested level
	for(var i = 0; i < sitetables.length; i++){
		sortThingsInside(parseFunc, order, sitetables[i]);
	}
};

var siteTable = document.getElementById("siteTable");
if(siteTable){
	var sorts = {
		"Votes" : parseVotes,
		"Hotness": parseHotness,
		"Drama": parseDrama,
		"Comments": parseComments,
		"Depth": parseDepth,
		"Type": parseType,
		"Time": parseTime,
		"Time (children)": parseTimeChildren,
	};
	
	var firstChild = siteTable.firstChild;
	var span = document.createElement("span");
	span.appendChild(document.createTextNode("Sort: "));
	siteTable.insertBefore(span, firstChild);
	
	var first = true;
	
	for(var i in sorts){
		for(var j = 0; j < 2; j++){
			if(first){
				first = false;
			} else {
				var span = document.createElement("span");
				span.appendChild(document.createTextNode(" | "));
				siteTable.insertBefore(span, firstChild);
			}
		
			var order = (j % 2 == 0);
			var link = document.createElement("a");
			link.href = "javascript:void(0);";
			link.setAttribute("sort", i);
			link.setAttribute("order", order);
			link.appendChild(document.createTextNode(i + " " + (order ? "Asc" : "Desc")));
			link.addEventListener("click", function (){
				var sortIndex = this.getAttribute("sort");
				var order = this.getAttribute("order");
				sortThings(sorts[sortIndex], order != "true");
			}, false);
			siteTable.insertBefore(link, firstChild);
		}
	}
}


if(location.search.indexOf("sort=controversial") != -1){
	sortThings(parseDrama, true);
}