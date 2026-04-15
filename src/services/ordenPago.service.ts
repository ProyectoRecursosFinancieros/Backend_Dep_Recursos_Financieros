import { OrdenPago, EstadoPago } from "../models/OrdenPago";
import { OrdenCompra } from "../models/OrdenCompra";
import { Requisicion } from "../models/Requisicion";
import { Proveedor } from "../models/Proveedor";
import PDFDocument from "pdfkit";
import { Response } from "express";

export const generarOrdenPago = async (ordenCompraId: number, autorizadoPorId: number, monto: number) => {
  const ordenCompra = await OrdenCompra.findByPk(ordenCompraId, {
    include: [{ model: Requisicion }]
  });

  if (!ordenCompra) throw new Error("Orden de compra no encontrada");
  if (!ordenCompra.requisicion) throw new Error("Requisición no asociada");

  const ordenPago = await OrdenPago.create({
    ordenCompraId,
    monto,
    estado: EstadoPago.PENDIENTE,
    autorizadoPorId
  });

  return ordenPago;
};

export const generarPDFOrdenPago = async (ordenPagoId: number, res: Response) => {
  const ordenPago = await OrdenPago.findByPk(ordenPagoId, {
    include: [
      {
        model: OrdenCompra,
        include: [
          { model: Requisicion },
          { model: Proveedor }
        ]
      }
    ]
  });

  if (!ordenPago) throw new Error("Orden de pago no encontrada");

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=OrdenPago_${ordenPago.id}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text("ORDEN DE PAGO", { align: "center" });
  doc.moveDown();
  doc.fontSize(12).text(`Folio: OP-${ordenPago.id}`, { align: "right" });
  doc.text(`Fecha: ${new Date().toLocaleDateString("es-MX")}`);

  doc.moveDown(2);

  const proveedor = ordenPago.ordenCompra.proveedor;
  doc.fontSize(14).text("Proveedor:", { underline: true });
  doc.fontSize(12).text(`Nombre: ${proveedor.nombre}`);
  doc.text(`RFC: ${proveedor.rfc}`);
  if (proveedor.direccion) doc.text(`Dirección: ${proveedor.direccion}`);
  if (proveedor.telefono) doc.text(`Teléfono: ${proveedor.telefono}`);

  doc.moveDown(2);

  doc.fontSize(14).text("Detalle de la Orden de Compra:", { underline: true });
  doc.fontSize(12).text(`Orden de Compra: ${ordenPago.ordenCompra.numeroOrden}`);
  doc.text(`Tipo de contratación: ${ordenPago.ordenCompra.tipoContratacion}`);
  doc.text(`Total a pagar: $${Number(ordenPago.monto).toFixed(2)}`);

  doc.moveDown(3);
  doc.fontSize(16).text(`TOTAL A PAGAR: $${Number(ordenPago.monto).toFixed(2)}`, { align: "center" });

  doc.moveDown(4);
  doc.fontSize(12).text("______________________________", { align: "center" });
  doc.text("Autorizado por", { align: "center" });

  doc.end();
};