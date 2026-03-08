import { Router } from "express";
import * as solicitudController from "../controllers/solicitud.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "AREA"),
  solicitudController.crearSolicitud
);

router.get("/", solicitudController.obtenerSolicitudes);

router.get("/:id", solicitudController.obtenerSolicitudPorId);

router.patch(
  "/:id/enviar",
  authorizeRoles("ADMIN", "AREA"),
  solicitudController.enviarSolicitud
);

router.patch(
  "/:id/autorizar",
  authorizeRoles("ADMIN", "PLANEACION"),
  solicitudController.autorizarSolicitud
);

router.patch(
  "/:id/rechazar",
  authorizeRoles("ADMIN", "PLANEACION"),
  solicitudController.rechazarSolicitud
);

export default router;