//  apunta a donde está corriendo Flask
const urlAPI = 'http://127.0.0.1:5000/mangas';

// Función para obtener y mostrar los mangas
async function cargarMangas() {
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

// Ejecutamos la función al cargar la página
cargarMangas();