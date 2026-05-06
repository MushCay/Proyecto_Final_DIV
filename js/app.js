//  apunta a donde está corriendo Flask
const urlAPI = 'http://127.0.0.1:5000/mangas';

// Función para obtener y mostrar los mangas
async function cargarMangas() {
    const tabla = document.getElementById('tablaMangas');
    if (tabla) {
        try {
            // Hacemos la petición GET a la API
            const respuesta = await fetch(urlAPI);
            const mangas = await respuesta.json();

            const cuerpoTabla = document.querySelector('#tablaMangas tbody');
            cuerpoTabla.innerHTML = ''; // Limpiamos la tabla antes de llenarla

            // Recorremos el JSON y creamos una fila por cada manga
            mangas.forEach(manga => {
                const fila = `<tr>
                <td>${manga.id}</td>
                <td>${manga.titulo}</td>
                <td>${manga.autor}</td>
                <td>${manga.volumen}</td>
                <td>$${manga.precio}</td>
                <td>${manga.stock}</td>
                <td>${manga.id_editorial}</td>
            </tr>`;
                cuerpoTabla.innerHTML += fila;
            });
        } catch (error) {
            console.error("Error al cargar los mangas:", error);
        }

    }
}

// Ejecutamos la función al cargar la página
cargarMangas();



//--------------------------------------------------------------SECCION DESTINADA A LA EDITORIAL-----------------------------------------------
const urlAPIEdt = 'http://127.0.0.1:5000/editoriales';
// Función para obtener y mostrar los mangas
async function cargarEditorial() {
    const tabla = document.getElementById('tablaEditorial');
    // Solo ejecuta la lógica si el elemento existe en esta página
    if (tabla) {
        try {
            // Hacemos la petición GET a la API
            const respuesta = await fetch(urlAPIEdt);
            const editoriales = await respuesta.json();

            const cuerpoTabla = document.querySelector('#tablaEditorial tbody');
            cuerpoTabla.innerHTML = ''; // Limpiamos la tabla antes de llenarla

            // Recorremos el JSON y creamos una fila por cada manga
            editoriales.forEach(editorial => {
                const fila = `<tr>
                <td>${editorial.id}</td>
                <td>${editorial.nombre}</td>
                <td>${editorial.pais}</td>
            </tr>`;
                cuerpoTabla.innerHTML += fila;
            });
        } catch (error) {
            console.error("Error al cargar las editoriales:", error);
        }
    }
}

// Ejecutamos la función al cargar la página
cargarEditorial();


//Formulario paea agregar una nueva editorial
function mapForm(tipo) {
    const contenedor = document.getElementById('Form');

    if (tipo === 'agregar') {
        contenedor.innerHTML = `
            <form id="form-agregar" class="forms">
                <!-- Botón de cerrar integrado -->
                <button type="button" class="btn-cerrar-dinamico" onclick="this.parentElement.parentElement.innerHTML=''">
                    &times;
                </button>
                <h3>Registro de Editorial</h3>
                <input type="text" name="nombre" placeholder="Nombre" required autofocus>
                <input type="text" name="pais" placeholder="Pais" required autofocus>
                <button type="submit">Guardar Editorial</button>
            </form>
        `;
    } else if (tipo === 'actualizar') {
        contenedor.innerHTML = `
        <form id="form-actualizar" class="forms">
            <!-- Botón de cerrar integrado -->
                <button type="button" class="btn-cerrar-dinamico" onclick="this.parentElement.parentElement.innerHTML=''">
                    &times;
                </button>
            <h3>Actualizar editorial</h3>
            
            <label>Selecciona el ID a modificar:</label>
            <select name="id_editorial" id="select-ids" class="select-int">
                <!-- Aquí se cargarán los IDs dinámicamente -->
                <option value="">Cargando...</option>
            </select>

            <input type="text" placeholder="Nuevo Nombre" name="nombre" id="inp-Nombre">
            <input type="text" placeholder="Nuevo Pais" name="pais"  id="inp-Pais">
            <button type="submit">Guardar</button>
        </form>
    `;

        // Llamamos a la funcion para cargar el combo de id
        cargarIdCombo();
    }
    else if (tipo === 'eliminar') {
        contenedor.innerHTML = `
        <form id="form-eliminar" class="forms">
            <!-- Botón de cerrar integrado -->
                <button type="button" class="btn-cerrar-dinamico" onclick="this.parentElement.parentElement.innerHTML=''">
                    &times;
                </button>
            <h3>Eliminar Editorial</h3>
            <p>Selecciona:</p>
            
            <select id="select-eliminar" name="id_editorial" class="select-int">
                <option value="">Cargando IDs...</option>
            </select>
            
            <button type="submit">Eliminar</button>
        </form>
    `;
        llenarCombo();
    }
}


async function llenarCombo() {
    const select = document.getElementById('select-eliminar');


    try {
        const respuesta = await fetch('http://127.0.0.1:5000/editoriales'); // Ruta que trae todas las editoriales en la bd
        const editoriales = await respuesta.json();

        // Limpiamos el Cargando
        select.innerHTML = '<option value="">Seleccione un ID</option>';

        // Creamos una opción por cada editorial
        editoriales.forEach(ed => {
            const opcion = document.createElement('option');
            opcion.value = ed.id; // El valor que se envía a Python
            opcion.textContent = `ID: ${ed.id} - ${ed.nombre}`; // Lo que ve el usuario
            select.appendChild(opcion);
        });

    } catch (error) {
        console.error("Error al cargar IDs:", error);
    }
}


async function cargarIdCombo() {
    const select = document.getElementById('select-ids');
    const nom = document.getElementById('inp-Nombre');
    const pais = document.getElementById('inp-Pais');

    try {
        const respuesta = await fetch('http://127.0.0.1:5000/editoriales'); // Ruta que trae todas
        const editoriales = await respuesta.json();

        select.innerHTML = '<option value="">Seleccione un ID</option>';

        // Creamos una opción por cada editorial
        editoriales.forEach(ed => {
            const opcion = document.createElement('option');
            opcion.value = ed.id; // El valor que se envía a Python
            opcion.textContent = `ID: ${ed.id} - ${ed.nombre}`; // Lo que ve el usuario
            select.appendChild(opcion);
        });

        // Agregamos el evento para detectar el cambio de selección y que cargue los datos asociados al id en los inputs
        select.addEventListener('change', (e) => {
            const idSeleccionado = e.target.value;

            // Buscamos la editorial que coincide con el ID seleccionado
            const editorialEncontrada = editoriales.find(ed => ed.id == idSeleccionado);

            if (editorialEncontrada) {
                // Llenamos los inputs con los datos encontrados
                nom.value = editorialEncontrada.nombre;
                pais.value = editorialEncontrada.pais;
            } else {
                // Limpiamos si no hay selección válida
                nom.value = "";
                pais.value = "";
            }
        });
    } catch (error) {
        console.error("Error al cargar IDs:", error);
    }
}


//Guardar el formulario
// Capturar el formulario
const contenedorForm = document.getElementById('Form');
const contenedor = document.getElementById('Form');

if (contenedorForm) {
    // Escuchamos el evento submit en el contenedor padre
    contenedor.addEventListener('submit', async (e) => {//Se coloca un lsitener para detectar que formulario esta activo dentro del contenedor
        e.preventDefault(); // Detenemos la recarga de página

        // Identificamos cuál formulario se activó
        const formulario = e.target;//Te dice que formulario esta activo en el contenedor padre al momento de clickear guardar
        const idFormulario = formulario.id;// al ya tener un objeto de tipo formulario puedes leer sus atributos , en este caso el id.

        // Extraemos los datos dinámicamente
        const datosRaw = new FormData(formulario);
        const datos = Object.fromEntries(datosRaw.entries());

        // Definimos la URL según el formulario
        let url = 'http://127.0.0.1:5000/editoriales';
        let metodo = 'POST'; // Por defecto para agregar

        if (idFormulario === 'form-actualizar') {
            metodo = 'PUT';
            const idParaUrl = datos.id_editorial;
            url = `${url}/${idParaUrl}`;
            delete datos.id_editorial;
        }

        else if (idFormulario === 'form-eliminar') {
            metodo = 'DELETE';
            const idParaUrl = datos.id_editorial;
            url = `${url}/${idParaUrl}`;
            delete datos.id_editorial;
        }

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resultado = await respuesta.json();
            if (respuesta.ok) {
                const mensaje = resultado.mensaje || "Operación exitosa";
                alert(mensaje);
                location.reload();
            } else {
                alert("Error: " + (resultado.error || "Ocurrió un problema"));
            }

        } catch (error) {
            console.error("Error en la petición:", error);
        }
    });

}


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





