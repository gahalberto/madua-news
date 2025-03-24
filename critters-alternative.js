// critters-alternative.js
// Módulo alternativo para substituir o critters em caso de problemas persistentes

/**
 * Solução alternativa para o erro "Cannot find module 'critters'"
 * Este módulo pode ser usado para substituir o comportamento do critters
 * quando há problemas de instalação.
 */

class CrittersAlternative {
  constructor() {
    console.log('CrittersAlternative: Usando processador CSS alternativo');
  }

  /**
   * Processa o HTML e o CSS embutido
   * @param {string} html O HTML a ser processado
   * @param {Object} options Opções de processamento
   * @returns {Promise<string>} O HTML processado
   */
  async process(html, options = {}) {
    console.log('CrittersAlternative: Processando CSS crítico');
    // Simplesmente retorna o HTML original sem modificações
    // Em uma implementação real, você poderia extrair e processar o CSS
    return html;
  }
}

module.exports = CrittersAlternative; 