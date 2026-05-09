function configurarBotonAdd() {
    const modal = document.getElementById('modal-crear-manga');

    // En lugar de escuchar al botón, escuchamos al contenedor (que nunca desaparece)
    document.getElementById('mangas-container').addEventListener('click', (e) => {
        // Buscamos si lo que se clickeó es la card-add o algo dentro de ella
        const btnAdd = e.target.closest('#btn-abrir-modal-add');

        if (btnAdd) {
            console.log("Abriendo modal...");
            modal.style.display = 'flex';
            cargarEditorialescrear();
        }
    });
}

// Inicializar iconos de Lucide al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarMangas();
    configurarBotonAdd();
    lucide.createIcons();
});

//Función para obtener los mangas desde la API
async function cargarMangas() {
    try {
        // Llamada al endpoint que ya incluye el LEFT JOIN con manga_imagenes
        const response = await fetch('http://127.0.0.1:5000/mangas');
        const mangas = await response.json();

        const container = document.getElementById('mangas-container');

        // Mantenemos solo el botón de "Agregar" y limpiamos el resto
        const btnAddHtml = `
            <div class="card-add" id="btn-abrir-modal-add">
                <div class="inner-add" style="width: 190px; height: 235px; display: flex; align-items: center; justify-content: center; margin-top: 1px;">
                    <i data-lucide="book-plus" style=" width: 50px; height: 50px; color: #acb0be;"></i>
                </div>
                <span style="margin-top: 10px; font-weight: bold;">Agregar</span>
            </div>
        `;
        container.innerHTML = btnAddHtml;

        // Generar las tarjetas dinámicamente
        mangas.forEach(m => {
            const card = document.createElement('div');
            card.className = 'manga-card';

            //si la BD no tiene url_imagen, usa una por defecto
            const rutaPortada = m.url_imagen ? m.url_imagen : 'img/default.png';


            // Construir el HTML de la tarjeta con los datos del manga
            card.innerHTML = `
                <div class="card-top">
                    <span class="id-badge">${m.id}</span>   
                    <span class="editorial-label">Editorial ${m.id_editorial}</span>
                    <img src="../catalogomangas/${rutaPortada}" 
                         class="manga-img" 
                         alt="Portada de ${m.titulo}"
                         onerror="this.src='img/default.png'">
                    <span class="stock-label"> <i data-lucide="package"></i> ${m.stock} Disponible/s  </span>

                    <button class="btn-edit-card" onclick="montareditarManga(${m.id},event)">
                        <i data-lucide="pencil"></i>
                    </button>
                    <button class="btn-delete-card"onclick="eliminarManga(${m.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
                <div class="manga-info">
                    <h3>${m.titulo} Vol ${m.volumen}</h3>
                    <p>${m.autor}</p>
                    <div class="price-tag">
                        <i data-lucide="dollar-sign"></i>
                        <span>$${m.precio.toFixed(2)}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });

        // Refrescar iconos para las nuevas tarjetas inyectadas
        lucide.createIcons();

    } catch (error) {
        console.error("Error al conectar con la API de MangaStore:", error);
    }
}

//Configuración de la navegación entre carpetas
const btnInicio = document.getElementById('pp-nav');
btnInicio.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../pp/pp.html';
});
const btnVenta = document.getElementById('btn-nav-ventas')

const btnEditorial = document.getElementById('btn-nav-editorial')

btnEditorial.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../editorial/editorial.html';
});

btnVenta.addEventListener('click', () => {
    // Salimos de /catalogomangas/ y entramos a /pp/
    window.location.href = '../historialVentas/ventas.html';
});

//    MODAAAAAAAAAAAAAAAAAAAAAL 
// 1. Cargar Editoriales desde  API
async function cargarEditorialescrear() {
    try {
        const response = await fetch('http://127.0.0.1:5000/editoriales');
        const editoriales = await response.json();
        const select = document.getElementById('select-editorial');

        select.innerHTML = editoriales.map(e =>
            `<option value="${e.id}">${e.nombre}</option>`
        ).join('');
    } catch (error) {
        console.error("Error cargando editoriales", error);
    }
}

// 2. Probar Imagen (El botón del taladro) para nuevo manga
document.getElementById('btn-probar-img').addEventListener('click', () => {
    const url = document.getElementById('nuevo-url-img').value;
    const preview = document.getElementById('nuevo-manga-preview');
    if (url) {
        preview.innerHTML = `<img src="../catalogomangas/${url}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
    }
});

//para editar manga, el botón del taladro del modal editar
document.getElementById('btn-probar-img-editar').addEventListener('click', () => {
    const url = document.getElementById('editar-url-img').value;
    const preview = document.getElementById('editar-manga-preview');
    if (url) {
        preview.innerHTML = `<img src="../catalogomangas/${url}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
    }
});

// 3. Guardar Manga (POST a la API)

const modal = document.getElementById("modal-crear-manga");

const btnCerrar = document.querySelector(".close-modal-crear");
btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
});

// Cerrar modal si se hace click fuera de la ventana blanca
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

const modalEditar = document.getElementById("modal-editar-manga");

const btnCerrarEditar = document.querySelector(".close-modal-editar");
btnCerrarEditar.addEventListener("click", () => {
    modalEditar.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target == modalEditar) {
        modalEditar.style.display = "none";
    }
});

// Cerrar modal si se hace click fuera de la ventana blanca
window.addEventListener("click", (event) => {
    if (event.target == modalEditar) {
        modalEditar.style.display = "none";
    }
});

//no permitir que volumen, precio o stock sean negativos
document.getElementById('nuevo-volumen').addEventListener('input', (e) => {
    if (e.target.value <= 0) e.target.value = 1;
});

document.getElementById('nuevo-precio').addEventListener('input', (e) => {
    if (e.target.value < 0) e.target.value = 0;
});

document.getElementById('nuevo-stock').addEventListener('input', (e) => {
    if (e.target.value <= 0) e.target.value = 1;
});

//mostrar imagen al dar click en el  ojo del modal
document.getElementById('btn-probar-img').addEventListener('click', () => {
    const url = document.getElementById('nuevo-url-img').value;
    const preview = document.getElementById('nuevo-manga-preview');
    preview.innerHTML = `<img src="../catalogomangas/${url}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
});

// Enviar a la base de datos al dar click en "Guardar" la informacion que hay en los inputs del modal
document.getElementById('btn-confirmar-guardar').addEventListener('click', async () => {
    const mangaData = {
        titulo: document.getElementById('nombreCrear').value,
        autor: document.getElementById('nuevo-autor').value,
        volumen: parseFloat(document.getElementById('nuevo-volumen').value),
        precio: parseFloat(document.getElementById('nuevo-precio').value),
        stock: parseInt(document.getElementById('nuevo-stock').value),
        id_editorial: parseInt(document.getElementById('select-editorial').value)
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/mangas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mangaData)
        });

        const result = await response.json();

        if (response.ok) {
            // Mostrar el ID que devolvió la BD
            console.log("ID del manga creado:", result.id);
            // Si pusiste una URL de imagen, asociarla (OPCIONAL)
            const urlImg = document.getElementById('nuevo-url-img').value;
            if (urlImg) {
                await fetch('http://127.0.0.1:5000/mangas/imagenes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ manga_id: result.id, url_imagen: urlImg })
                });
            }

            await Swal.fire({
                title: '¡Manga Agregado!',
                text: 'El registro se guardó correctamente',
                icon: 'success',
                width: '280px',
                confirmButtonText: 'ok',
                confirmButtonColor: '#b189d7'
            });
            // 3. Cerrar el modal (si usas Bootstrap)
            // Reemplaza 'modalCrear' por el ID real de tu div del modal
            const modalElement = document.getElementById('modalCrear');
            if (modalElement) {
                const modalBootstrap = bootstrap.Modal.getInstance(modalElement);
                if (modalBootstrap) {
                    modalBootstrap.hide();
                }
            }

            // 4. Recargar la página para ver los cambios
            location.reload();

        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    }
});


// Función para abrir modal editar
async function montareditarManga(id, event) {
    if (event) event.stopPropagation(); // Detener la propagación del evento
    console.log("Editando manga lolo con ID:", id);
    const modal = document.getElementById('modal-editar-manga');

    try {
        // 1. Mostrar el modal y cargar las editoriales primero
        modal.style.display = 'flex';
        await cargarEditorialeseditar();

        // 2. Consultar los datos del manga específico
        const response = await fetch(`http://127.0.0.1:5000/mangas/${id}`);
        const manga = await response.json();

        if (response.ok) {
            // 3. Rellenar los campos del modal con los datos de la DB
            // Asegúrate de que los IDs coincidan con los de tu HTML
            document.getElementById('nombreEditar').value = manga.titulo;
            document.getElementById('editar-autor').value = manga.autor;
            document.getElementById('editar-volumen').value = manga.volumen;
            document.getElementById('editar-precio').value = manga.precio;
            document.getElementById('editar-stock').value = manga.stock;
            document.getElementById('editar-url-img').value = manga.url_imagen || "";
            const btnProbar = document.getElementById('btn-probar-img-editar');
            if (btnProbar) {
                btnProbar.click(); // Esto simula que el usuario le picó al ojo xd
            }
            // --- SOLUCIÓN PARA EL SELECT ---
            // --- SOLUCIÓN PARA EL SELECT (SIN TOCAR LA API) ---
            // Usamos el ID correcto del select en el modal de edición
            const selectEdit = document.getElementById('select-editorial-editar');
            const nombreBusca = manga.id_editorial; // Aquí viene el nombre desde Python

            if (selectEdit && nombreBusca) {
                // Recorremos las opciones para encontrar la que coincida con el nombre
                for (let i = 0; i < selectEdit.options.length; i++) {
                    // .trim() elimina espacios accidentales al inicio o final
                    if (selectEdit.options[i].text.trim() === nombreBusca.trim()) {
                        selectEdit.selectedIndex = i;
                        break;
                    }
                }
            }
            // Guardamos el ID en un lugar oculto para saber que estamos EDITANDO y no CREANDO
            // Si no tienes este input, agrégalo a tu HTML: <input type="hidden" id="edit-id">
            const inputId = document.getElementById('edit-manga-id');
            if (inputId) inputId.value = id;

        }
    } catch (error) {
        console.error("Error en la carga:", error);
    }
}

// Función para eliminar un manga (con confirmación)
async function eliminarManga(id) {
    const result = await Swal.fire({
        title: 'Seguro que quieres eliminar este manga?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        width: '280px',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        cancelButtonColor: '#b189d7',
        confirmButtonText: 'Sí, eliminar',
        confirmButtonColor: '#b189d7'
    });
    if (result.isConfirmed) {
        try {
            const response = await fetch(`http://127.0.0.1:5000/mangas/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await Swal.fire({
                    title: '¡Manga Eliminado!',
                    text: 'El registro se eliminó correctamente',
                    icon: 'success',
                    width: '280px',
                    confirmButtonText: 'ok',
                    confirmButtonColor: '#b189d7'
                });
                location.reload();
            } else {
                alert("Error al eliminar el manga");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    } else {
        await Swal.fire({
            title: '¡Cancelado!',
            text: 'El manga no fue eliminado',
            icon: 'error',
            width: '280px',
            confirmButtonText: 'ok',
            confirmButtonColor: '#b189d7'
        });
    }


}

async function cargarEditorialeseditar() {
    try {
        const response = await fetch('http://127.0.0.1:5000/editoriales');
        const editoriales = await response.json();
        const select = document.getElementById('select-editorial-editar');

        select.innerHTML = editoriales.map(e =>
            `<option value="${e.id}">${e.nombre}</option>`
        ).join('');
    } catch (error) {
        console.error("Error cargando editoriales", error);
    }
}

document.getElementById('btn-confirmar-editar').addEventListener('click', async () => {
    const mangaId = document.getElementById('edit-manga-id').value;

    if (!mangaId) {
        Swal.fire('Error', 'No se encontró el ID', 'error');
        return;
    }

    const mangaData = {
        titulo: document.getElementById('nombreEditar').value,
        autor: document.getElementById('editar-autor').value,
        volumen: parseFloat(document.getElementById('editar-volumen').value),
        precio: parseFloat(document.getElementById('editar-precio').value),
        stock: parseInt(document.getElementById('editar-stock').value),
        id_editorial: parseInt(document.getElementById('select-editorial-editar').value)
    };

    try {
        // 1. Actualizar datos generales (titulo, autor, etc.)
        const resManga = await fetch(`http://127.0.0.1:5000/mangas/${mangaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mangaData)
        });

        if (resManga.ok) {
            // 2. Actualizar la IMAGEN usando tu endpoint específico
            const urlImg = document.getElementById('editar-url-img').value;

            // IMPORTANTE: Aquí usamos PUT y mandamos el ID en la URL como pide tu Python
            const resImg = await fetch(`http://127.0.0.1:5000/mangas/imagenes/${mangaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url_imagen: urlImg })
            });

            if (resImg.ok) { // estas son las mas bonitas que aparecen cuando se completa algo 
                await Swal.fire({
                    title: '¡Actualizado!',
                    text: 'Manga e imagen actualizados con éxito',
                    icon: 'success',
                    confirmButtonColor: '#b189d7'
                });
                location.reload();
            } else {
                const errImg = await resImg.json();
                console.error("Error imagen:", errImg);
                Swal.fire('Atención', 'Se actualizó el manga pero no la imagen', 'warning');
            }
        }
    } catch (error) {
        console.error("Error global:", error);
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');//esto es una alerta se coloca en vez de alert eso de swalfire
    }
});

const btnBuscarManga = document.getElementById('btn-search-manga')
btnBuscarManga.addEventListener('click', () => {
    buscarManga();
});
//Buscar Manga por Nombre

async function buscarManga() {
    const nombreBusqueda = document.getElementById('input-busqueda').value.trim();
    const container = document.getElementById('mangas-container'); // Asegúrate que este sea el ID de tu grid

    if (nombreBusqueda === "") {
        cargarMangas(); // O la función que uses para mostrar todos por defecto
        return;
    }

    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/mangas/${nombreBusqueda}`);
        const mangas = await respuesta.json();

        container.innerHTML = ""; // Limpiamos el grid

        if (respuesta.ok && mangas.length > 0) {
            mangas.forEach(m => {
                // Creamos el elemento div de la card
                const card = document.createElement('div');
                card.className = 'manga-card';

                // Usamos TU estructura exacta de HTML
                card.innerHTML = `
                    <div class="card-top">
                        <span class="id-badge">${m.id}</span>   
                        <span class="editorial-label">Editorial ${m.id_editorial}</span>
                        <img src="${m.url_imagen || 'img/default.png'}" 
                             class="manga-img" 
                             alt="Portada de ${m.titulo}"
                             onerror="this.src='img/default.png'">
                        <span class="stock-label"> <i data-lucide="package"></i> ${m.stock} Disponible/s </span>

                        <button class="btn-edit-card" onclick="montareditarManga(${m.id}, event)">
                            <i data-lucide="pencil"></i>
                        </button>
                        <button class="btn-delete-card" onclick="eliminarManga(${m.id})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                    <div class="manga-info">
                        <h3>${m.titulo} Vol ${m.volumen}</h3>
                        <p>${m.autor}</p>
                        <div class="price-tag">
                            <i data-lucide="dollar-sign"></i>
                            <span>$${m.precio.toFixed(2)}</span>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            // CRUCIAL: Renderizar los iconos de Lucide de las nuevas cards
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

        } else {
            container.innerHTML = `<p class="no-results">No se encontraron resultados para "${nombreBusqueda}"</p>`;
        }
    } catch (error) {
        console.error("Error al buscar mangas:", error);
        Swal.fire('Error', 'No se pudo realizar la búsqueda', 'error');
    }
}