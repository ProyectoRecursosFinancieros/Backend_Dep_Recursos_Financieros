import { Router } from "express";
import {
  autorizar,
  cancelar,
  crear,
  listar,
  obtenerPorId,
  generarPDF,
} from "../controllers/requisicion.controller";

import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

router.get("/", listar);
router.get("/:id", obtenerPorId);

router.post("/:id/pdf", generarPDF);

// ✅ MODIFICADO: se agregó "AREA" para que los usuarios de área puedan crear requisiciones
router.post("/", authorizeRoles("ADMIN", "MATERIALES", "PLANEACION", "AREA"), crear);

router.patch("/:id/autorizar", authorizeRoles("ADMIN", "PRESUPUESTO"), autorizar);

router.patch("/:id/cancelar", authorizeRoles("ADMIN"), cancelar);

export default router;