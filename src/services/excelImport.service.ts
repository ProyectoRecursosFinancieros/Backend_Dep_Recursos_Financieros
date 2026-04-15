import * as XLSX from "xlsx";
import { PartidaPresupuestal } from "../models/PartidaPresupuestal";
import { Proveedor } from "../models/Proveedor";
import { Area } from "../models/Area";
import { PresupuestoAnual } from "../models/PresupuestoAnual";

// ==================== PARTIDAS (sin cambios) ====================
export const importarPartidasDesdeExcel = async (fileBuffer: Buffer) => {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];
    const partidasCreadas = [];

    for (const row of data) {
        const codigo = String(row["Código"] || row["codigo"] || "").trim();
        const nombre = String(row["Nombre"] || row["nombre"] || "").trim();
        const descripcion = String(row["Descripción"] || row["descripcion"] || "").trim();

        if (!codigo || !nombre) continue;

        const existe = await PartidaPresupuestal.findOne({ where: { codigo } });
        if (existe) continue;

        const partida = await PartidaPresupuestal.create({
            codigo,
            nombre,
            descripcion: descripcion || null,
            activa: true
        });
        partidasCreadas.push(partida);
    }
    return { totalImportadas: partidasCreadas.length, partidas: partidasCreadas };
};

// ==================== PROVEEDORES (sin cambios) ====================
export const importarProveedoresDesdeExcel = async (fileBuffer: Buffer) => {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];
    const proveedoresCreados = [];

    for (const row of data) {
        const nombre = String(row["Nombre"] || row["nombre"] || "").trim();
        const rfc = String(row["RFC"] || row["rfc"] || "").trim();
        const direccion = String(row["Dirección"] || row["direccion"] || "").trim();
        const telefono = String(row["Teléfono"] || row["telefono"] || "").trim();
        const email = String(row["Email"] || row["email"] || "").trim();
        const tipoPersona = String(row["Tipo Persona"] || row["tipoPersona"] || "").toUpperCase() === "MORAL" ? "MORAL" : "FISICA";

        if (!nombre || !rfc) continue;

        const existe = await Proveedor.findOne({ where: { rfc } });
        if (existe) continue;

        const proveedor = await Proveedor.create({
            nombre, rfc,
            direccion: direccion || null,
            telefono: telefono || null,
            email: email || null,
            tipoPersona,
            activo: true
        });
        proveedoresCreados.push(proveedor);
    }
    return { totalImportados: proveedoresCreados.length, proveedores: proveedoresCreados };
};

// ==================== PRESUPUESTO (VERSIÓN CORREGIDA - SIN DUPLICADOS) ====================
export const importarPresupuestoDesdeExcel = async (fileBuffer: Buffer, anio: number) => {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet) as any[];

    let importados = 0;

    for (const row of data) {
        const areaNombre = String(row["Área"] || row["area"] || "").trim();
        const partidaNombre = String(row["Partida"] || row["partida"] || "").trim();
        const montoAprobado = Number(row["Aprobado"] || row["aprobado"] || 0);
        const montoEjercido = Number(row["Ejercido"] || row["ejercido"] || 0);

        if (!areaNombre || !partidaNombre || isNaN(montoAprobado) || montoAprobado <= 0) continue;

        // Buscar o crear Área
        let area = await Area.findOne({ where: { nombre: areaNombre } });
        if (!area) {
            area = await Area.create({ nombre: areaNombre });
        }

        // Buscar o crear Partida
        let partida = await PartidaPresupuestal.findOne({ where: { nombre: partidaNombre } });
        if (!partida) {
            partida = await PartidaPresupuestal.create({
                codigo: `P${Date.now().toString().slice(-4)}`,
                nombre: partidaNombre,
                activa: true
            });
        }

        // === LÓGICA CORRECTA: actualizar si existe, crear si no existe ===
        const existente = await PresupuestoAnual.findOne({
            where: {
                anio,
                areaId: area.id,
                partidaId: partida.id
            }
        });

        if (existente) {
            // Actualizar
            await existente.update({ montoAprobado, montoEjercido });
        } else {
            // Crear nuevo
            await PresupuestoAnual.create({
                anio,
                areaId: area.id,
                partidaId: partida.id,
                montoAprobado,
                montoEjercido
            });
        }

        importados++;
    }

    return {
        mensaje: `${importados} registros de presupuesto importados/actualizados para el año ${anio}`,
        totalProcesados: data.length
    };
};