// Função de log para ajudar na depuração do componente Editor
export function logDebug(message: string, data?: Record<string, unknown>) {
  console.log(`[DEBUG] ${message}`, data !== undefined ? data : '');
}
