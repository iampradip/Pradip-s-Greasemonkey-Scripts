// ==UserScript==
// @name        Sort Tables
// @namespace   iampradip@github
// @include     *
// @version     1
// @grant       GM_addStyle
// @description Sorts any table found in webpage. Click to sort normally. Ctrl+Click to force sort all rows.
// ==/UserScript==

(function (){
	var isSortAsc = true;

	var sort = function (ignoreTH, _this){
		var table = _this;
		while(table && table.nodeName.toLowerCase() != "table"){
			table = table.parentNode;
		}
		
		if(table){
			var firstRow, firstCell, first, firstTrimmed;
			var secondRow, secondCell, second, secondTrimmed;
			
			var i, j, tmp, compare, sorted;
		
			var column = parseInt(_this.getAttribute("data-column"));
			
			do {
				sorted = true;
				for(i = 0; i < table.rows.length - 1; i++){
					if(ignoreTH){
						if(!table.rows[i].cells[column] || table.rows[i].cells[column].nodeName.toLowerCase() == "th"){
							continue;
						}
					}
					
					firstRow = table.rows[i];
					secondRow = table.rows[i + 1];
					
					if(firstRow.cells.length != secondRow.cells.length){
						continue;
					}
					
					firstCell = firstRow.cells[column];
					secondCell = secondRow.cells[column];
					
					if(!firstCell || !secondCell){
						continue;
					}
				
					first = firstCell.textContent.trim();
					second = secondCell.textContent.trim();
					
					firstTrimmed = first.replace(/,/g, "").replace(/\s?%$/, "");
					secondTrimmed = second.replace(/,/g, "").replace(/\s?%$/, "");
					
					if(!isNaN(firstTrimmed) && !isNaN(secondTrimmed)){
						compare = parseFloat(secondTrimmed) - parseFloat(firstTrimmed);
					} else {
						compare = second.localeCompare(first);
					}
					
					if(!isSortAsc){
						compare = -compare;
					}
					
					if(compare < 0){
						for(j = 0; j < table.rows[i].cells.length; j++){
							tmp = table.rows[i].cells[j].innerHTML;
							table.rows[i].cells[j].innerHTML = table.rows[i + 1].cells[j].innerHTML;
							table.rows[i + 1].cells[j].innerHTML = tmp;
						}
						sorted = false;
					}
				}
			} while (!sorted);
			
			isSortAsc = !isSortAsc;
		}
	};

	var tables = document.getElementsByTagName("table");
	for(var i = 0; i < tables.length; i++){
		var table = tables[i];
		
		if(table.rows.length > 1){
			if(!table.rows[0].className){
				table.rows[0].className ="";
			}
			table.rows[0].className = (table.rows[0].className + " table-sorter-row").trim();
			
			if(!table.className){
				table.className = "";
			}
			table.className = (table.className + " table-sortable").trim();
			table.addEventListener("mousemove", function (event){
				var hasClass = (this.className.match(/\bshift\b/i) != null);
				if(event.shiftKey){
					if(!hasClass){
						this.className = (this.className + " shift").trim();
					}
				} else {
					if(hasClass){
						this.className = (this.className.replace(/\bshift\b/i, "")).trim();
					}
				}
			}, false);
			table.addEventListener("mouseout", function (){
				var hasClass = (this.className.match(/\bshift\b/i) == null);
				if(hasClass){
					this.className = (this.className.replace(/\bshift\b/i, "")).trim();
				}
			}, false);
			
			for(var j = 0; j < table.rows[0].cells.length; j++){
				table.rows[0].cells[j].setAttribute("data-column", j);
				table.rows[0].cells[j].addEventListener("click", function (event){
					if(event.shiftKey){
						console.log("table sort click");
						sort(!event.ctrlKey, this);
					}
				}, false);
			}
		}
	}
	
	GM_addStyle("\
		.table-sortable.shift .table-sorter-row {\
			cursor: ns-resize;\
		}\
		.table-sortable.shift:hover {\
			box-shadow: 0 0 4px #44c;\
		}\
		.table-sortable.shift:hover > tr > th, \
		.table-sortable.shift:hover > tr > td, \
		.table-sortable.shift:hover > tbody > tr > th, \
		.table-sortable.shift:hover > tbody > tr > td, \
		.table-sortable.shift:hover > thead > tr > th, \
		.table-sortable.shift:hover > thead > tr > td {\
			box-shadow: 0 0 1px #4c4;\
		}\
		.table-sortable.shift:hover > .table-sorter-row > th,\
		.table-sortable.shift:hover > .table-sorter-row > td,\
		.table-sortable.shift:hover > thead > .table-sorter-row > th,\
		.table-sortable.shift:hover > thead > .table-sorter-row > td,\
		.table-sortable.shift:hover > tbody > .table-sorter-row > th, \
		.table-sortable.shift:hover > tbody > .table-sorter-row > td {\
			box-shadow: 0 0 4px #c44;\
		}\
	");
})();