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

module.exports = {
  createTicketSchema
};
