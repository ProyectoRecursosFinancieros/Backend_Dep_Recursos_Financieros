import { jsPDF } from 'jspdf';
import { applyPlugin } from 'jspdf-autotable'
import { writeFile } from 'fs/promises';

applyPlugin(jsPDF)

async function crearPdf() {
  // 1. Instanciar jsPDF con el tamaño de página original
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [612, 1150]
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 50;
  const tableWidth = pageWidth - (margin * 2);

  // En jsPDF el eje Y empieza desde arriba hacia abajo.
  let currentY = 50;

  // --- 1. ENCABEZADO ---
  const drawCentered = (text, size, fontStyle, y, underline = false) => {
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(size);
    doc.text(text, pageWidth / 2, y, { align: "center" });
    
    if (underline) {
      const textWidth = doc.getTextWidth(text);
      const startX = (pageWidth - textWidth) / 2;
      doc.setLineWidth(1);
      doc.line(startX, y + 2, startX + textWidth, y + 2);
    }
  };

  drawCentered("UNIVERSIDAD TECNOLÓGICA DE CANCÚN", 10, "bold", currentY, true);
  currentY += 15;
  drawCentered("ORGANISMO PÚBLICO DESCENTRALIZADO DEL GOBIERNO DEL ESTADO DE QUINTANA ROO", 7, "normal", currentY);
  currentY += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text("AÑO: 2020", pageWidth - margin, currentY, { align: "right" });
  currentY += 15;
  drawCentered("SOLICITUD DE ADQUISICIÓN DE UN BIEN O SERVICIO (CPR-P01-F01)", 7, "normal", currentY);
  currentY += 25; // Espacio antes de la primera tabla

  // --- CONFIGURACIÓN GLOBAL PARA LAS TABLAS ---
  const headerColor = [204, 204, 204]; // rgb(0.8, 0.8, 0.8)
  const commonTableConfig = {
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: { 
      font: 'helvetica', fontSize: 7, textColor: 0, 
      lineColor: 0, lineWidth: 0.8, halign: 'center', valign: 'middle' 
    }
  };

  // --- TABLA 1: FOLIO ---
  doc.autoTable({
    ...commonTableConfig,
    startY: currentY,
    columnStyles: {
      0: { cellWidth: tableWidth * 0.5 },
      1: { cellWidth: tableWidth * 0.25 },
      2: { cellWidth: tableWidth * 0.25 }
    },
    body: [
      [
        { content: 'NÚMERO DE SOLICITUD', rowSpan: 2, styles: { fillColor: headerColor, fontStyle: 'bold', fontSize: 8 } },
        { content: 'NÚMERO DE SOLICITUD', colSpan: 2, styles: { fillColor: headerColor, fontStyle: 'bold' } }
      ],
      [
        { content: 'REC/OCEI/002/2020', colSpan: 2 }
      ],
      [
        { content: 'DESPACHO DE LA RECTORIA', rowSpan: 2 },
        { content: 'CLAVE', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'FECHA', styles: { fillColor: headerColor, fontStyle: 'bold' } }
      ],
      [
        { content: '' },
        { content: '03/04/2026' }
      ]
    ]
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // --- TABLA 2: COMPONENTE ---
  doc.autoTable({
    ...commonTableConfig,
    startY: currentY,
    columnStyles: {
      0: { cellWidth: tableWidth * 0.2 },
      1: { cellWidth: tableWidth * 0.2 },
      2: { cellWidth: tableWidth * 0.6 }
    },
    body: [
      [
        { content: 'CLAVE COMP.', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'FINANZ.', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'NOMBRE DEL COMPONENTE (2020)', styles: { fillColor: headerColor, fontStyle: 'bold', fontSize: 8 } }
      ],
      [
        { content: 'RECM001T2C1', styles: { minCellHeight: 25 } },
        { content: 'FEDERAL' },
        { content: 'Realización de trámites administrativos para la gestión de recursos financieros.' }
      ],
      [
        { content: 'ACTIVIDAD (VER CATÁLOGO DE ACTIVIDADES 2020)', colSpan: 3, styles: { fillColor: headerColor, fontStyle: 'bold' } }
      ],
      [
        { content: 'C01.A01-Asistencia a las áreas sustantivas mediante la gestión oportuna de los recursos materiales.', colSpan: 3, styles: { halign: 'left', minCellHeight: 25 } }
      ]
    ]
  });
  currentY = doc.lastAutoTable.finalY + 15;

  // --- TABLA 3: PROYECTO ---
  doc.autoTable({
    ...commonTableConfig,
    startY: currentY,
    columnStyles: {
      0: { cellWidth: tableWidth * 0.25 },
      1: { cellWidth: tableWidth * 0.25 },
      2: { cellWidth: tableWidth * 0.25 },
      3: { cellWidth: tableWidth * 0.25 }
    },
    body: [
      [
        { content: 'CLAVE DEL PROYECTO', colSpan: 1, styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'NOMBRE DEL PROYECTO', colSpan: 3, styles: { fillColor: headerColor, fontStyle: 'bold' } }
      ],
      [
        { content: '', colSpan: 1, styles: { minCellHeight: 20 } },
        { content: '', colSpan: 3 }
      ],
      [
        { content: 'RESPONSABLE DEL PROYECTO', colSpan: 3, styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'FIRMA', colSpan: 1, styles: { fillColor: headerColor, fontStyle: 'bold' } }
      ],
      [
        { content: 'LIC RAMON FCO CONRADO MOGUEL', colSpan: 3, styles: { minCellHeight: 25 } },
        { content: '', colSpan: 1 }
      ],
      [
        { content: 'ACTIVIDAD DEL PROYECTO', colSpan: 4, styles: { fillColor: headerColor, fontStyle: 'bold' } }
      ],
      [
        { content: 'C01.A01-Asistencia a las áreas sustantivas administrativas,jurídicas,de planeación,relaciones públicas u otras funciones de staff.(RECTORIA Y CONTRALORIA)', colSpan: 4, styles: { halign: 'left', minCellHeight: 35 } }
      ]
    ]
  });
  currentY = doc.lastAutoTable.finalY + 20;

  // --- TABLA 4: BIENES ---
  doc.autoTable({
    ...commonTableConfig,
    startY: currentY,
    columnStyles: {
      0: { cellWidth: tableWidth * 0.05 },
      1: { cellWidth: tableWidth * 0.10 },
      2: { cellWidth: tableWidth * 0.08 },
      3: { cellWidth: tableWidth * 0.08 },
      4: { cellWidth: tableWidth * 0.40 },
      5: { cellWidth: tableWidth * 0.10 },
      6: { cellWidth: tableWidth * 0.10 },
      7: { cellWidth: tableWidth * 0.09 }
    },
    body: [
      [
        { content: 'BIEN(ES) O SERVICIO(S) SOLICITADO(S)', colSpan: 8, styles: { fillColor: headerColor, fontStyle: 'bold', fontSize: 8 } }
      ],
      [
        { content: 'PROG.', styles: { fillColor: headerColor, fontStyle: 'bold', fontSize: 6 } },
        { content: 'PART.', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'CANT.', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'UNID.', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'CONCEPTO', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'UNIT.', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'COTIZ.', styles: { fillColor: headerColor, fontStyle: 'bold' } },
        { content: 'IMP.', styles: { fillColor: headerColor, fontStyle: 'bold' } }
      ],
      [
        '1', '37201', '1', 'PZA',
        { content: 'BOLETO DE AVIÓN RUTA CANCÚN-MÉXICO-CANCÚN PARA ASISTIR A LA REUNIÓN DE TRABAJO EN LA CIUDAD DE MÉXICO EL DÍA 15 DE MAYO.', styles: { halign: 'left' } },
        { content: '$ 516.00', styles: { halign: 'right' } },
        { content: '$ 1,032.00', styles: { halign: 'right' } },
        { content: '$ 1,032.00', styles: { halign: 'right' } }
      ]
    ]
  });

  // --- TOTALES ---
  // Se imprimen manualmente bajo la tabla para mantener la estructura original
  // de una "caja limpia" al final, sin las líneas de la cuadrícula en las filas vacías.
  let finalY = doc.lastAutoTable.finalY;
  const colW4_7 = tableWidth * 0.09;

  const drawT = (label, value, yOffset) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    const labelW = doc.getTextWidth(label);
    doc.text(label, margin + tableWidth - colW4_7 - labelW - 10, finalY + yOffset);
    
    doc.setFont("helvetica", "normal");
    const valueW = doc.getTextWidth(value);
    doc.text(value, margin + tableWidth - valueW - 4, finalY + yOffset);
  };

  drawT("SUBTOTAL:", "$ 1,032.00", 12);
  drawT("IVA:", "$ 0.00", 24);
  drawT("TOTAL:", "$ 1,032.00", 36);

  // Recuadro exterior para envolver los totales
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.rect(margin, finalY, tableWidth, 42); 

  // --- GUARDADO ---
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  await writeFile('solicitud_jspdf_autotable.pdf', pdfBuffer);
  console.log('PDF generado con éxito usando jsPDF y AutoTable.');
}

crearPdf().catch(console.error);