var myTab = document.querySelector("#dgOfertaVenta"); //Hacer referencia a la tabla contenedora de las ofertas

//----------------CONSTRUCTOR DE OFERTAS--------------------------------------------------------
function Oferta(numeroOferta, numeroOrden, mercado, versiones) {
    this.numeroOferta = numeroOferta;
    this.numeroOrden = numeroOrden;
    this.mercado = mercado;
    this.versiones = versiones;
}
//----------------CONSTRUCTOR DE VERSIONES--------------------------------------------------------
function Version(hora, volumen, porcentaje, precio, precioGba) {
    this.hora = hora;
    this.volumen = volumen;
    this.porcentaje = porcentaje;
    this.precio = precio;
    this.precioGba = precioGba;
}

//----------------LECTURA DE LAS OFERTAS EN PANTALLA--------------------------------------------------------
function leerTabla() {
    myTab = document.querySelector("#dgOfertaVenta"); //Hacer referencia a la tabla contenedora de las ofertas
    var ofertas = [];
    if (myTab != null) {
        for (i = 1; i < myTab.rows.length; i++) {
            var oferta = new Oferta(
                parseInt(myTab.firstElementChild.children[i].children[buscarColumna("Nro.Oferta")].innerText),
                i,
                myTab.firstElementChild.children[i].children[buscarColumna("Mercado")].innerText,
                [new Version(
                    dateToNumber(myTab.firstElementChild.children[i].children[buscarColumna("Fecha y horario")].innerText),
                    parseInt(myTab.firstElementChild.children[i].children[buscarColumna("Vol.Ofertado (m³)")].innerText.split('.').join('')),
                    parseFloat(myTab.firstElementChild.children[i].children[buscarColumna("Precio (%)")].innerText.split(',').join('.')),
                    parseFloat(myTab.firstElementChild.children[i].children[buscarColumna("Precio (USD/MMBTU)")].innerText.split(',').join('.')),
                    parseFloat(myTab.firstElementChild.children[i].children[buscarColumna("Precio GBA (USD/MMBTU)")].innerText.split(',').join('.'))
                )]
            )
            var n = oferta.numeroOferta
            ofertas[n - 1] = oferta;
        };
    };
    return ofertas;
}
//------------------------------------------------------------------------------------------------

var subastaLocalSto = 'S_CAMMESA-' + window.location.href.split('=')[1]
//-------------------GUARDAR OFERTAS EN LOCAL STORAGE---------------------------------------------------------------
function guardarOfertas(array) {
    localStorage.setItem(subastaLocalSto, JSON.stringify(array));
};

//------------LEE LAS OFERTAS GUARDADAS EN EL LOCAL STORAGE------------------------------------
function leerLocalStorage() {
    ofertasLocalStorage = JSON.parse(localStorage.getItem(subastaLocalSto));
    return ofertasLocalStorage;
};
//------------CODIGO EJECUTADO----------------------------------------------------------------
// var ofertas = leerTabla();
// console.log(ofertas);
// localStorage.clear();
// leerTabla();
iniciarResumen();
// guardarOfertas(ofertas);
var mostrarResumen = document.querySelector('.menu-icon');
mostrarResumen.addEventListener("click", ocultarMenu, false);
//------------EJECUTA LA ACTUALIZACIÓN DEL RESUMEN CADA UN TIEMPO DEFINIDO---------------------
// var t = 60;
// setInterval(() => {
//     // if (t > 0) { t = t - 1 } else { t = t + 59 };
//     // console.log(decirHora() + " (" + t + ")", leerTabla()[28].versiones[0].volumen);
//     actualizarOfertas();
//     actualizarResumen();
// }, 5000);
//---------------------------------------------------------------------------------------------
//--------------ACTUALIZA OFERTAS EN MEMORIA LOCAL EN CASO DE HABER DETECTADO CAMBIOS-------------------------------------------------------
function actualizarOfertas() {
    var ofertas = leerTabla();
    var ofertasLocalStorageNew = JSON.parse(localStorage.getItem(subastaLocalSto));
    var ofertasLocalStorageOld = JSON.parse(localStorage.getItem(subastaLocalSto));
    // if (ofertas != null && ofertas[0].versiones[0].volumen != null) { console.log('1 ' + ofertas[0].versiones[0].volumen) } else { console.log('1 ' + null) };
    // if (ofertasLocalStorage != null && ofertasLocalStorage[0].versiones[0].volumen != null) { console.log('2 ' + ofertasLocalStorage[0].versiones[0].volumen) } else { console.log('2 ' + null)};
    if (ofertasLocalStorageOld != null) {
        for (var i = 0; i <= ofertas.length; i++) {
            if (ofertasLocalStorageOld[i] != null) {
                if (ofertas[i] != null) {
                    if ((ofertas[i].versiones[0].volumen != ofertasLocalStorageOld[i].versiones[0].volumen) || (ofertas[i].versiones[0].precio != ofertasLocalStorageOld[i].versiones[0].precio)) {
                        ofertasLocalStorageNew[i].versiones.unshift(ofertas[i].versiones[0]);
                    };
                } else if (ofertasLocalStorageOld[i].versiones[0].volumen != null) {
                    ofertasLocalStorageNew[i].numeroOrden = null;
                    ofertasLocalStorageNew[i].versiones.unshift({ "hora": new Date(), "volumen": null, "porcentaje": null, "precio": null, "precioGba": null });
                };
            } else {
                ofertasLocalStorageNew[i] = ofertas[i];
            };
        };
        //console.log(ofertasLocalStorageOld);
        //console.log(ofertasLocalStorageNew);
    } else { ofertasLocalStorageNew = ofertas };
    guardarOfertas(ofertasLocalStorageNew);
};

//------------CONVIERTE FECHA/HORA DE TEXTO A FORMATO DATE-----------------------------------
function dateToNumber(fechaHora) {
    var x = fechaHora.split(" ")
    var dma = x[0].split('/')
    var hms = x[1].split(':')
    fecha = new Date(dma[2], dma[1] - 1, dma[0], hms[0], hms[1], hms[2])
    return fecha //dia 
};

//-------------------DEVUELVE EL INDICE DE LA COLUMNA CON EL NOMBRE INGRESADO POR PARAMETRO---------------------------------------------------------------
function buscarColumna(columna) {
    var cabecera = myTab.firstElementChild.firstElementChild.children;
    var encabezado = [];
    for (var i = 0; i < cabecera.length; i++) {
        encabezado.push(cabecera[i].innerText + cabecera[i].className);
    }
    // console.log(encabezado);
    return encabezado.findIndex((element) => element === columna);
};

//-------------------RESALTA OFERTA CON NUMERO n CON EL COLOR c (ARREGLAR)---------------------------------------------------------------
function resaltarOferta(n, c) {
    //Color row background in HSL space (easier to manipulate fading)
    // var tablaValores = 'table.dataGrid > tbody > tr';
    var filaOferta = $('.dataGrid').children(0).children(0);
    let ofertas = leerTabla();
    var x = ofertas[n - 1].numeroOrden
    filaOferta.eq(x).css('backgroundColor', 'hsl(' + c + ', 100%, 50%)');

    var d = 0;
    for (var i = 50; i <= 100; i = i + 1) { //i represents the lightness
        d += 40;
        (function (ii, dd) {
            setTimeout(function () {
                filaOferta.eq(x).css('backgroundColor', 'hsl(' + c + ',100%,' + ii + '%)');
            }, dd);
        })(i, d);
    }
};

//-------------------OBSERVER: DETECTA CAMBIOS EN LA TABLA DE OFERTAS---------------------------------------------------------------
var tablaOfertas = myTab.firstElementChild;

var configObserver = {
    attributes: false,
    childList: true,
    subtree: true,
    oldValue: false
};

var observer = new MutationObserver(mutations => {
    // console.log(mutations);
    // console.log(mutations[0].target);
    let listaCambios = [];
    if (mutations[0].target != 'div#udtGridUpdater') {
        for (i = 0; i < mutations.length; i++) {
            var nn = parseInt(mutations[i].addedNodes[0].parentNode.parentNode.cells[2].innerHTML);
            listaCambios.push(nn);
            // console.log('Cambió la oferta número ' + nn);
        };
        console.log('(' + decirHora() + ')', listaCambios);
        pintarCambios(listaCambios);
        actualizarResumen();
    };
});

observer.observe(tablaOfertas, configObserver);

//-----------------OBSERVADOR: DETECTA CAMBIOS EN EL ELEMENTO "div.spinner-container"-----------------------------------------------------------------
var procesando = document.querySelector("div.spinner-container");

var configObservador = {
    attributes: true,
    childList: true,
    subtree: true,
    oldValue: true
};

var observador = new MutationObserver(mutations2 => {
    let listaCambios = [];
    if (mutations2[0].target.children[1].parentNode.style.cssText == 'display: none;') {
        let arregloOfertas = leerTabla();
        let ofertasLocalStorage = leerLocalStorage();
        for (var i = 0; i < arregloOfertas.length; i++) {
            if (ofertasLocalStorage[i] && ofertasLocalStorage[i].versiones && arregloOfertas[i]) {
                if ((ofertasLocalStorage[i].versiones[0].volumen != arregloOfertas[i].versiones[0].volumen) || (ofertasLocalStorage[i].versiones[0].precio != arregloOfertas[i].versiones[0].precio)) {
                    listaCambios.push(ofertasLocalStorage[i].numeroOferta);
                };
            };
        };
        if (listaCambios.length === 0) {
            console.log('(' + decirHora() + ')', 'No hubo cambios');
        } else {
            console.log('(' + decirHora() + ') ', listaCambios);
        };
        var tablaOfertas = myTab.firstElementChild;
        observer.observe(tablaOfertas, configObserver);
        pintarCambios(listaCambios);
        actualizarResumen();
    };
    // console.log('(' + decirHora() + ') ' + listaCambios);
});

observador.observe(procesando, configObservador);
//---------------DEVUELVE LA HORA ACTUAL-------------------------------------------------------------------
function decirHora() {
    var fecha = new Date()
    var horas = fecha.getHours()
    var minutos = fecha.getMinutes()
    var segundos = fecha.getSeconds()
    var horaActual = numeral(horas).format('00') + ":" + numeral(minutos).format('00') + ":" + numeral(segundos).format('00');
    return horaActual;
};

//---------------PINTA LOS CAMBIOS INGRESADOS EN UN VECTOR DE NÚMERO DE OFERTA-------------------------------------------------------------------
function pintarCambios(cambios) {
    var arregloOfertas = leerTabla();
    var ofertasLocalStorage = JSON.parse(localStorage.getItem(subastaLocalSto));
    for (var i = 0; i < cambios.length; i++) {
        if (ofertasLocalStorage[cambios[i] - 1]) {
            if ((ofertasLocalStorage[cambios[i] - 1].versiones[0].volumen != arregloOfertas[cambios[i] - 1].versiones[0].volumen) && (ofertasLocalStorage[cambios[i] - 1].versiones[0].precio != arregloOfertas[cambios[i] - 1].versiones[0].precio)) {
                resaltarOferta(cambios[i], 40) //NARANJA
                console.log('Oferta ' + cambios[i] + ' cambió el volumen y el precio')
            } else {
                if (ofertasLocalStorage[cambios[i] - 1].versiones[0].volumen != arregloOfertas[cambios[i] - 1].versiones[0].volumen) {
                    resaltarOferta(cambios[i], 60) //AMARILLO
                    console.log('Oferta ' + cambios[i] + ' cambió el volumen')
                } else {
                    if (ofertasLocalStorage[cambios[i] - 1].versiones[0].precio != arregloOfertas[cambios[i] - 1].versiones[0].precio) {
                        resaltarOferta(cambios[i], 200) //AZUL
                        console.log('Oferta ' + cambios[i] + ' cambió el precio')
                    } else {
                        console.log('Oferta ' + cambios[i] + ' sin cambios')
                    };
                };
            };
        } else {
            resaltarOferta(cambios[i], 160) //VERDE
            console.log('Oferta ' + cambios[i] + ' es nueva')
        };
    };
    actualizarOfertas();
    // actualizarResumen ();
};

//-----------------CALCULA EL TOTAL DE VOLUMEN POR CUENCA-----------------------------------------------------------------
function volumenTotal(cuenca) {
    var arrayOfertas = leerTabla();
    // console.log(arrayOfertas);
    var ofertasFiltradas = arrayOfertas;
    if (cuenca !== "*") {
        var ofertasFiltradas = arrayOfertas.filter(item => item.mercado === cuenca)
    }
    return ofertasFiltradas.reduce((total, item) => total + item.versiones[0].volumen, 0)
};

//-----------------CALCULA EL NUMERO DE OFERTAS POR CUENCA-----------------------------------------------------------------
function cantidadOfertas(cuenca) {
    var arrayOfertas = leerTabla();
    // console.log(arrayOfertas);
    var ofertasFiltradas = arrayOfertas;
    if (cuenca !== "*") {
        var ofertasFiltradas = arrayOfertas.filter(item => (item.mercado === cuenca) && item)
    }
    return ofertasFiltradas.filter(item => item ).length
};

//-----------------CALCULA PRECIO MINIMO POR CUENCA-----------------------------------------------------------------
function menorPrecio(cuenca) {
    var arrayOfertas = leerTabla();
    var ofertasFiltradas = arrayOfertas;
    if (cuenca !== "*") {
        var ofertasFiltradas = arrayOfertas.filter(item => item.mercado === cuenca)
    }
    var precios = ofertasFiltradas.map(item => { return item.versiones[0].precio }).filter(item => item !== null)
    return Math.min(...precios)
};

//-----------------CALCULA PORCENTAJE CORRESPONDIENTE AL PRECIO MINIMO POR CUENCA-----------------------------------------------------------------
function menorPorcentajePrecio(cuenca) {
    var arrayOfertas = leerTabla();
    var ofertasCuenca = arrayOfertas.filter(item => item.mercado === cuenca)
    var precios = ofertasCuenca.map(item => { return item.versiones[0].precio })
    var indice = precios.indexOf(menorPrecio(cuenca));
    return ofertasCuenca[indice].versiones[0].porcentaje;
};

//-----------------OCULTA/MUESTRA EL MENU RESUMEN-----------------------------------------------------------------
function ocultarMenu() {
    var menuBtn = document.querySelector('.menu-icon'),
        menu = document.querySelector("div#resumenVolumen");
    // menu.classList.add('animated', 'bounceOutLeft');

    if (menu.classList.contains('show')) {
        console.log('se ocultó');
        menu.classList.replace('show', 'noshow');
        menu.classList.replace('fadeInLeft', 'fadeOutLeft');
        menuBtn.innerText = 'ver resumen';
    } else {
        console.log('se mostró');
        menu.classList.replace('noshow', 'show');
        menu.classList.replace('fadeOutLeft', 'fadeInLeft');
        menuBtn.innerText = 'ocultar resumen';
    };
};

function hasClass(element, className) {
    return (' ' + element.className + ' ').indexOf(' ' + className + ' ') > -1;
};

//-----------------INICIAR LA TABLA RESUMEN-----------------------------------------------------------------
function iniciarResumen() {

    var noaV = volumenTotal('NOROESTE');
    var nqnV = volumenTotal('NEUQUEN');
    var chuV = volumenTotal('CHUBUT');
    var sczV = volumenTotal('SANTA CRUZ');
    var tdfV = volumenTotal('TIERRA DEL FUEGO');
    var totV = volumenTotal('*');

    var noaC = cantidadOfertas('NOROESTE');
    var nqnC = cantidadOfertas('NEUQUEN');
    var chuC = cantidadOfertas('CHUBUT');
    var sczC = cantidadOfertas('SANTA CRUZ');
    var tdfC = cantidadOfertas('TIERRA DEL FUEGO');
    var totC = cantidadOfertas('*');

    var noaP = menorPrecio('NOROESTE');
    var nqnP = menorPrecio('NEUQUEN');
    var chuP = menorPrecio('CHUBUT');
    var sczP = menorPrecio('SANTA CRUZ');
    var tdfP = menorPrecio('TIERRA DEL FUEGO');
    var totP = menorPrecio('*');

    var noaPP = menorPorcentajePrecio('NOROESTE');
    var nqnPP = menorPorcentajePrecio('NEUQUEN');
    var chuPP = menorPorcentajePrecio('CHUBUT');
    var sczPP = menorPorcentajePrecio('SANTA CRUZ');
    var tdfPP = menorPorcentajePrecio('TIERRA DEL FUEGO');

    // <h2 class="logo">Volúmenes</h2>
    var encabezado = document.querySelector("#megNavegador_uwmMenu")
    encabezado.outerHTML +=
        `
    <span class="menu-icon">ocultar resumen</span>
    <div class="logo-nav-container">
    <div id="resumenVolumen" class="show animated fadeInLeft faster">
    <div>
        <table class="res volumen">
            <thead>
                <tr>
                    <th colspan="2">Mercado</th>
                    <th >Volumen</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>NOA</td>
                    <td id="noaC">(${noaC})</td>
                    <td id="noaV">${noaV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <td>NQN</td>
                    <td id="nqnC">(${nqnC})</td>
                    <td id="nqnV">${nqnV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <td>CHU</td>
                    <td id="chuC">(${chuC})</td>
                    <td id="chuV">${chuV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <td>SCZ</td>
                    <td id="sczC">(${sczC})</td>
                    <td id="sczV">${sczV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <td>TDF</td>
                    <td id="tdfC">(${tdfC})</td>
                    <td id="tdfV">${tdfV.toLocaleString('de-ES')}</td>
                </tr>
                <tr>
                    <th>TOTAL</th>
                    <th id="totC">(${totC})</th>
                    <th id="totV">${totV.toLocaleString('de-ES')}</th>
                </tr>
            </tbody>
        </table>
    </div>
    <h2 class="logo precios"></h2>
    <div>
        <table class="res precio">
            <thead>
                <tr>
                    <th>Mercado</th>
                    <th colspan="2">Precio Mínimo</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>NOA</td>
                    <td id="noaPP">${noaPP.toLocaleString('de-ES', { minimumFractionDigits: 2 })} %</td>
                    <td id="noaP">${noaP.toLocaleString('de-ES', { minimumFractionDigits: 4 })}</td>
                </tr>
                <tr>
                    <td>NQN</td>
                    <td id="nqnPP">${nqnPP.toLocaleString('de-ES', { minimumFractionDigits: 2 })} %</td>
                    <td id="nqnP">${nqnP.toLocaleString('de-ES', { minimumFractionDigits: 4 })}</td>
                </tr>
                <tr>
                    <td>CHU</td>
                    <td id="chuPP">${chuPP.toLocaleString('de-ES', { minimumFractionDigits: 2 })} %</td>
                    <td id="chuP">${chuP.toLocaleString('de-ES', { minimumFractionDigits: 4 })}</td>
                </tr>
                <tr>
                    <td>SCZ</td>
                    <td id="sczPP">${sczPP.toLocaleString('de-ES', { minimumFractionDigits: 2 })} %</td>
                    <td id="sczP">${sczP.toLocaleString('de-ES', { minimumFractionDigits: 4 })}</td>
                </tr>
                <tr>
                    <td>TDF</td>
                    <td id="tdfPP">${tdfPP.toLocaleString('de-ES', { minimumFractionDigits: 2 })} %</td>
                    <td id="tdfP">${tdfP.toLocaleString('de-ES', { minimumFractionDigits: 4 })}</td>
                </tr>
                <tr>
                    <th>TOTAL</th>
                    <th id="totP" colspan="2">${totP.toLocaleString('de-ES', { minimumFractionDigits: 4 })}</th>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="container-btn">
        <a class="link-to-download-json btn" href=jsonUrl style="display:block">JSON</a>
        <a class="link-to-download-csv btn" href=csvUrl>CSV</a>
    </div>
</div>
</div>
`



    //style="display:none"
};

//-----------------ACTUALIZAR LA TABLA RESUMEN-----------------------------------------------------------------
function actualizarResumen() {
    //VOLUMENES
    var volNoa = document.getElementById('noaV');
    var volNqn = document.getElementById('nqnV');
    var volChu = document.getElementById('chuV');
    var volScz = document.getElementById('sczV');
    var volTdf = document.getElementById('tdfV');
    var volTot = document.getElementById('totV');

    volNoa.textContent = volumenTotal('NOROESTE').toLocaleString('de-ES');
    volNqn.textContent = volumenTotal('NEUQUEN').toLocaleString('de-ES');
    volChu.textContent = volumenTotal('CHUBUT').toLocaleString('de-ES');
    volScz.textContent = volumenTotal('SANTA CRUZ').toLocaleString('de-ES');
    volTdf.textContent = volumenTotal('TIERRA DEL FUEGO').toLocaleString('de-ES');
    volTot.textContent = volumenTotal('*').toLocaleString('de-ES');

    //CANTIDAD DE OFERTAS
    var volNoa = document.getElementById('noaC');
    var volNqn = document.getElementById('nqnC');
    var volChu = document.getElementById('chuC');
    var volScz = document.getElementById('sczC');
    var volTdf = document.getElementById('tdfC');
    var volTot = document.getElementById('totC');

    volNoa.textContent = '(' + cantidadOfertas('NOROESTE') + ')';
    volNqn.textContent = '(' + cantidadOfertas('NEUQUEN') + ')';
    volChu.textContent = '(' + cantidadOfertas('CHUBUT') + ')';
    volScz.textContent = '(' + cantidadOfertas('SANTA CRUZ') + ')';
    volTdf.textContent = '(' + cantidadOfertas('TIERRA DEL FUEGO') + ')';
    volTot.textContent = '(' + cantidadOfertas('*') + ')';

    //PRECIOS
    var pNoa = document.getElementById('noaP')
    var pNqn = document.getElementById('nqnP')
    var pChu = document.getElementById('chuP')
    var pScz = document.getElementById('sczP')
    var pTdf = document.getElementById('tdfP')
    var pTot = document.getElementById('totP')

    pNoa.textContent = menorPrecio('NOROESTE').toLocaleString('de-ES', { minimumFractionDigits: 4 })
    pNqn.textContent = menorPrecio('NEUQUEN').toLocaleString('de-ES', { minimumFractionDigits: 4 })
    pChu.textContent = menorPrecio('CHUBUT').toLocaleString('de-ES', { minimumFractionDigits: 4 })
    pScz.textContent = menorPrecio('SANTA CRUZ').toLocaleString('de-ES', { minimumFractionDigits: 4 })
    pTdf.textContent = menorPrecio('TIERRA DEL FUEGO').toLocaleString('de-ES', { minimumFractionDigits: 4 })
    pTot.textContent = menorPrecio('*').toLocaleString('de-ES', { minimumFractionDigits: 4 })

    //PORCENTAJES
    var ppNoa = document.getElementById('noaPP')
    var ppNqn = document.getElementById('nqnPP')
    var ppChu = document.getElementById('chuPP')
    var ppScz = document.getElementById('sczPP')
    var ppTdf = document.getElementById('tdfPP')

    ppNoa.textContent = menorPorcentajePrecio('NOROESTE').toLocaleString('de-ES', { minimumFractionDigits: 2 }) + ' %'
    ppNqn.textContent = menorPorcentajePrecio('NEUQUEN').toLocaleString('de-ES', { minimumFractionDigits: 2 }) + ' %'
    ppChu.textContent = menorPorcentajePrecio('CHUBUT').toLocaleString('de-ES', { minimumFractionDigits: 2 }) + ' %'
    ppScz.textContent = menorPorcentajePrecio('SANTA CRUZ').toLocaleString('de-ES', { minimumFractionDigits: 2 }) + ' %'
    ppTdf.textContent = menorPorcentajePrecio('TIERRA DEL FUEGO').toLocaleString('de-ES', { minimumFractionDigits: 2 }) + ' %'
};



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
// });
var jsonBtn = document.querySelector('.link-to-download-json')
jsonBtn.onclick = function () {
    //-------DOWNLOAD LOCAL STORAGE--------------------------------------------------------------------------
    //Hacer funcion acá, para que siempre se esté bajando el local storage de cada momento.---------------------------------------------!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    var _myArray = JSON.stringify(leerLocalStorage(), null, 2); //indentation in json format, human readable
    var jsonLink = document.querySelector('.link-to-download-json'),
        jsonBlob = new Blob([_myArray], { type: "octet/stream" }),
        jsonName = 'ofertas.json',
        jsonUrl = window.URL.createObjectURL(jsonBlob);
    jsonLink.setAttribute('href', jsonUrl);
    jsonLink.setAttribute('download', jsonName);
    // jsonLink.click();
};

var csvBtn = document.querySelector('.link-to-download-csv')
csvBtn.onclick = function () {
    //-------EXPORTAR TABLA A CSV--------------------------------------------------------------------------
    function exportTableToCSV() {
        var csv = [];
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
    }
    //-------BAJAR TABLA A CSV--------------------------------------------------------------------------
    var csvLink = document.querySelector('.link-to-download-csv'),
        csvBlob = new Blob([exportTableToCSV()], { type: "text/csv" }),
        csvName = 'ofertas.csv',
        csvUrl = window.URL.createObjectURL(csvBlob);
    csvLink.setAttribute('href', csvUrl);
    csvLink.setAttribute('download', csvName);
};