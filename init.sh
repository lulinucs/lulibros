#!/bin/bash

# Função para verificar e iniciar MongoDB se necessário
start_mongodb() {
  echo "Iniciando o MongoDB..." >> /home/luli/Dev/lulibros/init.log
  systemctl start mongod >> /home/luli/Dev/lulibros/init.log 2>&1

  echo "Verificando o status do MongoDB..." >> /home/luli/Dev/lulibros/init.log
  if ! systemctl is-active --quiet mongod; then
    echo "MongoDB não está ativo. Verifique o status do serviço." >> /home/luli/Dev/lulibros/init.log
    systemctl status mongod --no-pager >> /home/luli/Dev/lulibros/init.log
    exit 1
  fi
}

# Iniciar MongoDB
start_mongodb

# Navegar até o diretório do backend e iniciar o servidor
echo "Iniciando o backend..." >> /home/luli/Dev/lulibros/init.log
cd ~/Dev/lulibros
nohup node backend.js > backend.log 2>&1 &
BACKEND_PID=$!
sleep 10  # Aumente o tempo de espera para garantir que o backend tenha tempo para iniciar

# Navegar até o diretório do frontend e iniciar o servidor
echo "Iniciando o frontend..." >> /home/luli/Dev/lulibros/init.log
cd ~/Dev/lulibros/frontend
PORT=3001 nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 10  # Aumente o tempo de espera para garantir que o frontend tenha tempo para iniciar

echo "Todos os serviços foram iniciados com sucesso." >> /home/luli/Dev/lulibros/init.log
