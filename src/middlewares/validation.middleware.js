const AppError = require("../exceptions/AppError");

function validate(schema, source = "body") {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const parsedData = schema.parse(dataToValidate);
      req[source] = parsedData; // Actualiza con los datos sanitizados/tipados por Zod
      next();
    } catch (error) {
      const issues = error.issues || error.errors;
      if (issues && Array.isArray(issues)) {
        const errorMessages = issues.map(err => `${err.path.join(".")}: ${err.message}`).join(", ");
        return next(new AppError(`Error de validación: ${errorMessages}`, 400, "VALIDATION_ERROR"));
      }
      next(error);
    }
  };
}

module.exports = validate;
