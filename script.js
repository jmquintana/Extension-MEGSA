const myTab = document.querySelector(".dataGrid"); //Hacer referencia a la tabla contenedora de las ofertas

//----------------CONSTRUCTOR DE OFERTAS--------------------------------------------------------
class Oferta {
    constructor(numeroOferta, numeroOrden, mercado, versiones) {
        this.numeroOferta = numeroOferta;
        this.numeroOrden = numeroOrden;
        this.mercado = mercado;
        this.versiones = versiones;
    }
}
//----------------CONSTRUCTOR DE VERSIONES--------------------------------------------------------
class Version {
    constructor(hora, volumen, porcentaje, precio, precioGba) {
        this.hora = hora;
        this.volumen = volumen;
        this.porcentaje = porcentaje;
        this.precio = precio;
        this.precioGba = precioGba;
    }
}

let colOferta = buscarColumna(/Nro.Oferta$/);
let colMercado = buscarColumna(/Mercado/);
let colFecha = buscarColumna(/Fecha\w?/);
let colVolumen = buscarColumna(/Vol.Ofertado\w?/);
let colPrecioPorcentaje = buscarColumna(/Precio\s\(\%\)/);
let colPrecio = buscarColumna(/Precio\s\(USD\/MMBTU\)/);
let colPrecioGBA = buscarColumna(/Precio\sGBA\w?/);

//--------------RESALTAR OFERTA CON CLICK-------------------------------
function agregarListenerSumas() {
    document.querySelectorAll("#dgOfertaVenta > tbody > tr").forEach(item =>
        item.addEventListener('click', event => {
            event.preventDefault();
            const celda = event.target.parentNode.children;
            if (celda && celda[colOferta]) {
                const oferta = celda[colOferta].textContent;
                if (subTotalMercado(oferta)) {
                    subTotalMercado(oferta).ofertas.forEach(el => resaltarOferta(el.numeroOferta, 60));
                    popUp(subTotal(oferta).volumenTotal, subTotalMercado(oferta).volumenTotal, subTotalMercado(oferta).ofertas[0].mercado, event);
                };
            };
        })
    );
}
//--------------POP UP VOLUMEN-------------------------------
const popUp = (subTotal, subTotalMercado, mercado, e) => {
    const div = document.createElement("div");
    const prevDiv = document.querySelector('div.popup');
    let myVar, show;

    if (subTotal === subTotalMercado) {
        show = "none";
    } else {
        show = "table-row";
    }

    div.classList.add('popup');
    div.classList.add('animated');
    div.classList.add('faster');
    div.classList.add('fadeInDown');
    div.innerHTML = `   <table class="popup">
                            <tbody>
                                <tr>
                                    <td><b>${subTotalMercado} m${'3'.sup()}</b></td>
                                    <td> en ${mercado}</td>
                                </tr>
                                <tr style="display:${show}">
                                    <td><b>${subTotal} m${'3'.sup()}</b></td>
                                    <td> en TODAS</td>
                                </tr>
                            </tbody>
                        </table>
                    `;

    if (prevDiv) document.body.removeChild(prevDiv);
    document.body.appendChild(div);
    div.style.position = 'fixed';
    div.style.borderBottom = '2px solid rgb(31, 69, 122, 1)';
    div.style.boxShadow = '0px 0px 20px rgb(31, 69, 122, 0.3)';
    div.style.backgroundColor = 'rgb(166, 213, 191, 1)';
    div.style.borderRadius = '2px';
    div.style.padding = '0.4em';
    div.style.top = `${e.clientY + 15}px`;
    div.style.left = `${e.clientX + 30}px`;

    function deleteDiv() {
        myVar = setTimeout(() => div.remove(), 1000)
    }

    (() => {
        myVar = setTimeout(() => {
            div.classList.replace('fadeInDown', 'fadeOut');
            deleteDiv();
        }, 3000)
    })();
    function myStopFunction() {
        clearTimeout(myVar);
    }

    div.addEventListener('mouseover', event => {
        event.preventDefault();
        myStopFunction();
        div.classList.replace('fadeOut', 'fadeIn');
    });

    div.addEventListener('mouseleave', event => {
        event.preventDefault();
        (function () {
            myVar = setTimeout(() => {
                div.classList.replace('fadeInDown', 'fadeOut');
                div.classList.replace('fadeIn', 'fadeOut');
                deleteDiv();
            }, 750);
        })();
    });

}

//--------------SUMAR OFERTAS HASTA LA SELECCIONADA-------------------------------
const subTotalMercado = (numeroOferta) => {
    if (!isNaN(numeroOferta)) {
        const ofertas = leerTabla(myTab);
        const ofertasFiltradas = ofertas.filter(el => (el.numeroOrden <= ofertas[numeroOferta - 1].numeroOrden && el.mercado == ofertas[numeroOferta - 1].mercado));
        return {
            ofertas: ofertasFiltradas,
            volumenTotal: ofertasFiltradas.reduce((total, item) => total + item.versiones[0].volumen, 0).toLocaleString('es-ES')
        };
    }
}

const subTotal = (numeroOferta) => {
    if (!isNaN(numeroOferta)) {
        const ofertas = leerTabla(myTab);
        const ofertasFiltradas = ofertas.filter(el => el.numeroOrden <= ofertas[numeroOferta - 1].numeroOrden);
        return {
            ofertas: ofertasFiltradas,
            volumenTotal: ofertasFiltradas.reduce((total, item) => total + item.versiones[0].volumen, 0).toLocaleString('es-ES')
        };
    }
}

//----------------LECTURA DE LAS OFERTAS EN PANTALLA--------------------------------------------------------
function leerTabla(myTab) {
    // myTab = document.querySelector("#dgOfertaVenta"); //Hacer referencia a la tabla contenedora de las ofertas

    let ofertas = [];
    if (myTab) {

        for (i = 1; i < myTab.rows.length; i++) {
            // let mercado = ;

            let oferta = new Oferta(
                parseInt(myTab.firstElementChild.children[i].children[colOferta].innerText),
                i,
                (colMercado != -1) ? myTab.firstElementChild.children[i].children[colMercado].innerText : document.querySelector("#cboMercado").children[document.querySelector("#cboMercado").selectedIndex].innerText,
                [new Version(
                    dateToNumber(myTab.firstElementChild.children[i].children[colFecha].innerText),
                    parseInt(myTab.firstElementChild.children[i].children[colVolumen].innerText.split('.').join('')),
                    parseFloat(myTab.firstElementChild.children[i].children[colPrecioPorcentaje].innerText.split(',').join('.')),
                    parseFloat(myTab.firstElementChild.children[i].children[colPrecio].innerText.split(',').join('.')),
                    parseFloat(myTab.firstElementChild.children[i].children[colPrecioGBA].innerText.split(',').join('.'))
                )]
            );
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
    console.log('Se guardaron las ofertas en el Local Storage');
};

//------------LEE LAS OFERTAS GUARDADAS EN EL LOCAL STORAGE------------------------------------
function leerLocalStorage() {
    console.log('Se lee el Local Storage');
    return JSON.parse(localStorage.getItem(subastaLocalSto));
};
//------------CODIGO EJECUTADO----------------------------------------------------------------
// var ofertas = leerTabla();
// console.log(ofertas);
// localStorage.clear();
// leerTabla();
if (myTab) {
    iniciarResumen();
    // var mostrarResumen = document.querySelector('.menu-icon');
    // mostrarResumen.addEventListener("click", ocultarMenu, false);
    agregarListenerSumas();
};
var ofertasLocalStorage = [];

if (!leerLocalStorage()) {
    guardarOfertas(leerTabla(myTab));
};

// guardarOfertas(leerTabla());
//------------EJECUTA LA ACTUALIZACIÓN DEL RESUMEN CADA UN TIEMPO DEFINIDO---------------------
// var t = 60;
// setInterval(() => {
//     // if (t > 0) { t = t - 1 } else { t = t + 59 };
//     // console.log(decirHora() + " (" + t + ")", leerTabla()[28].versiones[0].volumen);
//     actualizarOfertas();
//     actualizarResumen();
// }, 5000);
//---------------------------------------------------------------------------------------------

//---------------DEVUELVE LA HORA ACTUAL-------------------------------------------------------------------
function decirHora() {
    var fecha = new Date()
    var horas = fecha.getHours()
    var minutos = fecha.getMinutes()
    var segundos = fecha.getSeconds()
    var horaActual = numeral(horas).format('00') + ":" + numeral(minutos).format('00') + ":" + numeral(segundos).format('00');
    return horaActual;
};

//--------------ACTUALIZA OFERTAS EN MEMORIA LOCAL EN CASO DE HABER DETECTADO CAMBIOS-------------------------------------------------------
function actualizarOfertas() {

    var ofertas = leerTabla(myTab);
    var ofertasLocalStorage = leerLocalStorage();

    if (ofertasLocalStorage != null) {
        for (var i = 0; i <= ofertas.length; i++) {

            var volumenNew = 0;
            var precioNew = 0;
            var volumenOld = 0;
            var precioOld = 0;

            if (ofertas[i]) {
                volumenNew = ofertas[i].versiones[0].volumen;
                precioNew = ofertas[i].versiones[0].precio;
            } else {
                volumenNew = null
                precioNew = null
            };

            if (ofertasLocalStorage[i]) {
                volumenOld = ofertasLocalStorage[i].versiones[0].volumen;
                precioOld = ofertasLocalStorage[i].versiones[0].precio;
            } else {
                volumenOld = null
                precioOld = null
            };

            if (ofertas[i] != null && ofertasLocalStorage[i] == null) {
                // console.log(i, true, false);
                ofertasLocalStorage[i] = ofertas[i];
            } else if (ofertas[i] == null && ofertasLocalStorage[i] != null) {
                // console.log(i, false, true);
                ofertasLocalStorage[i].numeroOrden = null;
                if (volumenOld != null) {
                    ofertasLocalStorage[i].versiones.unshift(new Version(new Date(), null, null, null, null));
                }
            } else if (ofertas[i] == null && ofertasLocalStorage[i] == null) {
                // console.log(i, false, false);
            } else if (volumenNew != volumenOld || precioNew != precioOld) {
                // console.log(i, volumenNew, volumenOld, precioNew, precioOld);
                ofertasLocalStorage[i].versiones.unshift(ofertas[i].versiones[0]);
            }
        };
    } else {
        ofertasLocalStorage = ofertas
        console.log('Se copiaron las ofertas');
    };
    console.log('Se actualizaron las ofertas');
    guardarOfertas(ofertasLocalStorage);
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
function buscarColumna(nombreColumna) {
    if (myTab) {
        var cabecera = myTab.firstElementChild.firstElementChild.children;
        var encabezado = [];
        for (var i = 0; i < cabecera.length; i++) {
            encabezado.push(cabecera[i].innerText + cabecera[i].className);
        }
        return encabezado.findIndex((element) => element.match(nombreColumna));
    }
};

//-------------------RESALTA OFERTA CON NUMERO n CON EL COLOR c (ARREGLAR)---------------------------------------------------------------
function resaltarOferta(n, c) {
    //Color row background in HSL space (easier to manipulate fading)
    var filaOferta = $('.dataGrid').children(0).children(0);
    let ofertas = leerTabla(myTab);
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
if (myTab) {
    let tablaOfertas = myTab.firstElementChild;

    var configObserver = {
        attributes: false,
        childList: true,
        subtree: true,
        oldValue: false
    };

    var observer = new MutationObserver(mutations => {

        let listaCambios = [];
        let nn = 0
        // console.log(mutations);
        for (i = 0; i < mutations.length; i++) {
            if (mutations[i].target != 'div#udtGridUpdater') {
                if (mutations[i].addedNodes.length > 0 && mutations[0].removedNodes.length === 0) {
                    if (mutations[i].addedNodes[0].cells) {
                        nn = parseInt(mutations[i].addedNodes[0].cells[colOferta].innerHTML);
                    };
                    console.log("Se agregó oferta", nn);
                    listaCambios.push(nn);
                } else if (mutations[i].addedNodes.length === 0 && mutations[0].removedNodes.length > 0) {
                    nn = parseInt(mutations[i].removedNodes[0].cells[colOferta].innerHTML);
                    console.log("Se eliminó oferta", nn);
                } else {
                    for (i = 0; i < mutations.length; i++) {
                        nn = parseInt(mutations[i].addedNodes[0].parentNode.parentNode.cells[colOferta].innerText);
                        console.log("Cambió oferta", nn);
                        listaCambios.push(nn);
                    };
                }
            };
            // console.log('(' + decirHora() + ')', listaCambios, mutations[0]);
            pintarCambios(listaCambios);
        };
    });

    observer.observe(tablaOfertas, configObserver);
}
//-----------------OBSERVADOR: DETECTA CAMBIOS EN EL ELEMENTO "div.spinner-container"-----------------------------------------------------------------
if (myTab) {
    var procesando = document.querySelector("div.spinner-container");

    var configObservador = {
        attributes: true,
        childList: true,
        subtree: true,
        oldValue: true
    };

    let observador = new MutationObserver(mutations2 => {
        let listaCambios = [];
        if (mutations2[0].target.children[1].parentNode.style.cssText == 'display: none;') {
            let arregloOfertas = leerTabla(myTab);
            // ofertasLocalStorage = leerLocalStorage();
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
            agregarListenerSumas();
            // actualizarResumen();
        };
        // console.log('(' + decirHora() + ') ' + listaCambios);
    });

    observador.observe(procesando, configObservador);
};

//---------------PINTA LOS CAMBIOS INGRESADOS EN UN VECTOR DE NÚMERO DE OFERTA-------------------------------------------------------------------
function pintarCambios(cambios) {

    ofertasLocalStorage = leerLocalStorage();

    var ofertas = leerTabla(myTab);

    for (var i = 0; i < cambios.length; i++) {

        var volumenNew = 0;
        var precioNew = 0;
        var volumenOld = 0;
        var precioOld = 0;

        if (ofertas[cambios[i] - 1]) {
            volumenNew = ofertas[cambios[i] - 1].versiones[0].volumen;
            precioNew = ofertas[cambios[i] - 1].versiones[0].precio;
        } else {
            volumenNew = null
            precioNew = null
        };

        if (ofertasLocalStorage[cambios[i] - 1]) {
            volumenOld = ofertasLocalStorage[cambios[i] - 1].versiones[0].volumen;
            precioOld = ofertasLocalStorage[cambios[i] - 1].versiones[0].precio;
        } else {
            volumenOld = null
            precioOld = null
        };

        if (volumenOld) {
            if (volumenOld != volumenNew && precioOld != precioNew) {
                resaltarOferta(cambios[i], 40) //NARANJA
                console.log('Oferta ' + cambios[i] + ' cambió el volumen y el precio')
            } else {
                if (volumenOld != volumenNew) {
                    resaltarOferta(cambios[i], 60) //AMARILLO
                    console.log('Oferta ' + cambios[i] + ' cambió el volumen')
                } else {
                    if (precioOld != precioNew) {
                        resaltarOferta(cambios[i], 180) //AZUL
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
    console.log('Se pintaron los cambios');
    actualizarOfertas();
    actualizarResumen();
};

//-----------------CALCULA EL TOTAL DE VOLUMEN POR CUENCA-----------------------------------------------------------------
function volumenTotal(cuenca) {
    var arrayOfertas = leerTabla(myTab);
    // console.log(arrayOfertas);
    var ofertasFiltradas = arrayOfertas;
    if (cuenca !== "*") {
        var ofertasFiltradas = arrayOfertas.filter(item => item.mercado === cuenca)
    }
    return ofertasFiltradas.reduce((total, item) => total + item.versiones[0].volumen, 0).toLocaleString('es-ES')
};

//-----------------CALCULA EL NUMERO DE OFERTAS POR CUENCA-----------------------------------------------------------------
function cantidadOfertas(cuenca) {
    var arrayOfertas = leerTabla(myTab);
    // console.log(arrayOfertas);
    var ofertasFiltradas = arrayOfertas;
    if (cuenca !== "*") {
        var ofertasFiltradas = arrayOfertas.filter(item => (item.mercado === cuenca) && item)
    }
    return ofertasFiltradas.filter(item => item).length
};

//-----------------CALCULA PRECIO MINIMO POR CUENCA-----------------------------------------------------------------
function menorPrecio(cuenca) {
    var arrayOfertas = leerTabla(myTab);
    var ofertasFiltradas = arrayOfertas;
    if (cuenca !== "*") {
        var ofertasFiltradas = arrayOfertas.filter(item => item.mercado === cuenca)
    }
    var precios = ofertasFiltradas.map(item => { return item.versiones[0].precio }).filter(item => item !== null)
    if (precios.length > 0) {
        return Math.min(...precios)
    } else {
        return '-'
    }
};

//-----------------CALCULA PORCENTAJE CORRESPONDIENTE AL PRECIO MINIMO POR CUENCA-----------------------------------------------------------------
function menorPorcentajePrecio(cuenca) {
    var arrayOfertas = leerTabla(myTab);
    var ofertasCuenca = arrayOfertas.filter(item => item.mercado === cuenca)
    var precios = ofertasCuenca.map(item => { return item.versiones[0].precio })
    if (precios.length > 0) {
        var indice = precios.indexOf(menorPrecio(cuenca));
        return ofertasCuenca[indice].versiones[0].porcentaje.toLocaleString('es-ES', { minimumFractionDigits: 2 }) + '%'
    } else {
        return '-'
    }
};

//-----------------OCULTA/MUESTRA EL MENU RESUMEN-----------------------------------------------------------------
function ocultarMenu() {
    var burger = document.querySelector('.burger'),
        menu = document.querySelector("div.logo-nav-container"),
        menuContainer = document.querySelector('.menuContainer');
    // menu.classList.add('animated', 'bounceOutLeft');

    if (menu.classList.contains('show')) {
        console.log('se ocultó el resumen');
        menu.classList.replace('show', 'noshow');
        menu.classList.replace('fadeInLeft', 'fadeOutLeft');
        // menuBtn.innerText = 'ver resumen';
        burger.classList.toggle('activate');
        menuContainer.classList.toggle('activate');
    } else {
        console.log('se mostró el resumen');
        menu.classList.replace('noshow', 'show');
        menu.classList.replace('fadeOutLeft', 'fadeInLeft');
        // menuBtn.innerText = 'ocultar resumen';
        burger.classList.toggle('activate');
        menuContainer.classList.toggle('activate');
    };
};

//-----------------FUNCION QUE DEVUELVE SI UN ELEMENTO TIENE DETERMINADA CLASE------------------------------------
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

    var noaP = menorPrecio('NOROESTE').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    var nqnP = menorPrecio('NEUQUEN').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    var chuP = menorPrecio('CHUBUT').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    var sczP = menorPrecio('SANTA CRUZ').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    var tdfP = menorPrecio('TIERRA DEL FUEGO').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    var totP = menorPrecio('*').toLocaleString('es-ES', { minimumFractionDigits: 4 });

    var noaPP = menorPorcentajePrecio('NOROESTE');
    var nqnPP = menorPorcentajePrecio('NEUQUEN');
    var chuPP = menorPorcentajePrecio('CHUBUT');
    var sczPP = menorPorcentajePrecio('SANTA CRUZ');
    var tdfPP = menorPorcentajePrecio('TIERRA DEL FUEGO');

    // <h2 class="logo">Volúmenes</h2>
    var encabezado = document.querySelector("#megNavegador_uwmMenu");
    if (encabezado) {
        encabezado.outerHTML +=
            `
    <span class="menu-icon" style="display:none">ocultar resumen</span>
    <div class="menuContainer activate">
        <div class="burger activate">
            <div class="line1"></div>
            <div class="line2"></div>
            <div class="line3"></div>
        </div>
    </div>
    <div class="logo-nav-container show animated fadeInLeft faster">
        <div id="resumenVolumen">
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
                            <td id="noaV">${noaV}</td>
                        </tr>
                        <tr>
                            <td>NQN</td>
                            <td id="nqnC">(${nqnC})</td>
                            <td id="nqnV">${nqnV}</td>
                        </tr>
                        <tr>
                            <td>CHU</td>
                            <td id="chuC">(${chuC})</td>
                            <td id="chuV">${chuV}</td>
                        </tr>
                        <tr>
                            <td>SCZ</td>
                            <td id="sczC">(${sczC})</td>
                            <td id="sczV">${sczV}</td>
                        </tr>
                        <tr>
                            <td>TDF</td>
                            <td id="tdfC">(${tdfC})</td>
                            <td id="tdfV">${tdfV}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>TOTAL</th>
                            <th id="totC">(${totC})</th>
                            <th id="totV">${totV}</th>
                        </tr>
                    </tfoot>
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
                            <td id="noaPP">${noaPP}</td>
                            <td id="noaP">${noaP}</td>
                        </tr>
                        <tr>
                            <td>NQN</td>
                            <td id="nqnPP">${nqnPP}</td>
                            <td id="nqnP">${nqnP}</td>
                        </tr>
                        <tr>
                            <td>CHU</td>
                            <td id="chuPP">${chuPP}</td>
                            <td id="chuP">${chuP}</td>
                        </tr>
                        <tr>
                            <td>SCZ</td>
                            <td id="sczPP">${sczPP}</td>
                            <td id="sczP">${sczP}</td>
                        </tr>
                        <tr>
                            <td>TDF</td>
                            <td id="tdfPP">${tdfPP}</td>
                            <td id="tdfP">${tdfP}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <th>TOTAL</th>
                            <th></th>
                            <th id="totP" colspan="2">${totP}</th>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div class="container-btn">
                <a class="link-to-download-json btn" href=jsonUrl style="display:none">JSON</a>
                <a class="link-to-download-csv btn" href=csvUrl>CSV</a>
            </div>
        </div>
    </div>`
    }
    // const mostrarResumen = document.querySelector('.menu-icon');
    const burger = document.querySelector('.burger');
    // mostrarResumen.addEventListener("click", ocultarMenu, false);
    burger.addEventListener("click", ocultarMenu, false);

    const jsonBtn = document.querySelector('.link-to-download-json');
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

    const csvBtn = document.querySelector('.link-to-download-csv');
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

    volNoa.textContent = volumenTotal('NOROESTE');
    volNqn.textContent = volumenTotal('NEUQUEN');
    volChu.textContent = volumenTotal('CHUBUT');
    volScz.textContent = volumenTotal('SANTA CRUZ');
    volTdf.textContent = volumenTotal('TIERRA DEL FUEGO');
    volTot.textContent = volumenTotal('*');

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
    var pNoa = document.getElementById('noaP');
    var pNqn = document.getElementById('nqnP');
    var pChu = document.getElementById('chuP');
    var pScz = document.getElementById('sczP');
    var pTdf = document.getElementById('tdfP');
    var pTot = document.getElementById('totP');

    pNoa.textContent = menorPrecio('NOROESTE').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    pNqn.textContent = menorPrecio('NEUQUEN').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    pChu.textContent = menorPrecio('CHUBUT').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    pScz.textContent = menorPrecio('SANTA CRUZ').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    pTdf.textContent = menorPrecio('TIERRA DEL FUEGO').toLocaleString('es-ES', { minimumFractionDigits: 4 });
    pTot.textContent = menorPrecio('*').toLocaleString('es-ES', { minimumFractionDigits: 4 });

    //PORCENTAJES
    var ppNoa = document.getElementById('noaPP');
    var ppNqn = document.getElementById('nqnPP');
    var ppChu = document.getElementById('chuPP');
    var ppScz = document.getElementById('sczPP');
    var ppTdf = document.getElementById('tdfPP');

    ppNoa.textContent = menorPorcentajePrecio('NOROESTE');
    ppNqn.textContent = menorPorcentajePrecio('NEUQUEN');
    ppChu.textContent = menorPorcentajePrecio('CHUBUT');
    ppScz.textContent = menorPorcentajePrecio('SANTA CRUZ');
    ppTdf.textContent = menorPorcentajePrecio('TIERRA DEL FUEGO');
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