var myTab = document.querySelector("#dgOfertaVenta"); //Hacer referencia a la tabla contenedora de las ofertas

var ofertas = [{ "numeroOferta": null, "numeroOrden": null, "mercado": '', "versiones": [{ "hora": 0, "volumen": 0, "precio": 0 }] }];
var ofertasLocal = [{ "numeroOferta": null, "numeroOrden": null, "mercado": '', "versiones": [{ "hora": 0, "volumen": 0, "precio": 0 }] }];

function leerTabla() {

    if (myTab != null) {
        for (var i = 2; i <= myTab.rows.length; i++) {
            var a = encontrarColumna();
            var b = a + 1
            var c = a + 2
            var d = a + 3
            var e = a + 6
            var n = parseInt(document.querySelector("#dgOfertaVenta > tbody > tr:nth-child(" + i + ") > td:nth-child(" + a + ")").textContent);
            ofertas[n - 1] = {
                "numeroOferta": parseInt(document.querySelector("#dgOfertaVenta > tbody > tr:nth-child(" + i + ") > td:nth-child(" + a + ")").textContent),
                "numeroOrden": i - 1,
                "mercado": document.querySelector("#dgOfertaVenta > tbody > tr:nth-child(" + i + ") > td:nth-child(" + b + ")").textContent,
                "versiones": [
                    {
                        "hora": dateToNumber(document.querySelector("#dgOfertaVenta > tbody > tr:nth-child(" + i + ") > td:nth-child(" + c + ")").textContent),
                        "volumen": parseInt(document.querySelector("#dgOfertaVenta > tbody > tr:nth-child(" + i + ") > td:nth-child(" + d + ")").textContent.split('.').join('')),
                        "precio": parseFloat(document.querySelector("#dgOfertaVenta > tbody > tr:nth-child(" + i + ") > td:nth-child(" + e + ")").textContent.split(',').join('.'))
                    }
                ]
            }
        }
        // return ofertas
    } else {
        console.log("myTab es null")
    };
};

// localStorage.clear();
leerTabla();
iniciarResumen();
guardarOfertas(ofertas);
leerLocal();

function leerLocal(){
    ofertasLocal = JSON.parse(localStorage.getItem('ofertas'));
};

//console.log(ofertas)

var t = 60;
setInterval(() => {
    t=t-1
    console.log(decirHora() + " (" + t + ")");
    actualizarResumen();
}, 1000);


function dateToNumber(fechaHora) {
    var x = fechaHora.split(" ")
    var dma = x[0].split('/')
    var hms = x[1].split(':')
    fecha = new Date(dma[2], dma[1] - 1, dma[0], hms[0], hms[1], hms[2])
    return fecha //dia 
};

function encontrarColumna() {
    var encab = myTab.firstElementChild.firstElementChild;
    var n = encab.childElementCount
    for (var i = 1; i <= n; i++) {
        if (encab.children[i].innerText == "Mercado") {
            return col = i
        }
    }
};

//-------------------GUARDAR OFERTAS EN LOCAL STORAGE---------------------------------------------------------------

function guardarOfertas(array) {
    localStorage.setItem('ofertas', JSON.stringify(array));
};
//-------------------RESALTAR OFERTA---------------------------------------------------------------

function resaltarOferta(n, c) {
    //Color row background in HSL space (easier to manipulate fading)
    // var tablaValores = 'table.dataGrid > tbody > tr';
    var filaOferta = $('.dataGrid').children(0).children(0);
    var x = ofertas[n - 1].numeroOrden
    filaOferta.eq(x).css('backgroundColor', 'hsl(' + c + ', 100%, 50%)');

    var d = 100;
    for (var i = 50; i <= 100; i = i + 1) { //i represents the lightness
        d += 25;
        (function (ii, dd) {
            setTimeout(function () {
                filaOferta.eq(x).css('backgroundColor', 'hsl(' + c + ',100%,' + ii + '%)');
            }, dd);
        })(i, d);
    }
};

//-------------------OBSERVER---------------------------------------------------------------
var tablaOfertas = myTab.firstElementChild;

var configObserver = {
    attributes: false,
    childList: true,
    subtree: true,
    oldValue: false
};

var observer = new MutationObserver(mutations => {
    // console.log(mutations);

console.log(mutations);
console.log(mutations[0].target);

    if (mutations[0].target != 'div#udtGridUpdater') {

        listaCambios = [];
        for (i = 0; i < mutations.length; i++) {
            var nn = mutations[i].addedNodes[0].parentNode.parentNode.cells[2].innerHTML;
            listaCambios.push(nn);
            // console.log('Cambió la oferta número ' + nn);
        };
        console.log(listaCambios);
        pintarCambios(listaCambios);
        // actualizarResumen();
    };
});

observer.observe(tablaOfertas, configObserver);

//-----------------OBSERVADOR-----------------------------------------------------------------
var procesando = document.querySelector("div.spinner-container");

var configObservador = {
    attributes: true,
    childList: true,
    subtree: true,
    oldValue: true
};

var observador = new MutationObserver(mutations2 => {
    if (mutations2[0].target.children[1].parentNode.style.cssText == 'display: none;') {
        // console.log(mutations2[0].target.children[1].parentNode.style.cssText + '------------------------------------------------------');
        leerTabla();
        var ofertasLocal = JSON.parse(localStorage.getItem('ofertas'));

        listaCambios = [];
        for (var i = 0; i < ofertas.length; i++) {
            if (ofertasLocal[i] != null) {
                if ((ofertasLocal[i].versiones[0].volumen != ofertas[i].versiones[0].volumen) || (ofertasLocal[i].versiones[0].precio != ofertas[i].versiones[0].precio)) {
                    listaCambios.push(ofertasLocal[i].numeroOferta);
                };
            };
        };
        if (listaCambios.length === 0) {
            console.log('(' + decirHora() + ') No hubo cambios');
        } else {
            console.log('(' + decirHora() + ') ' + listaCambios);
        };
        var tablaOfertas = myTab.firstElementChild;
        observer.observe(tablaOfertas, configObserver);
        // leerTabla();
        pintarCambios(listaCambios);
    };
});

observador.observe(procesando, configObservador);

//---------------HORA ACTUAL-------------------------------------------------------------------

function decirHora(){

var fecha= new Date()
var horas= fecha.getHours()
var minutos = fecha.getMinutes()
var segundos = fecha.getSeconds()
 
var horaActual = numeral(horas).format('00') + ":" + numeral(minutos).format('00') + ":" + numeral(segundos).format('00');

return horaActual;

};

//---------------PINTAR CAMBIOS-------------------------------------------------------------------
function pintarCambios(cambios) {
    leerTabla();
    ofertasLocal = JSON.parse(localStorage.getItem('ofertas'));
    for (var i = 0; i < cambios.length; i++) {
        if ((ofertasLocal[cambios[i] - 1].versiones[0].volumen != ofertas[cambios[i] - 1].versiones[0].volumen) && (ofertasLocal[cambios[i] - 1].versiones[0].precio != ofertas[cambios[i] - 1].versiones[0].precio)) {
            resaltarOferta(cambios[i], 120) //VERDE
            console.log('Oferta ' + cambios[i] + ' cambió el volumen y el precio')
        } else {
            if (ofertasLocal[cambios[i] - 1].versiones[0].volumen != ofertas[cambios[i] - 1].versiones[0].volumen) {
                resaltarOferta(cambios[i], 60) //AMARILLO
                console.log('Oferta ' + cambios[i] + ' cambió el volumen')
            } else {
                if (ofertasLocal[cambios[i] - 1].versiones[0].precio != ofertas[cambios[i] - 1].versiones[0].precio) {
                    resaltarOferta(cambios[i], 180) //AZUL
                    console.log('Oferta ' + cambios[i] + ' cambió el precio')
                } else { 
                    console.log('Oferta ' + cambios[i] + ' sin cambios')
                };
            };
        };
    };
    actualizarOfertas();
    // actualizarResumen ();
};
//---------------------------ACTUALIZAR OFERTAS EN MEMORIA LOCAL-------------------------------------------------------

function actualizarOfertas() {
    leerTabla();
    var ofertasLocal = JSON.parse(localStorage.getItem('ofertas'));
    // if (ofertas != null && ofertas[0].versiones[0].volumen != null) { console.log('1 ' + ofertas[0].versiones[0].volumen) } else { console.log('1 ' + null) };
    // if (ofertasLocal != null && ofertasLocal[0].versiones[0].volumen != null) { console.log('2 ' + ofertasLocal[0].versiones[0].volumen) } else { console.log('2 ' + null)};
    if (ofertasLocal != null) {
        for (var i = 0; i <= ofertas.length; i++) {
            if (ofertasLocal[i] != null) {
                if (ofertas[i] != null) {
                    if ((ofertas[i].versiones[0].volumen != ofertasLocal[i].versiones[0].volumen) || (ofertas[i].versiones[0].precio != ofertasLocal[i].versiones[0].precio)) {
                        ofertasLocal[i].versiones.unshift(ofertas[i].versiones[0]);
                    };
                } else {
                    if (ofertasLocal[i].versiones[0].volumen != -1) {
                        ofertasLocal[i].versiones.unshift({ "hora": -1, "volumen": -1, "precio": -1 });
                    } else {
                        ofertasLocal[i].versiones[0] = { "hora": -1, "volumen": -1, "precio": -1 };
                    };
                };
            } else {
                ofertasLocal[i] = ofertas[i];
                //ofertasLocal[i].push(ofertas[i]);
            };
        };
        //console.log(ofertasLocal);
        //console.log(ofertas);
    } else { ofertasLocal = ofertas };
    guardarOfertas(ofertasLocal);
};

//-----------------VOLUMENES POR CUENCA-----------------------------------------------------------------

function volumenTotal(cuenca) {
    leerTabla();
    var volumen = 0;

    if (cuenca === '*') {
        for (var i = 0; i < ofertas.length; i++) {
            if (typeof ofertas[i] != 'undefined' && ofertas[i].versiones[0].volumen != -1) {
                volumen += ofertas[i].versiones[0].volumen;
            };
        };
        return volumen

    } else {

        var filtro = ofertas.filter(function (elem) {
            return (elem.mercado === cuenca);
        });
        // console.log(filtro);
        for (var i = 0; i < filtro.length; i++) {
            volumen += filtro[i].versiones[0].volumen;
            // console.log(volumen);
        };
        return volumen;
        // console.log(volumen);
    };
};

//-----------------PRECIOS POR CUENCA-----------------------------------------------------------------

function menorPrecio(cuenca) {
    leerTabla();
    var precios = [];
    var precioMenor = 100000;

    if (cuenca === '*') {
        for (var i = 0; i <= ofertas.length; i++) {
            if (typeof ofertas[i] != 'undefined' && ofertas[i].versiones[0].precio != -1) {
                precios.push(ofertas[i].versiones[0].precio);
            };
            var precioMenor = Math.min(...precios);
        };
    } else {
        var filtro = ofertas.filter(function (elem) {
            return (elem.mercado === cuenca && typeof elem.versiones[0].precio != -1);
        });
        for (i = 0; i < filtro.length; i++) {
            precios.push(filtro[i].versiones[0].precio);
        };
        var precioMenor = Math.min(...precios);
    };
    return precioMenor;
};
//-----------------INICIAR LA TABLA RESUMEN-----------------------------------------------------------------

function iniciarResumen (){

    var noaV=volumenTotal('NOROESTE');
    var nqnV=volumenTotal('NEUQUEN');
    var chuV=volumenTotal('CHUBUT');
    var sczV=volumenTotal('SANTA CRUZ');
    var tdfV=volumenTotal('TIERRA DEL FUEGO');
    var totV=noaV+nqnV+chuV+sczV+tdfV

    var noaP=menorPrecio('NOROESTE');
    var nqnP=menorPrecio('NEUQUEN');
    var chuP=menorPrecio('CHUBUT');
    var sczP=menorPrecio('SANTA CRUZ');
    var tdfP=menorPrecio('TIERRA DEL FUEGO');
    var totP=menorPrecio('*');

    // console.log(noaP);

    var encabezado = document.querySelector("#tablaHeader2")
    encabezado.outerHTML +=
`<div id="resumenVolumen" class="logo-nav-container">
    <h2 class="logo">Volúmenes</h2>
    <div>
        <table class="res">
            <thead>
                <tr>
                    <th>Mercado</th>
                    <th>Volumen (m&sup3)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>NOA</td>
                    <td id="noaV">${noaV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <td>NQN</td>
                    <td id="nqnV">${nqnV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <td>CHU</td>
                    <td id="chuV">${chuV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <td>SCZ</td>
                    <td id="sczV">${sczV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <td>TDF</td>
                    <td id="tdfV">${tdfV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <th>TOTAL</th>
                    <th id="totV">${totV.toLocaleString('de-ES')}</th>
                </tr>
            </tbody>
        </table>
    </div>
    <h2 class="logo">Precios</h2>
    <div>
        <table class="res">
            <thead>
                <tr>
                    <th>Mercado</th>
                    <th>Precio (usd/MMBtu)</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>NOA</td>
                    <td id="noaP">${noaP.toLocaleString('de-ES',{minimumFractionDigits:4})}</td>
                </tr>
                <tr>
                    <td>NQN</td>
                    <td id="nqnP">${nqnP.toLocaleString('de-ES',{minimumFractionDigits:4})}</td>
                </tr>
                <tr>
                    <td>CHU</td>
                    <td id="chuP">${chuP.toLocaleString('de-ES',{minimumFractionDigits:4})}</td>
                </tr>
                <tr>
                    <td>SCZ</td>
                    <td id="sczP">${sczP.toLocaleString('de-ES',{minimumFractionDigits:4})}</td>
                </tr>
                <tr>
                    <td>TDF</td>
                    <td id="tdfP">${tdfP.toLocaleString('de-ES',{minimumFractionDigits:4})}</td>
                </tr>
                <tr>
                    <th>TOTAL</th>
                    <th id="totP">${totP.toLocaleString('de-ES',{minimumFractionDigits:4})}</th>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="container-btn">
        <a class="link-to-download-json btn" onclick="leerLocal()" style="display:none">JSON</a>
        <a class="link-to-download-csv btn" onclick="leerLocal()">CSV</a>
    </div>
</div>
`

};

//-----------------ACTUALIZAR LA TABLA RESUMEN-----------------------------------------------------------------
function actualizarResumen(){
    //VOLUMENES
    var volNoa=document.getElementById('noaV');
    var volNqn=document.getElementById('nqnV');
    var volChu=document.getElementById('chuV');
    var volScz=document.getElementById('sczV');
    var volTdf=document.getElementById('tdfV');
    var volTot=document.getElementById('totV');

    volNoa.textContent=volumenTotal('NOROESTE').toLocaleString('de-ES');
    volNqn.textContent=volumenTotal('NEUQUEN').toLocaleString('de-ES');
    volChu.textContent=volumenTotal('CHUBUT').toLocaleString('de-ES');
    volScz.textContent=volumenTotal('SANTA CRUZ').toLocaleString('de-ES');
    volTdf.textContent=volumenTotal('TIERRA DEL FUEGO').toLocaleString('de-ES');
    volTot.textContent=volumenTotal('*').toLocaleString('de-ES');

    //PRECIOS
    var pNoa=document.getElementById('noaP')
    var pNqn=document.getElementById('nqnP')
    var pChu=document.getElementById('chuP')
    var pScz=document.getElementById('sczP')
    var pTdf=document.getElementById('tdfP')
    var pTot=document.getElementById('totP')

    pNoa.textContent=menorPrecio('NOROESTE').toLocaleString('de-ES',{minimumFractionDigits:4})
    pNqn.textContent=menorPrecio('NEUQUEN').toLocaleString('de-ES',{minimumFractionDigits:4})
    pChu.textContent=menorPrecio('CHUBUT').toLocaleString('de-ES',{minimumFractionDigits:4})
    pScz.textContent=menorPrecio('SANTA CRUZ').toLocaleString('de-ES',{minimumFractionDigits:4})
    pTdf.textContent=menorPrecio('TIERRA DEL FUEGO').toLocaleString('de-ES',{minimumFractionDigits:4})
    pTot.textContent=menorPrecio('*').toLocaleString('de-ES',{minimumFractionDigits:4})
};
//-------DOWNLOAD LOCAL STORAGE--------------------------------------------------------------------------

    var _myArray = JSON.stringify(ofertasLocal, null, 2); //indentation in json format, human readable
    var jsonLink = document.querySelector('.link-to-download-json'),
        jsonBlob = new Blob([_myArray], { type: "octet/stream" }),
        jsonName = 'ofertas.json',
        jsonUrl = window.URL.createObjectURL(jsonBlob);
    jsonLink.setAttribute('href', jsonUrl);
    jsonLink.setAttribute('download', jsonName);
    // vLink.click();

//-------EXPORTAR TABLA A CSV--------------------------------------------------------------------------
(function exportTableToCSV() {
    csv = [];
    var rows = document.querySelectorAll(".dataGrid tbody tr");
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");
        for (var j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        };
        row = row.join(";");
        csv.push(row);
    };
    csv = csv.join('\n');
    return csv
})();

//-------BAJAR TABLA A CSV--------------------------------------------------------------------------

        var csvLink = document.querySelector('.link-to-download-csv'),
            csvBlob = new Blob([csv], {type: "text/csv"}),
            scvName = 'ofertas.csv',
            csvUrl = window.URL.createObjectURL(csvBlob);
        csvLink.setAttribute('href', csvUrl);
        csvLink.setAttribute('download', scvName);
 
//-------BAJAR TABLA A XLS--------------------------------------------------------------------------

// var tableToExcel = (function () {
//     var uri = 'data:application/vnd.ms-excel;base64,'
//         , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
//         , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
//         , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
//     return function (table, name) {
//         if (!table.nodeType) table = document.getElementById(table)
//         var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML }
//         window.location.href = uri + base64(format(template, ctx))
//     }
// })()