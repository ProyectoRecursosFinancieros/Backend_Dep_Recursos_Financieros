import { Router } from "express";
import * as presupuestoController from "../controllers/presupuestoAnual.controller";
import * as maestroController from "../controllers/presupuestoMaestro.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

// Middleware de debug (puedes dejarlo)
router.use((req, res, next) => {
  console.log(`🔍 [PRESUPUESTO ROUTER] ${req.method} ${req.originalUrl} -> path: ${req.path}`);
  next();
});

// ========================
// RUTAS ESPECÍFICAS PRIMERO (¡orden es clave!)
// ========================
router.get("/maestro", maestroController.obtenerMaestro);           // ← esta debe ir ANTES de /:id

router.get("/area/:areaId", presupuestoController.obtenerPresupuestosPorArea);

// ========================
// RUTAS DINÁMICAS DESPUÉS
// ========================
router.get("/:id", presupuestoController.obtenerPresupuestoPorId);

router.post(
  "/",
  authorizeRoles("ADMIN", "PRESUPUESTO"),
  presupuestoController.crearPresupuesto
);

router.get("/", presupuestoController.obtenerPresupuestos);

router.patch(
  "/:id",
  authorizeRoles("ADMIN", "PRESUPUESTO"),
  presupuestoController.actualizarMontoAprobado
);

export default router;