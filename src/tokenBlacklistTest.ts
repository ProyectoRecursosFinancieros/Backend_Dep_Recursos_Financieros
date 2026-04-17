// tokenBlacklistTest.ts

// Guardamos el token como llave y su timestamp de expiración como valor
const blacklist = new Map<string, number>();

export const tokenBlacklistManager = {
  /**
   * Añade un token a la lista negra con un tiempo de vida (TTL) en segundos.
   */
  add: (token: string, expiresInSeconds: number): void => {
    const expirationTimestamp = Date.now() + (expiresInSeconds * 1000);
    blacklist.set(token, expirationTimestamp);
    console.log(`[Blacklist] Token añadido. Expirará de la lista en ${expiresInSeconds} segundos.`);
  },

  /**
   * Verifica si el token está en la lista negra y si aún es válido.
   */
  has: (token: string): boolean => {
    if (!blacklist.has(token)) {
      return false; // No está en la lista negra
    }

    const expirationTimestamp = blacklist.get(token)!;
    
    // Si el tiempo actual es mayor al tiempo de expiración, el token ya expiró
    if (Date.now() > expirationTimestamp) {
      blacklist.delete(token); // Limpiamos la memoria
      console.log(`[Blacklist] Token eliminado de la memoria (Tiempo expirado).`);
      return false; 
    }

    return true; // Sigue en la lista negra y no ha expirado
  },

  /**
   * Función útil para ver cuántos tokens hay guardados (solo para pruebas)
   */
  getSize: (): number => blacklist.size
};