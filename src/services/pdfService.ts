import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface DetalleSolicitudPDF {
  numero: number;
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  monto: number;
}

export interface DatosSolicitudPDF {
  numeroSolicitud: string;
  fecha: string;
  solicitante: string;
  departamento: string;
  area: string;
  justificacion: string;
  partidaPresupuestal: string;
  observaciones?: string;
  detalles: DetalleSolicitudPDF[];
  subtotal: number;
  iva: number;
  total: number;
  nombreVoBo?: string;
  nombreAutorizo?: string;
  nombreResguardo?: string;
}

export interface GenerarPdfResult {
  success: boolean;
  message: string;
  pdfBytes?: Uint8Array;
  filePath?: string;
}

export class PdfService {
  private outputPath: string;

  constructor() {
    this.outputPath = path.join(process.cwd(), 'recursos', 'generados');
  }

  public generarSolicitud(datos: DatosSolicitudPDF): GenerarPdfResult {
    try {
      const pdfBytes = this.crearPdf(datos);
      return {
        success: true,
        message: 'PDF generado exitosamente',
        pdfBytes,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al generar PDF',
      };
    }
  }

  public async guardarPdf(datos: DatosSolicitudPDF, nombreArchivo?: string): Promise<GenerarPdfResult> {
    try {
      await fs.mkdir(this.outputPath, { recursive: true });

      const pdfBytes = this.crearPdf(datos);
      const archivo = nombreArchivo || `solicitud_${Date.now()}.pdf`;
      const filePath = path.join(this.outputPath, archivo);

      await fs.writeFile(filePath, pdfBytes);

      return {
        success: true,
        message: 'PDF guardado exitosamente',
        pdfBytes,
        filePath,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al guardar PDF',
      };
    }
  }

  private crearPdf(datos: DatosSolicitudPDF): Uint8Array {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 15;
    const marginRight = pageWidth - 15;

    let y = 20;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('UNIVERSIDAD AUTÓNOMA DE YUCATÁN', pageWidth / 2, y, { align: 'center' });

    y += 6;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Facultad de Ingeniería', pageWidth / 2, y, { align: 'center' });

    y += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('SOLICITUD DE COMPRA', pageWidth / 2, y, { align: 'center' });

    y += 12;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(marginLeft, y - 3, marginRight - marginLeft, 22);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`No. de Solicitud: ${datos.numeroSolicitud}`, marginLeft + 3, y + 3);
    doc.text(`Fecha: ${datos.fecha}`, marginRight - 50, y + 3);

    doc.setFont('helvetica', 'normal');
    y += 10;
    doc.text(`Solicitante: ${datos.solicitante}`, marginLeft + 3, y);
    y += 6;
    doc.text(`Departamento: ${datos.departamento}`, marginLeft + 3, y);
    y += 6;
    doc.text(`Área: ${datos.area}`, marginLeft + 3, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Justificación:', marginLeft, y);
    doc.setFont('helvetica', 'normal');
    y += 6;
    
    const splitJustificacion = doc.splitTextToSize(datos.justificacion, marginRight - marginLeft);
    doc.text(splitJustificacion, marginLeft, y);
    y += splitJustificacion.length * 5 + 4;

    doc.setFont('helvetica', 'normal');
    doc.text(`Partida(s) Presupuestal(es): ${datos.partidaPresupuestal}`, marginLeft, y);

    y += 10;

    const tableData = datos.detalles.map((d) => [
      d.numero.toString(),
      d.descripcion,
      d.cantidad.toString(),
      d.unidad,
      `$${d.precioUnitario.toFixed(2)}`,
      `$${d.monto.toFixed(2)}`,
    ]);

    (doc as any).autoTable({
      startY: y,
      head: [['#', 'Descripción', 'Cant.', 'Unidad', 'P. Unitario', 'Monto']],
      body: tableData,
      margin: { left: marginLeft, right: marginLeft },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'center' },
        1: { cellWidth: 75 },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 30, halign: 'right' },
        5: { cellWidth: 30, halign: 'right' },
      },
      theme: 'grid',
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    const totalsX = pageWidth - 75;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Subtotal:', totalsX, y);
    doc.text(`$${datos.subtotal.toFixed(2)}`, totalsX + 35, y);

    y += 6;
    doc.text('IVA (16%):', totalsX, y);
    doc.text(`$${datos.iva.toFixed(2)}`, totalsX + 35, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', totalsX, y);
    doc.text(`$${datos.total.toFixed(2)}`, totalsX + 35, y);

    if (datos.observaciones) {
      y += 12;
      doc.setFont('helvetica', 'bold');
      doc.text('Observaciones:', marginLeft, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      const splitObs = doc.splitTextToSize(datos.observaciones, marginRight - marginLeft);
      doc.text(splitObs, marginLeft, y);
      y += splitObs.length * 5;
    }

    y += 20;

    const firmaWidth = 50;
    const firmaSpacing = (pageWidth - marginLeft * 2 - firmaWidth * 3) / 2;
    const firmaY = y;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const firma1X = marginLeft;
    doc.line(firma1X, firmaY, firma1X + firmaWidth, firmaY);
    doc.text('Vo. Bo.', firma1X + firmaWidth / 2, firmaY + 4, { align: 'center' });
    if (datos.nombreVoBo) {
      doc.setFontSize(7);
      doc.text(datos.nombreVoBo, firma1X + firmaWidth / 2, firmaY + 9, { align: 'center' });
    }

    const firma2X = marginLeft + firmaWidth + firmaSpacing;
    doc.line(firma2X, firmaY, firma2X + firmaWidth, firmaY);
    doc.setFontSize(8);
    doc.text('Autorizó', firma2X + firmaWidth / 2, firmaY + 4, { align: 'center' });
    if (datos.nombreAutorizo) {
      doc.setFontSize(7);
      doc.text(datos.nombreAutorizo, firma2X + firmaWidth / 2, firmaY + 9, { align: 'center' });
    }

    const firma3X = marginLeft + (firmaWidth + firmaSpacing) * 2;
    doc.line(firma3X, firmaY, firma3X + firmaWidth, firmaY);
    doc.setFontSize(8);
    doc.text('Resguardo', firma3X + firmaWidth / 2, firmaY + 4, { align: 'center' });
    if (datos.nombreResguardo) {
      doc.setFontSize(7);
      doc.text(datos.nombreResguardo, firma3X + firmaWidth / 2, firmaY + 9, { align: 'center' });
    }

    const pdfOutput = doc.output('arraybuffer');
    return new Uint8Array(pdfOutput);
  }

  public generarDatosGenericos(): DatosSolicitudPDF {
    return {
      numeroSolicitud: 'REC.OCEI.001.2024',
      fecha: new Date().toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      solicitante: 'JUAN PÉREZ GARCÍA',
      departamento: 'SUBDIRECCIÓN DE RECURSOS MATERIALES Y SERVICIOS GENERALES',
      area: 'DEPARTAMENTO DE MANTENIMIENTO',
      justificacion: 'Adquisición de refacciones y materiales para mantenimiento preventivo de equipos de cómputo del laboratorio de sistemas',
      partidaPresupuestal: '29601 - Refacciones y Accesorios Menores de Oficina',
      observaciones: 'Entrega inmediata',
      detalles: [
        {
          numero: 1,
          descripcion: 'Cartuchos de tinta HP 60 negro',
          cantidad: 10,
          unidad: 'Pieza',
          precioUnitario: 350.00,
          monto: 3500.00,
        },
        {
          numero: 2,
          descripcion: 'Cartuchos de tinta HP 60 color',
          cantidad: 5,
          unidad: 'Pieza',
          precioUnitario: 420.00,
          monto: 2100.00,
        },
        {
          numero: 3,
          descripcion: 'Cable USB 2.0 tipo A-B 2m',
          cantidad: 15,
          unidad: 'Pieza',
          precioUnitario: 85.50,
          monto: 1282.50,
        },
        {
          numero: 4,
          descripcion: 'Memoria USB 16GB Kingston',
          cantidad: 8,
          unidad: 'Pieza',
          precioUnitario: 180.00,
          monto: 1440.00,
        },
        {
          numero: 5,
          descripcion: 'Mouse óptico USB genérico',
          cantidad: 12,
          unidad: 'Pieza',
          precioUnitario: 150.00,
          monto: 1800.00,
        },
      ],
      subtotal: 10122.50,
      iva: 1619.60,
      total: 11742.10,
      nombreVoBo: 'Ing. María López',
      nombreAutorizo: 'Lic. Carlos Sánchez',
      nombreResguardo: 'C.P. Ana Martínez',
    };
  }
}

export const pdfService = new PdfService();
