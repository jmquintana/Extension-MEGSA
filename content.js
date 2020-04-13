var s = document.createElement('script');
var n = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('script.js');
n.src = chrome.runtime.getURL('numeral.min.js');
s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);
n.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(n);