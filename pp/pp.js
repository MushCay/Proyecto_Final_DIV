// Inicializar iconos de Lucide
lucide.createIcons();

// Logica simple para cambiar de tabs
const tabs = document.querySelectorAll('.tab');
// Agregar evento de clic a cada tab
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        console.log(`Cambiando a: ${tab.textContent.trim()}`);
    });
});

// Funcin para obtener las estadísticas desde el servidor
async function cargarEstadisticas() {
    try {
        const respuesta = await fetch('http://127.0.0.1:5000/stats/diarias');
        const data = await respuesta.json();

        if (respuesta.ok) {
            // Actualiza los en HTML usando los IDs
            document.getElementById('ventas-hoy-count').textContent = data.ventas_dia;


            const elEfectivo = document.getElementById('efectivo-hoy');
            const elTarjeta = document.getElementById('tarjeta-hoy');
            const elTotal = document.getElementById('total-acumulado');


            if (elTotal) elTotal.textContent = `$${data.total_acumulado}`;
            if (elEfectivo) elEfectivo.textContent = `$${data.efectivo}`;
            if (elTarjeta) elTarjeta.textContent = `$${data.tarjeta}`;
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

// Obtener elementos
const modal = document.getElementById("modal-venta");
const btnAbrir = document.querySelector(".btn-nueva-venta");
const btnCerrar = document.querySelector(".close-modal");

// Abrir modal al dar click en el botn "Nueva Venta"
btnAbrir.addEventListener("click", () => {
    modal.style.display = "block";
    lucide.createIcons(); // Recargar iconos dentro del modal
});

// Cerrar modal al dar click en la X
btnCerrar.addEventListener("click", () => {
    modal.style.display = "none";
});

// Cerrar modal si se hace click fuera de la ventana blanca
window.addEventListener("click", (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
});

// Llamar a la función cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    cargarEstadisticas();
});

// Seleccion el botón
const btnMangas = document.getElementById('btn-nav-mangas');

// Program la redirección
btnMangas.addEventListener('click', () => {
    window.location.href = '../catalogomangas/mangas.html';
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


const buscarManga = document.getElementById('search-manga')
const btnBuscarManga = document.getElementById('btn-search-manga')
const CampoNombre = document.getElementById('display-nombre');
const CampoPrecio = document.getElementById('display-precio');
const CampoStock = document.getElementById('display-stock');
const imagenManga = document.getElementById('imagen-manga');

async function buscarMangaPorNombre() {
    const nombreBusqueda = buscarManga.value.trim();

    try {
        const respuesta = await fetch(`http://127.0.0.1:5000/mangas/${nombreBusqueda}`);
        const manga = await respuesta.json();
         const rutaPortada = manga.url_imagen ? manga.url_imagen : 'img/default.png';

        if (respuesta.ok) {
            CampoNombre.value = manga.titulo;
            CampoPrecio.value = `$${manga.precio}`;
            CampoStock.value = manga.stock;
            imagenManga.innerHTML = `<img src="../catalogomangas/${rutaPortada}" alt="${manga.titulo}" style="width: 100%; height: 100%; object-fit: cover;">`;
        } else {
            imagenManga.innerHTML = `<img src="../catalogomangas/img/default.png" alt="Manga no encontrado" style="width: 100%; height: 100%; object-fit: cover; border-radius: 20px;">`;
            CampoNombre.value = "No encontrado";
            CampoPrecio.value = "$0.00";
            CampoStock.value = "0";
        }
        return manga;


    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

// Evento para presionar Enter
buscarManga.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        buscarMangaPorNombre();
    }
});

// Evento para clic en la lupa
btnBuscarManga.addEventListener('click', buscarMangaPorNombre);


//funcion para cargar los mangas al darle visualizar productos
const VisualizarMangas = document.getElementById('btn-visualizar-mangas');

async function cargarMangas() {
    try {
        // Llamada al endpoint que ya incluye el LEFT JOIN con manga_imagenes
        const response = await fetch('http://127.0.0.1:5000/mangas');
        const mangas = await response.json();

        const container = document.getElementById('mangas-list-container');

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
                         class="mangacard-img" 
                         alt="Portada de ${m.titulo}"
                         onerror="this.src='../catalogomangas/img/default.png'">
                    <span class="stock-label"> <i data-lucide="package"></i> ${m.stock} Disponible/s  </span>

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

            // --- NUEVO: Evento para llenar los campos al hacer clic ---
         card.addEventListener('click', () => {
         // 1. Llenar Nombre del Producto (Título + Volumen)
         document.getElementById('display-nombre').value = `${m.titulo} Vol ${m.volumen}`;
        
         // 2. Llenar Valor Ponderado (Precio)
         document.getElementById('display-precio').value = `$${m.precio.toFixed(2)}`;
        
         // 3. Llenar Stock Disponible
         document.getElementById('display-stock').value = m.stock;
 
         // 4. Actualizar la imagen del placeholder (Opcional pero recomendado)
         const previewImg = document.querySelector('.image-placeholder');
         previewImg.innerHTML = `<img src="../catalogomangas/${rutaPortada}" 
                                     style="width: 100%; height: 100%; object-fit: scale-down; "
                                     onerror="this.src='../catalogomangas/img/default.png'">`;
        
         // 5. Resetear cantidad a 1 al seleccionar nuevo producto
         document.getElementById('display-cantidad').value = 1;
         });
            container.appendChild(card);
        });

        // Refrescar iconos para las nuevas tarjetas inyectadas
        lucide.createIcons();

    } catch (error) {
        console.error("Error al conectar con la API de MangaStore:", error);
    }
}
VisualizarMangas.addEventListener('click', cargarMangas);

//funcion para incrementador
// Seleccionamos los elementos
const btnMinus = document.getElementById('btn-minus');
const btnPlus = document.getElementById('btn-plus');
const inputCantidad = document.getElementById('display-cantidad');

// Evento para aumentar
btnPlus.addEventListener('click', () => {
    let valorActual = parseInt(inputCantidad.value);
    inputCantidad.value = valorActual + 1;
});

// Evento para disminuir
btnMinus.addEventListener('click', () => {
    let valorActual = parseInt(inputCantidad.value);
    // Evitamos que sea menor a 1
    if (valorActual > 1) {
        inputCantidad.value = valorActual - 1;
    }
});


//Agregar un manga al  wrapper desde una card y llenar los fields con los datos del manga seleccionado

