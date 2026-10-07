const express = require("express");
const errorHandler = require("./middlewares/error.middleware");
const NotFoundError = require("./exceptions/NotFoundError");

const authRoutes = require("./routes/auth.routes");

const app = express();

app.use(express.json());

// Ruta de health check básica
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Rutas de la API
app.use("/api/auth", authRoutes);

// Manejo de ruta no encontrada (404)
app.use((req, res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.originalUrl}`));
});

// Middleware global de manejo de errores
app.use(errorHandler);

module.exports = app;
