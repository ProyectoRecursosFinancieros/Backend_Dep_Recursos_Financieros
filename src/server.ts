import express from "express";
import cors from "cors";
import { connectDatabase } from "./config/db";

// ← Rutas existentes
import authRoutes from "./routes/auth.routes";
import solicitudRoutes from "./routes/solicitud.routes";
import requisicionRoutes from "./routes/requisicion.routes";
import ordenCompraRoutes from "./routes/ordenCompra.routes";
import ordenPagoRoutes from "./routes/ordenPago.routes";
import proveedorRoutes from "./routes/proveedor.routes";
import partidaRoutes from "./routes/partidaPresupuestal.routes";
import presupuestoRoutes from "./routes/presupuestoAnual.routes";
import excelImportRoutes from "./routes/excelImport.routes";

// ← NUEVAS RUTAS
import usuarioRoutes from "./routes/usuario.routes";
import areaRoutes from "./routes/area.routes";

const server = express();

server.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

connectDatabase();
server.use(express.json());

// Rutas
server.use("/api/auth", authRoutes);
server.use("/api/solicitudes", solicitudRoutes);
server.use("/api/requisiciones", requisicionRoutes);
server.use("/api/ordenes-compra", ordenCompraRoutes);
server.use("/api/ordenes-pago", ordenPagoRoutes);
server.use("/api/proveedores", proveedorRoutes);
server.use("/api/partidas", partidaRoutes);
server.use("/api/presupuestos", presupuestoRoutes);
server.use("/api/importar", excelImportRoutes);

// ← NUEVAS RUTAS AGREGADAS
server.use("/api/usuarios", usuarioRoutes);
server.use("/api/areas", areaRoutes);

export default server;