/**
 * Deriva se o aviso de rodapé de Controle desconectado deve aparecer.
 * Silencioso por padrão (nunca conectou); aparece só numa desconexão real
 * depois de já ter havido conexão nesta sessão; some ao reconectar.
 */
export function shouldWarnDisconnected(everConnected: boolean, connected: boolean): boolean {
  return everConnected && !connected
}
