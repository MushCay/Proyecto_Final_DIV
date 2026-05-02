from flask import Flask, jsonify, request
from flask_cors import CORS #permite que el frontend pueda hacer peticiones a este backend sin problemas de CORS
import sqlite3

app = Flask(__name__)
CORS(app)#habilitamos CORS para permitir que el frontend pueda hacer peticiones a este backend sin problemas de CORS
#para que no ordene por alfabeto los datos del json y mantenga el orden que designamos
app.json.sort_keys = False
database = "mangaStore.db" #nombre de la base de datos

def conexionDB(): #definimos un metodo para conectarnos a la base de datos
    return sqlite3.connect(database) #en caso de que la base de datos no exista sqlite3 la creara

# metodo para la creacion de los campos de la base de datos
def inicializarDB():
    try:
        conn = conexionDB() #abre la conexion a la base de datos
        cursor = conn.cursor() #crea un cursor para ejecutar las concultas

        # ejecutamos la conculta que creara los campos de nuestra base de datos
        #Tabla de editoriales, ventas y mangas, si ya existen no las volvera a crear
        #crear tabla editoriales
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS editoriales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                pais TEXT NOT NULL
            )
        """)
        
        #crear tabla mangas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS mangas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                autor TEXT NOT NULL,
                volumen INTEGER NOT NULL,
                precio REAL NOT NULL,
                stock INTEGER NOT NULL,
                id_editorial INTEGER,
                FOREIGN KEY(id_editorial) REFERENCES editoriales(id)
            )
        """)

        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS ventas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total REAL NOT NULL
            )
        """)


        cursor.execute("""
            CREATE TABLE IF NOT EXISTS detalle_ventas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                venta_id INTEGER NOT NULL,
                manga_id INTEGER NOT NULL,
                cantidad INTEGER NOT NULL,
                precio_unitario REAL NOT NULL,
                FOREIGN KEY(venta_id) REFERENCES ventas(id),
                FOREIGN KEY(manga_id) REFERENCES mangas(id)
            )
        """)

        conn.commit() #guarda los cambios realizados en la base de datos
        conn.close()#cierra la conexion a la base de datos
    except Exception as e:
        print(f"Error al inicializar la base de datos: {e}")

#VISUALIZAR TODOS LOS MANGAS, METODO GET
@app.route("/mangas", methods=["GET"]) 
def obtenerTodos():
    try:
        conn = conexionDB()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM mangas") #ejecuta la consulta mySQL para seleccionar todos los registros de la base de datos
        filas = cursor.fetchall() #guarda todos los datos obtenidos de la consulta
        
        #covertimos cada fila de la base de datos (la cual es una tupla) en un diccionario de python
        mangas = []
        for f in filas:
            mangas.append({
                "id": f[0],
                "titulo": f[1],
                "autor": f[2], 
                "volumen": f[3],
                "precio": f[4],
                "stock": f[5],
                "id_editorial": f[6] 
            })
        
        conn.close() #cierra la conexion a la base de datos
        return jsonify(mangas), 200 #envia la lista al usuario en formato JSON
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#VISUALIZAR MANGA POR ID, METODO GET
@app.route("/mangas/<int:id>", methods=["GET"])
def obtenerUno(id):
    try:
        conn = conexionDB()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM mangas WHERE id = ?", (id,))
        fila = cursor.fetchone() # fetchone guardara el primer datos que coincida con la consulta
        conn.close()

        # Si "fila" tiene contenido, crearemos el JSON
        if fila:
            manga = {
                "id": fila[0], 
                "titulo": fila[1], 
                "autor": fila[2], 
                "volumen": fila[3], 
                "precio": fila[4], 
                "stock": fila[5],
                "id_editorial": fila[6] 
            }
            return jsonify(manga), 200 #consulta exitosa
        
        # Si no se encuentra el id devolvera un mensaje de error
        return jsonify({"error": "Manga no encontrado"}), 404
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#INSERTAR NUEVO MANGA, METODO POST
@app.route("/mangas", methods=["POST"])
def insertar():
    try:
        data = request.json #trae los datos insertados por el usuario
        
        #validaciones basicas
        campos_obligatorios = ["titulo", "autor", "volumen", "precio", "stock", "id_editorial"]
        
        # Revisar que todos los campos existan en el JSON y no sean None o esten vacios
        for campo in campos_obligatorios:
            if campo not in data or data[campo] is None or data[campo] == "":
                return jsonify({"error": f"El campo '{campo}' es obligatorio y no puede ser nulo"}), 400 #mensaje de error de que falto llenar un campo

        conn = conexionDB()
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")#Linea para activar el soporte de sqlite que viene desactivado por defecto
        # le dice a la base de datos que inserte dentro de los campos los valores que puso el usuario
        cursor.execute("""
            INSERT INTO mangas (titulo, autor, volumen, precio, stock, id_editorial) 
            VALUES (?, ?, ?, ?, ?, ?)
        """, (data["titulo"], data["autor"], data["volumen"], data["precio"], data["stock"], data["id_editorial"]))
        
        conn.commit() #guarda los ccambios
        nuevo_id = cursor.lastrowid #nos permite saber el nuevo id que le asigno la base de datos al nuevo producto que agregamos
        conn.close()
        return jsonify({"mensaje": "Manga registrado correctamente", "id": nuevo_id}), 201 #mensaje de que el manga se agrego correctamente
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#ACTUALIZAR MANGA, METODO PUT
@app.route("/mangas/<int:id>", methods=["PUT"])
def actualizar(id):
    try:
        data = request.json #obtiene los datos insertados por el usuario
        
        #validaciones basicas para actualizar
        campos_obligatorios = ["titulo", "autor", "volumen", "precio", "stock", "id_editorial"]
        # Revisar que todos los campos existan en el JSON y no sean None o esten vacios
        for campo in campos_obligatorios:
            if campo not in data or data[campo] is None or data[campo] == "":
                return jsonify({"error": f"Para actualizar, el campo '{campo}' no puede ser nulo"}), 400

        conn = conexionDB()
        cursor = conn.cursor()
        cursor.execute("PRAGMA foreign_keys = ON;")
        #nos aseguramos primero que el id ingresado exista
        cursor.execute("SELECT * FROM mangas WHERE id = ?", (id,))
        if not cursor.fetchone(): #si no existe manda un mensaje de error
            conn.close()
            return jsonify({"error": "Manga no encontrado"}), 404

        #si si existe actualizara la informacion de los campos por los datos que haya ingresado el usuario
        cursor.execute("""
            UPDATE mangas 
            SET titulo = ?, autor = ?, volumen = ?, precio = ?, stock = ?, id_editorial = ?
            WHERE id = ?
        """, (data["titulo"], data["autor"], data["volumen"], data["precio"], data["stock"], data["id_editorial"], id))
        
        conn.commit()
        conn.close()
        return jsonify({"mensaje": "Manga actualizado con éxito"}), 200 #mensaje de que se actualizo correctamente
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#ELIMINAR MANGA, METODO DELETE
@app.route("/mangas/<int:id>", methods=["DELETE"])
def eliminar(id):
    try:
        conn = conexionDB()
        cursor = conn.cursor()
        #ejecuta la consulta SQL para eliminar el producto que coincida con el id ingresado por el usuario
        cursor.execute("DELETE FROM mangas WHERE id = ?", (id,))
        conn.commit() #guarda los cambios
        
        if cursor.rowcount == 0: #cuenta el numero de fila afectada por la ultima consulta, si es cero el id no se encontro
            conn.close()
            return jsonify({"error": "ID no encontrado"}), 404
            
        conn.close()
        return jsonify({"mensaje": "Manga eliminado"}), 200 #si no, el manga fue eliminado
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    
    #RUTAS PARA EDITORIALES Y VENTAS, SEGUIRAN LA MISMA LOGICA QUE LAS RUTAS DE MANGAS, SOLO CAMBIANDO LOS CAMPOS Y EL NOMBRE DE LA TABLA EN LAS CONSULTAS SQL
    # --- CRUD PARA EDITORIALES ---

@app.route("/editoriales", methods=["GET"])
def obtenerEditoriales():
    try:
        conn = conexionDB()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM editoriales") #se seleccionan todos los registros de la tabla "editoriales"
        filas = cursor.fetchall()
        
        editoriales = [{"id": f[0], "nombre": f[1], "pais": f[2]} for f in filas] #acomodamos los resultados en una lista de diccionarios para cada registro
        
        conn.close()
        return jsonify(editoriales), 200 #regresamos la lista en formato json
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/editoriales/<int:id>", methods=["GET"])
def obtenerEditorialesId(id):
    try:
        conn = conexionDB()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM editoriales WHERE id = ?", (id,)) #se selecciona el registro que coincida con el id ingresado
        fila = cursor.fetchone()
        
        editoriales = {"id": fila[0], "nombre": fila[1], "pais": fila[2]} #acomodamos los resultados en un diccionario
        
        conn.close()
        return jsonify(editoriales), 200 #regresamos los resultados en formato json
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/editoriales", methods=["POST"])
def insertarEditorial():
    try:
        data = request.json #obtenemos los datos insertados popr el usuario
        if "nombre" not in data or "pais" not in data: #si el nombre o pais no se encuentran lanza un mensaje de error, estos campos son obligatorios
            return jsonify({"error": "Los campos 'nombre' y 'pais' son obligatorios"}), 400

        conn = conexionDB()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO editoriales (nombre, pais) VALUES (?, ?)", (data["nombre"], data["pais"])) #insertamos en la tabla la nueva editorial
        conn.commit()
        nuevo_id = cursor.lastrowid #obtenemos el id que la base de datos le asigno a la editorial que agregamos
        conn.close()
        
        return jsonify({"mensaje": "Editorial registrada", "id": nuevo_id}), 201 #mensaje de que se agrego exitosamente
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/editoriales/<int:id>", methods=["PUT"])
def actualizarEditorial(id):
    try:
        data = request.json
        if "nombre" not in data or "pais" not in data:
            return jsonify({"error": "Los campos 'nombre' y 'pais' son obligatorios"}), 400

        conn = conexionDB()
        cursor = conn.cursor()
        cursor.execute("UPDATE editoriales SET nombre = ?, pais = ? WHERE id = ?", (data["nombre"], data["pais"], id)) #actualizamos la editorial con los datos ingresado por el usuario
        conn.commit()
        
        #si ninguna fila fue afectada significa que el id de la editorial no se encontro
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Editorial no encontrada"}), 404
            
        conn.close()
        return jsonify({"mensaje": "Editorial actualizada"}), 200 #mensaje de que si se pudo actualizar correctamente
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/editoriales/<int:id>", methods=["DELETE"])
def eliminarEditorial(id):
    try:
        conn = conexionDB()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM editoriales WHERE id = ?", (id,)) #elimina la editorial que coincida con el id ingresado
        conn.commit()
        
         #si ninguna fila fue afectada significa que el id de la editorial no se encontro
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({"error": "Editorial no encontrada"}), 404
            
        conn.close()
        return jsonify({"mensaje": "Editorial eliminada"}), 200 #mensaje de que se elimino la editorial exitosamente
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#CRUD PARA VENTAS
    
#GET ventas
@app.route("/ventas", methods=["GET"])
def obtenerVentas():
    try:
        conn = conexionDB()
        cursor = conn.cursor()

        #obtenemos todos los detalles de la venta
        cursor.execute("""
            SELECT v.id, v.fecha, v.total, m.titulo, d.cantidad, d.precio_unitario
            FROM ventas v
            JOIN detalle_ventas d ON v.id = d.venta_id
            JOIN mangas m ON d.manga_id = m.id
            ORDER BY v.id DESC
        """)
        filas = cursor.fetchall()
        conn.close()

        #creamos un diccionario para agrupar las ventas por su id
        ventas_agrupadas = {}

        #ciclo for para recorrer cada fila de nuestra consulta
        for f in filas:
            id_venta = f[0]
            
            #si el id de la venta no esta en el diccionario entonces se agrega
            if id_venta not in ventas_agrupadas:
                ventas_agrupadas[id_venta] = {
                    "id_venta": id_venta,
                    "fecha": f[1],
                    "total_pagado": f[2],
                    "articulos": [] #lista donde se guardaran todos los mangas de la venta y dus detalles
                }
            
            #aqui agregamos los mangas y sus detalles a la lista articulos
            ventas_agrupadas[id_venta]["articulos"].append({
                "manga": f[3],
                "cantidad": f[4],
                "precio_unitario": f[5],
                "subtotal": f[4] * f[5]
            })

        #transformamos los valores del diccionario a una lista para que nos la regrese en json
        return jsonify(list(ventas_agrupadas.values())), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#GET ventas por id
@app.route("/ventas/<int:id>", methods=["GET"])
def obtenerVentaPorId(id):
    try:
        conn = conexionDB()
        cursor = conn.cursor()
        
        #consulta que nos traer el id de la venta que coincida con la busqueda
        cursor.execute("SELECT id, fecha, total FROM ventas WHERE id = ?", (id,))
        venta = cursor.fetchone()

        #si el id de la venta no se encontro entonces regresa una mensaje de venta no encontrada
        if not venta:
            conn.close()
            return jsonify({"error": "Venta no encontrada"}), 404

        #si si se econtro el id usamos una consulta para que nos traiga todos los datos de esa venta
        cursor.execute("""
            SELECT m.titulo, d.cantidad, d.precio_unitario, (d.cantidad * d.precio_unitario) as subtotal
            FROM detalle_ventas d
            JOIN mangas m ON d.manga_id = m.id
            WHERE d.venta_id = ?
        """, (id,))
        productos = cursor.fetchall()

        #acomodamos los datos obtenido de la consulta en un diccionario
        respuesta = {
            "id_venta": venta[0],
            "fecha": venta[1],
            "total_pagado": venta[2],
            "articulos": [] #lista donde se guardan todos los articulos de la venta y sus detalles
        }

        #agregamos todos los articulos de la venta en diccionarios en la lista "articulos"
        for p in productos:
            respuesta["articulos"].append({
                "manga": p[0],
                "cantidad": p[1],
                "precio_unitario": p[2],
                "subtotal": p[3]
            })

        conn.close()
        return jsonify(respuesta), 200 #regresamos el diccionario con los valores de la venta
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#POST ventas
@app.route("/ventas", methods=["POST"])
def registrarVenta():
    try:
        data = request.json #guardamos los datos que ingreso el usuario en una variable

        #si el usuario no puso ningun producto regresa un mensaje de error
        if "productos" not in data or not data["productos"]:
            return jsonify({"error": "debe incluir al menos un producto"}), 400

        conn = conexionDB()
        cursor = conn.cursor()

        total_venta = 0 #variable con la que calcularemos el total de la venta con los articulos que inserto el usuario
        productos = []

        #ciclo for con el que leeremos cada producto que haya insertado el usuario
        for item in data["productos"]:
            m_id = item["manga_id"]
            cant = item["cantidad"]

            #si la cantidad de mangas es menor a cero se regresa un mensaje de error 
            if cant <= 0:
                return jsonify({"error": f"La cantidad para el manga ID {m_id} debe ser mayor a 0"}), 400
            
            #con una consulta nos traemos el precio, stock y el titulo del manga que coincida con el id insertado por el usuario
            cursor.execute("SELECT precio, stock, titulo FROM mangas WHERE id = ?", (m_id,))
            manga = cursor.fetchone() #guardamos los resultados de la consulta en una variable

            #si la consulta no nos devolvio algo sale un mensaje de error que ese manga no existe
            if not manga:
                return jsonify({"error": f"Manga con ID {m_id} no existe"}), 404
            
            #acomodamos los resultados de la consulta en variables
            precio, stock, titulo = manga 
            if stock < cant:#si el stock del manga es menor a la que solicita el usuario entonces mandamos un mensade de error
                return jsonify({"error": f"Stock insuficiente para {titulo}"}), 400
            
            total_venta += (precio * cant) #calcualamos y acumulamos el precio de cada manga respecto a la cantidad ingresada

            #guardamos los datos de los mangas en la lista productos
            productos.append({
                "id": m_id,
                "cantidad": cant,
                "precio": precio
            })

        #creamos una venta y le asignamos al campo total ell valor de la variable "total_venta"
        cursor.execute("INSERT INTO ventas (total) VALUES (?)", (total_venta,))
        nueva_venta_id = cursor.lastrowid #obtenemos el id que le asigno a nuestra venta la base de datos

        #insertamos los detalles de la venta en la tabla "detalle_ventas"
        for prod in productos:
            cursor.execute("""
                INSERT INTO detalle_ventas (venta_id, manga_id, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            """, (nueva_venta_id, prod["id"], prod["cantidad"], prod["precio"]))
            
            #actualizamos el stock en la tabla "mangas"
            cursor.execute("UPDATE mangas SET stock = stock - ? WHERE id = ?", (prod["cantidad"], prod["id"]))
    
        conn.commit()
        conn.close()

        #mostramos un mensaje de exito de que se proceso exitosamente la venta junto con el id de la venta y el total pagado 
        return jsonify({
            "mensaje": "venta procesada con exito",
            "venta_id": nueva_venta_id,
            "total_pagado": total_venta}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
#DELETE ventas
@app.route("/ventas/<int:id>", methods=["DELETE"])
def eliminarVenta(id):
    try:
        conn = conexionDB()
        cursor = conn.cursor()

        #seleccionamos el id del manga y la cantidad que coincidan con el id de la venta 
        cursor.execute("SELECT manga_id, cantidad FROM detalle_ventas WHERE venta_id = ?", (id,))
        detalles = cursor.fetchall()  #guardamos los resultados de la consulta en una variable

        #si la consulta no nos dio un resultado entonces mandamos un mensaje de error
        if not detalles:
            conn.close()
            return jsonify({"error": "Venta no encontrada"}), 404

        # actualizamos el stock sumnado la cantidad que obtuvimos de la consulta anterior
        for d in detalles:
            m_id, cant = d
            cursor.execute("UPDATE mangas SET stock = stock + ? WHERE id = ?", (cant, m_id))

        #eliminamos todos lo registros de la tabla "detalle_ventas" donde este el id de la tabla "ventas"
        cursor.execute("DELETE FROM detalle_ventas WHERE venta_id = ?", (id,))
        #eliminamos el registro de la tabla "ventas" que tenga el id ingresado por el usurio 
        cursor.execute("DELETE FROM ventas WHERE id = ?", (id,))

        conn.commit()
        conn.close()
        return jsonify({"mensaje": "Venta eliminada ocancelada y stock restaurado"}), 200 #mensaje de la eliminacion se llevo a cabo exitosamente
    except Exception as e:
        return jsonify({"error": str(e)}), 500

#actualizar ventas
@app.route("/ventas/<int:id>", methods=["PUT"])
def actualizarVenta(id):
    try:
        data = request.json #obtenemos los datos ingresados por el usuario
        
        if "productos" not in data or len(data["productos"]) == 0: #si no se encuntra nada en la consulta del usuario lanza un mensaje de error
            return jsonify({
                "error": "La venta debe tener al menos un producto."
            }), 400

        conn = conexionDB()
        cursor = conn.cursor()

        #seleccionamos el id de la venta que coincida con el id que ingresp el usuario
        cursor.execute("SELECT id FROM ventas WHERE id = ?", (id,))
        if not cursor.fetchone(): #si no hubo resultado lanza un mensaje de error de que no se encontro la venta
            conn.close()
            return jsonify({"error": "Venta no encontrada"}), 404

        #seleccionamos el id del manga junto con la cantidad para restablecer el stock antes de que se realizara la venta
        cursor.execute("SELECT manga_id, cantidad FROM detalle_ventas WHERE venta_id = ?", (id,))
        detalles_anteriores = cursor.fetchall()
        for detalle in detalles_anteriores:
            m_id_viejo, cant_vieja = detalle
            cursor.execute("UPDATE mangas SET stock = stock + ? WHERE id = ?", (cant_vieja, m_id_viejo)) #aqui actualizamos el stock a como estava antes de la venta

        #aqui empezaremos a actualizar la venta con los nuevos valores
        total_nuevo = 0
        productos_para_insertar = []

        #ciclo para validar los nuevos cambios
        for item in data["productos"]:
            m_id = item.get("manga_id")
            cant = item.get("cantidad")

            #si la nueva cantidad es menor a cero o nula lanza un mensaje de error
            if cant is None or cant <= 0:
                conn.rollback() #este rollback es para que regrese la tabla a su estado original antes de actualizar en caso de que la cantidda haya sido menor a cero o nula
                conn.close()
                return jsonify({"error": f"La cantidad para el manga ID {m_id} debe ser mayor a 0"}), 400

            #seleccionamos precio, stock y titulos del manga del id ingresado
            cursor.execute("SELECT precio, stock, titulo FROM mangas WHERE id = ?", (m_id,))
            manga = cursor.fetchone()

            #si no hubo coincidencia en la busqueda lanza mensaje de error y rollback
            if not manga:
                conn.rollback()
                conn.close()
                return jsonify({"error": f"El manga con ID {m_id} no existe"}), 404
            
            precio, stock_actual, titulo = manga
            
            #si el stock es menor a la cantidad solicitada lanza mensaje de error y rollback
            if stock_actual < cant:
                conn.rollback()
                conn.close()
                return jsonify({"error": f"Stock insuficiente para '{titulo}'. Disponible: {stock_actual}"}), 400
            
            total_nuevo += (precio * cant) #calculamos el el nuevo total respecto al precio y la nueva cantidad
            productos_para_insertar.append({
                "id": m_id,
                "cantidad": cant,
                "precio": precio
            })

        cursor.execute("UPDATE ventas SET total = ? WHERE id = ?", (total_nuevo, id)) #actualizamos la tabla "ventas" con el nuevo total
        
        cursor.execute("DELETE FROM detalle_ventas WHERE venta_id = ?", (id,)) #eliminamos los detalles anteriores para reemplazarlos por los nuevos

        for prod in productos_para_insertar:
            #insertamos los nuevos detalles
            cursor.execute("""
                INSERT INTO detalle_ventas (venta_id, manga_id, cantidad, precio_unitario)
                VALUES (?, ?, ?, ?)
            """, (id, prod["id"], prod["cantidad"], prod["precio"]))
            
            cursor.execute("UPDATE mangas SET stock = stock - ? WHERE id = ?", (prod["cantidad"], prod["id"])) #descontamos el nuevo stock

        conn.commit()
        conn.close()

        #mensaje de actualizacion realizada con exito
        return jsonify({
            "mensaje": "Venta actualizada correctamente",
            "venta_id": id,
            "nuevo_total": total_nuevo
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    inicializarDB() 
    app.run(debug=True)