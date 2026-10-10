# 🎫 Sistema Inteligente de Gestión de Tickets con Inteligencia Artificial

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4.0-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI%20API-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Jest](https://img.shields.io/badge/Jest-Tests%20Passing-C21325?logo=jest&logoColor=white)](https://jestjs.io/)
[![Swagger OpenAPI](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)](http://localhost:3000/api-docs)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## 📌 1. Descripción del Proyecto

Una empresa requiere centralizar y optimizar la gestión de las incidencias técnicas reportadas por sus colaboradores internos. Con frecuencia, los empleados registran descripciones informales o de urgencia (por ejemplo: *"Desde esta mañana no puedo conectarme a internet y tengo una reunión importante en 20 minutos"*), lo que retrasa la asignación y priorización manual por parte del equipo de soporte.

Esta solución es una **API REST profesional y desacoplada** desarrollada con **Node.js**, **Express**, **Prisma ORM** y **PostgreSQL**, que incorpora un motor de **Inteligencia Artificial (Google Gemini API con fallback local)** para analizar y clasificar automáticamente cada ticket en tiempo real, sugiriendo:
- **Categoría del incidente:** `HARDWARE`, `SOFTWARE`, `CONECTIVIDAD`, `ACCESOS` u `OTRO`.
- **Nivel de prioridad:** `BAJA`, `MEDIA`, `ALTA` o `CRITICA`.
- **Resumen ejecutivo:** Síntesis concisa de máximo 30 palabras.
- **Etiquetas contextuales:** Entre 1 y 5 etiquetas clave para búsqueda y catalogación.

---

## 🏛️ 2. Arquitectura de Software

El proyecto sigue una **arquitectura en capas desacoplada** (*Layered Clean Architecture*), garantizando la separación estricta de responsabilidades, alta mantenibilidad y facilidad de testing:

```
Petición HTTP
    │
    ▼
[Middlewares] ──► (CORS / JSON / Auth JWT / Roles / Zod Validation)
    │
    ▼
[Routes] ────────► Enrutamiento declarativo (/api/auth, /api/tickets)
    │
    ▼
[Controllers] ───► Recepción de peticiones y serialización de respuestas HTTP
    │
    ▼
[Services] ──────► Lógica de negocio central y orquestación
    │         ├─► [AI Analyzers] (Gemini API ──► Fallback Local)
    │
    ▼
[Repositories] ──► Capa de abstracción de datos y consultas
    │
    ▼
[Prisma ORM] ────► Cliente tipado e interfaz con la base de datos
    │
    ▼
[PostgreSQL] ────► Motor de persistencia relacional
```

### Modelo de Datos (Relaciones)

```mermaid
erDiagram
    USUARIOS ||--o{ TICKETS : "solicita (1:N)"
    USUARIOS ||--o{ TICKETS : "atiende como técnico (1:N opcional)"

    USUARIOS {
        Int id PK
        String nombre
        String correo UK
        String password
        Rol rol "ADMIN | SOPORTE | USUARIO"
        DateTime fechaCreacion
    }

    TICKETS {
        Int id PK
        String titulo
        String descripcion
        Categoria categoria "HARDWARE | SOFTWARE | CONECTIVIDAD | ACCESOS | OTRO"
        Prioridad prioridad "BAJA | MEDIA | ALTA | CRITICA"
        Estado estado "ABIERTO | EN_PROCESO | RESUELTO | CERRADO"
        Int usuarioSolicitanteId FK
        Int tecnicoAsignadoId FK "nullable"
        String resumenIA "nullable"
        String[] etiquetasIA
        DateTime eliminadoEn "nullable (Soft Delete)"
        DateTime fechaCreacion
        DateTime fechaActualizacion
    }
```

---

## ⚙️ 3. Requisitos del Entorno

- **Node.js:** Versión `20.x` o superior (probado en Node v24).
- **npm:** Versión `10.x` o superior.
- **PostgreSQL:** Versión `14.x` o superior en ejecución local o remota.
- **Google Gemini API Key:** *(Opcional)* Si no se define o se agota la cuota, el sistema activa automáticamente su **clasificador local por reglas**.

---

## 🚀 4. Instalación y Puesta en Marcha

### Paso 1: Clonar el Repositorio
```bash
git clone https://github.com/DanielFelipeFlorezCubides/Sistema-de-generacion-de-tickets.git
cd Sistema-de-generacion-de-tickets
```

### Paso 2: Instalar Dependencias
```bash
npm install
```

### Paso 3: Configurar Variables de Entorno
Copia la plantilla de entorno `.env.example` para generar tu archivo `.env`:
```bash
cp .env.example .env
```
Edita el archivo `.env` configurando tus credenciales de PostgreSQL y claves deseadas:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/tickets_db?schema=public"
AI_API_KEY="tu_api_key_de_gemini"
AI_MODEL="gemini-1.5-flash"
JWT_SECRET="supersecreto_jwt_para_firmar_tokens_sistema_tickets_2026"
```

### Paso 4: Ejecutar Migraciones de Base de Datos
Aplica el esquema declarativo en tu base de datos PostgreSQL mediante Prisma:
```bash
npx prisma migrate dev --name init
```

### Paso 5: Sembrar Usuarios de Prueba (Seed)
El proyecto incluye un script de siembra con usuarios listos para cada rol:
```bash
npm run seed
```
Los usuarios creados por defecto son (todos con contraseña: `Password123!`):
- **Administrador:** `admin@tickets.com` (Rol: `ADMIN`)
- **Técnico:** `soporte@tickets.com` (Rol: `SOPORTE`)
- **Solicitante:** `usuario@tickets.com` (Rol: `USUARIO`)

### Paso 6: Iniciar el Servidor
```bash
# Modo desarrollo con auto-recarga (--watch)
npm run dev

# O modo producción estándar
npm start
```
El servidor quedará disponible en: `http://localhost:3000`

---

## 📖 5. Documentación Interactiva Swagger / OpenAPI

La API cuenta con una interfaz gráfica interactiva OpenAPI 3.0 completamente documentada:

- **Swagger UI:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **Especificación JSON cruda:** [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

### ¿Cómo probar los endpoints protegidos en Swagger?
1. Ejecuta el endpoint `POST /api/auth/login` con las credenciales de uno de los usuarios de prueba.
2. Copia el `token` retornado en la respuesta JSON.
3. Haz clic en el botón verde superior **Authorize** de la interfaz.
4. Pega el token y haz clic en **Authorize**.
5. Ahora todas las solicitudes incluirán automáticamente el encabezado `Authorization: Bearer <token>`.

---

## 📡 6. Catálogo de Endpoints y Ejemplos de Solicitud

| Método | Endpoint | Autenticación | Rol Permitido | Descripción |
| :--- | :--- | :---: | :---: | :--- |
| `POST` | `/api/auth/register` | No | Público | Registra un nuevo usuario en el sistema. |
| `POST` | `/api/auth/login` | No | Público | Inicia sesión y emite un token Bearer JWT. |
| `GET` | `/api/auth/me` | Sí (JWT) | Todos | Obtiene el perfil del usuario autenticado. |
| `POST` | `/api/tickets` | Sí (JWT) | Todos | Crea un ticket de soporte con análisis automático de IA. |
| `GET` | `/api/tickets` | Sí (JWT) | Todos | Lista tickets con filtros y paginación (excluye eliminados). |
| `GET` | `/api/tickets/:id` | Sí (JWT) | Todos | Consulta el detalle de un ticket por ID con datos anidados. |
| `PATCH` | `/api/tickets/:id/asignar` | Sí (JWT) | Todos | Asigna un técnico (valida estrictamente rol `SOPORTE`). |
| `PATCH` | `/api/tickets/:id/estado` | Sí (JWT) | Todos | Actualiza el estado (`ABIERTO`, `EN_PROCESO`, `RESUELTO`, `CERRADO`). |
| `DELETE` | `/api/tickets/:id` | Sí (JWT) | Todos | Eliminación lógica (*soft delete*) del ticket. |
| `GET` | `/api/health` | No | Público | Comprobación de salud y estado del servicio. |

---

### Ejemplos de Peticiones y Respuestas

#### 1. Iniciar Sesión (`POST /api/auth/login`)
**Body:**
```json
{
  "correo": "usuario@tickets.com",
  "password": "Password123!"
}
```
**Respuesta (200 OK):**
```json
{
  "status": "success",
  "message": "Inicio de sesión exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 3,
      "nombre": "Laura Usuario Solicitante",
      "correo": "usuario@tickets.com",
      "rol": "USUARIO"
    }
  }
}
```

#### 2. Crear Ticket con Análisis de IA (`POST /api/tickets`)
**Header:** `Authorization: Bearer <token>`  
**Body:**
```json
{
  "titulo": "Problema con la conexión a internet en la oficina",
  "descripcion": "Desde esta mañana no puedo conectarme a internet vía WiFi ni cable de red, y tengo una reunión con clientes importante en 20 minutos.",
  "usuarioId": 3
}
```
**Respuesta (201 Created):**
```json
{
  "status": "success",
  "message": "Ticket creado exitosamente",
  "data": {
    "id": 1,
    "titulo": "Problema con la conexión a internet en la oficina",
    "descripcion": "Desde esta mañana no puedo conectarme a internet vía WiFi ni cable de red, y tengo una reunión con clientes importante en 20 minutos.",
    "categoria": "CONECTIVIDAD",
    "prioridad": "ALTA",
    "estado": "ABIERTO",
    "usuarioSolicitanteId": 3,
    "tecnicoAsignadoId": null,
    "resumenIA": "Usuario reporta pérdida de conectividad a internet previa a una reunión importante.",
    "etiquetasIA": [
      "internet",
      "red",
      "wifi",
      "conexion"
    ],
    "eliminadoEn": null,
    "fechaCreacion": "2026-10-09T18:00:00.000Z",
    "fechaActualizacion": "2026-10-09T18:00:00.000Z",
    "usuarioSolicitante": {
      "id": 3,
      "nombre": "Laura Usuario Solicitante",
      "correo": "usuario@tickets.com",
      "rol": "USUARIO"
    }
  }
}
```

#### 3. Consultar Tickets con Filtros y Paginación (`GET /api/tickets`)
**Query Params:** `?estado=ABIERTO&prioridad=ALTA&page=1&limit=10`  
**Respuesta (200 OK):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "titulo": "Problema con la conexión a internet en la oficina",
      "categoria": "CONECTIVIDAD",
      "prioridad": "ALTA",
      "estado": "ABIERTO",
      "resumenIA": "Usuario reporta pérdida de conectividad a internet previa a una reunión importante.",
      "etiquetasIA": ["internet", "red", "wifi"],
      "usuarioSolicitante": {
        "id": 3,
        "nombre": "Laura Usuario Solicitante"
      },
      "tecnicoAsignado": null
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

#### 4. Asignar Técnico de Soporte (`PATCH /api/tickets/:id/asignar`)
**Body:**
```json
{
  "tecnicoId": 2
}
```
**Respuesta (200 OK):**
```json
{
  "id": 1,
  "titulo": "Problema con la conexión a internet en la oficina",
  "estado": "ABIERTO",
  "solicitante": { "id": 3, "nombre": "Laura Usuario Solicitante" },
  "tecnicoAsignado": { "id": 2, "nombre": "Carlos Soporte Técnico" },
  "fechaActualizacion": "2026-10-09T18:30:00.000Z"
}
```
*Nota: Si se intenta asignar un usuario con rol `USUARIO` o `ADMIN`, el sistema responde con error 400 Bad Request.*

---

## 🛡️ 7. Manejo Centralizado de Errores

Todos los errores y excepciones son interceptados por el middleware global `errorHandler` ([`src/middlewares/error.middleware.js`](file:///c:/Users/felip/OneDrive/Escritorio/Programming%20related/Sistema%20de%20generacion%20de%20tickets/src/middlewares/error.middleware.js)), garantizando un formato de respuesta estructurado y predecible:

```json
{
  "timestamp": "2026-10-09T18:45:00.000Z",
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Únicamente los usuarios con rol SOPORTE pueden ser asignados como técnicos",
  "path": "/api/tickets/1/asignar"
}
```

Códigos y causas estándar:
- **`400 BAD_REQUEST / VALIDATION_ERROR`:** Esquema Zod inválido o violación de reglas de negocio.
- **`401 UNAUTHORIZED`:** Token ausente, firma inválida o expirado.
- **`403 FORBIDDEN`:** El usuario no posee el rol requerido para el recurso.
- **`404 NOT_FOUND`:** Ticket o recurso inexistente, o registro eliminado lógicamente.
- **`409 CONFLICT`:** Correo electrónico duplicado en registro.
- **`500 INTERNAL_SERVER_ERROR`:** Excepción imprevista de servidor.

---

## 🧠 8. Decisiones Técnicas y Arquitectónicas

### 1. Base de Datos (PostgreSQL) y ORM (Prisma)
- **¿Por qué PostgreSQL?** Ofrece un motor relacional sólido, soporte nativo de tipos enumerados (`enum`), manejo de arrays (`String[]` para etiquetas) y robustez para futuras consultas analíticas.
- **¿Por qué Prisma ORM?** Provee tipado estricto automático, un archivo de modelado intuitivo (`schema.prisma`), soporte nativo de migraciones versionadas y un cliente autogenerado que reduce significativamente el riesgo de inyección SQL y errores de sintaxis.

### 2. Estrategia de Inteligencia Artificial (Gemini API + Resiliencia Local)
- **Desacoplamiento total:** Los controladores nunca invocan a Gemini directamente; consumen [`GeminiAnalyzerService`](file:///c:/Users/felip/OneDrive/Escritorio/Programming%20related/Sistema%20de%20generacion%20de%20tickets/src/services/ai/geminiAnalyzer.service.js) a través de la capa de servicios.
- **Prompt estructurado en JSON:** Se instruye al modelo para retornar exclusivamente un objeto JSON sin markdown envolvente.
- **Validación con Zod ([`aiResponse.validator.js`](file:///c:/Users/felip/OneDrive/Escritorio/Programming%20related/Sistema%20de%20generacion%20de%20tickets/src/services/ai/aiResponse.validator.js)):** Antes de persistir cualquier sugerencia de la IA, se audita que la categoría y prioridad pertenezcan a los enums válidos, que el resumen no supere 30-40 palabras y que las etiquetas sean entre 1 y 5.
- **Tolerancia a fallos y fallback:** Si la API de Gemini sufre un timeout (> 7 segundos mediante `AbortController`), error de cuota (HTTP 429/503) o no cuenta con API key configurada, el sistema conmuta de forma transparente al [`LocalAnalyzerService`](file:///c:/Users/felip/OneDrive/Escritorio/Programming%20related/Sistema%20de%20generacion%20de%20tickets/src/services/ai/localAnalyzer.service.js) basado en procesamiento de reglas y palabras clave. El usuario **nunca** experimenta una falla en la creación del ticket por problemas del proveedor externo.

### 3. Justificación de la Eliminación Lógica (*Soft Delete*)
- Para el endpoint `DELETE /api/tickets/:id`, se implementó una estrategia de borrado suave actualizando el campo `eliminadoEn = new Date()` en lugar de un borrado físico (`DROP/DELETE`).
- **Razones clave:**
  1. **Trazabilidad y Auditoría:** Permite reconstruir incidentes históricos y quién intervino.
  2. **Integridad Referencial:** Evita romper registros históricos vinculados a usuarios solicitantes o técnicos.
  3. **Métricas y Reportería Futura:** Facilita medir tiempos de resolución (SLA) y volúmenes de incidencias a lo largo del tiempo.
  4. **Seguridad Operativa:** Todos los endpoints de consulta (`GET /api/tickets` y `GET /api/tickets/:id`) filtran automáticamente `eliminadoEn: null`, respondiendo `404 Not Found` ante tickets dados de baja.

---

## 🧪 9. Pruebas Automatizadas con Mocks (Jest & Supertest)

La suite de pruebas automatizadas garantiza la estabilidad de los flujos críticos sin depender de servicios externos.

```bash
npm test
```

### Estrategia de Mocks para la IA
Para evitar consumir llamadas reales a la API de Gemini, agotar cuotas o requerir conexión de red durante la integración continua, el servicio `GeminiAnalyzerService` es simulado con Jest (`jest.mock(...)`), inyectando respuestas controladas y deterministas en milisegundos.

### Casos de Prueba Incluidos (19 Tests Passing):
1. **Creación de Tickets:** Respuesta HTTP 201, estructura devuelta, asignación de ID y rechazo ante falta de token (401).
2. **Clasificación con IA:** Verificación de inyección de atributos simulados (`categoria`, `prioridad`, `resumenIA`, `etiquetasIA`).
3. **Consulta de Ticket Inexistente o Eliminado:** Validación de HTTP 404 bajo el formato estándar de errores ante IDs ficticios y tickets con soft delete.
4. **Asignación de Técnico:** Validación de rechazo HTTP 400 ante roles no autorizados (`USUARIO`, `ADMIN`), técnico inexistente (404) y asignación exitosa con rol `SOPORTE` (200).
5. **Actualización de Estado:** Verificación de actualización exitosa a estados válidos (`EN_PROCESO`, `RESUELTO`, `CERRADO`) y rechazo con HTTP 400 ante estados no permitidos.
6. **Pruebas Unitarias de IA:** Cobertura de reglas del analizador local y validación de esquemas Zod.

---

## ⚠️ 10. Limitaciones Conocidas y Trabajo Futuro

1. **Cuotas del nivel gratuito de Gemini:** La API gratuita de Google Gemini puede experimentar limitaciones de peticiones por minuto (*Rate Limits 429/503*). El sistema mitiga esto activando su clasificador local resiliente de forma inmediata.
2. **Archivos adjuntos:** La versión actual procesa información en texto plano; en una iteración posterior se puede integrar carga de capturas de pantalla o logs a un bucket S3.
3. **Paginación para grandes volúmenes:** Actualmente utiliza paginación por desplazamiento (*offset/limit*), la cual es idónea para este alcance; para millones de registros se recomienda evolucionar a paginación basada en cursor (*keyset pagination*).
4. **Notificaciones en tiempo real:** La asignación de técnicos y resolución de tickets es síncrona vía HTTP; puede extenderse con WebSockets o envío de correos vía SMTP ante cambios de estado.

---

## 📦 11. Información de Entrega Final

- **Repositorio Público en GitHub:**  
  [https://github.com/DanielFelipeFlorezCubides/Sistema-de-generacion-de-tickets](https://github.com/DanielFelipeFlorezCubides/Sistema-de-generacion-de-tickets)
- **Hash del Último Commit:**  
  *(Consulta el hash ejecutando `git rev-parse HEAD` o revisa el commit final en el historial de Git)*
- **Destinatario de Entrega:**  
  `karen.celis@campuslands.com`
- **Evaluación:** Prueba Técnica - Sistema Inteligente de Gestión de Tickets (NodeJS / Express / Prisma).
