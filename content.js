var s = document.createElement('script');
// var m = document.createElement('script');
var n = document.createElement('script');
// TODO: add "script.js" to web_accessible_resources in manifest.json
s.src = chrome.runtime.getURL('script.js');
// m.src = chrome.runtime.getURL('materialize.min.js');
n.src = chrome.runtime.getURL('numeral.min.js');

// chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
//     console.log(response.farewell);
//   });

s.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(s);
// m.onload = function() {
//     this.remove();
// };
// (document.head || document.documentElement).appendChild(m);
n.onload = function() {
    this.remove();
};
(document.head || document.documentElement).appendChild(n);

// var iframe  = document.createElement ("iframe");
// iframe.src  = chrome.extension.getURL ("prueba.html");
// var yourDIV = document.querySelector("body");
// yourDIV.appendChild(iframe);