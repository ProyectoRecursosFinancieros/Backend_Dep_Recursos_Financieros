import express from "express";
import { connectDatabase } from "./config";
import requisicionRoutes from "./routes/requisicion.routes";
import authRoutes from "./routes/auth.routes";
import ordenCompraRoutes from "./routes/ordenCompra.routes";
import ordenPagoRoutes from "./routes/ordenPago.routes";
import proveedorRoutes from "./routes/proveedor.routes";
import partidaRoutes from "./routes/partidaPresupuestal.routes";
import presupuestoRoutes from "./routes/presupuestoAnual.routes";
import solicitudRoutes from "./routes/solicitud.routes";

const server = express();

connectDatabase();

server.use(express.json());

server.use("/api/auth", authRoutes);
server.use("/api/requisiciones", requisicionRoutes);
server.use("/api/ordenes-compra", ordenCompraRoutes);
server.use("/api/ordenes-pago", ordenPagoRoutes);
server.use("/api/proveedores", proveedorRoutes);
server.use("/api/partidas", partidaRoutes);
server.use("/api/presupuestos", presupuestoRoutes);
server.use("/api/solicitudes", solicitudRoutes);


export default server;
