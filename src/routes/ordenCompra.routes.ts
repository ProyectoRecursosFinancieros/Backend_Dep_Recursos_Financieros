import { Router } from "express";
import {
  generarOrdenCompra,
  listarOrdenesCompra,
} from "../controllers/ordenCompra.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.post(
  "/generar/:requisicionId",
  authenticate,
  authorizeRoles("ADMIN", "MATERIALES"),
  generarOrdenCompra,
);

router.get(
  "/",
  authenticate,
  authorizeRoles("ADMIN", "MATERIALES", "PRESUPUESTO", "PLANEACION"),
  listarOrdenesCompra,
);

export default router;