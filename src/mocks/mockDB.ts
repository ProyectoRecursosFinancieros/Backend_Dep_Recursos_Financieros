// mockDB.ts
import { User, UserLevel } from '../interfaces/niveles';

export const usersDB: User[] = [
  { id: '1', username: 'juan_invitado', passwordHash: 'password123', level: UserLevel.GUEST },
  { id: '2', username: 'maria_user', passwordHash: 'password123', level: UserLevel.USER },
  { id: '3', username: 'carlos_mod', passwordHash: 'password123', level: UserLevel.MODERATOR },
  { id: '4', username: 'ana_manager', passwordHash: 'password123', level: UserLevel.MANAGER },
  { id: '5', username: 'luis_admin', passwordHash: 'password123', level: UserLevel.ADMIN },
  { id: '6', username: 'jefe_super', passwordHash: 'password123', level: UserLevel.SUPER_ADMIN },
];