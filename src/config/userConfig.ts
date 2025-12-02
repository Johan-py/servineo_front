/**
 * Configuración centralizada del usuario actual
 * Nota: Esto es temporal mientras se implementa la epic de login
 * Una vez que el login esté funcional, estos valores vendrán del contexto autenticado
 */

export const CURRENT_USER_CONFIG = {
  // ID del cliente actual (usuario logueado)
  // TODO: Reemplazar con contexto de autenticación una vez que login epic esté lista
  clienteId: "6927e784567c50dddae45310", // Johan - tiene 6 citas en la DB

  // Nombre del usuario (para mostrar en UI)
  userName: "Johan",

  // Información adicional del usuario
  email: "johan@example.com",
  telefono: "+34600000000",
};

/**
 * Hook para obtener el clienteId del usuario actual
 * Útil para testing y migración futura al contexto de autenticación
 */
export const useCurrentClienteId = () => {
  try {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth_clienteId");
      if (stored) return stored;
    }
  } catch (e) {
    // ignore
  }
  return CURRENT_USER_CONFIG.clienteId;
};

/**
 * Función para actualizar la configuración de usuario (para testing)
 * En producción, esta información vendrá del token JWT del usuario autenticado
 */
export const setCurrentUserConfig = (config: Partial<typeof CURRENT_USER_CONFIG>) => {
  Object.assign(CURRENT_USER_CONFIG, config);
};
