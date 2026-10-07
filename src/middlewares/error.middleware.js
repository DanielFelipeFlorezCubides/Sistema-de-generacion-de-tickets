function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const error = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "Ocurrió un error inesperado en el servidor";

  // En caso de error no previsto de servidor (500), podemos registrarlo en consola para depuración
  if (status === 500) {
    console.error("[ServerError]:", err);
  }

  res.status(status).json({
    timestamp: new Date().toISOString(),
    status,
    error,
    message,
    path: req.originalUrl
  });
}

module.exports = errorHandler;
