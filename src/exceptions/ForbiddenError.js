const AppError = require("./AppError");

class ForbiddenError extends AppError {
  constructor(message = "Acceso denegado: no tienes permisos para este recurso") {
    super(message, 403, "FORBIDDEN");
  }
}

module.exports = ForbiddenError;
