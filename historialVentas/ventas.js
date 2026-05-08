//SECCION DE NAV BAR E ICONOS

// Inicializar iconos de Lucide
lucide.createIcons();

// Lgica simple para cambiar de tabs
const tabs = document.querySelectorAll('.tab');
// Agregar evento de clic a cada tab
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        console.log(`Cambiando a: ${tab.textContent.trim()}`);
    });
});

const btnInicio = document.getElementById('pp-nav');
btnInicio.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../pp/pp.html';
});

const btnMangas = document.getElementById('btn-nav-mangas');
btnMangas.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../catalogomangas/mangas.html';
});

const btnEditorial = document.getElementById('btn-nav-editorial')

btnEditorial.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../editorial/editorial.html';
});


//-------------------------SECCION DESTINADA A LAS VENTAS-----------------------------------------------------------------------------------

function mapearVentas(ventas) {

    const contenedor = document.getElementById('contenedor-ventas');
    contenedor.innerHTML = '';

    if (!ventas) return;
    // SI ES UNA SOLA VENTA
    const listaVentas = Array.isArray(ventas)
        ? ventas
        : [ventas];

    listaVentas.forEach(venta => {
        const card = document.createElement('div');
        card.className = 'venta-card';
        const listaArticulos = venta.articulos || [];
        const articulosHTML = listaArticulos.map(art => `
            <li class="articulo-item">
                <div>
                    <strong>${art.manga}</strong>
                </div>

                <div class="articulo-info">
                    <span>Cant: ${art.cantidad}</span>
                    <span>$${art.subtotal}</span>
                </div>
            </li>
        `).join('');

        card.innerHTML = `
            <div class="venta-header">
                <div>
                    <h3>Venta #${venta.id_venta}</h3>
                    <p>${venta.fecha}</p>
                </div>

                <div class="venta-total">
                    $${venta.total_pagado}
                </div>
            </div>

            <div class="venta-body">
                <p>
                    <strong>Método:</strong> ${venta.metodo_pago}
                </p>
            </div>

            <button class="btn-leer-mas">
                Ver detalles
            </button>

            <div class="detalles">
                <h4>Artículos</h4>

                <ul>
                    ${articulosHTML}
                </ul>
            </div>
        `;
        const boton = card.querySelector('.btn-leer-mas');
        const detalles = card.querySelector('.detalles');

        boton.addEventListener('click', () => {

            detalles.classList.toggle('mostrar');

            boton.textContent =
                detalles.classList.contains('mostrar')
                    ? 'Ocultar detalles'
                    : 'Ver detalles';
        });

        contenedor.appendChild(card);
    });
}
async function cargarVentas() {
    try {
        const respuesta = await fetch('http://127.0.0.1:5000/ventas');
        const ventas = await respuesta.json();
        mapearVentas(ventas);

    } catch (error) {
        console.error("Error al obtener las ventas:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarVentas();

});


async function buscarVentas() {
    const tipoFiltro =
        document.getElementById('tipo-filtro').value;
    const valor =
        document.getElementById('input-busqueda')
            .value
            .trim();

    if (valor === '') {
        cargarVentas();
        return;
    }
    let url = '';
    switch (tipoFiltro) {
        case 'id':
            const valorBusqueda = parseInt(valor);
            console.log(valorBusqueda)
            url = `http://127.0.0.1:5000/ventas/${valorBusqueda}`;
            break;
    }
    try {
        const respuesta = await fetch(url);
        if (!respuesta.ok) {

            const contenedor =
                document.getElementById('contenedor-ventas');

            contenedor.innerHTML = `
                <p class="mensaje-error">
                    No se encontró ninguna venta con ese ID
                </p>
            `;

            return;
        }
        const ventas = await respuesta.json();

        mapearVentas(ventas)

    } catch (error) {
        console.error("Error en búsqueda:", error);
    }
}


const search = document.getElementById('btn-buscar-filtro');
search.addEventListener('click', () => {
    console.log('Hola');
    buscarVentas();
});


//FUNCION PARA CREAR DINAMICAMENTE Y CARGAR EL FORM DE ELIMINA
function mapFormVentas(tipo) {
    const contenedor = document.getElementById('Form-ventas');
    if (tipo === 'eliminar') {
        contenedor.style.display = 'flex';
        contenedor.innerHTML = `
            <form id="form-eliminar-venta" class="forms">
                <!-- Botón de cerrar integrado -->
                 <span  id = "cerrar-form-elim">&times;</span>
                </button>

                <h3>Eliminar Venta</h3>
                <select id="select-ventas-delete" name="venta_id" required class="select-int">
                    <option value="">Cargando ventas...</option>
                </select>
                <button type="submit">Eliminar</button>
            </form>
        `;
        cargarVentasCombo('select-ventas-delete');

        const btnCerrar = document.getElementById('cerrar-form-elim');

        btnCerrar.addEventListener('click', () => {
            contenedor.style.display = 'none';
        });


    }

}


async function cargarVentasCombo(idSelect) {
    const select = document.getElementById(idSelect);
    if (!select) return;

    try {
        const respuesta = await fetch('http://127.0.0.1:5000/ventas');
        const ventas = await respuesta.json();

        // Limpiamos el combo y añadimos la opción por defecto
        select.innerHTML = '<option value="">-- Seleccione ID de Venta --</option>';

        ventas.forEach(venta => {
            const opcion = document.createElement('option');

            const idVenta = venta.id_venta || venta.id || venta[0];
            const montoTotal = venta.total || venta.total_venta || venta.total_pagado || venta[1];

            // Solo agregamos la opción si el ID no es indefinido
            if (idVenta !== undefined) {
                opcion.value = idVenta;
                opcion.textContent = `Venta #${idVenta} - Total: $${montoTotal}`;
                select.appendChild(opcion);
            }
        });

    } catch (error) {
        console.error("Error al cargar ventas:", error);
        select.innerHTML = '<option value="">Error al cargar ventas</option>';
    }
}


const contentVenta = document.getElementById('Form-ventas');
if (contentVenta) {
    contentVenta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formulario = e.target;
        const idFormulario = formulario.id;

        // Extraemos los datos base
        const datosRaw = new FormData(formulario);
        let datosEnviar = Object.fromEntries(datosRaw.entries());

        // Configuración para el API de ventas
        let url = 'http://127.0.0.1:5000/ventas';
        let metodo = 'DELETE';
        const idVenta = datosEnviar.venta_id;
        url = `${url}/${idVenta}`;
        datosEnviar = {};

        //Ejecución de la petición
        try {
            const configuracion = {
                method: metodo,
                headers: { 'Content-Type': 'application/json' }
            };

            const respuesta = await fetch(url, configuracion);
            const resultado = await respuesta.json();

            if (respuesta.ok) {
                // Personalizamos el mensaje según la respuesta del backend
                const mensaje = resultado.mensaje || "Operación exitosa";
                alert(mensaje);
                location.reload();
            } else {
                alert("Error: " + (resultado.error || "Ocurrió un problema"));
            }
        } catch (error) {
            console.error("Error en la petición:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });

}








