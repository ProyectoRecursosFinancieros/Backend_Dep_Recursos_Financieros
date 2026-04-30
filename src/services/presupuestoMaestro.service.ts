import { PresupuestoAnual } from "../models/PresupuestoAnual";
import { Area } from "../models/Area";
import { PartidaPresupuestal } from "../models/PartidaPresupuestal";

export const generarPresupuestoMaestro = async (anio: number) => {
    const presupuestos = await PresupuestoAnual.findAll({
        where: { anio },
        include: [Area, PartidaPresupuestal],
<<<<<<< HEAD
        order: [
            ["mes", "ASC"],
            ["areaId", "ASC"],
            ["partidaId", "ASC"],
        ],
    });

    let totalAprobado = 0;
    let totalEjercido = 0;

=======
    });

    // Totales generales
    let totalAprobado = 0;
    let totalEjercido = 0;

    // Array para el detalle que el frontend mostrará en la tabla
>>>>>>> b5e5bbf39d5a5ae50b88e6c49f0659594491b517
    const detalle: any[] = [];

    presupuestos.forEach((p) => {
        const aprobado = Number(p.montoAprobado);
        const ejercido = Number(p.montoEjercido);
        const disponible = aprobado - ejercido;
        const porcentaje = aprobado > 0 ? ((ejercido / aprobado) * 100).toFixed(1) : "0.0";

        totalAprobado += aprobado;
        totalEjercido += ejercido;

        detalle.push({
<<<<<<< HEAD
            mes: Number(p.mes),
            capitulo: p.capitulo || "Sin capítulo",
            area: p.area.nombre,
            partida: p.partida.nombre,
            aprobado,
            ejercido,
            disponible,
            porcentaje,
=======
            area: p.area.nombre,
            partida: p.partida.nombre,
            aprobado: aprobado,
            ejercido: ejercido,
            disponible: disponible,
            porcentaje: porcentaje,
>>>>>>> b5e5bbf39d5a5ae50b88e6c49f0659594491b517
        });
    });

    const totalDisponible = totalAprobado - totalEjercido;

<<<<<<< HEAD
=======
    // Estructura exacta que espera el frontend
>>>>>>> b5e5bbf39d5a5ae50b88e6c49f0659594491b517
    return {
        totalAprobado,
        totalEjercido,
        totalDisponible,
        detalle,
    };
<<<<<<< HEAD
=======
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
>>>>>>> b5e5bbf39d5a5ae50b88e6c49f0659594491b517
};