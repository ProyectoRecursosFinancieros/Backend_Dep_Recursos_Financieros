import { Router } from "express";
import * as areaController from "../controllers/area.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate);

router.post("/", authorizeRoles("ADMIN"), areaController.crearArea);
router.get("/", areaController.obtenerAreas);
router.patch("/:id", authorizeRoles("ADMIN"), areaController.actualizarArea);

export default router;