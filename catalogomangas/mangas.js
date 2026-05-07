function configurarBotonAdd() {
    const modal = document.getElementById('modal-crear-manga');

    // En lugar de escuchar al botón, escuchamos al contenedor (que nunca desaparece)
    document.getElementById('mangas-container').addEventListener('click', (e) => {
        // Buscamos si lo que se clickeó es la card-add o algo dentro de ella
        const btnAdd = e.target.closest('#btn-abrir-modal-add');
        
        if (btnAdd) {
            console.log("Abriendo modal...");
            modal.style.display = 'flex';
            cargarEditoriales();
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
                <div class="inner-add">
                    <i data-lucide="book-plus"></i>
                </div>
                <span>Agregar</span>
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
                    <img src="${rutaPortada}" 
                         class="manga-img" 
                         alt="Portada de ${m.titulo}"
                         onerror="this.src='img/default.png'">
                    <span class="stock-label"> <i data-lucide="package"></i> ${m.stock} Disponible/s  </span>

                    <button class="btn-edit-card" onclick="editarManga(${m.id})">
                        <i data-lucide="pencil"></i>
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

function crearManga() {
    console.log("Creando nuevo manga...");
    // Aquí iría la lógica para mostrar un formulario de creación o enviar datos a la API
}

// Función (placeholder) para editar
function editarManga(id) {
    console.log("Editando manga con ID:", id);
    // 
}


//    MODAAAAAAAAAAAAAAAAAAAAAL 
// 1. Cargar Editoriales desde tu API
async function cargarEditoriales() {
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

// 2. Probar Imagen (El botón del taladro)
document.getElementById('btn-probar-img').addEventListener('click', () => {
    const url = document.getElementById('nuevo-url-img').value;
    const preview = document.getElementById('nuevo-manga-preview');
    if(url) {
        preview.innerHTML = `<img src="../catalogomangas/${url}" style="width:100%; height:100%; object-fit:cover; border-radius:20px;">`;
    }
});

// 3. Guardar Manga (POST a la API)
document.getElementById('btn-confirmar-guardar').addEventListener('click', async () => {
    const mangaData = {
        titulo: document.getElementById('nuevo-titulo').value,
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
            alert("¡Manga creado!");
            // Mostrar el ID que devolvió la BD
            document.getElementById('display-new-id').innerText = `id: ${result.id}`;
            
            // Si pusiste una URL de imagen, asociarla (OPCIONAL)
            const urlImg = document.getElementById('nuevo-url-img').value;
            if(urlImg) {
                await fetch('http://127.0.0.1:5000/mangas/imagenes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ manga_id: result.id, url_imagen: urlImg })
                });
            }
            
            location.reload(); // Recargar para ver el nuevo manga
        } else {
            alert("Error: " + result.error);
        }
    } catch (error) {
        console.error("Error al guardar:", error);
    }
});
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