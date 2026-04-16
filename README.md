1. Arquitectura del Sistema

El sistema utiliza un stack moderno basado en:
- Frontend: React.js con Vite.
- Backend: Node.js con Express.
- Base de Datos: Supabase (PostgreSQL).
- Autenticación: JWT y Supabase Auth.

2. Estructura del Proyecto
El código se organiza en dos directorios principales:
- /frontend: Contiene la interfaz de usuario, hooks de servicios y gestión de estados.
- /backend: Contiene las rutas de la API, middlewares de seguridad (Admin/Auth) y
configuración de la base de datos.

3. Módulos Implementados
- Gestión de Sedes: Control centralizado para los 3 locales.
- Inventario e Insumos: Registro de stock y alertas.
- Recetas: Descuento automático de insumos basado en productos vendidos.
- Caja y Pedidos: Flujo en tiempo real para cocina y ventas.

4. Configuración para el Grupo de Trabajo
Para que los compañeros puedan trabajar sin afectar el sistema comercial:

    1. Clonar este repositorio académico.
    2. Configurar sus propias variables de entorno en un archivo .env (URL de Supabase y
    Anon Key).
    3. No realizar cambios en la rama main sin previo aviso.