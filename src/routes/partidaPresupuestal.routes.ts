import { Router } from "express";
import * as partidaController from "../controllers/partidaPresupuestal.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "FINANZAS"),
  partidaController.crearPartida
);

router.get("/", partidaController.obtenerPartidas);

router.get("/inactivas", partidaController.obtenerPartidasInactivas);

router.get("/:id", partidaController.obtenerPartidaPorId);

router.patch(
  "/:id",
  authorizeRoles("ADMIN", "FINANZAS"),
  partidaController.actualizarPartida
);

router.patch(
  "/:id/desactivar",
  authorizeRoles("ADMIN"),
  partidaController.desactivarPartida
);

router.patch(
  "/:id/reactivar",
  authorizeRoles("ADMIN"),
  partidaController.reactivarPartida
);

export default router;