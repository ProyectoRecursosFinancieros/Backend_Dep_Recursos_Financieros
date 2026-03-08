import { Router } from "express";
import * as presupuestoController from "../controllers/presupuestoAnual.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "PRESUPUESTO"),
  presupuestoController.crearPresupuesto
);

router.get("/", presupuestoController.obtenerPresupuestos);

router.get("/area/:areaId", presupuestoController.obtenerPresupuestosPorArea);

router.get("/:id", presupuestoController.obtenerPresupuestoPorId);

router.patch(
  "/:id",
  authorizeRoles("ADMIN", "PRESUPUESTO"),
  presupuestoController.actualizarMontoAprobado
);

export default router;