// ==UserScript==
// @name        Reddit Links Table
// @namespace   iampradip@github
// @include     https://*.reddit.com/*/comments/*
// @version     1
// @grant       GM_registerMenuCommand
// @grant       GM_addStyle
// ==/UserScript==

var addLinksToTable = function (links, post, score, table) {
	var row = table.insertRow(table.rows.length);
	for(var i = 0; i < 4; i++){
		row.insertCell(row.cells.length);
	}
	
	row.cells[0].appendChild(document.createTextNode(score));
	row.cells[2].appendChild(post.cloneNode(true));
	
	for(var i = 0; i < links.length; i++){
		if(i != 0){
			row.cells[1].appendChild(document.createTextNode(", "));
		}
	
		var link = document.createElement("a");
		link.href = links[i].href;
		link.target = "_blank";
		link.appendChild(document.createTextNode(links[i].textContent));
		row.cells[1].appendChild(link);
	}
};

var appendChild = function (tag, text, to){
	var element = document.createElement(tag);
	element.appendChild(document.createTextNode(text));
	to.appendChild(element);
	return element;
};

var generateTableIn = function (sitetable){
	var table = document.createElement("table");
	table.setAttribute("border", 1);
	table.className = "generated-links-table";
	
	var row = table.insertRow(0);
	appendChild("th", "Votes", row).setAttribute("width", "5%");
	appendChild("th", "Links", row).setAttribute("width", "25%");
	appendChild("th", "Post", row).setAttribute("width", "75%");
	
	var entries = sitetable.getElementsByClassName("entry");
	for(var i = 0; i < entries.length; i++){
		var entry = entries[i];
		var userText = entry.getElementsByClassName("usertext-body");
		for(var j = 0; j < userText.length; j++){
			var links = userText[j].getElementsByTagName("a");
			if(links.length > 0){
				var links2 = [];
				for(var k = 0; k < links.length; k++){
					if(links[k].hostname && links[k].hostname != location.hostname){
						links2.push(links[k]);
					}
				}
				
				if(links2.length > 0){
					var unvoted = entry.getElementsByClassName("unvoted");
					var score = "?";
					if(unvoted.length > 0){
						score = parseInt(unvoted[0].textContent);
					}
					
					addLinksToTable(links2, userText[j], score, table);
				}
			}
		}
	}
	
	sitetable.innerHTML = "";
	sitetable.appendChild(table);
};

var generateTable = function (){
	var sitetables = document.querySelectorAll(".commentarea .sitetable");
	for(var i = 0; i < sitetables.length; i++){
		generateTableIn(sitetables[i]);
	}
};

GM_registerMenuCommand("Generate Links Table", generateTable, false);

GM_addStyle("\
	table.generated-links-table th {\
		font-weight: bold;\
	}\
	table.generated-links-table td, table.generated-links-table th {\
		vertical-align: top;\
		padding: 2px;\
	}\
");