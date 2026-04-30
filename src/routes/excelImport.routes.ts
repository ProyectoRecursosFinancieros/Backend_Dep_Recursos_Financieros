import { Router } from "express";
import multer from "multer";
import * as excelController from "../controllers/excelImport.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post(
<<<<<<< HEAD
=======
    "/partidas",
    authorizeRoles("ADMIN", "PRESUPUESTO"),
    upload.single("archivo"),
    excelController.importarPartidas
);

router.post(
    "/proveedores",
    authorizeRoles("ADMIN", "MATERIALES"),
    upload.single("archivo"),
    excelController.importarProveedores
);

router.post(
>>>>>>> b5e5bbf39d5a5ae50b88e6c49f0659594491b517
    "/presupuesto",
    authorizeRoles("ADMIN", "PRESUPUESTO"),
    upload.single("archivo"),
    excelController.importarPresupuesto
);

export default router;