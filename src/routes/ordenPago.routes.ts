import { Router } from "express";
import { crearOrdenPago, descargarPDF, listarOrdenesPago } from "../controllers/ordenPago.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.post(
  "/:ordenCompraId",
  authenticate,
  authorizeRoles("ADMIN", "PRESUPUESTO", "PLANEACION"),
  crearOrdenPago
);

router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "PRESUPUESTO", "PLANEACION", "MATERIALES"),
  listarOrdenesPago
);

router.get(
  "/:id/pdf",
  authenticate,
  authorizeRoles("ADMIN", "PRESUPUESTO", "PLANEACION", "MATERIALES"),
  descargarPDF
);

export default router;