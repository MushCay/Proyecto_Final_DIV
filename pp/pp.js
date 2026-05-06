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

