const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'biblioteca_virtual'
});

db.connect((err) => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado exitosamente a la base de datos MySQL');
});


app.get('/', (req, res) => {
    res.send('Servidor de la Biblioteca Virtual funcionando correctamente');
});

const SECRET_KEY = 'mi_clave_secreta_bibliocresta_123'; 

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(403).json({ error: 'Acceso denegado. No hay token.' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token inválido o expirado. Vuelve a iniciar sesión.' });
        }
        req.usuario = decoded; 
        next();
    });
};

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});

const upload = multer({ storage: storage }).fields([
    { name: 'archivo', maxCount: 1 },
    { name: 'portada', maxCount: 1 }
]);

app.post('/api/registro', async (req, res) => {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Por favor, llena todos los campos obligatorios.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const rolUsuario = rol === 'creador' ? 'creador' : 'lector';

        const query = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)';
        
        db.query(query, [nombre, email, hashedPassword, rolUsuario], (err, results) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Este correo electrónico ya está registrado.' });
                }
                console.error('Error en MySQL:', err);
                return res.status(500).json({ error: 'Error al registrar el usuario.' });
            }
            
            res.status(201).json({ 
                mensaje: `¡Bienvenido a Bibliocresta, ${nombre}!`, 
                usuario_id: results.insertId 
            });
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Por favor, ingresa correo y contraseña.' });
    }

    const query = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Error interno del servidor.' });
        if (results.length === 0) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

        const usuario = results[0];

        try {
            const contrasenaValida = await bcrypt.compare(password, usuario.password);
            if (!contrasenaValida) return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });

            const token = jwt.sign(
                { id: usuario.id, rol: usuario.rol }, 
                SECRET_KEY, 
                { expiresIn: '2h' }
            );

            res.status(200).json({ 
                mensaje: 'Inicio de sesión exitoso', 
                token: token, 
                rol: usuario.rol,
                nombre: usuario.nombre 
            });

        } catch (error) {
            console.error('Error al comparar contraseñas:', error);
            res.status(500).json({error: 'Error interno del servidor.'});
        }
    });
});

app.get('/api/libros', verificarToken, (req, res) => {
    const usuario_id = req.usuario.id; 

    const query = `
        SELECT libros.id, libros.titulo, libros.autor_original AS autor, libros.descripcion, libros.precio, libros.genero, libros.ruta_archivo, libros.ruta_portada,
        IF(compras.id IS NOT NULL, 1, 0) AS comprado,
        IF(favoritos.id IS NOT NULL, 1, 0) AS es_favorito,
        IFNULL(progreso.pagina_actual, 1) AS pagina_actual
        FROM libros 
        JOIN usuarios ON libros.autor_id = usuarios.id
        LEFT JOIN compras ON compras.libro_id = libros.id AND compras.usuario_id = ?
        LEFT JOIN favoritos ON favoritos.libro_id = libros.id AND favoritos.usuario_id = ?
        LEFT JOIN progreso ON progreso.libro_id = libros.id AND progreso.usuario_id = ?
    `;
    
    db.query(query, [usuario_id, usuario_id, usuario_id], (err, results) => {
        if (err) {
            console.error('Error obteniendo libros:', err);
            return res.status(500).json({ error: 'Error al obtener los libros.' });
        }
        res.status(200).json(results);
    });
});

app.post('/api/libros', verificarToken, upload, (req, res) => {
    if (req.usuario.rol !== 'creador') {
        return res.status(403).json({ error: 'Solo los creadores pueden subir libros.' });
    }

    const { titulo, autor_original, descripcion, precio, genero } = req.body;
    const autor_id = req.usuario.id;

    if (!req.files || !req.files['archivo'] || !req.files['portada']) {
        return res.status(400).json({ error: 'Debes subir el archivo del libro y una imagen de portada.' });
    }

    const ruta_archivo = req.files['archivo'][0].path;
    const ruta_portada = req.files['portada'][0].path;
    const query = 'INSERT INTO libros (titulo, autor_original, descripcion, precio, genero, ruta_archivo, ruta_portada, autor_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    
    db.query(query, [titulo, autor_original, descripcion, precio, genero, ruta_archivo, ruta_portada, autor_id], (err, results) => {
        if (err) {
            console.error('Error al guardar en DB:', err);
            return res.status(500).json({ error: 'Error al publicar el libro.' });
        }
        res.status(201).json({ mensaje: '¡Libro y portada publicados con éxito!' });
    });
});

app.get('/api/mis-libros', verificarToken, (req, res) => {
    if (req.usuario.rol !== 'creador') {
        return res.status(403).json({ error: 'Acceso denegado.' });
    }

    const query = 'SELECT id, titulo, autor_original AS autor, descripcion, precio, genero, ruta_archivo, ruta_portada FROM libros WHERE autor_id = ?';
    
    db.query(query, [req.usuario.id], (err, results) => {
        if (err) {
            console.error('Error en mis-libros:', err);
            return res.status(500).json({ error: 'Error obteniendo tus libros.' });
        }
        res.status(200).json(results);
    });
});

app.delete('/api/libros/:id', verificarToken, (req, res) => {
    if (req.usuario.rol !== 'creador') {
        return res.status(403).json({ error: 'Acceso denegado. Solo creadores pueden eliminar.' });
    }

    const libro_id = req.params.id;
    const autor_id = req.usuario.id;
    const tablasDependientes = ['favoritos', 'compras', 'progreso'];
    
    db.query('DELETE FROM progreso WHERE libro_id = ?', [libro_id], (err) => {
        if (err) console.error("Error en progreso:", err);

        db.query('DELETE FROM favoritos WHERE libro_id = ?', [libro_id], (err) => {
            if (err) console.error("Error en favoritos:", err);

            db.query('DELETE FROM compras WHERE libro_id = ?', [libro_id], (err) => {
                if (err) console.error("Error en compras:", err);
                
                const queryBorrarLibro = 'DELETE FROM libros WHERE id = ? AND autor_id = ?';
                db.query(queryBorrarLibro, [libro_id, autor_id], (err, results) => {
                    if (err) {
                        console.error('Error final al eliminar el libro:', err);
                        return res.status(500).json({ error: 'Error interno al eliminar el libro.' });
                    }

                    if (results.affectedRows === 0) {
                        return res.status(404).json({ error: 'No se encontró el libro o no tienes permiso para borrarlo.' });
                    }

                    res.status(200).json({ mensaje: 'Libro eliminado de Bibliocresta con éxito.' });
                });
            });
        });
    });
});

app.post('/api/favoritos', verificarToken, (req, res) => {
    const usuario_id = req.usuario.id; 
    const { libro_id } = req.body;

    if (!libro_id) return res.status(400).json({ error: 'Falta el ID del libro.' });

    const queryCheck = 'SELECT * FROM favoritos WHERE usuario_id = ? AND libro_id = ?';
    db.query(queryCheck, [usuario_id, libro_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });

        if (results.length > 0) {
            const queryDelete = 'DELETE FROM favoritos WHERE usuario_id = ? AND libro_id = ?';
            db.query(queryDelete, [usuario_id, libro_id], (err) => {
                if (err) return res.status(500).json({ error: 'Error al quitar de favoritos.' });
                res.status(200).json({ mensaje: 'Libro quitado de favoritos', estado: 'quitado' });
            });
        } else {
            const queryInsert = 'INSERT INTO favoritos (usuario_id, libro_id) VALUES (?, ?)';
            db.query(queryInsert, [usuario_id, libro_id], (err) => {
                if (err) return res.status(500).json({ error: 'Error al agregar a favoritos.' });
                res.status(200).json({ mensaje: 'Libro agregado a favoritos', estado: 'agregado' });
            });
        }
    });
});

app.post('/api/compras', verificarToken, (req, res) => {
    const usuario_id = req.usuario.id;
    const { libro_id } = req.body;

    if (!libro_id) return res.status(400).json({ error: 'Falta el ID del libro.' });

    const query = 'INSERT INTO compras (usuario_id, libro_id) VALUES (?, ?)';
    db.query(query, [usuario_id, libro_id], (err) => {
        if (err) return res.status(500).json({ error: 'Error procesando la compra.' });
        res.status(201).json({ mensaje: '¡Compra exitosa! El libro se ha añadido a tu colección.' });
    });
});

app.post('/api/progreso', verificarToken, (req, res) => {
    const usuario_id = req.usuario.id;
    const { libro_id, pagina_actual } = req.body;

    db.query('SELECT * FROM progreso WHERE usuario_id = ? AND libro_id = ?', [usuario_id, libro_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Error en la base de datos.' });

        if (results.length > 0) {
            db.query('UPDATE progreso SET pagina_actual = ? WHERE usuario_id = ? AND libro_id = ?', [pagina_actual, usuario_id, libro_id], (err) => {
                if (err) return res.status(500).json({ error: 'Error al actualizar progreso.' });
                res.status(200).json({ mensaje: 'Progreso actualizado.' });
            });
        } else {
            db.query('INSERT INTO progreso (usuario_id, libro_id, pagina_actual) VALUES (?, ?, ?)', [usuario_id, libro_id, pagina_actual], (err) => {
                if (err) return res.status(500).json({ error: 'Error al guardar progreso.' });
                res.status(200).json({ mensaje: 'Progreso guardado.' });
            });
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});