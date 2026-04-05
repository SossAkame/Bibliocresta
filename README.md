# Bibliocresta - Biblioteca Virtual
Bibliocresta es una plataforma integral de gestion y lectura de libros digitales. Este proyecto ha sido desarrollado como parte del programa Tecnologia en Análisis y Desarrollo de Software, integrando una arquitectura moderna de servicios web.

# Tecnologias Utilizadas
El proyecto sigue una arquitectura de separacion de responsabilidades (Frontend y Backend):

# Frontend
React.js: Para la creacion de interfaces de usuario modulares y escalables (Evidencia 70).

JavaScript (Vanilla): Implementacion inicial de la logica de cliente.

CSS3 (Flexbox & Grid): Diseño adaptativo (Responsive Design) para asegurar la usabilidad en dispositivos moviles y web.

Tabler Icons: Libreria de iconos vectoriales para una interfaz intuitiva.

# Backend
Node.js & Express: Servidor de aplicaciones y manejo de rutas API REST.

MySQL: Sistema de gestion de base de datos relacional para garantizar la integridad de los datos.

JWT (JSON Web Tokens): Autenticacion segura de usuarios.

Bcrypt: Encriptacion de contraseñas para seguridad de la informacion.

Multer: Gestion de carga de archivos multimedia (PDF/EPUB y portadas).

# Modulos Funcionales Implementados
Autenticacion de Usuarios: Sistema de registro e inicio de sesion con diferenciacion de roles (Lector y Creador).

Gestion de Inventario (Creador): Modulo para subir nuevas obras, incluyendo metadatos, archivos y portadas.

Biblioteca Interactiva (Lector): Visualizacion dinamica de libros, sistema de favoritos y simulacion de compras.

Seguimiento de Progreso: Persistencia en base de datos de la ultima pagina leida por el usuario.

# Estructura del Repositorio
/backend: Código fuente del servidor, configuracion de base de datos y logica de negocio.

/frontend-react: Implementacion de componentes Front-End utilizando el framework React.

/documentacion: Contiene Historias de Usuario, Diagramas de Casos de Uso y Diagramas de Clases.

# Instalación y Configuración
Clonar el repositorio:

Bash
git clone https://github.com/SossAkame/Bibliocresta.git

Configurar el Backend:

Bash
cd backend
npm install
node server.js
Configurar el Frontend:

Bash
cd frontend-react
npm install
npm start

# Auto
Yor Jani Rodriguez Sossa - Desarrolladora de Software en Formación
