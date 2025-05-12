# Virtual Gateway - Backend

Este projeto é o backend do Virtual Gateway, desenvolvido em **Spring Boot**, que simula uma Gateway TCP virtual com funcionalidades avançadas.

## 🛠️ Tecnologias usadas

- **Java 17+**
- **Spring Boot 3+**
- **WebSocket**
- **TCP Socket Server**
- **RESTful API**
- **Maven**

## 🚀 Funcionalidades

- **Ligações TCP/IP de clientes**: Suporte para múltiplas conexões simultâneas.
- **Gestão de clientes ligados**: Monitorização e controlo de clientes conectados.
- **Envio de mensagens para clientes TCP**: Comunicação bidirecional com clientes.
- **API REST**: Interface para gestão das conexões.
- **Comunicação WebSocket**: Actualizações em tempo real para o frontend.

## ⚙️ Como executar o projecto

1. Certifique-se de ter o **Java 17** ou superior instalado.
2. Instale as dependências Maven:
   ```bash
   mvn clean install