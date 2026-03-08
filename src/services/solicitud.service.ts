import { Solicitud, EstadoSolicitud } from "../models/Solicitud";
import { Area } from "../models/Area";
import { Usuario } from "../models/Usuario";

const generarFolio = () => {
  const timestamp = Date.now();
  return `SOL-${timestamp}`;
};

export const crearSolicitud = async (data: any) => {
  const folio = generarFolio();

  const solicitud = await Solicitud.create({
    ...data,
    folio,
    estado: EstadoSolicitud.BORRADOR,
  });

  return solicitud;
};

export const obtenerSolicitudes = async () => {
  return await Solicitud.findAll({
    include: [
      { model: Area },
      { model: Usuario, as: "solicitante" },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const obtenerSolicitudPorId = async (id: number) => {
  const solicitud = await Solicitud.findByPk(id, {
    include: [
      { model: Area },
      { model: Usuario, as: "solicitante" },
    ],
  });

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  return solicitud;
};

export const enviarSolicitud = async (id: number) => {
  const solicitud = await Solicitud.findByPk(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  if (solicitud.estado !== EstadoSolicitud.BORRADOR) {
    throw new Error("Solo solicitudes en BORRADOR pueden enviarse");
  }

  await solicitud.update({
    estado: EstadoSolicitud.ENVIADA,
  });

  return solicitud;
};

export const autorizarSolicitud = async (id: number) => {
  const solicitud = await Solicitud.findByPk(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  if (solicitud.estado !== EstadoSolicitud.ENVIADA) {
    throw new Error("Solo solicitudes enviadas pueden autorizarse");
  }

  await solicitud.update({
    estado: EstadoSolicitud.AUTORIZADA,
  });

  return solicitud;
};

export const rechazarSolicitud = async (id: number) => {
  const solicitud = await Solicitud.findByPk(id);

  if (!solicitud) {
    throw new Error("Solicitud no encontrada");
  }

  if (solicitud.estado !== EstadoSolicitud.ENVIADA) {
    throw new Error("Solo solicitudes enviadas pueden rechazarse");
  }

  await solicitud.update({
    estado: EstadoSolicitud.RECHAZADA,
  });

  return solicitud;
};