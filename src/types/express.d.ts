import { Usuario } from "../models/Usuario";

declare global {
  namespace Express {
    interface Request {
      user?: Usuario;
    }
  }
}
