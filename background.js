console.log('Backgroud running');

// chrome.browserAction.onClicked.addListener(function(tab){
//     chrome.tabs.executeScript(null,{file:"content.js"})
// })
// listening for an event / one-time requests
// coming from the popup



// chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
//     switch(request.type) {
//         case "color-divs":
//             // colorDivs();

//             console.log('se hizo click');
//         break;
//     }
//     return true;
// });

// setTimeout(() => {
    
//     chrome.storage.local.get('ofertas', function(items) { // null implies all items
//         // Convert object to a string.
//         var result = JSON.stringify(items);
        
//         // Save as file
//         var url = 'data:application/json;base64,' + btoa(result);
//         console.log(url);
//         chrome.downloads.download({
//             url: url,
//             filename: 'ofertas.json'
//         });
//     });
// }, 5000);