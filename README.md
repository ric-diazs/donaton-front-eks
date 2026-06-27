# Donaton — Frontend

Repositorio del frontend del sistema Donaton, construido con React, Vite, TypeScript y Tailwind CSS.

---

## Requisito previo importante

Este proyecto requiere que el backend este corriendo para funcionar correctamente.
Antes de levantar el frontend, debes tener el backend configurado y ejecutandose.

Se recomienda trabajar ambos proyectos dentro de una misma carpeta raiz llamada `donaton/`:

```
donaton/
├── front-donaton/        <- este proyecto
└── backend-donaton/      <- debe estar presente y corriendo
```

---

## Herramientas requeridas

| Herramienta    | Version minima | Descarga                               |
|----------------|----------------|----------------------------------------|
| Node.js        | 20.x           | https://nodejs.org                     |
| npm            | 10.x           | Incluido con Node.js                   |
| Git            | 2.x            | https://git-scm.com                    |
| Docker Desktop | 4.x            | https://www.docker.com/products/docker-desktop |
| Navegador      | Chrome 120+ / Firefox 121+ / Edge 120+        |

Docker Desktop es necesario para la base de datos MySQL que usa el backend.
Debe estar abierto antes de levantar el backend.

Para verificar que Node.js esta instalado:

```bash
node -v
npm -v
```

---

## Instalacion

### Paso 1 — Instalar dependencias

```bash
cd front-donaton
npm install
```

### Paso 2 — Crear el archivo de variables de entorno

Crea un archivo `.env` en la raiz de la carpeta `front-donaton/` con el siguiente contenido:

```env
VITE_API_URL=http://localhost:3000
```

Este archivo no esta incluido en el proyecto por seguridad y debe crearse manualmente.

### Paso 3 — Levantar el backend primero

Antes de iniciar el frontend, el backend debe estar corriendo.
Sigue las instrucciones del README del repositorio `backend-donaton/`.

### Paso 4 — Levantar el servidor de desarrollo

```bash
npm run dev
```

El frontend estara disponible en:

```
http://localhost:5173
```

---

## Paginas disponibles

| Ruta              | Descripcion                          | Acceso                        |
|-------------------|--------------------------------------|-------------------------------|
| /                 | Pagina de inicio publica             | Publico                       |
| /donar            | Portal de registro de donaciones     | Publico                       |
| /seguimiento      | Consulta de donacion por codigo OT   | Publico                       |
| /contacto         | Formulario de contacto               | Publico                       |
| /login            | Inicio de sesion                     | Publico                       |
| /admin            | Panel del administrador              | Solo Admin                    |
| /coordinador      | Panel del coordinador                | Admin y Coordinador           |
| /voluntario       | Panel del voluntario                 | Admin, Coordinador, Voluntario|

---

## Roles del sistema para pruebas

El login utiliza un selector de rol temporal para el PMV.
Selecciona el rol deseado al iniciar sesion:

| Rol            | Panel al que redirige |
|----------------|-----------------------|
| Administrador  | /admin                |
| Coordinador    | /coordinador          |
| Voluntario     | /voluntario           |

---

## Scripts disponibles

```bash
npm run dev        # Levanta el servidor de desarrollo en localhost:5173
npm run build      # Genera el build de produccion en la carpeta /dist
npm run preview    # Previsualiza el build de produccion
```

---

## Notas importantes

- Si el frontend no puede conectar al backend y aparece el error "failed to fetch",
  verifica que el backend este corriendo en el puerto 3000 y que el archivo `.env`
  tenga `VITE_API_URL=http://localhost:3000`.

- Si cambias el archivo `.env`, debes reiniciar el servidor con `Ctrl+C` y volver
  a ejecutar `npm run dev` para que Vite tome los nuevos valores.

- El frontend fue construido con Vite 8 y React 19. No usar versiones anteriores
  de Node.js ya que pueden generar errores de compatibilidad.

---

## Stack tecnologico

| Tecnologia    | Version  | Uso                                    |
|---------------|----------|----------------------------------------|
| React         | 19.x     | Libreria de interfaz de usuario        |
| Vite          | 8.x      | Empaquetador y servidor de desarrollo  |
| TypeScript    | 5.x      | Tipado estatico                        |
| Tailwind CSS  | 3.x      | Estilos y diseño visual                |
| React Router  | 6.x      | Enrutamiento entre paginas             |
| Axios         | 1.x      | Peticiones HTTP al backend             |

---

## Repositorio relacionado

| Proyecto        | Descripcion                        |
|-----------------|------------------------------------|
| backend-donaton | Backend Next.js + Prisma + MySQL   |

---

## Contexto academico

Proyecto desarrollado para la asignatura GPY1101 — Evaluacion de Proyectos de Software, DuocUC, 2026.

Equipo:
- Remi Garcia
- Ricardo Diaz

## Comentarios Adicionales

Aunque el archivo .env no se encuentra dentro del archivo gitignore se descarto para que el profesor pueda llegar y levantar el proyecto de manera local. Se entiende que en las buenas practicas esta no es la mas adecuada elaborar en entornos de produccion.
