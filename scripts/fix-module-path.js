#!/usr/bin/env node

/**
 * Este script resolve imports que usam o alias '@/' substituindo-os por caminhos relativos
 * Deve ser usado antes de executar ts-node para scripts que precisam ser executados diretamente
 * sem passar pelo sistema de build do Next.js
 */

const fs = require('fs');
const path = require('path');

// Mapeia o alias @/ para o diretório src
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.resolve(ROOT_DIR, 'src');

// Função para converter um caminho com @/ para o caminho relativo correto
function convertAliasToRelativePath(filePath, importPath) {
  if (!importPath.startsWith('@/')) {
    return importPath; // Não é um alias, retorna o caminho original
  }

  // Remove o '@/' do início
  const nonAliasPath = importPath.substring(2);
  
  // Calcula o caminho completo para o módulo importado
  const targetModulePath = path.resolve(SRC_DIR, nonAliasPath);
  
  // Calcula o diretório do arquivo de origem
  const sourceDir = path.dirname(filePath);
  
  // Calcula o caminho relativo do diretório de origem para o módulo alvo
  let relativePath = path.relative(sourceDir, targetModulePath);
  
  // Garante que o caminho comece com ./ ou ../
  if (!relativePath.startsWith('.')) {
    relativePath = './' + relativePath;
  }
  
  // Converte separadores de caminho para o formato correto (importante para Windows)
  relativePath = relativePath.replace(/\\/g, '/');
  
  return relativePath;
}

// Função para processar um arquivo e substituir as importações
function processFile(filePath) {
  console.log(`Processando: ${filePath}`);
  
  try {
    // Lê o conteúdo do arquivo
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Expressão regular para capturar importações
    const importRegex = /(from\s+['"]@\/[^'"]+['"])/g;
    
    // Substitui todas as importações com o alias @/
    content = content.replace(importRegex, (match) => {
      // Extrai o caminho da importação
      const importPath = match.slice(6, -1);
      // Converte para caminho relativo
      const relativePath = convertAliasToRelativePath(filePath, importPath);
      return `from '${relativePath}'`;
    });
    
    // Também substitui importações dinâmicas usando import()
    const dynamicImportRegex = /(import\s*\(\s*['"]@\/[^'"]+['"]\s*\))/g;
    content = content.replace(dynamicImportRegex, (match) => {
      // Extrai o caminho da importação dinâmica
      const importStatement = match.trim();
      const importPath = importStatement.slice(importStatement.indexOf("'") + 1, importStatement.lastIndexOf("'"));
      // Converte para caminho relativo
      const relativePath = convertAliasToRelativePath(filePath, importPath);
      return `import('${relativePath}')`;
    });
    
    // Escreve o conteúdo modificado de volta no arquivo
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log(`${filePath} processado com sucesso.`);
  } catch (error) {
    console.error(`Erro ao processar ${filePath}:`, error);
  }
}

// Verifica se um arquivo foi passado como argumento
if (process.argv.length < 3) {
  console.error('Por favor, especifique o arquivo a ser processado.');
  console.error('Uso: node fix-module-path.js <caminho-do-arquivo>');
  process.exit(1);
}

// Processa o arquivo especificado
const targetFile = path.resolve(process.argv[2]);
processFile(targetFile);

console.log('Processamento concluído.'); 