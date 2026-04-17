import express from "express";
import cookieParser from 'cookie-parser'
import { connectDatabase } from "./config";
import cors from 'cors';
import {authService, AuthenticatedRequest} from "./services/authService"
import { requisicionController } from "./controllers/requisicion.controller";
import { solicitudController } from "./controllers/solicitud.controller";
import { proveedorController } from "./controllers/proveedor.controller";
import { presupuestoAnualController } from "./controllers/presupuestoAnual.controller";
import { partidaPresupuestalController } from "./controllers/partidaPresupuestal.controller";
import { ordenCompraController } from "./controllers/ordenCompra.controller";
import { ordenPagoController } from "./controllers/ordenPago.controller";
import { pdfController } from "./controllers/pdf.controller";

const server = express();

connectDatabase();
server.use(cors({
    origin: 'http://localhost:3000', // El URL del FRONTEND 
    credentials: true                // Permite el intercambio de cookies
}));
server.use(express.json());
server.use(cookieParser());

server.use((req: AuthenticatedRequest, res, next) => {
  const token = req.cookies.access_token
  req.session = {user: null};
  (req as any).user = null;
  try {
    const data = authService.getDataFromToken(token)
    req.session.user = data
    (req as any).user = data
  } catch (error) {
    req.session.user = null
  }
  next()
})

server.post('/login', async (req, res) => {
  const { username, password } = req.body
  try {
    const {user, token, success, message} = await authService.login(username, password)
    if(success)
        res
        .cookie('access_token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60
        })
        .status(200).send({ user, token })
    else
        res.status(401).send({ error: message })
  } catch (error) {
    console.log(error)
    res.status(500).send({ error: "Internal Server Error" })
  }
})

server.post('/logout', (req, res) => {
  res
    .clearCookie('access_token')
    .json({ message: 'Logout successful' })
})

//ruta de pruebas
server.get('/rol', (req: AuthenticatedRequest, res) => {
  const { user } = req.session
  if (!user) return res.status(403).send('Access not authorized')
  res.status(200).send('protected - level: ' + user.level)
})

// Rutas de Requisiciones
server.post('/api/requisiciones', (req, res) => requisicionController.crear(req as any, res));
server.get('/api/requisiciones', (req, res) => requisicionController.listar(req as any, res));
server.get('/api/requisiciones/:id', (req, res) => requisicionController.obtenerPorId(req as any, res));
server.patch('/api/requisiciones/:id/autorizar', (req, res) => requisicionController.autorizar(req as any, res));
server.patch('/api/requisiciones/:id/cancelar', (req, res) => requisicionController.cancelar(req as any, res));

// Rutas de Solicitudes
server.post('/api/solicitudes', (req, res) => solicitudController.crearSolicitud(req as any, res));
server.get('/api/solicitudes', (req, res) => solicitudController.obtenerSolicitudes(req as any, res));
server.get('/api/solicitudes/:id', (req, res) => solicitudController.obtenerSolicitudPorId(req as any, res));
server.patch('/api/solicitudes/:id/enviar', (req, res) => solicitudController.enviarSolicitud(req as any, res));
server.patch('/api/solicitudes/:id/autorizar', (req, res) => solicitudController.autorizarSolicitud(req as any, res));
server.patch('/api/solicitudes/:id/rechazar', (req, res) => solicitudController.rechazarSolicitud(req as any, res));

// Rutas de Proveedores
server.post('/api/proveedores', (req, res) => proveedorController.crearProveedor(req, res));
server.get('/api/proveedores', (req, res) => proveedorController.obtenerProveedores(req, res));
server.get('/api/proveedores/inactivos', (req, res) => proveedorController.obtenerProveedoresInactivos(req, res));
server.get('/api/proveedores/:id', (req, res) => proveedorController.obtenerProveedorPorId(req, res));
server.patch('/api/proveedores/:id', (req, res) => proveedorController.actualizarProveedor(req, res));
server.patch('/api/proveedores/:id/desactivar', (req, res) => proveedorController.desactivarProveedor(req, res));
server.patch('/api/proveedores/:id/reactivar', (req, res) => proveedorController.reactivarProveedor(req, res));

// Rutas de Presupuestos Anuales
server.post('/api/presupuestos', (req, res) => presupuestoAnualController.crearPresupuesto(req, res));
server.get('/api/presupuestos', (req, res) => presupuestoAnualController.obtenerPresupuestos(req, res));
server.get('/api/presupuestos/:id', (req, res) => presupuestoAnualController.obtenerPresupuestoPorId(req, res));
server.get('/api/presupuestos/area/:areaId', (req, res) => presupuestoAnualController.obtenerPresupuestosPorArea(req, res));
server.get('/api/presupuestos/anio/:anio', (req, res) => presupuestoAnualController.obtenerPresupuestosPorAnio(req, res));
server.patch('/api/presupuestos/:id', (req, res) => presupuestoAnualController.actualizarPresupuesto(req, res));
server.patch('/api/presupuestos/:id/monto-aprobado', (req, res) => presupuestoAnualController.actualizarMontoAprobado(req, res));
server.get('/api/presupuestos/:id/saldo', (req, res) => presupuestoAnualController.obtenerSaldoDisponible(req, res));

// Rutas de Partidas Presupuestales
server.post('/api/partidas', (req, res) => partidaPresupuestalController.crearPartida(req, res));
server.get('/api/partidas', (req, res) => partidaPresupuestalController.obtenerPartidas(req, res));
server.get('/api/partidas/inactivas', (req, res) => partidaPresupuestalController.obtenerPartidasInactivas(req, res));
server.get('/api/partidas/:id', (req, res) => partidaPresupuestalController.obtenerPartidaPorId(req, res));
server.patch('/api/partidas/:id', (req, res) => partidaPresupuestalController.actualizarPartida(req, res));
server.patch('/api/partidas/:id/desactivar', (req, res) => partidaPresupuestalController.desactivarPartida(req, res));
server.patch('/api/partidas/:id/reactivar', (req, res) => partidaPresupuestalController.reactivarPartida(req, res));

// Rutas de Ordenes de Compra
server.post('/api/ordenes-compra/requisicion/:requisicionId', (req, res) => ordenCompraController.generarOrdenCompra(req, res));
server.get('/api/ordenes-compra', (req, res) => ordenCompraController.listarOrdenesCompra(req, res));
server.get('/api/ordenes-compra/:id', (req, res) => ordenCompraController.obtenerOrdenCompraPorId(req, res));
server.get('/api/ordenes-compra/requisicion/:requisicionId', (req, res) => ordenCompraController.obtenerPorRequisicion(req, res));

// Rutas de Ordenes de Pago
server.post('/api/ordenes-pago/orden-compra/:ordenCompraId', (req, res) => ordenPagoController.generarOrdenPago(req as any, res));
server.get('/api/ordenes-pago', (req, res) => ordenPagoController.obtenerOrdenesPago(req as any, res));
server.get('/api/ordenes-pago/:id', (req, res) => ordenPagoController.obtenerOrdenPagoPorId(req as any, res));
server.get('/api/ordenes-pago/orden-compra/:ordenCompraId', (req, res) => ordenPagoController.obtenerOrdenPagoPorOrdenCompra(req as any, res));
server.patch('/api/ordenes-pago/:id/pagar', (req, res) => ordenPagoController.marcarPagado(req as any, res));
server.patch('/api/ordenes-pago/:id/cancelar', (req, res) => ordenPagoController.cancelarOrdenPago(req as any, res));

// Rutas de PDF
server.post('/api/pdf/solicitud', (req, res) => pdfController.generarSolicitud(req, res));
server.get('/api/pdf/solicitud/ejemplo', (req, res) => pdfController.generarConDatosGenericos(req, res));

export default server;
