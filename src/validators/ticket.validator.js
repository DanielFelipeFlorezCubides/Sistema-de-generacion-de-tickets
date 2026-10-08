const { z } = require("zod");

const createTicketSchema = z.object({
  titulo: z.string({
    required_error: "El título es obligatorio",
    invalid_type_error: "El título debe ser una cadena de texto"
  })
    .trim()
    .min(5, "El título debe contener entre 5 y 100 caracteres")
    .max(100, "El título no puede exceder los 100 caracteres"),

  descripcion: z.string({
    required_error: "La descripción es obligatoria",
    invalid_type_error: "La descripción debe ser una cadena de texto"
  })
    .trim()
    .min(20, "La descripción debe contener entre 20 y 2000 caracteres")
    .max(2000, "La descripción no puede exceder los 2000 caracteres"),

  usuarioId: z.coerce
    .number({
      invalid_type_error: "El usuarioId debe ser un número entero positivo"
    })
    .int("El usuarioId debe ser un número entero")
    .positive("El usuarioId debe ser un número positivo")
    .optional()
});

const getTicketsQuerySchema = z.object({
  estado: z.enum(["ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO"], {
    errorMap: () => ({ message: "El estado debe ser ABIERTO, EN_PROCESO, RESUELTO o CERRADO" })
  }).optional(),

  categoria: z.enum(["HARDWARE", "SOFTWARE", "CONECTIVIDAD", "ACCESOS", "OTRO"], {
    errorMap: () => ({ message: "La categoría debe ser HARDWARE, SOFTWARE, CONECTIVIDAD, ACCESOS u OTRO" })
  }).optional(),

  prioridad: z.enum(["BAJA", "MEDIA", "ALTA", "CRITICA"], {
    errorMap: () => ({ message: "La prioridad debe ser BAJA, MEDIA, ALTA o CRITICA" })
  }).optional(),

  usuarioSolicitante: z.coerce
    .number({ invalid_type_error: "El ID de usuarioSolicitante debe ser un número" })
    .int("El ID de usuarioSolicitante debe ser un entero")
    .positive("El ID de usuarioSolicitante debe ser un número positivo")
    .optional(),

  usuarioId: z.coerce
    .number({ invalid_type_error: "El ID de usuarioId debe ser un número" })
    .int("El ID de usuarioId debe ser un entero")
    .positive("El ID de usuarioId debe ser un número positivo")
    .optional(),

  page: z.coerce
    .number({ invalid_type_error: "page debe ser un número" })
    .int("page debe ser un número entero")
    .positive("page debe ser mayor o igual a 1")
    .optional()
    .default(1),

  limit: z.coerce
    .number({ invalid_type_error: "limit debe ser un número" })
    .int("limit debe ser un número entero")
    .positive("limit debe ser mayor a 0")
    .max(100, "limit no puede exceder 100")
    .optional()
    .default(10)
});

const ticketIdParamSchema = z.object({
  id: z.preprocess(
    (val) => (val === undefined || val === null ? "" : String(val).trim()),
    z.string().regex(/^[1-9]\d*$/, "El ID del ticket debe ser un número entero positivo")
  ).transform(Number)
});

const assignTechnicianSchema = z.object({
  tecnicoId: z.preprocess(
    (val) => (val === undefined || val === null ? "" : String(val).trim()),
    z.string({ required_error: "El campo tecnicoId es obligatorio" })
      .min(1, "El campo tecnicoId es obligatorio")
      .regex(/^[1-9]\d*$/, "El campo tecnicoId debe ser un número entero positivo")
  ).transform(Number)
});

module.exports = {
  createTicketSchema,
  getTicketsQuerySchema,
  ticketIdParamSchema,
  assignTechnicianSchema
};


