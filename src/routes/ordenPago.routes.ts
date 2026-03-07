import { Router } from "express";
import { crearOrdenPago } from "../controllers/ordenPago.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.post(
  "/:ordenCompraId",
  authenticate,
  authorizeRoles("ADMIN", "PRESUPUESTO", "PLANEACION"),
  crearOrdenPago,
);

export default router;
