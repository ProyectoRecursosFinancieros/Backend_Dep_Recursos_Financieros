import { PresupuestoAnual } from "../models/PresupuestoAnual";
import { Area } from "../models/Area";
import { PartidaPresupuestal } from "../models/PartidaPresupuestal";

export const generarPresupuestoMaestro = async (anio: number) => {
    const presupuestos = await PresupuestoAnual.findAll({
        where: { anio },
        include: [Area, PartidaPresupuestal],
        order: [
            ["mes", "ASC"],
            ["areaId", "ASC"],
            ["partidaId", "ASC"],
        ],
    });

    let totalAprobado = 0;
    let totalEjercido = 0;

    const detalle: any[] = [];

    presupuestos.forEach((p) => {
        const aprobado = Number(p.montoAprobado);
        const ejercido = Number(p.montoEjercido);
        const disponible = aprobado - ejercido;
        const porcentaje = aprobado > 0 ? ((ejercido / aprobado) * 100).toFixed(1) : "0.0";

        totalAprobado += aprobado;
        totalEjercido += ejercido;

        detalle.push({
            mes: Number(p.mes),
            capitulo: p.capitulo || "Sin capítulo",
            area: p.area.nombre,
            partida: p.partida.nombre,
            aprobado,
            ejercido,
            disponible,
            porcentaje,
        });
    });

    const totalDisponible = totalAprobado - totalEjercido;

    return {
        totalAprobado,
        totalEjercido,
        totalDisponible,
        detalle,
    };
};