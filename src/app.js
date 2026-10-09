const express = require("express");
const errorHandler = require("./middlewares/error.middleware");
const NotFoundError = require("./exceptions/NotFoundError");

const authRoutes = require("./routes/auth.routes");
const ticketRoutes = require("./routes/ticket.routes");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec, swaggerUiOptions } = require("./docs/swagger");

const app = express();

app.use(express.json());

// Ruta de health check básica
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Documentación Interactiva Swagger / OpenAPI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json(swaggerSpec);
});

// Rutas de la API
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);

// Manejo de ruta no encontrada (404)
app.use((req, res, next) => {
  next(new NotFoundError(`Ruta no encontrada: ${req.originalUrl}`));
});

// Middleware global de manejo de errores
app.use(errorHandler);

module.exports = app;
