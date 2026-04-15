import { PresupuestoAnual } from "../models/PresupuestoAnual";
import { Area } from "../models/Area";
import { PartidaPresupuestal } from "../models/PartidaPresupuestal";

export const generarPresupuestoMaestro = async (anio: number) => {
    const presupuestos = await PresupuestoAnual.findAll({
        where: { anio },
        include: [Area, PartidaPresupuestal],
    });

    // Totales generales
    let totalAprobado = 0;
    let totalEjercido = 0;

    // Array para el detalle que el frontend mostrará en la tabla
    const detalle: any[] = [];

    presupuestos.forEach((p) => {
        const aprobado = Number(p.montoAprobado);
        const ejercido = Number(p.montoEjercido);
        const disponible = aprobado - ejercido;
        const porcentaje = aprobado > 0 ? ((ejercido / aprobado) * 100).toFixed(1) : "0.0";

        totalAprobado += aprobado;
        totalEjercido += ejercido;

        detalle.push({
            area: p.area.nombre,
            partida: p.partida.nombre,
            aprobado: aprobado,
            ejercido: ejercido,
            disponible: disponible,
            porcentaje: porcentaje,
        });
    });

    const totalDisponible = totalAprobado - totalEjercido;

    // Estructura exacta que espera el frontend
    return {
        totalAprobado,
        totalEjercido,
        totalDisponible,
        detalle,
    };
};

export const obtenerDisponiblePorPartidaYMes = async (partidaId: number, anio: number, mes: number) => {
    const presupuestos = await PresupuestoAnual.findAll({
        where: { partidaId, anio },
        include: [Area],
    });

    let totalDisponible = 0;
    presupuestos.forEach((p) => {
        totalDisponible += Number(p.montoAprobado) - Number(p.montoEjercido);
    });
    return totalDisponible;
};