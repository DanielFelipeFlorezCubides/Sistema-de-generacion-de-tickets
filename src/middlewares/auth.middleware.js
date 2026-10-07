const jwt = require("jsonwebtoken");
const env = require("../config/env");
const UnauthorizedError = require("../exceptions/UnauthorizedError");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new UnauthorizedError("Token de autorización no proporcionado o formato incorrecto (se requiere Bearer <token>)"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("El token de autenticación ha expirado"));
    }
    return next(new UnauthorizedError("Token de autenticación inválido"));
  }
}

module.exports = authMiddleware;
