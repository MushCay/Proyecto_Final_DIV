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

async function cargarVentas() {
    const contenedor = document.getElementById('contenedor-ventas');
    const contenedorVenta = document.getElementById('contenedor-ventas')
    if (contenedorVenta) {


        try {
            const respuesta = await fetch('http://127.0.0.1:5000/ventas');
            const ventasAgrupadas = await respuesta.json();

            contenedor.innerHTML = '';


            Object.values(ventasAgrupadas).forEach(venta => {
                const card = document.createElement('div');
                card.className = 'venta-card';

                // Creamos la lista de artículos que se mostrará al expandir
                const articulosHTML = venta.articulos.map(art => `
                <li>${art.manga} - Cantidad: ${art.cantidad} - Subtotal: $${art.subtotal}</li>
            `).join('');

                card.innerHTML = `
                <div>
                    <p><strong>ID Venta:</strong> ${venta.id_venta}</p>
                    <p><strong>Fecha:</strong> ${venta.fecha}</p>
                    <p><strong>Metodo Pago:</strong> ${venta.metodo_pago}</p>
                    <p><strong>Total:</strong> $${venta.total_pagado}</p>
                    <button class="btn-leer-mas">Leer más</button>
                    
                    <div class="detalles"">
                        <ul style="list-style: none; padding-left: 10px;">
                            ${articulosHTML}
                        </ul>
                    </div>
                </div>
            `;

                // Expandi el div al hacer click en leer mas
                const boton = card.querySelector('.btn-leer-mas');
                const listaDetalles = card.querySelector('.detalles');

                boton.addEventListener('click', () => {
                    const visible = listaDetalles.style.display === 'block';
                    listaDetalles.style.display = visible ? 'none' : 'block';
                    boton.textContent = visible ? 'Leer más' : 'Ver menos';
                });

                contenedor.appendChild(card);
            });

        } catch (error) {
            console.error("Error al obtener las ventas:", error);
            contenedor.innerHTML = '<p>Error al cargar las ventas. Revisa la consola.</p>';
        }
    }
}

cargarVentas();


function mapFormVentas(tipo) {
    const contenedor = document.getElementById('Form-ventas');
    if (tipo === 'eliminar') {
        contenedor.innerHTML = `
            <form id="form-eliminar-venta" class="forms">
                <!-- Botón de cerrar integrado -->
                <button type="button" class="btn-cerrar-dinamico" onclick="this.parentElement.parentElement.innerHTML=''">
                    &times;
                </button>

                <h3>Eliminar Venta</h3>
                <select id="select-ventas-delete" name="venta_id" required class="select-int">
                    <option value="">Cargando ventas...</option>
                </select>
                <button type="submit">Eliminar</button>
            </form>
        `;
        cargarVentasCombo('select-ventas-delete');
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
function agregarFilaProducto() {
    const contenedor = document.getElementById('contenedor-productos');
    const nuevoDiv = document.createElement('div');
    nuevoDiv.className = 'producto-input';
    nuevoDiv.style.marginBottom = "10px";

    nuevoDiv.innerHTML = `
        <select name="manga_id" required>${document.getElementById('select-mangas').innerHTML}</select>
        <input type="number" name="cantidad" placeholder="Cantidad" min="1" required>
    `;
    contenedor.appendChild(nuevoDiv);
}


const contentVenta = document.getElementById('Form-ventas');
const contentVentas = document.getElementById('Form-ventas');
if (contentVentas) {
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





