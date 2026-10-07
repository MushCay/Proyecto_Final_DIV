## MangaStore

## Creadores
<a href="https://github.com/anmaribaphomet"> @anmaribaphomet</a><br>
<a href="https://github.com/MushCay"> @MushCay</a><br>
<a href="https://github.com/esaxel123"> @esaxel123</a>

## Descripcion
Sistema web de gestión de inventarios, editoriales y ventas para una tienda de mangas.Proyecto realizado en la materia de Desarrollo de Sistemas IV ,en equipos.

## Interfaz grafica
<img width="888" height="443" alt="image" src="https://github.com/user-attachments/assets/068cd5be-7177-44da-9d26-ae7f4cb84e9e" />

<img width="918" height="463" alt="image" src="https://github.com/user-attachments/assets/812ba468-976a-4c93-81c8-c1fb27f8cce3" />

<img width="971" height="491" alt="image" src="https://github.com/user-attachments/assets/641bdb95-25c6-48b7-b4dc-da59aa705d1f" />

<img width="973" height="528" alt="image" src="https://github.com/user-attachments/assets/581ce115-89e9-416a-b2d1-102f2ffe2345" />

<img width="985" height="495" alt="image" src="https://github.com/user-attachments/assets/b3a8e64c-0069-487e-9303-bde655fddffb" />

## Características

* **Backend API / Servidor**: Desarrollado en Python (`mangaStore.py`) para administrar la lógica de negocio y las peticiones.
* **Gestión de Catálogo**: Módulo para consulta y administración del catálogo de mangas (`catalogomangas`).
* **Gestión de Editoriales**: Módulo para la administración de las editoriales (`Editorial`).
* **Historial de Ventas**: Registro y seguimiento de las ventas ya sea en tarjeta o efectivo (`historialVentas`).
* **Vistas**: Módulo para la interfaz e interacciones principales (`pp`).

## Estructura del Proyecto

```text
├── catalogomangas/   # Módulo de catálogo y gestión de mangas
├── Editorial/        # Módulo de administración de editoriales
├── historialVentas/  # Módulo de registro e historial de ventas
├── pp/               # Pagina principal y de ventas del dia
└── mangaStore.py     # Servidor/API principal en Python (Flask)
