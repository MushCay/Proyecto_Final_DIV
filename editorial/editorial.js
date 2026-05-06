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

const btnVenta = document.getElementById('btn-nav-ventas')

btnVenta.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../historialVentas/ventas.html';
});


//-------------------------------------------------SECCION DESTINADA A LA EDITORIAL-----------------------------------------------
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

