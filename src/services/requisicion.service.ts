import { sequelize } from "../config/db";
import { Requisicion, EstadoRequisicion } from "../models/Requisicion";
import { PresupuestoAnual } from "../models/PresupuestoAnual";
import { Solicitud, EstadoSolicitud } from "../models/Solicitud";
import { RequisicionDetalle } from "../models/RequisicionDetalle";
import PDFDocument from "pdfkit";
import { Response } from "express";
import path from "path";
import { Usuario } from "../models/Usuario";
import { Area } from "../models/Area";
import { PartidaPresupuestal } from "../models/PartidaPresupuestal";

const normalize = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getNombreRelacionado = (
  registro: any,
  claves: string[]
): string => {
  for (const clave of claves) {
    const valor = registro?.[clave];
    if (!valor) continue;

    if (typeof valor === "string") {
      const limpio = valor.trim();
      if (limpio) return limpio;
      continue;
    }

    const nombre = valor?.nombre ?? valor?.descripcion ?? valor?.partida ?? "";
    if (typeof nombre === "string" && nombre.trim()) {
      return nombre.trim();
    }
  }

  return "";
};

const buscarPresupuestoPorEtiqueta = async (
  etiqueta: string,
  transaction: any
): Promise<PresupuestoAnual | null> => {
  const texto = String(etiqueta ?? "").trim();
  if (!texto) return null;

  const partes = texto.split(" - ");
  const areaEtiqueta = partes.shift()?.trim() ?? "";
  const partidaEtiqueta = partes.join(" - ").trim();

  if (!areaEtiqueta || !partidaEtiqueta) return null;

  const presupuestos = await PresupuestoAnual.findAll({
    include: [
      { model: Area },
      { model: PartidaPresupuestal },
    ],
    transaction,
  });

  const presupuesto = presupuestos.find((p: any) => {
    const areaNombre = getNombreRelacionado(p, ["area", "Area", "departamento", "Departamento"]);
    const partidaNombre = getNombreRelacionado(p, [
      "partida",
      "Partida",
      "partidaPresupuestal",
      "PartidaPresupuestal",
    ]);

    return (
      normalize(areaNombre) === normalize(areaEtiqueta) &&
      normalize(partidaNombre) === normalize(partidaEtiqueta)
    );
  });

  return presupuesto ?? null;
};

const resolverPresupuesto = async (
  presupuestoInput: unknown,
  transaction: any
): Promise<PresupuestoAnual | null> => {
  const raw = String(presupuestoInput ?? "").trim();
  if (!raw) return null;

  const presupuestoId = Number(raw);
  if (Number.isInteger(presupuestoId) && presupuestoId > 0) {
    const presupuestoPorId = await PresupuestoAnual.findByPk(presupuestoId, {
      include: [
        { model: Area },
        { model: PartidaPresupuestal },
      ],
      transaction,
    });

    if (presupuestoPorId) return presupuestoPorId;
  }

  return await buscarPresupuestoPorEtiqueta(raw, transaction);
};

export const crearRequisicion = async (data: any) => {
  const transaction = await sequelize.transaction();
  try {
    const solicitud = await Solicitud.findByPk(data.solicitudId, { transaction });
    if (!solicitud) throw new Error("Solicitud no encontrada");
    if (solicitud.estado !== EstadoSolicitud.AUTORIZADA) {
      throw new Error("La solicitud debe estar AUTORIZADA");
    }

    if (!data.detalles || data.detalles.length === 0) {
      throw new Error("La requisición debe tener al menos un detalle");
    }

    let total = 0;
    const detallesProcesados = data.detalles.map((d: any) => {
      const subtotal = Number(d.cantidad) * Number(d.precioUnitario);
      const impuestos = Number(d.impuestos || 0);
      const retenciones = Number(d.retenciones || 0);
      const totalLinea = subtotal + impuestos - retenciones;
      total += totalLinea;

      return {
        ...d,
        subtotal,
        impuestos,
        retenciones,
        unidadMedida: d.unidadMedida || "SERVICIO",
        clavePresupuestal: d.clavePresupuestal || "",
        fuenteFinanciamiento: d.fuenteFinanciamiento || "Ingresos Propios",
      };
    });

    if (total > Number(solicitud.monto)) {
      throw new Error(
        `El monto total de la requisición ($${total.toLocaleString(
          "es-MX"
        )}) no puede superar el monto autorizado en la solicitud ($${Number(
          solicitud.monto
        ).toLocaleString("es-MX")})`
      );
    }

    const presupuesto = await resolverPresupuesto(data.presupuestoId, transaction);
    if (!presupuesto) {
      throw new Error(
        "Presupuesto no encontrado o inválido. Verifica que el campo Presupuesto esté enviando un ID numérico o una etiqueta válida como 'Área - Partida'."
      );
    }

    const requisicion = await Requisicion.create(
      {
        solicitudId: data.solicitudId,
        presupuestoId: presupuesto.id,
        total,
      },
      { transaction }
    );

    const detallesConId = detallesProcesados.map((d: any) => ({
      ...d,
      requisicionId: requisicion.id,
    }));

    await RequisicionDetalle.bulkCreate(detallesConId, { transaction });

    await transaction.commit();
    return requisicion;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const autorizarRequisicion = async (
  id: number,
  usuarioId: number,
  observaciones?: string
) => {
  const transaction = await sequelize.transaction();
  try {
    const requisicion = await Requisicion.findByPk(id, {
      include: [PresupuestoAnual],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!requisicion) throw new Error("Requisición no encontrada");
    if (requisicion.estado !== EstadoRequisicion.PENDIENTE) {
      throw new Error("La requisición no está pendiente");
    }

    const presupuesto = requisicion.presupuesto;
    if (!presupuesto) throw new Error("Presupuesto no asociado");

    const disponible = Number(presupuesto.montoAprobado) - Number(presupuesto.montoEjercido);
    const requerido = Number(requisicion.total);

    if (disponible < requerido) {
      throw new Error(
        `Saldo insuficiente. Disponible: $${disponible.toLocaleString(
          "es-MX"
        )} | Requerido: $${requerido.toLocaleString("es-MX")}`
      );
    }

    presupuesto.montoEjercido = Number(presupuesto.montoEjercido) + requerido;
    await presupuesto.save({ transaction });

    requisicion.estado = EstadoRequisicion.AUTORIZADA;
    requisicion.autorizadoPorId = usuarioId;
    requisicion.fechaAutorizacion = new Date();
    requisicion.observaciones = observaciones;

    await requisicion.save({ transaction });
    await transaction.commit();

    return requisicion;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const cancelarRequisicion = async (
  id: number,
  usuarioId: number,
  observaciones: string
) => {
  const transaction = await sequelize.transaction();
  try {
    const requisicion = await Requisicion.findByPk(id, {
      include: [PresupuestoAnual],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!requisicion) throw new Error("Requisición no encontrada");

    // ✅ Ahora permite cancelar tanto PENDIENTE como AUTORIZADA
    if (
      requisicion.estado !== EstadoRequisicion.PENDIENTE &&
      requisicion.estado !== EstadoRequisicion.AUTORIZADA
    ) {
      throw new Error("Solo se pueden cancelar requisiciones PENDIENTE o AUTORIZADAS");
    }

    if (!observaciones?.trim()) {
      throw new Error("Las observaciones son obligatorias al cancelar");
    }

    // Si estaba AUTORIZADA → devolver el dinero al presupuesto
    if (requisicion.estado === EstadoRequisicion.AUTORIZADA && requisicion.presupuesto) {
      const presupuesto = requisicion.presupuesto;
      presupuesto.montoEjercido =
        Number(presupuesto.montoEjercido) - Number(requisicion.total);
      await presupuesto.save({ transaction });
    }

    requisicion.estado = EstadoRequisicion.CANCELADA;
    requisicion.canceladoPorId = usuarioId;
    requisicion.observaciones = observaciones.trim();

    await requisicion.save({ transaction });

    await transaction.commit();
    return requisicion;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const obtenerRequisiciones = async () => {
  return await Requisicion.findAll({
    include: [
      { model: Solicitud },
      { model: PresupuestoAnual },
      { model: RequisicionDetalle },
      { model: Usuario, as: "autorizadoPor", include: [{ model: Area, attributes: ["nombre"] }] },
      { model: Usuario, as: "canceladoPor", include: [{ model: Area, attributes: ["nombre"] }] },
    ],
    order: [["createdAt", "DESC"]],
  });
};

export const obtenerRequisicionPorId = async (id: number) => {
  const requisicion = await Requisicion.findByPk(id, {
    include: [
      { model: Solicitud },
      { model: PresupuestoAnual },
      { model: RequisicionDetalle },
      { model: Usuario, as: "autorizadoPor", include: [{ model: Area }] },
      { model: Usuario, as: "canceladoPor", include: [{ model: Area }] },
    ],
  });
  if (!requisicion) throw new Error("Requisición no encontrada");
  return requisicion;
};

export const generarPDFRequisicion = async (
  requisicionId: number,
  res: Response,
  firmas: {
    elabora: { nombre: string; puesto: string };
    valida: { nombre: string; puesto: string };
    revisa: { nombre: string; puesto: string };
    autoriza: { nombre: string; puesto: string };
  }
) => {
  const requisicion = await Requisicion.findByPk(requisicionId, {
    include: [
      { model: Solicitud },
      { model: RequisicionDetalle, as: "detalles" },
      { model: PresupuestoAnual },
    ],
  });

  if (!requisicion) throw new Error("Requisición no encontrada");

  const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 30 });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=Requisicion_${requisicion.id}.pdf`
  );
  doc.pipe(res);

  const pageWidth = doc.page.width - 60;
  let y = 30;
  const logoPath = path.join(__dirname, "logo.png");

  const logoColWidth = 110;
  const rightWidth = pageWidth - logoColWidth;
  const topHeight = 35;
  const bottomHeight = 35;

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("UNIVERSIDAD POLITÉCNICA DE QUINTANA ROO", 30, y, {
      width: pageWidth,
      align: "center",
    });
  y += 15;

  doc.rect(30, y, logoColWidth, topHeight + bottomHeight).stroke();

  if (require("fs").existsSync(logoPath)) {
    const logoWidth = 60;
    const logoHeight = 60;
    const logoX = 30 + (logoColWidth - logoWidth) / 2;
    doc.image(logoPath, logoX, y + 5, { width: logoWidth, height: logoHeight });
  }

  // 🔴 HEADER ROJO VINO
  doc.rect(30 + logoColWidth, y, rightWidth, topHeight).fillAndStroke("#4A1E0E", "#000");

  // ⚪ TEXTO EN BLANCO
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("REGISTRO REQUISICIÓN DE BIENES Y/O SERVICIO", 30 + logoColWidth, y + 10, {
      width: rightWidth,
      align: "center",
    });

  // 🔁 REGRESAR A NEGRO
  doc.fillColor("#000");

  const colWidth = rightWidth / 4;
  for (let i = 0; i < 4; i++) {
    doc.rect(30 + logoColWidth + i * colWidth, y + topHeight, colWidth, bottomHeight).stroke();
  }

  doc.font("Helvetica").fontSize(8);
  doc.text("Fecha de emisión:", 35 + logoColWidth, y + topHeight + 5);
  doc.text(
    new Date().toLocaleDateString("es-MX", { month: "long", year: "numeric" }),
    35 + logoColWidth,
    y + topHeight + 18
  );
  doc.text("Versión:", 35 + logoColWidth + colWidth, y + topHeight + 5);
  doc.text("01", 35 + logoColWidth + colWidth, y + topHeight + 18);
  doc.text("Última actualización:", 35 + logoColWidth + colWidth * 2, y + topHeight + 5);
  doc.text("N/A", 35 + logoColWidth + colWidth * 2, y + topHeight + 18);
  doc.text("Página:", 35 + logoColWidth + colWidth * 3, y + topHeight + 5);
  doc.text("1 de 1", 35 + logoColWidth + colWidth * 3, y + topHeight + 18);

  y += topHeight + bottomHeight + 10;

  const requisicionHeight = 45;
  doc.rect(30, y, pageWidth, requisicionHeight).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .text("Requisición de Bienes y/o Servicios", 30, y + 10, {
      width: pageWidth,
      align: "center",
    });
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      `No. requisición: UPQROO/SA/DRF/REQ-${requisicion.id
        .toString()
        .padStart(3, "0")}/${new Date().getFullYear()}`,
      35,
      y + requisicionHeight - 15
    );
  doc.text(
    `Fecha de elaboración: ${new Date().toLocaleDateString("es-MX")}`,
    30,
    y + requisicionHeight - 15,
    { width: pageWidth - 10, align: "right" }
  );

  y += requisicionHeight + 10;

  doc.rect(30, y, pageWidth, 30).stroke();
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Área Requirente (Unidad Responsable): SECRETARÍA ADMINISTRATIVA (3304)`,
      35,
      y + 10
    );
  y += 40;

  const colWidths = [35, 75, 102, 115, 40, 60, 195, 80, 80];
  let x = 30;

  doc.font("Helvetica-Bold").fontSize(9);
  const headers = [
    "No.",
    "Partida Específica",
    "Fuente",
    "Clave Presupuestal",
    "Cant.",
    "Unidad",
    "Descripción detallada del bien o servicio solicitado",
    "Costo unitario",
    "Importe",
  ];

  headers.forEach((header, i) => {
    doc.rect(x, y, colWidths[i], 30).stroke();
    doc.text(header, x + 3, y + 8, {
      width: colWidths[i] - 6,
      align: "center",
    });
    x += colWidths[i];
  });

  y += 30;
  doc.font("Helvetica").fontSize(9);

  let totalImporte = 0;

  requisicion.detalles.forEach((det: any, index: number) => {
    const importe = Number(det.subtotal) + Number(det.impuestos) - Number(det.retenciones);
    totalImporte += importe;
    x = 30;

    const rowData = [
      (index + 1).toString(),
      det.clavePresupuestal || "-",
      det.fuenteFinanciamiento || "Ingresos Propios",
      det.clavePresupuestal || "-",
      det.cantidad.toString(),
      det.unidadMedida || "SERVICIO",
      det.descripcion,
      `$ ${Number(det.precioUnitario).toLocaleString("es-MX")}`,
      `$ ${importe.toLocaleString("es-MX")}`,
    ];

    rowData.forEach((text, i) => {
      doc.rect(x, y, colWidths[i], 35).stroke();
      doc.text(String(text), x + 3, y + 8, {
        width: colWidths[i] - 6,
        align: i === 6 ? "left" : "center",
      });
      x += colWidths[i];
    });
    y += 35;
  });

  const totalWidth = colWidths.slice(0, 8).reduce((a, b) => a + b, 0);
  doc.rect(30, y, totalWidth, 30).stroke();
  doc.rect(30 + totalWidth, y, colWidths[8], 30).stroke();
  doc.font("Helvetica-Bold").text("TOTAL", 40, y + 10);
  doc.text(`$ ${totalImporte.toLocaleString("es-MX")}`, 30 + totalWidth + 5, y + 10, {
    width: colWidths[8] - 10,
    align: "center",
  });

  y += 50;

  doc.rect(30, y, pageWidth, 70).stroke();
  doc.font("Helvetica-Bold").text("Justificación:", 40, y + 8);
  doc
    .font("Helvetica")
    .fontSize(9)
    .text(requisicion.solicitud?.descripcionGeneral || "Sin justificación", 40, y + 25, {
      width: pageWidth - 20,
      align: "justify",
    });

  y += 90;

  const firmaY = y;
  const firmaWidth = pageWidth / 4;

  doc.fontSize(9);

  const firmantes = [
    { label: "Elabora", ...firmas.elabora },
    { label: "Valida", ...firmas.valida },
    { label: "Revisa", ...firmas.revisa },
    { label: "Autoriza", ...firmas.autoriza },
  ];

  firmantes.forEach((f, i) => {
    const xPos = 40 + firmaWidth * i;
    doc.text(f.label, xPos, firmaY);
    doc.moveTo(xPos, firmaY + 35).lineTo(xPos + firmaWidth - 30, firmaY + 35).stroke();
    doc.text(f.nombre, xPos, firmaY + 45, { width: firmaWidth - 30, align: "center" });
    doc.fontSize(8).text(f.puesto, xPos, firmaY + 58, {
      width: firmaWidth - 30,
      align: "center",
    });
    doc.fontSize(9);
  });

  doc.end();
};