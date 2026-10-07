const AppError = require("./AppError");

class ConflictError extends AppError {
  constructor(message = "Conflicto con el recurso actual") {
    super(message, 409, "CONFLICT");
  }
}

module.exports = ConflictError;
