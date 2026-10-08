const { z } = require("zod");

const categoriasValidas = ["HARDWARE", "SOFTWARE", "CONECTIVIDAD", "ACCESOS", "OTRO"];
const prioridadesValidas = ["BAJA", "MEDIA", "ALTA", "CRITICA"];

const aiResponseSchema = z.object({
  categoria: z.enum(categoriasValidas, {
    errorMap: () => ({ message: `La categoría debe ser una de: ${categoriasValidas.join(", ")}` })
  }),
  prioridad: z.enum(prioridadesValidas, {
    errorMap: () => ({ message: `La prioridad debe ser una de: ${prioridadesValidas.join(", ")}` })
  }),
  resumen: z.string({
    required_error: "El resumen es obligatorio"
  }).trim().min(5, "El resumen debe contener al menos 5 caracteres").refine(
    (text) => text.trim().split(/\s+/).length <= 40,
    { message: "El resumen no debe exceder de 30-40 palabras" }
  ),
  etiquetas: z.array(
    z.string().trim().min(1, "La etiqueta no puede estar vacía")
  ).min(1, "Debe contener al menos 1 etiqueta").max(5, "No puede contener más de 5 etiquetas")
});

module.exports = {
  aiResponseSchema,
  categoriasValidas,
  prioridadesValidas
};
