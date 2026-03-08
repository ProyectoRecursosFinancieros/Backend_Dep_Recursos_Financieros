import { Router } from "express";
import * as proveedorController from "../controllers/proveedor.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeRoles("ADMIN", "MATERIALES"),
  proveedorController.crearProveedor
);

router.get("/", proveedorController.obtenerProveedores);

router.get("/inactivos", proveedorController.obtenerProveedoresInactivos);

router.get("/:id", proveedorController.obtenerProveedorPorId);

router.patch(
  "/:id",
  authorizeRoles("ADMIN", "MATERIALES"),
  proveedorController.actualizarProveedor
);

router.patch(
  "/:id/desactivar",
  authorizeRoles("ADMIN"),
  proveedorController.desactivarProveedor
);

router.patch(
  "/:id/reactivar",
  authorizeRoles("ADMIN"),
  proveedorController.reactivarProveedor
);

export default router;