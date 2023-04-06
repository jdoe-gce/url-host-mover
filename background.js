var _groups = undefined;

function sortOnKeys(d) {
    var s = [], t = {};

    for(var k in d)
        s[s.length] = k;
    s.sort();

    for(var i = 0; i < s.length; i++)
        t[s[i]] = d[s[i]];

    return t;
}

function goToNewURL(url){
	const r = /^https?:\/\//i;
	var group = undefined;

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
	for(var i = 0 ; i < g.length ; i++){
		// first split with "/" (if long URL) then with ":" (if port)
		var res = url.replace(r,'').split('/')[0].split(':')[0];
		if(res === g[i][0].split('/')[0].split(':')[0])
			return url.replace(res, g[i][1].split('/')[0].split(':')[0]);
	}
	
	return undefined;
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	chrome.storage.sync.get("groups", function(items){
		for(var k in items){
			if(k === "groups"){
				_groups = sortOnKeys(items[k]);
				if ((changeInfo.url || tab.url) && _groups !== undefined) {
					var url = changeInfo.url ? changeInfo.url : tab.url;
					var res = goToNewURL(url);
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
