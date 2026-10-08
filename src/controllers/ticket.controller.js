const ticketService = require("../services/ticket.service");

class TicketController {
  async create(req, res, next) {
    try {
      const { titulo, descripcion, usuarioId } = req.body;
      const usuarioSolicitanteId = usuarioId || req.user?.id;

      const ticket = await ticketService.createTicket({
        titulo,
        descripcion,
        usuarioSolicitanteId
      });

      return res.status(201).json({
        status: "success",
        message: "Ticket creado exitosamente",
        data: ticket
      });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const result = await ticketService.getTickets(req.query);

      return res.status(200).json({
        status: "success",
        data: result.tickets,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TicketController();
