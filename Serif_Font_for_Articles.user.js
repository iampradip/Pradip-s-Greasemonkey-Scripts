// ==UserScript==
// @name        Serif Font for Articles
// @namespace   iampradip@github
// @description Analyzes page and uses serif font for paragraphs
// @include     *
// @version     1
// @grant       GM_registerMenuCommand
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

const MIN_FONT_SIZE = "minFontSize";
const MIN_CHAR_COUNT = 500;
const MIN_PARA_COUNT = 2;

var tags = ["p"];
for(var i = 1; i <= 6; i++){
	tags.push("h" + i);
}

var tree = [];
for(var tagIndex in tags){
	var elements = document.getElementsByTagName(tags[tagIndex]);
	for(var i = 0; i < elements.length; i++){
		var parent = elements[i].parentNode;
		var found = false;
		for(var j = 0; j < tree.length; j++){
			if(tree[j].element == parent){
				tree[j].count++;
				found = true;
				break;
			}
		}
		if(!found){
			tree.push({
				count: 1,
				element: parent
			});
		}
	}
}

var minFontSize = parseInt(GM_getValue(MIN_FONT_SIZE, "10"));
if(isNaN(minFontSize)){
	minFontSize = 10;
}

var setMenu = false;
var setSize = function (){
	tree.forEach(function (item){
		if(item.count >= MIN_PARA_COUNT && item.element.textContent && item.element.textContent.length >=MIN_CHAR_COUNT){
			setMenu = true;
			item.element.style.fontFamily = "serif";
			var fontSize = parseInt(window.getComputedStyle(item.element).fontSize);
			if(fontSize < minFontSize){
				item.element.style.fontSize = minFontSize + "px";
			}
			//item.element.style.fontSize = "1.15em";
		}
	});
};

setSize();

if(setMenu){
	GM_registerMenuCommand("Serif Font -> Increase Min Size", function (){
		GM_setValue(MIN_FONT_SIZE, "" + (minFontSize + 1));
		minFontSize = parseInt(GM_getValue(MIN_FONT_SIZE, "10"));
		setSize();
	});
	GM_registerMenuCommand("Serif Font -> Decrease Min Size", function (){
		GM_setValue(MIN_FONT_SIZE, "" + (minFontSize - 1));
		minFontSize = parseInt(GM_getValue(MIN_FONT_SIZE, "10"));
		setSize();
	});
}
