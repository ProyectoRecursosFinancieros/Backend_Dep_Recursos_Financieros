import { db } from "../config/db";
import { SolicitudRepository, Solicitud, SolicitudWithRelations } from "../repository/SolicitudRepository";
import { EstadoSolicitud, ISolicitudCreate } from "../interfaces";

export interface SolicitudResult {
  success: boolean;
  message: string;
  data?: Solicitud | SolicitudWithRelations;
}

class SolicitudService {
  private solicitudRepository: SolicitudRepository;

  constructor() {
    this.solicitudRepository = new SolicitudRepository(db);
  }

  private generarFolio(): string {
    return `SOL-${Date.now()}`;
  }

  public async crear(data: ISolicitudCreate): Promise<SolicitudResult> {
    try {
      if (!data.areaId || !data.descripcionGeneral) {
        return { success: false, message: "areaId y descripcionGeneral son obligatorios" };
      }

      if (!data.solicitanteId) {
        return { success: false, message: "solicitanteId es obligatorio" };
      }

      const result = await this.solicitudRepository.create({
        folio: this.generarFolio(),
        areaId: data.areaId,
        solicitanteId: data.solicitanteId,
        descripcionGeneral: data.descripcionGeneral,
        estado: EstadoSolicitud.BORRADOR,
      });

      return {
        success: true,
        message: "Solicitud creada exitosamente",
        data: result,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al crear solicitud" };
    }
  }

  public async obtenerTodas(): Promise<SolicitudWithRelations[]> {
    return this.solicitudRepository.findAll();
  }

  public async obtenerPorId(id: number): Promise<SolicitudResult> {
    try {
      const solicitud = await this.solicitudRepository.findByIdWithRelations(id);

      if (!solicitud) {
        return { success: false, message: "Solicitud no encontrada" };
      }

      return {
        success: true,
        message: "Solicitud encontrada",
        data: solicitud,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al obtener solicitud" };
    }
  }

  public async enviar(id: number): Promise<SolicitudResult> {
    try {
      const solicitud = await this.solicitudRepository.findById(id);

      if (!solicitud) {
        return { success: false, message: "Solicitud no encontrada" };
      }

      if (solicitud.estado !== EstadoSolicitud.BORRADOR) {
        return { success: false, message: "Solo solicitudes en BORRADOR pueden enviarse" };
      }

      const result = await this.solicitudRepository.updateEstado(id, EstadoSolicitud.ENVIADA);

      return {
        success: true,
        message: "Solicitud enviada exitosamente",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al enviar solicitud" };
    }
  }

  public async autorizar(id: number): Promise<SolicitudResult> {
    try {
      const solicitud = await this.solicitudRepository.findById(id);

      if (!solicitud) {
        return { success: false, message: "Solicitud no encontrada" };
      }

      if (solicitud.estado !== EstadoSolicitud.ENVIADA) {
        return { success: false, message: "Solo solicitudes ENVIADAS pueden autorizarse" };
      }

      const result = await this.solicitudRepository.updateEstado(id, EstadoSolicitud.AUTORIZADA);

      return {
        success: true,
        message: "Solicitud autorizada exitosamente",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al autorizar solicitud" };
    }
  }

  public async rechazar(id: number): Promise<SolicitudResult> {
    try {
      const solicitud = await this.solicitudRepository.findById(id);

      if (!solicitud) {
        return { success: false, message: "Solicitud no encontrada" };
      }

      if (solicitud.estado !== EstadoSolicitud.ENVIADA) {
        return { success: false, message: "Solo solicitudes ENVIADAS pueden rechazarse" };
      }

      const result = await this.solicitudRepository.updateEstado(id, EstadoSolicitud.RECHAZADA);

      return {
        success: true,
        message: "Solicitud rechazada exitosamente",
        data: result!,
      };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al rechazar solicitud" };
    }
  }

  public async obtenerPorEstado(estado: EstadoSolicitud): Promise<SolicitudWithRelations[]> {
    return this.solicitudRepository.findByEstado(estado);
  }

  public async obtenerPorSolicitante(solicitanteId: number): Promise<SolicitudWithRelations[]> {
    return this.solicitudRepository.findBySolicitanteId(solicitanteId);
  }
}

export const solicitudService = new SolicitudService();
