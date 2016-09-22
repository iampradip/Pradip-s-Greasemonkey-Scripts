// ==UserScript==
// @name        Reddit - Tracker
// @namespace   iampradip@github
// @include     https://*.reddit.com/r/*
// @include     http://*.reddit.com/r/*
// @version     1
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_addStyle
// @description Tracks comments and votes and highlights them on update
// ==/UserScript==

(function (){

var DB = {
	KEY: "track",
	getRaw: function (){
		return GM_getValue(DB.KEY, "");
	},
	get: function (){
		var raw = DB.getRaw();
		if(raw.length > 0){
			return JSON.parse(raw);
		}
		return {};
	},
	set: function (o){
		GM_setValue(DB.KEY, JSON.stringify(o));
	},
	remove: function (){
		GM_deleteValue(DB.KEY);
	},
};

var parseVotes = function (thing){
	var votes = thing.querySelector(".score.unvoted");
	if(votes){
		return parseInt(votes.textContent);
	}
	return -1;
};

var parseComments = function (thing){
	var comments = thing.querySelector(".comments");
	if(comments){
		return parseInt(comments.textContent);
	} else {
		return thing.getElementsByClassName("thing").length;
	}
};

var parseId = function (thing){
	return thing.getAttribute("data-fullname");
}

var postsInside = function (el){
	var things = [];
	var thingsFromQuerySelector = el.getElementsByClassName("thing");
	for(var i = 0; i < thingsFromQuerySelector.length; i++){
		if(thingsFromQuerySelector[i].parentNode == el){
			things.push(thingsFromQuerySelector[i]);
		}
	}
	return things;
};

var forEachPosts = function (func){
	var forEachPostsInside = function (el){
		func(el);
		
		var posts = postsInside(el);
		for(var i = 0; i < posts.length; i++){
			forEachPostsInside(posts[i]);
		}
	};

	var sitetables = document.getElementsByClassName("sitetable");
	for(var i = 0; i < sitetables.length; i++){
		forEachPostsInside(sitetables[i]);
	}
};

GM_registerMenuCommand("Track posts in this page", function (){
	var o = DB.get();
	
	forEachPosts(function (el){
		var id = parseId(el);
		if(id){
			o[id] = {
				"votes": parseVotes(el),
				"comments": parseComments(el)
			};
		}
	});
	
	DB.set(o);
	console.log(o);
});

var o = DB.get();

var addTag = function (post, tag, comment){
	var tagline = post.getElementsByClassName("tagline");
	if(tagline.length > 0){
		var span = document.createElement("span");
		span.className = "tracker tracker-" + tag.toLowerCase();
		span.appendChild(document.createTextNode(tag));
		if(comment){
			span.setAttribute("title", comment);
		}
		tagline[0].insertBefore(span, tagline[0].firstChild);
	} else {
		console.log("Tagline not found for " + post.textContent);
	}
}

forEachPosts(function (el){
	var id = parseId(el);
	if(id){
		if(o[id]){
			var votes = parseVotes(el);
			var comments = parseComments(el);
			var message = "";
			var tag = "";
			
			var newComments = (comments - o[id].comments);
			var newVotes = (votes - o[id].votes);
			
			if(!isNaN(newComments) && newComments != 0){
				if(message.length > 0){
					message += ", ";
				}
				
				message += newComments + " Comments";
				
				if(tag.length == 0){
					tag = "Commented";
				}
			}
			if(!isNaN(newVotes) && newVotes != 0){
				if(message.length > 0){
					message += ", ";
				}
				
				message += newVotes + " Votes";
				
				if(tag.length == 0){
					tag = newVotes > 0 ? "Upvoted" : "Downvoted";
				}
			}
			if(tag.length > 0){
				addTag(el, tag, message);
			} else {
				addTag(el, "Unmodified");
			}
		}
	}
});

var db = DB.getRaw();
if(db.length > 0){
	GM_registerMenuCommand("Delete tracking posts (" + db.length + ")", function (){
		var db = DB.getRaw();
		if(confirm("Press OK to delete all track records (" + db.length + ").")){
			DB.remove();
			alert("Deleted");
		}
	});
}

GM_addStyle("\
	.tracker {\
		background: black;\
		color: white !important;\
		padding: 1px 4px;\
		margin: 0 2px;\
		border-radius: 3px;\
	}\
	.tracker-unmodified {\
		background: black !important;\
	}\
	.tracker-upvoted {\
		background: green !important;\
	}\
	.tracker-downvoted {\
		background: #800 !important;\
	}\
	.tracker-commented {\
		background: #008 !important;\
	}\
");

})();