console.log('popup.js ejecutado');

var boton = document.getElementById('boton')
console.log(boton);

boton.addEventListener("click", function(){

    console.log('hiciste clic');

    var options = {
        type:"basic",
        title:"eliminarOferta",
        message:"Se eliminó la oferta #",
        iconUrl:"icons/16.png"
      };
      //notification options set
      chrome.notifications.create('removeNotif', options);
      //notification set
      
      function callback() {
      console.log("Notification succesfull");
      //notification confirmed
      }

});

