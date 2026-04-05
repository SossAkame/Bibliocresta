# Bibliocresta - Sistema de Biblioteca Virtual

**Bibliocresta** es una solucion integral para la gestion, venta y lectura de libros digitales. Este proyecto forma parte de la fase de ejecucion del programa **Tecnologia en Analisis y Desarrollo de Software**, integrando una arquitectura de servicios web moderna y escalable.

---

## Stack Tecnologico

### **Frontend (Interfaz de Usuario)**
* **React.js:** Implementacion de componentes modulares y gestion de estados (Evidencia 70).
* **JavaScript (Vanilla):** Logica interactiva base.
* **CSS3:** Diseño responsivo mediante Flexbox y CSS Grid para adaptabilidad en moviles.
* **Tabler Icons:** Kit de iconos para una navegacion intuitiva.

### **Backend (Servidor y Logica)**
* **Node.js & Express:** Framework para la creacion de la API REST.
* **MySQL:** Base de datos relacional para la persistencia de usuarios, libros y transacciones.
* **JWT (JSON Web Tokens):** Seguridad en la autenticacion y manejo de sesiones.
* **Bcrypt:** Encriptacion de alto nivel para contraseñas.
* **Multer:** Middleware para la gestion y almacenamiento de archivos (PDF/EPUB y JPG).

---

## Estructura del Proyecto

El proyecto esta organizado de la siguiente manera para facilitar su mantenimiento:

* **/backend**: Contiene el servidor Express, configuracion de la base de datos y controladores.
* **/frontend-react**: Modulo desarrollado en React con componentes para la visualizacion de libros.
* **/documentacion**: Repositorio de artefactos (Casos de Uso, Diagrama de Clases e Historias de Usuario).
* **README.md**: Documentacion general del proyecto.

---

## Requisitos para Ejecucion

Para desplegar el proyecto localmente, siga estos pasos:

1. **Base de Datos:** Importar el script SQL adjunto en su servidor MySQL local (Base de datos: `biblioteca_virtual`).
2. **Backend:**
   ```bash
   cd backend
   npm install
   node server.js

Frontend:

Bash
cd frontend-react
npm install
npm start

Autor

Yor Jani Rodriguez Sossa - Aprendiz ADSO