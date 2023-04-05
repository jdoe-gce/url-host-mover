var _groups = undefined;
var _url = undefined;

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

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	var group = undefined;
	
	chrome.storage.sync.get("groups", function(items){
		for(var key in items){
			if(key == "groups"){
				_groups = sortOnKeys(items[key]);
				break;
			}
		}
	});
	
	if ((changeInfo.url || tab.url) && _groups !== undefined) {
	
		var url = changeInfo.url ? changeInfo.url : tab.url;
		
		for(var key in _groups){
			if(_groups[key]['active']){
				group = key;
				break;
			}
		}
		
		if(group === undefined) return; // in case of no active rules group
		
		if(_groups[group]['rules'] === null || 
			_groups[group]['rules'] === undefined)
			return;
		
		const regex = /^https?:\/\//i;
		
		for(i = 0 ; i < _groups[group]['rules'].length ; i++){
			var res = url.replace(regex,'').split('/')[0].split(':')[0];
			
			if(res == _groups[group]['rules'][i][0].split('/')[0]){
				_url = _groups[group]['rules'][i][1].split('/')[0];
				console.log("Redirect from '"+url+"' to '"+url.replace(res, _url)+"'");
				chrome.tabs.update(tabId, { url: url.replace(res, _url) });
			}				
		}
	}
});
