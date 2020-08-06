console.log('Backgroud running');


var options = {
  type:"basic",
  title:"eliminarOferta",
  message:"Se eliminó la oferta #background",
  iconUrl:"icons/16.png"
};
//notification options set
chrome.notifications.create('removeNotif', options);
//notification set

function callback() {
console.log("Notification succesfull");
//notification confirmed
}

// chrome.runtime.onMessage.addListener(
//     function(request, sender, sendResponse) {
//       console.log(sender.tab ?
//                   "from a content script:" + sender.tab.url :
//                   "from the extension");
//       if (request.greeting == "hello")
//         sendResponse({farewell: "goodbye"});
//     });