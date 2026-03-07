import { Router } from "express";
import { autorizar, cancelar } from "../controllers/requisicion.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.patch(
  "/:id/autorizar",
  authenticate,
  authorizeRoles("ADMIN", "PRESUPUESTO"),
  autorizar,
);

router.patch("/:id/cancelar", authenticate, authorizeRoles("ADMIN"), cancelar);

export default router;
