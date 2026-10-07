const { z } = require("zod");

const registerSchema = z.object({
  nombre: z.string({
    required_error: "El nombre es obligatorio",
    invalid_type_error: "El nombre debe ser una cadena de texto"
  }).trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  
  correo: z.string({
    required_error: "El correo es obligatorio",
    invalid_type_error: "El correo debe ser una cadena de texto"
  }).trim().email("El formato del correo electrónico es inválido"),
  
  password: z.string({
    required_error: "La contraseña es obligatoria",
    invalid_type_error: "La contraseña debe ser una cadena de texto"
  }).min(6, "La contraseña debe tener al menos 6 caracteres"),
  
  rol: z.enum(["ADMIN", "SOPORTE", "USUARIO"], {
    errorMap: () => ({ message: "El rol debe ser ADMIN, SOPORTE o USUARIO" })
  }).optional().default("USUARIO")
});

const loginSchema = z.object({
  correo: z.string({
    required_error: "El correo es obligatorio",
    invalid_type_error: "El correo debe ser una cadena de texto"
  }).trim().email("El formato del correo electrónico es inválido"),
  
  password: z.string({
    required_error: "La contraseña es obligatoria",
    invalid_type_error: "La contraseña debe ser una cadena de texto"
  }).min(1, "La contraseña es obligatoria")
});

module.exports = {
  registerSchema,
  loginSchema
};
