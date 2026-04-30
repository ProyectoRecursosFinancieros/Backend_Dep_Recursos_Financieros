import { Router } from "express";
import * as usuarioController from "../controllers/usuario.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("ADMIN"), usuarioController.crearUsuario);
router.get("/", usuarioController.obtenerUsuarios);
router.get("/inactivos", usuarioController.obtenerUsuariosInactivos);
router.get("/:id", usuarioController.obtenerUsuarioPorId);
router.patch("/:id", authorizeRoles("ADMIN"), usuarioController.actualizarUsuario);
router.patch("/:id/desactivar", authorizeRoles("ADMIN"), usuarioController.desactivarUsuario);
router.patch("/:id/reactivar", authorizeRoles("ADMIN"), usuarioController.reactivarUsuario);

export default router;