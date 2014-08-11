(function ($) {
	// Define delimiters
	// It’s good to choose characters that won’t be encoded to save cookie space
	var delim = {
		item: "__",
		data: "--"
	};

    $.fn.anonymousLists = function (params) {
        if (methods[params]) {
            return methods[params].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof params === "object" || !params) {
            return methods.init.apply(this, arguments);
        } else {
            $.error("Method " + params + " does not exist on jQuery.anonymousLists");
        }
    };

    $.fn.anonymousLists.defaultSettings = {
		id: "anonLists",
        lists: ["History"],
		listCaptions: [],
		lang: "",
		// Example of naming your tabs in more than one language:
		//listCaptions: ["en-History|gr-Ιστορικό", "en-Favorites|gr-Αγαπημένα"],
		//lang: "gr",
        listSizes: 20,
        preserveTab: false,
		autoHistory: true,
		clearListButton: false,
		deleteItemButton: true,
		backgroundMode: false,
		autoTabSwitch: false,
		emptyListsHTML: "<div class='emptyText'></div>",
		onClearList: function () {},
		onDeleteItem: function () {},
		// item is an object with properties: title, url & desc
		onRenderItem: function (item) { return getSingleLineHtml(item); }
		//onRenderItem: function (item) { return getItemHtml(item); }
    };

    var methods = {
        init: function (options) {
            return this.each(function () {
                var $anonLists = $(this);
                $anonLists.settings = 
                	$.extend(true, {}, $.fn.anonymousLists.defaultSettings, options || {});
				$anonLists.settings.id += "-" + $anonLists.attr("id");

				if ($anonLists.hasClass('backgroundMode')) {
					$anonLists.settings.backgroundMode = true;
				}

				var lists = $anonLists.settings.lists,
					id = $anonLists.settings.id,
					emptyListsHTML = [], tabsHTML = "", listsHTML = "", 
					selTab = null, selLang = null;
				
				$anonLists.settings.listSizes = 
					fillFrom($anonLists.settings.listSizes, lists.length, "number");
				emptyListsHTML = $anonLists.settings.emptyListsHTML = 
					fillFrom($anonLists.settings.emptyListsHTML, lists.length, "string");								

                $anonLists.data("anonymousLists", $anonLists.settings);                

				for (i in lists) {					
					if (lists[i] === "History" && $anonLists.settings.autoHistory) {
						addListItem($anonLists, "History", 
							document.title, location.href, new Date(), false);
					}

					if (!$anonLists.settings.backgroundMode) {
						tabsHTML += renderTabsHtml(id, lists[i]);
						listsHTML += renderListHtml($anonLists, lists[i], emptyListsHTML[i]);
					}
				}
				
				if ($anonLists.settings.backgroundMode) {
					return;
				}
				
				$anonLists.addClass('cleanslate');
                $anonLists.append("<div class='myLists'><ul class='tabs'>" + tabsHTML +
					"</ul><div class='panelContainer'>" + listsHTML + "</div></div>");
	
				selLang = getCookie(id + "_lang");				
				selLang = selLang == null ? $anonLists.settings.lang : selLang;
				
				if (selLang != "") {
						setCulture($anonLists, selLang);
				}
				
				$anonLists.children().find(".tabs a").click(function () {
					var $this = $(this);

					$anonLists						
						.find(".panel")
							// hide() doesn't work with the cleanslate.css
							.attr("style", "display: none !important")
						.end()
						.find(".tabs a.active")
							.removeClass("active")
						.end()
						.find($this.attr("href"))
							.fadeIn(250);

					$this.addClass("active").blur();

					if ($anonLists.settings.preserveTab) {
						setCookie(id + "_tab", $this.attr("href"), 365);
					}

					return false;
				});

				$anonLists.delegate(".clearList", "click", function () {
					var $this = $(this),
						listName = $this.attr("id").replace("btnClear", "");
					
					delCookie(id + "_" + listName);
					$this.parent().replaceWith(
						renderListHtml($anonLists, listName, emptyListsHTML[lists.indexOf(listName)]));
					$anonLists.settings.onClearList.call($anonLists);

					return false;
				});

				$anonLists.delegate(".delItem", "click", function () {
					var $this = $(this),
						listName = $this.attr("id").replace("btnDel", "");

					$anonLists.settings.onDeleteItem.call(
						$anonLists, 
						remListItem($anonLists, listName, $this.parent().index())
					);

					return false;
				});

				if ($anonLists.settings.preserveTab) {
					selTab = getCookie(id + "_tab");
				}

				$anonLists.find(".tabs li" + 
					(selTab == null ? ":first a" : " a:[href='" + selTab + "']")).click();
            });
        },
		addToHistory: function() {
			addListItem($(this), "History", document.title, location.href, new Date(), true);
		},
		// In info we pass all the data we want to use (display) about each item (like date & desc)
		addToList: function (list, title, url, info) {			
			addListItem($(this), list, title, url, info == null ? "" : info, true);
		},
		addItemToList: function (list, item) {			
			addListItem($(this), list, item.title, item.url,
				item.info == null ? "" : item.info,
				true);
		},
		remFromList: function (list, url) {
			return remListItem($(this), list, url);
		},
		isInList: function (list, url) {
			return listItemIndex($(this), list, url) > -1 ? true : false;
		},
		setLang: function (lang) {
			setCulture($(this), lang);
		}
    };

	// Parameter values can be either an array, where we return it as is,
	// or a single value, in which case we create and return an array of that value
	// In a 3 list history plugin:
	// number 10 returns array [10, 10, 10]
	// array [10, 8, 12] returns array [10, 8, 12]
    function fillFrom(values, length, type)
    {    	
		if (typeof values === type) {
			var filledArray = [];

			for (var i = 0; i < length; i++) {
				filledArray[i] = values;
			}
			
			return filledArray;
		} else {
			return values;	
		}		
    }

	function setCulture(el, lang)
	{
		var	data = el.data("anonymousLists"),
			elId = "#" + el.attr("id"),
			lists = data.lists,
			listCaptions = data.listCaptions;

		if (data.backgroundMode ||
			lists.length != listCaptions.length) return;
		
		for (i in lists) {
			$(elId + " a:[href='#" + data.id + "_" + lists[i] + "Panel']")
				.html(localizedCaption(lists[i], listCaptions[i], lang));
		}
		
		setCookie(data.id + "_lang", lang, 365);
	}
	
	function localizedCaption(list, listCaption, lang)
	{
		var captions = listCaption.split("|");
			
		for (var i = 0; i < captions.length; i++) {
			if (captions[i].indexOf(lang + "-") != -1) {
				return captions[i].replace(lang + "-", "");
			}
		}	

		return list;
	}
	
	function renderTabsHtml(id, list)
	{
		return "<li><a href='#" + id + "_" + list.replace(" ", "") + "Panel'>" +
			list + "</a></li>";
	}
		
	function renderListHtml(el, list, empty)
	{
		var	data = el.data("anonymousLists"),
			listId = data.id + "_" + list,
			// Spaces aren't allowed in id values
			listHTML = "<div id='" + listId.replace(" ", "") + "Panel' class='panel'>",
			itemCk = getCookie(listId),
			items = [],
			itemValues = [],
			item;

		if (itemCk != null) {
			items = itemCk.split(delim.item);
		}
		
		if (items.length > 0) {
			listHTML += "<ul>";
			
			for (var i = items.length - 1; i >= 0; i--) {
				itemValues = items[i].split(delim.data);
				item = {
					title: itemValues[0],
					url: itemValues[1],
					info: itemValues[2] 
				};

				listHTML += "<li>" + data.onRenderItem.call(el, item) + (data.deleteItemButton ?
					"<a id='btnDel" + list + "' class='delItem' title='Remove from list'>" +
					"Remove</a>" : "") + "</li>";
			};
			
			listHTML += "</ul>" + (data.clearListButton ?
				"<button id='btnClear" + list + "' class='clearList'>Clear " + list + "</button>" :
				"");
		} else {
			listHTML += empty;
		}
		
		return listHTML + "</div>";
	}
	
	function getItemHtml(item)
	{
		return "<a href='" + item.url + " class='item'>" +
			item.title + "</a>" + (item.info === "" ? "" : "<br><em>" + 
			parseDate(item.info) + "</em>");
	}
	
	function getSingleLineHtml(item)
	{
		return "<a href='" + item.url + "'" + 
			(item.info === "" ? "" : " title='" + parseDate(item.info) + "'") +
			" class='item'>" + item.title + "</a>";
	}

	function parseDate(str)
	{
		if (Date.parse(str)) {
			var dt = new Date(str);

			if(isToday(dt)) {
				return "Last visited today on " + printTime(dt);
			} else {
				return "Last visited on " + printDateTime(dt);
			}
		} else {
			return str;
		}
	}

	function isToday(dt)
	{
		return (new Date(dt)).setHours(0,0,0,0) === (new Date()).setHours(0,0,0,0);
	}

	function printTime(dt)
	{
		return (dt.getHours() > 12 ? dt.getHours() - 12 : dt.getHours()) +
			":" + (dt.getMinutes() < 10 ? "0" : "") + dt.getMinutes() +
			//":" + (dt.getSeconds() < 10 ? "0" : "") + dt.getSeconds() +
			(dt.getHours() > 12 ? ' PM': ' AM');
	}

	function printDate(dt)
	{
		return (dt.getDate() < 10 ? "0" : "") + dt.getDate() + "/" +
			(dt.getMonth() + 1 < 10 ? "0" : "") + (dt.getMonth() + 1) + "/" +
			dt.getFullYear();
	}

	function printDateTime(dt)
	{
		return printDate(dt) + " " + printTime(dt);
	}

	function addListItem(el, list, title, url, info, updatePanel)
	{
		var data = el.data("anonymousLists"),
			listId = data.id + "_" + list,
			ckData = getCookie(listId),
			ckItems = [],
			size = data.listSizes[data.lists.indexOf(list)];

		if (ckData != null) {
			ckItems = ckData.split(delim.item);
		}

		// If link already exists, move it to the top
		for (var i in ckItems) {			
			if (ckItems[i].split(delim.data)[1] === url) {
				ckItems.splice(i, 1);
				break;
			}
		}

		ckItems.push(
			delimClear(title) + delim.data + 
			url + delim.data +
			delimClear(info)
		);

		setCookie(listId, ckItems.slice(ckItems.length > size ? 1 : 0).join(delim.item), 365);
		
		if (updatePanel && !data.backgroundMode) {
			var panelId = "#" + listId.replace(" ", "") + "Panel",
				$panel = $(panelId),
				visible = $panel.is(":visible");

			$panel.replaceWith(renderListHtml(el, list, ""));

			if (!visible) {
				// We can't use the $panel object, because we just changed it
				// and thus, we select again: $(panelId)
				$(panelId).attr("style", "display: none !important");
			}

			if (data.autoTabSwitch && !visible && list != "History") {
				$(panelId).parent().parent().find(".tabs li a:contains('" + list + "')").click();
			}
		}
	}

	function delimClear(str)
	{
		return typeof str === "string" ? str.replace(delim.item, "").replace(delim.data, "") : str;
	}

	function remListItem(el, list, item)
	{
		var data = el.data("anonymousLists"),
			listId = data.id + "_" + list,
			ckData = getCookie(listId),
			ckItems = [], ckItemData = [],
			url = "",
			index = -1;

		if (ckData != null) {
			ckItems = ckData.split(delim.item);
		}

		// If item is not the item's index, but its url
		if (typeof item != "number") {
			// Find item's index using the url
			for (var i in ckItems) {
				ckItemData = ckItems[i].split(delim.data);

				if (ckItemData[1] === item) {
					url = item;
					index = i;
					break;
				}
			}
		} else {
			index = ckItems.length - item - 1;
			url = ckItems[index].split(delim.data)[1];
		}

		// If found
		if (index != -1) {
			if (ckItems.length > 1) {
				ckItems.splice(index, 1);
				setCookie(listId, ckItems.join(delim.item), 365);
			}
			else {
				delCookie(listId);
			}

			if (!data.backgroundMode) {
				var panelId = "#" + listId.replace(" ", "") + "Panel",
					$panel = $(panelId),
					visible = $panel.is(":visible");

				$panel.replaceWith(
					renderListHtml(el, list, data.emptyListsHTML[data.lists.indexOf(list)]));

				if (!visible) {
					$(panelId).attr("style", "display: none !important");
				}

				if (data.autoTabSwitch && !visible && list != "History") {
					$(panelId).parent().parent().find(".tabs li a:contains('" + list + "')").click();
				}
			}
		}

		return {"url": url, "index": index};
	}

	function listItemIndex(el, list, url)
	{
		var listId = el.data("anonymousLists").id + "_" + list,
			ckData = getCookie(listId),
			ckItems = [], ckItemData = [];

		if (ckData != null) {
			ckItems = ckData.split(delim.item);
		}

		for (var i in ckItems) {
			ckItemData = ckItems[i].split(delim.data);

			if (ckItemData[1] === url) {
				return i;
			}
		}

		return -1;
	}
	
    function setCookie(c_name, value, exdays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value = escape(value) + ((exdays == null) ? "" : "; expires=" + exdate.toUTCString());
        document.cookie = c_name + "=" + c_value;
    }

    function getCookie(c_name) {
        var c_value = document.cookie,
        	c_start = c_value.indexOf(" " + c_name + "=");
		
        if (c_start === -1) {
            c_start = c_value.indexOf(c_name + "=");
        }
		
        if (c_start === -1) {
            c_value = null;
        } else {
            c_start = c_value.indexOf("=", c_start) + 1;
            var c_end = c_value.indexOf(";", c_start);
			
            if (c_end === -1) {
                c_end = c_value.length;
            }
			
            c_value = unescape(c_value.substring(c_start, c_end));
        }
		
        return c_value;
    }

    function delCookie(c_name)
    {
    	setCookie(c_name, "", -1);
    }

})(jQuery);

// It enables working with the lists, with or without display (on background),
// by attaching the anonymousLists object to an on the fly created anchor object. 
// It does so, when the element with the given id (normally a div) isn't found.
// Example: tabHolder("#history").anonymousLists();
function tabsHolder(id)
{
	var $el = jQuery(id);	
	return $el.length === 0 ? jQuery("<div id='" + id.replace("#", "") + 
		"' class='backgroundMode'></div>") : $el;
}