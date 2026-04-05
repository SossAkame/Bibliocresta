import React, { useState, useEffect } from 'react';

// Componente principal para mostrar la coleccion de libros de Bibliocresta
const Biblioteca = () => {
    // Estado para almacenar los libros obtenidos de la base de datos
    const [libros, setLibros] = useState([]);
    const [cargando, setCargando] = useState(true);

    // Efecto para cargar los libros automaticamente al montar el componente
    useEffect(() => {
        obtenerLibros();
    }, []);

    const obtenerLibros = async () => {
        try {
            // Peticion al backend (Node.js + MySQL)
            const response = await fetch('http://localhost:3000/api/libros', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setLibros(data);
            setCargando(false);
        } catch (error) {
            console.error("Error al conectar con el servicio web:", error);
            setCargando(false);
        }
    };

    if (cargando) return <p>Cargando biblioteca...</p>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>Nuestra Coleccion</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {libros.map(libro => (
                    <div key={libro.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
                        <img src={`http://localhost:3000/${libro.ruta_portada}`} alt={libro.titulo} style={{ width: '100%' }} />
                        <h3>{libro.titulo}</h3>
                        <p><strong>Autor:</strong> {libro.autor}</p>
                        <p style={{ color: 'green', fontWeight: 'bold' }}>${libro.precio}</p>
                        <button onClick={() => alert(`Iniciando lectura de: ${libro.titulo}`)}>Leer ahora</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Biblioteca;
