import * as XLSX from "xlsx";
import { PartidaPresupuestal } from "../models/PartidaPresupuestal";
import { Area } from "../models/Area";
import { PresupuestoAnual } from "../models/PresupuestoAnual";

const normalize = (value: unknown) =>
    String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const MONTH_MAP: Record<string, number> = {
    enero: 1,
    febrero: 2,
    marzo: 3,
    abril: 4,
    mayo: 5,
    junio: 6,
    julio: 7,
    agosto: 8,
    septiembre: 9,
    octubre: 10,
    noviembre: 11,
    diciembre: 12,
};

const parseMesFromLabel = (value: unknown): number | null => {
    if (typeof value !== "string" || !value.trim()) return null;

    const normalized = normalize(value);

    // Coincidencia exacta
    if (MONTH_MAP[normalized]) return MONTH_MAP[normalized];

    // Limpieza de prefijos numéricos ("1. ENERO", "10 - OCTUBRE", etc.)
    const clean = normalized.replace(/^\d+[\.\-\s]+/, "").trim();
    if (MONTH_MAP[clean]) return MONTH_MAP[clean];

    // Coincidencia parcial (muy tolerante)
    for (const [mesName, mesNum] of Object.entries(MONTH_MAP)) {
        if (normalized.includes(mesName)) {
            return mesNum;
        }
    }

    return null;
};

const isMonthSeparator = (row: any[]): number | null => {
    if (!row || row.length === 0) return null;

    const firstCell = String(row[0] ?? "").trim();
    if (!firstCell) return null;

    const mes = parseMesFromLabel(firstCell);
    if (mes === null) return null;

    // Excluir filas de subtotal y totales
    const firstNorm = normalize(firstCell);
    if (firstNorm.startsWith("subtotal") || firstNorm === "totales") {
        return null;
    }

    // Tolerancia a "ruido" en celdas fusionadas o con formato
    const nonEmptyAfterFirst = row.slice(1).filter((v) => {
        const str = String(v ?? "").trim();
        return str !== "" && !/^[\d\.\,]+$/.test(str); // ignoramos números puros
    }).length;

    // Si hay más de 2 celdas con contenido → probablemente no es separador de mes
    if (nonEmptyAfterFirst > 2) return null;

    return mes;
};

const isSubtotalOrTotal = (row: any[]): boolean => {
    const firstCell = normalize(row[0] ?? "");
    return firstCell.startsWith("subtotal") || firstCell === "totales";
};

export const importarPresupuestoDesdeExcel = async (fileBuffer: Buffer, anio: number) => {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
        throw new Error("El archivo Excel no contiene hojas");
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rawRows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "" });

    if (!rawRows.length) {
        throw new Error("El archivo Excel está vacío");
    }

    // Encontrar la fila de encabezados
    let headerRowIndex = -1;
    let colIndex: Record<string, number> = {};

    for (let i = 0; i < rawRows.length; i++) {
        const normalized = rawRows[i].map((h: any) => normalize(String(h)));
        if (normalized.includes("capitulo")) {
            headerRowIndex = i;
            normalized.forEach((col: string, idx: number) => {
                colIndex[col] = idx;
            });
            break;
        }
    }

    if (headerRowIndex === -1) {
        throw new Error(
            "No se encontró la fila de encabezados. " +
            "Columnas esperadas: Capítulo, Área, Partida, Aprobado, Ejercido, Disponible"
        );
    }

    const required = ["capitulo", "area", "partida", "aprobado", "ejercido"];
    const missing = required.filter((col) => !(col in colIndex));
    if (missing.length > 0) {
        throw new Error(
            `Faltan columnas obligatorias: ${missing.join(", ")}. ` +
            `Columnas esperadas: Capítulo, Área, Partida, Aprobado, Ejercido, Disponible`
        );
    }

    const get = (row: any[], col: string) => row[colIndex[col]] ?? "";

    let currentMes: number | null = null;
    let importados = 0;

    for (let i = headerRowIndex + 1; i < rawRows.length; i++) {
        const row = rawRows[i];
        const excelRow = i + 1;

        if (row.every((v: any) => v === "" || v === null || v === undefined)) {
            continue;
        }

        // Detectar separador de mes (más robusto)
        const mes = isMonthSeparator(row);
        if (mes !== null) {
            currentMes = mes;
            continue;
        }

        // Saltar subtotales y totales
        if (isSubtotalOrTotal(row)) {
            continue;
        }

        // Procesar fila de datos
        const capitulo = String(get(row, "capitulo")).trim();
        const areaNombre = String(get(row, "area")).trim();
        const partidaNombre = String(get(row, "partida")).trim();
        const montoAprobado = Number(get(row, "aprobado"));
        const montoEjercido = Number(get(row, "ejercido") || 0);

        if (!capitulo) {
            throw new Error(`La fila ${excelRow} no tiene Capítulo`);
        }
        if (!areaNombre) {
            throw new Error(`La fila ${excelRow} no tiene Área`);
        }
        if (!partidaNombre) {
            throw new Error(`La fila ${excelRow} no tiene Partida`);
        }
        if (!Number.isFinite(montoAprobado) || montoAprobado <= 0) {
            throw new Error(`La fila ${excelRow} tiene un Aprobado inválido`);
        }
        if (!Number.isFinite(montoEjercido) || montoEjercido < 0) {
            throw new Error(`La fila ${excelRow} tiene un Ejercido inválido`);
        }
        if (!currentMes) {
            throw new Error(
                `La fila ${excelRow} tiene datos pero no hay un mes asignado antes de ella. ` +
                `Asegúrate de que haya una fila con el nombre del mes (Ej: OCTUBRE) antes de los datos.`
            );
        }

        let area = await Area.findOne({ where: { nombre: areaNombre } });
        if (!area) {
            area = await Area.create({ nombre: areaNombre });
        }

        let partida = await PartidaPresupuestal.findOne({ where: { nombre: partidaNombre } });
        if (!partida) {
            partida = await PartidaPresupuestal.create({
                codigo: `P${Date.now().toString().slice(-4)}`,
                nombre: partidaNombre,
                activa: true,
            });
        }

        await PresupuestoAnual.upsert({
            anio,
            mes: currentMes,
            capitulo,
            areaId: area.id,
            partidaId: partida.id,
            montoAprobado,
            montoEjercido,
        });

        importados++;
    }

    return {
        mensaje: `${importados} registros de presupuesto importados/actualizados para el año ${anio}`,
        totalProcesados: importados,
    };
};