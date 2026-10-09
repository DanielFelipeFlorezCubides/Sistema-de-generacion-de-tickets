const env = require("../config/env");

const port = env.PORT || 3000;

const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Sistema Inteligente de Gestión de Tickets API",
    version: "1.0.0",
    description: `API REST robusta construida con **Node.js**, **Express**, **Prisma ORM** y **PostgreSQL** para la gestión y clasificación automatizada de solicitudes de soporte técnico mediante **Inteligencia Artificial**.

### Características Principales:
* **Autenticación JWT:** Tokens Bearer seguros con roles (ADMIN, SOPORTE, USUARIO).
* **Análisis con IA (Gemini API / Fallback local):** Sugerencia de categoría, prioridad, resumen ejecutivo y etiquetas.
* **Eliminación Lógica (Soft Delete):** Preservación de historial y auditoría en base de datos.
* **Manejo Centralizado de Excepciones:** Respuestas de error estandarizadas (RFC 7807 compatible).

### ¿Cómo probar endpoints protegidos?
1. Dirígete a **Autenticación** -> \`POST /api/auth/login\` e inicia sesión (o regístrate primero en \`POST /api/auth/register\`).
2. Copia la propiedad \`token\` de la respuesta.
3. Haz clic en el botón verde **Authorize** (arriba a la derecha), pega el token y haz clic en **Authorize**.
4. ¡Listo! Todas las solicitudes incluirán automáticamente el encabezado \`Authorization: Bearer <token>\`.`,
    contact: {
      name: "Soporte Técnico & Arquitectura",
      url: "https://github.com/DanielFelipeFlorezCubides/Sistema-de-generacion-de-tickets"
    }
  },
  servers: [
    {
      url: `http://localhost:${port}`,
      description: "Servidor de Desarrollo Local"
    }
  ],
  tags: [
    {
      name: "Autenticación",
      description: "Endpoints para registro de usuarios, login y emisión/verificación de tokens JWT"
    },
    {
      name: "Tickets",
      description: "Gestión completa de tickets de soporte con IA, filtros, asignaciones y borrado lógico"
    },
    {
      name: "Sistema",
      description: "Monitoreo y health check de la aplicación"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Introduce tu token JWT obtenido en el login. Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      }
    },
    schemas: {
      // Esquemas de Enums
      RolEnum: {
        type: "string",
        enum: ["ADMIN", "SOPORTE", "USUARIO"],
        example: "USUARIO"
      },
      CategoriaEnum: {
        type: "string",
        enum: ["HARDWARE", "SOFTWARE", "CONECTIVIDAD", "ACCESOS", "OTRO"],
        example: "CONECTIVIDAD"
      },
      PrioridadEnum: {
        type: "string",
        enum: ["BAJA", "MEDIA", "ALTA", "CRITICA"],
        example: "ALTA"
      },
      EstadoEnum: {
        type: "string",
        enum: ["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"],
        example: "ABIERTO"
      },

      // Respuestas de Error Global
      ErrorResponse: {
        type: "object",
        properties: {
          timestamp: {
            type: "string",
            format: "date-time",
            example: "2026-10-09T18:30:00.000Z"
          },
          status: {
            type: "integer",
            example: 400
          },
          error: {
            type: "string",
            example: "VALIDATION_ERROR"
          },
          message: {
            type: "string",
            example: "Error de validación: titulo: El título debe contener entre 5 y 100 caracteres"
          },
          path: {
            type: "string",
            example: "/api/tickets"
          }
        },
        required: ["timestamp", "status", "error", "message", "path"]
      },

      // Entidad Usuario (Respuesta)
      Usuario: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nombre: { type: "string", example: "Juan Pérez" },
          correo: { type: "string", format: "email", example: "juan.perez@empresa.com" },
          rol: { $ref: "#/components/schemas/RolEnum" },
          fechaCreacion: { type: "string", format: "date-time", example: "2026-10-09T14:20:00.000Z" }
        }
      },

      UsuarioResumen: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nombre: { type: "string", example: "Juan Pérez" },
          correo: { type: "string", format: "email", example: "juan.perez@empresa.com" },
          rol: { $ref: "#/components/schemas/RolEnum" }
        }
      },

      UsuarioInfoAnidada: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          nombre: { type: "string", example: "Juan Pérez" }
        }
      },

      // Esquemas de Autenticación
      RegisterRequest: {
        type: "object",
        required: ["nombre", "correo", "password"],
        properties: {
          nombre: {
            type: "string",
            minLength: 2,
            example: "Laura Gómez",
            description: "Nombre completo del usuario (mínimo 2 caracteres)"
          },
          correo: {
            type: "string",
            format: "email",
            example: "laura.gomez@empresa.com",
            description: "Correo electrónico único de contacto"
          },
          password: {
            type: "string",
            format: "password",
            minLength: 6,
            example: "ClaveSegura123*",
            description: "Contraseña segura (mínimo 6 caracteres)"
          },
          rol: {
            $ref: "#/components/schemas/RolEnum",
            description: "Rol asignado al usuario. Por defecto es USUARIO.",
            default: "USUARIO"
          }
        }
      },

      RegisterResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string", example: "Usuario registrado exitosamente" },
          data: { $ref: "#/components/schemas/Usuario" }
        }
      },

      LoginRequest: {
        type: "object",
        required: ["correo", "password"],
        properties: {
          correo: {
            type: "string",
            format: "email",
            example: "laura.gomez@empresa.com"
          },
          password: {
            type: "string",
            format: "password",
            example: "ClaveSegura123*"
          }
        }
      },

      LoginResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string", example: "Inicio de sesión exitoso" },
          data: {
            type: "object",
            properties: {
              token: {
                type: "string",
                example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              },
              usuario: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  nombre: { type: "string", example: "Laura Gómez" },
                  correo: { type: "string", format: "email", example: "laura.gomez@empresa.com" },
                  rol: { $ref: "#/components/schemas/RolEnum" }
                }
              }
            }
          }
        }
      },

      MeResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "integer", example: 1 },
                  correo: { type: "string", example: "laura.gomez@empresa.com" },
                  rol: { $ref: "#/components/schemas/RolEnum" }
                }
              }
            }
          }
        }
      },

      // Esquemas de Tickets
      CreateTicketRequest: {
        type: "object",
        required: ["titulo", "descripcion"],
        properties: {
          titulo: {
            type: "string",
            minLength: 5,
            maxLength: 100,
            example: "Problema con la conexión a internet en la oficina",
            description: "Título breve del incidente (entre 5 y 100 caracteres)"
          },
          descripcion: {
            type: "string",
            minLength: 20,
            maxLength: 2000,
            example: "Desde esta mañana no puedo conectarme a internet vía WiFi ni cable de red, y tengo una reunión con clientes importante en 20 minutos.",
            description: "Descripción detallada del problema (entre 20 y 2000 caracteres)"
          },
          usuarioId: {
            type: "integer",
            example: 1,
            description: "Opcional. ID del usuario solicitante. Si no se especifica, se toma el ID del token JWT del usuario autenticado."
          }
        }
      },

      TicketData: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          titulo: { type: "string", example: "Problema con la conexión a internet en la oficina" },
          descripcion: { type: "string", example: "Desde esta mañana no puedo conectarme a internet..." },
          categoria: { $ref: "#/components/schemas/CategoriaEnum" },
          prioridad: { $ref: "#/components/schemas/PrioridadEnum" },
          estado: { $ref: "#/components/schemas/EstadoEnum" },
          usuarioSolicitanteId: { type: "integer", example: 1 },
          tecnicoAsignadoId: { type: "integer", nullable: true, example: null },
          resumenIA: {
            type: "string",
            nullable: true,
            example: "Usuario sin conectividad a internet en la oficina previo a reunión importante con clientes."
          },
          etiquetasIA: {
            type: "array",
            items: { type: "string" },
            example: ["internet", "red", "wifi", "urgente"]
          },
          eliminadoEn: {
            type: "string",
            format: "date-time",
            nullable: true,
            example: null
          },
          fechaCreacion: {
            type: "string",
            format: "date-time",
            example: "2026-10-09T18:00:00.000Z"
          },
          fechaActualizacion: {
            type: "string",
            format: "date-time",
            example: "2026-10-09T18:00:00.000Z"
          },
          usuarioSolicitante: { $ref: "#/components/schemas/UsuarioResumen" },
          tecnicoAsignado: {
            anyOf: [
              { $ref: "#/components/schemas/UsuarioResumen" },
              { type: "null" }
            ],
            example: null
          }
        }
      },

      CreateTicketResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string", example: "Ticket creado exitosamente" },
          data: { $ref: "#/components/schemas/TicketData" }
        }
      },

      TicketDetailResponse: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          titulo: { type: "string", example: "Problema con la conexión a internet en la oficina" },
          descripcion: { type: "string", example: "Desde esta mañana no puedo conectarme a internet..." },
          categoria: { $ref: "#/components/schemas/CategoriaEnum" },
          prioridad: { $ref: "#/components/schemas/PrioridadEnum" },
          estado: { $ref: "#/components/schemas/EstadoEnum" },
          resumenIA: {
            type: "string",
            nullable: true,
            example: "Usuario sin conectividad a internet en la oficina previo a reunión importante con clientes."
          },
          etiquetasIA: {
            type: "array",
            items: { type: "string" },
            example: ["internet", "red", "wifi"]
          },
          solicitante: {
            anyOf: [
              { $ref: "#/components/schemas/UsuarioInfoAnidada" },
              { type: "null" }
            ],
            example: { id: 1, nombre: "Laura Gómez" }
          },
          tecnicoAsignado: {
            anyOf: [
              { $ref: "#/components/schemas/UsuarioInfoAnidada" },
              { type: "null" }
            ],
            example: { id: 3, nombre: "Carlos Técnico" }
          },
          fechaCreacion: {
            type: "string",
            format: "date-time",
            example: "2026-10-09T18:00:00.000Z"
          },
          fechaActualizacion: {
            type: "string",
            format: "date-time",
            example: "2026-10-09T18:15:00.000Z"
          }
        }
      },

      PaginationMetadata: {
        type: "object",
        properties: {
          total: { type: "integer", example: 45 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalPages: { type: "integer", example: 5 }
        }
      },

      TicketListResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          data: {
            type: "array",
            items: { $ref: "#/components/schemas/TicketData" }
          },
          pagination: { $ref: "#/components/schemas/PaginationMetadata" }
        }
      },

      AssignTechnicianRequest: {
        type: "object",
        required: ["tecnicoId"],
        properties: {
          tecnicoId: {
            type: "integer",
            minimum: 1,
            example: 3,
            description: "ID del usuario técnico a asignar. Debe existir y tener estrictamente el rol SOPORTE."
          }
        }
      },

      UpdateTicketStatusRequest: {
        type: "object",
        required: ["estado"],
        properties: {
          estado: {
            $ref: "#/components/schemas/EstadoEnum",
            description: "Nuevo estado a establecer en el ticket (ABIERTO, EN_PROCESO, RESUELTO, CERRADO)."
          }
        }
      },

      DeleteTicketResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "success" },
          message: { type: "string", example: "Ticket eliminado exitosamente" }
        }
      },

      HealthResponse: {
        type: "object",
        properties: {
          status: { type: "string", example: "OK" },
          timestamp: { type: "string", format: "date-time", example: "2026-10-09T18:00:00.000Z" }
        }
      }
    },

    // Respuestas Reutilizables de Códigos de Estado
    responses: {
      BadRequest: {
        description: "Petición inválida (400) - Error en validaciones de campos de entrada o violación de regla de negocio.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              validationError: {
                summary: "Error de validación de campos",
                value: {
                  timestamp: "2026-10-09T18:30:00.000Z",
                  status: 400,
                  error: "VALIDATION_ERROR",
                  message: "Error de validación: titulo: El título debe contener entre 5 y 100 caracteres",
                  path: "/api/tickets"
                }
              },
              businessRuleError: {
                summary: "Regla de negocio no cumplida",
                value: {
                  timestamp: "2026-10-09T18:30:00.000Z",
                  status: 400,
                  error: "BAD_REQUEST",
                  message: "Únicamente los usuarios con rol SOPORTE pueden ser asignados como técnicos",
                  path: "/api/tickets/1/asignar"
                }
              }
            }
          }
        }
      },
      Unauthorized: {
        description: "No autorizado (401) - Token JWT ausente, inválido o expirado.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            examples: {
              missingToken: {
                summary: "Token no proporcionado",
                value: {
                  timestamp: "2026-10-09T18:30:00.000Z",
                  status: 401,
                  error: "UNAUTHORIZED",
                  message: "Token de autorización no proporcionado o formato incorrecto (se requiere Bearer <token>)",
                  path: "/api/tickets"
                }
              },
              invalidCredentials: {
                summary: "Credenciales erróneas en login",
                value: {
                  timestamp: "2026-10-09T18:30:00.000Z",
                  status: 401,
                  error: "UNAUTHORIZED",
                  message: "Credenciales inválidas",
                  path: "/api/auth/login"
                }
              }
            }
          }
        }
      },
      Forbidden: {
        description: "Acceso prohibido (403) - El usuario autenticado carece del rol o permisos requeridos.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              timestamp: "2026-10-09T18:30:00.000Z",
              status: 403,
              error: "FORBIDDEN",
              message: "No tienes los permisos requeridos para acceder a este recurso",
              path: "/api/tickets/1"
            }
          }
        }
      },
      NotFound: {
        description: "Recurso no encontrado (404) - El identificador solicitado no existe o fue eliminado lógicamente.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              timestamp: "2026-10-09T18:30:00.000Z",
              status: 404,
              error: "NOT_FOUND",
              message: "No se encontró el ticket con id 99",
              path: "/api/tickets/99"
            }
          }
        }
      },
      Conflict: {
        description: "Conflicto (409) - El recurso ya existe (por ejemplo, correo duplicado).",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              timestamp: "2026-10-09T18:30:00.000Z",
              status: 409,
              error: "CONFLICT",
              message: "El correo electrónico ya se encuentra registrado",
              path: "/api/auth/register"
            }
          }
        }
      },
      InternalServerError: {
        description: "Error interno del servidor (500) - Error no previsto o fallo en servicio externo.",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
            example: {
              timestamp: "2026-10-09T18:30:00.000Z",
              status: 500,
              error: "INTERNAL_SERVER_ERROR",
              message: "Ocurrió un error inesperado en el servidor",
              path: "/api/tickets"
            }
          }
        }
      }
    }
  },
  paths: {
    // ------------------------------------------------------------------------
    // AUTENTICACIÓN
    // ------------------------------------------------------------------------
    "/api/auth/register": {
      post: {
        tags: ["Autenticación"],
        summary: "Registrar un nuevo usuario",
        description: "Crea un nuevo usuario en la base de datos con contraseña cifrada (bcrypt). Si no se envía el rol, se asignará 'USUARIO' por defecto.",
        operationId: "registerUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Usuario registrado satisfactoriamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterResponse" }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": { $ref: "#/components/responses/Conflict" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Autenticación"],
        summary: "Iniciar sesión de usuario",
        description: "Autentica al usuario mediante correo y contraseña, y emite un token JWT con vigencia de 24 horas para consumir endpoints protegidos.",
        operationId: "loginUser",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Inicio de sesión exitoso. Retorna el token JWT y datos básicos del usuario.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },

    "/api/auth/me": {
      get: {
        tags: ["Autenticación"],
        summary: "Obtener perfil del usuario autenticado",
        description: "Verifica el token JWT en las cabeceras y devuelve los datos decodificados de la sesión activa.",
        operationId: "getCurrentUser",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "Información del usuario autenticado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" }
              }
            }
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },

    // ------------------------------------------------------------------------
    // TICKETS
    // ------------------------------------------------------------------------
    "/api/tickets": {
      post: {
        tags: ["Tickets"],
        summary: "Crear ticket con clasificación inteligente de IA",
        description: `Registra una nueva solicitud de soporte técnico.
El sistema analiza el contenido (\`titulo\` y \`descripcion\`) a través de un servicio de IA (Gemini API con fallback local por reglas) para:
* Determinar la categoría (**HARDWARE, SOFTWARE, CONECTIVIDAD, ACCESOS, OTRO**).
* Establecer la prioridad (**BAJA, MEDIA, ALTA, CRITICA**).
* Generar un resumen conciso de máximo 30 palabras.
* Sugerir entre 1 y 5 etiquetas descriptivas.

El ticket se persiste en PostgreSQL con estado inicial **ABIERTO**.`,
        operationId: "createTicket",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateTicketRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Ticket creado y clasificado exitosamente por la IA.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateTicketResponse" }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": {
            description: "El usuario solicitante especificado no existe en la base de datos.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  timestamp: "2026-10-09T18:30:00.000Z",
                  status: 404,
                  error: "NOT_FOUND",
                  message: "El usuario solicitante con ID 99 no existe",
                  path: "/api/tickets"
                }
              }
            }
          },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      },

      get: {
        tags: ["Tickets"],
        summary: "Listar tickets con filtros y paginación",
        description: `Obtiene el listado de tickets registrados excluyendo automáticamente aquellos eliminados de forma lógica (\`eliminadoEn\` es \`null\`).
Permite aplicar filtros combinados por estado, categoría, prioridad y usuario solicitante, además de soporte para paginación mediante \`page\` y \`limit\`.`,
        operationId: "getTickets",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "estado",
            in: "query",
            required: false,
            description: "Filtrar por estado del ticket",
            schema: { $ref: "#/components/schemas/EstadoEnum" }
          },
          {
            name: "categoria",
            in: "query",
            required: false,
            description: "Filtrar por categoría del ticket",
            schema: { $ref: "#/components/schemas/CategoriaEnum" }
          },
          {
            name: "prioridad",
            in: "query",
            required: false,
            description: "Filtrar por prioridad asignada",
            schema: { $ref: "#/components/schemas/PrioridadEnum" }
          },
          {
            name: "usuarioSolicitante",
            in: "query",
            required: false,
            description: "Filtrar por ID del usuario solicitante",
            schema: {
              type: "integer",
              minimum: 1,
              example: 1
            }
          },
          {
            name: "usuarioId",
            in: "query",
            required: false,
            description: "Alias alternativo para filtrar por ID del usuario solicitante",
            schema: {
              type: "integer",
              minimum: 1,
              example: 1
            }
          },
          {
            name: "page",
            in: "query",
            required: false,
            description: "Número de página a consultar (por defecto 1)",
            schema: {
              type: "integer",
              minimum: 1,
              default: 1,
              example: 1
            }
          },
          {
            name: "limit",
            in: "query",
            required: false,
            description: "Cantidad de tickets por página (por defecto 10, máximo 100)",
            schema: {
              type: "integer",
              minimum: 1,
              maximum: 100,
              default: 10,
              example: 10
            }
          }
        ],
        responses: {
          "200": {
            description: "Listado de tickets obtenido con éxito junto con metadatos de paginación.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TicketListResponse" }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },

    "/api/tickets/{id}": {
      get: {
        tags: ["Tickets"],
        summary: "Consultar detalle de un ticket por ID",
        description: `Devuelve la información detallada de un ticket específico incluyendo el análisis generado por la IA y la información anidada del usuario solicitante y del técnico asignado.
Si el ticket no existe o se encuentra eliminado lógicamente (\`eliminadoEn != null\`), responde con código HTTP **404 Not Found**.`,
        operationId: "getTicketById",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID numérico entero positivo del ticket",
            schema: {
              type: "integer",
              minimum: 1,
              example: 1
            }
          }
        ],
        responses: {
          "200": {
            description: "Detalle completo del ticket consultado.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TicketDetailResponse" }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      },

      delete: {
        tags: ["Tickets"],
        summary: "Eliminación lógica de un ticket (Soft Delete)",
        description: `Realiza un borrado lógico del ticket estableciendo el campo \`eliminadoEn\` con la marca de tiempo actual.
No se destruye físicamente el registro en PostgreSQL, garantizando la preservación del historial, trazabilidad para auditorías y reportería futura.
Cualquier consulta posterior a este ID devolverá **404 Not Found**.`,
        operationId: "deleteTicket",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del ticket a eliminar lógicamente",
            schema: {
              type: "integer",
              minimum: 1,
              example: 1
            }
          }
        ],
        responses: {
          "200": {
            description: "Ticket eliminado lógicamente de forma exitosa.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/DeleteTicketResponse" }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },

    "/api/tickets/{id}/asignar": {
      patch: {
        tags: ["Tickets"],
        summary: "Asignar un técnico de soporte a un ticket",
        description: `Asigna un técnico responsable para la atención de la incidencia.
**Regla de Negocio Estricta:** El usuario asignado debe existir y tener obligatoriamente el rol **SOPORTE**. Si el usuario tiene rol **USUARIO** o **ADMIN**, la solicitud es rechazada con un código **400 Bad Request**.`,
        operationId: "assignTechnicianToTicket",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del ticket al que se asignará el técnico",
            schema: {
              type: "integer",
              minimum: 1,
              example: 1
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/AssignTechnicianRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Técnico asignado exitosamente al ticket.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TicketDetailResponse" }
              }
            }
          },
          "400": {
            description: "Error de validación o el usuario indicado no tiene el rol SOPORTE requerido.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  timestamp: "2026-10-09T18:30:00.000Z",
                  status: 400,
                  error: "BAD_REQUEST",
                  message: "Únicamente los usuarios con rol SOPORTE pueden ser asignados como técnicos",
                  path: "/api/tickets/1/asignar"
                }
              }
            }
          },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": {
            description: "El ticket no existe, fue eliminado, o el técnico indicado no existe.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
                example: {
                  timestamp: "2026-10-09T18:30:00.000Z",
                  status: 404,
                  error: "NOT_FOUND",
                  message: "No se encontró el técnico con id 5",
                  path: "/api/tickets/1/asignar"
                }
              }
            }
          },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },

    "/api/tickets/{id}/estado": {
      patch: {
        tags: ["Tickets"],
        summary: "Actualizar el estado del ticket",
        description: `Permite transicionar el ciclo de vida del ticket entre los estados permitidos del sistema:
* **ABIERTO**
* **EN_PROCESO**
* **RESUELTO**
* **CERRADO**

Si el ticket fue eliminado previamente o no existe, retorna **404 Not Found**.`,
        operationId: "updateTicketStatus",
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            description: "ID del ticket cuyo estado se actualizará",
            schema: {
              type: "integer",
              minimum: 1,
              example: 1
            }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateTicketStatusRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Estado del ticket actualizado exitosamente.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TicketDetailResponse" }
              }
            }
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      }
    },

    // ------------------------------------------------------------------------
    // SISTEMA / HEALTH
    // ------------------------------------------------------------------------
    "/api/health": {
      get: {
        tags: ["Sistema"],
        summary: "Health check del servicio",
        description: "Comprueba que la API y el servidor web se encuentren activos y respondiendo adecuadamente.",
        operationId: "healthCheck",
        responses: {
          "200": {
            description: "Servicio operativo.",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" }
              }
            }
          },
          "500": { $ref: "#/components/responses/InternalServerError" }
        }
      }
    }
  }
};

const swaggerUiOptions = {
  customSiteTitle: "Documentación API - Sistema de Tickets con IA",
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-weight: 700; color: #1e293b; }
    .swagger-ui .btn.authorize { background-color: #0284c7; border-color: #0284c7; color: #ffffff; }
    .swagger-ui .btn.authorize svg { fill: #ffffff; }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true
  }
};

module.exports = {
  swaggerSpec,
  swaggerUiOptions
};
