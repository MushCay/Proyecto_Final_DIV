
// Inicializar iconos de Lucide al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    cargarMangas();
    configurarNavegacion();
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


// Función (placeholder) para editar
function editarManga(id) {
    console.log("Editando manga con ID:", id);
    // 
}