#!/bin/bash

# Script para resolver problema de divergência do Git
echo "Iniciando resolução de conflito Git..."

# 1. Salvar quaisquer alterações não commitadas
echo "Salvando alterações locais não commitadas..."
git stash

# 2. Obter as mudanças remotas
echo "Buscando alterações remotas..."
git fetch origin

# 3. Ver o estado atual
echo "Estado atual do repositório:"
git status

# 4. Tentar resolver com merge
echo "Tentando fazer merge das alterações remotas..."
git merge origin/main

# 5. Se o merge falhar, tente abortar e usar outra abordagem
if [ $? -ne 0 ]; then
  echo "Merge falhou, abortando e tentando outra abordagem..."
  git merge --abort
  
  echo "Tentando rebase das alterações locais sobre as remotas..."
  git pull --rebase origin main
  
  # 6. Se o rebase falhar, vamos para um backup mais drástico
  if [ $? -ne 0 ]; then
    echo "Rebase falhou também."
    echo "Fazendo backup dos commits locais..."
    
    # Criar branch temporária
    git branch backup_$(date +%Y%m%d%H%M%S)
    
    # Resetar para a versão remota
    echo "Resetando para a versão remota..."
    git reset --hard origin/main
    
    echo "ATENÇÃO: Seus commits locais foram salvos na branch de backup."
    echo "Você pode acessá-los mais tarde usando 'git branch' para listar as branches."
  else
    echo "Rebase concluído com sucesso!"
  fi
else
  echo "Merge concluído com sucesso!"
fi

# 7. Restaurar mudanças não commitadas, se houver
echo "Restaurando alterações locais não commitadas..."
git stash pop

echo "Processo concluído. Verifique o status com 'git status'" 