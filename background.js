var _groups = undefined;

function sortOnKeys(dict) {
    var sorted = [];
    for(var key in dict) {
        sorted[sorted.length] = key;
    }
    sorted.sort();

    var tempDict = {};
    for(var i = 0; i < sorted.length; i++) {
        tempDict[sorted[i]] = dict[sorted[i]];
    }

    return tempDict;
}

function redirectToNewURL(url){
	const regex = /^https?:\/\//i;
	var group   = undefined;

	for(var key in _groups){
		if(_groups[key]['active']){
			group = key;
			break;
		}
	}
	
	// in case of no active rules group or other undefined value
	if(group === undefined ||
		_groups[group]['rules'] === null || 
		_groups[group]['rules'] === undefined) 
		return undefined;
	
	// minify "_groups" variable
	var g = _groups[group]['rules'];
	for(i = 0 ; i < g.length ; i++){
		// split with "/" (if long URL) then with ":" (if port)
		var res = url.replace(regex,'').split('/')[0].split(':')[0];
		if(res == g[i][0].split('/')[0])
			return url.replace(res, g[i][1].split('/')[0]);
	}
	
	return undefined;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	chrome.storage.sync.get("groups", function(items){
		for(var key in items){
			if(key == "groups"){
				_groups = sortOnKeys(items[key]);
				if ((changeInfo.url || tab.url) && _groups !== undefined) {
					var url = changeInfo.url ? changeInfo.url : tab.url;
					var res = redirectToNewURL(url);
				}
				if(res){
					console.log("Redirect from '" + url + "' to '" + res + "'");
					chrome.tabs.update(tabId, { url: res });
				}
				break;
			}
		}
	});	
});
