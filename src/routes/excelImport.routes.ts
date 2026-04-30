import { Router } from "express";
import multer from "multer";
import * as excelController from "../controllers/excelImport.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/authorize.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticate);

router.post(
    "/presupuesto",
    authorizeRoles("ADMIN", "PRESUPUESTO"),
    upload.single("archivo"),
    excelController.importarPresupuesto
);

export default router;