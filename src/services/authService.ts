// authService.ts
import { UserLevel, AuthResponse } from '../interfaces/niveles';
import jwt from 'jsonwebtoken';
import { tokenBlacklistManager } from '../tokenBlacklistTest'
import bcrypt from 'bcrypt';
import { Request } from 'express';
import { UserRepository } from '../repository/UserRepository';
import { db } from "../config/db"

class AuthService {
  private userRepository: UserRepository;

  // 2. Usamos un constructor
  constructor() {
    this.userRepository = new UserRepository(db);
  }
  

  public async login(username: string, passwordPlain: string): Promise<AuthResponse> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);

    if (!isPasswordValid) {
      return { success: false, message: 'Contraseña incorrecta' };
    }

    // Quitamos el password antes de devolver el usuario
    const { passwordHash, ...safeUser } = user;

    // Token
    const token = jwt.sign({...safeUser}, "SECRETO", {expiresIn: "1hr"})


    return {
      success: true,
      message: 'Login exitoso',
      user: safeUser,
      token: token
    };
  }

  /**
   * Verifica si el usuario tiene el nivel mínimo requerido
   */
  public hasAccess(userLevel: UserLevel, requiredLevel: UserLevel): boolean {
    return userLevel >= requiredLevel;
  }

 public logout(token: string): AuthResponse {
    if (!token) {
      return { success: false, message: 'No se proporcionó ningún token' };
    }

    
    tokenBlacklistManager.add(token, 3);

    return { 
      success: true, 
      message: 'Sesión cerrada exitosamente.' 
    };
  }

  public  getDataFromToken(token: string): any {
    const payload = jwt.verify(token, "SECRETO")
    if (!!payload) {
      return payload;
    }
  }
}

export type AuthenticatedRequest = Request & {
  session?: any;
};

export const authService = new AuthService()