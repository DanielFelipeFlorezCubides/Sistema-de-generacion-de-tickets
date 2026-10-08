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

  _formatTicketResponse(ticket) {
    return {
      id: ticket.id,
      titulo: ticket.titulo,
      descripcion: ticket.descripcion,
      categoria: ticket.categoria,
      prioridad: ticket.prioridad,
      estado: ticket.estado,
      resumenIA: ticket.resumenIA,
      etiquetasIA: ticket.etiquetasIA,
      solicitante: ticket.usuarioSolicitante
        ? {
            id: ticket.usuarioSolicitante.id,
            nombre: ticket.usuarioSolicitante.nombre
          }
        : null,
      tecnicoAsignado: ticket.tecnicoAsignado
        ? {
            id: ticket.tecnicoAsignado.id,
            nombre: ticket.tecnicoAsignado.nombre
          }
        : null,
      fechaCreacion: ticket.fechaCreacion,
      fechaActualizacion: ticket.fechaActualizacion
    };
  }

  async getTicketById(id) {
    const ticketId = Number(id);
    const ticket = await ticketRepository.findById(ticketId);

    // Si el ticket no existe o fue eliminado lógicamente (eliminadoEn !== null)
    if (!ticket || ticket.eliminadoEn !== null) {
      throw new NotFoundError(`No se encontró el ticket con id ${ticketId}`);
    }

    return this._formatTicketResponse(ticket);
  }

  async assignTechnician({ ticketId, tecnicoId }) {
    const tId = Number(ticketId);
    const techId = Number(tecnicoId);

    // 1. Verificar la existencia del ticket y que no se encuentre eliminado lógicamente
    const ticket = await ticketRepository.findById(tId);
    if (!ticket || ticket.eliminadoEn !== null) {
      throw new NotFoundError(`No se encontró el ticket con id ${tId}`);
    }

    // 2. Verificar la existencia del usuario técnico en la base de datos
    const tecnico = await userRepository.findById(techId);
    if (!tecnico) {
      throw new NotFoundError(`No se encontró el técnico con id ${techId}`);
    }

    // 3. Validación de Rol: El usuario debe tener estrictamente el rol SOPORTE
    if (tecnico.rol !== "SOPORTE") {
      throw new AppError(
        "Únicamente los usuarios con rol SOPORTE pueden ser asignados como técnicos",
        400,
        "BAD_REQUEST"
      );
    }

    // 4. Actualizar el ticket en PostgreSQL mediante Prisma
    const updatedTicket = await ticketRepository.update(tId, {
      tecnicoAsignadoId: techId
    });

    return this._formatTicketResponse(updatedTicket);
  }

  async updateTicketStatus({ ticketId, estado }) {
    const tId = Number(ticketId);

    // 1. Verificar la existencia del ticket y que no se encuentre eliminado lógicamente
    const ticket = await ticketRepository.findById(tId);
    if (!ticket || ticket.eliminadoEn !== null) {
      throw new NotFoundError(`No se encontró el ticket con id ${tId}`);
    }

    // 2. Actualizar el estado del ticket en PostgreSQL mediante Prisma
    const updatedTicket = await ticketRepository.update(tId, {
      estado
    });

    return this._formatTicketResponse(updatedTicket);
  }
}

module.exports = new TicketService();



