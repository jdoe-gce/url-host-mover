function empty(element) {
    while(element.firstElementChild) {
       element.firstElementChild.remove();
    }
  }
  
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
  
  const isValidUrl = urlString => {
      // From this web site : https://www.freecodecamp.org/news/check-if-a-javascript-string-is-a-url/
      var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
      '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
    return !!urlPattern.test(urlString);
  }
  
  var isKnownGroup = function(group){
      for(var key in _groups) {
          if(key == group)
              return true;
      }
      
      return false;
  }
  
  var addHtmlGroup = function(group, ro, i){
      var gl = document.getElementById("groups_list");
      var nd = document.createElement('div');
      var nt = document.createElement('input');
      var nb = document.createElement('input');
          
      nd.style.whiteSpace = "nowrap";
      
      nt.type  = "text";
      nt.value = group;
      nt.id    = "new_group";
      if(ro) {
          nt.id = "new_group_"+i;
          nt.readOnly = true;
      }
          
      nd.appendChild(nt);
      if(!ro){
          nb.type = "button";
          nb.value = "Add";
          
          nb.addEventListener("click", (event) => {
              addGroup(document.getElementById("new_group").value);
          });
          nd.appendChild(nb);
      }
      
      if(ro)
      {
          var rem = document.createElement('input');
          var edi = document.createElement('input');
          var ren = document.createElement('input');
          var che = document.createElement('input');
          
          rem.type  = "button";
          rem.value = "Del";
          edi.type  = "button";
          edi.value = "Edit";
          ren.type  = "button";
          ren.value = "Rename";
          che.type  = "checkbox"
          che.checked = _groups[group]['active'];
          
          rem.addEventListener("click", (event) => {
              delGroup(document.getElementById('new_group_'+i).value);
          });
          
          edi.addEventListener("click", (event) => {
              _current_group = document.getElementById('new_group_'+i).value;
              doDOMRulesList(_current_group);
          });
          
          ren.addEventListener("click", (event) => {
              renameGroup(document.getElementById('new_group_'+i).value);
          });
          
          che.addEventListener("change", function() {
              activeGroup(document.getElementById('new_group_'+i).value, this.checked);
          });
          
          nd.appendChild(edi);
          nd.appendChild(rem);
          nd.appendChild(ren);
          nd.appendChild(che);
      }
      
      gl.appendChild(nd);
  }
  
  var activeGroup = function(group, checked){
      if(!checked){
          _active_group = undefined;
          _groups[group]['active'] = false;
      } else {
          for(var key in _groups){
              if(key != group)
                  _groups[key]['active'] = false;
              else
                  _groups[key]['active'] = true;
          }
      }
      
      chrome.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
          doDOMGroupList();
      });
  }
  
  var emptyList = function(id){
      var gl = document.getElementById(id);
      empty(gl);
      
      if(_current_group !== undefined){
          var el = document.getElementById('rules_title');
          el.innerHTML = "Rules for <u>'" + _current_group + "'</u>";
      }
  }
  
  var varToHtmlGroups = function(){
      var i = 0;
      for(var key in _groups) {
          addHtmlGroup(key, true, i++);
      }
  }
  
  var doDOMGroupList = function(){
      chrome.storage.sync.get("groups", function(items){
          for(var key in items){
              if(key == "groups"){
                  _groups = sortOnKeys(items[key]);
                  emptyList("groups_list");
                  varToHtmlGroups();
                  if(_current_group !== undefined)
                      doDOMRulesList(_current_group);
                  break;
              }
          }
      });
  }
  
  var renameGroup = function(group){
      var new_group = prompt("Please enter the new Group name", group);
      
      if(isKnownGroup(new_group)){
          alert('This group already exists !');
          return;
      }
      
      if(new_group === ""){
          alert('No value set !');
          return;
      }
      
      _groups[new_group] = _groups[group];
      delete _groups[group];
          
      chrome.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
          if(_current_group !== undefined &&
          _current_group === group)
              _current_group = new_group;
              
          doDOMGroupList();
      });
  }
  
  var addGroup = function(group){
      if(group === ""){
          alert('No value set !');
          return;
      }
      
      if(isKnownGroup(group)){
          alert('This group already exists !');
          return;
      }
      
      if(_groups !== undefined && Object.keys(_groups).length == _max_groups){
          alert('Max groups number ('+_max_groups+') reached !');
          return;
      }
      
      if(_groups === undefined)
          _groups = new Object();
      
      _groups[group] = {"active": false};
      _current_group = group;
      chrome.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
          doDOMGroupList();
      });
  }
  
  var delGroup = function(group){
      const conf = confirm("Are you sure you want remove "+group+" group ?");
  
      if(conf){
          delete _groups[group];
          _current_group = undefined;
          chrome.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
              doDOMGroupList();
          });
      }
  }
  
  var isKnownRule = function(from, to, group){
      for(var key in _groups) {
          if(key == group){
              if(_groups[group]['rules'] == null)
                  return false;
              for(i = 0 ; i < _groups[group]['rules'].length ; i++){
                  if(_groups[group]['rules'][i][0] == from && _groups[group]['rules'][i][1] == to)
                      return true;
              }				
          }
      }
      
      return false;
  }
  
  var addRule = function(from, to, group){
      if(isKnownRule(from, to, group)){
          alert('This rule already exists for the group ' + group + ' !');
          return;
      }
      
      if(from === "" || to === ""){
          alert('Missing value !');
          return;
      }
      
      if(!isValidUrl(from)){
          alert('Source string is not a compliant URL !');
          return;
      }
      
      if(!isValidUrl(to)){
          alert('Destination string is not a compliant URL !');
          return;
      }
      
      if(_groups[group]["rules"] === undefined)
          _groups[group]["rules"] = [[from, to]];
      else{
          if(_groups[group]["rules"].length == _max_rules){
              alert('Max rules number (' + _max_rules + ') reached !');
              return;
          }
          _groups[group]["rules"].push([from, to]);
      }
      
      chrome.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
          doDOMGroupList();
      });
  }
  
  var delRule = function(num, group){
      const conf = confirm("Are you sure you want remove this rule ?");
  
      if(conf){
          _groups[group]['rules'].splice(num,1);
          chrome.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
              doDOMGroupList();
          });
      }
  }
  
  var editRule = function(num, from, to, group){
      if(!isValidUrl(from)){
          alert('Source string is not Web Url compliant !');
          return;
      }
      
      if(!isValidUrl(to)){
          alert('Destination string is not Web URL compliant !');
          return;
      }
      
      _groups[group]['rules'][num][0] = from;
      _groups[group]['rules'][num][1] = to;
      chrome.storage.sync.set({"groups": sortOnKeys(_groups)}, function(items){
          doDOMGroupList();
      });
  }
  
  var addHtmlRule = function(from_txt, to_txt, ro, i, group){
      var gl   = document.getElementById("group_content");
      var nd   = document.createElement('div');
      var hid  = document.createElement('input');
      var from = document.createElement('input');
      var to   = document.createElement('input');
      var add  = document.createElement('input');
      var edi  = document.createElement('input');
      var rem  = document.createElement('input');
      
      nd.style.whiteSpace = "nowrap";
      
      hid.type = "hidden";
      hid.value = -1;
      hid.id = "new_rule";
      
      if(ro){
          hid.value = i;
          hid.id = "new_rule_"+i;
          from.id = "new_rule_from_"+i;
          to.id = "new_rule_to_"+i;
      } else {
          from.id = "new_rule_from";
          to.id = "new_rule_to";
      }
      from.type = "text";
      from.value = from_txt;
      from.addEventListener("input", function() {
          this.style.backgroundColor = "yellow";
      });
      
      to.type = "text";
      to.value = to_txt;
      to.addEventListener("input", function() {
          this.style.backgroundColor = "yellow";
      });	
      
      add.type = "button";
      add.value = "Add";
      
      add.addEventListener("click", (event) => {
          addRule(document.getElementById("new_rule_from").value,
                  document.getElementById("new_rule_to").value, 
                  group);
      });
      
      nd.appendChild(hid);
      nd.appendChild(from);
      nd.appendChild(to);
      if(!ro)
          nd.appendChild(add);
      
      if(ro)
      {
          edi.type  = "button";
          edi.value = "Save";
          rem.type  = "button";
          rem.value = "Del";
          
          rem.addEventListener("click", (event) => {
              delRule(document.getElementById('new_rule_'+i).value, group);
          });
          
          edi.addEventListener("click", (event) => {
              editRule(document.getElementById('new_rule_'+i).value, 
                      document.getElementById('new_rule_from_'+i).value, 
                      document.getElementById('new_rule_to_'+i).value, 
                      group);
          });
          
          nd.appendChild(edi);
          nd.appendChild(rem);
      }
      
      gl.appendChild(nd);
  } 
  
  var addHtmlRuleButton = function(group){
      var gl = document.getElementById("group_content");
      var bt = document.createElement('input')
      bt.type = 'button';
      bt.value = 'Add Rule';
      bt.className = group;
      bt.addEventListener("click", (event) => {
          if(_groups[group]["rules"] !== null && 
              _groups[group]["rules"] !== undefined && 
              _groups[group]["rules"].length == _max_rules){
              alert('Max rules number ('+_max_rules+') reached !');
              return;
          }
          
          if(document.getElementById('new_rule') === null)
              addHtmlRule("", "", false, "", group);
      });
      gl.appendChild(bt);
  }
  
  var varToHtmlGroupRules = function(group){
      addHtmlRuleButton(group);
      if(_groups[group]["rules"] === undefined)
          return;
      
      for(i = 0 ; i < _groups[group]["rules"].length ; i++) {
          addHtmlRule(_groups[group]["rules"][i][0].toString(), 
                      _groups[group]["rules"][i][1].toString(), 
                      true, i, group);
      }
  }
  
  var doDOMRulesList = function(group){
      chrome.storage.sync.get("groups", function(items){
          for(var key in items){
              if(key == "groups"){
                  _groups = items[key];
                  emptyList("group_content");
                  varToHtmlGroupRules(group);
                  break;
              }
          }
      });
  }
  
  // Start working
  var _groups        = undefined;
  var _current_group = undefined;
  var _active_group  = undefined;
  var _max_groups    = 20;
  var _max_rules     = 50;
  
  document.addEventListener('DOMContentLoaded', function() { 
      var group_add = document.getElementById("group_add");
      group_add.addEventListener("click", (event) => {
          if(_groups !== undefined && 
              Object.keys(_groups).length === _max_groups){
              alert('Max groups number (' + _max_groups + ') reached !');
              return;
          }
          
          if(document.getElementById('new_group') === null)
              addHtmlGroup("", false, "");
      });
      
      doDOMGroupList();
      
  }, false);
  