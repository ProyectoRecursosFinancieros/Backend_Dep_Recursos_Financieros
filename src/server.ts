import express from "express";
import { connectDatabase } from "./config";
import requisicionRoutes from "./routes/requisicion.routes";
import authRoutes from "./routes/auth.routes";
import ordenCompraRoutes from "./routes/ordenCompra.routes";
import ordenPagoRoutes from "./routes/ordenPago.routes";
import proveedorRoutes from "./routes/proveedor.routes";

const server = express();

connectDatabase();

server.use(express.json());

server.use("/api/auth", authRoutes);
server.use("/api/requisiciones", requisicionRoutes);
server.use("/api/ordenes-compra", ordenCompraRoutes);
server.use("/api/ordenes-pago", ordenPagoRoutes);
server.use("/api/proveedores", proveedorRoutes);

export default server;
