const express = require("express");
const ticketController = require("../controllers/ticket.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validation.middleware");
const { createTicketSchema } = require("../validators/ticket.validator");

const router = express.Router();

// POST /api/tickets - Crear nuevo ticket de soporte (requiere autenticación JWT)
router.post(
  "/",
  authMiddleware,
  validate(createTicketSchema),
  ticketController.create
);

module.exports = router;
