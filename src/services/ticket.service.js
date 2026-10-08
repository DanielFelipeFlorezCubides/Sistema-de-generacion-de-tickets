const ticketRepository = require("../repositories/ticket.repository");
const userRepository = require("../repositories/user.repository");
const geminiAnalyzerService = require("./ai/geminiAnalyzer.service");
const NotFoundError = require("../exceptions/NotFoundError");
const AppError = require("../exceptions/AppError");

class TicketService {
  async createTicket({ titulo, descripcion, usuarioSolicitanteId }) {
    if (!usuarioSolicitanteId) {
      throw new AppError("Se requiere un usuario solicitante para crear el ticket", 400, "BAD_REQUEST");
    }

    // 1. Verificar la existencia del usuario solicitante en la base de datos
    const usuario = await userRepository.findById(Number(usuarioSolicitanteId));
    if (!usuario) {
      throw new NotFoundError(`El usuario solicitante con ID ${usuarioSolicitanteId} no existe`);
    }

    // 2. Invocar a GeminiAnalyzerService para analizar el contenido mediante IA
    const analisisIA = await geminiAnalyzerService.analizar(titulo, descripcion);

    // 3. Almacenar el registro en PostgreSQL a través de Prisma con estado inicial ABIERTO
    const nuevoTicket = await ticketRepository.create({
      titulo,
      descripcion,
      categoria: analisisIA.categoria,
      prioridad: analisisIA.prioridad,
      resumenIA: analisisIA.resumen,
      etiquetasIA: analisisIA.etiquetas,
      estado: "ABIERTO",
      usuarioSolicitanteId: usuario.id
    });

    return nuevoTicket;
  }
}

module.exports = new TicketService();
