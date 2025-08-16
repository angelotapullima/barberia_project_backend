# 💈 Barbería Project Backend 🚀

¡Bienvenido al corazón de la gestión de tu barbería! Este repositorio alberga el potente backend que impulsa el sistema de administración de Barbería, diseñado para ser robusto, escalable y seguro.

## 🛠️ Tecnologías Utilizadas

Este proyecto ha sido construido con un stack moderno y eficiente:

- **Node.js**: El entorno de ejecución de JavaScript que permite construir aplicaciones de red escalables.
- **Express.js**: Un framework web minimalista y flexible para Node.js, ideal para construir APIs RESTful.
- **TypeScript**: Un superconjunto de JavaScript que añade tipado estático, mejorando la calidad del código y facilitando el mantenimiento.
- **PostgreSQL**: Una base de datos relacional de código abierto, potente y fiable, utilizada para el almacenamiento persistente de datos.
- **JWT (JSON Web Tokens)**: Estándar para la creación de tokens de acceso seguros, utilizados para la autenticación y autorización de usuarios.
- **Bcrypt**: Una función de hash de contraseñas diseñada para ser resistente a ataques de fuerza bruta, garantizando la seguridad de las credenciales.
- **CORS**: Middleware esencial para habilitar el Intercambio de Recursos de Origen Cruzado, permitiendo la comunicación segura entre el frontend y el backend.
- **dotenv**: Módulo para cargar variables de entorno desde un archivo `.env`, manteniendo la configuración sensible fuera del control de versiones.
- **dayjs**: Una librería ligera para el análisis, manipulación y formateo de fechas y horas.

## ✨ Características Destacadas

Este backend proporciona un conjunto completo de APIs para una gestión integral de la barbería:

- **Autenticación y Autorización Segura**: Sistema robusto de inicio de sesión de usuarios, generación de tokens JWT y control de acceso basado en roles para proteger tus datos.
- **Gestión de Barberos**: Operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para barberos, incluyendo el registro y seguimiento de adelantos de pagos.
- **Gestión de Estaciones**: Control total sobre las estaciones de trabajo de la barbería.
- **Gestión de Servicios**: Administración detallada de los servicios ofrecidos a los clientes.
- **Gestión de Productos**: Inventario y control de los productos disponibles para la venta.
- **Sistema de Reservas Inteligente**: Funcionalidades completas para crear, visualizar, actualizar, eliminar y completar reservas, con la posibilidad de añadir productos a las mismas.
- **Control de Ventas**: Registro y recuperación de datos de ventas para un seguimiento preciso de los ingresos.
- **Informes Analíticos**: Generación de informes de ventas completos, ventas por servicios/productos, uso de estaciones, frecuencia de clientes, horas pico y reportes detallados de ventas de servicios por barbero.
- **Panel de Control (Dashboard)**: APIs para obtener datos resumidos y métricas clave para una visión rápida del negocio.
- **Punto de Venta (POS)**: Datos maestros esenciales para las operaciones de punto de venta.
- **Gestión de Inventario**: Seguimiento de movimientos de inventario y resúmenes de existencias.
- **Comisiones de Barberos**: Cálculo y finalización de las comisiones mensuales para cada barbero.
- **Gestión de Pagos**: Administración de registros de pagos.
- **Configuración de la Aplicación**: APIs para gestionar y actualizar la configuración global del sistema.

## 🚀 Configuración e Instalación

Para poner en marcha el backend en tu entorno local, sigue estos sencillos pasos:

1.  **Clona el repositorio:**

    ```bash
    git clone https://github.com/angelotapullima/barberia_project_backend.git
    cd barberia_project_backend
    ```

2.  **Instala las dependencias:**

    ```bash
    npm install
    ```

3.  **Configuración de la Base de Datos (PostgreSQL):**
    - Asegúrate de tener un servidor PostgreSQL en funcionamiento.
    - Crea una nueva base de datos para el proyecto (ej. `barberia_db`).
    - Ejecuta los scripts SQL de esquema y datos ubicados en `src/database/`:
      - `schema_new.sql`: Contiene el esquema de la base de datos.
      - `datos_ficticios_nuevo.sql`: Contiene datos de ejemplo (opcional, ideal para desarrollo).

4.  **Variables de Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables de entorno. **Es crucial reemplazar los valores de marcador de posición** con tu configuración real y **mantener este archivo fuera del control de versiones**.

    ```env
    PORT=3000
    DATABASE_URL="postgresql://<tu_usuario_db>:<tu_contraseña_db>@<tu_host_db>:<tu_puerto_db>/<tu_nombre_db>"
    JWT_SECRET="<tu_secreto_jwt_fuerte_y_aleatorio>"
    # Ejemplo de formato para DATABASE_URL (reemplaza con tus credenciales reales):
    # DATABASE_URL="postgresql://usuario_ejemplo:contraseña_ejemplo@localhost:5432/nombre_db_ejemplo"
    ```

    - `PORT`: El puerto en el que se ejecutará el servidor.
    - `DATABASE_URL`: Tu cadena de conexión a PostgreSQL.
    - `JWT_SECRET`: Una clave secreta fuerte y aleatoria para firmar los JWTs. **¡Es vital para la seguridad de tu aplicación!**

## ▶️ Ejecución de la Aplicación

- **Modo Desarrollo (con recarga en caliente):**

  ```bash
  npm run dev
  ```

- **Construir y Ejecutar (Modo Producción):**
  ```bash
  npm run build
  npm start
  ```

## 🧪 Pruebas

Para ejecutar las pruebas automatizadas:

```bash
npm test
```

Para ejecutar las pruebas con un informe de cobertura:

```bash
npm run test:coverage
```

## 🧹 Linting y Formateo

- **Análisis de Código (Linting):**
  ```bash
  npm run lint
  ```
- **Corregir Problemas de Linting:**
  ```bash
  npm run lint:fix
  ```
- **Formatear Código (Prettier):**
  ```bash
  npm run format
  ```

## ☁️ Despliegue

Este backend está optimizado para ser desplegado en plataformas como [Render](https://render.com/). Asegúrate de que todas las variables de entorno (especialmente `DATABASE_URL` y `JWT_SECRET`) estén configuradas correctamente en tu plataforma de despliegue para garantizar el funcionamiento y la seguridad.

## 📄 Endpoints de la API

[(Considera añadir una sección aquí con una lista de los principales endpoints de la API o un enlace a la documentación de la API si está disponible, por ejemplo, generada con Swagger/OpenAPI.)](https://barberia-project-backend.onrender.com/api-docs.)

---
