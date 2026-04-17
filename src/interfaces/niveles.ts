
// Definimos los 6 niveles jerárquicos
export enum UserLevel {
  GUEST = 1,        // Solo lectura pública
  USER = 2,         // Usuario registrado estándar
  MODERATOR = 3,    // Puede moderar contenido de otros usuarios
  MANAGER = 4,      // Gestiona operaciones y moderadores
  ADMIN = 5,        // Administrador del sistema
  SUPER_ADMIN = 6   // Acceso total a configuraciones críticas
}

export interface User {
  id: string;
  username: string;
  passwordHash: string; 
  level: UserLevel;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'passwordHash'>; // Excluimos el password por seguridad
  token?: string;
}