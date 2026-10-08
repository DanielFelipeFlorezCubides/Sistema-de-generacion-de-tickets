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

  async getTickets(query = {}) {
    const {
      estado,
      categoria,
      prioridad,
      usuarioSolicitante,
      usuarioId,
      page = 1,
      limit = 10
    } = query;

    // 1. Regla de Eliminación Lógica (Soft Delete): Excluir registros con eliminadoEn != null
    const where = {
      eliminadoEn: null
    };

    // 2. Filtros mínimos obligatorios
    if (estado) {
      where.estado = estado;
    }

    if (categoria) {
      where.categoria = categoria;
    }

    if (prioridad) {
      where.prioridad = prioridad;
    }

    const solicitanteId = usuarioSolicitante || usuarioId;
    if (solicitanteId) {
      where.usuarioSolicitanteId = Number(solicitanteId);
    }

    // 3. Paginación básica
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Number(limit) || 10);
    const skip = (pageNum - 1) * limitNum;

    const [tickets, total] = await Promise.all([
      ticketRepository.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { fechaCreacion: "desc" }
      }),
      ticketRepository.count(where)
    ]);

    return {
      tickets,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1
    };
  }
}

module.exports = new TicketService();
